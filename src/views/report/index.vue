<template>
  <div class="report-page board-page">
    <section class="apron" aria-label="季度接入">
      <header class="apron-head">
        <div>
          <p class="kicker">{{ quarter.quarter }}</p>
          <h2>新车接入</h2>
        </div>
        <p class="roster">
          <span class="kicker">接入率 / 目标 {{ quarter.target }}%</span>
          <span class="readout is-accent">{{ quarter.rate }}%</span>
        </p>
      </header>
      <div class="tracks">
        <div v-for="item in quarterTracks" :key="item.key" class="track" :class="[item.tone, { 'has-value': item.value > 0 }]">
          <div class="track-head">
            <span class="track-label">{{ item.label }}</span>
            <span class="track-value">{{ item.value.toLocaleString() }}</span>
          </div>
          <div class="track-bar" aria-hidden="true">
            <span class="track-fill" :style="{ width: `${item.width}%` }" />
          </div>
          <p class="track-note">{{ item.note }}</p>
        </div>
      </div>
    </section>

    <section class="panel filter-panel">
      <el-radio-group v-model="typeFilter" @change="loadReports">
        <el-radio-button value="">全部</el-radio-button>
        <el-radio-button v-for="t in REPORT_TYPES" :key="t.value" :value="t.value">{{ t.label }}</el-radio-button>
      </el-radio-group>
      <div class="filter-actions">
        <el-select v-model="createType" style="width: 180px">
          <el-option v-for="t in REPORT_TYPES" :key="t.value" :label="t.label" :value="t.value" />
        </el-select>
        <el-button type="primary" @click="createReport">出具报告</el-button>
      </div>
    </section>

    <section class="report-grid">
      <article v-for="report in reports" :key="report.id" class="panel report-card">
        <div class="report-meta">
          <span class="kicker">{{ report.type }}</span>
          <span>{{ report.generateTime }}</span>
        </div>
        <h3>{{ report.title }}</h3>
        <p>周期 {{ report.period }} · {{ report.archived ? "已归档" : "未归档" }}</p>
        <p class="summary">{{ report.summary }}</p>
        <div class="report-actions">
          <button type="button" class="text-btn" @click="viewReport(report)">查看</button>
          <button type="button" class="text-btn" @click="downloadReport(report)">导出</button>
          <button type="button" class="text-btn" @click="archiveReport(report)">{{ report.archived ? "取消归档" : "归档" }}</button>
        </div>
      </article>
    </section>

    <el-empty v-if="!loading && reports.length === 0" description="暂无报告" />

    <el-dialog v-model="viewVisible" :title="current?.title" width="640px">
      <p class="dialog-line">类型 {{ current?.type }}</p>
      <p class="dialog-line">周期 {{ current?.period }}</p>
      <p class="dialog-line">生成时间 {{ current?.generateTime }}</p>
      <p class="summary">{{ current?.summary }}</p>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "ReportCenter" });

import { computed, onMounted, ref } from "vue";
import ReportAPI from "@/api/report";
import MonitorAPI from "@/api/monitor";
import { REPORT_TYPES } from "@/constants/monitor";
import type { Report } from "@/types/api/monitor";

const typeFilter = ref("");
const createType = ref("周报");
const reports = ref<Report[]>([]);
const loading = ref(false);
const viewVisible = ref(false);
const current = ref<Report>();
const quarter = ref({ quarter: "2026-Q4", entered: 0, connected: 0, rate: 0, target: 100, overdue: 0 });

const quarterTracks = computed(() => {
  const entered = quarter.value.entered;
  const share = (value: number) => {
    if (!entered) return 0;
    const pct = Math.min(100, (value / entered) * 100);
    return pct > 0 ? Math.max(pct, 2) : 0;
  };
  const label = (value: number) => {
    if (!entered) return "占进场 0%";
    const pct = (value / entered) * 100;
    return `占进场 ${pct > 0 && pct < 1 ? "<1" : Math.round(pct)}%`;
  };
  return [
    { key: "entered", label: "新车进场", value: entered, tone: "is-ink", width: entered ? 100 : 0, note: "本季分母" },
    { key: "connected", label: "已接入", value: quarter.value.connected, tone: "is-charge", width: share(quarter.value.connected), note: label(quarter.value.connected) },
    { key: "overdue", label: "超时未完成", value: quarter.value.overdue, tone: "is-fault", width: share(quarter.value.overdue), note: label(quarter.value.overdue) },
  ];
});

async function loadReports() {
  loading.value = true;
  try {
    const data = await ReportAPI.getReports({ type: typeFilter.value, pageNum: 1, pageSize: 50 });
    reports.value = data.list;
  } finally {
    loading.value = false;
  }
}

function viewReport(report: Report) {
  current.value = report;
  viewVisible.value = true;
}

function downloadReport(report: Report) {
  const text = `${report.title}\n类型：${report.type}\n周期：${report.period}\n生成时间：${report.generateTime}\n\n${report.summary}\n`;
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${report.title}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

async function archiveReport(report: Report) {
  await ReportAPI.archiveReport(report.id);
  await loadReports();
}

async function createReport() {
  await ReportAPI.createReport(createType.value);
  typeFilter.value = createType.value;
  await loadReports();
}

onMounted(async () => {
  quarter.value = await MonitorAPI.getAccessQuarterStats();
  await loadReports();
});
</script>

<style lang="scss" scoped>
.report-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.filter-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.filter-actions,
.report-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.report-card h3 {
  margin: 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--shell-text, #1b2b43);
}

.report-meta,
.report-card p,
.dialog-line {
  margin: 0;
  font-size: 13px;
  color: var(--shell-muted, #66758b);
}

.report-meta {
  display: flex;
  justify-content: space-between;
}

.summary {
  display: -webkit-box;
  margin: 8px 0 16px;
  overflow: hidden;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.report-actions {
  margin-top: 8px;
}

@media (max-width: 860px) {
  .report-grid {
    grid-template-columns: 1fr;
  }
}
</style>
