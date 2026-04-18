<template>
  <div class="app-container sample-calc-page">
    <AlgoIntro
      title="诊断试验灵敏度与特异度"
      hero-desc="基于置信区间方法估算诊断性能评估所需的病例、对照与横断面样本量"
      hero-tag="DIAGNOSTIC"
      watermark="Dx"
      :definition="introDefinition"
      :scenarios="introScenarios"
      :features="introFeatures"
      :params="introParams"
    />
    <el-row :gutter="20">
      <el-col :lg="8" :xs="24">
        <el-card shadow="never" class="mb-4">
          <template #header><span class="font-bold">估算目标</span></template>
          <el-form label-position="top">
            <el-form-item label="估算指标">
              <el-radio-group v-model="params.metric">
                <el-radio-button value="sens">灵敏度</el-radio-button>
                <el-radio-button value="spec">特异度</el-radio-button>
                <el-radio-button value="both">同时估算</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="置信水平">
              <el-select v-model="params.ci" style="width:100%">
                <el-option :value="0.90" label="90%" />
                <el-option :value="0.95" label="95% (推荐)" />
                <el-option :value="0.99" label="99%" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-card>
        <el-card shadow="never" class="mb-4">
          <template #header><span class="font-bold">灵敏度参数</span></template>
          <el-form label-position="top">
            <el-form-item>
              <template #label><div class="flex justify-between w-full"><span>预期灵敏度 (Sn)</span><span class="text-[--el-color-primary] font-mono">{{ (inputs.sens*100).toFixed(0) }}%</span></div></template>
              <el-slider v-model="inputs.sens" :min="0.50" :max="0.99" :step="0.01" :format-tooltip="v=>(v*100).toFixed(0)+'%'" />
            </el-form-item>
            <el-form-item>
              <template #label><div class="flex justify-between w-full"><span>允许误差 (半宽)</span><span class="text-[--el-color-primary] font-mono">± {{ (inputs.dSens*100).toFixed(0) }}%</span></div></template>
              <el-slider v-model="inputs.dSens" :min="0.02" :max="0.15" :step="0.01" :format-tooltip="v=>'±'+(v*100).toFixed(0)+'%'" />
              <div class="text-xs text-gray">置信区间半宽度，越小样本越大</div>
            </el-form-item>
          </el-form>
        </el-card>
        <el-card shadow="never" class="mb-4">
          <template #header><span class="font-bold">特异度参数</span></template>
          <el-form label-position="top">
            <el-form-item>
              <template #label><div class="flex justify-between w-full"><span>预期特异度 (Sp)</span><span class="text-[--el-color-primary] font-mono">{{ (inputs.spec*100).toFixed(0) }}%</span></div></template>
              <el-slider v-model="inputs.spec" :min="0.50" :max="0.99" :step="0.01" :format-tooltip="v=>(v*100).toFixed(0)+'%'" />
            </el-form-item>
            <el-form-item>
              <template #label><div class="flex justify-between w-full"><span>允许误差 (半宽)</span><span class="text-[--el-color-primary] font-mono">± {{ (inputs.dSpec*100).toFixed(0) }}%</span></div></template>
              <el-slider v-model="inputs.dSpec" :min="0.02" :max="0.15" :step="0.01" :format-tooltip="v=>'±'+(v*100).toFixed(0)+'%'" />
            </el-form-item>
          </el-form>
        </el-card>
        <el-card shadow="never">
          <template #header><span class="font-bold">患病率</span></template>
          <el-form label-position="top">
            <el-form-item>
              <template #label><div class="flex justify-between w-full"><span>目标人群患病率</span><span class="text-[--el-color-primary] font-mono font-bold">{{ (inputs.prev*100).toFixed(0) }}%</span></div></template>
              <el-slider v-model="inputs.prev" :min="0.01" :max="0.80" :step="0.01" :format-tooltip="v=>(v*100).toFixed(0)+'%'" />
              <div class="text-xs text-gray">用于计算横断面总受试者数</div>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :lg="16" :xs="24">
        <el-row :gutter="12" class="mb-4">
          <el-col :span="8">
            <div class="sc-metric-card sc-mc-blue" data-watermark="D+">
              <div class="sc-label">病例数（阳性）</div>
              <div class="sc-value">{{ results.nDiseased }}</div>
              <div class="sc-sub">基于灵敏度</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="sc-metric-card sc-mc-green" data-watermark="D−">
              <div class="sc-label">对照数（阴性）</div>
              <div class="sc-value">{{ results.nHealthy }}</div>
              <div class="sc-sub">基于特异度</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="sc-metric-card sc-mc-amber" data-watermark="ΣN">
              <div class="sc-label">横断面总人数</div>
              <div class="sc-value">{{ results.totalN }}</div>
              <div class="sc-sub">患病率 {{ (inputs.prev*100).toFixed(0) }}%</div>
            </div>
          </el-col>
        </el-row>
        <div class="sc-tag-row">
          <el-tag effect="plain" size="small">{{ (params.ci*100).toFixed(0) }}% CI</el-tag>
          <el-tag effect="plain" size="small">Sn={{ (inputs.sens*100).toFixed(0) }}% ±{{ (inputs.dSens*100).toFixed(0) }}%</el-tag>
          <el-tag effect="plain" size="small">Sp={{ (inputs.spec*100).toFixed(0) }}% ±{{ (inputs.dSpec*100).toFixed(0) }}%</el-tag>
          <el-tag effect="plain" size="small" type="warning">患病率={{ (inputs.prev*100).toFixed(0) }}%</el-tag>
        </div>
        <el-card shadow="never" class="mb-4">
          <template #header><span class="font-bold">敏感性分析 · 允许误差 vs 样本量</span></template>
          <ECharts :options="chartOptions" height="380px" />
        </el-card>
        <el-card shadow="never" class="mb-4">
          <template #header><span class="font-bold">参数汇总</span></template>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="置信水平">{{ (params.ci*100).toFixed(0) }}%</el-descriptions-item>
            <el-descriptions-item label="预期灵敏度">{{ (inputs.sens*100).toFixed(0) }}%</el-descriptions-item>
            <el-descriptions-item label="灵敏度允许误差">± {{ (inputs.dSens*100).toFixed(0) }}%</el-descriptions-item>
            <el-descriptions-item label="预期特异度">{{ (inputs.spec*100).toFixed(0) }}%</el-descriptions-item>
            <el-descriptions-item label="特异度允许误差">± {{ (inputs.dSpec*100).toFixed(0) }}%</el-descriptions-item>
            <el-descriptions-item label="患病率">{{ (inputs.prev*100).toFixed(0) }}%</el-descriptions-item>
            <el-descriptions-item label="所需病例数">{{ results.nDiseased }}</el-descriptions-item>
            <el-descriptions-item label="所需对照数">{{ results.nHealthy }}</el-descriptions-item>
            <el-descriptions-item label="横断面总人数"><span class="font-bold text-[--el-color-primary]">{{ results.totalN }}</span></el-descriptions-item>
          </el-descriptions>
        </el-card>
        <el-card shadow="never">
          <template #header><div class="flex justify-between items-center"><span class="font-bold">方法学段落</span><el-button size="small" @click="copyReport">{{ copied ? '✓ 已复制' : '复制文本' }}</el-button></div></template>
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

