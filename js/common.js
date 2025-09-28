// 公共功能模块
// 用于所有页面的通用功能

// 返回首页功能
function goBack(event) {
    event.preventDefault();
    
    // 获取当前页面的完整URL信息
    const currentUrl = new URL(window.location.href);
    const baseUrl = `${currentUrl.protocol}//${currentUrl.host}`;
    
    // 根据当前URL判断环境并构建正确的首页URL
    let homeUrl;
    
    if (currentUrl.pathname.includes('/Box/')) {
        // GitHub Pages 环境：https://liycoding.github.io/Box/string-sort.html -> https://liycoding.github.io/Box/
        homeUrl = `${baseUrl}/Box/`;
    } else {
        // 本地开发或Vercel环境：直接使用根路径
        homeUrl = `${baseUrl}/`;
    }
    
    console.log('返回首页:', homeUrl);
    console.log('当前环境检测:', {
        hostname: currentUrl.hostname,
        pathname: currentUrl.pathname,
        isGitHubPages: currentUrl.pathname.includes('/Box/'),
        homeUrl: homeUrl
    });
    
    window.location.href = homeUrl;
}

// 自动为所有返回首页按钮绑定事件
document.addEventListener('DOMContentLoaded', function() {
    // 查找所有返回首页按钮
    const backButtons = document.querySelectorAll('.back-btn');
    
    backButtons.forEach(button => {
        // 移除onclick属性（如果存在）
        button.removeAttribute('onclick');
        
        // 添加事件监听器
        button.addEventListener('click', goBack);
        
        console.log('已为返回首页按钮绑定事件:', button.textContent.trim());
    });
    
    if (backButtons.length > 0) {
        console.log(`共为 ${backButtons.length} 个返回首页按钮绑定了事件`);
    }
});

// 导出函数供其他模块使用（如果需要）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { goBack };
} else {
    window.goBack = goBack;
}
