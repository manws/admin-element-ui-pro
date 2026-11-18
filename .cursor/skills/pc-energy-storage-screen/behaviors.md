# 时钟与数字

这两处影响顶栏和 KPI 的观感，按下面实现。

## 时钟

顶栏时间 `HH:mm:ss`，日期 `YYYY.MM.DD 星期X`。`X` 用 `日一二三四五六`。

```ts
import { onBeforeUnmount, onMounted, ref } from 'vue';

const WEEK = ['日', '一', '二', '三', '四', '五', '六'];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function useClock() {
  const time = ref('--:--:--');
  const date = ref('');
  let timer: number | undefined;

  const tick = () => {
    const d = new Date();
    time.value = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    date.value = `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} 星期${WEEK[d.getDay()]}`;
  };

  onMounted(() => {
    tick();
    timer = window.setInterval(tick, 1000);
  });
  onBeforeUnmount(() => window.clearInterval(timer));

  return { time, date };
}
```

顶栏里时间 class 是 `num text-[24px] leading-none text-slate-100 tracking-wide`，日期 class 是 `text-[12px] text-slate-400`。

## 数字滚动

KPI 主数字用这个组件。根节点 class 必须保留 `num`，调用处再加 `num-main`。

```vue
<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';

const props = withDefaults(defineProps<{ value: number; decimals?: number; duration?: number }>(), {
  decimals: 1,
  duration: 600
});

const display = ref(Number.isFinite(props.value) ? props.value : 0);
let raf = 0;

watch(
  () => props.value,
  (to) => {
    if (!Number.isFinite(to)) return;
    cancelAnimationFrame(raf);
    const from = display.value;
    if (Math.abs(to - from) < Math.pow(10, -props.decimals)) {
      display.value = to;
      return;
    }
    const start = performance.now();
    const run = (now: number) => {
      const t = Math.min(1, (now - start) / props.duration);
      const e = 1 - Math.pow(1 - t, 3);
      display.value = from + (to - from) * e;
      if (t < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
  }
);

onBeforeUnmount(() => cancelAnimationFrame(raf));
</script>

<template>
  <span class="num">{{ Number.isFinite(value) ? display.toFixed(decimals) : '--' }}</span>
</template>
```

非数字显示 `--`。小数位跟用户确认的字段走，不要统一改成整数。