defineOptions({ name: "Diagnostic" });

const introDefinition = [
  "诊断试验样本量估算围绕<strong>灵敏度 (Sn)、特异度 (Sp)</strong>等诊断性能指标，基于<strong>置信区间半宽</strong>方法计算所需样本量。",
  "通常采用公式 <strong>n = z² × p(1−p) / d²</strong>，其中 p 为预期 Sn 或 Sp，d 为允许误差半宽（置信区间宽度的一半）。",
];
const introScenarios = [
  "新诊断试剂盒、生物标志物、体外诊断产品的<strong>性能评价</strong>研究。",
  "影像诊断（CT、MRI、超声）的准确性研究，AI 辅助诊断模型的验证。",
  "基因检测、快速筛查（POCT）等诊断方法的灵敏度/特异度评估。",
];
const introFeatures = [
  "<strong>同时估算</strong>：若同时评估 Sn 和 Sp，最终样本量取两者较大值。",
  "<strong>金标准要求</strong>：病例与对照的判定需依赖独立可靠的金标准（病理、随访、共识诊断）。",
  "<strong>前瞻 vs. 回顾</strong>：前瞻性横断面研究需额外考虑患病率，以估算总受试者数。",
];
const introParams = [
  { title: "置信水平", desc: "常用 95%，对应 z₀.₉₇₅ = 1.96；要求严格时可取 99%。" },
  { title: "预期 Sn / Sp", desc: "基于既往研究或预试验给出的点估计。Sn、Sp 越接近 0.5 所需样本量越大。" },
  { title: "允许误差 (半宽)", desc: "置信区间半宽 d。d 越小精度越高，样本量显著增加。临床常用 ±5% 或 ±10%。" },
  { title: "目标人群患病率", desc: "用于横断面设计换算总招募数。病例数 = n_Sn / 患病率，对照数 = n_Sp / (1−患病率)。" },
];

const references = [
  { authors: "Buderer NM.", title: "Statistical methodology: I. Incorporating the prevalence of disease into the sample size calculation for sensitivity and specificity.", journal: "Academic Emergency Medicine", year: "1996", volume: "3(9): 895-900", doi: "10.1111/j.1553-2712.1996.tb03538.x" },
  { authors: "Flahault A, Cadilhac M, Thomas G.", title: "Sample size calculation should be performed for design accuracy in diagnostic test studies.", journal: "Journal of Clinical Epidemiology", year: "2005", volume: "58(8): 859-862", doi: "10.1016/j.jclinepi.2004.12.009" },
  { authors: "Pepe MS.", title: "The Statistical Evaluation of Medical Tests for Classification and Prediction.", journal: "Oxford University Press", year: "2003", volume: "1st Edition", doi: "10.1093/oso/9780198509844.001.0001" },
  { authors: "Bossuyt PM, Reitsma JB, Bruns DE, et al.", title: "STARD 2015: An Updated List of Essential Items for Reporting Diagnostic Accuracy Studies.", journal: "BMJ", year: "2015", volume: "351: h5527", doi: "10.1136/bmj.h5527" },
  { authors: "Obuchowski NA.", title: "Sample size calculations in studies of test accuracy.", journal: "Statistical Methods in Medical Research", year: "1998", volume: "7(4): 371-392", doi: "10.1177/096228029800700405" },
];

