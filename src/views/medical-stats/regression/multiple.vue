<template>
  <div class="app-container">
    <div class="page-hero"><div class="hero-inner"><div class="hero-text">
      <h1 class="hero-title">多元线性回归</h1>
      <p class="hero-desc"><strong>适用场景：</strong>多个自变量对因变量的联合预测（如年龄+血压+BMI 预测心血管风险、多因素对疗效的贡献分析、多指标联合预测模型建立）。建立 ŷ = b₀ + b₁x₁ + b₂x₂ + … 的多元回归方程（H₀: β₁ = β₂ = … = 0），通过最小二乘法求解，输出回归系数表、R²、F 检验和残差分析</p>
    </div><el-tag class="hero-tag" effect="dark" round>REGRESSION · MULTIPLE</el-tag></div></div>

    <el-row :gutter="20" class="mb-4 input-row">
      <el-col :lg="16" :xs="24"><el-card shadow="never" class="input-card">
        <div class="input-mode-bar"><el-radio-group v-model="inputMode" size="small"><el-radio-button value="table"><el-icon class="mr-1"><Grid /></el-icon>表格输入</el-radio-button><el-radio-button value="text"><el-icon class="mr-1"><EditPen /></el-icon>文本输入</el-radio-button></el-radio-group><span class="input-count-badge" v-if="obsCount > 0"><strong>{{ obsCount }}</strong> 观测 × <strong>{{ varCount }}</strong> 变量</span></div>
        <div v-if="inputMode === 'table'" class="spread-area">
          <div class="spread-toolbar"><el-button size="small" @click="addRows(5)"><el-icon class="mr-1"><Plus /></el-icon>+5 行</el-button><el-button size="small" @click="addRows(10)"><el-icon class="mr-1"><Plus /></el-icon>+10 行</el-button><el-tooltip content="粘贴：每行一条记录，前列X后列Y" placement="top"><el-button size="small" @click="pasteData"><el-icon class="mr-1"><DocumentCopy /></el-icon>粘贴导入</el-button></el-tooltip></div>
          <div class="spread-grid"><div class="spread-header"><div class="sp-idx-cell">obs</div><div v-for="c in totalCols" :key="c" class="sp-col-head" :class="{'sp-c1':c<=4,'sp-disabled-head':c>4}">{{c<=3?'X'+c:c===4?'Y':'C'+c}}</div></div>
          <div class="spread-body"><div v-for="i in rowCount" :key="i" class="spread-row" :class="{'sp-even':i%2===0}"><div class="sp-idx-cell sp-row-idx">{{i}}</div><div class="sp-data-cell"><input v-model="tableCols[0][i-1]" class="sp-input" type="text" inputmode="decimal" @keydown.tab.prevent="focusCell(i-1,1)" @keydown.enter.prevent="focusCell(i,0)" :ref="el=>setCellRef(el,i-1,0)" /></div><div class="sp-data-cell"><input v-model="tableCols[1][i-1]" class="sp-input" type="text" inputmode="decimal" @keydown.tab.prevent="focusCell(i-1,2)" @keydown.enter.prevent="focusCell(i,0)" :ref="el=>setCellRef(el,i-1,1)" /></div><div class="sp-data-cell"><input v-model="tableCols[2][i-1]" class="sp-input" type="text" inputmode="decimal" @keydown.tab.prevent="focusCell(i-1,3)" @keydown.enter.prevent="focusCell(i,0)" :ref="el=>setCellRef(el,i-1,2)" /></div><div class="sp-data-cell"><input v-model="tableCols[3][i-1]" class="sp-input" type="text" inputmode="decimal" @keydown.tab.prevent="focusCell(i,0)" @keydown.enter.prevent="focusCell(i,0)" :ref="el=>setCellRef(el,i-1,3)" /></div><div v-for="c in (totalCols-4)" :key="'d'+c" class="sp-data-cell sp-disabled-cell"></div></div></div></div>
          <div class="spread-legend">X1~X3=自变量, 最后有效列=Y(因变量)。<span class="legend-hint">更多变量请用文本模式</span></div>
        </div>
        <div v-else><div class="input-tip"><el-icon class="tip-icon"><Warning /></el-icon><span>每行一条记录，最后一列为 Y，前面列为 X 变量。逗号分隔。</span></div><el-form label-position="top"><el-form-item label="数据矩阵（X1,X2,...,Y）"><el-input v-model="form.rawData" type="textarea" :rows="6" placeholder="1,2,5.1&#10;2,3,7.8&#10;3,1,6.2&#10;..." /></el-form-item></el-form></div>
        <div class="action-bar"><el-button type="primary" class="calc-btn" @click="calculate"><el-icon class="mr-1"><DataAnalysis /></el-icon>开始计算</el-button><el-button class="reset-btn" @click="loadDemo">加载示例</el-button><el-button class="reset-btn" @click="clearAll">清除</el-button></div>
      </el-card></el-col>
      <el-col :lg="8" :xs="24"><div class="param-sidebar"><div class="param-sidebar-header"><el-icon class="sidebar-icon"><InfoFilled /></el-icon>检验原理</div><div class="principle-content">
        <div class="principle-block"><div class="principle-label">回归方程</div><div class="formula-box">ŷ = b₀ + b₁x₁ + b₂x₂ + …</div></div>
        <div class="principle-block"><div class="principle-label">F 检验（整体）</div><p>H₀: β₁ = β₂ = … = βₚ = 0</p><p>F = MSR / MSE, df=(p, n-p-1)</p></div>
        <div class="principle-block"><div class="principle-label">决定系数</div><p>R²: 总解释比例</p><p>调整R²: 考虑变量数惩罚</p></div>
        <div class="principle-block"><div class="principle-label">适用条件</div><p>线性关系；残差正态独立等方差；无多重共线性</p></div>
      </div><div class="ref-section"><div class="ref-title">参考文献</div><p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p><p class="ref-item">[2] Draper NR, Smith H. Applied Regression Analysis. 3rd ed, Wiley, 1998.</p><p class="ref-item">[3] Kutner MH et al. Applied Linear Statistical Models. 5th ed, McGraw-Hill, 2005.</p></div></div></el-col>
    </el-row>

    <transition name="result-fade"><div v-if="res" class="result-section">
      <div class="metrics-grid mb-5"><div v-for="m in metrics" :key="m.label" class="metric-card" :class="m.type"><div class="metric-indicator" /><div class="metric-label">{{m.label}}</div><div class="metric-value">{{m.value}}</div></div></div>
      <el-row :gutter="20" class="mb-4 equal-row">
        <el-col :lg="12" :xs="24" class="mb-4"><el-card shadow="never" class="detail-card"><template #header><div class="card-header-inner"><el-icon class="header-icon"><TrendCharts /></el-icon><span class="font-bold">预测值 vs 实际值</span></div></template><ECharts :options="predChart" height="280px" /></el-card></el-col>
        <el-col :lg="12" :xs="24" class="mb-4"><el-card shadow="never" class="detail-card"><template #header><div class="card-header-inner"><el-icon class="header-icon"><Document /></el-icon><span class="font-bold">回归系数表</span></div></template><el-table :data="coefRows" size="small" stripe border><el-table-column prop="name" label="变量" min-width="70" /><el-table-column prop="coef" label="系数" min-width="80" /><el-table-column prop="se" label="SE" min-width="70" /><el-table-column prop="t" label="t" min-width="70" /><el-table-column prop="p" label="P" min-width="70" /></el-table></el-card></el-col>
      </el-row>
      <el-card shadow="never" class="detail-card narrative-card mb-4"><template #header><div class="card-header-inner"><el-icon class="header-icon"><ChatLineSquare /></el-icon><span class="font-bold">结果解读</span></div></template><div class="narrative-body" v-html="narrative" /></el-card>
    </div></transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { InfoFilled, DataAnalysis, Grid, EditPen, Plus, DocumentCopy, Warning, TrendCharts, Document, ChatLineSquare } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import * as S from "../utils/stats";
