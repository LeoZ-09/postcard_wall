# Lighthouse 性能测试指南

## 测试准备

### 1. 安装 Lighthouse

```bash
# 使用 npm 安装
npm install -g lighthouse

# 或使用 Chrome 开发者工具
# 打开 Chrome → F12 → Lighthouse 标签
```

### 2. 准备测试环境

确保本地开发服务器运行:
```bash
cd c:\Users\Leo\Desktop\Postcard_Wall
npm run dev
```

访问地址: `http://localhost:5173`

## 运行测试

### 方法 1: Chrome 开发者工具

1. 打开 Chrome 浏览器
2. 访问 `http://localhost:5173`
3. 按 F12 打开开发者工具
4. 切换到 **Lighthouse** 标签
5. 选择测试类型:
   - **Navigation** (默认) - 完整页面加载测试
   - 选择 **Mobile** 或 **Desktop**
6. 点击 **Analyze page load**
7. 等待测试完成，查看报告

### 方法 2: 命令行

```bash
# 桌面端测试
lighthouse http://localhost:5173 \
  --output html \
  --output-path ./lighthouse-report-desktop.html \
  --preset desktop

# 移动端测试
lighthouse http://localhost:5173 \
  --output html \
  --output-path ./lighthouse-report-mobile.html \
  --preset perf

# 完整报告 (所有类别)
lighthouse http://localhost:5173 \
  --output html \
  --output-path ./lighthouse-report-full.html
```

### 方法 3: Node.js 脚本

```javascript
// lighthouse-test.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runLighthouse() {
  const chrome = await chromeLauncher.launch();
  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port
  };

  const report = await lighthouse('http://localhost:5173', options);
  require('fs').writeFileSync(
    './lighthouse-report.html',
    report.report
  );

  await chrome.kill();
}

runLighthouse();
```

运行: `node lighthouse-test.js`

## 评分标准

### Performance (性能)

| 分数 | 等级 | 颜色 | 说明 |
|------|------|------|------|
| 90-100 | 绿色 | #0c0 | 快速 |
| 50-89 | 橙色 | #fa0 | 需要改进 |
| 0-49 | 红色 | #f00 | 慢 |

**核心指标目标**

| 指标 | 目标 | 优化方法 |
|------|------|----------|
| FCP (First Contentful Paint) | < 1.8s | 关键CSS内联、预加载字体 |
| LCP (Largest Contentful Paint) | < 2.5s | 优化图片、CDN |
| TBT (Total Blocking Time) | < 200ms | 代码分割、减少长任务 |
| CLS (Cumulative Layout Shift) | < 0.1 | 图片尺寸、字体加载策略 |
| SI (Speed Index) | < 3.4s | 优化渲染路径 |

### Accessibility (可访问性)

**目标分数: ≥ 90**

常见检查项:
- 图片必须有 alt 属性
- 按钮和链接必须有可访问的名称
- 颜色对比度需符合 WCAG 2.1 AA 标准
- 表单元素必须有关联的标签
- 页面必须有 lang 属性

### Best Practices (最佳实践)

**目标分数: ≥ 90**

检查项:
- HTTPS 使用
- 没有有效的 console 错误
- 图片宽高比正确
- 不使用已弃用的 API
- 遵循现代 Web 最佳实践

### SEO

**目标分数: ≥ 90**

检查项:
- 文档有标题
- 文档有 meta 描述
- 链接有描述性文本
- 爬虫可以抓取页面
- 移动设备友好

## 性能优化清单

### 1. 图片优化

```css
/* 使用懒加载 */
img {
  loading: lazy;
}

/* 保持宽高比 */
.postcard-images {
  aspect-ratio: 4 / 3;
}

/* 使用 object-fit 避免布局偏移 */
.postcard-image {
  object-fit: cover;
}
```

### 2. 动画性能

```css
/* 使用 transform 和 opacity */
.postcard-card {
  will-change: transform, opacity;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.postcard-card:hover {
  transform: scale(1.05);
}

/* 禁用动画的用户偏好 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 3. 字体优化

```html
<!-- 预连接字体服务 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- 预加载字体 -->
<link rel="preload" href="/fonts/custom-font.woff2" as="font" type="font/woff2" crossorigin>
```

### 4. CSS 优化

```css
/* 关键CSS内联 */
<style>
  .header { /* 首屏关键样式 */ }
  .hero { /* 首屏关键样式 */ }
