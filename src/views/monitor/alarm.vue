<template>
  <div class="alarm-page board-page">
    <section class="apron" aria-label="告警级别分布">
      <header class="apron-head">
        <div>
          <p class="kicker">告警</p>
          <h2>级别分布</h2>
        </div>
        <p class="roster">
          <span class="kicker">告警次数</span>
          <span class="readout">{{ alarmStats.total.toLocaleString() }}</span>
        </p>
      </header>
      <div class="tracks">
        <div v-for="item in alarmTracks" :key="item.key" class="track" :class="[item.tone, { 'has-value': item.value > 0 }]">
          <div class="track-head">
            <span class="track-label">{{ item.label }}</span>
            <span class="track-value">{{ item.value.toLocaleString() }}</span>
          </div>
          <div class="track-bar" aria-hidden="true">
            <span class="track-fill" :style="{ width: `${item.width}%` }" />
          </div>
          <p class="track-note">占告警 {{ item.shareLabel }}</p>
        </div>
      </div>
    </section>

    <section class="panel">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="实时告警" name="alarm">
          <el-form :model="queryParams" inline class="query-form">
            <el-form-item label="设备识别码">
              <el-input v-model="queryParams.deviceCode" placeholder="IMEI" clearable style="width: 160px" />
            </el-form-item>
            <el-form-item label="车辆自编号">
              <el-input v-model="queryParams.selfNumber" clearable style="width: 120px" />
            </el-form-item>
            <el-form-item label="故障类型">
              <el-select v-model="queryParams.faultType" placeholder="全部" clearable style="width: 140px">
                <el-option v-for="t in FAULT_TYPES" :key="t" :label="t" :value="t" />
              </el-select>
            </el-form-item>
            <el-form-item label="故障码">
              <el-input v-model="queryParams.faultCode" clearable style="width: 110px" />
            </el-form-item>
            <el-form-item label="故障原因">
              <el-input v-model="queryParams.faultReason" clearable style="width: 140px" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleQuery">查询</el-button>
              <el-button @click="handleReset">重置</el-button>
              <el-button type="primary" @click="handleExport">导出</el-button>
              <el-button @click="levelVisible = true">告警级别</el-button>
            </el-form-item>
          </el-form>

          <el-table v-loading="loading" :data="alarmList">
            <el-table-column prop="deviceCode" label="设备识别码" width="160" />
            <el-table-column prop="selfNumber" label="车辆自编号" width="110" />
            <el-table-column prop="vehicleUnit" label="车辆单位" min-width="140" />
            <el-table-column prop="faultType" label="故障类型" width="120" />
            <el-table-column prop="faultCode" label="故障码" width="90" />
            <el-table-column prop="faultReason" label="故障原因" min-width="160" />
            <el-table-column prop="alarmWay" label="告警方式" width="110" />
            <el-table-column label="级别" width="160">
              <template #default="{ row }">
                <span class="lamp" :class="levelTone(row.level)">{{ levelLabel(row.level) }}</span>
                <span v-if="row.level === 1" class="key-mark">重点车辆</span>
              </template>
            </el-table-column>
            <el-table-column prop="faultDate" label="故障日期" width="110" />
            <el-table-column prop="faultTime" label="故障发生时间" width="170" />
            <el-table-column prop="updateTime" label="最后更新时间" width="170" />
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <button type="button" class="text-btn" @click="showRawMessage(row)">报文</button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pager">
            <el-pagination
              v-model:current-page="pageNum"
              v-model:page-size="pageSize"
              :total="total"
              :page-sizes="[10, 20, 30, 50]"
              layout="total, sizes, prev, pager, next"
              @size-change="loadAlarms"
              @current-change="loadAlarms"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="消息推送" name="push">
          <p class="hint">通过平台短信或微信小程序推送故障告警与满电提示。</p>
          <el-table v-loading="pushLoading" :data="pushRecords">
            <el-table-column prop="time" label="推送时间" width="180" />
            <el-table-column prop="plateNumber" label="车牌号" width="120" />
            <el-table-column prop="channel" label="推送通道" width="120" />
            <el-table-column prop="type" label="推送类型" width="110" />
            <el-table-column prop="content" label="推送内容" min-width="240" />
            <el-table-column prop="status" label="状态" width="90" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="异常通知" name="notice">
          <p class="hint">异常通知采购人后保持可追踪，处理完成前结果为空。</p>
          <el-button type="primary" class="mb-16" @click="openNotice()">登记通知</el-button>
          <el-table :data="notices">
            <el-table-column prop="noticeTime" label="通知时间" width="170" />
            <el-table-column prop="target" label="通知对象" min-width="160" />
            <el-table-column prop="channel" label="渠道" width="110" />
            <el-table-column prop="content" label="内容" min-width="180" />
            <el-table-column prop="arrangement" label="采购人安排" min-width="160" />
            <el-table-column label="处理结果" min-width="140">
              <template #default="{ row }">{{ row.result || "处理中" }}</template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ row }">
                <button type="button" class="text-btn" @click="openNotice(row)">更新</button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </section>

    <el-dialog v-model="messageVisible" title="原始报文" width="640px">
      <p class="hint">设备识别码 {{ currentAlarm?.deviceCode }}</p>
      <pre class="raw-message">{{ currentAlarm?.rawMessage }}</pre>
    </el-dialog>

    <el-dialog v-model="levelVisible" title="告警级别" width="480px">
      <p class="hint">级别为严重时标记为重点车辆告警。</p>
      <div v-for="item in levelConfig" :key="item.value" class="level-row">
        <span>{{ item.value }}</span>
        <el-input v-model="item.label" />
        <span>{{ item.value === 1 ? "重点车辆告警" : "" }}</span>
      </div>
      <template #footer>
        <el-button type="primary" @click="levelVisible = false">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="noticeVisible" title="异常通知" width="560px">
      <el-form :model="noticeForm" label-width="100px">
        <el-form-item label="通知时间"><el-input v-model="noticeForm.noticeTime" /></el-form-item>
        <el-form-item label="通知对象"><el-input v-model="noticeForm.target" /></el-form-item>
        <el-form-item label="渠道">
          <el-select v-model="noticeForm.channel">
            <el-option label="短信" value="短信" />
            <el-option label="微信小程序" value="微信小程序" />
            <el-option label="电话" value="电话" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容"><el-input v-model="noticeForm.content" type="textarea" /></el-form-item>
        <el-form-item label="采购人安排"><el-input v-model="noticeForm.arrangement" type="textarea" /></el-form-item>
        <el-form-item label="处理结果"><el-input v-model="noticeForm.result" placeholder="未完成可留空" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="noticeVisible = false">取消</el-button>
        <el-button type="primary" @click="saveNotice">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "MonitorAlarm" });

