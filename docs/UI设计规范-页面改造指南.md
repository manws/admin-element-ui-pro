# 宣海科技医学统计平台 — UI 页面改造指南

> 基于 `simple.vue`（简单随机）页面优化经验总结，供后续其他页面统一改造参考。
>
> 主色调：`#4558d0` | 辅色：`#22c55e`（绿）、`#f59e0b`（橙）、`#8b91a8`（灰）

---

## 一、整体结构（4 层）

每个统计/随机页面建议遵循以下层级：

```
1. 页头 Hero
2. 算法介绍 + 参数侧栏（el-row 左16右8）
3. 操作表单区
4. 结果区（指标卡 → 图表 → 列表/解读）
```

---

## 二、页头 Hero

**作用**：页面顶部的身份标识区，让用户一眼知道当前在哪个功能。

### 结构
```html
<div class="page-hero mb-4">
  <div class="hero-text">
    <h1 class="hero-title">页面名称</h1>
    <p class="hero-desc">一句话描述该功能</p>
  </div>
  <el-tag class="hero-tag" effect="plain" size="large" round>英文标识</el-tag>
  <div class="hero-watermark">缩写</div>
</div>
```

### 样式要点

| 属性 | 值 |
|---|---|
| 背景 | `linear-gradient(135deg, rgba(69,88,208,0.08), rgba(69,88,208,0.02))` |
| 圆角 | `14px` |
| 边框 | `1px solid var(--el-border-color-lighter)` |
| 内边距 | `28px 28px 24px` |
| 布局 | `display:flex; align-items:center; justify-content:space-between` |
| 标题 | `24px / font-weight:800 / letter-spacing:-0.5px` |
| 描述 | `13.5px / color:var(--el-text-color-secondary)` |
| 水印文字 | `88px / font-weight:900 / color:rgba(69,88,208,0.05)` — 绝对定位右侧居中 |
| Tag | `el-tag effect="plain" size="large" round` — 英文大写标识 |

### 水印文字参考

| 页面 | 水印 |
|---|---|
| 简单随机 | `SR` |
| 区组随机 | `BR` |
| 分层区组 | `SB` |
| 最小化随机 | `MR` |
| 四格表卡方 | `χ²` |
| t 检验 | `t` |
| 样本量计算 | `n` |

---

## 三、算法介绍卡片（`.algo-card`）

**替代原来的 `el-card shadow="never"`**，自定义样式更有层次。

### 结构
```html
<div class="algo-card">
  <div class="algo-card-header">
    <div class="algo-card-icon">
      <div class="i-svg:el-icon-Document" style="width:16px;height:16px" />
    </div>
    <span>算法介绍</span>
  </div>
  <div class="algo-body">
    <h3>算法名称</h3>
    <h4>小节标题</h4>
    <p>正文...</p>
  </div>
</div>
```

### 样式要点

| 属性 | 值 |
|---|---|
| 圆角 | `14px` |
| Header 背景 | `linear-gradient(180deg, rgba(69,88,208,0.03), transparent)` |
| Header 图标 | `30px` 方块，`linear-gradient(135deg, #4558d0, #6b82f0)` 渐变底 + 白色图标 + 微阴影 |
| h4 左侧装饰 | `::before` 伪元素，`3px × 14px` 渐变色条（`#4558d0 → #6b82f0`） |
| 正文 | `13px / line-height:1.85 / color:var(--el-text-color-secondary)` |

---

## 四、参数侧栏（`.param-sidebar`）

**作用**：右侧 8 栏，展示当前页面的参数说明。

### 样式要点

| 属性 | 值 |
|---|---|
| 背景 | `linear-gradient(160deg, rgba(69,88,208,0.06), rgba(69,88,208,0.015))` |
| 编号圆 | `26px` 方块，`linear-gradient(135deg, #4558d0, #5a6ee0)` **实心渐变白字** + `box-shadow` |
| Header | 带 `border-bottom` 分隔线 |
| 撑满等高 | 外层 `el-row` 加 `style="align-items:stretch"`，侧栏 `display:flex; flex-direction:column` |
| 参数标题 | `13px / font-weight:600` |
| 参数描述 | `11.5px / line-height:1.65 / color:secondary` |

---

## 五、操作表单卡片（`.sim-card`）

**替代原来的 `el-card`**，区分于算法介绍卡用绿色图标。

### 样式要点

| 属性 | 值 |
|---|---|
| 圆角 | `14px` |
| Header 图标 | 绿色渐变 `linear-gradient(135deg, #16a34a, #4ade80)` — 与算法卡蓝色区分 |
| Header 右侧 | 灰色提示文字 `12px / color:placeholder` |
| 底部提示 | `border-top: 1px dashed` 虚线分隔 + `12px` 灰色文字 |
| 按钮列 | `display:flex; align-items:flex-end; padding-bottom:18px` 底部对齐 |

---

## 六、统计指标卡（`.metric-card`）

**最醒目的视觉元素** — 彩色渐变底 + 白色文字 + 水印大字。

