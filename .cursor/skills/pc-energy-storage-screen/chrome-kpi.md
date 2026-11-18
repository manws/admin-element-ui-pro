# KPI 卡

标题正下方一行指标卡。样例是 6 列、行高 `100px`、间距 `12px`（`gap-3`）。新做大屏时条数不是 6 先问用户，禁止改高度。

改版已有页面时，这一行有几张卡就保留几张，留在原位。源页面是 6 张等宽卡加 1 张更宽的卡时，网格按源页面的相对宽度排，例如 `repeat(6, minmax(0, 1fr)) minmax(0, 2.08fr)`，不要收成 6 列把多出来的那张搬进下面的面板。卡内原有的占比条继续放在数字下面，轨道圆角 `0`。

每张卡的结构固定：

标题下指标卡先不加拐角括号。左上、右下的 `10×10` 括号先去掉，右上、左下保持直角。下面 01 起的面板括号仍是 `12×12`，不要画到这一行上。
2. 左侧竖线：宽 `2px`，上下各内缩 `14px`，颜色是该卡的 `--c`
3. 第一行：`22×22` 图标盒 + `12px` 标签
4. 第二行：主数字 `24px`（class `num` + `num-main`）+ 单位 `12px` / `#7eb4cc`，行高区域 `30px`，上间距 `4px`
5. 第三行：副文案 `12px` / 行高 `16px` / 上间距 `2px`

一对数值（样例「最高 / 最低」）时，两个数字用 `18px`，中间斜杠 `14px` / `#5d8eaa`。

图标用 Remix Icon，放在 `.ico` 里。图标盒底色是强调色 16% 混 `#07182c`，描边是强调色 35%。

告警卡：class `is-alarm`，背景改成左上红色径向渐变，描边闪烁。告警数字颜色 `#ff6b6b`。只有源内容本身已经是告警状态才加这个 class。统计「某类告警条数」的普通指标卡用普通 KPI 底，不要把第一张卡单独涂红。源页面数字原有的红/琥珀区分，只体现在数字、左竖线和占比条上。

入场：`rise-in 0.7s`，第 n 张延迟 `n * 60ms`。

## 模板

```vue
<div class="grid grid-cols-6 gap-3 h-[100px]">
  <div
    v-for="(k, n) in kpis"
    :key="k.id"
    class="kpi"
    :class="{ 'is-alarm': k.alarm }"
    :style="{ '--c': k.color, animationDelay: `${n * 60}ms` }"
  >
    <i class="tick tl" />
    <i class="tick br" />
    <div class="flex items-center gap-2 min-w-0">
      <div class="ico"><i :class="k.icon" /></div>
      <div class="label truncate">{{ k.label }}</div>
    </div>
    <div class="value">
      <AnimatedNumber :value="k.value" :decimals="k.decimals" class="num-main" :style="{ color: k.alarm ? '#ff6b6b' : '#e7f6ff' }" />
      <span class="unit">{{ k.unit }}</span>
    </div>
    <div class="sub" :class="k.subCls || 'text-slate-400'">{{ k.sub }}</div>
  </div>
</div>
```

`k.icon` 形如 `ri-flashlight-fill`。标签行用全局 `.label`（`12px`、`#7eb4cc`）。

## 样式

```css
.kpi {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: 8px 14px 8px 16px;
  border-radius: 0;
  background: linear-gradient(180deg, rgba(12, 48, 86, 0.55), rgba(4, 18, 38, 0.88));
  border: 1px solid rgba(90, 196, 255, 0.45);
  box-shadow: var(--shadow-soft);
  overflow: visible;
  animation: rise-in 0.7s var(--ease) both;
  transition: border-color 0.3s var(--ease);
}

.kpi::before {
  content: '';
  position: absolute;
  left: 0;
  top: 14px;
  bottom: 14px;
  width: 2px;
  border-radius: 0 2px 2px 0;
  background: var(--c);
}

.kpi:hover {
  border-color: color-mix(in srgb, var(--c) 45%, var(--c-line));
}

.kpi.is-alarm {
  background: radial-gradient(120% 140% at 0% 0%, rgba(220, 38, 38, 0.28), transparent 60%), rgba(40, 8, 12, 0.85);
  box-shadow: inset 0 0 0 1.5px rgba(220, 38, 38, 0.6), 0 12px 30px -14px rgba(220, 38, 38, 0.45);
}

.kpi.is-alarm::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 0 2px #dc2626;
  animation: blink-soft 1s var(--ease) infinite;
  pointer-events: none;
}

.tick {
  position: absolute;
  width: 10px;
  height: 10px;
  border: 2px solid #7ee7ff;
  pointer-events: none;
  z-index: 2;
}

.tl { top: -1px; left: -1px; border-right: 0; border-bottom: 0; }
.br { right: -1px; bottom: -1px; border-left: 0; border-top: 0; }

.value {
  display: flex;
  align-items: baseline;
  gap: 4px;
  min-width: 0;
  height: 30px;
  margin-top: 4px;
  overflow: hidden;
}

.num-main { font-size: 24px; line-height: 1; color: #e7f6ff; }
.num-main.is-pair { font-size: 18px; }
.slash { font-size: 14px; color: #5d8eaa; }
.unit { flex-shrink: 0; font-size: 12px; color: #7eb4cc; }

.sub {
  margin-top: 2px;
  font-size: 12px;
  line-height: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ico {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  font-size: 13px;
  color: var(--c);
  background: color-mix(in srgb, var(--c) 16%, #07182c);
  border: 1px solid color-mix(in srgb, var(--c) 35%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .kpi { animation: none; }
}
```
