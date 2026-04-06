<template>
  <div class="app-container">
    <el-row :gutter="16" class="mb-4">
      <el-col :lg="16" :xs="24">
        <el-card shadow="never">
          <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">频数分布</span><el-tag size="small" effect="plain">FREQUENCY</el-tag></div></template>
          <el-form label-position="top">
            <el-form-item label="输入数据（逗号、空格或换行分隔）">
              <el-input v-model="rawData" type="textarea" :rows="4" placeholder="输入数值数据..." />
            </el-form-item>
            <el-row :gutter="16">
              <el-col :span="8"><el-form-item label="分组数"><el-input-number v-model="binCount" :min="3" :max="30" :step="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="16" class="btn-col">
                  <el-button type="primary" @click="calculate">计算</el-button>
                  <el-button @click="loadDemo">加载示例</el-button>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-col>
      <el-col :lg="8" :xs="24">
        <div class="param-sidebar">
          <div class="param-sidebar-header"><span>说明</span></div>
          <div class="text-xs text-gray leading-relaxed">
            <p>将连续数据按等距分组，生成频数表和频率直方图。</p>
            <p><strong>频数</strong>：落在各组的观测值个数</p>
            <p><strong>频率</strong>：频数 / 总数</p>
            <p><strong>累计频率</strong>：从最小组到当前组的频率累加</p>
          </div>
        </div>
      </el-col>
    </el-row>

    <template v-if="rows.length">
      <el-row :gutter="16" class="mb-4">
        <el-col :lg="10" :xs="24">
          <el-card shadow="never">
            <template #header><span class="font-bold">频数分布表</span></template>
            <el-table :data="rows" size="small" stripe border show-summary :summary-method="summaryMethod">
              <el-table-column prop="range" label="组段" min-width="120" />
              <el-table-column prop="count" label="频数" width="80" />
              <el-table-column prop="freq" label="频率" width="100" />
              <el-table-column prop="cumFreq" label="累计频率" width="100" />
            </el-table>
          </el-card>
        </el-col>
        <el-col :lg="14" :xs="24">
          <el-card shadow="never" class="mb-4">
            <template #header><span class="font-bold">频率直方图</span></template>
            <ECharts :options="histOpts" height="320px" />
          </el-card>
          <el-card shadow="never">
            <template #header><span class="font-bold">累计频率曲线</span></template>
            <ECharts :options="cumOpts" height="260px" />
          </el-card>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script setup lang="ts">
import * as S from "../utils/stats";

defineOptions({ name: "Frequency" });

const rawData = ref("");
const binCount = ref(8);
const rows = ref<any[]>([]);
const histOpts = ref({});
const cumOpts = ref({});

const demoData = "152,158,149,163,155,170,165,148,160,157,168,153,162,156,172,145,166,154,161,159,150,167,164,158,171,147,169,151,163,155,160,146,173,157,165,149,162,156,168,153";

function loadDemo() { rawData.value = demoData; calculate(); }

function summaryMethod({ data }: any) {
  return ["合计", data.reduce((s: number, r: any) => s + r.count, 0), "100.00%", ""];
}

function calculate() {
  const data = S.parseNumbers(rawData.value);
  if (data.length < 3) { ElMessage.warning("请输入至少 3 个数值"); return; }

  const mn = S.min(data), mx = S.max(data);
  const bins = binCount.value;
  const bw = (mx - mn) / bins;
  const result: any[] = [];
  let cumCount = 0;

  for (let i = 0; i < bins; i++) {
    const lo = mn + i * bw;
    const hi = lo + bw;
    const count = data.filter((v) => i === bins - 1 ? (v >= lo && v <= hi) : (v >= lo && v < hi)).length;
    cumCount += count;
    result.push({
      range: `[${S.fmt(lo, 2)}, ${S.fmt(hi, 2)}${i === bins - 1 ? "]" : ")"}`,
      lo, hi, count,
      freq: (count / data.length * 100).toFixed(2) + "%",
      cumFreq: (cumCount / data.length * 100).toFixed(2) + "%",
      cumPct: cumCount / data.length * 100,
    });
  }
  rows.value = result;

  histOpts.value = {
    tooltip: { trigger: "axis" },
    grid: { left: "8%", right: "4%", bottom: "10%", top: "6%" },
    xAxis: { type: "category", data: result.map((r) => S.fmt(r.lo, 1)), name: "组段起点" },
    yAxis: [
      { type: "value", name: "频数", position: "left" },
      { type: "value", name: "频率(%)", position: "right", max: 100 },
    ],
    series: [
      { type: "bar", data: result.map((r) => r.count), yAxisIndex: 0, itemStyle: { color: "#409EFF", borderRadius: [4, 4, 0, 0] } },
      { type: "line", data: result.map((r) => +(r.count / data.length * 100).toFixed(2)), yAxisIndex: 1, smooth: true, lineStyle: { color: "#E6A23C", width: 2 }, itemStyle: { color: "#E6A23C" }, showSymbol: false },
    ],
  };

  cumOpts.value = {
    tooltip: { trigger: "axis" },
    grid: { left: "8%", right: "4%", bottom: "10%", top: "6%" },
    xAxis: { type: "category", data: result.map((r) => S.fmt(r.hi, 1)) },
    yAxis: { type: "value", name: "累计频率(%)", max: 100 },
    series: [{ type: "line", data: result.map((r) => +r.cumPct.toFixed(2)), smooth: true, areaStyle: { opacity: 0.08 }, lineStyle: { width: 2.5 }, itemStyle: { color: "#67C23A" } }],
  };
}
</script>

<style scoped>
.param-sidebar { height: 100%; padding: 18px; border-radius: var(--el-card-border-radius, 12px); background: rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.03); border: 1px solid var(--el-border-color-lighter); }
.param-sidebar-header { font-size: 14px; font-weight: 700; margin-bottom: 12px; }
.param-sidebar p { margin: 4px 0; }
.btn-col { display: flex; align-items: flex-end; padding-bottom: 18px; gap: 8px; }
</style>
