// 柏林噪声艺术生成器
class NoiseArt {
    constructor(p) {
        this.p = p;
        this.zOffset = 0;
        this.noiseScale = 0.02;
        this.colors = [];
        this.paletteType = 'rainbow';
        this.initPalette();
    }

    initPalette() {
        // 初始化颜色调色板
        this.colors = [
            this.p.color(108, 99, 255),   // 紫色
            this.p.color(36, 209, 220),   // 青色
            this.p.color(255, 101, 132),  // 粉色
            this.p.color(255, 203, 107),  // 黄色
            this.p.color(123, 237, 159)   // 绿色
        ];
    }

    setPalette(type) {
        this.paletteType = type;
        this.colors = [];
        
        switch(type) {
            case 'rainbow':
                for (let i = 0; i < 5; i++) {
                    const hue = (i / 5) * 255;
                    this.colors.push(this.p.color(
                        this.p.map(this.p.sin(this.p.PI * i/5), -1, 1, 100, 255),
                        this.p.map(this.p.sin(this.p.PI * i/5 + this.p.PI/2), -1, 1, 100, 255),
                        this.p.map(this.p.sin(this.p.PI * i/5 + this.p.PI), -1, 1, 100, 255)
                    ));
                }
                break;
                
            case 'ocean':
                this.colors = [
                    this.p.color(10, 30, 100),
                    this.p.color(20, 80, 150),
                    this.p.color(40, 150, 200),
                    this.p.color(100, 200, 255),
                    this.p.color(200, 230, 255)
                ];
                break;
                
            case 'fire':
                this.colors = [
                    this.p.color(255, 50, 10),
                    this.p.color(255, 100, 30),
                    this.p.color(255, 150, 50),
                    this.p.color(255, 200, 100),
                    this.p.color(255, 230, 150)
                ];
                break;
                
            default:
                this.initPalette();
        }
    }

    drawTerrain(width, height) {
        // 绘制3D地形图
        const gridSize = 15;
        const cols = Math.floor(width / gridSize);
        const rows = Math.floor(height / gridSize);
        
        this.p.noStroke();
        
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const x = i * gridSize;
                const y = j * gridSize;
                
                // 使用噪声获取高度
                const noiseVal = this.p.noise(
                    x * this.noiseScale,
                    y * this.noiseScale,
                    this.zOffset
                );
                
                // 根据高度计算颜色
                const colorIndex = Math.floor(noiseVal * (this.colors.length - 1));
                const nextColorIndex = Math.min(colorIndex + 1, this.colors.length - 1);
                const lerpAmt = (noiseVal * (this.colors.length - 1)) - colorIndex;
                
                const color = this.lerpColor(
                    this.colors[colorIndex],
                    this.colors[nextColorIndex],
                    lerpAmt
                );
                
                // 计算高度（Z值）
                const z = this.p.map(noiseVal, 0, 1, -gridSize * 3, gridSize * 3);
                
                // 绘制矩形
                this.p.fill(color);
                this.p.push();
                this.p.translate(x + gridSize/2, y + gridSize/2, z/2);
                this.p.box(gridSize - 1, gridSize - 1, z);
                this.p.pop();
            }
        }
        
        this.zOffset += 0.01;
    }

    drawClouds(width, height) {
        // 绘制噪声云
        this.p.background(26, 26, 46, 10);
        
        for (let i = 0; i < 1000; i++) {
            const x = this.p.random(width);
            const y = this.p.random(height);
            
            // 使用噪声决定透明度和大小
            const noiseVal = this.p.noise(
                x * this.noiseScale * 2,
                y * this.noiseScale * 2,
                this.zOffset
            );
            
            const size = this.p.map(noiseVal, 0, 1, 5, 30);
            const alpha = this.p.map(noiseVal, 0, 1, 50, 200);
            
            // 根据噪声值选择颜色
            const colorIndex = Math.floor(noiseVal * (this.colors.length - 1));
            const color = this.colors[colorIndex];
            
            this.p.fill(
                this.p.red(color),
                this.p.green(color),
                this.p.blue(color),
                alpha
            );
            this.p.noStroke();
            this.p.ellipse(x, y, size);
        }
        
        this.zOffset += 0.005;
    }

    drawMarble(width, height) {
        // 绘制大理石纹理
        const gridSize = 3;
        
        for (let x = 0; x < width; x += gridSize) {
            for (let y = 0; y < height; y += gridSize) {
                // 多层噪声叠加创造复杂纹理
                let noiseVal = 0;
                let scale = this.noiseScale;
                let amplitude = 1;
                let maxAmplitude = 0;
                
                // 八度噪声（Octave Noise）
                for (let octave = 0; octave < 4; octave++) {
                    noiseVal += this.p.noise(x * scale, y * scale, this.zOffset) * amplitude;
                    maxAmplitude += amplitude;
                    amplitude *= 0.5;
                    scale *= 2;
                }
                
                noiseVal /= maxAmplitude;
                
                // 应用正弦函数创造条纹效果
                const pattern = (this.p.sin(noiseVal * this.p.PI * 4) + 1) * 0.5;
                
                // 计算颜色
                const colorVal = this.p.map(pattern, 0, 1, 50, 255);
                this.p.stroke(colorVal, colorVal * 0.9, colorVal * 1.1);
                this.p.strokeWeight(gridSize);
                this.p.point(x, y);
            }
        }
        
        this.zOffset += 0.001;
    }

    drawOrganicPattern(width, height) {
        // 绘制有机生物形态图案
        this.p.background(26, 26, 46, 30);
        
        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.min(width, height) * 0.4;
        
        this.p.noFill();
        
        for (let radius = 10; radius < maxRadius; radius += 5) {
            this.p.beginShape();
            
            for (let angle = 0; angle < this.p.TWO_PI; angle += 0.1) {
                // 使用噪声扰动半径
                const noiseX = centerX + this.p.cos(angle) * radius;
                const noiseY = centerY + this.p.sin(angle) * radius;
                
                const noiseVal = this.p.noise(
                    noiseX * this.noiseScale,
                    noiseY * this.noiseScale,
                    this.zOffset + radius * 0.001
                );
                
                const distortion = this.p.map(noiseVal, 0, 1, 0.8, 1.2);
                const x = centerX + this.p.cos(angle) * radius * distortion;
                const y = centerY + this.p.sin(angle) * radius * distortion;
                
                // 计算顶点颜色
                const colorAngle = angle + this.zOffset;
                const hue = this.p.map(this.p.sin(colorAngle), -1, 1, 0, 255);
                this.p.stroke(hue, 200, 255, 100);
                this.p.strokeWeight(1.5);
                
                this.p.vertex(x, y);
            }
            
            this.p.endShape(this.p.CLOSE);
        }
        
        this.zOffset += 0.01;
    }

    lerpColor(c1, c2, amt) {
        const r = this.p.lerp(this.p.red(c1), this.p.red(c2), amt);
        const g = this.p.lerp(this.p.green(c1), this.p.green(c2), amt);
        const b = this.p.lerp(this.p.blue(c1), this.p.blue(c2), amt);
        return this.p.color(r, g, b);
    }

    update() {
        this.zOffset += 0.005;
    }

    setNoiseScale(scale) {
        this.noiseScale = scale;
    }
}