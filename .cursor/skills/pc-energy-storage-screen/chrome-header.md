# 顶栏

高度 `76px`。左右功能区各 `600px`，标题绝对居中，不参与 flex 占位。样式整段保留。可以改的只有文案节点和状态绑定。

DOM 骨架（class 不要改）：

```vue
<header class="head">
  <div class="relative flex items-center gap-3 w-[600px]">
    <button type="button" class="logo"><i class="ri-leaf-line" /></button>
    <div class="pill">
      <span class="stat">
        <span class="dot" />
        <span class="text-emerald-400 font-medium">系统运行正常</span>
      </span>
      <span class="sep" />
      <span class="stat"><span class="label">在线电表</span><span class="num text-slate-100 text-[16px]">5/5</span></span>
      <span class="sep" />
      <span class="stat">
        <span class="dot" />
        <span class="text-emerald-400 font-medium">数据实时</span>
      </span>
      <span class="sep" />
      <span class="stat"><span class="label">刷新周期</span><span class="num text-slate-100 text-[16px]">5s</span></span>
    </div>
  </div>

  <div class="title">
    <span class="eyebrow">Factory Energy Center</span>
    <h1>厂区智慧能源监控中心</h1>
  </div>

  <div class="relative flex items-center justify-end gap-2.5 w-[600px]">
    <div class="pill !gap-3">
      <span class="num text-[24px] leading-none text-slate-100 tracking-wide">{{ time }}</span>
      <span class="text-[12px] text-slate-400">{{ date }}</span>
    </div>
    <div class="hbtn !cursor-default">
      <i class="ri-volume-up-line text-cyan-300" />
      <el-switch v-model="soundOn" size="small" />
    </div>
    <button class="hbtn !px-0 w-[38px] justify-center"><i class="ri-fullscreen-line" /></button>
    <div class="pill !gap-2.5">
      <i class="ri-user-3-line text-cyan-300" />
      <span class="text-slate-100 font-medium">{{ userName }}</span>
      <span class="text-[12px] text-slate-400">{{ userCode }}</span>
    </div>
    <button class="hbtn !px-0 w-[38px] justify-center"><i class="ri-logout-box-r-line" /></button>
  </div>
</header>
```

状态点规则：

- 正常：`.dot`，字色 `text-emerald-400 font-medium`
- 告警：`.dot.is-alarm`，字色 `text-red-400 font-semibold`
- 连接中：`.dot.is-wait`，字色仍按样例；等待点本身是 `#f5c15a`
- 条目之间用 `<span class="sep" />`
- 胶囊数字：`num text-slate-100 text-[16px]`
- 字段名：class `label`

Logo 是 `36×36`、圆角 `11px`、渐变 `#7ce8ff → #196bad`，图标 `ri-leaf-line`。换图标或去掉 Logo 前先问用户。

## 样式

```css
.head {
  position: relative;
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px 6px;
  border-bottom: 1px solid rgba(90, 196, 255, 0.16);
}

.logo {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  font-size: 18px;
  color: #f2fbff;
  border-radius: 11px;
  background: linear-gradient(135deg, #7ce8ff 0%, #196bad 100%);
  box-shadow: inset 0 0 0 1px rgba(124, 232, 255, 0.45), 0 0 14px rgba(58, 180, 255, 0.45);
  cursor: pointer;
  transition: transform 0.25s var(--ease), box-shadow 0.25s var(--ease);
}

.logo:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 18px rgba(58, 212, 255, 0.75);
}

.stat {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.pill {
  height: 38px;
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 0 14px;
  font-size: 13px;
  border-radius: 2px;
  color: #c5e6f5;
  background: rgba(6, 28, 52, 0.72);
  border: 1px solid rgba(90, 196, 255, 0.35);
  box-shadow: inset 0 0 12px rgba(40, 140, 220, 0.12);
}

.sep {
  width: 1px;
  height: 14px;
  background: var(--c-line);
}

.dot {
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2ee59a;
  box-shadow: 0 0 8px rgba(46, 229, 154, 0.8);
}

.dot::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: currentColor;
  color: rgba(46, 229, 154, 0.45);
  animation: blink-soft 1.8s var(--ease) infinite;
}

.dot.is-alarm {
  background: #dc2626;
}

.dot.is-alarm::after {
  color: rgba(220, 38, 38, 0.4);
  animation-duration: 0.8s;
}

.dot.is-wait {
  background: #f5c15a;
  box-shadow: 0 0 8px rgba(245, 193, 90, 0.8);
}

.dot.is-wait::after {
  color: rgba(245, 193, 90, 0.45);
  animation-duration: 1s;
}

.title {
  position: absolute;
  left: 50%;
  top: 6px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.eyebrow {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: #7ee7ff;
}

.eyebrow::before,
.eyebrow::after {
  content: '';
  display: inline-block;
  width: 36px;
  height: 1px;
  margin: 0 10px 3px;
  background: linear-gradient(90deg, transparent, #3ad4ff);
  vertical-align: middle;
}

.eyebrow::after {
  background: linear-gradient(90deg, #3ad4ff, transparent);
}

.title h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: 0.28em;
  padding-left: 0.28em;
  color: #f4fbff;
  text-shadow: 0 0 18px rgba(80, 200, 255, 0.65);
}

.hbtn {
  height: 38px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  font-size: 13px;
  color: #c5e6f5;
  border-radius: 2px;
  background: rgba(6, 28, 52, 0.72);
  border: 1px solid rgba(90, 196, 255, 0.35);
  box-shadow: inset 0 0 12px rgba(40, 140, 220, 0.12);
  cursor: pointer;
  transition: background 0.25s var(--ease), color 0.25s, border-color 0.25s;
}

.hbtn:hover {
  background: rgba(20, 70, 110, 0.8);
  color: #e7f6ff;
  border-color: #7ee7ff;
}

.hbtn:active {
  transform: scale(0.97);
}
```

全屏按钮和退出按钮都是 `hbtn`，并加 `!px-0 w-[38px] justify-center`。声音开关所在的 `hbtn` 加 `!cursor-default`。
