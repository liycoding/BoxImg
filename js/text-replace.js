// 文本替换工具类
class TextReplaceTool extends ToolPage {
    constructor() {
        super();
    }
    
    initializeTool() {
        // 设置默认示例文本
        const textarea = document.querySelector('.input-textarea');
        if (textarea && !textarea.value.trim()) {
            
        }
        
        // 设置默认查找和替换文本
        //document.getElementById('search-text').value = 'Hello';
        //document.getElementById('replace-text').value = 'Hi';
    }
    
    processText() {
        const inputText = document.querySelector('.input-textarea').value;
        const searchText = document.getElementById('search-text').value;
        const replaceText = document.getElementById('replace-text').value;
        const useRegex = document.getElementById('use-regex').checked;
        const caseSensitive = document.getElementById('case-sensitive').checked;
        const replaceAll = document.getElementById('replace-all').checked;
        const outputElement = document.querySelector('.output-text');
        
        if (!inputText.trim()) {
            this.showNotification('请输入要替换的文本', 'warning');
            return;
        }
        
        if (!searchText.trim()) {
            this.showNotification('请输入要查找的内容', 'warning');
            return;
        }
        
        try {
            const result = this.replaceText(inputText, searchText, replaceText, useRegex, caseSensitive, replaceAll);
            
            // 显示结果
            outputElement.textContent = result.text;
            
            // 显示统计信息
            this.showNotification(`替换完成！共替换了 ${result.count} 处匹配项`, 'success');
            
        } catch (error) {
            console.error('替换过程中发生错误:', error);
            this.showNotification('替换过程中发生错误，请检查输入', 'error');
        }
    }
    
    replaceText(text, searchText, replaceText, useRegex, caseSensitive, replaceAll) {
        let searchPattern;
        let flags = 'g';
        
        if (!caseSensitive) {
            flags += 'i';
        }
        
        if (useRegex) {
            try {
                searchPattern = new RegExp(searchText, flags);
            } catch (error) {
                throw new Error('正则表达式格式错误: ' + error.message);
            }
        } else {
            // 转义特殊字符
            const escapedSearchText = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            searchPattern = new RegExp(escapedSearchText, flags);
        }
        
        let result;
        let count = 0;
        
        if (replaceAll) {
            result = text.replace(searchPattern, (match) => {
                count++;
                return replaceText;
            });
        } else {
            result = text.replace(searchPattern, (match) => {
                count++;
                return replaceText;
            });
        }
        
        return { text: result, count };
    }
}

// 页面加载完成后初始化工具
document.addEventListener('DOMContentLoaded', function() {
    new TextReplaceTool();
});
