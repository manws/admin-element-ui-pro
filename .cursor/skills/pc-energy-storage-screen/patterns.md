# 面板内部件

新内容放进 `BasePanel` 的 body。先从下面选最接近的部件，按给出的尺寸和颜色写。不要新做圆角卡片、渐变底板或四角装饰。

内层块的共同底是 `rgba(8, 36, 64, 0.55)`，描边 `rgba(90, 196, 255, 0.22)` 到 `rgba(90, 196, 255, 0.28)`，圆角 `0` 或跟随外框的直角。数字继续用 `num`。

## 饼图 / 环图

可以。ECharts 饼图的每一块都能加圆角，用扇区自己的 `itemStyle.borderRadius`，不是外框圆角。大屏上的饼图、环图都要带这个圆角，不要画成直角扇区。

```js
series: [{
  type: 'pie',
  radius: ['54%', '78%'],
  itemStyle: {
    borderRadius: 6,
    borderColor: '#07182c',
    borderWidth: 2
  }
}]
```

- `borderRadius: 6`。扇区很窄时不要超过 `8`，否则小块会被圆成球。
- `borderWidth: 2`，`borderColor` 用面板底色 `#07182c`，把相邻扇区拉开，圆角才看得见。
- 扇区颜色仍用色板。中间的总数用 `num` 叠在环心，不要用 ECharts 默认标签字体。

这条例外只给饼图扇区。面板、KPI、列表行的圆角规则不变。

## 列表行

用于设备、测点、告警这类纵向列表。

- 行高约 `32px`，间距 `4px`，列表 padding `6px 8px 4px`
- 行：`padding: 3px 8px`，描边 `rgba(90, 196, 255, 0.16)`，底 `rgba(8, 36, 64, 0.55)`
- 图标 `14px`，固定宽 `16px`，颜色用该行强调色
- 主字 `13px` / `#e7f6ff`（`text-slate-100`），副字 `11px` / `#5d8eaa`（`text-slate-500`）
- 选中行：描边和浅底用强调色混合，并加 `box-shadow: inset 3px 0 0 var(--c)`
- 告警行：背景 `rgba(180, 30, 30, 0.16)`，`box-shadow: inset 2px 0 0 #ff6b6b`
- 悬停（日志行）：`background: rgba(16, 56, 92, 0.55)`

日志行用网格，不要改成弹性撑开导致列对不齐。样例列是：图标 `16px`、时间 `68px`、类型标签 `44px`、两列元信息 `84px` / `76px`、消息占满剩余。行高 `32px`，列间距 `10px`，底边 `rgba(90, 196, 255, 0.08)`。时间色 `#7eb4cc`，元信息 `#9fd4ea`，消息 `#e7f6ff`。

类型标签：

```css
.tag {
  font-size: 11px;
  line-height: 18px;
  padding: 0 6px;
  border: 1px solid color-mix(in srgb, currentColor 45%, transparent);
  background: color-mix(in srgb, currentColor 12%, transparent);
}
```

告警标签色 `#ff8a8a`，事件标签色 `#7ee7ff`。筛选按钮用全局 `.chip`，当前项加 `is-active`。

## 指标格

面板里的小数字格用全局 `.cell`：直角、底 `rgba(8, 36, 64, 0.55)`、描边 `rgba(90, 196, 255, 0.22)`。格内标签用 `.label`，数字 `16px` 的 `num`，颜色用 `text-cyan-200`（色板值为 `#7ee7ff`）。单位 `11px` / `#5d8eaa`。

表格：字号 `13px`，单元格 padding `4px`，表头底边 `rgba(90, 196, 255, 0.22)`，行间 `rgba(90, 196, 255, 0.1)`。首列左对齐、颜色 `#7eb4cc`，数值列右对齐并用 `num`。

主指标（面板内最大的一个数）用 `26px` 或 `30px` 的 `num`，颜色 `#e7f6ff` 或该块强调色。单位 `12px` / `#7eb4cc`，与数字间距 `4px`–`6px`。

