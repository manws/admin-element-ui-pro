<template>
  <div class="p-4">
    <el-card shadow="never">
      <el-tabs v-model="activeTab">
        <!-- 告警管理 -->
        <el-tab-pane label="告警管理" name="alarm">
          <el-form :model="queryParams" inline class="mb-2">
            <el-form-item label="设备识别码">
              <el-input v-model="queryParams.deviceCode" placeholder="IMEI" clearable style="width: 180px" />
            </el-form-item>
            <el-form-item label="车辆自编号">
              <el-input v-model="queryParams.selfNumber" placeholder="自编号" clearable style="width: 140px" />
            </el-form-item>
            <el-form-item label="故障类型">
              <el-select v-model="queryParams.faultType" placeholder="全部" clearable style="width: 160px">
                <el-option v-for="t in FAULT_TYPES" :key="t" :label="t" :value="t" />
              </el-select>
            </el-form-item>
            <el-form-item label="故障码">
              <el-input v-model="queryParams.faultCode" placeholder="故障码" clearable style="width: 120px" />
            </el-form-item>
            <el-form-item label="告警级别">
              <el-select v-model="queryParams.level" placeholder="全部" clearable style="width: 120px">
                <el-option v-for="l in ALARM_LEVELS" :key="l.value" :label="l.label" :value="l.value" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleQuery">查询</el-button>
              <el-button @click="handleReset">重置</el-button>
              <el-button type="success" :icon="'Download'" @click="handleExport">导出</el-button>
            </el-form-item>
          </el-form>

          <el-table v-loading="loading" :data="alarmList" border>
            <el-table-column type="index" label="#" width="55" />
            <el-table-column prop="deviceCode" label="设备识别码" width="170" />
            <el-table-column prop="selfNumber" label="车辆自编号" width="110" />
            <el-table-column prop="plateNumber" label="车牌号" width="110" />
            <el-table-column prop="vehicleUnit" label="车辆单位" min-width="150" />
            <el-table-column prop="faultType" label="故障类型" width="130" />
            <el-table-column prop="faultCode" label="故障码" width="90" />
            <el-table-column prop="faultReason" label="故障原因" min-width="160" />
            <el-table-column label="告警级别" width="100">
              <template #default="{ row }">
                <el-tag :type="ALARM_LEVEL_MAP[row.level]?.type" size="small">
                  {{ ALARM_LEVEL_MAP[row.level]?.label }}
                </el-tag>
                <el-tag v-if="row.level === 1" type="danger" effect="dark" size="small" class="ml-1">重点</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="alarmWay" label="告警方式" width="100" />
            <el-table-column prop="faultDate" label="故障日期" width="110" />
            <el-table-column prop="faultTime" label="故障发生时间" width="170" />
            <el-table-column prop="updateTime" label="最后更新时间" width="170" />
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="showRawMessage(row)">报文</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="flex justify-end mt-4">
            <el-pagination
              v-model:current-page="pageNum"
              v-model:page-size="pageSize"
              :total="total"
              :page-sizes="[10, 20, 30, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              background
              @size-change="loadAlarms"
              @current-change="loadAlarms"
            />
          </div>
        </el-tab-pane>

        <!-- 消息推送记录 -->
        <el-tab-pane label="消息推送记录" name="push">
          <el-alert type="info" :closable="false" show-icon class="mb-3" title="通过短信 / 微信小程序实时推送车辆故障告警、满电提示等信息" />
          <el-table v-loading="pushLoading" :data="pushRecords" border>
            <el-table-column type="index" label="#" width="55" />
            <el-table-column prop="time" label="推送时间" width="180" />
            <el-table-column prop="plateNumber" label="车牌号" width="120" />
            <el-table-column prop="channel" label="推送通道" width="120">
              <template #default="{ row }">
                <el-tag :type="row.channel === '短信' ? 'primary' : row.channel === '微信小程序' ? 'success' : 'info'" size="small">
                  {{ row.channel }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="推送类型" width="110" />
            <el-table-column prop="content" label="推送内容" min-width="240" />
            <el-table-column prop="status" label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="row.status === '已送达' ? 'success' : 'danger'" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 报文查看弹窗 -->
    <el-dialog v-model="messageVisible" title="原始报文（Hex）" width="640px">
      <div class="raw-message">
        <p class="text-sm mb-2">设备识别码：{{ currentAlarm?.deviceCode }}</p>
        <pre>{{ currentAlarm?.rawMessage }}</pre>
      </div>
      <template #footer>
        <el-button type="primary" @click="copyMessage">复制报文</el-button>
        <el-button @click="messageVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "MonitorAlarm" });

import { onMounted, ref } from "vue";
import MonitorAPI from "@/api/monitor";
import { ALARM_LEVELS, ALARM_LEVEL_MAP, FAULT_TYPES } from "@/constants/monitor";
import type { AlarmRecord, PushRecord } from "@/types/api/monitor";

const activeTab = ref("alarm");
const loading = ref(false);
const pushLoading = ref(false);
const alarmList = ref<AlarmRecord[]>([]);
const pushRecords = ref<PushRecord[]>([]);
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(10);
const messageVisible = ref(false);
const currentAlarm = ref<AlarmRecord>();

const queryParams = ref<Record<string, any>>({
  deviceCode: "",
  selfNumber: "",
  faultType: "",
  faultCode: "",
  level: "",
});

async function loadAlarms() {
  loading.value = true;
  try {
    const data = await MonitorAPI.getAlarms({ ...queryParams.value, pageNum: pageNum.value, pageSize: pageSize.value });
    alarmList.value = data.list;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
}

async function loadPushRecords() {
  pushLoading.value = true;
  try {
    const data = await MonitorAPI.getPushRecords({ pageNum: 1, pageSize: 50 });
    pushRecords.value = data.list;
  } finally {
    pushLoading.value = false;
  }
}

function handleQuery() {
  pageNum.value = 1;
  loadAlarms();
}

function handleReset() {
  queryParams.value = { deviceCode: "", selfNumber: "", faultType: "", faultCode: "", level: "" };
  handleQuery();
}

function showRawMessage(row: any) {
  currentAlarm.value = row;
  messageVisible.value = true;
}

function copyMessage() {
  if (currentAlarm.value) {
    navigator.clipboard?.writeText(currentAlarm.value.rawMessage).then(() => {
      ElMessage.success("已复制");
    });
  }
}

/** 前端 CSV 导出 */
function handleExport() {
  const headers = ["设备识别码", "车辆自编号", "车牌号", "故障类型", "故障码", "故障原因", "告警方式", "告警级别", "故障日期", "故障发生时间"];
  const rows = alarmList.value.map((a) => [
    a.deviceCode,
    a.selfNumber,
    a.plateNumber,
    a.faultType,
    a.faultCode,
    a.faultReason,
    a.alarmWay,
    ALARM_LEVEL_MAP[a.level]?.label ?? a.level,
    a.faultDate,
    a.faultTime,
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `告警记录_${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  ElMessage.success("导出成功");
}

onMounted(() => {
  loadAlarms();
  loadPushRecords();
});
</script>

<style lang="scss" scoped>
.raw-message {
  pre {
    padding: 12px;
    overflow-x: auto;
    font-family: "Courier New", monospace;
    font-size: 13px;
    line-height: 1.6;
    background: #1e1e1e;
    color: #d4d4d4;
    border-radius: 8px;
  }
}
</style>
