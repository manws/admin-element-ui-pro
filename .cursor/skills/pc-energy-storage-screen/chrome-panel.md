# 面板外框

标题和 KPI 下面的每一块内容都用这个外框。业务内容只放进默认插槽。不要另写一套带圆角、阴影或四角装饰的卡片。

改版已有页面时，面板块数和上下左右占比沿用源页面。外框仍按下面的数值 1:1 复制，不要因为源页面原来的圆角不同就保留旧圆角。

卡片轮廓四角都是直角，`border-radius: 0`。右上、左下不要圆角。下面面板的拐角括号只加左上和右下：`12×12`、线宽 `2px`、`#7ee7ff`，盖住边框外侧 `1px`。标题下指标卡不加这套括号。面板内的列表行、单元格、横条圆角是 `0`。面板没有左侧竖线。

外框特征（全部锁定）：

- 圆角 `0 !important`。右上、左下是直角。不要用 `--shadow-soft` 的外发光，外发光会把直角晕成圆角，只留内阴影 `inset 0 0 24px rgba(30, 140, 220, 0.12)`
- 背景 `linear-gradient(180deg, rgba(12, 48, 86, 0.55), rgba(4, 18, 38, 0.88))`
- 描边 `1px solid rgba(90, 196, 255, 0.45)`
- 阴影 `var(--shadow-soft)`
- 拐角只在左上和右下：`12×12`、线宽 `2px`、颜色 `#7ee7ff`，盖住边框外侧 `1px`
- 标题栏高 `42px`，左右 padding `14px`，项间距 `10px`。序号、中文、英文同一条基线，在栏内垂直居中。不要用 `translateY`。大屏 `.panel` 自身 `padding: 0`
- 标题下分隔线：左右各内缩 `14px`，高 `1px`，`transparent → rgba(90, 210, 255, 0.55) → transparent`
- 序号：`11px`、字距 `0.08em`、`#3ad4ff`、class `num`，告警时 `#ff6b6b`
- 标题：`15px` / `600` / 字距 `0.12em` / `#e7f6ff`，带 `rgba(58, 212, 255, 0.35)` 光晕
- 英文 sub：`10px`、字距 `0.08em`、大写、`#5d8eaa`
- 入场 `rise-in 0.7s`，延迟 `序号 * 70ms`
- 告警外框：描边 `rgba(255, 90, 90, 0.85)`，内发光 `rgba(220, 40, 40, 0.18)`，外发光 `rgba(220, 40, 40, 0.28)`

面板本身没有左侧竖线。

## 样例 01–05 实测

对照 `pc-nanjing-metro-network-control` 首页五块面板。外框五块相同，差别在标题栏右侧和内容。

### 外框

卡片轮廓四角都是直角。右上、左下不要 `border-radius`。左上、右下各一只青色直角括号，不是圆角，也不是四角。

括号画在 `.panel` 上，和参考页同一位置：`top/left/right/bottom: -1px`。不要改画到 `.shell` 上，否则会比参考页的括号更大。尺寸按卡片种类分开，不要混用：

| 卡片 | 括号 | 线宽 | 颜色 |
|---|---|---|---|
| 标题下指标卡 | 先不加 | — | — |
| 下面 01 起的面板 | `12×12` | `2px` | `#7ee7ff` |

标题下那一行卡片高 `100px`，内容在这 `100px` 里垂直居中，三行位置和参考页一致：图标行高 `22px`，主数字区高 `30px`、上间距 `4px`，副文案行高 `16px`、上间距 `2px`。占比条用绝对定位贴在底部，不要参与这三行的高度，否则整组会错位。指标卡之间、面板之间、标题和指标卡之间的间距都是 `12px`。舞台 padding 是 `0 16px 12px`。不要把指标卡撑得比 `100px` 更高，也不要改成别的间距。改版已有大屏时，下面面板的上下占比沿用源页面，不要套参考页上行 `568px`、下行 `300px`。

外框没有左侧竖线。左侧竖线只出现在两种地方：

