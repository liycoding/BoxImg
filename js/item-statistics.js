// 列表项统计工具类
class ItemStatisticsTool extends ToolPage {
    constructor() {
        super();
    }
    
    initializeTool() {
        // 设置默认示例文本
        const textarea = document.querySelector('.input-textarea');
        if (textarea && !textarea.value.trim()) {
            
        }
    }
    
    processText() {
        const inputText = document.querySelector('.input-textarea').value;
        const caseSensitive = document.getElementById('case-sensitive').checked;
        const trimWhitespace = document.getElementById('trim-whitespace').checked;
        const sortBy = document.getElementById('sort-by').value;
        const resultFormat = document.getElementById('result-format').value;
        const outputElement = document.querySelector('.output-text');
        
        if (!inputText.trim()) {
            this.showNotification('请输入要统计的文本列表', 'warning');
            return;
        }
        
        try {
            const lines = inputText.split('\n');
            const statistics = this.calculateStatistics(lines, caseSensitive, trimWhitespace, sortBy);
            
            // 根据选择的格式显示结果
            const formattedResult = this.formatResultByType(statistics, resultFormat);
            outputElement.textContent = formattedResult;
            
            // 显示统计信息
            this.showNotification(`统计完成！共处理 ${statistics.totalItems} 个列表项，发现 ${statistics.uniqueItems} 个不同项目`, 'success');
            
        } catch (error) {
            console.error('统计过程中发生错误:', error);
            this.showNotification('统计过程中发生错误，请检查输入', 'error');
        }
    }
    
    calculateStatistics(lines, caseSensitive, trimWhitespace, sortBy) {
        const itemCount = {};
        const originalOrder = []; // 记录原始顺序
        let totalItems = 0;
        
        lines.forEach((line, index) => {
            let processedLine = line;
            
            // 去除首尾空格
            if (trimWhitespace) {
                processedLine = line.trim();
            }
            
            // 跳过空行
            if (processedLine === '') {
                return;
            }
            
            // 处理大小写
            const compareLine = caseSensitive ? processedLine : processedLine.toLowerCase();
            
            // 统计计数
            if (itemCount[compareLine]) {
                itemCount[compareLine].count++;
            } else {
                itemCount[compareLine] = {
                    original: processedLine,
                    count: 1,
                    firstAppearance: index // 记录首次出现的位置
                };
                originalOrder.push(compareLine);
            }
            
            totalItems++;
        });
        
        // 转换为数组并排序
        const sortedItems = this.sortItems(itemCount, sortBy, originalOrder);
        
        return {
            items: sortedItems,
            totalItems,
            uniqueItems: sortedItems.length,
            originalOrder
        };
    }
    
    sortItems(itemCount, sortBy, originalOrder) {
        const entries = Object.entries(itemCount);
        
        switch (sortBy) {
            case 'count-desc':
                return entries.sort((a, b) => b[1].count - a[1].count);
            case 'count-asc':
                return entries.sort((a, b) => a[1].count - b[1].count);
            case 'name-asc':
                return entries.sort((a, b) => a[1].original.localeCompare(b[1].original));
            case 'name-desc':
                return entries.sort((a, b) => b[1].original.localeCompare(a[1].original));
            case 'original-order':
                return entries.sort((a, b) => a[1].firstAppearance - b[1].firstAppearance);
            default:
                return entries.sort((a, b) => a[1].firstAppearance - b[1].firstAppearance);
        }
    }
    
    formatResultByType(statistics, formatType) {
        const { items, totalItems, uniqueItems } = statistics;
        
        if (items.length === 0) {
            return '没有找到有效的列表项';
        }
        
        switch (formatType) {
            case 'standard':
                return this.formatStandard(items, totalItems, uniqueItems);
            case 'percentage':
                return this.formatPercentage(items, totalItems, uniqueItems);
            case 'simple':
                return this.formatSimple(items, totalItems, uniqueItems);
            case 'detailed':
                return this.formatDetailed(items, totalItems, uniqueItems);
            case 'table':
                return this.formatTable(items, totalItems, uniqueItems);
            default:
                return this.formatStandard(items, totalItems, uniqueItems);
        }
    }
    
    formatStandard(sortedItems, totalItems, uniqueItems) {
        const result = [];
        result.push('列表项统计结果:');
        result.push('='.repeat(50));
        result.push('');
        
        // 计算最大宽度用于对齐
        const maxItemLength = Math.max(...sortedItems.map(([_, data]) => data.original.length));
        const maxCountLength = Math.max(...sortedItems.map(([_, data]) => data.count.toString().length));
        
        sortedItems.forEach(([_, data], index) => {
            const item = data.original;
            const count = data.count;
            const percentage = ((count / totalItems) * 100).toFixed(1);
            
            // 创建条形图
            const maxCount = Math.max(...sortedItems.map(([_, data]) => data.count));
            const barLength = Math.max(1, Math.round((count / maxCount) * 30));
            const bar = '█'.repeat(barLength);
            
            result.push(`${(index + 1).toString().padStart(2)}. ${item.padEnd(maxItemLength)} | ${count.toString().padStart(maxCountLength)} 次 (${percentage}%) ${bar}`);
        });
        
        result.push('');
        result.push('='.repeat(50));
        result.push(`总计: ${totalItems} 个列表项，${uniqueItems} 个不同项目`);
        
        return result.join('\n');
    }
    
