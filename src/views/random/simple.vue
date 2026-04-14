<template>
  <div class="app-container random-simple">
    <!-- ===== 页头 Hero ===== -->
    <div class="page-hero mb-4">
      <div class="hero-text">
        <h1 class="hero-title">简单随机</h1>
        <p class="hero-desc">使用均匀分布随机数生成器，将受试者等概率分配到各试验组</p>
      </div>
      <el-tag class="hero-tag" effect="plain" size="large" round>SIMPLE RANDOM</el-tag>
      <div class="hero-watermark">SR</div>
    </div>

    <!-- ===== 算法介绍 + 参数介绍 ===== -->
    <el-row :gutter="16" class="mb-4" style="align-items:stretch">
      <el-col :lg="16" :xs="24">
        <div class="algo-card">
          <div class="algo-card-header">
            <div class="algo-card-icon">
              <div class="i-svg:el-icon-Document" style="width:16px;height:16px" />
            </div>
            <span>算法介绍</span>
          </div>
          <div class="algo-body">
            <h3>简单随机算法</h3>
            <h4>算法定义</h4>
            <p>简单随机是最基础的随机分组方法。每一位受试者在入组时，均以<strong>独立且固定的概率</strong>被分配至 A 组或 B 组，前一位受试者的分组结果不会影响下一位受试者。</p>
            <h4>适用场景</h4>
            <ul>
              <li>样本量相对充足，希望总体分配比例自然接近 1:1 的研究。</li>
              <li>基线特征差异对研究结果影响较小的探索性研究。</li>
              <li>需要快速完成随机分配逻辑原型、教学演示或统计方法说明的场景。</li>
            </ul>
            <h4>方法特点</h4>
            <ul>
              <li><strong>优点</strong>：实现简单、解释直接、操作成本低。</li>
              <li><strong>风险</strong>：当样本量较小时，可能出现阶段性 A/B 组人数不均衡。</li>
              <li><strong>实现要点</strong>：通常为每位受试者生成一个随机数，再按预设阈值判定进入 A 组或 B 组。</li>
            </ul>
          </div>
        </div>
      </el-col>
      <el-col :lg="8" :xs="24">
        <div class="param-sidebar">
          <div class="param-sidebar-header">
            <div class="param-sidebar-icon">
              <div class="i-svg:el-icon-InfoFilled" style="width:14px;height:14px;color:var(--el-color-primary)" />
            </div>
            <span>参数介绍</span>
          </div>
          <div class="param-sidebar-list">
            <div v-for="(p, i) in paramIntros" :key="p.title" class="param-sidebar-item">
              <div class="param-sidebar-num">{{ String(i + 1).padStart(2, '0') }}</div>
              <div>
                <div class="param-sidebar-name">{{ p.title }}</div>
                <div class="param-sidebar-desc">{{ p.desc }}</div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- ===== 模拟表单 ===== -->
    <div class="sim-card mb-4">
      <div class="sim-card-header">
        <div class="sim-card-left">
          <div class="sim-card-icon">
            <div class="i-svg:el-icon-VideoPlay" style="width:16px;height:16px" />
          </div>
          <span class="sim-card-title">模拟随机</span>
        </div>
        <span class="sim-card-hint">输入参数后生成 A/B 组入组结果</span>
      </div>
      <div class="sim-card-body">
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
            <el-col :lg="4" :md="6" :xs="12" class="btn-col">
              <el-button type="primary" style="width:100%" @click="runSimulation">开始模拟</el-button>
            </el-col>
          </el-row>
        </el-form>
        <div class="sim-card-tip">
          简单随机的核心思想是：每一位受试者在入组时独立、等机会地分配至某一组。本示例使用可复现的伪随机数进行前端模拟，便于演示算法效果。
        </div>
      </div>
    </div>

    <!-- 统计指标 -->
    <el-row :gutter="16" class="mb-4 metrics-row">
      <el-col :lg="6" :md="6" :xs="12">
        <div class="metric-card mc-blue" data-watermark="A">
          <div class="mc-content">
            <div class="mc-label">A组人数</div>
            <div class="mc-value">{{ result.countA }}</div>
            <div class="mc-sub">占比 {{ result.percentA }}%</div>
          </div>
          <div class="mc-icon"><div class="i-svg:el-icon-User" /></div>
        </div>
      </el-col>
      <el-col :lg="6" :md="6" :xs="12">
        <div class="metric-card mc-green" data-watermark="B">
          <div class="mc-content">
            <div class="mc-label">B组人数</div>
            <div class="mc-value">{{ result.countB }}</div>
            <div class="mc-sub">占比 {{ result.percentB }}%</div>
          </div>
          <div class="mc-icon"><div class="i-svg:el-icon-UserFilled" /></div>
        </div>
      </el-col>
      <el-col :lg="6" :md="6" :xs="12">
        <div class="metric-card mc-amber" data-watermark="Δ">
          <div class="mc-content">
            <div class="mc-label">组间差值</div>
            <div class="mc-value">{{ result.gap }}</div>
            <div class="mc-sub">{{ result.gap === 0 ? '完全均衡' : 'A/B 组人数差' }}</div>
          </div>
          <div class="mc-icon"><div class="i-svg:el-icon-Sort" /></div>
        </div>
      </el-col>
      <el-col :lg="6" :md="6" :xs="12">
        <div class="metric-card mc-neutral" data-watermark="Σ">
          <div class="mc-content">
            <div class="mc-label">总受试者数</div>
            <div class="mc-value">{{ result.subjectCount }}</div>
            <div class="mc-sub">{{ result.countA === result.countB ? '分配完全均衡' : `${result.countA > result.countB ? 'A组' : 'B组'}更多` }}</div>
          </div>
          <div class="mc-icon"><div class="i-svg:el-icon-Tickets" /></div>
        </div>
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

    <!-- 入组列表 + 结果说明 -->
    <el-row :gutter="16" class="mb-4">
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
      <el-col :lg="12" :xs="24">
        <el-card shadow="never">
          <template #header><span class="font-bold">结果说明</span></template>
          <div class="text-sm leading-relaxed" v-html="narrativeHtml" />
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
        { value: countA, name: "A组", itemStyle: { color: "#4558d0" } },
        { value: countB, name: "B组", itemStyle: { color: "#22c55e" } },
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
        { value: countA, itemStyle: { color: "#4558d0", borderRadius: [6, 6, 0, 0] } },
        { value: countB, itemStyle: { color: "#22c55e", borderRadius: [6, 6, 0, 0] } },
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
      { name: "A组累计", type: "line", data: trendA, smooth: true, showSymbol: false, lineStyle: { width: 2.5 }, itemStyle: { color: "#4558d0" }, areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(69,88,208,0.15)" }, { offset: 1, color: "rgba(69,88,208,0)" }] } } },
      { name: "B组累计", type: "line", data: trendB, smooth: true, showSymbol: false, lineStyle: { width: 2.5 }, itemStyle: { color: "#22c55e" }, areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(34,197,94,0.15)" }, { offset: 1, color: "rgba(34,197,94,0)" }] } } },
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
/* ===== 页头 Hero ===== */
.page-hero {
  position: relative;
  padding: 28px 28px 24px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(69,88,208,0.08) 0%, rgba(69,88,208,0.02) 100%);
  border: 1px solid var(--el-border-color-lighter);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.hero-text { position: relative; z-index: 1; }
.hero-title {
  font-size: 24px; font-weight: 800; letter-spacing: -0.5px;
  color: var(--el-text-color-primary); margin: 0 0 4px;
}
.hero-desc { font-size: 13.5px; color: var(--el-text-color-secondary); margin: 0; line-height: 1.5; }
.hero-tag { position: relative; z-index: 1; flex-shrink: 0; }
.hero-watermark {
  position: absolute; right: 24px; top: 50%; transform: translateY(-50%);
  font-family: 'JetBrains Mono', monospace;
  font-size: 88px; font-weight: 900; line-height: 1;
  color: rgba(69, 88, 208, 0.05);
  pointer-events: none; user-select: none;
}

/* ===== 算法介绍卡片 ===== */
.algo-card {
  height: 100%;
  border-radius: 14px;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-lighter);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.algo-card-header {
  display: flex; align-items: center; gap: 8px;
  padding: 16px 20px;
  font-size: 15px; font-weight: 700;
  color: var(--el-text-color-primary);
  border-bottom: 1px solid var(--el-border-color-extra-light);
  background: linear-gradient(180deg, rgba(69,88,208,0.03) 0%, transparent 100%);
}
.algo-card-icon {
  width: 30px; height: 30px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #4558d0, #6b82f0);
  color: #fff; flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(69,88,208,0.25);
}
.algo-card .algo-body { padding: 20px; flex: 1; }

/* ===== 算法说明排版 ===== */
.algo-body h3 { font-size: 18px; font-weight: 700; margin: 0 0 14px; }
.algo-body h4 {
  font-size: 13.5px; font-weight: 600; margin: 16px 0 6px;
  color: var(--el-text-color-primary);
  display: flex; align-items: center; gap: 6px;
}
.algo-body h4::before {
  content: ""; display: inline-block;
  width: 3px; height: 14px; border-radius: 2px;
  background: linear-gradient(180deg, #4558d0, #6b82f0);
  flex-shrink: 0;
}
.algo-body h4:first-of-type { margin-top: 0; }
.algo-body p, .algo-body ul { font-size: 13px; color: var(--el-text-color-secondary); line-height: 1.85; margin: 0 0 4px; }
.algo-body ul { padding-left: 16px; }

/* ===== 参数介绍侧边栏 ===== */
.param-sidebar {
  height: 100%;
  padding: 20px;
  border-radius: 14px;
  background: linear-gradient(160deg, rgba(69, 88, 208, 0.06) 0%, rgba(69, 88, 208, 0.015) 100%);
  border: 1px solid var(--el-border-color-lighter);
  display: flex; flex-direction: column;
}
.param-sidebar-header {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 18px; padding-bottom: 14px;
  font-size: 14px; font-weight: 700;
  color: var(--el-text-color-primary);
  border-bottom: 1px solid var(--el-border-color-extra-light);
}
.param-sidebar-icon {
  width: 28px; height: 28px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(69, 88, 208, 0.1); flex-shrink: 0;
}
.param-sidebar-list { display: flex; flex-direction: column; gap: 16px; flex: 1; }
.param-sidebar-item { display: flex; gap: 10px; align-items: flex-start; }
.param-sidebar-num {
  width: 26px; height: 26px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #4558d0, #5a6ee0);
  color: #fff; font-size: 11px; font-weight: 700;
  flex-shrink: 0; margin-top: 1px;
  box-shadow: 0 2px 6px rgba(69, 88, 208, 0.25);
}
.param-sidebar-name { font-size: 13px; font-weight: 600; color: var(--el-text-color-primary); margin-bottom: 3px; }
.param-sidebar-desc { font-size: 11.5px; color: var(--el-text-color-secondary); line-height: 1.65; }

/* ===== 模拟随机卡片 ===== */
.sim-card {
  border-radius: 14px;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-lighter);
  overflow: hidden;
}
.sim-card-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-extra-light);
  background: linear-gradient(180deg, rgba(69,88,208,0.03) 0%, transparent 100%);
}
.sim-card-left { display: flex; align-items: center; gap: 8px; }
.sim-card-icon {
  width: 30px; height: 30px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #16a34a, #4ade80);
  color: #fff; flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(22,163,74,0.25);
}
.sim-card-title { font-size: 15px; font-weight: 700; color: var(--el-text-color-primary); }
.sim-card-hint { font-size: 12px; color: var(--el-text-color-placeholder); }
.sim-card-body { padding: 20px; }
.sim-card-tip {
  font-size: 12px; color: var(--el-text-color-placeholder); line-height: 1.6;
  margin-top: 8px; padding-top: 12px;
  border-top: 1px dashed var(--el-border-color-extra-light);
}

