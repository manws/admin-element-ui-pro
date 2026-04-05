<template>
  <div class="app-container random-min">
    <!-- 算法介绍 -->
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">算法介绍</span><el-tag size="small" effect="plain">MINIMIZATION</el-tag></div></template>
      <div class="algo-body">
        <h3>最小化随机算法</h3>
        <el-row :gutter="24">
          <el-col :lg="8" :xs="24"><h4>算法定义</h4><p>最小化随机是一种<strong>动态平衡分配方法</strong>。每有 1 名受试者入组，系统都会计算"若分配到 A/B 组"后的总失衡分，再优先选择更有利于整体平衡的一组。</p></el-col>
          <el-col :lg="8" :xs="24"><h4>适用场景</h4><ul><li>样本量有限，需持续控制多个关键因素的组间平衡。</li><li>需要直观展示"逐例比较失衡分并动态分配"的过程。</li></ul></el-col>
          <el-col :lg="8" :xs="24"><h4>方法特点</h4><ul><li><strong>优点</strong>：多因素平衡能力最强。</li><li><strong>风险</strong>：优选概率过高则接近确定性分配。</li></ul></el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 参数提示 -->
    <el-row :gutter="12" class="mb-4">
      <el-col v-for="p in paramIntros" :key="p.title" :lg="6" :md="6" :xs="12">
        <div class="param-tip"><div class="param-tip-title">{{ p.title }}</div><div class="param-tip-desc">{{ p.desc }}</div></div>
      </el-col>
    </el-row>

    <!-- 模拟表单 + 因素配置 -->
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">模拟随机</span><span class="text-xs text-gray">动态比较进入 A/B 组后的总失衡分</span></div></template>
      <el-form :model="form" label-position="top">
        <el-row :gutter="16">
          <el-col :lg="3" :md="6" :xs="12"><el-form-item label="受试者总数"><el-input-number v-model="form.subjectCount" :min="20" :max="500" :step="10" style="width:100%" /></el-form-item></el-col>
          <el-col :lg="3" :md="6" :xs="12"><el-form-item label="因素个数"><el-select v-model="form.factorCount" style="width:100%"><el-option :value="1" label="1 个" /><el-option :value="2" label="2 个" /><el-option :value="3" label="3 个" /><el-option :value="4" label="4 个" /></el-select></el-form-item></el-col>
          <el-col :lg="3" :md="6" :xs="12"><el-form-item label="优选概率"><el-input-number v-model="form.biasProbability" :min="0.55" :max="1" :step="0.05" :precision="2" style="width:100%" /></el-form-item></el-col>
          <el-col :lg="3" :md="6" :xs="12"><el-form-item label="分配比例 A:B"><el-select v-model="form.ratio" style="width:100%"><el-option value="1:1" label="1 : 1" /><el-option value="2:1" label="2 : 1" /><el-option value="3:1" label="3 : 1" /></el-select></el-form-item></el-col>
          <el-col :lg="3" :md="6" :xs="12"><el-form-item label="随机种子"><el-input v-model="form.seed" /></el-form-item></el-col>
          <el-col :lg="3" :md="6" :xs="12"><el-form-item label="随机号前缀"><el-input v-model="form.codePrefix" maxlength="10" /></el-form-item></el-col>
          <el-col :lg="3" :md="6" :xs="12"><el-form-item label=" "><el-button type="primary" style="width:100%" @click="runSimulation">开始模拟</el-button></el-form-item></el-col>
        </el-row>
      </el-form>
      <div class="factor-panel">
        <div class="flex justify-between items-center mb-3"><strong>关键因素配置</strong><span class="text-xs text-gray">每个因素均为二分类变量</span></div>
        <div v-for="(f, i) in factors" v-show="i < form.factorCount" :key="i" class="factor-row">
          <el-tag effect="plain" class="factor-label">因素 {{ i + 1 }}</el-tag>
          <el-input v-model="f.name" placeholder="因素名称" size="small" style="width:100px" />
          <el-input v-model="f.lowLabel" placeholder="低水平" size="small" style="width:80px" />
          <el-input v-model="f.highLabel" placeholder="高水平" size="small" style="width:80px" />
          <el-input-number v-model="f.probability" :min="0.1" :max="0.9" :step="0.05" :precision="2" size="small" style="width:130px" />
        </div>
      </div>
      <div class="text-xs text-gray mt-3">{{ footnote }}</div>
    </el-card>

    <!-- 统计指标 -->
    <el-row :gutter="16" class="mb-4">
      <el-col :lg="6" :md="6" :xs="12"><el-card shadow="never" class="metric-card accent"><div class="text-xs text-gray mb-2">A组人数</div><div class="text-3xl font-bold">{{ res.countA }}</div><div class="text-xs text-gray mt-2">占比 {{ res.percentA }}%</div></el-card></el-col>
      <el-col :lg="6" :md="6" :xs="12"><el-card shadow="never" class="metric-card success"><div class="text-xs text-gray mb-2">B组人数</div><div class="text-3xl font-bold">{{ res.countB }}</div><div class="text-xs text-gray mt-2">占比 {{ res.percentB }}%</div></el-card></el-col>
      <el-col :lg="6" :md="6" :xs="12"><el-card shadow="never" class="metric-card warning"><div class="text-xs text-gray mb-2">因素水平数</div><div class="text-3xl font-bold">{{ res.levelCount }}</div><div class="text-xs text-gray mt-2">{{ res.factorCount }} 个因素</div></el-card></el-col>
      <el-col :lg="6" :md="6" :xs="12"><el-card shadow="never" class="metric-card neutral"><div class="text-xs text-gray mb-2">优选分配次数</div><div class="text-3xl font-bold">{{ res.preferredWins }}</div><div class="text-xs text-gray mt-2">平局 {{ res.tieAssignments }} 次</div></el-card></el-col>
    </el-row>

    <!-- 因素水平概览 -->
    <el-card shadow="never" class="mb-4">
      <template #header><span class="font-bold">因素水平概览</span></template>
      <el-table :data="res.levelSummary" size="small" stripe border>
        <el-table-column prop="code" label="编码" width="90" />
        <el-table-column prop="detail" label="因素水平" min-width="160" />
        <el-table-column prop="subjectCount" label="入组数" width="80" />
        <el-table-column prop="countA" label="A组" width="70" />
        <el-table-column prop="countB" label="B组" width="70" />
        <el-table-column prop="gap" label="差值" width="70" />
        <el-table-column prop="weightedGap" label="加权差" width="80" />
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
            <el-table-column prop="profileShort" label="协变量" width="120" />
            <el-table-column prop="scoreA" label="候选A分" width="90" />
            <el-table-column prop="scoreB" label="候选B分" width="90" />
            <el-table-column prop="randomCode" label="随机号" min-width="220" />
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
import { createSeededRandom, padNumber, parseRatio, calculateWeightedGap, clampProbability } from "./utils/random";