import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import MonitorAPI from "@/api/monitor";
import { FAULT_TYPES } from "@/constants/monitor";
import type { AlarmRecord, NoticeRecord, PushRecord } from "@/types/api/monitor";

const route = useRoute();
const activeTab = ref("alarm");
const loading = ref(false);
const pushLoading = ref(false);
const alarmList = ref<AlarmRecord[]>([]);
const pushRecords = ref<PushRecord[]>([]);
const notices = ref<NoticeRecord[]>([]);
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(10);
const messageVisible = ref(false);
const levelVisible = ref(false);
const noticeVisible = ref(false);
const currentAlarm = ref<AlarmRecord>();
const alarmStats = ref({ total: 0, severe: 0, important: 0, normal: 0 });
const levelConfig = ref([
  { value: 1, label: "严重" },
  { value: 2, label: "重要" },
  { value: 3, label: "一般" },
]);
const noticeForm = ref<NoticeRecord>({
  id: 0,
  noticeTime: "",
  target: "",
  channel: "短信",
  content: "",
  arrangement: "",
  result: "",
});

const queryParams = ref({
  deviceCode: "",
  selfNumber: typeof route.query.selfNumber === "string" ? route.query.selfNumber : "",
  faultType: "",
  faultCode: "",
  faultReason: "",
});

function levelLabel(level: number) {
  return levelConfig.value.find((item) => item.value === level)?.label ?? String(level);
}

function levelTone(level: number) {
  if (level === 1) return "is-fault";
  if (level === 2) return "is-warn";
  return "";
}

const alarmTracks = computed(() => {
  const total = alarmStats.value.total;
  const build = (key: string, label: string, value: number, tone: string) => {
    const share = total ? Math.min(100, (value / total) * 100) : 0;
    return {
      key,
      label,
      value,
      tone,
      width: share > 0 ? Math.max(share, 2) : 0,
      shareLabel: share > 0 && share < 1 ? "<1%" : `${Math.round(share)}%`,
    };
  };
  return [
    build("severe", "严重", alarmStats.value.severe, "is-fault"),
    build("important", "重要", alarmStats.value.important, "is-warn"),
    build("normal", "一般", alarmStats.value.normal, "is-ink"),
  ];
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
  queryParams.value = { deviceCode: "", selfNumber: "", faultType: "", faultCode: "", faultReason: "" };
  handleQuery();
}

function showRawMessage(row: AlarmRecord) {
  currentAlarm.value = row;
  messageVisible.value = true;
}

function handleExport() {
  const headers = ["设备识别码", "车辆自编号", "车辆单位", "故障类型", "故障码", "故障原因", "告警方式", "故障日期", "故障发生时间", "故障最后更新时间"];
  const rows = alarmList.value.map((a) => [
    a.deviceCode, a.selfNumber, a.vehicleUnit, a.faultType, a.faultCode, a.faultReason, a.alarmWay, a.faultDate, a.faultTime, a.updateTime,
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `实时故障_${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function openNotice(row?: NoticeRecord) {
  noticeForm.value = row
    ? { ...row }
    : { id: 0, noticeTime: new Date().toISOString().slice(0, 16).replace("T", " "), target: "", channel: "短信", content: "", arrangement: "", result: "" };
  noticeVisible.value = true;
}

async function saveNotice() {
  await MonitorAPI.saveNotice(noticeForm.value);
  notices.value = (await MonitorAPI.getNotices()).list;
  noticeVisible.value = false;
}

onMounted(async () => {
  alarmStats.value = await MonitorAPI.getAlarmStats();
  notices.value = (await MonitorAPI.getNotices()).list;
  loadAlarms();
  loadPushRecords();
});
</script>

<style lang="scss" scoped>
.query-form {
  margin-bottom: 8px;
}

.hint {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--shell-muted, #66758b);
}

.mb-16 {
  margin-bottom: 16px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.key-mark {
  margin-left: 8px;
  font-size: 12px;
  color: var(--shell-fault, #c2410c);
}

.raw-message {
  padding: 16px;
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--shell-text, #1b2b43);
  word-break: break-all;
  background: var(--shell-bg, #f4f6fa);
  border-radius: 16px;
}

.level-row {
  display: grid;
  grid-template-columns: 24px 1fr 120px;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--shell-muted, #66758b);
}
</style>
