<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :lg="8" :xs="24">
        <el-card shadow="never" class="mb-4">
          <template #header><span class="font-bold">检验配置</span></template>
          <el-form label-position="top">
            <el-form-item label="显著性水平 (α)"><el-select v-model="params.alpha" style="width:100%"><el-option :value="0.01" label="0.01" /><el-option :value="0.025" label="0.025" /><el-option :value="0.05" label="0.05" /></el-select></el-form-item>
            <el-form-item label="把握度"><el-select v-model="params.power" style="width:100%"><el-option :value="0.80" label="80%" /><el-option :value="0.85" label="85%" /><el-option :value="0.90" label="90%" /></el-select></el-form-item>
            <el-form-item label="检验方向"><el-radio-group v-model="params.tail"><el-radio-button value="two">双侧</el-radio-button><el-radio-button value="one">单侧</el-radio-button></el-radio-group></el-form-item>
          </el-form>
        </el-card>
        <el-card shadow="never" class="mb-4">
          <template #header><span class="font-bold">效应参数</span></template>
          <el-form label-position="top">
            <el-form-item label="对照组均值 (μ₁)"><el-input-number v-model="inputs.mean1" :step="1" style="width:100%" /></el-form-item>
            <el-form-item label="实验组均值 (μ₂)"><el-input-number v-model="inputs.mean2" :step="1" style="width:100%" /></el-form-item>
            <el-form-item label="共同标准差 (σ)"><el-input-number v-model="inputs.stdDev" :min="0.1" :step="1" style="width:100%" /><div class="text-xs text-gray mt-1">若未知，可用 (最大值−最小值)/4 估算</div></el-form-item>
            <div class="bg-[--el-fill-color-lighter] rounded-lg p-3">
              <div class="flex justify-between items-baseline mb-2"><span class="text-xs text-gray">Cohen's d</span><span class="text-xl font-bold font-mono text-[--el-color-primary]">{{ cohenD }}</span></div>
              <el-progress :percentage="Math.min(calculatedD / 1.2 * 100, 100)" :stroke-width="8" :show-text="false" />
              <div class="text-xs text-gray mt-1">{{ cohenLabel }}</div>
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
        <el-row :gutter="16" class="mb-4">
          <el-col :span="12"><el-card shadow="never" class="text-center"><div class="text-xs text-gray mb-1">每组（不含脱落）</div><div class="text-3xl font-bold font-mono text-[--el-color-primary]">{{ results.nControl }}</div><div class="text-xs text-gray">对照 {{ results.nControl }} · 实验 {{ results.nTreat }}</div></el-card></el-col>
          <el-col :span="12"><el-card shadow="never" class="text-center"><div class="text-xs text-gray mb-1">总入组（含脱落）</div><div class="text-3xl font-bold font-mono text-[--el-color-success]">{{ results.totalN }}</div><div class="text-xs text-gray">含 {{ dropoutPct }}% 脱落</div></el-card></el-col>
        </el-row>
        <div class="flex flex-wrap gap-2 mb-4">
          <el-tag effect="plain" size="small">α={{ params.alpha }}</el-tag>
          <el-tag effect="plain" size="small">Power={{ (params.power*100).toFixed(0) }}%</el-tag>
          <el-tag effect="plain" size="small">d={{ cohenD }}</el-tag>
          <el-tag effect="plain" size="small">{{ params.ratio }}:1</el-tag>
        </div>
        <el-row :gutter="16" class="mb-4">
          <el-col :span="12"><el-card shadow="never"><template #header><span class="font-bold">敏感性分析</span></template><ECharts :options="sensOpts" height="340px" /></el-card></el-col>
          <el-col :span="12"><el-card shadow="never"><template #header><span class="font-bold">功效曲线</span></template><ECharts :options="powerOpts" height="340px" /></el-card></el-col>
        </el-row>
        <el-card shadow="never" class="mb-4">
          <template #header><span class="font-bold">分布预览 · 两组正态分布叠加</span></template>
          <ECharts :options="distOpts" height="280px" />
        </el-card>
        <el-card shadow="never" class="mb-4">
          <template #header><span class="font-bold">参数汇总</span></template>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="检验方法">两独立样本 t 检验</el-descriptions-item>
            <el-descriptions-item label="α">{{ params.alpha }}</el-descriptions-item>
            <el-descriptions-item label="把握度">{{ (params.power*100).toFixed(0) }}%</el-descriptions-item>
            <el-descriptions-item label="μ₁ / μ₂">{{ inputs.mean1 }} / {{ inputs.mean2 }}</el-descriptions-item>
            <el-descriptions-item label="σ">{{ inputs.stdDev }}</el-descriptions-item>
            <el-descriptions-item label="Cohen's d">{{ cohenD }}</el-descriptions-item>
            <el-descriptions-item label="比例">{{ params.ratio }}:1</el-descriptions-item>
            <el-descriptions-item label="总招募"><span class="font-bold text-[--el-color-primary]">{{ results.totalN }}</span></el-descriptions-item>
          </el-descriptions>
        </el-card>
        <el-card shadow="never">
          <template #header><div class="flex justify-between items-center"><span class="font-bold">方法学段落</span><el-button size="small" @click="copyReport">{{ copied?'✓ 已复制':'复制文本' }}</el-button></div></template>
          <el-input type="textarea" :rows="6" :model-value="reportText" readonly resize="none" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "TwoMeans" });

