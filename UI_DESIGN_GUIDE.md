# 明信片墙 UI 设计规范

## 设计概述

明信片墙是一个简约风格的电子明信片展示平台，采用极简设计语言，以内容（明信片图片）为核心，将80%以上的可视区域用于明信片展示。

## 设计系统

### 色彩系统

**主色调 (3色)**

| 名称 | 色值 | 用途 |
|------|------|------|
| 白色 | `#FFFFFF` | 卡片背景、悬停状态 |
| 浅灰 | `#F5F5F5` | 页面背景 |
| 深灰 | `#333333` | 主按钮、标题文字 |

**辅助色**

| 名称 | 色值 | 用途 |
|------|------|------|
| 状态-待寄出 | `#F5F5F5` 背景 + `#737373` 文字 | pending状态 |
| 状态-运输中 | `#FEF3C7` 背景 + `#92400E` 文字 | sent状态 |
| 状态-已送达 | `#D1FAE5` 背景 + `#065F46` 文字 | delivered状态 |
| 边框 | `#E5E5E5` | 分割线、边框 |
| 次级文字 | `#737373` | 次级信息 |
| 占位背景 | `#FAFAFA` | 图片占位 |

### 字体系统

**字体族**

```
-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif
```

**字号**

| 名称 | 大小 | 行高 | 用途 |
|------|------|------|------|
| h1 | 24px / 1.5rem | 1.2 | 页面主标题 |
| h2 | 18px / 1.125rem | 1.3 | 区块标题 |
| h3 | 16px / 1rem | 1.4 | 卡片标题 |
| body | 14px / 0.875rem | 1.5 | 正文 |
| small | 13px / 0.8125rem | 1.4 | 辅助信息 |
| caption | 11px / 0.6875rem | 1.3 | 标签、徽章 |

**字重**

- 标题: 600 (Semi Bold)
- 正文: 400 (Regular)
- 按钮: 500 (Medium)

### 间距系统

**基础单位**: 4px

| 名称 | 大小 | 用途 |
|------|------|------|
| xs | 4px | 紧凑间距 |
| sm | 8px | 小间距 |
| md | 12px | 中间距 |
| lg | 16px | 大间距 |
| xl | 24px | 区块间距 |
| 2xl | 32px | 区域间距 |

**卡片间距**: 24px
**页面边距**: 24px (桌面) / 16px (平板) / 12px (手机)

### 圆角系统

**统一圆角**: 8px

应用于：卡片、按钮、输入框、模态框

### 阴影系统

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow: 0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06);
--shadow-md: 0 8px 24px -4px rgb(0 0 0 / 0.1), 0 4px 8px -4px rgb(0 0 0 / 0.06);
--shadow-lg: 0 16px 40px -8px rgb(0 0 0 / 0.12), 0 8px 16px -8px rgb(0 0 0 / 0.08);
--shadow-xl: 0 24px 60px -12px rgb(0 0 0 / 0.15), 0 12px 24px -12px rgb(0 0 0 / 0.1);
```

**悬停阴影**:
```css
box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15),
            0 8px 16px -8px rgba(0, 0, 0, 0.1);
```

### 动效系统

**缓动函数**

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
```

**动画**

1. **卡片悬停放大**
   - Transform: scale(1.05)
   - Duration: 300ms
   - Easing: ease-out-expo
   - 同时应用阴影增强

2. **页面加载淡入**
   - 初始状态: opacity 0, translateY 30px
   - 最终状态: opacity 1, translateY 0
   - Duration: 500ms
   - Easing: ease-out-expo
   - 每个卡片延迟: 150ms (index * 150)

3. **滚动视差进入**
   - 使用 IntersectionObserver
   - threshold: 0.1
   - rootMargin: 50px
   - 触发时添加 visible 类执行动画

## 布局规范

### 响应式断点

| 名称 | 宽度 | 列数 | 间距 |
|------|------|------|------|
| 手机 | < 480px | 1列 | 12px |
| 平板竖屏 | 480-900px | 2列 | 16px |
| 平板横屏 | 900-1024px | 3列 | 24px |
| 桌面 | 1024-1280px | 4列 | 24px |
| 大桌面 | > 1280px | 5列 | 24px |

### 页面结构

```
┌─────────────────────────────────────────────┐
│ Header (64px)                               │
│ ┌─────────────────────────────────────────┐ │
│ │ Logo          Nav Links                  │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ Hero Section (紧凑, 仅标题+按钮)            │
├─────────────────────────────────────────────┤
│ Stats Bar (紧凑, 水平排列)                  │
├─────────────────────────────────────────────┤
│                                             │
│  明信片网格 (占满剩余空间, 80%+ 可视区域)   │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
│  │     │ │     │ │     │ │     │ │     │  │
│  │     │ │     │ │     │ │     │ │     │  │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘  │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
│  │     │ │     │ │     │ │     │ │     │  │
│  │     │ │     │ │     │ │     │ │     │  │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘  │
│                                             │
├─────────────────────────────────────────────┤
│ Footer (紧凑)                               │
└─────────────────────────────────────────────┘
```

