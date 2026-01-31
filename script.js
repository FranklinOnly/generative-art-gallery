// 主应用程序
document.addEventListener('DOMContentLoaded', function() {
    // 主题切换
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');
    
    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'light');
            themeIcon.className = 'fas fa-sun';
        } else {
            document.documentElement.removeAttribute('data-theme');
            themeIcon.className = 'fas fa-moon';
        }
    });
    
    // 初始化画廊卡片
    initGalleryCards();
    
    // 初始化英雄区域画布
    initHeroCanvas();
    
    // 初始化全屏查看器
    initFullscreenViewer();
});

// 初始化画廊卡片
function initGalleryCards() {
    const cards = document.querySelectorAll('.art-card');
    
    cards.forEach((card, index) => {
        const canvasId = `card${index + 1}`;
        const artType = card.getAttribute('data-art');
        const canvas = document.getElementById(canvasId);
        
        // 创建预览画布
        initPreviewCanvas(canvas, artType);
        
        // 添加点击事件
        const btn = card.querySelector('.art-card-btn');
        btn.addEventListener('click', () => {
            openFullscreenViewer(artType, card.querySelector('h3').textContent);
        });
        
        // 整个卡片可点击
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('art-card-btn')) {
                openFullscreenViewer(artType, card.querySelector('h3').textContent);
            }
        });
    });
}

// 初始化预览画布
function initPreviewCanvas(canvas, artType) {
    const sketch = (p) => {
        let particles = [];
        let flowField = [];
        let time = 0;
        
        p.setup = () => {
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            p.createCanvas(width, height);
            
            // 根据艺术类型初始化
            switch(artType) {
                case 'particles':
                    initParticles();
                    break;
                case 'fractals':
                    // 分形树不需要持续更新
                    drawFractalTree();
                    break;
                case 'noise':
                    drawNoiseArt();
                    break;
                case 'flow':
                    initFlowField();
                    break;
            }
        };
        
        p.draw = () => {
            // 只有需要动画的艺术类型才持续绘制
            if (artType === 'particles' || artType === 'flow') {
                p.background(26, 26, 46, 50);
                updateAndDraw();
            }
        };
        
        function initParticles() {
            particles = [];
            const particleCount = 100;
            
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: p.random(p.width),
                    y: p.random(p.height),
                    vx: p.random(-1, 1),
                    vy: p.random(-1, 1),
                    color: p.color(
                        100 + p.random(155),
                        100 + p.random(155),
                        200 + p.random(55)
                    ),
                    size: p.random(1, 3)
                });
            }
        }
        
        function drawFractalTree() {
            p.background(26, 26, 46);
            p.stroke(108, 99, 255);
            p.strokeWeight(2);
            p.translate(p.width / 2, p.height);
            drawBranch(80);
            
            function drawBranch(len) {
                p.line(0, 0, 0, -len);
                p.translate(0, -len);
                
                if (len > 10) {
                    p.push();
                    p.rotate(p.PI / 6);
                    drawBranch(len * 0.67);
                    p.pop();
                    
                    p.push();
                    p.rotate(-p.PI / 6);
                    drawBranch(len * 0.67);
                    p.pop();
                }
            }
        }
        
        function drawNoiseArt() {
            p.background(26, 26, 46);
            p.noiseSeed(p.random(1000));
            
            for (let x = 0; x < p.width; x += 10) {
                for (let y = 0; y < p.height; y += 10) {
                    const noiseVal = p.noise(x * 0.01, y * 0.01);
                    const size = p.map(noiseVal, 0, 1, 2, 8);
                    const alpha = p.map(noiseVal, 0, 1, 100, 255);
                    
                    p.fill(108, 99, 255, alpha);
                    p.noStroke();
                    p.ellipse(x, y, size);
                }
            }
        }
        
        function initFlowField() {
            const cols = 20;
            const rows = 20;
            const colSize = p.width / cols;
            const rowSize = p.height / rows;
            
            flowField = [];
            for (let i = 0; i < cols; i++) {
                flowField[i] = [];
                for (let j = 0; j < rows; j++) {
                    flowField[i][j] = p.random(p.TWO_PI);
                }
            }
        }
        
        function updateAndDraw() {
            if (artType === 'particles') {
                particles.forEach(particle => {
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    
                    // 边界检查
                    if (particle.x < 0 || particle.x > p.width) particle.vx *= -1;
                    if (particle.y < 0 || particle.y > p.height) particle.vy *= -1;
                    
                    // 绘制
                    p.fill(particle.color);
                    p.noStroke();
                    p.ellipse(particle.x, particle.y, particle.size);
                });
            } else if (artType === 'flow') {
                time += 0.01;
                
                p.stroke(108, 99, 255, 50);
                p.strokeWeight(1);
                
                for (let x = 0; x < p.width; x += 20) {
                    for (let y = 0; y < p.height; y += 20) {
                        const angle = p.noise(x * 0.01, y * 0.01, time) * p.TWO_PI * 2;
                        const length = 15;
                        const x2 = x + p.cos(angle) * length;
                        const y2 = y + p.sin(angle) * length;
                        
                        p.line(x, y, x2, y2);
                    }
                }
            }
        }
        
        p.windowResized = () => {
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            p.resizeCanvas(width, height);
            
            // 重新初始化
            switch(artType) {
                case 'particles':
                    initParticles();
                    break;
                case 'fractals':
                    drawFractalTree();
                    break;
                case 'noise':
                    drawNoiseArt();
                    break;
                case 'flow':
                    initFlowField();
                    break;
            }
        };
    };
    
    new p5(sketch, canvas);
}