    formatPercentage(sortedItems, totalItems, uniqueItems) {
        const result = [];
        result.push('百分比统计结果:');
        result.push('='.repeat(40));
        result.push('');
        
        sortedItems.forEach(([_, data], index) => {
            const item = data.original;
            const count = data.count;
            const percentage = ((count / totalItems) * 100).toFixed(2);
            
            result.push(`${(index + 1).toString().padStart(2)}. ${item}: ${percentage}% (${count}次)`);
        });
        
        result.push('');
        result.push('='.repeat(40));
        result.push(`总计: ${totalItems} 个项目，${uniqueItems} 个不同项目`);
        
        return result.join('\n');
    }
    
    formatSimple(sortedItems, totalItems, uniqueItems) {
        const result = [];
        result.push('简洁统计结果:');
        result.push('='.repeat(30));
        result.push('');
        
        sortedItems.forEach(([_, data]) => {
            const item = data.original;
            const count = data.count;
            result.push(`${item}: ${count}次`);
        });
        
        result.push('');
        result.push(`总计: ${totalItems} 个项目，${uniqueItems} 个不同项目`);
        
        return result.join('\n');
    }
    
    formatDetailed(sortedItems, totalItems, uniqueItems) {
        const result = [];
        result.push('详细统计结果:');
        result.push('='.repeat(60));
        result.push('');
        
        // 计算最大宽度用于对齐
        const maxItemLength = Math.max(...sortedItems.map(([_, data]) => data.original.length));
        const maxCountLength = Math.max(...sortedItems.map(([_, data]) => data.count.toString().length));
        
        sortedItems.forEach(([_, data], index) => {
            const item = data.original;
            const count = data.count;
            const percentage = ((count / totalItems) * 100).toFixed(2);
            const firstAppearance = data.firstAppearance + 1; // 转换为1开始的索引
            
            // 创建条形图
            const maxCount = Math.max(...sortedItems.map(([_, data]) => data.count));
            const barLength = Math.max(1, Math.round((count / maxCount) * 40));
            const bar = '█'.repeat(barLength);
            
            result.push(`${(index + 1).toString().padStart(2)}. ${item.padEnd(maxItemLength)} | ${count.toString().padStart(maxCountLength)} 次 | ${percentage}% | 首次出现: 第${firstAppearance}行`);
            result.push(`    ${bar}`);
            result.push('');
        });
        
        result.push('='.repeat(60));
        result.push(`总计: ${totalItems} 个列表项，${uniqueItems} 个不同项目`);
        
        return result.join('\n');
    }
    
    formatTable(sortedItems, totalItems, uniqueItems) {
        const result = [];
        result.push('表格统计结果:');
        result.push('='.repeat(50));
        result.push('');
        
        // 表头
        result.push('序号 | 项目名称 | 出现次数 | 百分比');
        result.push('-----|----------|----------|--------');
        
        sortedItems.forEach(([_, data], index) => {
            const item = data.original;
            const count = data.count;
            const percentage = ((count / totalItems) * 100).toFixed(1);
            
            result.push(`${(index + 1).toString().padStart(2)}   | ${item.padEnd(8)} | ${count.toString().padStart(8)} | ${percentage}%`);
        });
        
        result.push('-----|----------|----------|--------');
        result.push(`总计 | ${uniqueItems} 个不同项目 | ${totalItems} 个总项目 | 100.0%`);
        
        return result.join('\n');
    }
    
    exportToExcel() {
        const inputText = document.querySelector('.input-textarea').value;
        const caseSensitive = document.getElementById('case-sensitive').checked;
        const trimWhitespace = document.getElementById('trim-whitespace').checked;
        const sortBy = document.getElementById('sort-by').value;
        
        if (!inputText.trim()) {
            this.showNotification('请先输入要统计的文本列表', 'warning');
            return;
        }
        
        try {
            const lines = inputText.split('\n');
            const statistics = this.calculateStatistics(lines, caseSensitive, trimWhitespace, sortBy);
            
            // 创建CSV内容（Excel兼容）
            let csvContent = '\uFEFF'; // BOM for UTF-8
            csvContent += '项目名称,出现次数,百分比\n';
            
            statistics.items.forEach(([_, data]) => {
                const item = data.original.replace(/"/g, '""'); // 转义双引号
                const count = data.count;
                const percentage = ((count / statistics.totalItems) * 100).toFixed(1);
                csvContent += `"${item}",${count},${percentage}%\n`;
            });
            
            // 创建并下载文件
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `列表项统计_${new Date().toISOString().slice(0, 10)}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showNotification('Excel文件已导出', 'success');
            
        } catch (error) {
            console.error('导出Excel过程中发生错误:', error);
            this.showNotification('导出Excel过程中发生错误', 'error');
        }
    }
}

// 页面加载完成后初始化工具
document.addEventListener('DOMContentLoaded', function() {
    const tool = new ItemStatisticsTool();
    
    // 为导出Excel按钮添加事件监听
    const exportBtn = document.querySelector('.export-excel-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            tool.exportToExcel();
        });
    }
});