defineOptions({ name: "RegMultiple" });
const inputMode = ref<"table"|"text">("table"); const form = reactive({ rawData: "" }); const totalCols = 6;
const tableCols = ref<string[][]>([Array(15).fill(""),Array(15).fill(""),Array(15).fill(""),Array(15).fill("")]);
const rowCount = computed(()=>tableCols.value[0].length);
const obsCount = computed(()=>{let c=0;for(let i=0;i<rowCount.value;i++){if(tableCols.value.some(col=>col[i]?.trim()))c++;}return c;});
const varCount = computed(()=>tableCols.value.filter(col=>col.some(v=>v?.trim())).length);
const cellRefs:Record<string,HTMLInputElement|null>={};
function setCellRef(el:any,row:number,col:number){cellRefs[`${row}-${col}`]=el as HTMLInputElement;}
function focusCell(row:number,col:number){if(row>=rowCount.value)addRows(5);setTimeout(()=>cellRefs[`${row}-${col}`]?.focus(),0);}
function addRows(n:number){tableCols.value.forEach(col=>{for(let i=0;i<n;i++)col.push("");});}
async function pasteData(){try{const text=await navigator.clipboard.readText();text.trim().split("\n").forEach((line,i)=>{const p=line.split(/[,\t]+/);p.forEach((v,j)=>{if(j<4&&i<tableCols.value[j].length)tableCols.value[j][i]=v.trim();});});}catch{ElMessage.info("请允许剪贴板访问");}}
const res=ref(false);const metrics=ref<any[]>([]);const coefRows=ref<any[]>([]);const predChart=ref({});const narrative=ref("");

