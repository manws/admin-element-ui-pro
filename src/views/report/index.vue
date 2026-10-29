<template>
  <div class="p-4 space-y-4">
    <el-card shadow="never">
      <div class="flex flex-wrap items-center gap-4">
        <span class="text-sm">报告类型：</span>
        <el-radio-group v-model="typeFilter" @change="loadReports">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button v-for="t in REPORT_TYPES" :key="t.value" :value="t.value">{{ t.label }}</el-radio-button>
        </el-radio-group>
      </div>
    </el-card>

    <el-row :gutter="16">
      <el-col v-for="report in reports" :key="report.id" :xs="24" :sm="12" :lg="8">
        <el-card shadow="hover" class="report-card">
          <div class="flex items-start justify-between">
            <el-tag :type="typeTag(report.type)" size="small">{{ report.type }}</el-tag>
            <span class="text-xs text-[--el-text-color-secondary]">{{ report.generateTime }}</span>
          </div>
          <p class="report-title">{{ report.title }}</p>
          <p class="text-xs text-[--el-text-color-secondary] mb-2">报告周期：{{ report.period }}</p>
          <p class="report-summary">{{ report.summary }}</p>
          <div class="flex items-center justify-between mt-3">
            <span>
              <el-tag v-for="f in report.fileType.split('+')" :key="f" size="small" type="info" class="mr-1">{{ f }}</el-tag>
            </span>
            <el-button type="primary" size="small" @click="downloadReport(report)">下载</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="!loading && reports.length === 0" description="暂无报告" />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "ReportCenter" });

import { onMounted, ref } from "vue";
import ReportAPI from "@/api/report";
import { REPORT_TYPES } from "@/constants/monitor";
import type { Report } from "@/types/api/monitor";

const typeFilter = ref("");
const reports = ref<Report[]>([]);
const loading = ref(false);

function typeTag(type: string): "primary" | "success" | "warning" | "danger" | "info" {
  if (type === "年报" || type === "半年报") return "danger";
  if (type === "月报") return "warning";
  if (type === "高危报警专项") return "danger";
  if (type.includes("统计")) return "warning";
  if (type === "周报") return "success";
  return "info";
}

async function loadReports() {
  loading.value = true;
  try {
    const data = await ReportAPI.getReports({ type: typeFilter.value, pageNum: 1, pageSize: 50 });
    reports.value = data.list;
  } finally {
    loading.value = false;
  }
}

function downloadReport(report: Report) {
  ElMessage.success(`正在下载：${report.title}`);
}

onMounted(loadReports);
</script>

<style lang="scss" scoped>
.report-card {
  margin-bottom: 16px;

  :deep(.el-card__body) {
    padding: 18px;
  }

  .report-title {
    margin: 10px 0 4px;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.4;
  }

  .report-summary {
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
</style>
