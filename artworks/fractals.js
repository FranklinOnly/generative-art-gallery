// 分形生成器
class FractalGenerator {
    constructor(p) {
        this.p = p;
        this.angle = this.p.PI / 6;
        this.branchLength = 100;
        this.depth = 8;
        this.time = 0;
        this.colorMode = 'rainbow';
    }

    drawFractalTree(x, y, length, angle, depth, maxDepth) {
        if (depth > maxDepth || length < 2) return;
        
        const x2 = x + this.p.cos(angle) * length;
        const y2 = y + this.p.sin(angle) * length;
        
        // 根据深度计算颜色和线宽
        const color = this.getColor(depth, maxDepth);
        const weight = this.p.map(length, 2, this.branchLength, 1, 4);
        
        this.p.stroke(color);
        this.p.strokeWeight(weight);
        this.p.line(x, y, x2, y2);
        
        // 递归绘制分支
        const newLength = length * 0.67;
        const angleVariation = this.p.sin(this.time + depth * 0.5) * 0.2;
        
        // 左右分支
        this.drawFractalTree(x2, y2, newLength, angle - this.angle + angleVariation, depth + 1, maxDepth);
        this.drawFractalTree(x2, y2, newLength, angle + this.angle - angleVariation, depth + 1, maxDepth);
        
        // 偶尔绘制中间分支
        if (this.p.random() < 0.3 && depth < maxDepth - 2) {
            this.drawFractalTree(x2, y2, newLength * 0.8, angle + angleVariation * 0.5, depth + 1, maxDepth);
        }
    }

    drawKochSnowflake(x, y, size, iterations) {
        // 绘制科赫雪花
        const points = [];
        for (let i = 0; i < 3; i++) {
            const angle = i * this.p.TWO_PI / 3 - this.p.PI / 6;
            points.push({
                x: x + this.p.cos(angle) * size,
                y: y + this.p.sin(angle) * size
            });
        }
        
        this.generateKochCurve(points[0], points[1], iterations);
        this.generateKochCurve(points[1], points[2], iterations);
        this.generateKochCurve(points[2], points[0], iterations);
    }

    generateKochCurve(p1, p2, depth) {
        if (depth === 0) {
            const color = this.getColor(depth, 5);
            this.p.stroke(color);
            this.p.strokeWeight(1);
            this.p.line(p1.x, p1.y, p2.x, p2.y);
            return;
        }
        
        // 计算科赫曲线的四个点
        const delta = { x: p2.x - p1.x, y: p2.y - p1.y };
        
        const a = { x: p1.x, y: p1.y };
        const b = { 
            x: p1.x + delta.x / 3, 
            y: p1.y + delta.y / 3 
        };
        const d = { 
            x: p1.x + delta.x * 2 / 3, 
            y: p1.y + delta.y * 2 / 3 
        };
        const e = { x: p2.x, y: p2.y };
        
        // 计算凸起的顶点
        const c = {
            x: (p1.x + p2.x) / 2 - (delta.y * Math.sqrt(3) / 6),
            y: (p1.y + p2.y) / 2 + (delta.x * Math.sqrt(3) / 6)
        };
        
        // 递归调用
        this.generateKochCurve(a, b, depth - 1);
        this.generateKochCurve(b, c, depth - 1);
        this.generateKochCurve(c, d, depth - 1);
        this.generateKochCurve(d, e, depth - 1);
    }

    drawMandelbrot(width, height) {
        // 简化版的曼德勃罗集可视化
        const maxIterations = 50;
        const zoom = 3.5;
        const offsetX = -0.7;
        const offsetY = 0;
        
        for (let x = 0; x < width; x += 2) {
            for (let y = 0; y < height; y += 2) {
                const zx = (x - width / 2) / (0.5 * zoom * width) + offsetX;
                const zy = (y - height / 2) / (0.5 * zoom * height) + offsetY;
                
                let zx0 = zx;
                let zy0 = zy;
                let iteration = 0;
                
                while (zx0 * zx0 + zy0 * zy0 < 4 && iteration < maxIterations) {
                    const xtemp = zx0 * zx0 - zy0 * zy0 + zx;
                    zy0 = 2 * zx0 * zy0 + zy;
                    zx0 = xtemp;
                    iteration++;
                }
                
                if (iteration < maxIterations) {
                    const color = this.p.map(iteration, 0, maxIterations, 0, 255);
                    this.p.stroke(color, color * 0.8, 255 - color, 100);
                    this.p.strokeWeight(1);
                    this.p.point(x, y);
                }
            }
        }
    }

    getColor(depth, maxDepth) {
        const t = depth / maxDepth;
        
        switch(this.colorMode) {
            case 'rainbow':
                const r = this.p.sin(t * this.p.PI) * 255;
                const g = this.p.sin(t * this.p.PI + this.p.TWO_PI/3) * 255;
                const b = this.p.sin(t * this.p.PI + 2*this.p.TWO_PI/3) * 255;
                return this.p.color(r, g, b);
                
            case 'monochrome':
                const val = 100 + t * 155;
                return this.p.color(val);
                
            case 'gradient':
                return this.p.lerpColor(
                    this.p.color(108, 99, 255),
                    this.p.color(36, 209, 220),
                    t
                );
                
            default:
                return this.p.color(108, 99, 255);
        }
    }

    update() {
        this.time += 0.02;
        // 轻微摆动角度，增加动态感
        this.angle = this.p.PI / 6 + this.p.sin(this.time * 0.5) * 0.1;
    }
}