const params = ref({ ci: 0.95, metric: "both" });
const inputs = ref({ sens: 0.90, dSens: 0.05, spec: 0.85, dSpec: 0.05, prev: 0.30 });
const results = ref({ nDiseased: 0, nHealthy: 0, totalN: 0 });
const copied = ref(false);
const chartOptions = ref({});

function invNorm(p: number): number {
  if (p <= 0 || p >= 1) return 0;
  const a1=-39.6968302866538,a2=220.946098424521,a3=-275.928510446969,a4=138.357751867269,b1=-55.8523268975479,b2=148.144926055571,b3=-133.425630379764,b4=51.5246332174095,c1=-7.78489400243029e-3,c2=-0.322396458041136,c3=-2.40075827716184,c4=-2.54973253934373,d2=0.32246712907004,d3=2.445134137143;
  let x:number; const q=p-0.5; let r:number;
  if(Math.abs(q)<=0.425){r=q*q;x=q*(((a4*r+a3)*r+a2)*r+a1)/((((b4*r+b3)*r+b2)*r+b1)*r+1)}
  else{r=p<0.5?p:1-p;r=Math.sqrt(-2*Math.log(r));x=(((c4*r+c3)*r+c2)*r+c1)/((d3*r+d2)*r+1);if(p<0.5)x=-x}
  return x;
}

function calcDiag(p: number, d: number, ci: number): number {
  const z = invNorm(1 - (1 - ci) / 2);
  return Math.ceil(z * z * p * (1 - p) / (d * d));
}

function update() {
  const nD = calcDiag(inputs.value.sens, inputs.value.dSens, params.value.ci);
  const nH = calcDiag(inputs.value.spec, inputs.value.dSpec, params.value.ci);
  const prev = inputs.value.prev;
  const totalFromSens = Math.ceil(nD / prev);
  const totalFromSpec = Math.ceil(nH / (1 - prev));
  results.value = { nDiseased: nD, nHealthy: nH, totalN: Math.max(totalFromSens, totalFromSpec) };

  const xs: string[] = []; const ySn: number[] = []; const ySp: number[] = [];
  for (let d = 0.02; d <= 0.15; d += 0.005) {
    xs.push((d * 100).toFixed(1) + "%");
    ySn.push(calcDiag(inputs.value.sens, d, params.value.ci));
    ySp.push(calcDiag(inputs.value.spec, d, params.value.ci));
  }
  chartOptions.value = {
    tooltip: { trigger: "axis" },
    legend: { data: ["灵敏度→病例数", "特异度→对照数"], bottom: 0 },
    grid: { left: "8%", right: "4%", bottom: "14%", top: "6%" },
    xAxis: { type: "category", data: xs, name: "允许误差 (CI半宽)" },
    yAxis: { type: "value", name: "所需例数", splitLine: { lineStyle: { type: "dashed" } } },
    series: [
      { name: "灵敏度→病例数", type: "line", data: ySn, smooth: true, lineStyle: { width: 2.5 } },
      { name: "特异度→对照数", type: "line", data: ySp, smooth: true, lineStyle: { width: 2.5 } },
    ],
  };
}

const reportText = computed(() => {
  const ci = (params.value.ci * 100).toFixed(0);
  return `本研究为诊断准确性研究，基于 Buderer 公式估算所需样本量。设定 ${ci}% 置信水平。\n\n灵敏度方面：预期灵敏度为 ${(inputs.value.sens*100).toFixed(0)}%，允许 ${ci}% 置信区间半宽不超过 ${(inputs.value.dSens*100).toFixed(0)}%，需纳入 ${results.value.nDiseased} 例阳性病例。\n\n特异度方面：预期特异度为 ${(inputs.value.spec*100).toFixed(0)}%，允许 ${ci}% 置信区间半宽不超过 ${(inputs.value.dSpec*100).toFixed(0)}%，需纳入 ${results.value.nHealthy} 例阴性对照。\n\n若采用横断面设计，目标人群患病率为 ${(inputs.value.prev*100).toFixed(0)}%，则总共需纳入 ${results.value.totalN} 例受试者。`;
});

function copyReport() { navigator.clipboard.writeText(reportText.value); copied.value = true; setTimeout(() => (copied.value = false), 2000); }

watch([params, inputs], update, { deep: true });
onMounted(update);
</script>
<style scoped>
.font-mono { font-family: "JetBrains Mono", monospace; }
</style>
