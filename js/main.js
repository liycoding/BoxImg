// 工具页面路由配置
const toolRoutes = {
    'string-sort': 'pages/string-sort.html',
    'char-count': 'pages/char-count.html',
    'text-dedup': 'pages/text-dedup.html',
    'case-convert': 'pages/case-convert.html',
    'text-replace': 'pages/text-replace.html',
    'line-numbers': 'pages/line-numbers.html',
    'item-statistics': 'pages/item-statistics.html',
    'white-noise': 'pages/white-noise.html',
    'map-pins': 'pages/map-pins.html'
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，开始初始化工具卡片');
    initializeToolCards();
    optimizeGridLayout();
});

// 优化网格布局，根据宽度计算每行显示数量
function optimizeGridLayout() {
    const toolsGrid = document.querySelector('.tools-grid');
    if (!toolsGrid) return;
    
    const toolCards = document.querySelectorAll('.tool-card');
    const cardCount = toolCards.length;
    const screenWidth = window.innerWidth;
    
    console.log(`当前工具数量: ${cardCount}, 屏幕宽度: ${screenWidth}px`);
    
    // 重置所有样式
    toolCards.forEach(card => {
        card.style.flex = '';
        card.style.maxWidth = '';
    });
    
    // 计算每行能显示的工具数量
    const columnsPerRow = calculateColumnsPerRow(screenWidth);
    const gap = getOptimalGap(screenWidth);
    
    console.log(`每行显示: ${columnsPerRow}个工具, 间距: ${gap}`);
    
    // 应用网格布局
    toolsGrid.style.display = 'grid';
    toolsGrid.style.gridTemplateColumns = `repeat(${columnsPerRow}, 1fr)`;
    toolsGrid.style.gap = gap;
    toolsGrid.style.justifyContent = 'center';
    
    // 如果工具数量很多，进一步优化间距
    if (cardCount > 6) {
        const smallerGap = screenWidth >= 1200 ? '0.5rem' : '0.7rem';
        toolsGrid.style.gap = smallerGap;
        
        // 减小卡片内边距
        toolCards.forEach(card => {
            card.style.padding = screenWidth >= 768 ? '0.8rem' : '0.6rem';
        });
    }
}

// 根据屏幕宽度计算每行能显示的工具数量
function calculateColumnsPerRow(screenWidth) {
    // 定义不同屏幕尺寸下的最小卡片宽度
    let minCardWidth;
    let containerPadding;
    
    if (screenWidth >= 1400) {
        // 大屏幕
        minCardWidth = 160;
        containerPadding = 80;
    } else if (screenWidth >= 1200) {
        // 中等屏幕
        minCardWidth = 180;
        containerPadding = 80;
    } else if (screenWidth >= 768) {
        // 平板
        minCardWidth = 200;
        containerPadding = 60;
    } else if (screenWidth >= 480) {
        // 小屏手机
        minCardWidth = 250;
        containerPadding = 40;
    } else {
        // 超小屏手机
        minCardWidth = 280;
        containerPadding = 30;
    }
    
    // 计算可用宽度（减去容器边距）
    const availableWidth = screenWidth - containerPadding;
    
    // 计算每行能放下的工具数量
    const columns = Math.floor(availableWidth / minCardWidth);
    
    // 确保至少显示1列，最多不超过工具总数
    const toolCards = document.querySelectorAll('.tool-card');
    const maxColumns = toolCards.length;
    
    return Math.max(1, Math.min(columns, maxColumns));
}

// 获取最佳间距
function getOptimalGap(screenWidth) {
    if (screenWidth >= 1400) {
        return '0.7rem';
    } else if (screenWidth >= 1200) {
        return '0.8rem';
    } else if (screenWidth >= 768) {
        return '1rem';
    } else if (screenWidth >= 480) {
        return '0.8rem';
    } else {
        return '0.6rem';
    }
}

// 窗口大小改变时重新优化布局
window.addEventListener('resize', function() {
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(optimizeGridLayout, 250);
});

