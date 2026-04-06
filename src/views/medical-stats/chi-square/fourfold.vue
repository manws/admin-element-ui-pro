<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">四格表卡方检验</span><el-tag size="small" effect="plain">FOURFOLD</el-tag></div></template>
      <el-tabs v-model="activeTab">
        <!-- Tab 1: 四格表格式 -->
        <el-tab-pane label="四格表格式" name="table">
          <el-form label-position="top" class="mt-4">
            <div class="grid-2x2">
              <div /><div class="text-center font-bold text-sm">发生数</div><div class="text-center font-bold text-sm">未发生数</div><div class="text-center font-bold text-sm text-gray">样本数</div>
              <div class="font-bold text-sm">组一</div>
              <el-input-number v-model="tbl.a" :min="0" :step="1" size="small" style="width:100%" />
              <el-input-number v-model="tbl.b" :min="0" :step="1" size="small" style="width:100%" />
              <div class="text-center text-gray">{{ tbl.a + tbl.b }}</div>
              <div class="font-bold text-sm">组二</div>
              <el-input-number v-model="tbl.c" :min="0" :step="1" size="small" style="width:100%" />
              <el-input-number v-model="tbl.d" :min="0" :step="1" size="small" style="width:100%" />
              <div class="text-center text-gray">{{ tbl.c + tbl.d }}</div>
              <div class="font-bold text-sm text-gray">合计</div>
              <div class="text-center text-gray">{{ tbl.a + tbl.c }}</div>
              <div class="text-center text-gray">{{ tbl.b + tbl.d }}</div>
              <div class="text-center font-bold">{{ tbl.a + tbl.b + tbl.c + tbl.d }}</div>
            </div>
            <el-button type="primary" class="mt-4" @click="calcTable">计算</el-button>
          </el-form>
          <template v-if="tblRes"><ResultCards :res="tblRes" /></template>
        </el-tab-pane>

        <!-- Tab 2: 发生数格式 -->
        <el-tab-pane label="发生数格式" name="count">
          <el-form label-position="top" class="mt-4">
            <el-row :gutter="16">
              <el-col :span="5"><el-form-item label="组1 发生数"><el-input-number v-model="cnt.x1" :min="0" :step="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="5"><el-form-item label="组1 样本数"><el-input-number v-model="cnt.n1" :min="1" :step="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="5"><el-form-item label="组2 发生数"><el-input-number v-model="cnt.x2" :min="0" :step="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="5"><el-form-item label="组2 样本数"><el-input-number v-model="cnt.n2" :min="1" :step="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="4" class="btn-col"><el-button type="primary" style="width:100%" @click="calcCount">计算</el-button></el-col>
            </el-row>
          </el-form>
          <template v-if="cntRes"><ResultCards :res="cntRes" /></template>
        </el-tab-pane>

        <!-- Tab 3: 发生率格式 -->
        <el-tab-pane label="发生率格式" name="rate">
          <el-form label-position="top" class="mt-4">
            <el-row :gutter="16">
              <el-col :span="5"><el-form-item label="组1 发生率"><el-input-number v-model="rate.p1" :min="0" :max="1" :step="0.05" :precision="3" style="width:100%" /></el-form-item></el-col>
              <el-col :span="5"><el-form-item label="组1 样本数"><el-input-number v-model="rate.n1" :min="1" :step="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="5"><el-form-item label="组2 发生率"><el-input-number v-model="rate.p2" :min="0" :max="1" :step="0.05" :precision="3" style="width:100%" /></el-form-item></el-col>
              <el-col :span="5"><el-form-item label="组2 样本数"><el-input-number v-model="rate.n2" :min="1" :step="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="4" class="btn-col"><el-button type="primary" style="width:100%" @click="calcRate">计算</el-button></el-col>
            </el-row>
          </el-form>
          <template v-if="rateRes"><ResultCards :res="rateRes" /></template>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import * as S from "../utils/stats";

defineOptions({ name: "Fourfold" });

