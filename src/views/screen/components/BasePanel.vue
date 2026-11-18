<script setup lang="ts">
import { computed } from "vue";

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

<style scoped>
.shell {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 0 !important;
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
  border-radius: 0 !important;
  background: linear-gradient(180deg, rgba(12, 48, 86, 0.55), rgba(4, 18, 38, 0.88));
  box-shadow: inset 0 0 24px rgba(30, 140, 220, 0.12);
  border: 1px solid rgba(90, 196, 255, 0.45);
  overflow: hidden;
}

.panel::before,
.panel::after {
  content: "";
  position: absolute;
  width: 12px;
  height: 12px;
  border: 2px solid #7ee7ff;
  z-index: 3;
  pointer-events: none;
}

.panel::before {
  top: -1px;
  left: -1px;
  border-right: 0;
  border-bottom: 0;
}

.panel::after {
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
  content: "";
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
  min-height: 0;
}

@media (prefers-reduced-motion: reduce) {
  .shell {
    animation: none;
  }
}
</style>