### 结构
```html
<div class="metric-card mc-blue" data-watermark="A">
  <div class="mc-content">
    <div class="mc-label">指标名称</div>
    <div class="mc-value">{{ 数值 }}</div>
    <div class="mc-sub">辅助说明</div>
  </div>
  <div class="mc-icon"><div class="i-svg:图标名" /></div>
</div>
```

### 四色方案

| 类名 | 渐变 | 用途 | 水印 |
|---|---|---|---|
| `.mc-blue` | `#4558d0 → #6b82f0` | 主指标（A组、总量等） | 根据语境 |
| `.mc-green` | `#16a34a → #4ade80` | 正向指标（完成、B组等） | |
| `.mc-amber` | `#e67e22 → #f0b44a` | 警示指标（差值、偏差等） | |
| `.mc-neutral` | `#5b6178 → #8b91a8` | 中性指标（总数、计数等） | |

### 样式要点

| 属性 | 值 |
|---|---|
| 圆角 | `14px` |
| 最小高度 | `110px` |
| 彩色阴影 | `0 4px 16px rgba(主色, 0.3)` |
| 数字 | `JetBrains Mono / 28px / font-weight:800 / color:#fff` |
| Label | `12px / rgba(255,255,255,0.7)` |
| Sub | `11px / rgba(255,255,255,0.55)` |
| 右侧图标 | `42px` 方块 `rgba(255,255,255,0.15)` + `backdrop-filter:blur(4px)` |
| 水印 | `72px / font-weight:800 / rgba(255,255,255,0.1)` — `::after` + `data-watermark` |
| Hover | `translateY(-4px) + brightness(1.05)` |

---

## 七、ECharts 图表配色

**统一使用主色系**，不再用 Element 默认色。

| 数据系列 | 颜色 |
|---|---|
| A组 / 主系列 | `#4558d0` |
| B组 / 辅系列 | `#22c55e` |
| 警示 / 第三系列 | `#f59e0b` |
| 中性 / 第四系列 | `#8b91a8` |

### 折线图增强
```js
areaStyle: {
  color: {
    type: "linear", x: 0, y: 0, x2: 0, y2: 1,
    colorStops: [
      { offset: 0, color: "rgba(69,88,208,0.15)" },
      { offset: 1, color: "rgba(69,88,208,0)" }
    ]
  }
}
```

---

## 八、通用规范

### 圆角体系

| 元素 | 圆角 |
|---|---|
| 大卡片 / Hero | `14px` |
| 指标卡 | `14px` |
| 小图标方块 | `8~10px` |
| 按钮 / Tag | 默认 Element 或 `100px`（胶囊） |

### 字体

| 用途 | 字体 |
|---|---|
| 数据数字 | `'JetBrains Mono', 'IBM Plex Mono', monospace` |
| 正文 | 系统默认（Element Plus 继承） |

### 间距

| 元素 | 间距 |
|---|---|
| 卡片行间 | `mb-4`（16px） |
| 卡片内栏间 | `gutter="16"` |
| 卡片内边距 | `20px`（body）/ `16px 20px`（header） |

### 渐变色条装饰

用于 h4 标题、侧栏选中态等：
```css
&::before {
  content: "";
  width: 3px; height: 14px; border-radius: 2px;
  background: linear-gradient(180deg, #4558d0, #6b82f0);
}
```

### 阴影层级

| 场景 | 阴影 |
|---|---|
| 图标方块 | `0 2px 6px rgba(69,88,208,0.25)` |
| 指标卡 | `0 4px 16px rgba(主色,0.3)` |
| Hover 加深 | `0 8px 24px rgba(0,0,0,0.06)` |

---

## 九、暗黑模式适配

所有 `rgba()` 色值通过 CSS 变量引用 `var(--el-*)` 会自动适配暗黑模式。

手动指定的颜色（如指标卡渐变底）在暗黑模式下不需要改变——彩色卡片在深色背景下反而更醒目。

需要注意的：
- Hero 水印在暗黑模式下 `opacity` 可能需要降到 `0.03`
- 算法卡 header 的微渐变底色可以用 `var(--el-bg-color)` 做 fallback

---

## 十、改造清单

以下页面需要按本规范统一改造：

### 随机分组模块
- [x] `simple.vue` — 简单随机 ✅ 已完成
- [ ] `block.vue` — 区组随机
- [ ] `stratified-block.vue` — 分层区组随机
- [ ] `minimization.vue` — 最小化随机
- [ ] `select.vue` — 随机选择

### 样本量计算模块
- [ ] `two-means.vue` — 两独立样本均值
- [ ] `two-proportions.vue` — 两独立样本率
- [ ] `paired.vue` — 配对设计均数率
- [ ] `non-inferiority.vue` — 非劣效性设计
- [ ] `logrank.vue` — LogRank 检验
- [ ] `diagnostic.vue` — 诊断试验

### 医学统计模块
- [ ] `fourfold.vue` — 四格表卡方
- [ ] `fisher.vue` — Fisher 精确检验
- [ ] `rc-table.vue` — R×C 表卡方
- [ ] 其他统计检验页面...

---

*文档版本：v1.0 | 更新时间：2026-04-13*
