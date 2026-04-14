<template>
  <div class="app-container random-sblock">
    <!-- 页头 Hero -->
    <div class="page-hero mb-4">
      <div class="hero-text">
        <h1 class="hero-title">分层区组随机</h1>
        <p class="hero-desc">按多个关键基线因素分层，每个分层组合内独立执行区组随机</p>
      </div>
      <el-tag class="hero-tag" effect="plain" size="large" round>STRATIFIED BLOCK</el-tag>
      <div class="hero-watermark">SB</div>
    </div>

    <!-- 算法介绍 + 参数介绍 -->
    <el-row :gutter="16" class="mb-4" style="align-items:stretch">
      <el-col :lg="16" :xs="24">
        <div class="algo-card">
          <div class="algo-card-header">
            <div class="algo-card-icon"><div class="i-svg:el-icon-Document" style="width:16px;height:16px" /></div>
            <span>算法介绍</span>
          </div>
          <div class="algo-body">
            <h3>分层区组随机算法</h3>
            <h4>算法定义</h4>
            <p>分层区组随机是在正式随机前，先根据多个关键基线因素把受试者划分到不同<strong>分层组合</strong>中，再在每个分层组合内部独立执行<strong>区组随机</strong>。</p>
            <h4>适用场景</h4>
            <ul>
              <li>样本量有限，但研究特别关注多个关键二分类协变量对结果的影响。</li>
              <li>需要在整个入组过程中同时控制性别、年龄段、高低风险、中心等基线因素的平衡。</li>
            </ul>
            <h4>方法特点</h4>
            <ul>
              <li><strong>优点</strong>：相比普通区组随机，能够在多个关键因素维度上进一步提升组间均衡性。</li>
              <li><strong>风险</strong>：当分层因素增多时，理论分层组合数会快速增加，部分组合样本量可能较少。</li>
            </ul>
          </div>
        </div>
      </el-col>
      <el-col :lg="8" :xs="24">
        <div class="param-sidebar">
          <div class="param-sidebar-header"><div class="param-sidebar-icon"><div class="i-svg:el-icon-InfoFilled" style="width:14px;height:14px;color:var(--el-color-primary)" /></div><span>参数介绍</span></div>
          <div class="param-sidebar-list">
            <div v-for="(p, i) in paramIntros" :key="p.title" class="param-sidebar-item">
              <div class="param-sidebar-num">{{ String(i + 1).padStart(2, '0') }}</div>
              <div><div class="param-sidebar-name">{{ p.title }}</div><div class="param-sidebar-desc">{{ p.desc }}</div></div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 模拟表单 + 分层因素配置 -->
    <div class="sim-card mb-4">
      <div class="sim-card-header">
        <div class="sim-card-left">
          <div class="sim-card-icon"><div class="i-svg:el-icon-VideoPlay" style="width:16px;height:16px" /></div>
          <span class="sim-card-title">模拟随机</span>
        </div>
        <span class="sim-card-hint">为每个分层组合独立建立区组随机序列</span>
      </div>
      <div class="sim-card-body">
        <el-form :model="form" label-position="top">
          <el-row :gutter="16">
            <el-col :lg="3" :md="6" :xs="12"><el-form-item label="受试者总数"><el-input-number v-model="form.subjectCount" :min="20" :max="500" :step="10" style="width:100%" /></el-form-item></el-col>
            <el-col :lg="3" :md="6" :xs="12"><el-form-item label="分层因素个数"><el-select v-model="form.factorCount" style="width:100%"><el-option :value="1" label="1 个" /><el-option :value="2" label="2 个" /><el-option :value="3" label="3 个" /><el-option :value="4" label="4 个" /></el-select></el-form-item></el-col>
            <el-col :lg="3" :md="6" :xs="12"><el-form-item label="区组大小"><el-input-number v-model="form.blockSize" :min="2" :max="20" :step="1" style="width:100%" /></el-form-item></el-col>
            <el-col :lg="3" :md="6" :xs="12"><el-form-item label="分配比例 A:B"><el-select v-model="form.ratio" style="width:100%"><el-option value="1:1" label="1 : 1" /><el-option value="2:1" label="2 : 1" /><el-option value="3:1" label="3 : 1" /><el-option value="3:2" label="3 : 2" /></el-select></el-form-item></el-col>
            <el-col :lg="3" :md="6" :xs="12"><el-form-item label="随机种子"><el-input v-model="form.seed" /></el-form-item></el-col>
            <el-col :lg="3" :md="6" :xs="12"><el-form-item label="随机号前缀"><el-input v-model="form.codePrefix" maxlength="10" /></el-form-item></el-col>
            <el-col :lg="3" :md="6" :xs="12" class="btn-col"><el-button type="primary" style="width:100%" @click="runSimulation">开始模拟</el-button></el-col>
          </el-row>
        </el-form>
        <div class="factor-panel">
          <div class="flex justify-between items-center mb-3"><strong>分层因素配置</strong><span class="text-xs text-gray">每个因素均为二分类变量</span></div>
          <div v-for="(f, i) in factors" v-show="i < form.factorCount" :key="i" class="factor-row">
            <el-tag effect="plain" class="factor-label">因素 {{ i + 1 }}</el-tag>
            <el-input v-model="f.name" placeholder="因素名称" size="small" style="width:100px" />
            <el-input v-model="f.lowLabel" placeholder="低水平" size="small" style="width:80px" />
            <el-input v-model="f.highLabel" placeholder="高水平" size="small" style="width:80px" />
            <el-input-number v-model="f.probability" :min="0.1" :max="0.9" :step="0.05" :precision="2" size="small" style="width:130px" />
          </div>
        </div>
        <div class="sim-card-tip">{{ footnote }}</div>
      </div>
    </div>

    <!-- 统计指标 -->
    <el-row :gutter="16" class="mb-4">
      <el-col :lg="6" :md="6" :xs="12"><div class="metric-card mc-blue" data-watermark="A"><div class="mc-content"><div class="mc-label">A组人数</div><div class="mc-value">{{ res.countA }}</div><div class="mc-sub">占比 {{ res.percentA }}%</div></div><div class="mc-icon"><div class="i-svg:el-icon-User" /></div></div></el-col>
      <el-col :lg="6" :md="6" :xs="12"><div class="metric-card mc-green" data-watermark="B"><div class="mc-content"><div class="mc-label">B组人数</div><div class="mc-value">{{ res.countB }}</div><div class="mc-sub">占比 {{ res.percentB }}%</div></div><div class="mc-icon"><div class="i-svg:el-icon-UserFilled" /></div></div></el-col>
      <el-col :lg="6" :md="6" :xs="12"><div class="metric-card mc-amber" data-watermark="S"><div class="mc-content"><div class="mc-label">启用分层组合数</div><div class="mc-value">{{ res.activeStrata }}</div><div class="mc-sub">理论 {{ res.theoreticalStrata }} 个</div></div><div class="mc-icon"><div class="i-svg:el-icon-Grid" /></div></div></el-col>
      <el-col :lg="6" :md="6" :xs="12"><div class="metric-card mc-neutral" data-watermark="B#"><div class="mc-content"><div class="mc-label">启用区组数</div><div class="mc-value">{{ res.totalBlocks }}</div><div class="mc-sub">{{ res.gap === 0 ? '整体均衡' : `差值 ${res.gap} 例` }}</div></div><div class="mc-icon"><div class="i-svg:el-icon-Tickets" /></div></div></el-col>
    </el-row>

    <!-- 分层概览 -->
    <el-card shadow="never" class="mb-4">
      <template #header><span class="font-bold">分层概览</span></template>
      <el-table :data="res.strataSummary" size="small" stripe border max-height="360">
        <el-table-column prop="code" label="编码" width="80" />
        <el-table-column prop="shortLabel" label="组合" min-width="160" />
        <el-table-column prop="subjectCount" label="入组数" width="80" />
        <el-table-column prop="countA" label="A组" width="70" />
        <el-table-column prop="countB" label="B组" width="70" />
        <el-table-column prop="gap" label="差值" width="70" />
        <el-table-column label="A组占比" width="90">
          <template #default="{ row }">{{ row.subjectCount > 0 ? ((row.countA / row.subjectCount) * 100).toFixed(1) + '%' : '-' }}</template>
        </el-table-column>
        <el-table-column prop="blocks" label="区组数" width="80" />
      </el-table>
    </el-card>

    <!-- 图表 -->
    <el-row :gutter="16" class="mb-4">
      <el-col :lg="8" :xs="24"><el-card shadow="never"><template #header><span class="font-bold">随机结果占比</span></template><ECharts :options="pieOpts" height="280px" /></el-card></el-col>
      <el-col :lg="8" :xs="24"><el-card shadow="never"><template #header><span class="font-bold">AB组人数对比</span></template><ECharts :options="barOpts" height="280px" /></el-card></el-col>
      <el-col :lg="8" :xs="24"><el-card shadow="never"><template #header><span class="font-bold">AB组入组趋势</span></template><ECharts :options="lineOpts" height="280px" /></el-card></el-col>
    </el-row>

    <!-- 入组列表 + 结果说明 -->
    <el-row :gutter="16">
      <el-col :lg="14" :xs="24">
        <el-card shadow="never">
          <template #header><span class="font-bold">受试者入组列表</span></template>
          <el-table :data="res.rows" size="small" max-height="420" stripe border>
            <el-table-column prop="subjectId" label="编号" width="80" />
            <el-table-column prop="strataLabel" label="分层" width="120" />
            <el-table-column prop="blockNo" label="区组号" width="110" />
            <el-table-column prop="randomCode" label="随机号" min-width="240" />
            <el-table-column prop="positionInBlock" label="位次" width="80" />
            <el-table-column prop="group" label="入组" width="80">
              <template #default="{ row }"><el-tag :type="row.group === 'A组' ? 'primary' : 'success'" size="small" effect="plain">{{ row.group }}</el-tag></template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :lg="10" :xs="24">
        <el-card shadow="never">
          <template #header><span class="font-bold">结果说明</span></template>
          <div class="text-sm leading-relaxed" v-html="narrativeHtml" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { createSeededRandom, padNumber, parseRatio, normalizeBlockSize, shuffleArray, clampProbability } from "./utils/random";

