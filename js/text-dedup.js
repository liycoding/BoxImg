// 文本去重工具类
class TextDedupTool extends ToolPage {
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
        const preserveOrder = document.getElementById('preserve-order').checked;
        const outputElement = document.querySelector('.output-text');
        
        if (!inputText.trim()) {
            this.showNotification('请输入要去重的文本', 'warning');
            return;
        }
        
        try {
            const lines = inputText.split('\n');
            const deduplicatedLines = this.deduplicateLines(lines, caseSensitive, trimWhitespace, preserveOrder);
            
            // 显示结果
            outputElement.textContent = deduplicatedLines.join('\n');
            
            // 显示统计信息
            const originalCount = lines.filter(line => line.trim() !== '').length;
            const duplicateCount = originalCount - deduplicatedLines.length;
            this.showNotification(`去重完成！原始 ${originalCount} 行，去重后 ${deduplicatedLines.length} 行，移除了 ${duplicateCount} 个重复项`, 'success');
            
        } catch (error) {
            console.error('去重过程中发生错误:', error);
            this.showNotification('去重过程中发生错误，请检查输入', 'error');
        }
    }
    
    deduplicateLines(lines, caseSensitive, trimWhitespace, preserveOrder) {
        const seen = new Set();
        const result = [];
        
        for (let line of lines) {
            let processedLine = line;
            
            // 去除首尾空格
            if (trimWhitespace) {
                processedLine = line.trim();
            }
            
            // 处理大小写
            const compareLine = caseSensitive ? processedLine : processedLine.toLowerCase();
            
            // 检查是否已存在
            if (!seen.has(compareLine)) {
                seen.add(compareLine);
                result.push(processedLine);
            }
        }
        
        return result;
    }
}

// 页面加载完成后初始化工具
document.addEventListener('DOMContentLoaded', function() {
    new TextDedupTool();
});
