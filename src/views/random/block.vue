<template>
  <div class="app-container random-block">
    <!-- 页头 Hero -->
    <div class="page-hero mb-4">
      <div class="hero-text">
        <h1 class="hero-title">区组随机</h1>
        <p class="hero-desc">按预设区组大小和分配比例，在每个区组内部随机打乱分配顺序</p>
      </div>
      <el-tag class="hero-tag" effect="plain" size="large" round>BLOCK RANDOM</el-tag>
      <div class="hero-watermark">BR</div>
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
            <h3>区组随机算法</h3>
            <h4>算法定义</h4>
            <p>区组随机是将受试者按预设的<strong>区组大小</strong>分批处理，在每个区组内先按照固定比例生成 A 组和 B 组名额，再将该区组内的分配顺序随机打乱。</p>
            <h4>适用场景</h4>
            <ul>
              <li>样本量较小或中等，希望避免研究早期出现明显组间不均衡。</li>
              <li>入组周期较长，需要在任意阶段都尽量控制 A/B 组人数差异。</li>
              <li>多中心研究、阶段性分析或中期汇总较多的试验设计。</li>
            </ul>
            <h4>方法特点</h4>
            <ul>
              <li><strong>优点</strong>：较简单随机更容易保持阶段性平衡。</li>
              <li><strong>局限</strong>：若区组大小固定且被研究执行者掌握，可能增加分配可预测性。</li>
              <li><strong>实现要点</strong>：先生成区组内的配额，再对区组内部顺序进行随机打乱。</li>
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

    <!-- 模拟表单 -->
    <div class="sim-card mb-4">
      <div class="sim-card-header">
        <div class="sim-card-left">
          <div class="sim-card-icon"><div class="i-svg:el-icon-VideoPlay" style="width:16px;height:16px" /></div>
          <span class="sim-card-title">模拟随机</span>
        </div>
        <span class="sim-card-hint">按区组大小和分配比例生成区组随机结果</span>
      </div>
      <div class="sim-card-body">
        <el-form :model="form" label-position="top">
          <el-row :gutter="16">
            <el-col :lg="4" :md="6" :xs="12">
              <el-form-item label="模拟受试者总数">
                <el-input-number v-model="form.subjectCount" :min="10" :max="500" :step="10" style="width:100%" />
              </el-form-item>
            </el-col>
            <el-col :lg="4" :md="6" :xs="12">
              <el-form-item label="区组大小">
                <el-input-number v-model="form.blockSize" :min="2" :max="20" :step="1" style="width:100%" />
              </el-form-item>
            </el-col>
            <el-col :lg="4" :md="6" :xs="12">
              <el-form-item label="分配比例 A:B">
                <el-select v-model="form.ratio" style="width:100%">
                  <el-option value="1:1" label="1 : 1" />
                  <el-option value="2:1" label="2 : 1" />
                  <el-option value="3:1" label="3 : 1" />
                  <el-option value="3:2" label="3 : 2" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :lg="4" :md="6" :xs="12">
              <el-form-item label="随机种子">
                <el-input v-model="form.seed" placeholder="BLOCK-20260329" />
              </el-form-item>
            </el-col>
            <el-col :lg="4" :md="6" :xs="12">
              <el-form-item label="随机号前缀">
                <el-input v-model="form.codePrefix" placeholder="BLK" maxlength="10" />
              </el-form-item>
            </el-col>
            <el-col :lg="4" :md="6" :xs="12" class="btn-col">
              <el-button type="primary" style="width:100%" @click="runSimulation">开始模拟</el-button>
            </el-col>
          </el-row>
        </el-form>
        <div class="sim-card-tip">{{ footnote }}</div>
      </div>
    </div>

    <!-- 统计指标 -->
    <el-row :gutter="16" class="mb-4">
      <el-col :lg="6" :md="6" :xs="12">
        <div class="metric-card mc-blue" data-watermark="A">
          <div class="mc-content"><div class="mc-label">A组人数</div><div class="mc-value">{{ res.countA }}</div><div class="mc-sub">占比 {{ res.percentA }}%</div></div>
          <div class="mc-icon"><div class="i-svg:el-icon-User" /></div>
        </div>
      </el-col>
      <el-col :lg="6" :md="6" :xs="12">
        <div class="metric-card mc-green" data-watermark="B">
          <div class="mc-content"><div class="mc-label">B组人数</div><div class="mc-value">{{ res.countB }}</div><div class="mc-sub">占比 {{ res.percentB }}%</div></div>
          <div class="mc-icon"><div class="i-svg:el-icon-UserFilled" /></div>
        </div>
      </el-col>
      <el-col :lg="6" :md="6" :xs="12">
        <div class="metric-card mc-amber" data-watermark="Δ">
          <div class="mc-content"><div class="mc-label">组间差值</div><div class="mc-value">{{ res.gap }}</div><div class="mc-sub">{{ res.gap === 0 ? '完全均衡' : 'A/B 组人数差' }}</div></div>
          <div class="mc-icon"><div class="i-svg:el-icon-Sort" /></div>
        </div>
      </el-col>
      <el-col :lg="6" :md="6" :xs="12">
        <div class="metric-card mc-neutral" data-watermark="B#">
          <div class="mc-content"><div class="mc-label">区组总数</div><div class="mc-value">{{ res.totalBlocks }}</div><div class="mc-sub">完整 {{ res.fullBlocks }} 个{{ res.tailSize > 0 ? `，尾组 ${res.tailSize} 例` : '' }}</div></div>
          <div class="mc-icon"><div class="i-svg:el-icon-Grid" /></div>
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
    <el-row :gutter="16" class="mb-4" style="align-items:stretch">
      <el-col :lg="12" :xs="24" style="display:flex">
        <el-card shadow="never" style="flex:1">
          <template #header><span class="font-bold">受试者入组列表</span></template>
          <el-table :data="res.rows" size="small" max-height="260" stripe border>
            <el-table-column prop="subjectId" label="受试者编号" width="100" />
            <el-table-column prop="blockNo" label="区组号" width="80" />
            <el-table-column prop="randomCode" label="随机号" min-width="220" />
            <el-table-column prop="positionInBlock" label="区组位次" width="90" />
            <el-table-column prop="group" label="入组情况" width="90">
              <template #default="{ row }">
                <el-tag :type="row.group === 'A组' ? 'primary' : 'success'" size="small" effect="plain">{{ row.group }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :lg="12" :xs="24" style="display:flex">
        <el-card shadow="never" style="flex:1">
          <template #header><span class="font-bold">结果说明</span></template>
          <div class="text-sm leading-relaxed" v-html="narrativeHtml" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 参考文献 -->
    <div class="ref-card mb-4">
      <div class="ref-card-header">
        <div class="ref-card-icon"><div class="i-svg:el-icon-Collection" style="width:16px;height:16px" /></div>
        <span>参考文献</span>
        <span class="ref-card-count">{{ references.length }} 篇</span>
      </div>
      <div class="ref-card-body">
        <div v-for="(ref, i) in references" :key="i" class="ref-item">
          <div class="ref-num">{{ i + 1 }}</div>
          <div class="ref-content">
            <div class="ref-authors">{{ ref.authors }}</div>
            <div class="ref-title">{{ ref.title }}</div>
            <div class="ref-source">
              <span class="ref-journal">{{ ref.journal }}</span>
              <span v-if="ref.year" class="ref-year">{{ ref.year }}</span>
              <span v-if="ref.volume" class="ref-volume">{{ ref.volume }}</span>
              <el-tag v-if="ref.doi" size="small" effect="plain" class="ref-doi" @click="openDoi(ref.doi)">DOI</el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createSeededRandom, padNumber, parseRatio, normalizeBlockSize, shuffleArray } from "./utils/random";