## 横条

SOC、进度一类：

```css
.track {
  position: relative;
  height: 12px;
  border: 1px solid rgba(90, 196, 255, 0.35);
  background:
    linear-gradient(90deg, transparent 49.6%, rgba(90, 196, 255, 0.45) 49.6%, rgba(90, 196, 255, 0.45) 50.4%, transparent 50.4%),
    rgba(4, 16, 28, 0.65);
  overflow: hidden;
}

.track i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #1aa8e6, #7ee7ff);
}
```

刻度 `0 / 50 / 100` 用 `10px` / `#5d8eaa`。百分比数字 `26px` 的 `num`，`%` 用 `12px` / `#7eb4cc`，字体改回 `Instrument Sans`。

## 竖条

功率量程条：宽 `10px`，描边 `rgba(90, 196, 255, 0.35)`，底 `rgba(4, 16, 28, 0.65)`，中间一条 `rgba(90, 196, 255, 0.28)` 的中线。正向填充 `linear-gradient(180deg, #7dffc3, #1ed98a)`，反向填充 `linear-gradient(180deg, #7ee7ff, #1494d6)`。量程端点文字 `11px` / `#7eb4cc`。

## 内层卡

面板里再分块时（设备通道、电池包）：

```css
.card {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid rgba(90, 196, 255, 0.28);
  background: rgba(8, 36, 64, 0.55);
}
```

故障卡只改描边为 `rgba(255, 107, 107, 0.7)`。状态字：正常 `#2ee59a`，故障 `#ff8a8a`。模式标签用 `1px` 的 `currentColor` 描边，背景是当前字色的 14%，字号 `13px`、字距 `0.08em`、不加圆角。

字段名 `12px`、字距 `0.12em`、`#7eb4cc`。字段值 `14px` / `600`。通道号可以放到 `22px` 的 `num`，颜色用该卡强调色。

## 拓扑节点

能流、关系图放在面板 body 里，节点样式：

- 源节点：`54×54`，圆角 `2px`，渐变 `#1aa8e6 → #0a4e8a`，图标 `26px` 白色，外发光 `0 0 16px rgba(58, 180, 255, 0.55)`。告警改为底 `#c03028` 并 `blink-soft`
- 主测点盒：最小宽 `150px`，padding `8px 14px`，圆角 `2px`，底 `rgba(6, 28, 52, 0.85)`，描边 `rgba(90, 196, 255, 0.45)`。告警底 `rgba(60, 12, 16, 0.85)`，描边 `#dc2626`
- 支路测点：高 `32px`，宽按内容，padding `0 12px`，同一套深底，描边用强调色的 33% 透明
- 设备块：高 `40px`，底 `rgba(8, 36, 64, 0.8)`，图标 `18px`
- 连线底：`rgba(90, 196, 255, 0.35)`，线宽 `4`。流动线：`stroke-dasharray: 8 12`，动画 `flow-dash`，线宽 `3`

母线渐变色标是 `#7fdcb5 → #0b8456`，线宽 `8`。这是样例母线的专用颜色；新图如果不是「受电母线」，先问用户要不要沿用这段绿。

## 全屏告警

只有用户明确要求「阻断式告警条」时才做。样式固定为样例：

- 页面内缩红框：`inset 0 0 0 4px #dc2626`，再加 `inset 0 0 160px rgba(220, 38, 38, 0.35)`，`blink-soft 1s`
- 横幅距顶 `84px`、宽 `1100px`、水平居中、圆角 `22px`
- 背景 `linear-gradient(90deg, #c81e1e, #e03b3b 50%, #c81e1e)`
- 左侧图标盒 `54×54`、圆角 `16px`、底 `rgba(255, 255, 255, 0.16)`、图标 `30px`
- 确认钮高 `44px`、胶囊形、白底、字色 `#c81e1e`；右侧圆形图标底 `#dc2626`

不要把这套红色胶囊用到普通面板上。
