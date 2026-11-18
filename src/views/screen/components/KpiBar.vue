<script setup lang="ts">
import AnimatedNumber from "./AnimatedNumber.vue";
import { kpis } from "../data";
</script>

<template>
  <div class="kpi-grid">
    <div
      v-for="(k, n) in kpis"
      :key="k.id"
      class="kpi"
      :style="{ '--c': k.color, animationDelay: `${n * 60}ms` }"
    >
      <div class="kpi-top">
        <div class="ico"><i :class="k.icon" /></div>
        <div class="label kpi-label">{{ k.label }}</div>
      </div>
      <div class="value">
        <AnimatedNumber :value="k.value" :decimals="k.decimals" class="num-main" :style="{ color: k.color }" />
      </div>
      <div class="sub">{{ k.sub }}</div>
      <div class="share"><i :style="{ width: `${k.share}%` }" /></div>
    </div>

    <div class="kpi weather" :style="{ '--c': '#3ad4ff', animationDelay: '360ms' }">
      <div class="wx-main">
        <div class="wx-now">
          <span class="wx-name">晴</span>
          <span class="num wx-temp">18°C</span>
        </div>
        <span class="wx-aqi">空气质量 良 · AQI 62</span>
      </div>
      <i class="wx-split" />
      <div class="wx-meta">
        <span>湿度 46%</span>
        <span>气压 1013 hPa</span>
        <span>西北风 3 级</span>
        <span>能见度 8.5 km</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr)) minmax(0, 2.08fr);
  gap: 12px;
  height: 100px;
}

.kpi {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: 8px 14px 8px 16px;
  border-radius: 0 !important;
  background: linear-gradient(180deg, rgba(12, 48, 86, 0.55), rgba(4, 18, 38, 0.88));
  border: 1px solid rgba(90, 196, 255, 0.45);
  box-shadow: inset 0 0 24px rgba(30, 140, 220, 0.12);
  overflow: hidden;
  animation: rise-in 0.7s var(--ease) both;
  transition: border-color 0.3s var(--ease);
}

.kpi::before {
  content: "";
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
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 0 2px #dc2626;
  animation: blink-soft 1s var(--ease) infinite;
  pointer-events: none;
}

.kpi-top {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.kpi-label {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.value {
  display: flex;
  align-items: baseline;
  gap: 4px;
  min-width: 0;
  height: 30px;
  margin-top: 4px;
  overflow: hidden;
}

.num-main {
  font-size: 24px;
  line-height: 1;
  color: #e7f6ff;
}

.unit {
  flex-shrink: 0;
  font-size: 12px;
  color: #7eb4cc;
}

.sub {
  margin-top: 2px;
  font-size: 12px;
  line-height: 16px;
  color: #7eb4cc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.share {
  position: absolute;
  left: 16px;
  right: 14px;
  bottom: 8px;
  height: 4px;
  margin: 0;
  background: rgba(4, 16, 28, 0.65);
}

.share i {
  display: block;
  height: 100%;
  background: var(--c);
}

.weather {
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  padding: 8px 16px;
}

.wx-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.wx-now {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.wx-name {
  font-size: 16px;
  font-weight: 600;
  color: #e7f6ff;
}

.wx-temp {
  font-size: 24px;
  line-height: 1;
  color: #e7f6ff;
}

.wx-aqi {
  font-size: 12px;
  line-height: 16px;
  color: #2ee59a;
  white-space: nowrap;
}

.wx-split {
  width: 1px;
  height: 36px;
  flex: none;
  background: rgba(90, 196, 255, 0.28);
}

.wx-meta {
  display: grid;
  grid-template-columns: auto auto;
  gap: 4px 16px;
  font-size: 13px;
  color: #7eb4cc;
  white-space: nowrap;
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
  .kpi {
    animation: none;
  }
}
</style>