defineOptions({ name: "RandomMinimization" });

const paramIntros = [
  { title: "关键因素个数", desc: "支持 1-4 个关键因素，每个因素都以二分类变量进入失衡分计算。" },
  { title: "因素配置", desc: "每个因素可设置名称、低/高水平标签和高水平出现概率。" },
  { title: "分配比例与优选概率", desc: "系统会分别计算若进入 A/B 组后的总失衡分，以设定的优选概率倾向于选择失衡分更低的一组。" },
  { title: "随机种子与前缀", desc: "随机种子用于复现模拟；随机号前缀用于生成可追踪的随机码。" },
];

interface Factor { name: string; lowLabel: string; highLabel: string; probability: number; }

const factors = reactive<Factor[]>([
  { name: "性别", lowLabel: "女", highLabel: "男", probability: 0.5 },
  { name: "年龄", lowLabel: "≤64岁", highLabel: "≥65岁", probability: 0.4 },
  { name: "中心", lowLabel: "中心1", highLabel: "中心2", probability: 0.5 },
  { name: "基线风险", lowLabel: "低风险", highLabel: "高风险", probability: 0.35 },
]);

const form = reactive({ subjectCount: 150, factorCount: 2, biasProbability: 0.8, ratio: "1:1", seed: "MIN-20260330", codePrefix: "MIN" });
const res = ref<any>({ rows: [], countA: 0, countB: 0, percentA: "0.0", percentB: "0.0", gap: 0, levelCount: 0, factorCount: 0, preferredWins: 0, tieAssignments: 0, levelSummary: [] });
const pieOpts = ref({}); const barOpts = ref({}); const lineOpts = ref({});
const narrativeHtml = ref(""); const footnote = ref("");

