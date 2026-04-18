<template>
  <div class="app-container sample-calc-page">
    <AlgoIntro
      title="两独立样本率比较"
      hero-desc="基于两独立样本 χ² 检验估算二分类结局的样本量，适用于有效率、治愈率等比率指标比较"
      hero-tag="TWO PROPORTIONS"
      watermark="χ²"
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
            <el-form-item label="显著性水平 (α)"><el-select v-model="params.alpha" style="width:100%"><el-option :value="0.01" label="0.01" /><el-option :value="0.05" label="0.05" /><el-option :value="0.025" label="0.025" /></el-select></el-form-item>
            <el-form-item label="把握度"><el-select v-model="params.power" style="width:100%"><el-option :value="0.80" label="80%" /><el-option :value="0.85" label="85%" /><el-option :value="0.90" label="90%" /></el-select></el-form-item>
            <el-form-item label="检验方向"><el-radio-group v-model="params.tail"><el-radio-button value="two">双侧</el-radio-button><el-radio-button value="one">单侧</el-radio-button></el-radio-group></el-form-item>
            <el-form-item label="连续性校正"><el-switch v-model="params.continuity" active-text="Yates校正" inactive-text="无校正" /></el-form-item>
          </el-form>
        </el-card>
        <el-card shadow="never" class="mb-4">
          <template #header><span class="font-bold">效应参数</span></template>
          <el-form label-position="top">
            <el-form-item><template #label><div class="flex justify-between w-full"><span>对照组率 (p₁)</span><span class="font-mono text-[--el-color-primary]">{{ (inputs.p1*100).toFixed(1) }}%</span></div></template><el-slider v-model="inputs.p1" :min="0.01" :max="0.95" :step="0.01" :format-tooltip="v=>(v*100).toFixed(1)+'%'" /></el-form-item>
            <el-form-item><template #label><div class="flex justify-between w-full"><span>实验组率 (p₂)</span><span class="font-mono text-[--el-color-primary]">{{ (inputs.p2*100).toFixed(1) }}%</span></div></template><el-slider v-model="inputs.p2" :min="0.01" :max="0.95" :step="0.01" :format-tooltip="v=>(v*100).toFixed(1)+'%'" /></el-form-item>
            <div class="bg-[--el-fill-color-lighter] rounded-lg p-3 mb-3">
              <div class="flex justify-between text-sm"><span class="text-gray">率差 |p₁−p₂|</span><span class="font-mono font-bold">{{ rateDiff }}</span></div>
              <div class="flex justify-between text-sm mt-1"><span class="text-gray">Cohen's h</span><span class="font-mono font-bold text-[--el-color-primary]">{{ cohenH }}</span></div>
            </div>
          </el-form>
        </el-card>
        <el-card shadow="never" class="mb-4">
          <template #header><span class="font-bold">校正</span></template>
          <el-form label-position="top">
            <el-form-item><template #label><div class="flex justify-between w-full"><span>脱落率</span><span class="font-mono text-[--el-color-primary]">{{ dropoutPct }}%</span></div></template><el-slider v-model="params.dropout" :min="0" :max="0.50" :step="0.05" :format-tooltip="v=>(v*100).toFixed(0)+'%'" /></el-form-item>
            <el-form-item label="分配比例"><el-radio-group v-model="params.ratio"><el-radio-button :value="1">1:1</el-radio-button><el-radio-button :value="2">2:1</el-radio-button><el-radio-button :value="3">3:1</el-radio-button></el-radio-group></el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :lg="16" :xs="24">
        <!-- 结果指标卡 -->
        <el-row :gutter="16" class="mb-4">
          <el-col :span="12">
            <div class="sc-metric-card sc-mc-blue" data-watermark="N">
              <div class="sc-label">每组（不含脱落）</div>
              <div class="sc-value">{{ results.nControl }}</div>
              <div class="sc-sub">对照 {{ results.nControl }} · 实验 {{ results.nTreat }}</div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="sc-metric-card sc-mc-green" data-watermark="ΣN">
              <div class="sc-label">总入组（含脱落）</div>
              <div class="sc-value">{{ results.totalN }}</div>
              <div class="sc-sub">含 {{ dropoutPct }}% 脱落</div>
            </div>
          </el-col>
        </el-row>

        <!-- 参数标签行 -->
        <div class="sc-tag-row">
          <el-tag effect="plain" size="small">α={{ params.alpha }}</el-tag>
          <el-tag effect="plain" size="small">Power={{ (params.power*100).toFixed(0) }}%</el-tag>
          <el-tag effect="plain" size="small">p₁={{ (inputs.p1*100).toFixed(1) }}%</el-tag>
          <el-tag effect="plain" size="small">p₂={{ (inputs.p2*100).toFixed(1) }}%</el-tag>
          <el-tag effect="plain" size="small" type="warning">Cohen's h={{ cohenH }}</el-tag>
          <el-tag effect="plain" size="small">{{ params.ratio }}:1</el-tag>
        </div>

        <el-row :gutter="16" class="mb-4">
          <el-col :span="12"><el-card shadow="never"><template #header><span class="font-bold">敏感性 · 率差 vs 样本量</span></template><ECharts :options="sensOpts" height="340px" /></el-card></el-col>
          <el-col :span="12"><el-card shadow="never"><template #header><span class="font-bold">功效曲线</span></template><ECharts :options="powerOpts" height="340px" /></el-card></el-col>
        </el-row>
        <el-card shadow="never" class="mb-4">
          <template #header><span class="font-bold">参数汇总</span></template>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="检验方法">两独立样本率 χ² 检验 {{ params.continuity ? '(Yates校正)' : '' }}</el-descriptions-item>
            <el-descriptions-item label="α">{{ params.alpha }}</el-descriptions-item>
            <el-descriptions-item label="把握度">{{ (params.power*100).toFixed(0) }}%</el-descriptions-item>
            <el-descriptions-item label="p₁">{{ (inputs.p1*100).toFixed(1) }}%</el-descriptions-item>
            <el-descriptions-item label="p₂">{{ (inputs.p2*100).toFixed(1) }}%</el-descriptions-item>
            <el-descriptions-item label="Cohen's h">{{ cohenH }}</el-descriptions-item>
            <el-descriptions-item label="分配比例">{{ params.ratio }}:1</el-descriptions-item>
            <el-descriptions-item label="总招募"><span class="font-bold text-[--el-color-primary]">{{ results.totalN }}</span></el-descriptions-item>
          </el-descriptions>
        </el-card>
        <el-card shadow="never" class="mb-4">
          <template #header><div class="flex justify-between items-center"><span class="font-bold">方法学段落</span><el-button size="small" @click="copyReport">{{ copied?'✓ 已复制':'复制文本' }}</el-button></div></template>
          <el-input type="textarea" :rows="6" :model-value="reportText" readonly resize="none" />
        </el-card>

        <!-- 参考文献（全宽延伸） -->
        <References :references="references" class="mt-4" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import AlgoIntro from "./AlgoIntro.vue";
