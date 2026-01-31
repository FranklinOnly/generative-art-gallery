# 🎨 生成艺术画廊

一个使用算法和代码实时生成艺术作品的交互式网页画廊。所有艺术作品均在浏览器中实时渲染，每次刷新都会创造独一无二的视觉体验。

## ✨ 特色功能

- **四种生成艺术算法**：
  - 粒子流动场：物理模拟粒子在力场中的运动
  - 递归分形树：基于L-system的无限分形结构
  - 柏林噪声地形：使用Perlin噪声生成自然有机纹理
  - 向量流场：动态向量场引导的流体视觉

- **交互体验**：
  - 全屏查看模式
  - 实时参数调整
  - 作品保存功能
  - 明暗主题切换

- **技术特点**：
  - 100% 浏览器端渲染
  - 响应式设计
  - 无需后端服务器
  - 轻量级部署

## 🚀 快速部署

### 方法一：GitHub Pages（推荐）
1. Fork 此仓库
2. 进入仓库 Settings → Pages
3. 选择 Source 为 `main` 分支
4. 点击 Save，等待部署完成
5. 访问 `https://你的用户名.github.io/generative-art-gallery`

### 方法二：Vercel（更快速）
1. 访问 [vercel.com](https://vercel.com)
2. 导入此GitHub仓库
3. 无需配置，一键部署

### 方法三：Gitee Pages
1. 在Gitee导入此仓库
2. 进入「服务」→「Gitee Pages」
3. 选择部署分支，点击「启动」
4. 访问生成的链接

## 🛠️ 本地运行

```bash
# 克隆项目
git clone https://github.com/你的用户名/generative-art-gallery.git

# 进入目录
cd generative-art-gallery

# 使用本地服务器运行（需要Python）
python -m http.server 8000

# 或在VS Code中使用Live Server插件
# 然后访问 http://localhost:8000