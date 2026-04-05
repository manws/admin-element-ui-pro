<template>
  <div class="app-container random-block">
    <!-- 算法介绍 + 参数介绍 -->
    <el-row :gutter="16" class="mb-4">
      <el-col :lg="16" :xs="24">
        <el-card shadow="never" class="h-full">
          <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">算法介绍</span><el-tag size="small" effect="plain">BLOCK RANDOM</el-tag></div></template>
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
        </el-card>
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
    <el-card shadow="never" class="mb-4">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-bold text-lg">模拟随机</span>
          <span class="text-xs text-gray">按区组大小和分配比例生成区组随机结果</span>
        </div>
      </template>
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
      <div class="text-xs text-gray mt-2">{{ footnote }}</div>
    </el-card>

    <!-- 统计指标 -->
    <el-row :gutter="16" class="mb-4">
      <el-col :lg="6" :md="6" :xs="12">
        <el-card shadow="never" class="metric-card accent">
          <div class="text-xs text-gray mb-2">A组人数</div>
          <div class="text-3xl font-bold">{{ res.countA }}</div>
          <div class="text-xs text-gray mt-2">占比 {{ res.percentA }}%</div>
        </el-card>
      </el-col>
      <el-col :lg="6" :md="6" :xs="12">
        <el-card shadow="never" class="metric-card success">
          <div class="text-xs text-gray mb-2">B组人数</div>
          <div class="text-3xl font-bold">{{ res.countB }}</div>
          <div class="text-xs text-gray mt-2">占比 {{ res.percentB }}%</div>
        </el-card>
      </el-col>
      <el-col :lg="6" :md="6" :xs="12">
        <el-card shadow="never" class="metric-card warning">
          <div class="text-xs text-gray mb-2">区组数量</div>
          <div class="text-3xl font-bold">{{ res.totalBlocks }}</div>
          <div class="text-xs text-gray mt-2">{{ res.tailSize > 0 ? `完整 ${res.fullBlocks} 个，尾组 ${res.tailSize} 例` : `完整 ${res.fullBlocks} 个` }}</div>
        </el-card>
      </el-col>
      <el-col :lg="6" :md="6" :xs="12">
        <el-card shadow="never" class="metric-card neutral">
          <div class="text-xs text-gray mb-2">组间差值</div>
          <div class="text-3xl font-bold">{{ res.gap }}</div>
          <div class="text-xs text-gray mt-2">{{ res.gap === 0 ? '整体分配完全均衡' : `当前 A/B 组相差 ${res.gap} 例` }}</div>
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

    <!-- 入组列表 + 结果说明 -->
    <el-row :gutter="16" class="mb-4">
      <el-col :lg="12" :xs="24">
        <el-card shadow="never">
          <template #header><span class="font-bold">受试者入组列表</span></template>
          <el-table :data="res.rows" size="small" max-height="400" stripe border>
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

  pieOpts.value = { tooltip: { trigger: "item" }, legend: { bottom: 0 }, series: [{ type: "pie", radius: ["40%", "70%"], data: [{ value: cA, name: "A组", itemStyle: { color: "#409EFF" } }, { value: cB, name: "B组", itemStyle: { color: "#67C23A" } }], label: { formatter: "{b}: {c} ({d}%)" } }] };
  barOpts.value = { tooltip: { trigger: "axis" }, grid: { left: "10%", right: "4%", bottom: "8%", top: "8%" }, xAxis: { type: "category", data: ["A组", "B组"] }, yAxis: { type: "value" }, series: [{ type: "bar", barWidth: "40%", data: [{ value: cA, itemStyle: { color: "#409EFF", borderRadius: [6, 6, 0, 0] } }, { value: cB, itemStyle: { color: "#67C23A", borderRadius: [6, 6, 0, 0] } }] }] };
  lineOpts.value = { tooltip: { trigger: "axis" }, legend: { data: ["A组累计", "B组累计"], bottom: 0 }, grid: { left: "10%", right: "4%", bottom: "14%", top: "6%" }, xAxis: { type: "category", data: trendLabels, axisLabel: { interval: Math.max(0, Math.floor(n / 8) - 1) } }, yAxis: { type: "value" }, series: [{ name: "A组累计", type: "line", data: trendA, smooth: true, showSymbol: false, lineStyle: { width: 2.5 }, itemStyle: { color: "#409EFF" } }, { name: "B组累计", type: "line", data: trendB, smooth: true, showSymbol: false, lineStyle: { width: 2.5 }, itemStyle: { color: "#67C23A" } }] };

  const dominant = cA === cB ? "两组完全均衡" : cA > cB ? "A组略多" : "B组略多";
  const tailText = tail > 0 ? `另有 1 个尾组，包含 ${tail} 例受试者。` : "所有受试者均落在完整区组中。";
  narrativeHtml.value = `本次区组随机共模拟 <strong>${n}</strong> 例受试者，采用 <strong>${ratioA}:${ratioB}</strong> 分配比例，区组大小为 <strong>${bs}</strong>。共生成 <strong>${totalBlocks}</strong> 个区组，其中完整区组 <strong>${full}</strong> 个。${tailText}<br/><br/>最终 <strong>A组 ${cA} 例</strong>（${pA}%），<strong>B组 ${cB} 例</strong>（${pB}%）。当前表现为 <strong>${dominant}</strong>，组间差值 <strong>${gap}</strong> 例。`;
}

function runSimulation() { simulate(); }
onMounted(simulate);
</script>

<style scoped>
.algo-body h3 { font-size: 18px; font-weight: 700; margin: 0 0 14px; }
.algo-body h4 { font-size: 14px; font-weight: 600; margin: 16px 0 6px; color: var(--el-text-color-primary); }
.algo-body h4:first-of-type { margin-top: 0; }
.algo-body p, .algo-body ul { font-size: 13px; color: var(--el-text-color-secondary); line-height: 1.85; margin: 0 0 4px; }
.algo-body ul { padding-left: 16px; }
.param-sidebar { height: 100%; padding: 18px; border-radius: var(--el-card-border-radius, 12px); background: rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.03); border: 1px solid var(--el-border-color-lighter); }
.param-sidebar-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 700; }
.param-sidebar-icon { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.08); flex-shrink: 0; }
.param-sidebar-list { display: flex; flex-direction: column; gap: 14px; }
.param-sidebar-item { display: flex; gap: 10px; align-items: flex-start; }
.param-sidebar-num { width: 26px; height: 26px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.07); color: var(--el-color-primary); font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
.param-sidebar-name { font-size: 13px; font-weight: 600; color: var(--el-text-color-primary); margin-bottom: 3px; }
.param-sidebar-desc { font-size: 11.5px; color: var(--el-text-color-secondary); line-height: 1.65; }
.h-full { height: 100%; }
.btn-col { display: flex; align-items: flex-end; padding-bottom: 18px; }
.metric-card { text-align: center; }
.metric-card.accent { border-top: 3px solid #409EFF; }
.metric-card.success { border-top: 3px solid #67C23A; }
.metric-card.warning { border-top: 3px solid #E6A23C; }
.metric-card.neutral { border-top: 3px solid #909399; }
</style>
