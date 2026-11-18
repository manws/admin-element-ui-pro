<script setup lang="ts">
import "@fontsource/instrument-sans/400.css";
import "@fontsource/instrument-sans/500.css";
import "@fontsource/instrument-sans/600.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "remixicon/fonts/remixicon.css";
import "./screen.css";
import { useScreenScale } from "./composables/useScreenScale";
import ScreenHeader from "./components/ScreenHeader.vue";
import KpiBar from "./components/KpiBar.vue";
import BasePanel from "./components/BasePanel.vue";
import ScreenPie from "./components/ScreenPie.vue";
import {
  alarmLegend,
  grades,
  mapLegend,
  mapSrc,
  mileage,
  mileageMax,
  recentAlarms,
  units,
} from "./data";

const { screenRef, screenStyle, frameStyle } = useScreenScale(1920);
</script>

<template>
  <div class="viewport screen-viewport">
    <p class="sr-only">此页面为设计还原演示，使用设计稿中的示例数据，未连接实时数据服务。</p>
    <div class="frame" :style="frameStyle">
      <div ref="screenRef" class="screen" :style="screenStyle">
        <div class="bg" />
        <ScreenHeader />
        <main class="stage">
          <KpiBar />
          <div class="board">
            <div class="col">
              <BasePanel class="span-440" title="全部单位在线分布" sub="Online Units" index="01">
                <template #extra><span class="extra-note num">1,626 辆</span></template>
                <div class="unit-body">
                  <div class="donut-fit">
                    <ScreenPie :data="units" value="1,626" caption="在线车辆 · 辆" />
                  </div>
                  <div class="legend legend-grid">
                    <span v-for="item in units" :key="item.name" class="legend-item">
                      <i class="dot" :style="{ background: item.color }" />
                      {{ item.name }}
                    </span>
                  </div>
                </div>
              </BasePanel>
              <BasePanel class="span-376" title="电池评估" sub="Battery Grade" index="02">
                <template #extra><span class="extra-note num">全量 1,936 辆</span></template>
                <div class="grade-body">
                  <div class="grade-unit">车辆数（辆）</div>
                  <div class="bars">
                    <div v-for="item in grades" :key="item.grade" class="bar-col">
                      <span class="num bar-val">{{ item.count.toLocaleString("en-US") }}</span>
                      <div class="bar-track">
                        <i :style="{ height: `${(item.count / grades[0].count) * 100}%`, background: item.color }" />
                      </div>
                      <span class="bar-grade" :style="{ color: item.color }">{{ item.grade }}</span>
                    </div>
                  </div>
                </div>
              </BasePanel>
            </div>

            <div class="col">
              <BasePanel class="span-528" title="机场车辆实时位置" sub="Gps Live Map" index="03">
                <template #extra>
                  <div class="map-key">
                    <span v-for="item in mapLegend" :key="item.name">
                      <i :style="{ background: item.color }" />
                      {{ item.name }}
                    </span>
                  </div>
                </template>
                <div class="map-body">
                  <div class="map-stage">
                    <img class="map-img" :src="mapSrc" alt="机场飞行区示意地图与在线、充电、告警车辆点位" />
                    <div class="alert">
                      <div class="alert-top">
                        <span class="alert-title">新告警 · 严重</span>
                        <span class="num alert-time">13:00:42</span>
                      </div>
                      <span class="alert-name">电池热失控前兆</span>
                      <span class="alert-meta">京A·D0412  ·  平台弹窗 + 短信</span>
                    </div>
                    <div class="ticker">
                      <span class="ticker-tag">电动车提示</span>
                      <span class="ticker-text">（待定）能见度良好，西北风 3 级，请注意低温下的续航衰减与充电安全 ……</span>
                    </div>
                  </div>
                </div>
              </BasePanel>
              <BasePanel class="span-288" title="单车里程 Top5" sub="Mileage Rank" index="04">
                <template #extra><span class="extra-note">单位：万 km</span></template>
                <div class="rank">
                  <div v-for="item in mileage" :key="item.plate" class="rank-row">
                    <span class="rank-plate">{{ item.plate }}</span>
                    <div class="track"><i :style="{ width: `${(item.value / mileageMax) * 100}%` }" /></div>
                    <span class="num rank-val">{{ item.value.toFixed(1) }}</span>
                  </div>
                </div>
              </BasePanel>
            </div>

            <div class="col">
              <BasePanel class="span-440" title="最近告警" sub="Latest 5" index="05">
                <div class="alarm-list">
                  <div
                    v-for="item in recentAlarms"
                    :key="item.time"
                    class="alarm-row"
                    :class="{ 'is-hot': item.hot }"
                    :style="{ '--c': item.color }"
                  >
                    <i class="ri-alarm-warning-fill alarm-ico" />
                    <div class="alarm-copy">
                      <div class="alarm-line">
                        <span class="alarm-title">{{ item.title }}</span>
                        <span class="num alarm-time">{{ item.time }}</span>
                      </div>
                      <span class="alarm-meta">{{ item.meta }}</span>
                    </div>
                  </div>
                </div>
              </BasePanel>
              <BasePanel class="span-376" title="告警统计" sub="Alarm Mix" index="06">
                <template #extra><span class="extra-note">当日 23 条 · 示意</span></template>
                <div class="stat-body">
                  <div class="donut-fit">
                    <ScreenPie :data="alarmLegend" value="23" caption="当日告警 · 条" />
                  </div>
                  <div class="legend legend-col">
                    <span v-for="item in alarmLegend" :key="item.name" class="legend-item">
                      <i class="swatch" :style="{ background: item.color }" />
                      {{ item.name }}
                    </span>
                  </div>
                </div>
              </BasePanel>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  content: "";
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

