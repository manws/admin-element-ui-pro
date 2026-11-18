# 色板、字体、动效

大屏页面必须带上这些定义。`--desk-*` 属于后台页，大屏不要使用。

## CSS 变量与通用 class

放入全局样式（样例是 `src/styles/main.css`）：

```css
:root {
  --c-accent: #3ad4ff;
  --c-accent-soft: #7ee7ff;
  --c-mint: rgba(58, 212, 255, 0.12);
  --c-cyan: #3ad4ff;
  --c-line: rgba(90, 196, 255, 0.28);
  --c-line-strong: rgba(90, 210, 255, 0.7);
  --c-text: #e7f6ff;
  --c-dim: #7eb4cc;
  --c-bg: #04101c;
  --c-card: rgba(6, 28, 52, 0.72);
  --ease: cubic-bezier(0.32, 0.72, 0, 1);
  --shadow-soft: inset 0 0 24px rgba(30, 140, 220, 0.12), 0 0 16px rgba(16, 110, 200, 0.18);
  --el-color-primary: #1aa8e6;
  --el-color-primary-light-3: #4ec4f2;
  --el-color-primary-light-5: #7ed6f6;
  --el-color-primary-light-7: #16324c;
  --el-color-primary-light-9: #0c2238;
  --el-color-primary-dark-2: #0e7eb8;
  --el-bg-color: #07182c;
  --el-text-color-primary: #e7f6ff;
  --el-border-radius-base: 4px;
}

html,
body,
#app {
  margin: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--c-bg);
  color: var(--c-text);
  font-family: 'Instrument Sans', 'PingFang SC', 'HarmonyOS Sans SC', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
}

:focus,
:focus-visible {
  outline: none;
}

.num {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  letter-spacing: -0.02em;
}

.chip {
  padding: 2px 10px;
  font-size: 12px;
  color: #9fd0e6;
  border-radius: 0;
  background: transparent;
  border: 1px solid var(--c-line);
  transition: color 0.25s var(--ease), background 0.25s var(--ease), border-color 0.25s var(--ease);
}

.chip:active {
  transform: scale(0.97);
}

.chip:hover {
  color: #e7f6ff;
  background: rgba(58, 212, 255, 0.12);
  border-color: rgba(90, 210, 255, 0.55);
}

.chip.is-active {
  color: #04101c;
  font-weight: 600;
  background: #3ad4ff;
  border-color: #7ee7ff;
  box-shadow: 0 0 10px rgba(58, 212, 255, 0.45);
}

.cell {
  border-radius: 0;
  background: rgba(8, 36, 64, 0.55);
  border: 1px solid rgba(90, 196, 255, 0.22);
}

.label {
  font-size: 12px;
  letter-spacing: 0.025em;
  color: var(--c-dim);
}

.thin-scroll::-webkit-scrollbar {
  width: 4px;
}

.thin-scroll::-webkit-scrollbar-thumb {
  background: rgba(58, 212, 255, 0.35);
  border-radius: 4px;
}

@keyframes flow-dash {
  from { stroke-dashoffset: 40; }
  to { stroke-dashoffset: 0; }
}

@keyframes blink-soft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes rise-in {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
```

样例里 `.chip` 和 `.label` 写在 `@layer components`，并用 Tailwind `@apply`。复制进新项目时二选一：保留 `@apply` 写法，或使用上面展开后的等价声明。视觉结果必须相同。

## 允许使用的颜色

新强调色不在表内时，先问用户。告警红只表达告警。

| 用途 | 色值 |
|---|---|
| 页面底 | `#04101c` |
| 主文字 | `#e7f6ff` / `#f4fbff` |
| 次文字、单位 | `#7eb4cc` |
| 弱文字 | `#5d8eaa` |
| 胶囊文字 | `#c5e6f5` |
| 主强调、眉题线 | `#3ad4ff` |
| 拐角、眉题字 | `#7ee7ff` |
| 正常 / 运行 | `#2ee59a` |
| 等待 / 警示 | `#f5c15a` |
| 告警点 | `#dc2626` |
| 告警字、KPI 告警 | `#ff6b6b` |
| 告警图标浅 | `#ff8a8a` |
| KPI 厂区用电 | `#8ef06a` |
| KPI 单体 | `#7eb6ff` |
| 充电 | `#7dffc3` |
| 放电 | `#8aecff` |
| 限功率 | `#ffd27a` |
| 面板描边 | `rgba(90, 196, 255, 0.45)` |
| 内层卡底 | `rgba(8, 36, 64, 0.55)` |
| 胶囊底 | `rgba(6, 28, 52, 0.72)` |

样例 KPI 六张的强调色按顺序是：`#2ee59a`、`#3ad4ff`、`#8ef06a`、`#7eb6ff`、`#7ee7ff`、`#f5c15a`。新 KPI 从这组里选，告警态改 `#ff6b6b`。

状态字色沿用样例 Tailwind class：正常 `text-emerald-400`，充电 `text-emerald-400`，放电 `text-sky-400`，静置 `text-slate-400`，告警 `text-red-400`。这些 class 依赖下面的色板改写。

## Tailwind 色板

`tailwind.config` 必须包含：

```js
fontFamily: {
  num: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
  sans: ['Instrument Sans', 'PingFang SC', 'HarmonyOS Sans SC', 'Microsoft YaHei', 'sans-serif']
},
colors: {
  screen: { 950: '#020814', 900: '#04101c', 800: '#07182c' },
  slate: {
    50: '#f4fbff', 100: '#e7f6ff', 200: '#c5e6f5', 300: '#9fd0e6', 400: '#7eb4cc',
    500: '#5d8eaa', 600: '#3e6d88', 700: '#245068', 800: '#1c4d6e', 900: '#0c2236'
  },
  cyan: {
    50: '#e7fbff', 100: '#b8f3ff', 200: '#7ee7ff', 300: '#3ad4ff', 400: '#14c0f0',
    500: '#0aa4d6', 600: '#0784b0', 700: '#086888', 800: '#0a4e68', 900: '#08384c'
  },
  sky: { 300: '#7ee7ff', 400: '#3ad4ff', 500: '#14c0f0' },
  emerald: { 300: '#7dffc3', 400: '#2ee59a', 500: '#1ed98a', 600: '#12b874' },
  amber: { 300: '#ffe08a', 400: '#f5c15a', 500: '#e0a43a' },
  red: { 400: '#e03b3b', 500: '#dc2626' }
}
```

`safelist` 至少包含：`text-emerald-400`、`text-amber-400`、`text-red-400`、`text-sky-400`、`text-slate-400`。

## 入口依赖

```ts
import '@fontsource/instrument-sans/400.css';
import '@fontsource/instrument-sans/500.css';
import '@fontsource/instrument-sans/600.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import 'remixicon/fonts/remixicon.css';
```

顶栏用到 `ElTooltip`、`ElSwitch` 时，按需引入对应的 `element-plus/es/components/*/style/css`。开关颜色走上面的 `--el-color-primary`。
