// 大小写转换工具类
class CaseConvertTool extends ToolPage {
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
        const convertMode = document.getElementById('convert-mode').value;
        const outputElement = document.querySelector('.output-text');
        
        if (!inputText.trim()) {
            this.showNotification('请输入要转换的文本', 'warning');
            return;
        }
        
        try {
            const lines = inputText.split('\n');
            const convertedLines = lines.map(line => this.convertLine(line, convertMode));
            
            // 显示结果
            outputElement.textContent = convertedLines.join('\n');
            
            this.showNotification(`转换完成！共处理 ${lines.length} 行文本`, 'success');
            
        } catch (error) {
            console.error('转换过程中发生错误:', error);
            this.showNotification('转换过程中发生错误，请检查输入', 'error');
        }
    }
    
    convertLine(line, mode) {
        switch (mode) {
            case 'lowercase':
                return line.toLowerCase();
            case 'uppercase':
                return line.toUpperCase();
            case 'title-case':
                return this.toTitleCase(line);
            case 'sentence-case':
                return this.toSentenceCase(line);
            case 'camel-case':
                return this.toCamelCase(line);
            case 'snake-case':
                return this.toSnakeCase(line);
            case 'kebab-case':
                return this.toKebabCase(line);
            default:
                return line;
        }
    }
    
    toTitleCase(text) {
        return text.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }
    
    toSentenceCase(text) {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
    
    toCamelCase(text) {
        return text
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
                return index === 0 ? word.toLowerCase() : word.toUpperCase();
            })
            .replace(/\s+/g, '');
    }
    
    toSnakeCase(text) {
        return text
            .replace(/\W+/g, ' ')
            .split(/ |\B(?=[A-Z])/)
            .map(word => word.toLowerCase())
            .join('_');
    }
    
    toKebabCase(text) {
        return text
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/[\s_]+/g, '-')
            .toLowerCase();
    }
}

// 页面加载完成后初始化工具
document.addEventListener('DOMContentLoaded', function() {
    new CaseConvertTool();
});