### 卡片结构

```
┌─────────────────────────────┐
│                             │
│      图片区域               │
│      (4:3 比例)             │
│                             │
├─────────────────────────────┤
│ 状态标签     编号           │
│ 寄: xxx      收: xxx        │
│ 耗时: x 天                  │
└─────────────────────────────┘
```

## 组件规范

### 1. Header

- 高度: 64px
- 背景: 白色 + 95% 透明度 + backdrop-filter: blur(8px)
- 底部边框: 1px solid #E5E5E5
- 固定定位: sticky top: 0
- Logo字号: 18px
- Nav间距: 32px
- Nav字号: 14px
- Nav悬停下划线动画

### 2. Hero Section

- 背景: 白色
- 内边距: 32px 垂直
- 标题字号: 24px, 字重600
- 副标题字号: 14px, 颜色#737373
- 按钮间距: 12px

### 3. Stats Bar

- 背景: 白色
- 内边距: 14px 垂直
- 数值字号: 20px, 字重600
- 标签字号: 13px, 颜色#737373
- 分割线: 1px × 24px, #E5E5E5
- 水平滚动: overflow-x: auto

### 4. 明信片卡片

**默认状态**
- 背景: 白色
- 圆角: 8px
- 阴影: shadow
- 初始动画状态: opacity 0, translateY 30px

**悬停状态**
- Transform: scale(1.05)
- 阴影: 增强阴影
- z-index: 10
- 过渡: 300ms ease-out-expo

**图片区域**
- 比例: 4:3
- 填充: cover
- 悬停时3D翻转显示背面

**信息区域**
- 内边距: 14px
- 状态标签: 11px, 大写, 圆角4px
- 编号: 11px, 等宽字体
- 详情: 12px, 颜色#737373

### 5. 空状态

- 居中布局
- 图标: 48px, 50%透明度
- 标题: 18px, 字重600
- 描述: 14px, 颜色#737373
- 虚线边框: 1px dashed #D4D4D4

### 6. 按钮

**主要按钮**
- 背景: #333333
- 文字: 白色
- 圆角: 8px
- 内边距: 10px 20px
- 字号: 14px
- 悬停: 背景变#1A1A1A, translateY(-1px)

**次要按钮**
- 背景: #E5E5E5
- 文字: #404040
- 悬停: 背景变#D4D4D4

**小按钮**
- 内边距: 6px 12px
- 字号: 12px

### 7. 输入框

- 高度: 38px
- 内边距: 10px 14px
- 边框: 1px solid #D4D4D4
- 圆角: 8px
- 聚焦: 边框变#A3A3A3, 阴影

## Figma 创建指南

### 1. 创建设计文件

1. 打开 Figma
2. 创建新文件: "明信片墙设计系统"
3. 设置画板: 1440px × 900px (桌面) 作为基准

### 2. 创建设计令牌

在 Figma 中使用 Variables 或 Styles:

**Colors**
- primary: #333333
- white: #FFFFFF
- gray-50: #F5F5F5
- gray-100: #FAFAFA
- gray-200: #E5E5E5
- gray-300: #D4D4D4
- gray-400: #A3A3A3
- gray-500: #737373
- gray-600: #525252
- gray-700: #404040

**Typography**
- h1: 24px / 600
- h2: 18px / 600
- h3: 16px / 600
- body: 14px / 400
- small: 13px / 400
- caption: 11px / 600

**Spacing**
- xs: 4
- sm: 8
- md: 12
- lg: 16
- xl: 24
- 2xl: 32

**Effects**
- shadow-sm, shadow, shadow-md, shadow-lg, shadow-xl
- radius: 8

### 3. 创建组件

**Card Component**
- 命名为: PostcardCard
- 设置 auto-layout
- 包含图片区域和信息区域
- 添加悬停状态变体

**Button Component**
- 命名为: Button
- 包含 primary, secondary 变体
- 包含 default, hover, disabled 状态

**Input Component**
- 命名为: Input
- 包含 default, focus, error, disabled 状态

### 4. 创建设计画板

**Home Page (1440 × 900)**
- Header
- Hero Section
- Stats Bar
- Postcard Grid (5列)

**Responsive Variants**
- Desktop Large: 1440px - 5列
- Desktop: 1024px - 4列
- Tablet: 768px - 3列
- Mobile: 375px - 1列

### 5. 导出资源

1. 导出图标为 SVG
2. 导出设计规范为 PDF
3. 复制 CSS 样式代码

## 性能目标

### 首屏渲染

- 目标: < 1.5秒
- 策略:
  - 关键CSS内联
  - 字体预加载
  - 首屏图片预加载
  - 代码分割

### 动画性能

- 目标: ≥ 60fps
- 策略:
  - 使用 transform 和 opacity
  - 避免布局抖动
  - 使用 will-change
  - 懒加载非首屏内容

### Lighthouse 目标

- Performance: ≥ 90
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 90