// 结果展示子组件
const ResultCards = defineComponent({
  props: { res: { type: Object, required: true } },
  setup(props) {
    return () => h("div", { class: "mt-4" }, [
      h("div", { class: "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4" }, [
        mc("χ² (未校正)", props.res.chi2, "accent"),
        mc("χ² (Yates校正)", props.res.chi2Yates, "accent"),
        mc("P 值 (未校正)", props.res.pVal, "warning"),
        mc("P 值 (Yates)", props.res.pValYates, "warning"),
      ]),
      h("div", { class: "grid grid-cols-2 lg:grid-cols-4 gap-4" }, [
        mc("组1率", props.res.p1, "success"),
        mc("组2率", props.res.p2, "success"),
        mc("率差", props.res.diff, "neutral"),
        mc("结论 (α=0.05)", props.res.sig ? "差异有统计学意义" : "差异无统计学意义", props.res.sig ? "accent" : "neutral"),
      ]),
    ]);
    function mc(label: string, value: any, type: string) {
      return h("div", { class: `el-card is-never-shadow metric-card ${type}`, style: "text-align:center;padding:12px;border-top:3px solid" },
        [h("div", { class: "text-xs text-gray mb-1" }, label), h("div", { class: "text-lg font-bold font-mono" }, String(value))]);
    }
  },
});

const activeTab = ref("table");

// 四格表计算核心
function chi2Calc(a: number, b: number, c: number, d: number) {
  const n = a + b + c + d;
  const n1 = a + b, n2 = c + d, c1 = a + c, c2 = b + d;
  const p1 = n1 > 0 ? a / n1 : 0;
  const p2 = n2 > 0 ? c / n2 : 0;

  // 未校正
  const chi2 = n > 0 ? (n * (a * d - b * c) ** 2) / (n1 * n2 * c1 * c2 || 1) : 0;
  // Yates 连续性校正
  const ad_bc = Math.abs(a * d - b * c);
  const chi2Yates = n > 0 ? (n * Math.max(0, ad_bc - n / 2) ** 2) / (n1 * n2 * c1 * c2 || 1) : 0;

  const pVal = S.chiSquarePValue(chi2, 1);
  const pValYates = S.chiSquarePValue(chi2Yates, 1);

  return {
    chi2: S.fmt(chi2, 4), chi2Yates: S.fmt(chi2Yates, 4),
    pVal: S.fmt(pVal, 6), pValYates: S.fmt(pValYates, 6),
    p1: S.fmt(p1, 4), p2: S.fmt(p2, 4),
    diff: S.fmt(p1 - p2, 4), sig: pVal < 0.05,
  };
}

// Tab 1: 四格表
const tbl = reactive({ a: 30, b: 70, c: 45, d: 55 });
const tblRes = ref<any>(null);
function calcTable() { tblRes.value = chi2Calc(tbl.a, tbl.b, tbl.c, tbl.d); }

// Tab 2: 发生数
const cnt = reactive({ x1: 30, n1: 100, x2: 45, n2: 100 });
const cntRes = ref<any>(null);
function calcCount() { cntRes.value = chi2Calc(cnt.x1, cnt.n1 - cnt.x1, cnt.x2, cnt.n2 - cnt.x2); }

// Tab 3: 发生率
const rate = reactive({ p1: 0.3, n1: 100, p2: 0.45, n2: 100 });
const rateRes = ref<any>(null);
function calcRate() {
  const a = Math.round(rate.p1 * rate.n1), c = Math.round(rate.p2 * rate.n2);
  rateRes.value = chi2Calc(a, rate.n1 - a, c, rate.n2 - c);
}
</script>

<style scoped>
.grid-2x2 { display: grid; grid-template-columns: 80px 1fr 1fr 100px; gap: 10px; align-items: center; max-width: 600px; }
.metric-card { border-radius: 8px; }
.metric-card.accent { border-top-color: #409EFF !important; }
.metric-card.success { border-top-color: #67C23A !important; }
.metric-card.warning { border-top-color: #E6A23C !important; }
.metric-card.neutral { border-top-color: #909399 !important; }
.font-mono { font-family: "JetBrains Mono", monospace; }
</style>