defineOptions({ name: "RandomStratifiedBlock" });

const paramIntros = [
  { title: "分层因素个数", desc: "支持 1-4 个分层因素，每个因素均视作一个二分类变量。系统会自动展开为 2^k 个理论分层组合。" },
  { title: "分层因素配置", desc: "每个因素都可以设置因素名称、低水平标签、高水平标签和高水平出现概率。" },
  { title: "区组大小与分配比例", desc: "每个分层组合内部独立维护区组随机序列。区组大小需与分配比例兼容。" },
  { title: "随机种子与前缀", desc: "随机种子用于复现实验；随机号前缀用于模拟受试者随机码。" },
];

interface Factor { name: string; lowLabel: string; highLabel: string; probability: number; }

const factors = reactive<Factor[]>([
  { name: "性别", lowLabel: "女", highLabel: "男", probability: 0.5 },
  { name: "年龄", lowLabel: "<65岁", highLabel: "≥65岁", probability: 0.4 },
  { name: "中心", lowLabel: "中心1", highLabel: "中心2", probability: 0.5 },
  { name: "基线风险", lowLabel: "低风险", highLabel: "高风险", probability: 0.35 },
]);

const form = reactive({ subjectCount: 150, factorCount: 2, blockSize: 4, ratio: "1:1", seed: "SBLOCK-20260329", codePrefix: "SBK" });
const res = ref<any>({ rows: [], countA: 0, countB: 0, percentA: "0.0", percentB: "0.0", gap: 0, totalBlocks: 0, activeStrata: 0, theoreticalStrata: 0, strataSummary: [], subjectCount: 0 });
const pieOpts = ref({}); const barOpts = ref({}); const lineOpts = ref({});
const narrativeHtml = ref(""); const footnote = ref("");