- KPI 卡：宽 `2px`，上下各内缩 `14px`，颜色是该卡的 `--c`
- 面板内部的选中行：`box-shadow: inset 3px 0 0 var(--c)`
- 面板内部的告警行：`box-shadow: inset 2px 0 0 #ff6b6b`，底 `rgba(180, 30, 30, 0.16)`

### 标题区

高 `42px`，`align-items: center`，左右 padding `14px`。标题栏不加上下 padding。标题下面的内容区也不要再加 `padding-top`，否则标题区会看起来被外层 padding 撑高。

#### 序号和标题对不齐

序号是 `IBM Plex Mono` `11px`，中文标题是 `15px`，英文 sub 是 `10px`。这三项如果各自是 flex item，再把行高都写成标题栏高度（旧标准是 `line-height: 42px`），每一项会按自己的字体度量在那一行里居中。三条基线不重合，序号会比中文标题偏高。

标准：

- 序号、中文、英文放进同一个 `.head-main`，行内排版，共用一条基线
- `.head-main`：`line-height: 1`，`white-space: nowrap`
- 三项都是 `display: inline`、`line-height: 1`、`vertical-align: baseline`
- 序号、标题右边距各 `10px`
- 不要给这三项单独写 `line-height: 42px`，也不要用 `top` 或 `translateY` 把其中一项单独挪回去

#### 文字被全局 padding 压低

标题看起来偏下，先查是不是后台主题打进来了，不要把标题栏改矮，也不要用 `translateY` 把文字推回去。

`html.sidebar-color-blue .panel { padding: 20px 20px 16px }` 会匹配大屏的 `.panel`。同一段里的 `.panel h3` 和 `.panel-head { align-items: flex-start }` 也会盖掉大屏标题的字号、行高和垂直居中。标题会被顶到离卡片上沿大约 20px。

这些样式只属于内容页，选择器写成 `.board-page .panel`、`.board-page .panel-head`。大屏 `.panel` 保持 `padding: 0`，标题栏自己高 `42px`。

从左到右：

1. 序号 `01`，`11px`，字距 `0.08em`，`#3ad4ff`，字体 `IBM Plex Mono`
2. 中文标题，`15px` / `600` / 字距 `0.12em` / `#e7f6ff`，光晕 `0 0 12px rgba(58, 212, 255, 0.35)`
3. 英文 sub，`10px` / 字距 `0.08em` / `#5d8eaa` / 大写
4. `#extra` 靠右：图例、筛选芯片、开关。不要再放一套标题

标题区底边有一条分隔线，不是实线：左右各内缩 `14px`，高 `1px`，`linear-gradient(90deg, transparent, rgba(90, 210, 255, 0.55), transparent)`，中间亮、两边淡出。

### 五块内容

| 序号 | 标题 | 内容里要保留的细节 |
|---|---|---|
| 01 | 电表实时监测 | 行高约 `32px`，圆角 `0`，底 `rgba(8, 36, 64, 0.55)`，描边 `rgba(90, 196, 255, 0.16)`。行首是 `14px` 图标。选中行左侧 `3px` 竖线 |
| 02 | 厂区能流拓扑 | 节点圆角 `2px`。源节点 `54×54`，渐变 `#1aa8e6 → #0a4e8a`，白图标 `26px`。测点盒带仪表图标 |
| 03 | 储能设备运行 | 内层卡圆角 `0`，描边 `rgba(90, 196, 255, 0.28)`，底 `rgba(8, 36, 64, 0.55)`。通道号 `22px` 的 `num`，颜色用该卡强调色。右侧是 `10px` 宽竖向功率条 |
| 04 | 告警与事件 | 行高 `32px`，行首 `14px` 图标。告警行有左侧 `2px` 红线。普通行没有竖线，只有底边 `rgba(90, 196, 255, 0.08)` |
| 05 | 储能电池 SOC | 内层卡圆角 `0`。横条高 `12px`，填充 `linear-gradient(90deg, #1aa8e6, #7ee7ff)`，中间有一条刻度线 |

内容区的图标用 Remix Icon，颜色跟该行强调色，不要再给这些内层卡加大圆角。