defineOptions({ name: "RandomBlock" });

const paramIntros = [
  { title: "模拟受试者总数", desc: "设置本次模拟纳入的受试者数量。区组随机特别适合边入组边随机的场景，能够减少过程中的组间失衡。" },
  { title: "区组大小", desc: "定义每个区组内包含多少名受试者。系统会根据分配比例自动校正为可用区组大小。" },
  { title: "分配比例 A:B", desc: "定义区组内 A 组与 B 组的理论分配比例，例如 1:1、2:1。" },
  { title: "随机种子与随机号前缀", desc: "随机种子用于复现实验结果；随机号前缀用于生成模拟随机码。" },
];

interface BlockRow { subjectId: string; blockNo: string; positionInBlock: string; randomCode: string; group: string; }

const form = reactive({ subjectCount: 120, blockSize: 4, ratio: "1:1", seed: "BLOCK-20260329", codePrefix: "BLK" });
const res = ref<any>({ rows: [], countA: 0, countB: 0, percentA: "0.0", percentB: "0.0", gap: 0, totalBlocks: 0, fullBlocks: 0, tailSize: 0, subjectCount: 0 });
const pieOpts = ref({}); const barOpts = ref({}); const lineOpts = ref({});
const narrativeHtml = ref(""); const footnote = ref("");