function buildStrata(fcts: Factor[]) {
  let combos: { weight: number; detail: string[]; short: string[] }[] = [{ weight: 1, detail: [], short: [] }];
  fcts.forEach(f => {
    combos = combos.flatMap(c => [
      { weight: c.weight * (1 - f.probability), detail: [...c.detail, `${f.name}=${f.lowLabel}`], short: [...c.short, f.lowLabel] },
      { weight: c.weight * f.probability, detail: [...c.detail, `${f.name}=${f.highLabel}`], short: [...c.short, f.highLabel] },
    ]);
  });
  const tw = combos.reduce((s, c) => s + c.weight, 0) || 1;
  return combos.map((c, i) => ({ code: `ST${padNumber(i + 1, 2)}`, label: c.detail.join(" / "), shortLabel: c.short.join(" · "), weight: c.weight / tw }));
}

function pickStratum(strata: { weight: number }[], random: () => number) {
  const v = random(); let cursor = 0;
  for (const s of strata) { cursor += s.weight; if (v <= cursor) return s; }
  return strata[strata.length - 1];
}

function createBlockAssignments(bs: number, rA: number, rB: number, random: () => number) {
  const rt = rA + rB, cA = Math.round((bs * rA) / rt), cB = bs - cA;
  return shuffleArray([...Array(cA).fill("A组"), ...Array(cB).fill("B组")], random);
}

