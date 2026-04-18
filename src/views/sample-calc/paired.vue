<template>
  <div class="app-container sample-calc-page">
    <AlgoIntro
      title="配对设计均数/率"
      hero-desc="基于配对 t 检验或 McNemar χ² 检验估算前后对照或匹配对照研究的样本量"
      hero-tag="PAIRED DESIGN"
      watermark="±d"
      :definition="introDefinition"
      :scenarios="introScenarios"
      :features="introFeatures"
      :params="introParams"
    />
    <el-row :gutter="20">
      <el-col :lg="8" :xs="24">
        <el-card shadow="never" class="mb-4">
          <template #header><span class="font-bold">设计模式</span></template>
          <el-radio-group v-model="mode" style="width:100%">
            <el-radio-button value="mean" style="width:50%">配对均数</el-radio-button>
            <el-radio-button value="prop" style="width:50%">配对率</el-radio-button>
          </el-radio-group>
        </el-card>
        <el-card shadow="never" class="mb-4">
          <template #header><span class="font-bold">检验配置</span></template>
          <el-form label-position="top">
            <el-form-item label="显著性水平 (α)"><el-select v-model="params.alpha" style="width:100%"><el-option :value="0.01" label="0.01" /><el-option :value="0.05" label="0.05" /><el-option :value="0.025" label="0.025" /></el-select></el-form-item>
            <el-form-item label="把握度"><el-select v-model="params.power" style="width:100%"><el-option :value="0.80" label="80%" /><el-option :value="0.85" label="85%" /><el-option :value="0.90" label="90%" /></el-select></el-form-item>
            <el-form-item label="检验方向"><el-radio-group v-model="params.tail"><el-radio-button value="two">双侧</el-radio-button><el-radio-button value="one">单侧</el-radio-button></el-radio-group></el-form-item>
            <el-form-item><template #label><div class="flex justify-between w-full"><span>脱落率</span><span class="font-mono text-[--el-color-primary]">{{ dropoutPct }}%</span></div></template><el-slider v-model="params.dropout" :min="0" :max="0.50" :step="0.05" :format-tooltip="v=>(v*100).toFixed(0)+'%'" /></el-form-item>
          </el-form>
        </el-card>
        <el-card v-if="mode==='mean'" shadow="never" class="mb-4">
          <template #header><span class="font-bold">配对均数参数</span></template>
          <el-form label-position="top">
            <el-form-item label="差值均数 (μd)"><el-input-number v-model="meanInputs.muD" :step="1" style="width:100%" /></el-form-item>
            <el-form-item label="差值标准差 (σd)"><el-input-number v-model="meanInputs.sigmaD" :min="0.01" :step="1" style="width:100%" /></el-form-item>
            <div class="bg-[--el-fill-color-lighter] rounded-lg p-3"><div class="flex justify-between items-baseline"><span class="text-xs text-gray">效应量 (μd/σd)</span><span class="text-xl font-bold font-mono text-[--el-color-primary]">{{ pairedES }}</span></div></div>
          </el-form>
        </el-card>
        <el-card v-else shadow="never" class="mb-4">
          <template #header><span class="font-bold">配对率参数 (McNemar)</span></template>
          <el-form label-position="top">
            <el-form-item><template #label><div class="flex justify-between w-full"><span>p₁₀ (前+后−)</span><span class="font-mono text-[--el-color-primary]">{{ (propInputs.p10*100).toFixed(0) }}%</span></div></template><el-slider v-model="propInputs.p10" :min="0.01" :max="0.50" :step="0.01" :format-tooltip="v=>(v*100).toFixed(0)+'%'" /></el-form-item>
            <el-form-item><template #label><div class="flex justify-between w-full"><span>p₀₁ (前−后+)</span><span class="font-mono text-[--el-color-primary]">{{ (propInputs.p01*100).toFixed(0) }}%</span></div></template><el-slider v-model="propInputs.p01" :min="0.01" :max="0.50" :step="0.01" :format-tooltip="v=>(v*100).toFixed(0)+'%'" /></el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :lg="16" :xs="24">
        <el-row :gutter="16" class="mb-4">
          <el-col :span="12">
            <div class="sc-metric-card sc-mc-blue" data-watermark="P">
              <div class="sc-label">所需配对数</div>
              <div class="sc-value">{{ results.nPairs }}</div>
              <div class="sc-sub">对</div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="sc-metric-card sc-mc-green" data-watermark="ΣN">
              <div class="sc-label">计划招募（含脱落）</div>
              <div class="sc-value">{{ results.totalN }}</div>
              <div class="sc-sub">含 {{ dropoutPct }}% 脱落</div>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="16" class="mb-4">
          <el-col :span="12"><el-card shadow="never"><template #header><span class="font-bold">敏感性分析</span></template><ECharts :options="sensOpts" height="340px" /></el-card></el-col>
          <el-col :span="12"><el-card shadow="never"><template #header><span class="font-bold">功效曲线</span></template><ECharts :options="powerOpts" height="340px" /></el-card></el-col>
        </el-row>
        <el-card shadow="never" class="mb-4">
          <template #header><span class="font-bold">参数汇总</span></template>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="检验方法">{{ mode==='mean'?'配对 t 检验':'McNemar χ² 检验' }}</el-descriptions-item>
            <el-descriptions-item label="α">{{ params.alpha }}</el-descriptions-item>
            <el-descriptions-item label="把握度">{{ (params.power*100).toFixed(0) }}%</el-descriptions-item>
            <el-descriptions-item v-if="mode==='mean'" label="效应量">{{ pairedES }}</el-descriptions-item>
            <el-descriptions-item v-if="mode==='prop'" label="p₁₀">{{ (propInputs.p10*100).toFixed(0) }}%</el-descriptions-item>
            <el-descriptions-item v-if="mode==='prop'" label="p₀₁">{{ (propInputs.p01*100).toFixed(0) }}%</el-descriptions-item>
            <el-descriptions-item label="所需配对数">{{ results.nPairs }}</el-descriptions-item>
            <el-descriptions-item label="计划招募"><span class="font-bold text-[--el-color-primary]">{{ results.totalN }}</span></el-descriptions-item>
          </el-descriptions>
        </el-card>
        <el-card shadow="never">
          <template #header><div class="flex justify-between items-center"><span class="font-bold">方法学段落</span><el-button size="small" @click="copyReport">{{ copied?'✓ 已复制':'复制文本' }}</el-button></div></template>
          <el-input type="textarea" :rows="6" :model-value="reportText" readonly resize="none" />
        </el-card>
        <References :references="references" class="mt-4" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import AlgoIntro from "./AlgoIntro.vue";
