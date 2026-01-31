// 粒子系统核心类
class ParticleSystem {
    constructor(p) {
        this.p = p; // p5实例
        this.particles = [];
        this.flowField = [];
        this.fieldResolution = 20;
        this.zOffset = 0;
        this.colorPalette = [];
        this.initColorPalette();
    }

    initColorPalette() {
        // 预定义一组协调的颜色
        this.colorPalette = [
            this.p.color(108, 99, 255),   // 主色调紫
            this.p.color(255, 101, 132), // 粉色
            this.p.color(36, 209, 220),  // 青色
            this.p.color(255, 203, 107), // 黄色
            this.p.color(123, 237, 159)  // 绿色
        ];
    }

    setup(width, height, particleCount = 300) {
        // 初始化流场
        this.initFlowField(width, height);
        
        // 创建粒子
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: this.p.random(width),
                y: this.p.random(height),
                vx: 0,
                vy: 0,
                px: 0, // 上一帧位置
                py: 0,
                life: 1.0,
                maxSpeed: this.p.random(2, 6),
                color: this.colorPalette[Math.floor(this.p.random(this.colorPalette.length))],
                size: this.p.random(1.5, 4),
                decay: this.p.random(0.0005, 0.002)
            });
        }
    }

    initFlowField(width, height) {
        const cols = Math.floor(width / this.fieldResolution);
        const rows = Math.floor(height / this.fieldResolution);
        
        this.flowField = new Array(cols);
        for (let i = 0; i < cols; i++) {
            this.flowField[i] = new Array(rows);
            for (let j = 0; j < rows; j++) {
                // 使用柏林噪声生成平滑的角度
                const angle = this.p.noise(i * 0.1, j * 0.1) * this.p.TWO_PI * 2;
                this.flowField[i][j] = this.p.createVector(
                    this.p.cos(angle),
                    this.p.sin(angle)
                );
            }
        }
    }

    update(width, height, speed = 1.0) {
        this.zOffset += 0.01 * speed;
        
        // 更新流场
        const cols = this.flowField.length;
        const rows = this.flowField[0].length;
        
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const angle = this.p.noise(i * 0.1, j * 0.1, this.zOffset) * this.p.TWO_PI * 2;
                this.flowField[i][j].set(this.p.cos(angle), this.p.sin(angle));
            }
        }
        
        // 更新粒子
        this.particles.forEach(particle => {
            // 保存上一帧位置用于绘制轨迹
            particle.px = particle.x;
            particle.py = particle.y;
            
            // 根据流场计算力
            const fieldX = Math.floor(particle.x / this.fieldResolution);
            const fieldY = Math.floor(particle.y / this.fieldResolution);
            
            if (fieldX >= 0 && fieldX < cols && fieldY >= 0 && fieldY < rows) {
                const force = this.flowField[fieldX][fieldY];
                particle.vx += force.x * 0.2;
                particle.vy += force.y * 0.2;
            }
            
            // 限制最大速度
            const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
            if (speed > particle.maxSpeed) {
                particle.vx = (particle.vx / speed) * particle.maxSpeed;
                particle.vy = (particle.vy / speed) * particle.maxSpeed;
            }
            
            // 应用速度
            particle.x += particle.vx * speed;
            particle.y += particle.vy * speed;
            
            // 添加一些随机性
            particle.vx += this.p.random(-0.1, 0.1);
            particle.vy += this.p.random(-0.1, 0.1);
            
            // 应用阻尼
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            
            // 边界处理：环绕
            if (particle.x < 0) particle.x = width;
            if (particle.x > width) particle.x = 0;
            if (particle.y < 0) particle.y = height;
            if (particle.y > height) particle.y = 0;
            
            // 生命周期
            particle.life -= particle.decay;
            if (particle.life <= 0) {
                particle.x = this.p.random(width);
                particle.y = this.p.random(height);
                particle.life = 1.0;
                particle.vx = particle.vy = 0;
            }
        });
    }

    draw() {
        this.particles.forEach(particle => {
            // 根据生命周期设置透明度
            const alpha = particle.life * 255;
            this.p.stroke(
                this.p.red(particle.color),
                this.p.green(particle.color),
                this.p.blue(particle.color),
                alpha * 0.6
            );
            this.p.strokeWeight(particle.size * 0.8);
            
            // 绘制从上一帧到当前帧的线条
            this.p.line(particle.px, particle.py, particle.x, particle.y);
            
            // 绘制粒子头部
            this.p.fill(
                this.p.red(particle.color),
                this.p.green(particle.color),
                this.p.blue(particle.color),
                alpha
            );
            this.p.noStroke();
            this.p.ellipse(particle.x, particle.y, particle.size);
        });
    }

    reset(width, height, count) {
        this.particles = [];
        this.setup(width, height, count);
    }
}