function simulate() {
  const n = Math.min(500, Math.max(20, Math.round(form.subjectCount || 150)));
  const fcts = factors.slice(0, form.factorCount).map(f => ({ ...f, probability: clampProbability(f.probability) }));
  const { ratioA, ratioB, ratioTotal } = parseRatio(form.ratio);
  const bp = Math.min(1, Math.max(0.55, form.biasProbability));
  const seed = form.seed.trim() || "MIN-DEFAULT";
  const prefix = (form.codePrefix.trim() || "MIN").replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toUpperCase() || "MIN";
  const random = createSeededRandom(seed);

  // 因素水平状态
  const fState = fcts.map((f, fi) => ({
    code: `F${padNumber(fi + 1, 2)}`,
    name: f.name,
    levels: {
      low: { label: f.lowLabel, cA: 0, cB: 0 },
      high: { label: f.highLabel, cA: 0, cB: 0 },
    },
  }));

  const rows: any[] = []; const trendA: number[] = []; const trendB: number[] = [];
  let tA = 0, tB = 0, prefWins = 0, ties = 0, opps = 0;

  for (let si = 1; si <= n; si++) {
    const profile = fcts.map((f, fi) => {
      const isHigh = random() < f.probability;
      return { fi, key: isHigh ? "high" : "low", label: isHigh ? f.highLabel : f.lowLabel };
    });
    const shortLabel = profile.map(p => p.label).join(" · ");

    // 计算候选失衡分
    function calcScore(candidate: string) {
      let score = calculateWeightedGap(tA + (candidate === "A组" ? 1 : 0), tB + (candidate === "B组" ? 1 : 0), ratioA, ratioB);
      profile.forEach(p => {
        const lv = fState[p.fi].levels[p.key as "low" | "high"];
        score += calculateWeightedGap(lv.cA + (candidate === "A组" ? 1 : 0), lv.cB + (candidate === "B组" ? 1 : 0), ratioA, ratioB);
      });
      return score;
    }

    const sA = calcScore("A组"), sB = calcScore("B组");
    const preferred = sA === sB ? null : sA < sB ? "A组" : "B组";
    let group: string;

    if (!preferred) {
      ties++;
      const defA = ((tA + tB + 1) * ratioA) / ratioTotal - tA;
      const defB = ((tA + tB + 1) * ratioB) / ratioTotal - tB;
      group = Math.abs(defA - defB) > 1e-9 ? (defA > defB ? "A组" : "B组") : (random() < ratioA / ratioTotal ? "A组" : "B组");
    } else {
      const usePref = random() < bp;
      group = usePref ? preferred : (preferred === "A组" ? "B组" : "A组");
      if (usePref) prefWins++; else opps++;
    }

    profile.forEach(p => {
      const lv = fState[p.fi].levels[p.key as "low" | "high"];
      if (group === "A组") lv.cA++; else lv.cB++;
    });
    if (group === "A组") tA++; else tB++;

    const frag = Math.floor(random() * 1000000).toString().padStart(6, "0");
    const pCode = `P${profile.map(p => p.key === "high" ? "1" : "0").join("")}`;
    rows.push({ subjectId: `S${padNumber(si)}`, profileShort: shortLabel, scoreA: sA, scoreB: sB, randomCode: `${prefix}-${pCode}-${padNumber(si)}-${frag}`, group });
    trendA.push(tA); trendB.push(tB);
  }

  const levelSummary = fState.flatMap(f => (["low", "high"] as const).map(k => {
    const lv = f.levels[k];
    const sc = lv.cA + lv.cB;
    return { code: `${f.code}-${k === "low" ? "L" : "H"}`, detail: `${f.name}=${lv.label}`, subjectCount: sc, countA: lv.cA, countB: lv.cB, gap: Math.abs(lv.cA - lv.cB), weightedGap: calculateWeightedGap(lv.cA, lv.cB, ratioA, ratioB) };
  }));

  const pA = ((tA / n) * 100).toFixed(1), pB = ((tB / n) * 100).toFixed(1);
  res.value = { rows, countA: tA, countB: tB, percentA: pA, percentB: pB, gap: Math.abs(tA - tB), levelCount: levelSummary.length, factorCount: fcts.length, preferredWins: prefWins, tieAssignments: ties, levelSummary };

  footnote.value = `当前模拟采用 ${fcts.length} 个关键因素、目标比例 ${ratioA}:${ratioB}、优选概率 ${(bp * 100).toFixed(0)}%。`;

  pieOpts.value = { tooltip: { trigger: "item" }, legend: { bottom: 0 }, series: [{ type: "pie", radius: ["40%", "70%"], data: [{ value: tA, name: "A组", itemStyle: { color: "#409EFF" } }, { value: tB, name: "B组", itemStyle: { color: "#67C23A" } }], label: { formatter: "{b}: {c} ({d}%)" } }] };
  barOpts.value = { tooltip: { trigger: "axis" }, grid: { left: "10%", right: "4%", bottom: "8%", top: "8%" }, xAxis: { type: "category", data: ["A组", "B组"] }, yAxis: { type: "value" }, series: [{ type: "bar", barWidth: "40%", data: [{ value: tA, itemStyle: { color: "#409EFF", borderRadius: [6, 6, 0, 0] } }, { value: tB, itemStyle: { color: "#67C23A", borderRadius: [6, 6, 0, 0] } }] }] };
  lineOpts.value = { tooltip: { trigger: "axis" }, legend: { data: ["A组累计", "B组累计"], bottom: 0 }, grid: { left: "10%", right: "4%", bottom: "14%", top: "6%" }, xAxis: { type: "category", data: Array.from({ length: n }, (_, i) => `${i + 1}`), axisLabel: { interval: Math.max(0, Math.floor(n / 8) - 1) } }, yAxis: { type: "value" }, series: [{ name: "A组累计", type: "line", data: trendA, smooth: true, showSymbol: false, lineStyle: { width: 2.5 }, itemStyle: { color: "#409EFF" } }, { name: "B组累计", type: "line", data: trendB, smooth: true, showSymbol: false, lineStyle: { width: 2.5 }, itemStyle: { color: "#67C23A" } }] };

  const dominant = tA === tB ? "两组完全均衡" : tA > tB ? "A组略多" : "B组略多";
  narrativeHtml.value = `本次最小化随机共模拟 <strong>${n}</strong> 例受试者，配置 <strong>${fcts.length}</strong> 个二分类因素，目标比例 <strong>${ratioA}:${ratioB}</strong>，优选概率 <strong>${(bp * 100).toFixed(0)}%</strong>。<br/><br/>最终 <strong>A组 ${tA} 例</strong>（${pA}%），<strong>B组 ${tB} 例</strong>（${pB}%），${dominant}，差值 <strong>${Math.abs(tA - tB)}</strong> 例。按优选方向分配 <strong>${prefWins}</strong> 次，平局 <strong>${ties}</strong> 次，反向保留 <strong>${opps}</strong> 次。`;
}

function runSimulation() { simulate(); }
onMounted(simulate);
</script>

<style scoped>
.algo-body h3 { font-size: 20px; font-weight: 700; margin: 0 0 12px; }
.algo-body h4 { font-size: 15px; font-weight: 600; margin: 16px 0 6px; }
.algo-body p, .algo-body ul { font-size: 13.5px; color: #555; line-height: 1.8; margin: 6px 0; }
.algo-body ul { padding-left: 18px; }
.param-list { display: grid; gap: 12px; }
.param-item { padding: 12px 14px; border-radius: 12px; background: var(--el-fill-color-lighter); }
.metric-card { text-align: center; }
.metric-card.accent { border-top: 3px solid #409EFF; }
.metric-card.success { border-top: 3px solid #67C23A; }
.metric-card.warning { border-top: 3px solid #E6A23C; }
.metric-card.neutral { border-top: 3px solid #909399; }
.factor-panel { margin-top: 16px; padding: 16px; border-radius: 12px; background: var(--el-fill-color-lighter); }
.factor-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
.factor-label { flex-shrink: 0; }
</style>