import References from "./References.vue";

defineOptions({ name: "Paired" });

const introDefinition = [
  "配对设计是同一受试者或匹配对象在两个条件下的对比研究。连续型结局使用<strong>配对 t 检验</strong>，二分类结局使用 <strong>McNemar χ² 检验</strong>。",
  "配对设计的效应量是<strong>差值</strong>，利用个体内匹配特性可以消除个体差异，样本量通常显著低于独立样本设计。",
];
const introScenarios = [
  "<strong>前后对照</strong>：同一受试者治疗前后的指标对比（血压、血糖、量表评分）。",
  "<strong>同体双侧</strong>：同一个体双眼、双耳、双肢对比研究。",
  "<strong>1:1 匹配病例对照</strong>：按年龄、性别等特征精确匹配的对照研究。",
  "<strong>交叉设计</strong>：同一受试者先后接受 A/B 两种干预（需考虑洗脱期）。",
];
const introFeatures = [
  "<strong>优点</strong>：通过个体内比较大幅减小方差，样本量相比独立样本设计可降低 30-50%。",
  "<strong>对标准差敏感</strong>：配对 t 检验依赖差值标准差 σd，需重点评估其合理性。",
  "<strong>缺失数据处理</strong>：若一方数据缺失则整对丢失，需严格控制脱落。",
];
const introParams = [
  { title: "设计模式", desc: "配对均数用于连续变量；配对率（McNemar）用于二分类变量。" },
  { title: "差值均数 μd / 标准差 σd", desc: "配对 t 检验的核心效应量，μd/σd 即为配对效应量。" },
  { title: "p₁₀ / p₀₁", desc: "McNemar 设计中前阳性/后阴性、前阴性/后阳性的不一致率。" },
  { title: "显著性水平 α & 把握度", desc: "常用双侧 α=0.05、Power=80%。" },
  { title: "脱落率", desc: "配对设计脱落 = 整对丢失，通常需要按 1/(1−dropout) 上调。" },
];

