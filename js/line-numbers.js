// 添加行号工具类
class LineNumbersTool extends ToolPage {
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
        const startNumber = parseInt(document.getElementById('start-number').value) || 1;
        const numberFormat = document.getElementById('number-format').value;
        const separator = document.getElementById('separator').value;
        const skipEmpty = document.getElementById('skip-empty').checked;
        const outputElement = document.querySelector('.output-text');
        
        if (!inputText.trim()) {
            this.showNotification('请输入要添加行号的文本', 'warning');
            return;
        }
        
        try {
            const lines = inputText.split('\n');
            const numberedLines = this.addLineNumbers(lines, startNumber, numberFormat, separator, skipEmpty);
            
            // 显示结果
            outputElement.textContent = numberedLines.join('\n');
            
            // 显示统计信息
            const totalLines = lines.length;
            const processedLines = numberedLines.length;
            this.showNotification(`行号添加完成！共处理 ${processedLines} 行文本`, 'success');
            
        } catch (error) {
            console.error('添加行号过程中发生错误:', error);
            this.showNotification('添加行号过程中发生错误，请检查输入', 'error');
        }
    }
    
    addLineNumbers(lines, startNumber, format, separator, skipEmpty) {
        const result = [];
        let lineNumber = startNumber;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // 跳过空行
            if (skipEmpty && line.trim() === '') {
                result.push(line);
                continue;
            }
            
            const formattedNumber = this.formatLineNumber(lineNumber, format, lines.length);
            result.push(`${formattedNumber}${separator}${line}`);
            lineNumber++;
        }
        
        return result;
    }
    
    formatLineNumber(number, format, totalLines) {
        const maxDigits = totalLines.toString().length;
        
        switch (format) {
            case 'simple':
                return number.toString();
            case 'padded':
                return number.toString().padStart(maxDigits, '0');
            case 'brackets':
                return `[${number}]`;
            case 'colon':
                return `${number}:`;
            case 'dot':
                return `${number}.`;
            default:
                return number.toString();
        }
    }
}

// 页面加载完成后初始化工具
document.addEventListener('DOMContentLoaded', function() {
    new LineNumbersTool();
});