import References from "./References.vue";

defineOptions({ name: "TwoProportions" });

const introDefinition = [
  "两独立样本率比较用于比较两个独立试验组在<strong>二分类结局</strong>（如有效/无效、治愈/未治愈）上的率差异，样本量计算基于<strong>两样本率差 χ² 检验</strong>（或 Z 检验）。",
  "效应量通常以 <strong>Cohen's h = 2·arcsin(√p₂) − 2·arcsin(√p₁)</strong> 衡量，h 越大所需样本越小。",
];
const introScenarios = [
  "新药或干预的<strong>有效率</strong>、治愈率、缓解率对照研究。",
  "不良事件发生率、并发症率的组间比较。",
  "疫苗保护率、筛查阳性率的人群对比。",
];
const introFeatures = [
  "<strong>优点</strong>：二分类结局的样本量估算标准方法，易于解释与实施。",
  "<strong>连续性校正</strong>：样本量较小时建议启用 Yates 校正以获得更保守的估计。",
  "<strong>注意边界值</strong>：当 p 接近 0 或 1 时，方差趋近于 0，公式可能失真，需转为精确方法（Fisher）。",
];
const introParams = [
  { title: "显著性水平 α", desc: "第一类错误率，常用双侧 0.05；非劣效设计单侧 0.025。" },
  { title: "把握度 1-β", desc: "临床研究常用 80% 或 90%。" },
  { title: "对照组率 p₁", desc: "基于既往数据或已有标准治疗的预期发生率。" },
  { title: "实验组率 p₂", desc: "预期效应下试验组的发生率，与 p₁ 的差即为效应量。" },
  { title: "连续性校正", desc: "Yates 校正用于样本量较小或 p 接近边界时，略微增大所需样本量。" },
];

