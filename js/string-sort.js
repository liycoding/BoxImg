// 字符串排序工具类
class StringSortTool extends ToolPage {
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
        const sortOrder = document.getElementById('sort-order').value;
        const caseSensitive = document.getElementById('case-sensitive').checked;
        const removeEmpty = document.getElementById('remove-empty').checked;
        const outputElement = document.querySelector('.output-text');
        
        if (!inputText.trim()) {
            this.showNotification('请输入要排序的文本', 'warning');
            return;
        }
        
        try {
            // 分割文本为行数组
            let lines = inputText.split('\n');
            
            // 移除空行（如果选择）
            if (removeEmpty) {
                lines = lines.filter(line => line.trim() !== '');
            }
            
            // 排序
            const sortedLines = this.sortLines(lines, sortOrder, caseSensitive);
            
            // 显示结果
            outputElement.textContent = sortedLines.join('\n');
            
            // 显示统计信息
            const stats = this.getSortStats(lines, sortedLines);
            this.showNotification(`排序完成！共处理 ${stats.total} 行，${stats.removed} 行空行已移除`, 'success');
            
        } catch (error) {
            console.error('排序过程中发生错误:', error);
            this.showNotification('排序过程中发生错误，请检查输入', 'error');
        }
    }
    
    sortLines(lines, order, caseSensitive) {
        return lines.sort((a, b) => {
            let compareA = a;
            let compareB = b;
            
            // 如果不区分大小写，转换为小写进行比较
            if (!caseSensitive) {
                compareA = a.toLowerCase();
                compareB = b.toLowerCase();
            }
            
            let result;
            if (compareA < compareB) {
                result = -1;
            } else if (compareA > compareB) {
                result = 1;
            } else {
                result = 0;
            }
            
            // 如果是降序，反转结果
            return order === 'desc' ? -result : result;
        });
    }
    
    getSortStats(originalLines, sortedLines) {
        const total = originalLines.length;
        const removed = originalLines.length - sortedLines.length;
        
        return {
            total,
            removed,
            sorted: sortedLines.length
        };
    }
}

// 页面加载完成后初始化工具
document.addEventListener('DOMContentLoaded', function() {
    new StringSortTool();
});
