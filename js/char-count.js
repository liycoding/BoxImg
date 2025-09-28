// 字符重复统计工具类
class CharCountTool extends ToolPage {
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
        const countMode = document.getElementById('count-mode').value;
        const caseSensitive = document.getElementById('case-sensitive').checked;
        const ignoreSpaces = document.getElementById('ignore-spaces').checked;
        const ignorePunctuation = document.getElementById('ignore-punctuation').checked;
        const sortBy = document.getElementById('sort-by').value;
        const outputElement = document.querySelector('.output-text');
        
        if (!inputText.trim()) {
            this.showNotification('请输入要统计的文本', 'warning');
            return;
        }
        
        try {
            let result;
            
            switch (countMode) {
                case 'per-line':
                    result = this.countPerLine(inputText, caseSensitive, ignoreSpaces, ignorePunctuation, sortBy);
                    break;
                case 'all-lines':
                    result = this.countAllLines(inputText, caseSensitive, ignoreSpaces, ignorePunctuation, sortBy);
                    break;
                case 'line-by-line':
                    result = this.countLineByLine(inputText, caseSensitive, ignoreSpaces, ignorePunctuation, sortBy);
                    break;
                default:
                    result = this.countPerLine(inputText, caseSensitive, ignoreSpaces, ignorePunctuation, sortBy);
            }
            
            // 显示结果
            outputElement.textContent = result;
            
            // 显示统计信息
            const lines = inputText.split('\n').filter(line => line.trim() !== '');
            this.showNotification(`统计完成！共处理 ${lines.length} 行文本`, 'success');
            
        } catch (error) {
            console.error('统计过程中发生错误:', error);
            this.showNotification('统计过程中发生错误，请检查输入', 'error');
        }
    }
    
    countPerLine(text, caseSensitive, ignoreSpaces, ignorePunctuation, sortBy) {
        const lines = text.split('\n');
        let result = [];
        
        lines.forEach((line, index) => {
            if (line.trim() === '') return;
            
            const charCount = this.countCharacters(line, caseSensitive, ignoreSpaces, ignorePunctuation);
            const sortedChars = this.sortCharacters(charCount, sortBy);
            
            result.push(`第 ${index + 1} 行: "${line}"`);
            result.push(this.formatCharCount(sortedChars));
            result.push(''); // 空行分隔
        });
        
        return result.join('\n');
    }
    
    countAllLines(text, caseSensitive, ignoreSpaces, ignorePunctuation, sortBy) {
        const charCount = this.countCharacters(text, caseSensitive, ignoreSpaces, ignorePunctuation);
        const sortedChars = this.sortCharacters(charCount, sortBy);
        
        let result = ['全部文本字符统计:', ''];
        result.push(this.formatCharCount(sortedChars));
        
        return result.join('\n');
    }
    
    countLineByLine(text, caseSensitive, ignoreSpaces, ignorePunctuation, sortBy) {
        const lines = text.split('\n');
        let result = [];
        let totalChars = {};
        
        lines.forEach((line, index) => {
            if (line.trim() === '') return;
            
            const charCount = this.countCharacters(line, caseSensitive, ignoreSpaces, ignorePunctuation);
            const sortedChars = this.sortCharacters(charCount, sortBy);
            
            result.push(`第 ${index + 1} 行: "${line}"`);
            result.push(this.formatCharCount(sortedChars));
            result.push(''); // 空行分隔
            
            // 累加到总计
            Object.keys(charCount).forEach(char => {
                totalChars[char] = (totalChars[char] || 0) + charCount[char];
            });
        });
        
        // 添加总计
        if (Object.keys(totalChars).length > 0) {
            const sortedTotal = this.sortCharacters(totalChars, sortBy);
            result.push('总计统计:');
            result.push(this.formatCharCount(sortedTotal));
        }
        
        return result.join('\n');
    }
    
    countCharacters(text, caseSensitive, ignoreSpaces, ignorePunctuation) {
        let processedText = text;
        
        // 处理大小写
        if (!caseSensitive) {
            processedText = text.toLowerCase();
        }
        
        // 处理空格
        if (ignoreSpaces) {
            processedText = processedText.replace(/\s/g, '');
        }
        
        // 处理标点符号
        if (ignorePunctuation) {
            processedText = processedText.replace(/[^\w\s\u4e00-\u9fff]/g, '');
        }
        
        const charCount = {};
        
        for (let char of processedText) {
            if (char.trim() !== '' || !ignoreSpaces) {
                charCount[char] = (charCount[char] || 0) + 1;
            }
        }
        
        return charCount;
    }
    
    sortCharacters(charCount, sortBy) {
        const entries = Object.entries(charCount);
        
        switch (sortBy) {
            case 'count-desc':
                return entries.sort((a, b) => b[1] - a[1]);
            case 'count-asc':
                return entries.sort((a, b) => a[1] - b[1]);
            case 'char-asc':
                return entries.sort((a, b) => a[0].localeCompare(b[0]));
            case 'char-desc':
                return entries.sort((a, b) => b[0].localeCompare(a[0]));
            default:
                return entries.sort((a, b) => b[1] - a[1]);
        }
    }
    
    formatCharCount(sortedChars) {
        if (sortedChars.length === 0) {
            return '  无字符统计';
        }
        
        const maxCount = Math.max(...sortedChars.map(([char, count]) => count));
        const maxWidth = maxCount.toString().length;
        
        return sortedChars.map(([char, count]) => {
            const charDisplay = char === ' ' ? '[空格]' : char;
            const bar = '█'.repeat(Math.ceil((count / maxCount) * 20));
            return `  '${charDisplay}': ${count.toString().padStart(maxWidth)} 次 ${bar}`;
        }).join('\n');
    }
}

// 页面加载完成后初始化工具
document.addEventListener('DOMContentLoaded', function() {
    new CharCountTool();
});
