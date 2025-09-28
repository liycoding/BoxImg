// 白噪音生成器
class WhiteNoiseGenerator extends ToolPage {
    constructor() {
        super();
        this.audioContext = null;
        this.isGenerating = false;
        this.audioBuffer = null;
    }

    initializeTool() {
        console.log('初始化白噪音生成器');
        this.setupEventListeners();
    }

    setupEventListeners() {
        super.setupEventListeners();
        
        // 生成按钮
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generateWhiteNoise();
            });
        }

        // 下载按钮
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.downloadAudio();
            });
        }

        // 停止按钮
        const stopBtn = document.getElementById('stopBtn');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                this.stopAudio();
            });
        }
    }

    async generateWhiteNoise() {
        if (this.isGenerating) {
            this.showNotification('正在生成中，请稍候...', 'warning');
            return;
        }

        const duration = parseInt(document.getElementById('duration').value);
        const channels = parseInt(document.getElementById('channels').value);
        const sampleRate = parseInt(document.getElementById('sampleRate').value);

        if (duration < 1 || duration > 600) {
            this.showNotification('时长必须在1-600秒之间', 'error');
            return;
        }

        this.isGenerating = true;
        this.showProgress(true);
        this.updateStatus('正在生成白噪音...', 'info');

        try {
            // 初始化音频上下文
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            // 使用Web Worker生成白噪音，避免阻塞主线程
            const audioBuffer = await this.generateWhiteNoiseAsync(duration, channels, sampleRate);
            
            this.audioBuffer = audioBuffer;
            this.displayAudio(audioBuffer);
            this.updateStatus('白噪音生成完成！', 'success');
            this.showNotification('白噪音生成完成，可以播放或下载', 'success');

        } catch (error) {
            console.error('生成白噪音失败:', error);
            this.updateStatus('生成失败: ' + error.message, 'error');
            this.showNotification('生成失败，请重试', 'error');
        } finally {
            this.isGenerating = false;
            this.showProgress(false);
        }
    }

    async generateWhiteNoiseAsync(duration, channels, sampleRate) {
        return new Promise((resolve, reject) => {
            // 创建Web Worker来生成白噪音
            const workerCode = `
                self.onmessage = function(e) {
                    const { duration, channels, sampleRate } = e.data;
                    const length = duration * sampleRate;
                    const audioBuffer = new ArrayBuffer(44 + length * channels * 2);
                    const view = new DataView(audioBuffer);
                    
                    // WAV文件头
                    const writeString = (offset, string) => {
                        for (let i = 0; i < string.length; i++) {
                            view.setUint8(offset + i, string.charCodeAt(i));
                        }
                    };
                    
                    writeString(0, 'RIFF');
                    view.setUint32(4, 36 + length * channels * 2, true);
                    writeString(8, 'WAVE');
                    writeString(12, 'fmt ');
                    view.setUint32(16, 16, true);
                    view.setUint16(20, 1, true);
                    view.setUint16(22, channels, true);
                    view.setUint32(24, sampleRate, true);
                    view.setUint32(28, sampleRate * channels * 2, true);
                    view.setUint16(32, channels * 2, true);
                    view.setUint16(34, 16, true);
                    writeString(36, 'data');
                    view.setUint32(40, length * channels * 2, true);
                    
                    // 生成白噪音数据
                    const dataOffset = 44;
                    const chunkSize = 4096; // 每次处理4096个样本
                    let processed = 0;
                    
                    const generateChunk = () => {
                        const end = Math.min(processed + chunkSize, length);
                        
                        for (let i = processed; i < end; i++) {
                            for (let channel = 0; channel < channels; channel++) {
                                // 生成白噪音：使用Math.random()生成-1到1之间的随机数
                                const noise = (Math.random() * 2 - 1) * 0.5; // 降低音量避免过响
                                const sample = Math.max(-1, Math.min(1, noise));
                                const intSample = Math.floor(sample * 32767);
                                const offset = dataOffset + (i * channels + channel) * 2;
                                view.setInt16(offset, intSample, true);
                            }
                        }
                        
                        processed = end;
                        const progress = Math.round((processed / length) * 100);
                        
                        // 发送进度更新
                        self.postMessage({ type: 'progress', progress });
                        
                        if (processed < length) {
                            // 使用setTimeout让出控制权，避免阻塞
                            setTimeout(generateChunk, 0);
                        } else {
                            // 生成完成
                            self.postMessage({ type: 'complete', audioBuffer });
                        }
                    };
                    
                    generateChunk();
                };
            `;

            const blob = new Blob([workerCode], { type: 'application/javascript' });
            const worker = new Worker(URL.createObjectURL(blob));

            worker.onmessage = (e) => {
                const { type, progress, audioBuffer } = e.data;
                
                if (type === 'progress') {
                    this.updateProgress(progress);
                } else if (type === 'complete') {
                    // 将ArrayBuffer转换为AudioBuffer
                    this.audioContext.decodeAudioData(audioBuffer.slice()).then(resolve).catch(reject);
                    worker.terminate();
                    URL.revokeObjectURL(blob);
                }
            };

            worker.onerror = (error) => {
                reject(new Error('Web Worker错误: ' + error.message));
                worker.terminate();
                URL.revokeObjectURL(blob);
            };

            // 启动生成
            worker.postMessage({ duration, channels, sampleRate });
        });
    }

    displayAudio(audioBuffer) {
        const audioContainer = document.getElementById('audioContainer');
        const audioPlayer = document.getElementById('audioPlayer');
        
        // 将AudioBuffer转换为Blob URL
        const audioData = this.audioBufferToWav(audioBuffer);
        const blob = new Blob([audioData], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        
        audioPlayer.src = url;
        audioContainer.style.display = 'block';
    }

    audioBufferToWav(audioBuffer) {
        const length = audioBuffer.length;
        const sampleRate = audioBuffer.sampleRate;
        const channels = audioBuffer.numberOfChannels;
        const arrayBuffer = new ArrayBuffer(44 + length * channels * 2);
        const view = new DataView(arrayBuffer);
        
        // WAV文件头
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * channels * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, channels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * channels * 2, true);
        view.setUint16(32, channels * 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * channels * 2, true);
        
        // 写入音频数据
        let offset = 44;
        for (let i = 0; i < length; i++) {
            for (let channel = 0; channel < channels; channel++) {
                const sample = audioBuffer.getChannelData(channel)[i];
                const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
                view.setInt16(offset, intSample, true);
                offset += 2;
            }
        }
        
        return arrayBuffer;
    }

    downloadAudio() {
        if (!this.audioBuffer) {
            this.showNotification('请先生成白噪音', 'warning');
            return;
        }

        const duration = document.getElementById('duration').value;
        const channels = document.getElementById('channels').value;
        const sampleRate = document.getElementById('sampleRate').value;
        
        const audioData = this.audioBufferToWav(this.audioBuffer);
        const blob = new Blob([audioData], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `white-noise-${duration}s-${channels}ch-${sampleRate}hz.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('音频文件已开始下载', 'success');
    }

    stopAudio() {
        const audioPlayer = document.getElementById('audioPlayer');
        if (audioPlayer) {
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
        }
    }

    showProgress(show) {
        const progressContainer = document.getElementById('progressContainer');
        if (progressContainer) {
            progressContainer.style.display = show ? 'block' : 'none';
        }
    }

    updateProgress(progress) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
        if (progressText) {
            progressText.textContent = `生成中... ${progress}%`;
        }
    }

    updateStatus(message, type) {
        const status = document.getElementById('status');
        if (status) {
            status.textContent = message;
            status.className = `status-message status-${type}`;
        }
    }

    clearText() {
        super.clearText();
        const audioContainer = document.getElementById('audioContainer');
        const progressContainer = document.getElementById('progressContainer');
        const status = document.getElementById('status');
        
        if (audioContainer) audioContainer.style.display = 'none';
        if (progressContainer) progressContainer.style.display = 'none';
        if (status) status.textContent = '';
        
        // 停止音频播放
        this.stopAudio();
        
        // 清理音频资源
        if (this.audioBuffer) {
            this.audioBuffer = null;
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    new WhiteNoiseGenerator();
});
