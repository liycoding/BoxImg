# Box - 实用工具集合

## 项目简介

Box 是一个现代化的在线工具集合，提供多种实用的文本处理和数据统计功能。使用纯HTML、CSS和JavaScript构建，无需服务器，可直接在浏览器中运行。

## 功能特性

- 🎨 现代化响应式设计
- 📱 移动端友好
- ⚡ 快速加载，纯前端实现
- 🔧 易于维护和扩展
- 📊 多种数据格式支持
- 📈 可视化统计结果

## 工具列表

### 📝 文本处理工具

- **字符串排序** - 按行对字符串进行升序/降序排序
- **文本去重** - 去除重复的文本行，保留唯一内容
- **大小写转换** - 支持多种格式转换（小写、大写、标题格式等）
- **文本替换** - 批量替换文本中的指定内容，支持正则表达式
- **添加行号** - 为文本的每一行添加行号，支持多种格式

### 📊 数据分析工具

- **字符重复统计** - 统计每行中每个字符的重复次数
- **列表项统计** - 统计文本列表中每个项目出现的次数，支持导出Excel

### 🗺️ 地图工具

- **地图图钉** - 在地图上显示坐标数据，支持聚合显示和区域过滤
- **白噪音生成** - 生成不同时长的白噪音音频文件

## 技术栈

- HTML5
- CSS3 (响应式设计)
- JavaScript (ES6+)
- 无外部依赖

## 项目结构

```
Box/
├── README.md                    # 项目说明文档
├── index.html                   # 主页面
├── css/                         # 样式文件目录
│   └── style.css               # 主样式文件
├── js/                          # JavaScript文件目录
│   ├── main.js                 # 主逻辑和路由配置
│   ├── common.js               # 公共功能模块
│   ├── string-sort.js          # 字符串排序工具
│   ├── char-count.js           # 字符统计工具
│   ├── text-dedup.js           # 文本去重工具
│   ├── case-convert.js         # 大小写转换工具
│   ├── text-replace.js         # 文本替换工具
│   ├── line-numbers.js         # 行号添加工具
│   ├── item-statistics.js      # 列表项统计工具
│   ├── white-noise.js          # 白噪音生成工具
│   └── map-pins.js             # 地图图钉工具
├── pages/                       # 功能页面目录
│   ├── string-sort.html
│   ├── char-count.html
│   ├── text-dedup.html
│   ├── case-convert.html
│   ├── text-replace.html
│   ├── line-numbers.html
│   ├── item-statistics.html
│   ├── white-noise.html
│   └── map-pins.html
├── position.txt                 # 高德地图坐标数据源
├── position_open.txt            # OpenStreetMap坐标数据源
└── convert_coordinates.py       # 坐标转换脚本
```

## 快速开始

### 方法一：直接打开
1. 下载或克隆项目到本地
2. 直接在浏览器中打开 `index.html` 文件

### 方法二：本地服务器
```bash
# 使用Python
python -m http.server 8000

# 使用Node.js
npx http-server

# 使用Live Server (VS Code扩展)
# 右键index.html选择"Open with Live Server"
```

## 部署到 GitHub Pages

### 环境要求
- Node.js (推荐 v16+)
- npm (推荐 v8+)
- Git

### 安装步骤

#### 第一步：克隆项目
```bash
git clone git@github.com:liycoding/BoxImg.git
cd BoxImg
```

#### 第二步：验证项目文件
```bash
# 确认在正确的目录下
pwd
# 应该显示：/path/to/BoxImg

# 检查项目文件
ls -la
# 应该看到：package.json, index.html, css/, js/, pages/ 等

# 验证 package.json
cat package.json
```

#### 第三步：安装依赖
```bash
# 清理可能的缓存
npm cache clean --force

# 安装项目依赖
npm install
```

**预期输出：**
```
added 50 packages, and audited 50 packages in 2s
found 0 vulnerabilities
```

#### 第四步：验证 gh-pages 安装
```bash
# 检查 gh-pages 是否安装成功
ls node_modules/.bin/gh-pages
# 应该看到：gh-pages -> ../gh-pages/bin/gh-pages.js

# 测试 gh-pages 版本
./node_modules/.bin/gh-pages --version
# 应该显示：6.3.0
```

#### 第五步：部署到 GitHub Pages
```bash
# 使用 npm 脚本部署
npm run deploy-gh-pages
```

**部署过程：**
1. 自动构建项目到 `dist/` 目录
2. 将 `dist/` 内容推送到 `gh-pages` 分支
3. GitHub Pages 自动更新网站

### 常见问题解决

#### 问题 1：找不到 package.json
```bash
# 错误：在错误的目录下执行 npm install
# 解决：确保在项目根目录下
pwd
cd /path/to/BoxImg
ls package.json
```

#### 问题 2：权限问题
```bash
# 检查目录权限
ls -la /path/to/BoxImg
# 确保有读取权限

# 如果需要，修改权限
chmod -R 755 /path/to/BoxImg
```