.board {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 416fr) minmax(0, 960fr) minmax(0, 464fr);
  gap: 12px;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  min-height: 0;
}

.col :deep(.span-440) { flex: 440 1 0; }
.col :deep(.span-376) { flex: 376 1 0; }
.col :deep(.span-528) { flex: 528 1 0; }
.col :deep(.span-288) { flex: 288 1 0; }

.board :deep(.shell),
.board :deep(.panel),
.board :deep(.panel-body) {
  min-height: 0;
}

.board :deep(.shell) {
  display: flex;
}

.board :deep(.panel) {
  display: flex;
  flex-direction: column;
}

.board :deep(.panel-body) {
  flex: 1;
  overflow: hidden;
}

.extra-note {
  font-size: 12px;
  color: #7eb4cc;
  white-space: nowrap;
}

.unit-body,
.grade-body,
.map-body,
.stat-body,
.alarm-list,
.rank {
  height: 100%;
  min-height: 0;
}

.unit-body {
  display: flex;
  flex-direction: column;
  padding: 8px 14px 12px;
}

.donut-fit {
  position: relative;
  flex: 1;
  min-height: 0;
}

.legend {
  flex-shrink: 0;
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px 8px;
}

.legend-col {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  min-width: 0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-size: 13px;
  color: #c5e6f5;
  white-space: nowrap;
}

.dot,
.swatch {
  flex: none;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.swatch {
  width: 10px;
  height: 10px;
}

.map-key {
  display: flex;
  align-items: center;
  gap: 10px;
}

.map-key span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #7eb4cc;
  white-space: nowrap;
}

.map-key i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.map-body {
  display: flex;
  flex-direction: column;
}

.map-stage {
  position: relative;
  flex: 1;
  min-height: 0;
  margin: 8px 12px 12px;
  overflow: hidden;
  background: #07182c;
}

.map-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.alert {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 268px;
  padding: 12px 14px;
  background: rgba(60, 12, 16, 0.85);
  border: 1px solid #dc2626;
  border-radius: 0;
}

.alert-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.alert-title {
  font-size: 14px;
  font-weight: 700;
  color: #ff6b6b;
}

.alert-time {
  font-size: 12px;
  color: #7eb4cc;
}

.alert-name {
  display: block;
  margin-top: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #e7f6ff;
}

.alert-meta {
  display: block;
  margin-top: 6px;
  font-size: 13px;
  color: #7eb4cc;
}

.ticker {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 36px;
  padding: 0 10px;
  background: rgba(6, 28, 52, 0.85);
  border: 1px solid rgba(90, 196, 255, 0.35);
  border-radius: 0;
}

.ticker-tag {
  display: inline-flex;
  flex: none;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 600;
  color: #7ee7ff;
  background: rgba(58, 212, 255, 0.12);
  border: 1px solid rgba(90, 196, 255, 0.35);
}

.ticker-text {
  overflow: hidden;
  font-size: 13px;
  color: #7eb4cc;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.alarm-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 10px 8px;
}

.alarm-row {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  padding: 4px 8px;
  background: transparent;
  border-bottom: 1px solid rgba(90, 196, 255, 0.08);
}

.alarm-ico {
  flex: none;
  width: 16px;
  font-size: 14px;
  color: var(--c);
  text-align: center;
}

.alarm-copy {
  flex: 1;
  min-width: 0;
}

.alarm-row.is-hot {
  background: rgba(180, 30, 30, 0.16);
  box-shadow: inset 2px 0 0 #ff6b6b;
}

.alarm-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.alarm-title {
  overflow: hidden;
  font-size: 13px;
  font-weight: 500;
  color: var(--c);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.alarm-time,
.alarm-meta {
  font-size: 11px;
  color: #5d8eaa;
}

.alarm-time {
  flex: none;
  color: #7eb4cc;
}

.alarm-meta {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.grade-body {
  display: flex;
  flex-direction: column;
  padding: 8px 16px 12px;
}

.grade-unit {
  flex-shrink: 0;
  font-size: 12px;
  color: #7eb4cc;
}

.bars {
  display: flex;
  flex: 1;
  gap: 12px;
  align-items: stretch;
  min-height: 0;
  margin-top: 8px;
}

.bar-col {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  min-height: 0;
}

.bar-val {
  flex-shrink: 0;
  font-size: 16px;
  color: #e7f6ff;
}

.bar-track {
  display: flex;
  flex: 1;
  align-items: flex-end;
  width: 28px;
  min-height: 0;
  margin: 6px 0;
}

.bar-track i {
  display: block;
  width: 100%;
  min-height: 4px;
}

.bar-grade {
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 600;
}

.rank {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 14px;
}

.rank-row {
  display: grid;
  grid-template-columns: 148px minmax(0, 1fr) 48px;
  gap: 12px;
  align-items: center;
}

.rank-plate {
  font-size: 14px;
  color: #e7f6ff;
  white-space: nowrap;
}

.track {
  position: relative;
  height: 12px;
  overflow: hidden;
  background:
    linear-gradient(90deg, transparent 49.6%, rgba(90, 196, 255, 0.45) 49.6%, rgba(90, 196, 255, 0.45) 50.4%, transparent 50.4%),
    rgba(4, 16, 28, 0.65);
  border: 1px solid rgba(90, 196, 255, 0.35);
}

.track i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #1aa8e6, #7ee7ff);
}

.rank-val {
  font-size: 16px;
  color: #e7f6ff;
  text-align: right;
}

.stat-body {
  display: flex;
  align-items: stretch;
  gap: 8px;
  padding: 4px 12px 8px;
}

.stat-body .legend {
  align-self: center;
}
</style>