const references = [
  { authors: "McNemar Q.", title: "Note on the sampling error of the difference between correlated proportions or percentages.", journal: "Psychometrika", year: "1947", volume: "12(2): 153-157", doi: "10.1007/BF02295996" },
  { authors: "Miettinen OS.", title: "The matched pairs design in the case of all-or-none responses.", journal: "Biometrics", year: "1968", volume: "24(2): 339-352", doi: "10.2307/2528038" },
  { authors: "Connor RJ.", title: "Sample size for testing differences in proportions for the paired-sample design.", journal: "Biometrics", year: "1987", volume: "43(1): 207-211", doi: "10.2307/2531961" },
  { authors: "Chow SC, Shao J, Wang H, Lokhnygina Y.", title: "Sample Size Calculations in Clinical Research.", journal: "Chapman and Hall/CRC", year: "2017", volume: "3rd Edition", doi: "10.1201/9781315183084" },
  { authors: "Julious SA.", title: "Sample Sizes for Clinical Trials.", journal: "Chapman and Hall/CRC", year: "2023", volume: "2nd Edition", doi: "10.1201/9780429503658" },
];

const mode = ref<"mean"|"prop">("mean");
const params = ref({ alpha: 0.05, power: 0.80, tail: "two" as "two"|"one", dropout: 0.10 });
const meanInputs = ref({ muD: 5, sigmaD: 10 });
const propInputs = ref({ p10: 0.15, p01: 0.05 });
const results = ref({ nPairs: 0, totalN: 0 });
const copied = ref(false);
const sensOpts = ref({}); const powerOpts = ref({});

const dropoutPct = computed(() => (params.value.dropout * 100).toFixed(0));
const pairedES = computed(() => meanInputs.value.sigmaD ? (Math.abs(meanInputs.value.muD) / meanInputs.value.sigmaD).toFixed(3) : "0.000");