const references = [
  { authors: "Fleiss JL, Levin B, Paik MC.", title: "Statistical Methods for Rates and Proportions.", journal: "Wiley", year: "2003", volume: "3rd Edition", doi: "10.1002/0471445428" },
  { authors: "Cohen J.", title: "Statistical Power Analysis for the Behavioral Sciences.", journal: "Lawrence Erlbaum Associates", year: "1988", volume: "2nd Edition", doi: "10.4324/9780203771587" },
  { authors: "Casagrande JT, Pike MC, Smith PG.", title: "An improved approximate formula for calculating sample sizes for comparing two binomial distributions.", journal: "Biometrics", year: "1978", volume: "34(3): 483-486", doi: "10.2307/2530613" },
  { authors: "Fisher RA.", title: "The logic of inductive inference.", journal: "Journal of the Royal Statistical Society", year: "1935", volume: "98(1): 39-82", doi: "10.2307/2342435" },
  { authors: "ICH Expert Working Group.", title: "ICH E9: Statistical Principles for Clinical Trials.", journal: "International Council for Harmonisation", year: "1998", volume: "Step 4 Guideline", doi: "" },
];

const params = ref({ alpha: 0.05, power: 0.80, tail: "two" as "two"|"one", dropout: 0.10, ratio: 1, continuity: true });
const inputs = ref({ p1: 0.30, p2: 0.50 });
const results = ref({ nControl: 0, nTreat: 0, totalN: 0 });
const copied = ref(false);
const sensOpts = ref({}); const powerOpts = ref({});

const dropoutPct = computed(() => (params.value.dropout * 100).toFixed(0));
const rateDiff = computed(() => (Math.abs(inputs.value.p1 - inputs.value.p2) * 100).toFixed(1) + "%");
const cohenH = computed(() => Math.abs(2 * Math.asin(Math.sqrt(inputs.value.p2)) - 2 * Math.asin(Math.sqrt(inputs.value.p1))).toFixed(3));

function invNorm(p: number): number { if(p<=0||p>=1)return 0;const a1=-39.6968302866538,a2=220.946098424521,a3=-275.928510446969,a4=138.357751867269,b1=-55.8523268975479,b2=148.144926055571,b3=-133.425630379764,b4=51.5246332174095,c1=-7.78489400243029e-3,c2=-0.322396458041136,c3=-2.40075827716184,c4=-2.54973253934373,d2=0.32246712907004,d3=2.445134137143;let x:number;const q=p-0.5;let r:number;if(Math.abs(q)<=0.425){r=q*q;x=q*(((a4*r+a3)*r+a2)*r+a1)/((((b4*r+b3)*r+b2)*r+b1)*r+1)}else{r=p<0.5?p:1-p;r=Math.sqrt(-2*Math.log(r));x=(((c4*r+c3)*r+c2)*r+c1)/((d3*r+d2)*r+1);if(p<0.5)x=-x}return x; }
function normCDF(x: number): number { const s=x<0?-1:1;x=Math.abs(x)/Math.sqrt(2);const t=1/(1+0.3275911*x);return 0.5*(1+s*(1-((((1.061405429*t-1.453152027)*t+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x))); }

function calcN(p1: number, p2: number, alpha: number, power: number, tail: string, ratio: number, cont: boolean): { n1: number; n2: number } {
  if (p1 === p2) return { n1: Infinity, n2: Infinity };
  const zAlpha = tail === "two" ? invNorm(1 - alpha / 2) : invNorm(1 - alpha);
  const zBeta = invNorm(power); const k = ratio;
  const pbar = (p1 + k * p2) / (1 + k); const qbar = 1 - pbar;
  let n1 = Math.pow(zAlpha * Math.sqrt((1 + 1 / k) * pbar * qbar) + zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2) / k), 2) / Math.pow(p1 - p2, 2);
  if (cont) { const delta = Math.abs(p1 - p2); n1 = n1 / 4 * Math.pow(1 + Math.sqrt(1 + 2 * (1 + 1 / k) / (n1 * delta)), 2); }
  n1 = Math.ceil(n1); return { n1, n2: Math.ceil(k * n1) };
}

