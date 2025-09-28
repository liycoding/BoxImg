// 地图图钉工具
class MapPinsTool extends ToolPage {
    constructor() {
        super();
        this.map = null;
        this.markers = [];
        this.positionData = [];
        this.isLoading = false;
        this.clusteredMarkers = new Map(); // 存储聚合后的标记
        this.currentZoom = 10;
        this.lastVisibleBounds = null; // 存储上次可见区域的边界
        this.isUpdating = false; // 防止重复更新
        // 完整的1-18缩放级别聚合配置
        // threshold 聚合阈值
        // gridSize 网格大小
        // maxClusters 最大聚合数量
        // enableClustering 是否启用聚合 (15-18级别为false，其他为true)
        this.zoomThresholds = {
            1: { threshold: 10000, gridSize: 5000, maxClusters: 5, enableClustering: true },    // 全球视图：极少聚合
            2: { threshold: 8000, gridSize: 4000, maxClusters: 8, enableClustering: true },     // 大洲视图：极少聚合
            3: { threshold: 6000, gridSize: 3000, maxClusters: 12, enableClustering: true },    // 国家视图：极少聚合
            4: { threshold: 4000, gridSize: 2000, maxClusters: 20, enableClustering: true },    // 大区域视图：很少聚合
            5: { threshold: 3000, gridSize: 1500, maxClusters: 30, enableClustering: true },    // 区域视图：很少聚合
            6: { threshold: 2000, gridSize: 1000, maxClusters: 50, enableClustering: true },    // 省/州视图：少聚合
            7: { threshold: 1500, gridSize: 800, maxClusters: 80, enableClustering: true },     // 大市视图：少聚合
            8: { threshold: 1000, gridSize: 600, maxClusters: 120, enableClustering: true },    // 市视图：中少聚合
            9: { threshold: 800, gridSize: 400, maxClusters: 180, enableClustering: true },     // 大区视图：中少聚合
            10: { threshold: 600, gridSize: 300, maxClusters: 250, enableClustering: true },    // 区县视图：中聚合
            11: { threshold: 400, gridSize: 200, maxClusters: 350, enableClustering: true },    // 街道视图：中聚合
            12: { threshold: 300, gridSize: 150, maxClusters: 500, enableClustering: true },    // 社区视图：中多聚合
            13: { threshold: 200, gridSize: 100, maxClusters: 700, enableClustering: true },    // 街区视图：多聚合
            14: { threshold: 150, gridSize: 75, maxClusters: 1000, enableClustering: false },    // 小区视图：多聚合
            15: { threshold: 100, gridSize: 50, maxClusters: 1200, enableClustering: false },    // 建筑群视图：不聚合
            16: { threshold: 50, gridSize: 30, maxClusters: 1500, enableClustering: false },     // 建筑视图：不聚合
            17: { threshold: 30, gridSize: 20, maxClusters: 1800, enableClustering: false },     // 详细建筑视图：不聚合
            18: { threshold: 20, gridSize: 10, maxClusters: 2000, enableClustering: false }      // 最详细视图：不聚合
        };

        // 兼容性：保持原有的clusterThreshold结构
        this.clusterThreshold = {
            1: 10000, 
            2: 8000, 
            3: 6000, 
            4: 4000, 
            5: 3000, 
            6: 2000,
            7: 1500,
            8: 1000, 
            9: 800, 
            10: 600, 
            11: 400, 
            12: 300,
            13: 200, 
            14: 150, 
            15: 100, 
            16: 50, 
            17: 30, 
            18: 20
        };
    }

    initializeTool() {
        console.log('初始化地图图钉工具');
        this.setupEventListeners();
        // 延迟初始化地图，确保DOM元素已准备好
        setTimeout(() => {
            this.initMap();
        }, 100);
    }