function createBlockAssignments(blockSize: number, ratioA: number, ratioB: number, ratioTotal: number, random: () => number, runA: number, runB: number) {
  const exactA = (blockSize * ratioA) / ratioTotal;
  const exactB = (blockSize * ratioB) / ratioTotal;
  let bA = Math.floor(exactA), bB = Math.floor(exactB), rem = blockSize - bA - bB;
  while (rem > 0) {
    const nA = exactA - bA, nB = exactB - bB;
    if (nA > nB) bA++; else if (nB > nA) bB++; else if (runA + bA <= runB + bB) bA++; else bB++;
    rem--;
  }
  return { bA, bB, assignments: shuffleArray([...Array(bA).fill("A组"), ...Array(bB).fill("B组")], random) };
}

function simulate() {
  const n = Math.min(500, Math.max(10, Math.round(form.subjectCount || 120)));
  const { ratioA, ratioB, ratioTotal } = parseRatio(form.ratio);
  const bs = normalizeBlockSize(form.blockSize, ratioTotal);
  const seed = form.seed.trim() || "BLOCK-DEFAULT";
  const prefix = (form.codePrefix.trim() || "BLK").replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toUpperCase() || "BLK";
  const random = createSeededRandom(seed);
  const rows: BlockRow[] = []; const trendA: number[] = []; const trendB: number[] = []; const trendLabels: string[] = [];
  const totalBlocks = Math.ceil(n / bs);
  let cA = 0, cB = 0;

  for (let bi = 1; bi <= totalBlocks; bi++) {
    const remaining = n - rows.length;
    const curBS = Math.min(bs, remaining);
    const bd = createBlockAssignments(curBS, ratioA, ratioB, ratioTotal, random, cA, cB);
    bd.assignments.forEach((group, pi) => {
      const frag = Math.floor(random() * 1000000).toString().padStart(6, "0");
      if (group === "A组") cA++; else cB++;
      const si = rows.length + 1;
      rows.push({ subjectId: `S${padNumber(si)}`, blockNo: `B${padNumber(bi, 2)}`, positionInBlock: `${pi + 1}/${curBS}`, randomCode: `${prefix}-${padNumber(bi, 2)}-${padNumber(si)}-${frag}`, group });
      trendLabels.push(`${si}`); trendA.push(cA); trendB.push(cB);
    });
  }

  const pA = ((cA / n) * 100).toFixed(1), pB = ((cB / n) * 100).toFixed(1);
  const gap = Math.abs(cA - cB), full = Math.floor(n / bs), tail = n % bs;
  res.value = { rows, countA: cA, countB: cB, percentA: pA, percentB: pB, gap, totalBlocks, fullBlocks: full, tailSize: tail, subjectCount: n };

  footnote.value = `当前模拟采用 ${ratioA}:${ratioB} 分配比例，区组大小 ${bs}。若输入区组大小与分配比例不兼容，系统已自动校正。`;

  pieOpts.value = { tooltip: { trigger: "item" }, legend: { bottom: 0 }, series: [{ type: "pie", radius: ["40%", "70%"], data: [{ value: cA, name: "A组", itemStyle: { color: "#4558d0" } }, { value: cB, name: "B组", itemStyle: { color: "#22c55e" } }], label: { formatter: "{b}: {c} ({d}%)" } }] };
  barOpts.value = { tooltip: { trigger: "axis" }, grid: { left: "10%", right: "4%", bottom: "8%", top: "8%" }, xAxis: { type: "category", data: ["A组", "B组"] }, yAxis: { type: "value" }, series: [{ type: "bar", barWidth: "40%", data: [{ value: cA, itemStyle: { color: "#4558d0", borderRadius: [6, 6, 0, 0] } }, { value: cB, itemStyle: { color: "#22c55e", borderRadius: [6, 6, 0, 0] } }] }] };
  lineOpts.value = { tooltip: { trigger: "axis" }, legend: { data: ["A组累计", "B组累计"], bottom: 0 }, grid: { left: "10%", right: "4%", bottom: "14%", top: "6%" }, xAxis: { type: "category", data: trendLabels, axisLabel: { interval: Math.max(0, Math.floor(n / 8) - 1) } }, yAxis: { type: "value" }, series: [{ name: "A组累计", type: "line", data: trendA, smooth: true, showSymbol: false, lineStyle: { width: 2.5 }, itemStyle: { color: "#4558d0" }, areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(69,88,208,0.15)" }, { offset: 1, color: "rgba(69,88,208,0)" }] } } }, { name: "B组累计", type: "line", data: trendB, smooth: true, showSymbol: false, lineStyle: { width: 2.5 }, itemStyle: { color: "#22c55e" }, areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(34,197,94,0.15)" }, { offset: 1, color: "rgba(34,197,94,0)" }] } } }] };

  const dominant = cA === cB ? "两组完全均衡" : cA > cB ? "A组略多" : "B组略多";
  const tailText = tail > 0 ? `另有 1 个尾组，包含 ${tail} 例受试者。` : "所有受试者均落在完整区组中。";
  narrativeHtml.value = `本次区组随机共模拟 <strong>${n}</strong> 例受试者，采用 <strong>${ratioA}:${ratioB}</strong> 分配比例，区组大小为 <strong>${bs}</strong>。共生成 <strong>${totalBlocks}</strong> 个区组，其中完整区组 <strong>${full}</strong> 个。${tailText}<br/><br/>最终 <strong>A组 ${cA} 例</strong>（${pA}%），<strong>B组 ${cB} 例</strong>（${pB}%）。当前表现为 <strong>${dominant}</strong>，组间差值 <strong>${gap}</strong> 例。`;
}

const references = [
  { authors: "Matts JP, Lachin JM.", title: "Properties of permuted-block randomization in clinical trials.", journal: "Controlled Clinical Trials", year: "1988", volume: "9(4): 327-344", doi: "10.1016/0197-2456(88)90047-5" },
  { authors: "Efird J.", title: "Blocked randomization with randomly selected block sizes.", journal: "International Journal of Environmental Research and Public Health", year: "2011", volume: "8(1): 15-20", doi: "10.3390/ijerph8010015" },
  { authors: "Schulz KF, Grimes DA.", title: "Generation of allocation sequences in randomised trials: chance, not choice.", journal: "The Lancet", year: "2002", volume: "359(9305): 515-519", doi: "10.1016/S0140-6736(02)07683-3" },
  { authors: "Rosenberger WF, Lachin JM.", title: "Randomization in Clinical Trials: Theory and Practice.", journal: "John Wiley & Sons", year: "2015", volume: "2nd Edition", doi: "10.1002/9781118742112" },
  { authors: "ICH Expert Working Group.", title: "ICH E9: Statistical Principles for Clinical Trials.", journal: "International Council for Harmonisation", year: "1998", volume: "Step 4 Guideline", doi: "" },
];
function openDoi(doi: string) { if (doi) window.open(`https://doi.org/${doi}`, "_blank"); }

function runSimulation() { simulate(); }
onMounted(simulate);
</script>

<style scoped>
@import './random-shared.css';
</style>
