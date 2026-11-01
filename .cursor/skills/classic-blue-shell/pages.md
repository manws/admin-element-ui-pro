# 内容页

壳层（侧栏、顶栏、面包屑、页签）仍以 `SKILL.md` 为准。本文件只约束主内容，来源是总览 `src/views/dashboard/index.vue`。样式在 `src/styles/_board.scss`，令牌在 `html.sidebar-color-blue:not(.dark)`。

页面根节点加 `board-page`。暗色主题和登录页不用这套。

## 先选结构

按数据关系选一种，不要先画四张同款白卡。

| 数据 | 结构 | 类名 |
|---|---|---|
| 一个总数，加上若干「占这个总数」的分量 | 占用条。分量各自除以总数，不要堆成一条 100% | `apron` + `tracks` |
| 同一指标的累计和今日 | 读数卡，一行最多四张 | `ledger-row` + `ledger` |
| 地图监控那四个互不配对的数 | 原稿指标行，高 100px | `metric-row` + `metric` |
| 图表、表格、筛选 | 面板 | `panel` |
| 0–100 的评估分 | 分数环，只在总览和车辆详情 | 见总览 `.ring` |
| 告警级别 | 级别灯 | `lamp` |
| 在线 / 充电 / 告警 / 离线 | 状态点，12px，用原稿四色 | `status-dot` |

停机坪中线 `centerline` 只出现在总览的「在册车辆」上。别的占用条不要再画黄虚线，也不要做滚动动画。

## 令牌

壳层色继续用 `--shell-bg`、`--shell-surface`、`--shell-text`、`--shell-muted`、`--shell-blue`。内容页追加：

| 令牌 | 色值 | 只用在 |
|---|---|---|
| `--shell-line` | `#E6EBF2` | 面板、读数卡、指标卡的 1px 实线 |
| `--shell-groove` | `#E7EDF5` | 占用条轨道、读数卡分割线、表格线 |
| `--shell-carbon` | `#0F6B56` | 碳减量数字；安全分 ≥ 90 |
| `--shell-fault` | `#C2410C` | 故障 / 严重，且数量大于 0；安全分 < 80 |
| `--shell-warn` | `#A16207` | 重要告警 |
| `--shell-apron` | `#C4A035` | 总览中线，以及里程读数卡里的车道虚线 |
| `--shell-readout` | SF Mono, Menlo, Consolas | 读数 |

车辆状态点仍是原稿四色，不改成上面的故障橙：在线 `#79BD85`，充电中 `#6EA4FF`，告警 `#E3828B`，离线 `#7E8B9F`。级别灯和状态点不要叠在同一个词上。

安全分颜色：≥ 90 `--shell-carbon`，≥ 80 `--shell-blue`，否则 `--shell-fault`。

## 占用条

```html
<section class="apron" aria-label="在册车辆状态">
  <header class="apron-head">
    <div>
      <p class="kicker">飞行区此刻</p>
      <h2>在册车辆</h2>
    </div>
    <p class="roster">
      <span class="kicker">在册</span>
      <span class="readout">1,936</span>
    </p>
  </header>
  <!-- 只有总览加这根中线 -->
  <div class="centerline" aria-hidden="true" />
  <div class="tracks">
    <div class="track is-ink">
      <div class="track-head">
        <span class="track-label">在线</span>
        <span class="track-value">1,568</span>
      </div>
      <div class="track-bar" aria-hidden="true"><span class="track-fill" style="width: 81%" /></div>
      <p class="track-note">占在册 81%</p>
    </div>
  </div>
</section>
```

- 眉题 `kicker` 说明场合，标题说明这组数是什么。右侧大数字是分母。
- 条的颜色：默认墨色，充电 `is-charge`，重要 `is-warn`，故障 / 严重 `is-fault`。故障和重要只有 `has-value`（数量 > 0）时数字才上色。
- 宽度 = 分量 / 总数，限制在 0–100。大于 0 时至少 2%，避免看不见。占比在 0 和 1 之间写成 `<1%`。
- 两条时给 `tracks` 加 `is-two`。
- 在线、充电、故障可以重叠，所以三条都相对在册，不要做成互斥堆叠。

## 读数卡

一张卡一个指标。上：主题小图和单位。中：名称、`累计`、等宽大数字。下：`今日` 和今日数字，用 `--shell-groove` 分开。

小图用 32 viewBox 的单色描边，不用彩色圆底图标。碳减量整张卡的小图和累计数字用 `--shell-carbon`。里程卡的车道虚线用 `--shell-apron`。不要给每张卡各加一个强调色。

按钮写动作本身。「查看系数」打开系数，「历史」打开历史。文字按钮用 `text-btn`。

## 面板和图表

面板内先放眉题，再放 `h3`。标题 16px / 600。图表网格 `#E6EBF2`，刻度 12px / `#66758B`。热力从 `#E7EDF5` 收到 `#1B2B43`。充电功率线 `#2563EB`，面积从 `rgba(37, 99, 235, 0.18)` 收到透明。地图散点和条形仍用原稿状态色和 `#4E83ED`，圆角 3px。

地图双图保持 630 : 386、同高 448、间距 20。这是原稿尺寸，不要改成总览的对半。

表格在 `board-page` 里用细表头，数字列加 `num`。

## 级别灯和状态点

级别：1 严重 `lamp is-fault`，2 重要 `lamp is-warn`，3 一般 `lamp`。文案用「严重 / 重要 / 一般」。

在线状态用 `status-text` + `status-dot`，不要换成级别灯。

## 断点

不造移动端导航。`board-page`、占用条、读数卡、指标行在 860px 以下改为两列，720px 以下改为一列。图表网格子项保持 `min-width: 0`，避免画布把页面撑出横向滚动。

## 不要做

- 十二张只有标签和数字的同款卡
- 把中线、碳绿、故障橙铺到每个页面
- 阴影、大面积渐变、衬线大标题、01 / 02 序号
- 为了等宽数字去加载新的网络字体
- 改登录页和暗色主题