// 初始化英雄区域画布
function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    
    const sketch = (p) => {
        let particles = [];
        let time = 0;
        
        p.setup = () => {
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            p.createCanvas(width, height);
            
            // 创建更多粒子
            for (let i = 0; i < 200; i++) {
                particles.push({
                    x: p.random(p.width),
                    y: p.random(p.height),
                    size: p.random(1, 4),
                    speed: p.random(0.5, 2),
                    color: p.color(
                        108 + p.random(50),
                        99 + p.random(50),
                        255
                    )
                });
            }
        };
        
        p.draw = () => {
            p.background(26, 26, 46, 10);
            time += 0.01;
            
            // 绘制连接线
            p.stroke(108, 99, 255, 30);
            p.strokeWeight(1);
            
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = p.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 80) {
                        p.line(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
                    }
                }
            }
            
            // 更新和绘制粒子
            particles.forEach(particle => {
                // 使用噪声创建流动运动
                const angle = p.noise(particle.x * 0.01, particle.y * 0.01, time) * p.TWO_PI * 2;
                particle.x += p.cos(angle) * particle.speed;
                particle.y += p.sin(angle) * particle.speed;
                
                // 边界环绕
                if (particle.x < 0) particle.x = p.width;
                if (particle.x > p.width) particle.x = 0;
                if (particle.y < 0) particle.y = p.height;
                if (particle.y > p.height) particle.y = 0;
                
                // 绘制粒子
                p.fill(particle.color);
                p.noStroke();
                p.ellipse(particle.x, particle.y, particle.size);
            });
        };
        
        p.windowResized = () => {
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            p.resizeCanvas(width, height);
        };
    };
    
    new p5(sketch, canvas);
}

// 初始化全屏查看器
let fullscreenSketch = null;
let currentArtType = null;

function initFullscreenViewer() {
    const closeBtn = document.getElementById('closeViewer');
    const pauseBtn = document.getElementById('pauseBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const saveBtn = document.getElementById('saveBtn');
    
    closeBtn.addEventListener('click', closeFullscreenViewer);
    pauseBtn.addEventListener('click', togglePause);
    refreshBtn.addEventListener('click', refreshArt);
    saveBtn.addEventListener('click', saveArtwork);
    
    // 控制面板事件
    document.getElementById('colorScheme').addEventListener('change', updateArtParameters);
    document.getElementById('speedControl').addEventListener('input', updateArtParameters);
    document.getElementById('densityControl').addEventListener('input', updateArtParameters);
    
    // ESC键关闭查看器
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeFullscreenViewer();
        }
    });
}

function openFullscreenViewer(artType, title) {
    const viewer = document.getElementById('fullscreenViewer');
    const titleElement = document.getElementById('viewerTitle');
    const canvas = document.getElementById('fullscreenCanvas');
    
    currentArtType = artType;
    titleElement.textContent = title;
    
    // 清空之前的画布
    canvas.innerHTML = '';
    
    // 显示查看器
    viewer.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // 创建新的p5实例
    fullscreenSketch = createFullscreenArt(canvas, artType);
}

function closeFullscreenViewer() {
    const viewer = document.getElementById('fullscreenViewer');
    viewer.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // 销毁p5实例
    if (fullscreenSketch) {
        fullscreenSketch.remove();
        fullscreenSketch = null;
    }
}

