# 画布、背景、网格

设计宽固定 `1920`。高度不是写死的 `1080`：按窗口高度除以缩放比撑满，避免上下留白。

## useScreenScale

原样使用：

```ts
import { computed, onBeforeUnmount, onMounted, ref, type Ref } from 'vue';

export function useScreenScale(designW = 1920) {
  const scale = ref(1);
  const fillH = ref(1080);
  const screenRef = ref<HTMLElement | null>(null);

  const measure = () => {
    const next = window.innerWidth / designW;
    scale.value = next;
    fillH.value = Math.max(1, Math.round(window.innerHeight / next));
  };

  onMounted(() => {
    measure();
    window.addEventListener('resize', measure);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', measure);
  });

  const screenStyle = computed(() => ({
    width: `${designW}px`,
    height: `${fillH.value}px`,
    transform: `scale(${scale.value})`,
    transformOrigin: 'top left'
  }));

  const frameStyle = computed(() => ({
    width: `${designW * scale.value}px`,
    height: `${fillH.value * scale.value}px`
  }));

  return { screenRef: screenRef as Ref<HTMLElement | null>, screenStyle, frameStyle, fillH };
}
```

调用：`useScreenScale(1920)`。

## 页面壳

结构固定为三层：`viewport` → `frame` → `screen`。`screen` 内顺序是背景、顶栏、`main.stage`、可选告警层。

```vue
<div class="viewport">
  <div class="frame" :style="frameStyle">
    <div ref="screenRef" class="screen" :style="screenStyle">
      <div class="bg" />
      <ScreenHeader />
      <main class="stage">
        <KpiBar />
        <div class="board">
          <!-- 面板放这里，class 对应 grid-area -->
        </div>
      </main>
    </div>
  </div>
</div>
```

样例区域名和占位。新做大屏时，面板数量或占位变化前先问用户。改版已有页面时不要套用这段 4×2，沿用源页面的列宽和上下占比，间距仍是 `12px`：

```css
.board {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
  grid-template-rows: minmax(0, 1.48fr) minmax(0, 0.78fr);
  grid-template-areas:
    "meters flow flow pcs"
    "alarm alarm alarm soc";
  gap: 12px;
}
```

上行三块：左 1 列、中 2 列、右 1 列。下行：左 3 列、右 1 列。

## 页面样式

整段复制，不要改渐变色标或网格尺寸：

```css
.viewport {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: var(--c-bg);
}

.frame {
  position: relative;
  margin: 0 auto;
}

.screen {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--c-bg);
}

.screen::before {
  content: '';
  position: absolute;
  inset: 8px;
  border: 1px solid rgba(80, 190, 255, 0.35);
  box-shadow: inset 0 0 40px rgba(10, 80, 160, 0.25), 0 0 24px rgba(20, 120, 210, 0.15);
  pointer-events: none;
  z-index: 4;
}

.bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(rgba(58, 160, 220, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(58, 160, 220, 0.05) 1px, transparent 1px),
    radial-gradient(ellipse 70% 42% at 50% 0%, rgba(20, 110, 190, 0.38), transparent 62%),
    radial-gradient(ellipse 40% 30% at 50% 100%, rgba(0, 70, 140, 0.28), transparent 70%),
    linear-gradient(180deg, #06203a, #03101c 42%, #020814);
  background-size: 48px 48px, 48px 48px, auto, auto, auto;
}

main,
header {
  position: relative;
}

.stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px 12px;
  min-height: 0;
}
```

面板放进 `.board` 后还要保留这段，让面板撑满格子：

```css
.board :deep(.shell),
.board :deep(.panel),
.board :deep(.panel-body) {
  height: 100%;
  min-height: 0;
}

.board :deep(.panel) {
  display: flex;
  flex-direction: column;
}

.board :deep(.panel-body) {
  flex: 1;
  overflow: hidden;
}
```