function simulate() {
  const n = Math.min(500, Math.max(20, Math.round(form.subjectCount || 150)));
  const fcts = factors.slice(0, form.factorCount).map(f => ({ ...f, probability: clampProbability(f.probability) }));
  const { ratioA, ratioB, ratioTotal } = parseRatio(form.ratio);
  const bs = normalizeBlockSize(form.blockSize, ratioTotal);
  const seed = form.seed.trim() || "SBLOCK-DEFAULT";
  const prefix = (form.codePrefix.trim() || "SBK").replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toUpperCase() || "SBK";
  const random = createSeededRandom(seed);
  const strata = buildStrata(fcts);

  const stateMap: Record<string, any> = {};
  strata.forEach(s => { stateMap[s.code] = { ...s, subjectCount: 0, countA: 0, countB: 0, blockIndex: 0, queue: [] as string[] }; });

  const rows: any[] = []; const trendA: number[] = []; const trendB: number[] = [];
  let tA = 0, tB = 0, totalBlocks = 0;

  for (let si = 1; si <= n; si++) {
    const s = pickStratum(strata, random) as any;
    const st = stateMap[s.code];
    if (st.queue.length === 0) { st.blockIndex++; st.queue = createBlockAssignments(bs, ratioA, ratioB, random); totalBlocks++; }
    const pos = bs - st.queue.length;
    const group = st.queue.shift()!;
    st.subjectCount++; if (group === "A组") { st.countA++; tA++; } else { st.countB++; tB++; }
    const frag = Math.floor(random() * 1000000).toString().padStart(6, "0");
    rows.push({ subjectId: `S${padNumber(si)}`, strataLabel: s.shortLabel, blockNo: `${s.code}-B${padNumber(st.blockIndex, 2)}`, positionInBlock: `${pos + 1}/${bs}`, randomCode: `${prefix}-${s.code}-${padNumber(st.blockIndex, 2)}-${padNumber(si)}-${frag}`, group });
    trendA.push(tA); trendB.push(tB);
  }

  const summary = Object.values(stateMap).filter((s: any) => s.subjectCount > 0).sort((a: any, b: any) => b.subjectCount - a.subjectCount).map((s: any) => ({ code: s.code, shortLabel: s.shortLabel, subjectCount: s.subjectCount, countA: s.countA, countB: s.countB, gap: Math.abs(s.countA - s.countB), blocks: s.blockIndex }));
  const pA = ((tA / n) * 100).toFixed(1), pB = ((tB / n) * 100).toFixed(1);
  res.value = { rows, countA: tA, countB: tB, percentA: pA, percentB: pB, gap: Math.abs(tA - tB), totalBlocks, activeStrata: summary.length, theoreticalStrata: strata.length, strataSummary: summary, subjectCount: n };

  footnote.value = `当前模拟采用 ${fcts.length} 个分层因素，区组大小 ${bs}，分配比例 ${ratioA}:${ratioB}。`;

  pieOpts.value = { tooltip: { trigger: "item" }, legend: { bottom: 0 }, series: [{ type: "pie", radius: ["40%", "70%"], data: [{ value: tA, name: "A组", itemStyle: { color: "#4558d0" } }, { value: tB, name: "B组", itemStyle: { color: "#22c55e" } }], label: { formatter: "{b}: {c} ({d}%)" } }] };
  barOpts.value = { tooltip: { trigger: "axis" }, grid: { left: "10%", right: "4%", bottom: "8%", top: "8%" }, xAxis: { type: "category", data: ["A组", "B组"] }, yAxis: { type: "value" }, series: [{ type: "bar", barWidth: "40%", data: [{ value: tA, itemStyle: { color: "#4558d0", borderRadius: [6, 6, 0, 0] } }, { value: tB, itemStyle: { color: "#22c55e", borderRadius: [6, 6, 0, 0] } }] }] };
  lineOpts.value = { tooltip: { trigger: "axis" }, legend: { data: ["A组累计", "B组累计"], bottom: 0 }, grid: { left: "10%", right: "4%", bottom: "14%", top: "6%" }, xAxis: { type: "category", data: Array.from({ length: n }, (_, i) => `${i + 1}`), axisLabel: { interval: Math.max(0, Math.floor(n / 8) - 1) } }, yAxis: { type: "value" }, series: [{ name: "A组累计", type: "line", data: trendA, smooth: true, showSymbol: false, lineStyle: { width: 2.5 }, itemStyle: { color: "#4558d0" }, areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(69,88,208,0.15)" }, { offset: 1, color: "rgba(69,88,208,0)" }] } } }, { name: "B组累计", type: "line", data: trendB, smooth: true, showSymbol: false, lineStyle: { width: 2.5 }, itemStyle: { color: "#22c55e" }, areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(34,197,94,0.15)" }, { offset: 1, color: "rgba(34,197,94,0)" }] } } }] };

  const dominant = tA === tB ? "两组完全均衡" : tA > tB ? "A组略多" : "B组略多";
  narrativeHtml.value = `本次分层区组随机共模拟 <strong>${n}</strong> 例受试者，配置 <strong>${fcts.length}</strong> 个二分类分层因素，理论 <strong>${strata.length}</strong> 个分层组合，实际启用 <strong>${summary.length}</strong> 个。<br/><br/>分配比例 <strong>${ratioA}:${ratioB}</strong>，区组大小 <strong>${bs}</strong>。最终 <strong>A组 ${tA} 例</strong>（${pA}%），<strong>B组 ${tB} 例</strong>（${pB}%），${dominant}，总差值 <strong>${Math.abs(tA - tB)}</strong> 例。共使用 <strong>${totalBlocks}</strong> 个区组。`;
}

function runSimulation() { simulate(); }
onMounted(simulate);
</script>

<style scoped>
@import './random-shared.css';
</style>