</style>

/* 非关键CSS异步加载 */
<link rel="preload" href="/styles/non-critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/styles/non-critical.css"></noscript>
```

### 5. JavaScript 优化

```javascript
// 代码分割
const PostcardCard = React.lazy(() => import('./components/PostcardCard'));

// 事件节流
const handleScroll = throttle(() => {
  // 滚动处理逻辑
}, 150);

// IntersectionObserver 懒加载
const observer = new IntersectionObserver(
  ([entry]) => {
    if (entry.isIntersecting) {
      loadMoreContent();
      observer.disconnect();
    }
  },
  { threshold: 0.1 }
);
```

## 常见问题修复

### 问题 1: LCP 超过 2.5s

**原因**: 大图片未优化
**解决**:
1. 使用现代图片格式 (WebP, AVIF)
2. 实现图片懒加载
3. 使用 CDN 加速
4. 添加图片预加载

### 问题 2: CLS 超过 0.1

**原因**: 图片加载导致布局偏移
**解决**:
1. 为所有图片设置宽高比
2. 使用 `aspect-ratio` CSS 属性
3. 字体加载使用 `font-display: swap`

### 问题 3: TBT 超过 200ms

**原因**: 主线程被阻塞
**解决**:
1. 代码分割
2. 减少第三方脚本
3. 使用 Web Worker 处理计算密集任务

### 问题 4: FCP 超过 1.8s

**原因**: CSS/JS 阻塞渲染
**解决**:
1. 关键CSS内联
2. 延迟加载非关键JS
3. 预加载关键资源

## 测试脚本

创建自动化测试脚本 `test-performance.js`:

```javascript
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

const TARGET_URL = 'http://localhost:5173';
const MOBILE_CONFIG = {
  onlyCategories: ['performance'],
  throttlingMethod: 'simulate',
  throttling: {
    rttMs: 150,
    throughputKbps: 1.6 * 1024,
    cpuSlowdownMultiplier: 4
  }
};

async function testPerformance() {
  console.log('启动 Chrome...');
  const chrome = await chromeLauncher.launch();
  console.log('运行 Lighthouse 测试...');

  const result = await lighthouse(TARGET_URL, {
    ...MOBILE_CONFIG,
    port: chrome.port
  });

  const { performance, accessibility, bestPractices, seo } = result.categories;

  console.log('\n========== Lighthouse 报告 ==========');
  console.log(`性能得分: ${performance.score * 100}`);
  console.log(`可访问性: ${accessibility.score * 100}`);
  console.log(`最佳实践: ${bestPractices.score * 100}`);
  console.log(`SEO: ${seo.score * 100}`);
  console.log('=====================================\n');

  if (performance.score >= 0.9) {
    console.log('✅ 性能测试通过!');
  } else {
    console.log('❌ 性能测试未达标，需要优化');
  }

  await chrome.kill();
  process.exit(performance.score >= 0.9 ? 0 : 1);
}

testPerformance().catch(console.error);
```

运行: `node test-performance.js`

## 持续集成

### GitHub Actions 配置

创建 `.github/workflows/lighthouse.yml`:

```yaml
name: Lighthouse CI

on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Run dev server
        run: npm run dev &

      - name: Wait for server
        run: sleep 5

      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: http://localhost:5173
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true
```

创建 `lighthouse-budget.json`:

```json
{
  "ci": {
    "collect": {
      "settings": {
        "staticDistDir": "./dist"
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "first-contentful-paint": ["warn", { "maxNumericValue": 1800 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }]
      }
    }
  }
}
```

## 报告解读

### Performance 详情

1. **Metrics**: 核心Web指标实测值
2. **Opportunities**: 可优化的性能问题
3. **Diagnostics**: 性能诊断信息
4. **Passed audits**: 通过的审计项

### 重点关注

1. **Render-blocking resources**: 阻塞渲染的资源
2. **Unused JavaScript**: 未使用的JS代码
3. **Properly sized images**: 未适当调整大小的图片
4. **Next-gen formats**: 可使用现代图片格式