// 初始化工具卡片点击事件
function initializeToolCards() {
    const toolCards = document.querySelectorAll('.tool-card');
    console.log(`找到 ${toolCards.length} 个工具卡片`);
    
    toolCards.forEach((card, index) => {
        console.log(`初始化第 ${index + 1} 个卡片:`, card.getAttribute('data-tool'));
        card.addEventListener('click', function() {
            const toolId = this.getAttribute('data-tool');
            console.log('点击了工具卡片:', toolId);
            navigateToTool(toolId);
        });
        
        // 添加键盘支持
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const toolId = this.getAttribute('data-tool');
                navigateToTool(toolId);
            }
        });
        
        // 设置可访问性属性
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `打开${this.querySelector('.tool-title').textContent}工具`);
    });
}

// 导航到指定工具页面
function navigateToTool(toolId) {
    console.log('navigateToTool 被调用，toolId:', toolId);
    const toolPage = toolRoutes[toolId];
    console.log('找到的页面路径:', toolPage);
    
    if (toolPage) {
        console.log('准备跳转到:', toolPage);
        // 添加加载效果
        showLoadingEffect();
        
        // 延迟跳转以显示加载效果
        setTimeout(() => {
            console.log('执行跳转:', toolPage);
            // 直接使用相对路径
            window.location.href = toolPage;
        }, 300);
    } else {
        console.error(`未找到工具页面: ${toolId}`);
        showNotification('工具页面不存在', 'error');
    }
}

// 显示加载效果
function showLoadingEffect() {
    const body = document.body;
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        ">
            <div style="
                background: white;
                padding: 2rem;
                border-radius: 12px;
                text-align: center;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            ">
                <div class="loading" style="margin: 0 auto 1rem;"></div>
                <p>正在加载工具...</p>
            </div>
        </div>
    `;
    
    body.appendChild(loadingOverlay);
}

// 显示通知消息
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    `;
    
    // 根据类型设置背景色
    const colors = {
        'success': '#28a745',
        'error': '#dc3545',
        'warning': '#ffc107',
        'info': '#17a2b8'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 自动隐藏
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 工具页面通用功能
class ToolPage {
    constructor() {
        this.initializePage();
    }
    
    initializePage() {
        this.setupEventListeners();
        this.initializeTool();
    }
    
    setupEventListeners() {
        // 返回按钮
        const backBtn = document.querySelector('.back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.goBack();
            });
        }
        
        // 处理按钮
        const processBtn = document.querySelector('.process-btn');
        if (processBtn) {
            processBtn.addEventListener('click', () => {
                this.processText();
            });
        }
        
        // 清空按钮
        const clearBtn = document.querySelector('.clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearText();
            });
        }
        
        // 复制按钮
        const copyBtn = document.querySelector('.copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                this.copyResult();
            });
        }
    }
    
    goBack() {
        window.history.back();
    }
    
    clearText() {
        const inputTextarea = document.querySelector('.input-textarea');
        const outputText = document.querySelector('.output-text');
        
        if (inputTextarea) {
            inputTextarea.value = '';
        }
        
        if (outputText) {
            outputText.textContent = '';
        }
        
        this.showNotification('已清空内容', 'success');
    }
    
    copyResult() {
        const outputText = document.querySelector('.output-text');
        
        if (outputText && outputText.textContent.trim()) {
            navigator.clipboard.writeText(outputText.textContent).then(() => {
                this.showNotification('结果已复制到剪贴板', 'success');
            }).catch(() => {
                this.showNotification('复制失败，请手动复制', 'error');
            });
        } else {
            this.showNotification('没有可复制的内容', 'warning');
        }
    }
    
    showNotification(message, type = 'info') {
        // 复用主页面的通知功能
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
    
    // 子类需要重写这个方法
    processText() {
        console.log('processText method should be overridden');
    }
    
    // 子类需要重写这个方法
    initializeTool() {
        console.log('initializeTool method should be overridden');
    }
}

// 导出供工具页面使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ToolPage, showNotification };
} else {
    window.ToolPage = ToolPage;
    window.showNotification = showNotification;
}
