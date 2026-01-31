// 流场艺术生成器
class FlowFieldArt {
    constructor(p) {
        this.p = p;
        this.field = [];
        this.particles = [];
        this.resolution = 20;
        this.zOffset = 0;
        this.cols = 0;
        this.rows = 0;
        this.noiseScale = 0.05;
        this.strength = 1.0;
    }

    setup(width, height, particleCount = 200) {
        this.cols = Math.floor(width / this.resolution);
        this.rows = Math.floor(height / this.resolution);
        
        // 初始化向量场
        this.field = new Array(this.cols);
        for (let i = 0; i < this.cols; i++) {
            this.field[i] = new Array(this.rows);
            for (let j = 0; j < this.rows; j++) {
                const angle = this.p.noise(i * this.noiseScale, j * this.noiseScale) * this.p.TWO_PI * 2;
                this.field[i][j] = this.p.createVector(
                    this.p.cos(angle) * this.strength,
                    this.p.sin(angle) * this.strength
                );
            }
        }
        
        // 初始化粒子
        this.particles = [];
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                pos: this.p.createVector(
                    this.p.random(width),
                    this.p.random(height)
                ),
                vel: this.p.createVector(0, 0),
                acc: this.p.createVector(0, 0),
                maxSpeed: this.p.random(2, 6),
                color: this.p.color(
                    this.p.random(100, 255),
                    this.p.random(100, 200),
                    255,
                    150
                ),
                size: this.p.random(1, 3),
                prevPos: null
            });
        }
    }

    update(width, height, speed = 1.0) {
        // 更新向量场
        this.zOffset += 0.01 * speed;
        
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                const angle = this.p.noise(
                    i * this.noiseScale, 
                    j * this.noiseScale, 
                    this.zOffset
                ) * this.p.TWO_PI * 2;
                
                this.field[i][j].set(
                    this.p.cos(angle) * this.strength,
                    this.p.sin(angle) * this.strength
                );
            }
        }
        
        // 更新粒子
        this.particles.forEach(particle => {
            // 保存上一帧位置用于绘制轨迹
            particle.prevPos = particle.pos.copy();
            
            // 根据当前位置获取场向量
            const xIndex = Math.floor(particle.pos.x / this.resolution);
            const yIndex = Math.floor(particle.pos.y / this.resolution);
            
            if (xIndex >= 0 && xIndex < this.cols && yIndex >= 0 && yIndex < this.rows) {
                const force = this.field[xIndex][yIndex];
                particle.acc.add(force);
            }
            
            // 应用加速度
            particle.vel.add(particle.acc);
            particle.vel.limit(particle.maxSpeed);
            particle.pos.add(particle.vel);
            
            // 重置加速度
            particle.acc.mult(0);
            
            // 添加一些随机扰动
            particle.vel.add(this.p5.Vector.random2D().mult(0.1));
            
            // 边界处理：环绕
            if (particle.pos.x < 0) particle.pos.x = width;
            if (particle.pos.x > width) particle.pos.x = 0;
            if (particle.pos.y < 0) particle.pos.y = height;
            if (particle.pos.y > height) particle.pos.y = 0;
        });
    }

    draw(showField = false) {
        if (showField) {
            // 绘制向量场网格
            for (let i = 0; i < this.cols; i++) {
                for (let j = 0; j < this.rows; j++) {
                    const x = i * this.resolution;
                    const y = j * this.resolution;
                    const v = this.field[i][j];
                    
                    this.p.stroke(255, 100);
                    this.p.strokeWeight(1);
                    this.p.push();
                    this.p.translate(x + this.resolution/2, y + this.resolution/2);
                    this.p.rotate(v.heading());
                    this.p.line(0, 0, this.resolution * 0.4, 0);
                    this.p.translate(this.resolution * 0.4, 0);
                    this.p.triangle(0, 0, -5, 2, -5, -2);
                    this.p.pop();
                }
            }
        }
        
        // 绘制粒子轨迹
        this.particles.forEach(particle => {
            if (particle.prevPos) {
                this.p.stroke(
                    this.p.red(particle.color),
                    this.p.green(particle.color),
                    this.p.blue(particle.color),
                    80
                );
                this.p.strokeWeight(particle.size * 0.8);
                this.p.line(
                    particle.prevPos.x, 
                    particle.prevPos.y,
                    particle.pos.x, 
                    particle.pos.y
                );
            }
            
            // 绘制粒子头部
            this.p.fill(particle.color);
            this.p.noStroke();
            this.p.ellipse(particle.pos.x, particle.pos.y, particle.size);
        });
    }

    drawFlowLines(width, height, lineCount = 50) {
        // 另一种绘制方式：直接绘制流线
        for (let i = 0; i < lineCount; i++) {
            let x = this.p.random(width);
            let y = this.p.random(height);
            
            this.p.beginShape();
            this.p.noFill();
            
            const hue = this.p.map(i, 0, lineCount, 0, 255);
            this.p.stroke(hue, 200, 255, 100);
            this.p.strokeWeight(1.5);
            
            // 沿着场绘制一条曲线
            for (let step = 0; step < 100; step++) {
                this.p.vertex(x, y);
                
                const xIndex = Math.floor(x / this.resolution);
                const yIndex = Math.floor(y / this.resolution);
                
                if (xIndex >= 0 && xIndex < this.cols && yIndex >= 0 && yIndex < this.rows) {
                    const v = this.field[xIndex][yIndex];
                    x += v.x * 2;
                    y += v.y * 2;
                } else {
                    break;
                }
                
                // 如果出界则停止
                if (x < 0 || x > width || y < 0 || y > height) break;
            }
            
            this.p.endShape();
        }
    }

    reset(width, height, particleCount) {
        this.setup(width, height, particleCount);
    }

    setNoiseScale(scale) {
        this.noiseScale = scale;
    }

    setStrength(strength) {
        this.strength = strength;
    }
}