/* ===== 指标卡片 — 彩色渐变 + 水印 ===== */
.metrics-row { --mc-gap: 16px; }
.metric-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 18px;
  border-radius: 14px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: default;
  min-height: 110px;
}
.metric-card:hover {
  transform: translateY(-4px);
  filter: brightness(1.05);
}

/* 四色渐变背景 */
.mc-blue   { background: linear-gradient(135deg, #4558d0 0%, #6b82f0 100%); box-shadow: 0 4px 16px rgba(69, 88, 208, 0.3); }
.mc-green  { background: linear-gradient(135deg, #16a34a 0%, #4ade80 100%); box-shadow: 0 4px 16px rgba(22, 163, 74, 0.3); }
.mc-amber  { background: linear-gradient(135deg, #e67e22 0%, #f0b44a 100%); box-shadow: 0 4px 16px rgba(230, 126, 34, 0.25); }
.mc-neutral { background: linear-gradient(135deg, #5b6178 0%, #8b91a8 100%); box-shadow: 0 4px 16px rgba(91, 97, 120, 0.25); }

/* 右侧水印大字 — 通过 data-watermark */
.metric-card::after {
  content: attr(data-watermark);
  position: absolute;
  right: 12px;
  bottom: -8px;
  font-family: 'JetBrains Mono', 'IBM Plex Mono', monospace;
  font-size: 72px;
  font-weight: 800;
  line-height: 1;
  color: rgba(255, 255, 255, 0.1);
  pointer-events: none;
  user-select: none;
}

/* 左侧内容 */
.mc-content { position: relative; z-index: 1; flex: 1; min-width: 0; }
.mc-label { font-size: 12px; color: rgba(255, 255, 255, 0.7); margin-bottom: 6px; font-weight: 500; letter-spacing: 0.3px; }
.mc-value {
  font-family: 'JetBrains Mono', 'IBM Plex Mono', monospace;
  font-size: 28px; font-weight: 800; letter-spacing: -0.5px;
  line-height: 1.1;
  color: #fff;
}
.mc-sub { font-size: 11px; color: rgba(255, 255, 255, 0.55); margin-top: 6px; font-weight: 500; }

/* 右上角图标 */
.mc-icon {
  width: 42px; height: 42px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; font-size: 20px;
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.85);
  position: relative;
  z-index: 1;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* ===== 通用 ===== */
.h-full { height: 100%; }
.btn-col { display: flex; align-items: flex-end; padding-bottom: 18px; }
</style>