function calcPowerFn(nCtrl: number, p1: number, p2: number, alpha: number, tail: string, ratio: number): number {
  if (p1 === p2 || nCtrl <= 0) return 0;
  const k = ratio; const zAlpha = tail === "two" ? invNorm(1 - alpha / 2) : invNorm(1 - alpha);
  const pbar = (p1 + k * p2) / (1 + k);
  return normCDF((Math.abs(p1 - p2) * Math.sqrt(nCtrl) - zAlpha * Math.sqrt((1 + 1 / k) * pbar * (1 - pbar))) / Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2) / k));
}

function update() {
  const { p1, p2 } = inputs.value;
  if (p1 === p2) { results.value = { nControl: 0, nTreat: 0, totalN: 0 }; return; }
  const { n1, n2 } = calcN(p1, p2, params.value.alpha, params.value.power, params.value.tail, params.value.ratio, params.value.continuity);
  if (!isFinite(n1)) { results.value = { nControl: 0, nTreat: 0, totalN: 0 }; return; }
  const adj1 = Math.ceil(n1 / (1 - params.value.dropout)); const adj2 = Math.ceil(n2 / (1 - params.value.dropout));
  results.value = { nControl: n1, nTreat: n2, totalN: adj1 + adj2 };

  // 敏感性
  const sxs: string[] = []; const sys: number[] = [];
  for (let diff = 0.02; diff <= 0.40; diff += 0.01) {
    const p2t = Math.min(p1 + diff, 0.99);
    const r = calcN(p1, p2t, params.value.alpha, params.value.power, params.value.tail, params.value.ratio, params.value.continuity);
    if (isFinite(r.n1)) { sxs.push((diff*100).toFixed(0)+"%"); sys.push(Math.ceil(r.n1/(1-params.value.dropout))+Math.ceil(r.n2/(1-params.value.dropout))); }
  }
  sensOpts.value = { tooltip:{trigger:"axis"}, grid:{left:"10%",right:"4%",bottom:"12%",top:"6%"}, xAxis:{type:"category",data:sxs,name:"率差"}, yAxis:{type:"value",name:"总人数",splitLine:{lineStyle:{type:"dashed"}}}, series:[{type:"line",data:sys,smooth:true,areaStyle:{opacity:0.08},lineStyle:{width:2.5}}] };

  // 功效
  const pxs: number[] = []; const pys: number[] = []; const maxN = Math.max(n1*3,100);
  for (let n=5;n<=maxN;n+=Math.max(1,Math.floor(maxN/150))) { pxs.push(n); pys.push(Math.round(calcPowerFn(n,p1,p2,params.value.alpha,params.value.tail,params.value.ratio)*1000)/10); }
  powerOpts.value = { tooltip:{trigger:"axis"}, grid:{left:"10%",right:"4%",bottom:"12%",top:"6%"}, xAxis:{type:"category",data:pxs.map(String),name:"每组样本量",axisLabel:{interval:Math.floor(pxs.length/8)}}, yAxis:{type:"value",name:"Power(%)",max:105,splitLine:{lineStyle:{type:"dashed"}}}, series:[{type:"line",data:pys,smooth:true,areaStyle:{opacity:0.06},lineStyle:{width:2.5,color:"#a78bfa"},itemStyle:{color:"#a78bfa"}}] };
}

const reportText = computed(() => {
  const tailText = params.value.tail==="two"?"双侧":"单侧"; const contText = params.value.continuity?"采用 Yates 校正，":"";
  const nC=results.value.nControl,nT=results.value.nTreat;
  return `本研究采用两独立样本率 χ² 检验。${contText}设定${tailText} α=${params.value.alpha}，Power=${(params.value.power*100).toFixed(0)}%，比例 ${params.value.ratio}:1。p₁=${(inputs.value.p1*100).toFixed(1)}%，p₂=${(inputs.value.p2*100).toFixed(1)}%，Cohen's h=${cohenH.value}。对照组 ${nC} 例，实验组 ${nT} 例，含 ${dropoutPct.value}% 脱落共 ${results.value.totalN} 例。`;
});

function copyReport() { navigator.clipboard.writeText(reportText.value); copied.value = true; setTimeout(() => (copied.value = false), 2000); }
watch([params, inputs], update, { deep: true });
onMounted(update);
</script>
<style scoped>
.font-mono { font-family: "JetBrains Mono", monospace; }
</style>