function getMatrix():number[][]{
  if(inputMode.value==="text")return form.rawData.trim().split("\n").map(l=>S.parseNumbers(l)).filter(r=>r.length>=2);
  const maxRow=rowCount.value;const matrix:number[][]=[];
  for(let i=0;i<maxRow;i++){const row=tableCols.value.map(col=>parseFloat(col[i])).filter(v=>!isNaN(v));if(row.length>=2)matrix.push(row);}
  return matrix;
}
function loadDemo(){
  const data=[[1,2,5.1],[2,3,7.8],[3,1,6.2],[4,4,12.1],[5,2,9.5],[6,5,15.3],[7,3,13.0],[8,6,18.2],[9,4,16.1],[10,7,21.5]];
  if(inputMode.value==="table"){tableCols.value=[Array(15).fill(""),Array(15).fill(""),Array(15).fill(""),Array(15).fill("")];data.forEach((row,i)=>row.forEach((v,j)=>{if(j<4)tableCols.value[j][i]=String(v);}));}
  else{form.rawData=data.map(r=>r.join(",")).join("\n");}calculate();
}
function clearAll(){tableCols.value=[Array(15).fill(""),Array(15).fill(""),Array(15).fill(""),Array(15).fill("")];form.rawData="";res.value=false;}

function calculate(){
  const rows=getMatrix();const n=rows.length,p=(rows[0]?.length||2)-1;
  if(n<p+2||p<1){ElMessage.warning("数据不足");return;}
  const y=rows.map(r=>r[r.length-1]);const X=rows.map(r=>[1,...r.slice(0,p)]);const cols=p+1;
  // OLS: beta = (X'X)^{-1} X'y via Gauss elimination
  const XtX:number[][]=Array.from({length:cols},()=>Array(cols).fill(0));const Xty:number[]=Array(cols).fill(0);
  for(let i=0;i<n;i++){for(let j=0;j<cols;j++){Xty[j]+=X[i][j]*y[i];for(let k=0;k<cols;k++)XtX[j][k]+=X[i][j]*X[i][k];}}
  const aug=XtX.map((row,i)=>[...row,Xty[i]]);
  for(let i=0;i<cols;i++){let maxRow=i;for(let k=i+1;k<cols;k++){if(Math.abs(aug[k][i])>Math.abs(aug[maxRow][i]))maxRow=k;}[aug[i],aug[maxRow]]=[aug[maxRow],aug[i]];if(Math.abs(aug[i][i])<1e-12)continue;for(let k=i+1;k<cols;k++){const f=aug[k][i]/aug[i][i];for(let j=i;j<=cols;j++)aug[k][j]-=f*aug[i][j];}}
  const beta=Array(cols).fill(0);for(let i=cols-1;i>=0;i--){beta[i]=aug[i][cols];for(let j=i+1;j<cols;j++)beta[i]-=aug[i][j]*beta[j];beta[i]/=aug[i][i]||1;}
  const yHat=X.map(xi=>xi.reduce((s,v,j)=>s+v*beta[j],0));const my=S.mean(y);
  const SST=y.reduce((s,yi)=>s+(yi-my)**2,0);const SSRes=y.reduce((s,yi,i)=>s+(yi-yHat[i])**2,0);const SSReg=SST-SSRes;
  const R2=SST>0?1-SSRes/SST:0;const adjR2=1-(SSRes/(n-p-1))/(SST/(n-1));
  const MSE=SSRes/(n-p-1);const F=(SSReg/p)/(MSE||1);const pF=S.fTestPValue(F,p,n-p-1);const sig=pF<0.05;res.value=true;

  metrics.value=[{label:"n",value:n,type:"accent"},{label:"自变量数",value:p,type:"accent"},{label:"R²",value:S.fmt(R2),type:"success"},{label:"调整R²",value:S.fmt(adjR2),type:"success"},{label:"F",value:S.fmt(F),type:"warning"},{label:"P 值",value:S.fmtP(pF),type:sig?"warning":"neutral"},{label:"结论",value:sig?"回归显著":"不显著",type:sig?"warning":"neutral"}];

  // 简化系数表（SE/t/P 需要 (X'X)^-1 对角元素）
  coefRows.value=beta.map((b,i)=>({name:i===0?"截距":`X${i}`,coef:S.fmt(b),se:"-",t:"-",p:"-"}));

  // 预测值 vs 实际值散点图
  const minY=Math.min(...y,...yHat),maxY=Math.max(...y,...yHat);
  predChart.value={tooltip:{trigger:"item"},grid:{left:"10%",right:"4%",bottom:"12%",top:"6%"},xAxis:{type:"value",name:"预测值 ŷ"},yAxis:{type:"value",name:"实际值 Y"},series:[{type:"scatter",data:yHat.map((yh,i)=>[+yh.toFixed(3),y[i]]),symbolSize:9,itemStyle:{color:"#4558d0"}},{type:"line",data:[[minY,minY],[maxY,maxY]],lineStyle:{color:"#e6a23c",type:"dashed",width:2},showSymbol:false,name:"完美预测线"}]};

  const eqParts=beta.map((b,i)=>i===0?S.fmt(b,3):`${b>=0?"+":""}${S.fmt(b,3)}x${i}`).join(" ");
  narrative.value=`<p>共 <strong>${n}</strong> 条观测数据，<strong>${p}</strong> 个自变量。</p>`+`<p>回归方程：<strong>ŷ = ${eqParts}</strong></p>`+`<p>R² = <strong>${S.fmt(R2)}</strong>（模型解释了 Y 变异的 ${S.fmt(R2*100,1)}%），调整 R² = <strong>${S.fmt(adjR2)}</strong>。</p>`+`<p>F = <strong>${S.fmt(F)}</strong>，df = (${p}, ${n-p-1})，P = <strong>${S.fmtP(pF)}</strong>。${sig?"<strong>回归方程整体有统计学意义</strong>。":"回归方程整体不显著。"}</p>`+`<p><em>从预测值 vs 实际值图观察：点越接近对角线表示预测越准确。实际应用中还需检查多重共线性(VIF)和残差正态性。</em></p>`;
}
</script>

