<template>
  <div class="app-container sample-calc-page">
    <AlgoIntro
      title="生存分析 Log-Rank 检验"
      hero-desc="基于 Schoenfeld 公式估算事件驱动型研究的样本量与所需事件数，适用于 OS/PFS 等生存终点"
      hero-tag="LOG-RANK"
      watermark="S(t)"
      :definition="introDefinition"
      :scenarios="introScenarios"
      :features="introFeatures"
      :params="introParams"
    />
    <el-row :gutter="20">
      <el-col :lg="8" :xs="24">
        <el-card shadow="never" class="mb-4">
          <template #header><span class="font-bold">检验配置</span></template>
          <el-form label-position="top">
            <el-form-item label="显著性水平 (α)">
              <el-select v-model="params.alpha" style="width:100%">
                <el-option :value="0.01" label="0.01" /><el-option :value="0.05" label="0.05 (推荐)" /><el-option :value="0.025" label="0.025" />
              </el-select>
            </el-form-item>
            <el-form-item label="把握度 (Power)">
              <el-select v-model="params.power" style="width:100%">
                <el-option :value="0.80" label="80%" /><el-option :value="0.85" label="85%" /><el-option :value="0.90" label="90%" />
              </el-select>
            </el-form-item>
            <el-form-item label="检验类型">
              <el-radio-group v-model="params.tail"><el-radio-button value="two">双侧</el-radio-button><el-radio-button value="one">单侧</el-radio-button></el-radio-group>
            </el-form-item>
          </el-form>
        </el-card>
        <el-card shadow="never" class="mb-4">
          <template #header><span class="font-bold">生存参数</span></template>
          <el-form label-position="top">
            <el-form-item label="对照组中位生存期 (月)"><el-input-number v-model="inputs.medianControl" :min="0.1" :step="1" style="width:100%" /></el-form-item>
            <el-form-item label="实验组中位生存期 (月)"><el-input-number v-model="inputs.medianTreat" :min="0.1" :step="1" style="width:100%" /></el-form-item>
            <el-form-item label="入组期 (月)"><el-input-number v-model="inputs.accrualTime" :min="1" :step="1" style="width:100%" /></el-form-item>
            <el-form-item label="随访期 (月)"><el-input-number v-model="inputs.followupTime" :min="0" :step="1" style="width:100%" /><div class="text-xs text-gray mt-1">入组结束后的额外随访时间</div></el-form-item>
            <div class="bg-[--el-fill-color-lighter] rounded-lg p-3">
              <div class="flex justify-between items-baseline"><span class="text-xs text-gray">Hazard Ratio (HR)</span><span class="text-xl font-bold font-mono text-[--el-color-primary]">{{ hr }}</span></div>
              <div class="text-xs text-gray mt-1">HR &lt; 1 表示实验组优于对照组</div>
            </div>
          </el-form>
        </el-card>
        <el-card shadow="never">
          <template #header><span class="font-bold">校正</span></template>
          <el-form label-position="top">
            <el-form-item><template #label><div class="flex justify-between w-full"><span>脱落率</span><span class="font-mono text-[--el-color-primary] font-bold">{{ dropoutPct }}%</span></div></template>
              <el-slider v-model="params.dropout" :min="0" :max="0.50" :step="0.05" :format-tooltip="v=>(v*100).toFixed(0)+'%'" /></el-form-item>
            <el-form-item label="分配比例"><el-radio-group v-model="params.ratio"><el-radio-button :value="1">1:1</el-radio-button><el-radio-button :value="2">2:1</el-radio-button></el-radio-group></el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :lg="16" :xs="24">
        <el-row :gutter="12" class="mb-4">
          <el-col :span="8">
            <div class="sc-metric-card sc-mc-blue" data-watermark="E">
              <div class="sc-label">所需事件数</div>
              <div class="sc-value">{{ results.events }}</div>
              <div class="sc-sub">终点事件</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="sc-metric-card sc-mc-green" data-watermark="N">
              <div class="sc-label">每组受试者</div>
              <div class="sc-value">{{ results.nControl }}</div>
              <div class="sc-sub">对照 {{ results.nControl }} · 实验 {{ results.nTreat }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="sc-metric-card sc-mc-amber" data-watermark="ΣN">
              <div class="sc-label">总入组（含脱落）</div>
              <div class="sc-value">{{ results.totalN }}</div>
              <div class="sc-sub">含 {{ dropoutPct }}% 脱落</div>
            </div>
          </el-col>
        </el-row>
        <div class="sc-tag-row">
          <el-tag effect="plain" size="small">α={{ params.alpha }}</el-tag>
          <el-tag effect="plain" size="small">Power={{ (params.power*100).toFixed(0) }}%</el-tag>
          <el-tag effect="plain" size="small" type="success">HR={{ hr }}</el-tag>
          <el-tag effect="plain" size="small">入组{{ inputs.accrualTime }}m</el-tag>
          <el-tag effect="plain" size="small">随访{{ inputs.followupTime }}m</el-tag>
        </div>
        <el-row :gutter="16" class="mb-4">
          <el-col :span="12"><el-card shadow="never"><template #header><span class="font-bold">敏感性 · HR vs 事件数</span></template><ECharts :options="sensChartOpts" height="340px" /></el-card></el-col>
          <el-col :span="12"><el-card shadow="never"><template #header><span class="font-bold">K-M 生存曲线预览</span></template><ECharts :options="kmChartOpts" height="340px" /></el-card></el-col>
        </el-row>
        <el-card shadow="never" class="mb-4">
          <template #header><span class="font-bold">参数汇总</span></template>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="检验方法">Log-Rank 检验 (Schoenfeld 公式)</el-descriptions-item>
            <el-descriptions-item label="α">{{ params.alpha }}</el-descriptions-item>
            <el-descriptions-item label="把握度">{{ (params.power*100).toFixed(0) }}%</el-descriptions-item>
            <el-descriptions-item label="对照组中位生存期">{{ inputs.medianControl }} 月</el-descriptions-item>
            <el-descriptions-item label="实验组中位生存期">{{ inputs.medianTreat }} 月</el-descriptions-item>
            <el-descriptions-item label="Hazard Ratio">{{ hr }}</el-descriptions-item>
            <el-descriptions-item label="入组期 + 随访期">{{ inputs.accrualTime }} + {{ inputs.followupTime }} = {{ inputs.accrualTime+inputs.followupTime }} 月</el-descriptions-item>
            <el-descriptions-item label="所需事件数">{{ results.events }}</el-descriptions-item>
            <el-descriptions-item label="总招募人数"><span class="font-bold text-[--el-color-primary]">{{ results.totalN }}</span></el-descriptions-item>
          </el-descriptions>
        </el-card>
        <el-card shadow="never">
          <template #header><div class="flex justify-between items-center"><span class="font-bold">方法学段落</span><el-button size="small" @click="copyReport">{{ copied?'✓ 已复制':'复制文本' }}</el-button></div></template>
          <el-input type="textarea" :rows="7" :model-value="reportText" readonly resize="none" />
        </el-card>
        <References :references="references" class="mt-4" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import AlgoIntro from "./AlgoIntro.vue";
import References from "./References.vue";

defineOptions({ name: "LogRank" });

const introDefinition = [
  "生存分析样本量估算基于 <strong>Log-Rank 检验</strong>与 <strong>Schoenfeld 公式</strong>，核心是先确定所需<strong>事件数 d</strong>，再根据预期的事件发生概率回推受试者数量。",
  "关键效应量为 <strong>Hazard Ratio (HR)</strong>，HR<1 表示实验组风险更低（预后更好），HR 越偏离 1 所需事件数越少。",
];
const introScenarios = [
  "肿瘤学中 <strong>OS（总生存）</strong>、<strong>PFS（无进展生存）</strong>、<strong>DFS（无病生存）</strong>等时间-事件型终点。",
  "心血管、肾病等慢性病长期随访研究（首次 MACE、ESRD 等）。",
  "器官移植、透析、血管再通等需要长期随访的设备/干预研究。",
];
const introFeatures = [
  "<strong>事件驱动</strong>：统计效力取决于事件数而非受试者数，低事件率场景需更大样本。",
  "<strong>比例风险假设</strong>：Schoenfeld 公式要求 HR 在随访期内大致恒定，需检验 PH 假设。",
  "<strong>入组期与随访期</strong>：较长入组期+较短随访期 vs. 较短入组期+较长随访期对总周期影响较大。",
];
const introParams = [
  { title: "对照组与实验组中位生存期", desc: "常用 m₁、m₂（月），换算 HR = ln(2)/m₂ ÷ ln(2)/m₁ = m₁/m₂（指数分布假设下）。" },
  { title: "入组期 + 随访期", desc: "入组期内受试者陆续入组，随访期指入组结束后的额外观察时间。" },
  { title: "Hazard Ratio (HR)", desc: "风险比。临床常见 HR=0.70-0.80 范围的肿瘤研究，较小 HR 需要更多事件数。" },
  { title: "显著性水平与把握度", desc: "肿瘤研究常用双侧 α=0.05、Power=80%；重要 III 期研究可提高到 Power=90%。" },
  { title: "脱落率", desc: "长期随访的脱落/失访通常明显，建议按 1/(1−dropout) 放大招募数。" },
];

const references = [
  { authors: "Schoenfeld DA.", title: "Sample-size formula for the proportional-hazards regression model.", journal: "Biometrics", year: "1983", volume: "39(2): 499-503", doi: "10.2307/2531021" },
  { authors: "Freedman LS.", title: "Tables of the number of patients required in clinical trials using the logrank test.", journal: "Statistics in Medicine", year: "1982", volume: "1(2): 121-129", doi: "10.1002/sim.4780010204" },
  { authors: "Collett D.", title: "Modelling Survival Data in Medical Research.", journal: "Chapman and Hall/CRC", year: "2015", volume: "3rd Edition", doi: "10.1201/b18041" },
  { authors: "Lakatos E.", title: "Sample sizes based on the log-rank statistic in complex clinical trials.", journal: "Biometrics", year: "1988", volume: "44(1): 229-241", doi: "10.2307/2531910" },
  { authors: "ICH Expert Working Group.", title: "ICH E9: Statistical Principles for Clinical Trials.", journal: "International Council for Harmonisation", year: "1998", volume: "Step 4 Guideline", doi: "" },
];

const params = ref({ alpha: 0.05, power: 0.80, tail: "two" as "two"|"one", dropout: 0.10, ratio: 1 });
const inputs = ref({ medianControl: 12, medianTreat: 18, accrualTime: 24, followupTime: 12 });
const results = ref({ events: 0, nControl: 0, nTreat: 0, totalN: 0 });
const copied = ref(false);
const sensChartOpts = ref({});
const kmChartOpts = ref({});

const dropoutPct = computed(() => (params.value.dropout * 100).toFixed(0));
const hrVal = computed(() => inputs.value.medianTreat > 0 ? inputs.value.medianControl / inputs.value.medianTreat : 1);
const hr = computed(() => hrVal.value.toFixed(3));

function invNorm(p: number): number {
  if(p<=0||p>=1)return 0;const a1=-39.6968302866538,a2=220.946098424521,a3=-275.928510446969,a4=138.357751867269,b1=-55.8523268975479,b2=148.144926055571,b3=-133.425630379764,b4=51.5246332174095,c1=-7.78489400243029e-3,c2=-0.322396458041136,c3=-2.40075827716184,c4=-2.54973253934373,d2=0.32246712907004,d3=2.445134137143;
  let x:number;const q=p-0.5;let r:number;
  if(Math.abs(q)<=0.425){r=q*q;x=q*(((a4*r+a3)*r+a2)*r+a1)/((((b4*r+b3)*r+b2)*r+b1)*r+1)}
  else{r=p<0.5?p:1-p;r=Math.sqrt(-2*Math.log(r));x=(((c4*r+c3)*r+c2)*r+c1)/((d3*r+d2)*r+1);if(p<0.5)x=-x}
  return x;
}

function calcEvents(hrv: number, alpha: number, power: number, tail: string, ratio: number): number {
  if (hrv === 1) return Infinity;
  const zAlpha = tail === "two" ? invNorm(1 - alpha / 2) : invNorm(1 - alpha);
  const zBeta = invNorm(power);
  const k = ratio; const pi1 = 1/(1+k); const pi2 = k/(1+k);
  return Math.ceil(Math.pow(zAlpha + zBeta, 2) / (pi1 * pi2 * Math.pow(Math.log(hrv), 2)));
}

function eventProb(median: number, accrual: number, followup: number): number {
  const lambda = Math.log(2) / median;
  const p = 1 - (1 / (lambda * accrual)) * (Math.exp(-lambda * followup) - Math.exp(-lambda * (accrual + followup)));
  return Math.min(Math.max(p, 0.01), 0.99);
}

function update() {
  const hrv = hrVal.value;
  if (hrv === 1 || !isFinite(hrv)) { results.value = { events: 0, nControl: 0, nTreat: 0, totalN: 0 }; return; }
  const E = calcEvents(hrv, params.value.alpha, params.value.power, params.value.tail, params.value.ratio);
  if (!isFinite(E)) { results.value = { events: 0, nControl: 0, nTreat: 0, totalN: 0 }; return; }
  const k = params.value.ratio;
  const pC = eventProb(inputs.value.medianControl, inputs.value.accrualTime, inputs.value.followupTime);
  const pT = eventProb(inputs.value.medianTreat, inputs.value.accrualTime, inputs.value.followupTime);
  const pAvg = (pC + k * pT) / (1 + k);
  const nRaw = Math.ceil(E / pAvg); const n1 = Math.ceil(nRaw / (1 + k)); const n2 = Math.ceil(k * n1);
  const adj1 = Math.ceil(n1 / (1 - params.value.dropout)); const adj2 = Math.ceil(n2 / (1 - params.value.dropout));
  results.value = { events: E, nControl: n1, nTreat: n2, totalN: adj1 + adj2 };

  // 敏感性图
  const xs: string[] = []; const ys: number[] = [];
  for (let h = 0.3; h <= 0.95; h += 0.02) { const e = calcEvents(h, params.value.alpha, params.value.power, params.value.tail, params.value.ratio); if (isFinite(e)) { xs.push(h.toFixed(2)); ys.push(e); } }
  const curIdx = xs.findIndex(x => x === hrv.toFixed(2));
  sensChartOpts.value = { tooltip: { trigger: "axis" }, grid: { left: "10%", right: "4%", bottom: "12%", top: "6%" }, xAxis: { type: "category", data: xs, name: "Hazard Ratio" }, yAxis: { type: "value", name: "所需事件数", splitLine: { lineStyle: { type: "dashed" } } },
    series: [{ type: "line", data: ys, smooth: true, areaStyle: { opacity: 0.08 }, lineStyle: { width: 2.5 }, markPoint: curIdx >= 0 ? { data: [{ coord: [curIdx, ys[curIdx]], symbol: "diamond", symbolSize: 14, label: { show: true, formatter: ys[curIdx] + "事件", position: "top" } }], itemStyle: { color: "#f56c6c" } } : undefined }] };

  // KM 曲线
  const mC = inputs.value.medianControl, mT = inputs.value.medianTreat;
  const lamC = Math.log(2) / mC, lamT = Math.log(2) / mT;
  const tMax = Math.max(mC, mT) * 3;
  const tArr: number[] = []; const yC: number[] = []; const yT: number[] = [];
  for (let t = 0; t <= tMax; t += tMax / 100) { tArr.push(Math.round(t * 10) / 10); yC.push(Math.round(Math.exp(-lamC * t) * 1000) / 10); yT.push(Math.round(Math.exp(-lamT * t) * 1000) / 10); }
  kmChartOpts.value = { tooltip: { trigger: "axis" }, legend: { data: ["对照组", "实验组"], bottom: 0 }, grid: { left: "10%", right: "4%", bottom: "14%", top: "6%" },
    xAxis: { type: "category", data: tArr.map(String), name: "时间(月)", axisLabel: { interval: 9 } }, yAxis: { type: "value", name: "生存率(%)", max: 105, splitLine: { lineStyle: { type: "dashed" } } },
    series: [{ name: "对照组", type: "line", data: yC, step: "end", lineStyle: { width: 2 }, showSymbol: false }, { name: "实验组", type: "line", data: yT, step: "end", lineStyle: { width: 2 }, showSymbol: false }] };
}

const reportText = computed(() => {
  const tailText = params.value.tail === "two" ? "双侧" : "单侧";
  const adj1 = Math.ceil(results.value.nControl / (1 - params.value.dropout));
  const adj2 = Math.ceil(results.value.nTreat / (1 - params.value.dropout));
  return `本研究采用 Log-Rank 检验比较两组生存曲线差异，基于 Schoenfeld 公式进行样本量估算。设定${tailText}检验显著性水平 α = ${params.value.alpha}，把握度 (1−β) = ${(params.value.power*100).toFixed(0)}%，分配比例 ${params.value.ratio}:1。\n\n假设对照组中位生存期为 ${inputs.value.medianControl} 个月，实验组中位生存期为 ${inputs.value.medianTreat} 个月，对应 HR = ${hr.value}。计划入组期 ${inputs.value.accrualTime} 个月，随访 ${inputs.value.followupTime} 个月。\n\n所需终点事件数为 ${results.value.events} 个。考虑 ${dropoutPct.value}% 脱落率，对照组 ${adj1} 例，实验组 ${adj2} 例，共计 ${results.value.totalN} 例。`;
});

function copyReport() { navigator.clipboard.writeText(reportText.value); copied.value = true; setTimeout(() => (copied.value = false), 2000); }
watch([params, inputs], update, { deep: true });
onMounted(update);
</script>
<style scoped>
.font-mono { font-family: "JetBrains Mono", monospace; }
</style>
