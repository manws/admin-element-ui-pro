<template>
  <div class="app-container random-simple">
    <!-- 算法介绍 -->
    <el-card shadow="never" class="mb-4">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-bold text-lg">算法介绍</span>
          <el-tag size="small" effect="plain">SIMPLE RANDOM</el-tag>
        </div>
      </template>
      <div class="algo-body">
        <h3>简单随机算法</h3>
        <el-row :gutter="24">
          <el-col :lg="8" :xs="24">
            <h4>算法定义</h4>
            <p>简单随机是最基础的随机分组方法。每一位受试者在入组时，均以<strong>独立且固定的概率</strong>被分配至 A 组或 B 组，前一位受试者的分组结果不会影响下一位受试者。</p>
          </el-col>
          <el-col :lg="8" :xs="24">
            <h4>适用场景</h4>
            <ul>
              <li>样本量相对充足，希望总体分配比例自然接近 1:1 的研究。</li>
              <li>基线特征差异对研究结果影响较小的探索性研究。</li>
              <li>需要快速完成随机分配逻辑原型、教学演示的场景。</li>
            </ul>
          </el-col>
          <el-col :lg="8" :xs="24">
            <h4>方法特点</h4>
            <ul>
              <li><strong>优点</strong>：实现简单、解释直接、操作成本低。</li>
              <li><strong>风险</strong>：样本量较小时可能出现阶段性不均衡。</li>
              <li><strong>实现</strong>：为每位受试者生成随机数，按阈值判定分组。</li>
            </ul>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 参数提示（紧凑横排） -->
    <el-row :gutter="12" class="mb-4">
      <el-col v-for="p in paramIntros" :key="p.title" :lg="6" :md="6" :xs="12">
        <div class="param-tip">
          <div class="param-tip-title">{{ p.title }}</div>
          <div class="param-tip-desc">{{ p.desc }}</div>
        </div>
      </el-col>
    </el-row>

    <!-- 模拟表单 -->
    <el-card shadow="never" class="mb-4">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-bold text-lg">模拟随机</span>
          <span class="text-xs text-gray">输入参数后生成 A/B 组入组结果</span>
        </div>
      </template>
      <el-form :model="form" label-position="top" class="sim-form">
        <el-row :gutter="16">
          <el-col :lg="5" :md="6" :xs="12">
            <el-form-item label="模拟受试者总数">
              <el-input-number v-model="form.subjectCount" :min="10" :max="500" :step="10" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :lg="5" :md="6" :xs="12">
            <el-form-item label="A组分配概率（%）">
              <el-input-number v-model="form.probabilityA" :min="1" :max="99" :step="5" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :lg="5" :md="6" :xs="12">
            <el-form-item label="随机种子">
              <el-input v-model="form.seed" placeholder="XH-20260329" />
            </el-form-item>
          </el-col>
          <el-col :lg="5" :md="6" :xs="12">
            <el-form-item label="随机号前缀">
              <el-input v-model="form.codePrefix" placeholder="RAND" maxlength="10" />
            </el-form-item>
          </el-col>
          <el-col :lg="4" :md="6" :xs="12">
            <el-form-item label=" ">
              <el-button type="primary" style="width:100%" @click="runSimulation">开始模拟</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="text-xs text-gray mt-2">
        简单随机的核心思想是：每一位受试者在入组时独立、等机会地分配至某一组。本示例使用可复现的伪随机数进行前端模拟，便于演示算法效果。
      </div>
    </el-card>

    <!-- 统计指标 -->
    <el-row :gutter="16" class="mb-4">
      <el-col :lg="6" :md="6" :xs="12">
        <el-card shadow="never" class="metric-card accent">
          <div class="text-xs text-gray mb-2">A组人数</div>
          <div class="text-3xl font-bold">{{ result.countA }}</div>
          <div class="text-xs text-gray mt-2">占比 {{ result.percentA }}%</div>
        </el-card>
      </el-col>
      <el-col :lg="6" :md="6" :xs="12">
        <el-card shadow="never" class="metric-card success">
          <div class="text-xs text-gray mb-2">B组人数</div>
          <div class="text-3xl font-bold">{{ result.countB }}</div>
          <div class="text-xs text-gray mt-2">占比 {{ result.percentB }}%</div>
        </el-card>
      </el-col>
      <el-col :lg="6" :md="6" :xs="12">
        <el-card shadow="never" class="metric-card warning">
          <div class="text-xs text-gray mb-2">组间差值</div>
          <div class="text-3xl font-bold">{{ result.gap }}</div>
          <div class="text-xs text-gray mt-2">{{ result.gap === 0 ? '当前完全均衡' : 'A/B 组人数差' }}</div>
        </el-card>
      </el-col>
      <el-col :lg="6" :md="6" :xs="12">
        <el-card shadow="never" class="metric-card neutral">
          <div class="text-xs text-gray mb-2">总受试者数</div>
          <div class="text-3xl font-bold">{{ result.subjectCount }}</div>
          <div class="text-xs text-gray mt-2">{{ result.countA === result.countB ? '当前分配完全均衡' : `当前 ${result.countA > result.countB ? 'A组' : 'B组'}更多` }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表 -->
    <el-row :gutter="16" class="mb-4">
      <el-col :lg="8" :xs="24">
        <el-card shadow="never"><template #header><span class="font-bold">随机结果占比</span></template><ECharts :options="pieOpts" height="280px" /></el-card>
      </el-col>
      <el-col :lg="8" :xs="24">
        <el-card shadow="never"><template #header><span class="font-bold">AB组人数对比</span></template><ECharts :options="barOpts" height="280px" /></el-card>
      </el-col>
      <el-col :lg="8" :xs="24">
        <el-card shadow="never"><template #header><span class="font-bold">AB组入组趋势</span></template><ECharts :options="lineOpts" height="280px" /></el-card>
      </el-col>
    </el-row>

    <!-- 结果说明 + 入组列表 -->
    <el-row :gutter="16" class="mb-4">
      <el-col :lg="12" :xs="24">
        <el-card shadow="never">
          <template #header><span class="font-bold">结果说明</span></template>
          <div class="text-sm leading-relaxed" v-html="narrativeHtml" />
        </el-card>
      </el-col>
      <el-col :lg="12" :xs="24">
        <el-card shadow="never">
          <template #header><span class="font-bold">受试者入组列表</span></template>
          <el-table :data="result.rows" size="small" max-height="400" stripe border>
            <el-table-column prop="subjectId" label="受试者编号" width="110" />
            <el-table-column prop="randomCode" label="随机号" min-width="200" />
            <el-table-column prop="randomValue" label="随机值" width="90" />
            <el-table-column prop="group" label="入组情况" width="90">
              <template #default="{ row }">
                <el-tag :type="row.group === 'A组' ? 'primary' : 'success'" size="small" effect="plain">{{ row.group }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { createSeededRandom, padNumber } from "./utils/random";

defineOptions({ name: "RandomSimple" });

const paramIntros = [
  { title: "模拟受试者总数", desc: "设置本次模拟纳入的受试者数量，例如 60、120、200。数值越大，越能观察简单随机下整体分配比例趋近 1:1 的过程。" },
  { title: "A组分配概率", desc: "定义每位受试者进入 A 组的理论概率，默认 50%。当设为 50% 时，表示 A/B 两组等概率随机分配。" },
  { title: "随机种子", desc: "用于复现实验结果。相同参数与相同种子会得到一致的模拟结果，便于演示、复核与讨论。" },
  { title: "随机号前缀", desc: "用于生成模拟随机码，例如 RAND、SIM。最终会与序号和随机片段组合成受试者随机号。" },
];

interface SimRow {
  subjectId: string;
  randomCode: string;
  randomValue: string;
  group: string;
}

interface SimResult {
  rows: SimRow[];
  trendA: number[];
  trendB: number[];
  trendLabels: string[];
  countA: number;
  countB: number;
  percentA: string;
  percentB: string;
  gap: number;
  subjectCount: number;
  probabilityA: number;
}

const form = reactive({
  subjectCount: 120,
  probabilityA: 50,
  seed: "XH-20260329",
  codePrefix: "RAND",
});

const result = ref<SimResult>({
  rows: [], trendA: [], trendB: [], trendLabels: [],
  countA: 0, countB: 0, percentA: "0.0", percentB: "0.0",
  gap: 0, subjectCount: 0, probabilityA: 0.5,
});

const pieOpts = ref({});
const barOpts = ref({});
const lineOpts = ref({});
const narrativeHtml = ref("");

function simulate() {
  const n = Math.min(500, Math.max(10, Math.round(form.subjectCount || 120)));
  const probA = Math.min(0.99, Math.max(0.01, (form.probabilityA || 50) / 100));
  const seed = form.seed.trim() || "XH-DEFAULT";
  const prefix = (form.codePrefix.trim() || "RAND").replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toUpperCase() || "RAND";

  const random = createSeededRandom(seed);
  const rows: SimRow[] = [];
  const trendA: number[] = [];
  const trendB: number[] = [];
  const trendLabels: string[] = [];
  let countA = 0;
  let countB = 0;

  for (let i = 1; i <= n; i++) {
    const rv = random();
    const group = rv < probA ? "A组" : "B组";
    if (group === "A组") countA++; else countB++;

    const entropy = Math.floor(random() * 1000000).toString().padStart(6, "0");
    rows.push({
      subjectId: `S${padNumber(i)}`,
      randomCode: `${prefix}-${padNumber(i)}-${entropy}`,
      randomValue: rv.toFixed(4),
      group,
    });

    trendLabels.push(`${i}`);
    trendA.push(countA);
    trendB.push(countB);
  }

  const pA = ((countA / n) * 100).toFixed(1);
  const pB = ((countB / n) * 100).toFixed(1);
  const gap = Math.abs(countA - countB);

  result.value = { rows, trendA, trendB, trendLabels, countA, countB, percentA: pA, percentB: pB, gap, subjectCount: n, probabilityA: probA };

  // 饼图
  pieOpts.value = {
    tooltip: { trigger: "item" },
    legend: { bottom: 0 },
    series: [{
      type: "pie", radius: ["40%", "70%"],
      data: [
        { value: countA, name: "A组", itemStyle: { color: "#409EFF" } },
        { value: countB, name: "B组", itemStyle: { color: "#67C23A" } },
      ],
      label: { formatter: "{b}: {c} ({d}%)" },
    }],
  };

  // 柱状图
  barOpts.value = {
    tooltip: { trigger: "axis" },
    grid: { left: "10%", right: "4%", bottom: "8%", top: "8%" },
    xAxis: { type: "category", data: ["A组", "B组"] },
    yAxis: { type: "value" },
    series: [{
      type: "bar", barWidth: "40%",
      data: [
        { value: countA, itemStyle: { color: "#409EFF", borderRadius: [6, 6, 0, 0] } },
        { value: countB, itemStyle: { color: "#67C23A", borderRadius: [6, 6, 0, 0] } },
      ],
    }],
  };

  // 趋势图
  lineOpts.value = {
    tooltip: { trigger: "axis" },
    legend: { data: ["A组累计", "B组累计"], bottom: 0 },
    grid: { left: "10%", right: "4%", bottom: "14%", top: "6%" },
    xAxis: {
      type: "category", data: trendLabels, name: "入组序号",
      axisLabel: { interval: Math.max(0, Math.floor(n / 8) - 1) },
    },
    yAxis: { type: "value" },
    series: [
      { name: "A组累计", type: "line", data: trendA, smooth: true, showSymbol: false, lineStyle: { width: 2.5 }, itemStyle: { color: "#409EFF" } },
      { name: "B组累计", type: "line", data: trendB, smooth: true, showSymbol: false, lineStyle: { width: 2.5 }, itemStyle: { color: "#67C23A" } },
    ],
  };

  // 结果叙述
  const dominant = countA === countB ? "两组完全均衡" : countA > countB ? "A组略多" : "B组略多";
  narrativeHtml.value = `
    本次简单随机共模拟 <strong>${n}</strong> 例受试者入组，其中 <strong>A组 ${countA} 例</strong>，占比 <strong>${pA}%</strong>；
    <strong>B组 ${countB} 例</strong>，占比 <strong>${pB}%</strong>。<br /><br />
    从整体结果看，当前分配状态为 <strong>${dominant}</strong>，组间人数差为 <strong>${gap}</strong> 例。
    在简单随机方法下，这种轻度波动属于正常现象；随着样本量增加，A/B 两组比例通常会逐步接近理论设定值 <strong>${(probA * 100).toFixed(0)}% / ${(100 - probA * 100).toFixed(0)}%</strong>。
  `;
}

function runSimulation() {
  simulate();
}

onMounted(simulate);
</script>

<style scoped>
.algo-body h3 { font-size: 18px; font-weight: 700; margin: 0 0 14px; }
.algo-body h4 { font-size: 14px; font-weight: 600; margin: 0 0 6px; color: var(--el-text-color-primary); }
.algo-body p, .algo-body ul { font-size: 13px; color: var(--el-text-color-secondary); line-height: 1.8; margin: 0 0 8px; }
.algo-body ul { padding-left: 16px; }

.param-tip {
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid var(--el-border-color-lighter);
  height: 100%;
}
.param-tip-title { font-size: 12px; font-weight: 700; color: var(--el-color-primary); margin-bottom: 4px; }
.param-tip-desc { font-size: 11.5px; color: var(--el-text-color-secondary); line-height: 1.6; }

.metric-card { text-align: center; }
.metric-card.accent { border-top: 3px solid #409EFF; }
.metric-card.success { border-top: 3px solid #67C23A; }
.metric-card.warning { border-top: 3px solid #E6A23C; }
.metric-card.neutral { border-top: 3px solid #909399; }
</style>