    setupEventListeners() {
        super.setupEventListeners();
        
        // 加载数据按钮
        const loadDataBtn = document.getElementById('loadDataBtn');
        if (loadDataBtn) {
            loadDataBtn.addEventListener('click', () => {
                this.loadPositionData();
            });
        }

        // 清空数据按钮
        const clearDataBtn = document.getElementById('clearDataBtn');
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => {
                this.clearAllMarkers();
                this.positionData = [];
                this.updateStats(0, 0, 0);
                this.showNotification('已清空所有数据', 'info');
            });
        }
    }

    initMap() {
        try {
            // 检查地图容器是否存在
            const mapContainer = document.getElementById('map');
            if (!mapContainer) {
                console.error('地图容器元素未找到');
                return;
            }

            // 初始化地图，默认显示北京及周边区域
            this.map = L.map('map', {
                center: [39.9042, 116.4074], // 北京天安门
                zoom: 10, // 设置初始缩放级别为10
                minZoom: 6, // 设置最小缩放级别
                maxZoom: 18, // 设置最大缩放级别
                zoomControl: false, // 先禁用默认缩放控制
                zoomDelta: 1, // 设置缩放步长
                zoomSnap: 1   // 设置缩放吸附
            });
            
            // 添加地图图层
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);

            // 等待地图加载完成
            this.map.whenReady(() => {
                console.log('地图初始化完成');
                this.updateStatus('地图已就绪，可以加载数据', 'success');
                
                // 添加自定义缩放控制
                this.addCustomZoomControl();
                
                // 绑定缩放事件
                this.bindZoomEvents();
            });

        } catch (error) {
            console.error('地图初始化失败:', error);
            this.updateStatus('地图初始化失败: ' + error.message, 'error');
        }
    }

    async loadPositionData() {
        if (this.isLoading) {
            this.showNotification('正在加载中，请稍候...', 'warning');
            return;
        }

        // 检查地图是否已初始化
        if (!this.map) {
            this.showNotification('地图未初始化，请稍候再试', 'error');
            this.updateStatus('地图未初始化，请稍候再试', 'error');
            return;
        }

        // 检查地图是否已加载完成
        if (!this.map._loaded) {
            this.showNotification('地图正在加载中，请稍候再试', 'warning');
            this.updateStatus('地图正在加载中，请稍候再试', 'warning');
            return;
        }

        this.isLoading = true;
        this.showLoading(true);
        this.updateStats(0, 0, 0);
        this.updateStatus('正在加载当前区域的位置数据...', 'info');

        try {
            // 加载position_open.txt文件（OpenStreetMap坐标）
            const response = await fetch('../position_open.txt');
            if (!response.ok) {
                throw new Error('无法加载position_open.txt文件');
            }
            
            const text = await response.text();
            console.log('position_open.txt文件加载成功，大小:', text.length);
            
            // 解析所有数据
            const allPositions = this.parsePositionData(text);
            console.log('解析到所有位置数据:', allPositions.length);
            
            // 过滤出当前地图区域内的坐标点
            const visiblePositions = this.filterPositionsByCurrentBounds(allPositions);
            console.log(`当前区域内的坐标点: ${visiblePositions.length}/${allPositions.length}`);

            if (visiblePositions.length === 0) {
                this.showNotification('当前地图区域内没有位置数据', 'warning');
                this.updateStatus('当前地图区域内没有位置数据', 'warning');
                return;
            }
            
            // 存储当前区域的数据
            this.positionData = visiblePositions;
            this.updateStats(allPositions.length, visiblePositions.length, 0);
            
            // 显示图钉
            this.showPins(visiblePositions);
            
            // 确保缩放事件监听器正确绑定
            this.bindZoomEvents();
            
            this.showNotification(`成功加载当前区域 ${visiblePositions.length} 个位置数据`, 'success');
            
        } catch (error) {
            console.error('加载数据失败:', error);
            this.showNotification('加载数据失败: ' + error.message, 'error');
        } finally {
            this.isLoading = false;
            this.showLoading(false);
        }
    }

    parsePositionData(text) {
        const positions = [];
        
        try {
            // 使用正则表达式提取三个字段
            const positionRegex = /position:\s*\[([0-9.-]+),\s*([0-9.-]+)\]/g;
            const nameRegex = /name:\s*['"]([^'"]+)['"]/g;
            const timeRegex = /time:\s*['"]([^'"]+)['"]/g;
            
            // 提取所有匹配项
            const positionMatches = [...text.matchAll(positionRegex)];
            const nameMatches = [...text.matchAll(nameRegex)];
            const timeMatches = [...text.matchAll(timeRegex)];
            
            console.log('找到position匹配:', positionMatches.length);
            console.log('找到name匹配:', nameMatches.length);
            console.log('找到time匹配:', timeMatches.length);
            
            // 组合数据
            for (let i = 0; i < positionMatches.length; i++) {
                const positionMatch = positionMatches[i];
                const lng = parseFloat(positionMatch[1]);
                const lat = parseFloat(positionMatch[2]);
                const name = nameMatches[i] ? nameMatches[i][1] : `位置 ${i + 1}`;
                const time = timeMatches[i] ? timeMatches[i][1] : '';
                
                // 验证坐标有效性
                if (!isNaN(lat) && !isNaN(lng) && 
                    lat >= -90 && lat <= 90 && 
                    lng >= -180 && lng <= 180) {
                    positions.push({
                        lat: lat,
                        lng: lng,
                        name: name,
                        time: time,
                        index: i + 1
                    });
                }
            }
            
        } catch (error) {
            console.error('解析数据失败:', error);
            throw new Error('解析position.txt文件失败');
        }
        
        return positions;
    }

    showPins(positions) {
        // 清除现有标记
        this.clearAllMarkers();
        
        if (positions.length === 0) {
            this.showNotification('没有有效的位置数据', 'warning');
            return;
        }

        // 根据当前缩放级别聚合显示图钉
        this.clusterAndShowPins(positions);
    }

    onMapZoom() {
        const newZoom = this.map.getZoom();
        console.log(`地图缩放事件: ${this.currentZoom} -> ${newZoom}`);
        
        // 缩放级别变化时就重新聚合
        if (newZoom !== this.currentZoom) {
            this.currentZoom = newZoom;
            if (this.positionData.length > 0) {
                console.log('重新聚合图钉，数据量:', this.positionData.length);
                
                // 获取当前地图区域内的坐标点
                const visiblePositions = this.getVisiblePositions();
                console.log(`当前地图区域内坐标点数量: ${visiblePositions.length}`);
                
                // 只对可见区域内的点进行聚合
                this.clusterAndShowPins(visiblePositions);
                const config = this.getZoomConfig(newZoom);
                const clusteringStatus = config.enableClustering ? '启用' : '禁用';
                this.updateStatus(`缩放级别: ${newZoom}, 显示图钉 (${visiblePositions.length}个点) | 阈值: ${config.threshold} | 聚合: ${clusteringStatus}`, 'info');
            } else {
                console.log('没有数据，跳过聚合更新');
            }
        }
    }

    clusterAndShowPins(positions) {
        // 清除现有标记
        this.clearAllMarkers();
        
        // 确保当前缩放级别是最新的
        if (this.map) {
            this.currentZoom = this.map.getZoom();
        }
        
        console.log(`当前缩放级别: ${this.currentZoom}, 数据量: ${positions.length}`);
        
        // 如果没有可见的点，直接返回
        if (positions.length === 0) {
            console.log('没有可见的点，跳过聚合');
            this.updateStats(this.positionData.length, this.positionData.length, 0);
            this.updateStatus('当前区域没有数据点', 'info');
            return;
        }
        
        const threshold = this.getClusterThreshold(this.currentZoom);
        const clusteringEnabled = this.isClusteringEnabled(this.currentZoom);
        
        // 调试信息
        console.log(`=== 聚合决策调试信息 ===`);
        console.log(`当前缩放级别: ${this.currentZoom}`);
        console.log(`数据量: ${positions.length}`);
        console.log(`聚合阈值: ${threshold}`);
        console.log(`聚合启用: ${clusteringEnabled}`);
        this.debugZoomConfig(this.currentZoom);
        
        // 如果是缩放级别9，进行专门测试
        if (this.currentZoom === 9) {
            this.testZoomLevel9();
        }
        
        if (!clusteringEnabled) {
            // 聚合被禁用，直接显示所有图钉
            console.log('聚合被禁用，直接显示所有图钉');
            this.addPinsInBatches(positions, 0);
        } else if (positions.length <= threshold) {
            // 数据量小，直接显示所有图钉
            console.log(`数据量小(${positions.length} <= ${threshold})，直接显示所有图钉`);
            this.addPinsInBatches(positions, 0);
        } else {
            // 数据量大，进行聚合
            console.log(`数据量大(${positions.length} > ${threshold})，进行聚合显示`);
            this.createClusteredMarkers(positions, threshold);
        }
    }

    getClusterThreshold(zoom) {
        // 使用新的zoomThresholds配置
        // 直接匹配当前缩放级别，如果不存在则找最接近的较低级别
        if (this.zoomThresholds[zoom]) {
            return this.zoomThresholds[zoom].threshold;
        }
        
        // 如果没有精确匹配，找最接近的较低级别
        for (let level of Object.keys(this.zoomThresholds).sort((a, b) => parseInt(b) - parseInt(a))) {
            if (zoom >= parseInt(level)) {
                return this.zoomThresholds[level].threshold;
            }
        }
        return 1; // 最高缩放级别，显示所有图钉
    }

    // 获取完整的缩放级别配置
    getZoomConfig(zoom) {
        // 直接匹配当前缩放级别，如果不存在则找最接近的较低级别
        if (this.zoomThresholds[zoom]) {
            return this.zoomThresholds[zoom];
        }
        
        // 如果没有精确匹配，找最接近的较低级别
        for (let level of Object.keys(this.zoomThresholds).sort((a, b) => parseInt(b) - parseInt(a))) {
            if (zoom >= parseInt(level)) {
                return this.zoomThresholds[level];
            }
        }
        return { threshold: 1, gridSize: 1, maxClusters: 2000, enableClustering: true };
    }

    // 检查当前缩放级别是否启用聚合
    isClusteringEnabled(zoom) {
        const config = this.getZoomConfig(zoom);
        return config.enableClustering;
    }

    // 调试方法：打印当前缩放级别的详细配置信息
    debugZoomConfig(zoom) {
        const config = this.getZoomConfig(zoom);
        console.log(`缩放级别 ${zoom} 配置:`, {
            threshold: config.threshold,
            gridSize: config.gridSize,
            maxClusters: config.maxClusters,
            enableClustering: config.enableClustering
        });
        return config;
    }

    // 专门测试缩放级别9的配置
    testZoomLevel9() {
        console.log('=== 测试缩放级别9配置 ===');
        console.log('直接访问配置:', this.zoomThresholds[9]);
        
        const threshold = this.getClusterThreshold(9);
        const config = this.getZoomConfig(9);
        const clusteringEnabled = this.isClusteringEnabled(9);
        
        console.log('getClusterThreshold(9):', threshold);
        console.log('getZoomConfig(9):', config);
        console.log('isClusteringEnabled(9):', clusteringEnabled);
        
        // 模拟5420个数据点的情况
        const testDataCount = 5420;
        console.log(`模拟数据量: ${testDataCount}`);
        console.log(`聚合决策: ${testDataCount} > ${threshold} = ${testDataCount > threshold}`);
        console.log(`最终决策: ${!clusteringEnabled ? '聚合禁用，直接显示' : (testDataCount <= threshold ? '数据量小，直接显示' : '数据量大，进行聚合')}`);
    }

    // 添加自定义缩放控制
    addCustomZoomControl() {
        if (!this.map) return;
        
        // 使用Leaflet内置的缩放控制，但重新配置
        const zoomControl = L.control.zoom({
            position: 'topleft',
            zoomInTitle: '放大',
            zoomOutTitle: '缩小'
        });
        
        zoomControl.addTo(this.map);
        
        // 重写缩放行为，确保精确控制
        this.overrideZoomBehavior();
        
        console.log('缩放控制已重新配置');
    }
    
    // 重写缩放行为
    overrideZoomBehavior() {
        if (!this.map) return;
        
        // 重写setZoom方法，确保精确控制
        const originalSetZoom = this.map.setZoom.bind(this.map);
        this.map.setZoom = (zoom, options) => {
            const currentZoom = this.map.getZoom();
            const targetZoom = Math.round(zoom); // 确保整数级别
            
            console.log(`缩放请求: ${currentZoom} -> ${targetZoom}`);
            
            // 检查是否在有效范围内
            if (targetZoom < this.map.getMinZoom() || targetZoom > this.map.getMaxZoom()) {
                console.log(`缩放级别 ${targetZoom} 超出范围 [${this.map.getMinZoom()}, ${this.map.getMaxZoom()}]`);
                return;
            }
            
            // 检查缩放跳跃是否合理
            const zoomDiff = Math.abs(targetZoom - currentZoom);
            if (zoomDiff > 1 && zoomDiff < 10) {
                console.warn(`检测到异常缩放请求: ${currentZoom} -> ${targetZoom}, 差值: ${zoomDiff}`);
                // 如果是从14请求到10，修正为15
                if (currentZoom === 14 && targetZoom === 10) {
                    console.log('修正缩放请求: 14 -> 10 改为 14 -> 15');
                    return originalSetZoom(15, options);
                }
            }
            
            // 调用原始方法
            return originalSetZoom(targetZoom, options);
        };
        
        // 监听所有缩放事件，添加详细日志
        this.map.on('zoomstart', (e) => {
            console.log('缩放开始事件触发');
        });
        
        this.map.on('zoom', (e) => {
            console.log(`缩放中: 当前级别 ${this.map.getZoom()}`);
        });
        
        this.map.on('zoomend', (e) => {
            console.log(`缩放结束: 最终级别 ${this.map.getZoom()}`);
        });
        
        console.log('缩放行为已重写');
    }

    // 获取当前地图区域内的可见坐标点
    getVisiblePositions() {
        if (!this.map || this.positionData.length === 0) {
            return [];
        }

        // 获取当前地图的边界
        const bounds = this.map.getBounds();
        const north = bounds.getNorth();
        const south = bounds.getSouth();
        const east = bounds.getEast();
        const west = bounds.getWest();

        console.log(`地图边界: 北${north.toFixed(4)}, 南${south.toFixed(4)}, 东${east.toFixed(4)}, 西${west.toFixed(4)}`);

        // 过滤出在当前地图区域内的坐标点
        const visiblePositions = this.positionData.filter(position => {
            const lat = position.lat;
            const lng = position.lng;
            
            // 检查坐标是否在地图边界内
            return lat >= south && lat <= north && lng >= west && lng <= east;
        });

        console.log(`可见区域内的坐标点: ${visiblePositions.length}/${this.positionData.length}`);
        return visiblePositions;
    }

    // 根据当前地图边界过滤位置数据（用于初始加载）
    filterPositionsByCurrentBounds(allPositions) {
        if (!this.map || allPositions.length === 0) {
            return [];
        }

        // 获取当前地图的边界
        const bounds = this.map.getBounds();
        const north = bounds.getNorth();
        const south = bounds.getSouth();
        const east = bounds.getEast();
        const west = bounds.getWest();

        console.log(`加载数据时的地图边界: 北${north.toFixed(4)}, 南${south.toFixed(4)}, 东${east.toFixed(4)}, 西${west.toFixed(4)}`);

        // 过滤出在当前地图区域内的坐标点
        const visiblePositions = allPositions.filter(position => {
            const lat = position.lat;
            const lng = position.lng;
            
            // 检查坐标是否在地图边界内
            return lat >= south && lat <= north && lng >= west && lng <= east;
        });

        console.log(`当前区域内的坐标点: ${visiblePositions.length}/${allPositions.length}`);
        return visiblePositions;
    }

    // 检查坐标点是否在地图边界内
    isPositionInBounds(position, bounds) {
        const lat = position.lat;
        const lng = position.lng;
        
        return lat >= bounds.getSouth() && 
               lat <= bounds.getNorth() && 
               lng >= bounds.getWest() && 
               lng <= bounds.getEast();
    }

    createClusteredMarkers(positions, threshold) {
        // 将位置数据按区域分组
        const clusters = this.groupPositionsByArea(positions, threshold);
        
        // 限制最大显示的聚合标记数量
        const maxClusters = this.getMaxClusters();
        const clusterKeys = Object.keys(clusters);
        
        if (clusterKeys.length > maxClusters) {
            // 如果聚合区域太多，进一步合并
            this.mergeClusters(clusters, maxClusters);
        }
        
        // 为每个聚合区域创建标记
        Object.keys(clusters).forEach(key => {
            const cluster = clusters[key];
            this.createClusterMarker(cluster);
        });
        
        this.updateStats(positions.length, positions.length, Object.keys(clusters).length);
        
        // 获取当前缩放级别配置信息
        const config = this.getZoomConfig(this.currentZoom);
        const clusteringStatus = config.enableClustering ? '启用' : '禁用';
        const statusMessage = `聚合显示: ${Object.keys(clusters).length} 个区域 | 阈值: ${config.threshold} | 网格: ${config.gridSize} | 最大聚合: ${config.maxClusters} | 聚合: ${clusteringStatus}`;
        this.updateStatus(statusMessage, 'success');
    }

    getMaxClusters() {
        // 使用新的zoomThresholds配置
        const config = this.getZoomConfig(this.currentZoom);
        return config.maxClusters;
    }

    mergeClusters(clusters, maxClusters) {
        const clusterKeys = Object.keys(clusters);
        const clustersToMerge = clusterKeys.length - maxClusters;
        
        if (clustersToMerge <= 0) return;
        
        // 按聚合数量排序，优先合并数量较少的聚合
        const sortedKeys = clusterKeys.sort((a, b) => clusters[a].count - clusters[b].count);
        
        // 合并前clustersToMerge个聚合到最近的聚合中
        for (let i = 0; i < clustersToMerge; i++) {
            const keyToMerge = sortedKeys[i];
            const clusterToMerge = clusters[keyToMerge];
            
            // 找到最近的聚合
            let nearestKey = null;
            let minDistance = Infinity;
            
            for (let j = i + 1; j < sortedKeys.length; j++) {
                const otherKey = sortedKeys[j];
                const otherCluster = clusters[otherKey];
                
                const distance = this.calculateDistance(
                    clusterToMerge.centerLat, clusterToMerge.centerLng,
                    otherCluster.centerLat, otherCluster.centerLng
                );
                
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestKey = otherKey;
                }
            }
            
            if (nearestKey) {
                // 合并到最近的聚合中
                const targetCluster = clusters[nearestKey];
                targetCluster.positions.push(...clusterToMerge.positions);
                targetCluster.count += clusterToMerge.count;
                targetCluster.centerLat = (targetCluster.centerLat + clusterToMerge.centerLat) / 2;
                targetCluster.centerLng = (targetCluster.centerLng + clusterToMerge.centerLng) / 2;
                
                // 删除被合并的聚合
                delete clusters[keyToMerge];
            }
        }
    }

    calculateDistance(lat1, lng1, lat2, lng2) {
        // 简单的欧几里得距离计算
        return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
    }

    groupPositionsByArea(positions, threshold) {
        const clusters = {};
        const gridSize = this.getGridSize();
        
        positions.forEach(pos => {
            // 根据缩放级别计算网格大小
            const gridLat = Math.floor(pos.lat * gridSize) / gridSize;
            const gridLng = Math.floor(pos.lng * gridSize) / gridSize;
            const key = `${gridLat}_${gridLng}`;
            
            if (!clusters[key]) {
                clusters[key] = {
                    positions: [],
                    centerLat: 0,
                    centerLng: 0,
                    count: 0
                };
            }
            
            clusters[key].positions.push(pos);
            clusters[key].count++;
            clusters[key].centerLat += pos.lat;
            clusters[key].centerLng += pos.lng;
        });
        
        // 计算每个聚合区域的中心点
        Object.keys(clusters).forEach(key => {
            const cluster = clusters[key];
            cluster.centerLat /= cluster.count;
            cluster.centerLng /= cluster.count;
        });
        
        return clusters;
    }

    getGridSize() {
        // 使用新的zoomThresholds配置
        const config = this.getZoomConfig(this.currentZoom);
        return config.gridSize;
    }

    getBaseMarkerSize() {
        // 根据缩放级别返回基础标记大小
        const markerSizes = {
            1: 80,   // 全球视图：极大标记
            2: 75,   // 大洲视图：极大标记
            3: 70,   // 国家视图：极大标记
            4: 65,   // 大区域视图：极大标记
            5: 60,   // 区域视图：大标记
            6: 55,   // 省/州视图：大标记
            7: 50,   // 大市视图：大标记
            8: 45,   // 市视图：大标记
            9: 40,   // 大区视图：中标记
            10: 35,  // 区县视图：中标记
            11: 30,  // 街道视图：中标记
            12: 28,  // 社区视图：中标记
            13: 25,  // 街区视图：小标记
            14: 22,  // 小区视图：小标记
            15: 20,  // 建筑群视图：小标记
            16: 18,  // 建筑视图：最小标记
            17: 16,  // 详细建筑视图：最小标记
            18: 14   // 最详细视图：最小标记
        };
        
        for (let level of Object.keys(markerSizes).sort((a, b) => b - a)) {
            if (this.currentZoom <= parseInt(level)) {
                return markerSizes[level];
            }
        }
        return 14; // 默认标记大小
    }

    bindZoomEvents() {
        if (this.map) {
            // 移除旧的事件监听器
            this.map.off('zoomend');
            this.map.off('moveend');
            
            // 添加缩放事件监听器
            this.map.on('zoomend', () => {
                console.log('缩放事件被触发');
                this.onMapZoom();
            });
            
            // 添加地图移动事件监听器
            this.map.on('moveend', () => {
                console.log('地图移动事件被触发');
                this.onMapMove();
            });
            
            console.log('缩放和移动事件监听器已绑定');
            
            // 也监听zoomstart事件用于调试
            this.map.on('zoomstart', () => {
                console.log('开始缩放地图');
            });
        } else {
            console.error('地图未初始化，无法绑定缩放事件');
        }
    }



    // 地图移动事件处理
    onMapMove() {
        if (this.positionData.length === 0 || this.isUpdating) {
            return;
        }

        // 检查边界是否发生显著变化
        const currentBounds = this.map.getBounds();
        if (this.lastVisibleBounds && this.boundsSimilar(currentBounds, this.lastVisibleBounds)) {
            console.log('地图边界变化不大，跳过聚合更新');
            return;
        }

        this.isUpdating = true;
        console.log('地图移动，重新计算可见区域聚合');
        
        // 获取当前地图区域内的坐标点
        const visiblePositions = this.getVisiblePositions();
        console.log(`移动后可见区域内的坐标点数量: ${visiblePositions.length}`);
        
        // 只对可见区域内的点进行聚合
        this.clusterAndShowPins(visiblePositions);
        const config = this.getZoomConfig(this.currentZoom);
        const clusteringStatus = config.enableClustering ? '启用' : '禁用';
        this.updateStatus(`地图移动，显示图钉 (${visiblePositions.length}个点) | 阈值: ${config.threshold} | 聚合: ${clusteringStatus}`, 'info');
        
        // 更新边界记录
        this.lastVisibleBounds = currentBounds;
        
        // 重置更新标志
        setTimeout(() => {
            this.isUpdating = false;
        }, 100);
    }

    // 检查两个边界是否相似（避免微小变化触发更新）
    boundsSimilar(bounds1, bounds2) {
        const threshold = 0.001; // 约100米的阈值
        
        return Math.abs(bounds1.getNorth() - bounds2.getNorth()) < threshold &&
               Math.abs(bounds1.getSouth() - bounds2.getSouth()) < threshold &&
               Math.abs(bounds1.getEast() - bounds2.getEast()) < threshold &&
               Math.abs(bounds1.getWest() - bounds2.getWest()) < threshold;
    }

    createClusterMarker(cluster) {
        // 根据缩放级别调整标记大小
        const baseSize = this.getBaseMarkerSize();
        const size = Math.min(baseSize * 2, Math.max(baseSize, baseSize + cluster.count / 10));
        const fontSize = Math.max(10, Math.min(16, baseSize / 2));
        
        const marker = L.marker([cluster.centerLat, cluster.centerLng], {
            icon: L.divIcon({
                html: `
                    <div style="
                        background: #ff4444; 
                        color: white; 
                        border-radius: 50%; 
                        width: ${size}px; 
                        height: ${size}px; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        font-weight: bold; 
                        font-size: ${fontSize}px;
                        border: 2px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    ">
                        ${cluster.count}
                    </div>
                `,
                iconSize: [size, size],
                className: 'cluster-marker'
            })
        });

        // 创建聚合信息弹窗
        const samplePositions = cluster.positions.slice(0, 10); // 只显示前10个
        marker.bindPopup(`
            <div style="min-width: 250px; max-width: 350px;">
                <h4 style="margin: 0 0 8px 0; color: #333;">聚合区域 (${cluster.count}个点)</h4>
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #999;">
                    中心坐标: ${cluster.centerLat.toFixed(6)}, ${cluster.centerLng.toFixed(6)}
                </p>
                <div style="max-height: 200px; overflow-y: auto;">
                    ${samplePositions.map(pos => `
                        <div style="margin: 4px 0; padding: 4px; background: #f5f5f5; border-radius: 4px; font-size: 11px;">
                            <strong>${pos.name}</strong><br>
                            <span style="color: #666;">${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}</span>
                            ${pos.time ? `<br><span style="color: #888;">${pos.time}</span>` : ''}
                        </div>
                    `).join('')}
                    ${cluster.count > 10 ? `<p style="text-align: center; color: #666; font-size: 11px; margin: 8px 0 0 0;">还有 ${cluster.count - 10} 个点...</p>` : ''}
                </div>
                <p style="margin: 8px 0 0 0; text-align: center; font-size: 11px; color: #888;">
                    放大地图查看详细信息
                </p>
            </div>
        `);

        marker.addTo(this.map);
        this.clusteredMarkers.set(`cluster_${cluster.centerLat}_${cluster.centerLng}`, marker);
    }

    addPinsInBatches(positions, startIndex) {
        const batchSize = 100; // 每批处理100个
        const endIndex = Math.min(startIndex + batchSize, positions.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            const pos = positions[i];
            this.addPinToMap(pos);
        }
        
        // 更新显示数量
        this.updateStats(positions.length, positions.length, endIndex);
        
        // 如果还有数据，继续下一批
        if (endIndex < positions.length) {
            setTimeout(() => {
                this.addPinsInBatches(positions, endIndex);
            }, 10); // 10ms延迟，避免阻塞UI
        } else {
            // 所有图钉添加完成，调整地图视图
            this.fitMapToPins(positions);
            
            // 使用一致的状态消息格式
            const config = this.getZoomConfig(this.currentZoom);
            const clusteringStatus = config.enableClustering ? '启用' : '禁用';
            this.updateStatus(`直接显示: ${positions.length} 个图钉 | 阈值: ${config.threshold} | 聚合: ${clusteringStatus}`, 'success');
            this.showNotification(`成功显示 ${positions.length} 个图钉`, 'success');
        }
    }

    addPinToMap(position) {
        // 检查地图是否已初始化
        if (!this.map) {
            console.error('地图未初始化，无法添加图钉');
            return;
        }

        const marker = L.marker([position.lat, position.lng], {
            icon: L.divIcon({
                html: `<div style="font-size: 20px; color: #ff0000;">📍</div>`,
                iconSize: [25, 25],
                className: 'custom-pin'
            })
        });

        marker.bindPopup(`
            <div style="min-width: 200px; max-width: 300px;">
                <h4 style="margin: 0 0 8px 0; color: #333; font-size: 14px;">${position.name}</h4>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #999;">
                    坐标: ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}
                </p>
                ${position.time ? `<p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">
                    时间: ${position.time}
                </p>` : ''}
                <p style="margin: 0; font-size: 11px; color: #ccc;">
                    编号: ${position.index}
                </p>
            </div>
        `);

        marker.addTo(this.map);
        this.markers.push(marker);
    }

    clearAllMarkers() {
        if (!this.map) {
            console.error('地图未初始化，无法清除图钉');
            return;
        }
        
        // 清除普通标记
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers = [];
        
        // 清除聚合标记
        this.clusteredMarkers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.clusteredMarkers.clear();
        
        console.log('所有标记已清除');
    }

    fitMapToPins(positions) {
        if (positions.length === 0 || !this.map) return;

        // 记录当前缩放级别
        const currentZoom = this.map.getZoom();
        console.log(`保持当前缩放级别: ${currentZoom}，不自动调整视图`);

        // 不再自动调整地图视图，保持用户当前的缩放级别和位置
        // 这样用户可以根据需要手动调整地图位置和缩放级别
        return;

        // 以下是原来的自动调整代码（已禁用，避免强制改变缩放级别）
        /*
        if (positions.length === 1) {
            // 只有一个图钉时，居中显示并放大
            this.map.setView([positions[0].lat, positions[0].lng], 12);
        } else {
            // 多个图钉时，调整视图显示所有图钉，并添加边距显示更大区域
            const bounds = L.latLngBounds();
            positions.forEach(pos => {
                bounds.extend([pos.lat, pos.lng]);
            });
            
            // 使用fitBounds并添加边距，限制最大缩放级别
            this.map.fitBounds(bounds, {
                padding: [50, 50], // 添加边距，显示更大区域
                maxZoom: 10 // 限制最大缩放级别，确保显示更大区域
            });
        }
        */
    }

    updateStatus(message, type) {
        const statusElement = document.getElementById('mapStatus');
        if (statusElement) {
            // 添加缩放等级信息到状态消息
            const zoomInfo = this.map ? ` | 缩放等级: ${this.currentZoom}` : '';
            const fullMessage = `${message}${zoomInfo}`;
            
            statusElement.textContent = fullMessage;
            statusElement.className = `status-message status-${type}`;
        }
    }

    updateStats(total, loaded, displayed) {
        document.getElementById('totalPins').textContent = total;
        document.getElementById('loadedPins').textContent = loaded;
        document.getElementById('displayedPins').textContent = displayed;
    }

    showLoading(show) {
        const loadingInfo = document.getElementById('loadingInfo');
        if (loadingInfo) {
            loadingInfo.style.display = show ? 'block' : 'none';
        }
    }

    clearText() {
        super.clearText();
        this.clearAllMarkers();
        this.positionData = [];
        this.updateStats(0, 0, 0);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    window.mapPinsToolInstance = new MapPinsTool();
    
    // 添加全局测试方法，方便在控制台调试
    window.testZoom9 = () => {
        if (window.mapPinsToolInstance) {
            window.mapPinsToolInstance.testZoomLevel9();
        } else {
            console.log('地图工具未初始化');
        }
    };
    
    // 添加缩放测试方法
    window.testZoom = (targetZoom) => {
        if (window.mapPinsToolInstance && window.mapPinsToolInstance.map) {
            const currentZoom = window.mapPinsToolInstance.map.getZoom();
            console.log(`测试缩放: ${currentZoom} -> ${targetZoom}`);
            window.mapPinsToolInstance.map.setZoom(targetZoom);
        } else {
            console.log('地图工具未初始化');
        }
    };
    
    // 添加逐步缩放测试方法
    window.testStepZoom = (from, to) => {
        if (window.mapPinsToolInstance && window.mapPinsToolInstance.map) {
            console.log(`=== 逐步缩放测试: ${from} -> ${to} ===`);
            window.mapPinsToolInstance.map.setZoom(from);
            
            setTimeout(() => {
                console.log(`当前级别: ${window.mapPinsToolInstance.map.getZoom()}`);
                window.mapPinsToolInstance.map.setZoom(to);
                
                setTimeout(() => {
                    console.log(`最终级别: ${window.mapPinsToolInstance.map.getZoom()}`);
                }, 200);
            }, 200);
        } else {
            console.log('地图工具未初始化');
        }
    };
    
    // 添加缩放调试方法
    window.debugZoom = () => {
        if (window.mapPinsToolInstance && window.mapPinsToolInstance.map) {
            const map = window.mapPinsToolInstance.map;
            console.log('=== 缩放调试信息 ===');
            console.log('当前缩放级别:', map.getZoom());
            console.log('最小缩放级别:', map.getMinZoom());
            console.log('最大缩放级别:', map.getMaxZoom());
            console.log('缩放控制状态:', map.zoomControl ? '已启用' : '已禁用');
        } else {
            console.log('地图工具未初始化');
        }
    };
    
    console.log('地图图钉工具已初始化');
    console.log('可用命令:');
    console.log('  testZoom9() - 测试缩放级别9配置');
    console.log('  testZoom(15) - 测试缩放到指定级别');
    console.log('  testStepZoom(14, 15) - 测试从14到15的逐步缩放');
    console.log('  debugZoom() - 显示缩放调试信息');
});