function invNorm(p: number): number {
  if(p<=0||p>=1)return 0;const a1=-39.6968302866538,a2=220.946098424521,a3=-275.928510446969,a4=138.357751867269,b1=-55.8523268975479,b2=148.144926055571,b3=-133.425630379764,b4=51.5246332174095,c1=-7.78489400243029e-3,c2=-0.322396458041136,c3=-2.40075827716184,c4=-2.54973253934373,d2=0.32246712907004,d3=2.445134137143;
  let x:number;const q=p-0.5;let r:number;
  if(Math.abs(q)<=0.425){r=q*q;x=q*(((a4*r+a3)*r+a2)*r+a1)/((((b4*r+b3)*r+b2)*r+b1)*r+1)}
  else{r=p<0.5?p:1-p;r=Math.sqrt(-2*Math.log(r));x=(((c4*r+c3)*r+c2)*r+c1)/((d3*r+d2)*r+1);if(p<0.5)x=-x}
  return x;
}
function normCDF(x: number): number { const s=x<0?-1:1;x=Math.abs(x)/Math.sqrt(2);const t=1/(1+0.3275911*x);const y=1-((((1.061405429*t-1.453152027)*t+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x);return 0.5*(1+s*y); }

function calcPairedT(es: number, alpha: number, power: number, tail: string): number {
  if (es <= 0) return Infinity;
  const zAlpha = tail === "two" ? invNorm(1 - alpha / 2) : invNorm(1 - alpha);
  return Math.ceil(Math.pow((zAlpha + invNorm(power)) / es, 2));
}

function calcMcNemar(p10: number, p01: number, alpha: number, power: number, tail: string): number {
  const diff = p10 - p01; if (diff === 0) return Infinity;
  const zAlpha = tail === "two" ? invNorm(1 - alpha / 2) : invNorm(1 - alpha);
  const zBeta = invNorm(power); const pSum = p10 + p01;
  return Math.ceil(Math.pow(zAlpha * Math.sqrt(pSum) + zBeta * Math.sqrt(pSum - diff * diff), 2) / (diff * diff));
}

function calcPowerMean(n: number, es: number, alpha: number, tail: string): number {
  if (es <= 0 || n <= 0) return 0;
  return normCDF(es * Math.sqrt(n) - (tail === "two" ? invNorm(1 - alpha / 2) : invNorm(1 - alpha)));
}
function calcPowerProp(n: number, p10: number, p01: number, alpha: number, tail: string): number {
  const diff = p10 - p01; if (diff === 0 || n <= 0) return 0;
  const zAlpha = tail === "two" ? invNorm(1 - alpha / 2) : invNorm(1 - alpha);
  const pSum = p10 + p01; const den = Math.sqrt(pSum - diff * diff); if (den <= 0) return 0;
  return normCDF((Math.abs(diff) * Math.sqrt(n) - zAlpha * Math.sqrt(pSum)) / den);
}

function update() {
  let n: number;
  if (mode.value === "mean") { const es = meanInputs.value.sigmaD ? Math.abs(meanInputs.value.muD) / meanInputs.value.sigmaD : 0; n = calcPairedT(es, params.value.alpha, params.value.power, params.value.tail); }
  else { n = calcMcNemar(propInputs.value.p10, propInputs.value.p01, params.value.alpha, params.value.power, params.value.tail); }
  if (!isFinite(n)) { results.value = { nPairs: 0, totalN: 0 }; return; }
  results.value = { nPairs: n, totalN: Math.ceil(n / (1 - params.value.dropout)) };

  // 敏感性
  const sxs: string[] = []; const sys: number[] = [];
  if (mode.value === "mean") { for (let es = 0.1; es <= 1.5; es += 0.05) { const nn = calcPairedT(es, params.value.alpha, params.value.power, params.value.tail); if (isFinite(nn)) { sxs.push(es.toFixed(2)); sys.push(Math.ceil(nn / (1 - params.value.dropout))); } } }
  else { for (let diff = 0.02; diff <= 0.30; diff += 0.01) { const nn = calcMcNemar(propInputs.value.p10, propInputs.value.p10 - diff, params.value.alpha, params.value.power, params.value.tail); if (isFinite(nn) && nn < 5000) { sxs.push((diff * 100).toFixed(0) + "%"); sys.push(Math.ceil(nn / (1 - params.value.dropout))); } } }
  sensOpts.value = { tooltip: { trigger: "axis" }, grid: { left: "10%", right: "4%", bottom: "12%", top: "6%" }, xAxis: { type: "category", data: sxs, name: mode.value === "mean" ? "效应量" : "不一致率差" }, yAxis: { type: "value", name: "配对数", splitLine: { lineStyle: { type: "dashed" } } }, series: [{ type: "line", data: sys, smooth: true, areaStyle: { opacity: 0.08 }, lineStyle: { width: 2.5 } }] };

  // 功效
  const pxs: number[] = []; const pys: number[] = []; const maxN = Math.max(n * 3, 50);
  for (let nn = 5; nn <= maxN; nn += Math.max(1, Math.floor(maxN / 150))) {
    pxs.push(nn);
    if (mode.value === "mean") { const es = meanInputs.value.sigmaD ? Math.abs(meanInputs.value.muD) / meanInputs.value.sigmaD : 0; pys.push(Math.round(calcPowerMean(nn, es, params.value.alpha, params.value.tail) * 1000) / 10); }
    else { pys.push(Math.round(calcPowerProp(nn, propInputs.value.p10, propInputs.value.p01, params.value.alpha, params.value.tail) * 1000) / 10); }
  }
  powerOpts.value = { tooltip: { trigger: "axis" }, grid: { left: "10%", right: "4%", bottom: "12%", top: "6%" }, xAxis: { type: "category", data: pxs.map(String), name: "配对数", axisLabel: { interval: Math.floor(pxs.length / 8) } }, yAxis: { type: "value", name: "Power (%)", max: 105, splitLine: { lineStyle: { type: "dashed" } } },
    series: [{ type: "line", data: pys, smooth: true, areaStyle: { opacity: 0.06 }, lineStyle: { width: 2.5, color: "#a78bfa" }, itemStyle: { color: "#a78bfa" } }],
    visualMap: { show: false, pieces: [{ lte: 80, color: "#f56c6c" }, { gt: 80, color: "#67c23a" }], seriesIndex: 0 } };
}

const reportText = computed(() => {
  const tailText = params.value.tail === "two" ? "双侧" : "单侧";
  if (mode.value === "mean") return `本研究采用配对 t 检验，设定${tailText} α=${params.value.alpha}，Power=${(params.value.power*100).toFixed(0)}%。差值均数 μd=${meanInputs.value.muD}，σd=${meanInputs.value.sigmaD}，效应量=${pairedES.value}。需 ${results.value.nPairs} 对，含 ${dropoutPct.value}% 脱落共 ${results.value.totalN} 人。`;
  return `本研究采用 McNemar 检验，设定${tailText} α=${params.value.alpha}，Power=${(params.value.power*100).toFixed(0)}%。p₁₀=${(propInputs.value.p10*100).toFixed(0)}%，p₀₁=${(propInputs.value.p01*100).toFixed(0)}%。需 ${results.value.nPairs} 对，含 ${dropoutPct.value}% 脱落共 ${results.value.totalN} 对。`;
});

function copyReport() { navigator.clipboard.writeText(reportText.value); copied.value = true; setTimeout(() => (copied.value = false), 2000); }
watch([mode, params, meanInputs, propInputs], update, { deep: true });
onMounted(update);
</script>
<style scoped>
.font-mono { font-family: "JetBrains Mono", monospace; }
</style>
