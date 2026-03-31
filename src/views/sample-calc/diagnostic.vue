<template>
  <div class="app-container">
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
          <el-col :span="8"><el-card shadow="never" class="text-center"><div class="text-xs text-gray mb-1">病例数（阳性）</div><div class="text-3xl font-bold font-mono text-[--el-color-primary]">{{ results.nDiseased }}</div><div class="text-xs text-gray">基于灵敏度</div></el-card></el-col>
          <el-col :span="8"><el-card shadow="never" class="text-center"><div class="text-xs text-gray mb-1">对照数（阴性）</div><div class="text-3xl font-bold font-mono text-[--el-color-success]">{{ results.nHealthy }}</div><div class="text-xs text-gray">基于特异度</div></el-card></el-col>
          <el-col :span="8"><el-card shadow="never" class="text-center"><div class="text-xs text-gray mb-1">横断面总人数</div><div class="text-3xl font-bold font-mono text-[--el-color-warning]">{{ results.totalN }}</div><div class="text-xs text-gray">患病率 {{ (inputs.prev*100).toFixed(0) }}%</div></el-card></el-col>
        </el-row>
        <div class="flex flex-wrap gap-2 mb-4">
          <el-tag effect="plain" size="small">{{ (params.ci*100).toFixed(0) }}% CI</el-tag>
          <el-tag effect="plain" size="small">Sn={{ (inputs.sens*100).toFixed(0) }}% ±{{ (inputs.dSens*100).toFixed(0) }}%</el-tag>
          <el-tag effect="plain" size="small">Sp={{ (inputs.spec*100).toFixed(0) }}% ±{{ (inputs.dSpec*100).toFixed(0) }}%</el-tag>
          <el-tag effect="plain" size="small">患病率={{ (inputs.prev*100).toFixed(0) }}%</el-tag>
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
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "Diagnostic" });

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
<style scoped>.font-mono { font-family: "JetBrains Mono", monospace; }</style>