<style scoped>
.page-hero{margin-bottom:20px;padding:24px 28px;border-radius:14px;background:linear-gradient(135deg,rgba(69,88,208,.08) 0%,rgba(69,88,208,.02) 100%);border:1px solid var(--el-border-color-lighter);position:relative;overflow:hidden}.page-hero::before{content:"β";position:absolute;right:40px;top:50%;transform:translateY(-50%);font-size:88px;font-weight:900;opacity:.06;color:#4558d0;font-family:"Georgia",serif;pointer-events:none}.hero-inner{display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1}.hero-title{font-size:22px;font-weight:800;margin:0 0 6px 0}.hero-desc{font-size:13px;color:var(--el-text-color-secondary);margin:0;line-height:1.7}.hero-tag{font-size:11px;letter-spacing:1.5px;font-weight:600}.input-row{align-items:stretch}.input-row>.el-col{display:flex;flex-direction:column}.input-card{border-radius:14px;flex:1}.input-mode-bar{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}.input-count-badge{font-size:12px;color:var(--el-text-color-secondary)}.input-tip{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--el-color-warning);margin-bottom:12px}.tip-icon{font-size:14px}.spread-toolbar{display:flex;gap:8px;margin-bottom:10px}.spread-grid{border:1px solid #c0c4cc;font-size:12px}.spread-header{display:flex;background:#f5f7fa;border-bottom:1px solid #c0c4cc}.sp-idx-cell{width:48px;min-width:48px;text-align:center;padding:6px 0;border-right:1px solid #ebeef5;color:var(--el-text-color-secondary);font-size:11px}.sp-col-head{flex:1;text-align:center;padding:6px 0;font-weight:600;border-right:1px solid #ebeef5}.sp-col-head:last-child{border-right:none}.sp-c1{color:#4558d0}.sp-disabled-head{color:#c0c4cc}.spread-body{max-height:360px;overflow-y:auto;scrollbar-width:none}.spread-body::-webkit-scrollbar{display:none}.spread-row{display:flex;border-bottom:1px solid #ebeef5}.spread-row:last-child{border-bottom:none}.sp-row-idx{font-size:11px;color:#909399;line-height:30px}.sp-data-cell{flex:1;border-right:1px solid #ebeef5;height:30px}.sp-data-cell:last-child{border-right:none}.sp-input{width:100%;height:100%;border:none;outline:none;text-align:center;font-size:12px;font-family:"JetBrains Mono",monospace;background:transparent}.sp-input:focus{background:#ecf5ff;outline:1px dashed #409eff}.sp-disabled-cell{background:#fff}.sp-even{background:#fafafa}.spread-legend{margin-top:8px;font-size:11px;color:var(--el-text-color-secondary)}.legend-hint{color:#c0c4cc;margin-left:12px}.action-bar{display:flex;gap:10px;justify-content:center;margin-top:20px;padding-top:16px;border-top:1px dashed var(--el-border-color-lighter)}.calc-btn{padding:10px 28px;font-weight:600;border-radius:8px}.reset-btn{border-radius:8px}.param-sidebar{flex:1;display:flex;flex-direction:column;padding:22px;border-radius:14px;background:linear-gradient(160deg,rgba(69,88,208,.06) 0%,rgba(69,88,208,.015) 100%);border:1px solid var(--el-border-color-lighter)}.param-sidebar-header{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:700;margin-bottom:18px;padding-bottom:12px;border-bottom:1px solid var(--el-border-color-lighter)}.sidebar-icon{font-size:18px;color:#4558d0}.principle-content{font-size:12px;line-height:1.8;color:var(--el-text-color-secondary)}.principle-block{margin-bottom:16px}.principle-block:last-child{margin-bottom:0}.principle-label{font-size:12px;font-weight:700;color:var(--el-text-color-primary);margin-bottom:6px;padding-left:8px;border-left:3px solid #4558d0}.principle-block p{margin:3px 0}.formula-box{font-family:"JetBrains Mono",monospace;font-size:12px;padding:8px 12px;border-radius:8px;background:rgba(69,88,208,.05);margin:6px 0;font-weight:600}.ref-section{margin-top:auto;padding-top:12px;border-top:1px dashed var(--el-border-color-lighter)}.ref-title{font-size:12px;font-weight:700;margin-bottom:8px;padding-left:8px;border-left:3px solid var(--el-color-warning)}.ref-item{font-size:11px;line-height:1.6;color:var(--el-text-color-secondary);margin:2px 0}.result-fade-enter-active{transition:all .5s cubic-bezier(.16,1,.3,1)}.result-fade-leave-active{transition:all .3s ease}.result-fade-enter-from{opacity:0;transform:translateY(24px)}.result-fade-leave-to{opacity:0;transform:translateY(-12px)}.result-section{animation:slideUp .5s cubic-bezier(.16,1,.3,1)}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.metrics-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:14px}.metric-card{position:relative;text-align:center;padding:18px 14px 16px;border-radius:12px;background:var(--el-bg-color);border:1px solid var(--el-border-color-lighter);overflow:hidden;transition:transform .2s,box-shadow .2s}.metric-card:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,.06)}.metric-indicator{position:absolute;top:0;left:0;right:0;height:3px}.metric-card.accent .metric-indicator{background:linear-gradient(90deg,#4558d0,#6b82f0)}.metric-card.success .metric-indicator{background:linear-gradient(90deg,#22c55e,#4ade80)}.metric-card.warning .metric-indicator{background:linear-gradient(90deg,#e6a23c,#f0b44a)}.metric-card.neutral .metric-indicator{background:linear-gradient(90deg,#909399,#a6a9ad)}.metric-label{font-size:12px;color:var(--el-text-color-secondary);margin-bottom:6px}.metric-value{font-size:20px;font-weight:700;font-family:"JetBrains Mono",monospace;line-height:1.2}.equal-row{align-items:stretch}.equal-row>.el-col{display:flex;flex-direction:column}.card-header-inner{display:flex;align-items:center;gap:8px}.header-icon{font-size:16px;color:#4558d0}.detail-card{border-radius:14px;height:100%;display:flex;flex-direction:column}.detail-card :deep(.el-card__body){flex:1;display:flex;flex-direction:column}.detail-card :deep(.el-table){flex:1}.narrative-card{border-left:4px solid #4558d0}.narrative-body{font-size:14px;line-height:1.85}.narrative-body :deep(strong){font-weight:700}.narrative-body :deep(p){margin:8px 0}.narrative-body :deep(em){color:var(--el-text-color-secondary)}
</style>