#### 问题 3：npm 缓存问题
```bash
# 清理所有缓存并重新安装
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 问题 4：网络问题
```bash
# 使用国内镜像
npm config set registry https://registry.npmmirror.com
npm install
```

#### 问题 5：SSH 密钥问题
```bash
# 测试 GitHub SSH 连接
ssh -T git@github.com
# 应该看到：Hi liycoding! You've successfully authenticated...
```

### 部署验证

部署成功后，访问以下地址查看网站：
- **GitHub Pages**: `https://liycoding.github.io/BoxImg/`
- **GitHub 仓库**: `https://github.com/liycoding/BoxImg`

### 自动化部署

项目已配置自动化部署脚本，每次推送代码到 `main` 分支时，GitHub Actions 会自动：
1. 构建项目
2. 部署到 GitHub Pages
3. 更新网站内容

## 功能详解

### 列表项统计工具
- **多种排序方式**：按出现次数、按名称、按原内容顺序
- **多种结果格式**：标准版、百分比版、简洁版、详细版、表格版
- **数据处理选项**：区分大小写、去除首尾空格
- **导出功能**：支持导出为CSV格式（Excel兼容）

### 字符重复统计工具
- **多种统计模式**：按行统计、全部统计、逐行统计
- **可视化结果**：使用条形图显示统计结果
- **灵活配置**：支持忽略空格、标点符号等选项

### 地图图钉工具
- **智能聚合**：根据缩放级别自动聚合显示图钉
- **区域过滤**：只加载当前地图区域内的坐标数据
- **多级缩放**：支持1-18级缩放，不同级别使用不同聚合策略
- **坐标支持**：支持高德地图坐标和OpenStreetMap坐标

### 白噪音生成工具
- **时长控制**：支持最长600秒的白噪音生成
- **音频格式**：支持单声道和立体声
- **采样率**：支持多种采样率选择
- **文件下载**：生成WAV格式音频文件

## 开发说明

### 添加新工具
1. 在 `pages/` 目录下创建新的HTML页面
2. 在 `js/` 目录下创建对应的JavaScript文件
3. 在 `js/main.js` 中添加路由配置
4. 在 `index.html` 中添加工具卡片

### 坐标转换工具

项目包含一个坐标转换脚本 `convert_coordinates.py`，用于将高德地图坐标(GCJ-02)转换为OpenStreetMap坐标(WGS-84)。

#### 使用方法
```bash
# 运行坐标转换脚本
python convert_coordinates.py
```

#### 功能说明
- **输入文件**: `position.txt` (高德地图坐标格式)
- **输出文件**: `position_open.txt` (OpenStreetMap坐标格式)
- **转换算法**: 使用标准的GCJ-02到WGS-84坐标转换算法
- **转换精度**: 高精度转换，偏移量约0.006度

#### 转换示例
```bash
=== 高德坐标转OpenStreetMap坐标工具 ===

开始读取position.txt文件...
成功读取 5420 条数据
开始转换坐标...
第1个点转换:
  原始: [116.244608, 40.283041]
  转换: [116.238529, 40.281790]
  偏移: [0.006079, 0.001251]
坐标转换完成，共处理 5420 条数据
转换完成！新文件已保存为: position_open.txt

转换统计:
- 总数据量: 5420
- 有效坐标: 5420
- 转换成功率: 100.00%
```

#### 使用场景
- 数据源更新时重新转换坐标
- 批量处理其他高德坐标数据
- 验证坐标转换的准确性
- 生成不同坐标系的数据文件

### 代码规范
- 所有样式文件放在 `css/` 目录下
- 所有JavaScript文件放在 `js/` 目录下
- 所有功能页面放在 `pages/` 目录下
- 遵循语义化HTML和模块化CSS的最佳实践
- 使用ES6+语法和现代JavaScript特性

### 样式系统
- 使用CSS Grid和Flexbox进行布局
- 响应式设计，支持移动端和桌面端
- 统一的颜色主题和交互效果
- 现代化的卡片式设计

## 浏览器支持

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 更新日志

### v1.3.0 (2024-12-20)
- 🗺️ 新增地图图钉工具，支持智能聚合和区域过滤
- 🔊 新增白噪音生成工具，支持最长600秒音频生成
- 🔧 新增坐标转换脚本，支持GCJ-02到WGS-84坐标转换
- 📊 地图工具支持1-18级缩放和动态聚合策略
- 🎯 优化地图性能，支持大数据量坐标显示

### v1.2.0 (2024-12-19)
- ✨ 新增列表项统计工具
- 🔧 重构项目结构，功能页面移至pages文件夹
- 📊 支持多种结果格式和排序方式
- 📈 支持Excel导出功能

### v1.0.0 (2024-12-18)
- 🎉 初始版本发布
- 📝 字符串排序工具
- 🔢 字符重复统计工具
- 🔄 文本去重工具
- 🔤 大小写转换工具
- 🔄 文本替换工具
- 📊 添加行号工具