const params = ref({ alpha: 0.05, power: 0.80, tail: "two" as "two"|"one", dropout: 0.10, ratio: 1 });
const inputs = ref({ mean1: 140, mean2: 130, stdDev: 15 });
const results = ref({ nControl: 0, nTreat: 0, totalN: 0 });
const copied = ref(false);
const sensOpts = ref({}); const powerOpts = ref({}); const distOpts = ref({});

const calculatedD = computed(() => inputs.value.stdDev ? Math.abs(inputs.value.mean1 - inputs.value.mean2) / inputs.value.stdDev : 0);
const cohenD = computed(() => calculatedD.value.toFixed(3));
const dropoutPct = computed(() => (params.value.dropout * 100).toFixed(0));
const cohenLabel = computed(() => { const d = calculatedD.value; if (d === 0) return "请输入有效参数"; if (d < 0.2) return "极小效应"; if (d < 0.5) return "小效应"; if (d < 0.8) return "中等效应"; return "大效应"; });

function invNorm(p: number): number { if(p<=0||p>=1)return 0;const a1=-39.6968302866538,a2=220.946098424521,a3=-275.928510446969,a4=138.357751867269,b1=-55.8523268975479,b2=148.144926055571,b3=-133.425630379764,b4=51.5246332174095,c1=-7.78489400243029e-3,c2=-0.322396458041136,c3=-2.40075827716184,c4=-2.54973253934373,d2=0.32246712907004,d3=2.445134137143;let x:number;const q=p-0.5;let r:number;if(Math.abs(q)<=0.425){r=q*q;x=q*(((a4*r+a3)*r+a2)*r+a1)/((((b4*r+b3)*r+b2)*r+b1)*r+1)}else{r=p<0.5?p:1-p;r=Math.sqrt(-2*Math.log(r));x=(((c4*r+c3)*r+c2)*r+c1)/((d3*r+d2)*r+1);if(p<0.5)x=-x}return x; }
function normCDF(x: number): number { const s=x<0?-1:1;x=Math.abs(x)/Math.sqrt(2);const t=1/(1+0.3275911*x);return 0.5*(1+s*(1-((((1.061405429*t-1.453152027)*t+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x))); }
function normPDF(x: number): number { return Math.exp(-0.5*x*x)/Math.sqrt(2*Math.PI); }

function calcN(d: number, alpha: number, power: number, tail: string, ratio: number) {
  if (d <= 0) return { n1: Infinity, n2: Infinity };
  const zAlpha = tail === "two" ? invNorm(1 - alpha / 2) : invNorm(1 - alpha);
  const k = ratio; const n1 = Math.ceil(Math.pow((zAlpha + invNorm(power)) / d, 2) * (1 + 1 / k));
  return { n1, n2: Math.ceil(k * n1) };
}

function calcPower(nControl: number, d: number, alpha: number, tail: string): number {
  if (d <= 0 || nControl <= 0) return 0;
  const zAlpha = tail === "two" ? invNorm(1 - alpha / 2) : invNorm(1 - alpha);
  const k = params.value.ratio; return normCDF(d / Math.sqrt(1 / nControl + 1 / (k * nControl)) - zAlpha);
}

function update() {
  const d = calculatedD.value;
  if (d === 0) { results.value = { nControl: 0, nTreat: 0, totalN: 0 }; return; }
  const { n1, n2 } = calcN(d, params.value.alpha, params.value.power, params.value.tail, params.value.ratio);
  if (!isFinite(n1)) { results.value = { nControl: 0, nTreat: 0, totalN: 0 }; return; }
  results.value = { nControl: n1, nTreat: n2, totalN: Math.ceil(n1 / (1 - params.value.dropout)) + Math.ceil(n2 / (1 - params.value.dropout)) };

  // 敏感性
  const sxs: string[] = []; const sys: number[] = [];
  for (let dd = 0.1; dd <= 1.5; dd += 0.05) { const r = calcN(dd, params.value.alpha, params.value.power, params.value.tail, params.value.ratio); sxs.push(dd.toFixed(2)); sys.push(Math.ceil(r.n1/(1-params.value.dropout))+Math.ceil(r.n2/(1-params.value.dropout))); }
  sensOpts.value = { tooltip:{trigger:"axis"}, grid:{left:"10%",right:"4%",bottom:"12%",top:"6%"}, xAxis:{type:"category",data:sxs,name:"Cohen's d"}, yAxis:{type:"value",name:"总人数",splitLine:{lineStyle:{type:"dashed"}}}, series:[{type:"line",data:sys,smooth:true,areaStyle:{opacity:0.08},lineStyle:{width:2.5}}] };

  // 功效
  const pxs: number[] = []; const pys: number[] = []; const maxN = Math.max(n1*3, 100);
  for (let n=5;n<=maxN;n+=Math.max(1,Math.floor(maxN/150))) { pxs.push(n); pys.push(Math.round(calcPower(n,d,params.value.alpha,params.value.tail)*1000)/10); }
  powerOpts.value = { tooltip:{trigger:"axis"}, grid:{left:"10%",right:"4%",bottom:"12%",top:"6%"}, xAxis:{type:"category",data:pxs.map(String),name:"每组样本量",axisLabel:{interval:Math.floor(pxs.length/8)}}, yAxis:{type:"value",name:"Power(%)",max:105,splitLine:{lineStyle:{type:"dashed"}}}, series:[{type:"line",data:pys,smooth:true,areaStyle:{opacity:0.06},lineStyle:{width:2.5,color:"#a78bfa"},itemStyle:{color:"#a78bfa"}}] };

  // 分布预览
  const m1=inputs.value.mean1, m2=inputs.value.mean2, sd=inputs.value.stdDev;
  if (sd > 0) {
    const lo=Math.min(m1,m2)-4*sd, hi=Math.max(m1,m2)+4*sd;
    const dxs: number[]=[]; const dy1: number[]=[]; const dy2: number[]=[];
    for(let x=lo;x<=hi;x+=(hi-lo)/200){dxs.push(Math.round(x*100)/100);dy1.push(Math.round(normPDF((x-m1)/sd)/sd*10000)/10000);dy2.push(Math.round(normPDF((x-m2)/sd)/sd*10000)/10000);}
    distOpts.value = { tooltip:{trigger:"axis"}, legend:{data:[`对照(μ₁=${m1})`,`实验(μ₂=${m2})`],bottom:0}, grid:{left:"6%",right:"4%",bottom:"14%",top:"6%"},
      xAxis:{type:"category",data:dxs.map(String),name:"观测值",axisLabel:{interval:Math.floor(dxs.length/8)}}, yAxis:{type:"value",show:false},
      series:[{name:`对照(μ₁=${m1})`,type:"line",data:dy1,smooth:true,areaStyle:{opacity:0.1},showSymbol:false,lineStyle:{width:2}},{name:`实验(μ₂=${m2})`,type:"line",data:dy2,smooth:true,areaStyle:{opacity:0.1},showSymbol:false,lineStyle:{width:2}}] };
  }
}

const reportText = computed(() => {
  const tailText = params.value.tail==="two"?"双侧":"单侧"; const nC=results.value.nControl,nT=results.value.nTreat;
  const nCadj=Math.ceil(nC/(1-params.value.dropout)),nTadj=Math.ceil(nT/(1-params.value.dropout));
  return `本研究采用两独立样本 t 检验，设定${tailText} α=${params.value.alpha}，Power=${(params.value.power*100).toFixed(0)}%，比例 ${params.value.ratio}:1。μ₁=${inputs.value.mean1}，μ₂=${inputs.value.mean2}，σ=${inputs.value.stdDev}，Cohen's d=${cohenD.value}。对照组 ${nC} 例，实验组 ${nT} 例，含 ${dropoutPct.value}% 脱落共 ${results.value.totalN} 例。`;
});

function copyReport() { navigator.clipboard.writeText(reportText.value); copied.value = true; setTimeout(() => (copied.value = false), 2000); }
watch([params, inputs], update, { deep: true });
onMounted(update);
</script>
<style scoped>.font-mono{font-family:"JetBrains Mono",monospace}</style>