## 组件

`index` 用两位字符串：`01`、`02`。`sub` 是英文短标签。`#extra` 放在标题右侧，用来放开关、筛选芯片、图例，不要往标题栏里塞第二套标题。

```vue
<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  sub?: string;
  index?: string;
  alarm?: boolean;
}>();

const delay = computed(() => `${(Number(props.index) || 0) * 70}ms`);
</script>

<template>
  <section class="shell" :class="{ 'is-alarm': alarm }" :style="{ animationDelay: delay }">
    <div class="panel">
      <header class="panel-head">
        <div class="head-main">
          <span v-if="index" class="panel-index num">{{ index }}</span>
          <h3 class="panel-title">{{ title }}</h3>
          <span v-if="sub" class="panel-sub">{{ sub }}</span>
        </div>
        <div class="head-extra">
          <slot name="extra" />
        </div>
      </header>
      <div class="panel-body">
        <slot />
      </div>
    </div>
  </section>
</template>
```

## 样式

```css
.shell {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 0;
  animation: rise-in 0.7s var(--ease) both;
}

.shell.is-alarm .panel {
  border-color: rgba(255, 90, 90, 0.85);
  box-shadow: inset 0 0 24px rgba(220, 40, 40, 0.18), 0 0 16px rgba(220, 40, 40, 0.28);
}

.panel {
  position: relative;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-width: 0;
  border-radius: 0;
  background: linear-gradient(180deg, rgba(12, 48, 86, 0.55), rgba(4, 18, 38, 0.88));
  box-shadow: var(--shadow-soft);
  border: 1px solid rgba(90, 196, 255, 0.45);
  overflow: hidden;
}

.shell::before,
.shell::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  border: 2px solid #7ee7ff;
  z-index: 3;
  pointer-events: none;
}

.shell::before {
  top: -1px;
  left: -1px;
  border-right: 0;
  border-bottom: 0;
}

.shell::after {
  right: -1px;
  bottom: -1px;
  border-left: 0;
  border-top: 0;
}

.panel-head {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 42px;
  padding: 0 14px;
  flex-shrink: 0;
}

.head-main {
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
  line-height: 1;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.panel-head::after {
  content: '';
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(90, 210, 255, 0.55), transparent);
}

.panel-index {
  display: inline;
  min-width: 22px;
  margin: 0 10px 0 0;
  font-size: 11px;
  line-height: 1;
  letter-spacing: 0.08em;
  vertical-align: baseline;
  color: #3ad4ff;
}

.is-alarm .panel-index {
  color: #ff6b6b;
}

.panel-title {
  display: inline;
  margin: 0 10px 0 0;
  font-size: 15px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.12em;
  vertical-align: baseline;
  color: #e7f6ff;
  text-shadow: 0 0 12px rgba(58, 212, 255, 0.35);
  white-space: nowrap;
}

.head-extra {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  flex-shrink: 0;
  min-width: 0;
}

.panel-sub {
  display: inline;
  min-width: 0;
  margin: 0;
  font-size: 10px;
  line-height: 1;
  vertical-align: baseline;
  color: #5d8eaa;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.panel-body {
  position: relative;
  flex: 1 1 auto;
}

@media (prefers-reduced-motion: reduce) {
  .shell { animation: none; }
}
```

样例五块面板的标题槽（只说明结构，新大屏换成用户确认的文案）：

| 序号 | 标题 | sub | 占位 |
|---|---|---|---|
| 01 | 电表实时监测 | Meters | 左上 1 列 |
| 02 | 厂区能流拓扑 | Energy Flow | 中上 2 列 |
| 03 | 储能设备运行 | 量程说明，非全大写英文 | 右上 1 列 |
| 04 | 告警与事件 | Alarm Log | 左下 3 列 |
| 05 | 储能电池 SOC | Battery Packs | 右下 1 列 |

`sub` 在样例里多数是英文并被 CSS 转成大写。用户给的是中文说明时，去掉该面板 `text-transform` 之前先问。默认保留大写规则，中文说明放到标题或 `#extra`。