function createFullscreenArt(canvas, artType) {
    const sketch = (p) => {
        let particles = [];
        let flowField = [];
        let noiseScale = 0.01;
        let time = 0;
        let isPaused = false;
        let colorScheme = 'rainbow';
        let animationSpeed = 1;
        let particleDensity = 200;
        
        p.setup = () => {
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            p.createCanvas(width, height);
            
            initArt();
            
            // FPS显示
            setInterval(() => {
                document.getElementById('fps').textContent = Math.round(p.frameRate());
            }, 500);
        };
        
        p.draw = () => {
            if (isPaused) return;
            
            updateArt();
        };
        
        function initArt() {
            switch(artType) {
                case 'particles':
                    initParticleSystem();
                    break;
                case 'fractals':
                    initFractalSystem();
                    break;
                case 'noise':
                    initNoiseSystem();
                    break;
                case 'flow':
                    initFlowFieldSystem();
                    break;
            }
        }
        
        function initParticleSystem() {
            particles = [];
            const count = particleDensity;
            
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: p.random(p.width),
                    y: p.random(p.height),
                    vx: p.random(-2, 2),
                    vy: p.random(-2, 2),
                    size: p.random(1, 4),
                    life: 1.0,
                    decay: p.random(0.001, 0.005)
                });
            }
            
            p.background(0, 0, 0, 10);
        }
        
        function initFractalSystem() {
            p.background(26, 26, 46);
            drawComplexFractal();
        }
        
        function initNoiseSystem() {
            noiseScale = 0.005;
            time = 0;
        }
        
        function initFlowFieldSystem() {
            const cols = 50;
            const rows = Math.floor(cols * (p.height / p.width));
            const colSize = p.width / cols;
            const rowSize = p.height / rows;
            
            flowField = [];
            for (let i = 0; i < cols; i++) {
                flowField[i] = [];
                for (let j = 0; j < rows; j++) {
                    flowField[i][j] = p.random(p.TWO_PI);
                }
            }
        }
        
        function updateArt() {
            switch(artType) {
                case 'particles':
                    updateParticles();
                    break;
                case 'flow':
                    updateFlowField();
                    break;
                case 'noise':
                    updateNoiseArt();
                    break;
            }
        }
        
        function updateParticles() {
            p.background(0, 0, 0, 20);
            
            particles.forEach((particle, i) => {
                // 应用力场
                const angle = p.noise(particle.x * 0.01, particle.y * 0.01, time) * p.TWO_PI * 2;
                particle.vx += p.cos(angle) * 0.1;
                particle.vy += p.sin(angle) * 0.1;
                
                // 限制速度
                const speed = p.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                if (speed > 5) {
                    particle.vx = (particle.vx / speed) * 5;
                    particle.vy = (particle.vy / speed) * 5;
                }
                
                // 更新位置
                particle.x += particle.vx * animationSpeed;
                particle.y += particle.vy * animationSpeed;
                
                // 生命周期
                particle.life -= particle.decay;
                
                // 边界处理
                if (particle.x < 0 || particle.x > p.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > p.height) particle.vy *= -1;
                
                // 如果粒子死亡，重新生成
                if (particle.life <= 0) {
                    particles[i] = {
                        x: p.random(p.width),
                        y: p.random(p.height),
                        vx: p.random(-2, 2),
                        vy: p.random(-2, 2),
                        size: p.random(1, 4),
                        life: 1.0,
                        decay: p.random(0.001, 0.005)
                    };
                }
                
                // 绘制粒子
                const color = getColorByScheme(i);
                p.fill(color[0], color[1], color[2], particle.life * 255);
                p.noStroke();
                p.ellipse(particle.x, particle.y, particle.size);
            });
            
            time += 0.01 * animationSpeed;
        }
        
        function drawComplexFractal() {
            p.strokeWeight(1);
            p.noFill();
            
            const centerX = p.width / 2;
            const centerY = p.height / 2;
            
            for (let i = 0; i < 6; i++) {
                const angle = (p.TWO_PI / 6) * i + time * 0.1;
                const x = centerX + p.cos(angle) * 100;
                const y = centerY + p.sin(angle) * 100;
                
                p.push();
                p.translate(x, y);
                drawFractalBranch(80, 0, 0);
                p.pop();
            }
            
            time += 0.01 * animationSpeed;
            
            function drawFractalBranch(len, depth, rotation) {
                if (len < 2 || depth > 8) return;
                
                const color = getColorByScheme(depth);
                p.stroke(color[0], color[1], color[2]);
                
                p.line(0, 0, 0, -len);
                p.translate(0, -len);
                
                const newLen = len * 0.7;
                
                p.push();
                p.rotate(rotation + p.PI / 6);
                drawFractalBranch(newLen, depth + 1, rotation + 0.1);
                p.pop();
                
                p.push();
                p.rotate(rotation - p.PI / 6);
                drawFractalBranch(newLen, depth + 1, rotation - 0.1);
                p.pop();
                
                p.push();
                p.rotate(rotation + p.PI / 4);
                drawFractalBranch(newLen * 0.8, depth + 1, rotation + 0.2);
                p.pop();
            }
        }
        
        function updateFlowField() {
            p.background(26, 26, 46, 50);
            time += 0.01 * animationSpeed;
            
            const cellSize = 30;
            const cols = Math.floor(p.width / cellSize);
            const rows = Math.floor(p.height / cellSize);
            
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const x = i * cellSize;
                    const y = j * cellSize;
                    
                    // 计算噪声角度
                    const noiseVal = p.noise(x * noiseScale, y * noiseScale, time);
                    const angle = noiseVal * p.TWO_PI * 2;
                    
                    // 绘制流线
                    const color = getColorByScheme(i + j);
                    p.stroke(color[0], color[1], color[2], 150);
                    p.strokeWeight(1);
                    
                    const lineLength = cellSize * 0.8;
                    const x2 = x + p.cos(angle) * lineLength;
                    const y2 = y + p.sin(angle) * lineLength;
                    
                    p.line(x, y, x2, y2);
                    
                    // 绘制端点
                    p.fill(color[0], color[1], color[2]);
                    p.noStroke();
                    p.ellipse(x2, y2, 3);
                }
            }
        }
        
        function updateNoiseArt() {
            p.background(26, 26, 46, 10);
            time += 0.01 * animationSpeed;
            
            const cellSize = 15;
            
            for (let x = 0; x < p.width; x += cellSize) {
                for (let y = 0; y < p.height; y += cellSize) {
                    const noiseVal = p.noise(x * noiseScale, y * noiseScale, time);
                    const z = p.map(noiseVal, 0, 1, -50, 50);
                    
                    const screenX = x + p.cos(time + x * 0.01) * z * 0.1;
                    const screenY = y + p.sin(time + y * 0.01) * z * 0.1;
                    
                    const color = getColorByScheme(noiseVal * 100);
                    p.fill(color[0], color[1], color[2], 200);
                    p.noStroke();
                    
                    const size = p.map(z, -50, 50, 2, 10);
                    p.ellipse(screenX, screenY, size);
                }
            }
        }
        
        function getColorByScheme(index) {
            const t = (index % 100) / 100;
            
            switch(colorScheme) {
                case 'rainbow':
                    return [
                        p.map(p.sin(t * p.TWO_PI), -1, 1, 100, 255),
                        p.map(p.sin(t * p.TWO_PI + p.TWO_PI/3), -1, 1, 100, 255),
                        p.map(p.sin(t * p.TWO_PI + 2*p.TWO_PI/3), -1, 1, 100, 255)
                    ];
                case 'monochrome':
                    const val = 150 + p.sin(t * p.TWO_PI) * 50;
                    return [val, val, val];
                case 'pastel':
                    return [
                        150 + p.sin(t * p.TWO_PI) * 50,
                        180 + p.cos(t * p.TWO_PI) * 50,
                        200 + p.sin(t * p.TWO_PI + p.PI/2) * 50
                    ];
                case 'neon':
                    return [
                        100 + p.abs(p.sin(t * p.TWO_PI)) * 155,
                        50 + p.abs(p.cos(t * p.TWO_PI)) * 100,
                        200 + p.abs(p.sin(t * p.TWO_PI + p.PI/4)) * 55
                    ];
                default:
                    return [108, 99, 255];
            }
        }
        
        p.windowResized = () => {
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            p.resizeCanvas(width, height);
            initArt();
        };
        
        // 公开控制函数
        sketch.updateParameters = (params) => {
            if (params.colorScheme) colorScheme = params.colorScheme;
            if (params.animationSpeed) animationSpeed = params.animationSpeed;
            if (params.particleDensity) {
                particleDensity = params.particleDensity;
                if (artType === 'particles') {
                    initParticleSystem();
                }
            }
        };
        
        sketch.togglePause = () => {
            isPaused = !isPaused;
            return isPaused;
        };
        
        sketch.refresh = () => {
            initArt();
        };
        
        sketch.save = () => {
            p.saveCanvas('generative-art-' + artType + '-' + Date.now(), 'png');
        };
        
        return sketch;
    };
    
    const p5Instance = new p5(sketch, canvas);
    return p5Instance;
}

// 控制函数
function togglePause() {
    if (fullscreenSketch) {
        const isPaused = fullscreenSketch.togglePause();
        const icon = document.querySelector('#pauseBtn i');
        icon.className = isPaused ? 'fas fa-play' : 'fas fa-pause';
    }
}

function refreshArt() {
    if (fullscreenSketch) {
        fullscreenSketch.refresh();
    }
}

function saveArtwork() {
    if (fullscreenSketch) {
        fullscreenSketch.save();
    }
}

function updateArtParameters() {
    if (fullscreenSketch) {
        const params = {
            colorScheme: document.getElementById('colorScheme').value,
            animationSpeed: parseFloat(document.getElementById('speedControl').value),
            particleDensity: parseInt(document.getElementById('densityControl').value)
        };
        
        fullscreenSketch.updateParameters(params);
    }
}

// 窗口调整大小处理
window.addEventListener('resize', () => {
    // 这里可以添加响应式调整
});