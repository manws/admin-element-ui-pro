<template>
  <div class="app-container">
    <template v-if="model">
      <!-- 页头 + 算法介绍 + 核心参数 -->
      <AlgoIntro
        :title="model.nameZh"
        :hero-desc="heroDesc"
        :hero-tag="model.code"
        watermark="SR"
        :definition="definition"
        :scenarios="scenarios"
        :features="features"
        :params="introParams"
      />

      <el-row :gutter="20">
        <!-- 录入区 -->
        <el-col :lg="14" :xs="24">
          <el-card shadow="never" class="mb-4">
            <template #header>
              <div class="flex-x-between">
                <span class="font-bold">患者信息录入（{{ model.code }}）</span>
                <el-button link type="primary" @click="goBack">
                  <el-icon class="mr-1"><ArrowLeft /></el-icon>返回模型信息
                </el-button>
              </div>
            </template>

            <el-form
              ref="formRef"
              :model="form"
              :rules="rules"
              label-width="160px"
            >
              <el-form-item label="年龄" prop="age">
                <el-input-number
                  v-model="form.age"
                  :min="35"
                  :max="90"
                  :step="1"
                  controls-position="right"
                />
                <span class="form-unit">岁（35 ~ 90）</span>
              </el-form-item>

              <el-form-item label="身高" prop="height">
                <el-input-number
                  v-model="form.height"
                  :min="100"
                  :max="210"
                  :step="1"
                  controls-position="right"
                />
                <span class="form-unit">cm（100 ~ 210）</span>
              </el-form-item>

              <el-form-item label="体重" prop="weight">
                <el-input-number
                  v-model="form.weight"
                  :min="30"
                  :max="150"
                  :step="0.5"
                  :precision="1"
                  controls-position="right"
                />
                <span class="form-unit">kg（30 ~ 150）</span>
              </el-form-item>

              <el-form-item label="低密度脂蛋白" prop="ldl">
                <el-radio-group v-model="form.ldlUnit" class="mr-3">
                  <el-radio-button :value="0">mg/dl</el-radio-button>
                  <el-radio-button :value="1">mmol/L</el-radio-button>
                </el-radio-group>
                <el-input-number
                  v-model="form.ldl"
                  :min="ldlRange.min"
                  :max="ldlRange.max"
                  :step="ldlRange.step"
                  :precision="2"
                  controls-position="right"
                />
                <span class="form-unit">{{ ldlRange.tip }}</span>
              </el-form-item>

              <el-form-item label="高血压" prop="hypertension">
                <el-radio-group v-model="form.hypertension">
                  <el-radio-button :value="0">否</el-radio-button>
                  <el-radio-button :value="1">是</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="糖尿病" prop="diabetes">
                <el-radio-group v-model="form.diabetes">
                  <el-radio-button :value="0">否</el-radio-button>
                  <el-radio-button :value="1">是</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="现在吸烟" prop="smoking">
                <el-radio-group v-model="form.smoking">
                  <el-radio-button :value="0">否</el-radio-button>
                  <el-radio-button :value="1">是</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="症状性狭窄部位" prop="location">
                <el-radio-group v-model="form.location">
                  <el-radio-button :value="0">前循环</el-radio-button>
                  <el-radio-button :value="1">后循环</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="责任血管狭窄程度" prop="stenosis">
                <el-radio-group v-model="form.stenosis">
                  <el-radio-button :value="0">&lt; 70%</el-radio-button>
                  <el-radio-button :value="1">≥ 70%</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </el-card>

          <el-card shadow="never" class="mb-4">
            <div class="flex-center gap-4">
              <el-button type="primary" size="large" @click="handleCalc">
                <el-icon class="mr-1"><DataAnalysis /></el-icon>计算风险
              </el-button>
              <el-button size="large" @click="handleReset">
                <el-icon class="mr-1"><Refresh /></el-icon>清除数据
              </el-button>
            </div>
          </el-card>
        </el-col>

        <!-- 计算说明 -->
        <el-col :lg="10" :xs="24">
          <el-card shadow="never" class="mb-4">
            <template #header><span class="font-bold">计算说明</span></template>
            <div class="note-body">
              <h4>预后指数</h4>
              <p class="note-formula">
                z = 0.0688×(年龄−61.0081) + 0.0478×(BMI−25.0343) + 0.4437×高血压
                + 0.0183×(LDL−120.7439) + 0.6723×糖尿病 + 0.4582×现在吸烟 +
                0.2707×后循环 + 0.8520×狭窄≥70%
              </p>
              <h4>复发风险</h4>
              <p class="note-formula">R(t) = 1 − S₀(t)<sup>exp(z)</sup></p>
              <el-descriptions :column="1" border size="small" class="mt-2">
                <el-descriptions-item label="S₀（3 个月）"
                  >0.9924</el-descriptions-item
                >
                <el-descriptions-item label="S₀（6 个月）"
                  >0.9880</el-descriptions-item
                >
                <el-descriptions-item label="S₀（12 个月）"
                  >0.9804</el-descriptions-item
                >
                <el-descriptions-item label="BMI"
                  >体重(kg) ÷ 身高(m)²，自动换算</el-descriptions-item
                >
                <el-descriptions-item label="LDL-C"
                  >mmol/L × 38.7 换算为 mg/dl 后参与计算</el-descriptions-item
                >
              </el-descriptions>
              <el-alert
                class="mt-3"
                type="warning"
                :closable="false"
                description="本工具仅用于卒中复发风险的初步评估，不能代替临床诊断，具体治疗措施请咨询专业医师。"
              />
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 结果弹窗 -->
      <el-dialog
        v-model="resultVisible"
        title="卒中复发风险预测结果"
        width="760px"
      >
        <template v-if="result">
          <el-row :gutter="16" class="mb-4">
            <el-col :span="8">
              <div
                class="sc-metric-card"
                :class="levelClass(result.R3)"
                data-watermark="R3"
              >
                <div class="sc-label">3 个月复发风险</div>
                <div class="sc-value">{{ result.R3 }}%</div>
                <div class="sc-sub">{{ levelText(result.R3) }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div
                class="sc-metric-card"
                :class="levelClass(result.R6)"
                data-watermark="R6"
              >
                <div class="sc-label">6 个月复发风险</div>
                <div class="sc-value">{{ result.R6 }}%</div>
                <div class="sc-sub">{{ levelText(result.R6) }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div
                class="sc-metric-card"
                :class="levelClass(result.R12)"
                data-watermark="R12"
              >
                <div class="sc-label">12 个月复发风险</div>
                <div class="sc-value">{{ result.R12 }}%</div>
                <div class="sc-sub">{{ levelText(result.R12) }}</div>
              </div>
            </el-col>
          </el-row>

          <el-alert
            class="mb-4"
            type="info"
            :closable="false"
            :description="`风险分级阈值：低风险 <5%，中风险 5%~15%，高风险 ≥15%。预后指数 z = ${result.z}`"
          />

          <el-card shadow="never">
            <template #header
              ><span class="font-bold">录入参数回显</span></template
            >
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="模型编号">{{
                model.code
              }}</el-descriptions-item>
              <el-descriptions-item label="BMI">{{
                result.bmi
              }}</el-descriptions-item>
              <el-descriptions-item label="年龄"
                >{{ form.age }} 岁</el-descriptions-item
              >
              <el-descriptions-item label="身高"
                >{{ form.height }} cm</el-descriptions-item
              >
              <el-descriptions-item label="体重"
                >{{ form.weight }} kg</el-descriptions-item
              >
              <el-descriptions-item label="低密度脂蛋白">
                {{ form.ldl }} {{ form.ldlUnit === 1 ? "mmol/L" : "mg/dl" }}
              </el-descriptions-item>
              <el-descriptions-item label="高血压">{{
                form.hypertension === 1 ? "是" : "否"
              }}</el-descriptions-item>
              <el-descriptions-item label="糖尿病">{{
                form.diabetes === 1 ? "是" : "否"
              }}</el-descriptions-item>
              <el-descriptions-item label="现在吸烟">{{
                form.smoking === 1 ? "是" : "否"
              }}</el-descriptions-item>
              <el-descriptions-item label="症状性狭窄部位">
                {{ form.location === 1 ? "后循环" : "前循环" }}
              </el-descriptions-item>
              <el-descriptions-item label="责任血管狭窄程度">
                {{ form.stenosis === 1 ? "≥ 70%" : "< 70%" }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </template>

        <template #footer>
          <el-button @click="resultVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleRecalc">重新计算</el-button>
        </template>
      </el-dialog>
    </template>

    <!-- 无效编号 -->
    <el-empty v-else description="未找到对应的模型">
      <el-button type="primary" @click="goBack">返回模型信息</el-button>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import { computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import AlgoIntro from "../sample-calc/AlgoIntro.vue";
import { getModelByCode } from "./model-data";

defineOptions({ name: "ModelEvaluation" });

const route = useRoute();
const router = useRouter();

/** 模型编号取自动态路由参数 */
const code = computed(() => String(route.params.code ?? ""));
const model = computed(() => getModelByCode(code.value));

const heroDesc =
  "填写 9 项患者信息，基于 PROMISE 模型评估症状性颅内动脉狭窄患者未来 3 / 6 / 12 个月的缺血性卒中复发风险。";

const definition = [
  "PROMISE 模型基于 <strong>Cox 比例风险回归</strong>构建，用于预测颅内动脉狭窄 50%-99% 的症状性卒中或 TIA 患者在未来 1 年内发生缺血性卒中的个体化风险。",
  "模型以 <strong>预后指数 z</strong> 汇总年龄、BMI、LDL-C、合并症与血管病变特征，再结合基线生存率 S₀(t) 推算各时间点复发概率。",
];

const scenarios = [
  "症状性颅内动脉粥样硬化性狭窄（ICAS）患者的<strong>卒中复发风险分层</strong>。",
  "卒中或 TIA 后 1 年内<strong>二级预防强度</strong>的决策参考。",
  "临床研究中受试者的<strong>基线风险刻画</strong>与分层随机。",
];

const features = [
  "<strong>LDL-C 单位</strong>：支持 mg/dl 与 mmol/L，mmol/L 按 1 mmol/L = 38.7 mg/dl 换算后参与计算。",
  "<strong>BMI 自动换算</strong>：由身高、体重自动计算 BMI = 体重(kg) ÷ 身高(m)²。",
  "<strong>适用边界</strong>：模型基于特定人群拟合，外推到其他人群需谨慎，结果不能替代临床诊断。",
];

const introParams = [
  { title: "年龄", desc: "35 ~ 90 岁" },
  { title: "身高", desc: "100 ~ 210 cm" },
  { title: "体重", desc: "30 ~ 150 kg" },
  { title: "低密度脂蛋白", desc: "mg/dl 30 ~ 300 或 mmol/L 0.7 ~ 8.0" },
  { title: "高血压", desc: "是 / 否" },
  { title: "糖尿病", desc: "是 / 否" },
  { title: "现在吸烟", desc: "是 / 否" },
  { title: "症状性狭窄部位", desc: "前循环 / 后循环" },
  { title: "责任血管狭窄程度", desc: "< 70% 或 ≥ 70%" },
];

/** 风险分级阈值：低风险 <5%，中风险 5%~15%，高风险 ≥15% */
const RISK_THRESHOLD = { low: 5, high: 15 };

/** 基线生存率 */
const BASELINE_SURVIVAL = { R3: 0.9924, R6: 0.988, R12: 0.9804 };

interface EvaluationForm {
  age: number | undefined;
  height: number | undefined;
  weight: number | undefined;
  ldlUnit: 0 | 1;
  ldl: number | undefined;
  hypertension: 0 | 1 | undefined;
  diabetes: 0 | 1 | undefined;
  smoking: 0 | 1 | undefined;
  location: 0 | 1 | undefined;
  stenosis: 0 | 1 | undefined;
}

const createForm = (): EvaluationForm => ({
  age: undefined,
  height: undefined,
  weight: undefined,
  ldlUnit: 0,
  ldl: undefined,
  hypertension: undefined,
  diabetes: undefined,
  smoking: undefined,
  location: undefined,
  stenosis: undefined,
});

const formRef = ref<FormInstance>();
const form = reactive<EvaluationForm>(createForm());

/** LDL-C 录入范围随单位切换 */
const ldlRange = computed(() =>
  form.ldlUnit === 1
    ? { min: 0.7, max: 8, step: 0.1, tip: "mmol/L（0.7 ~ 8.0）" }
    : { min: 30, max: 300, step: 1, tip: "mg/dl（30 ~ 300）" },
);

// 切换单位时清空已录入值，避免单位与数值不匹配
watch(
  () => form.ldlUnit,
  () => {
    form.ldl = undefined;
  },
);

/** 数值型：必填 + 区间校验 */
function numberRule(name: string, min: number, max: number) {
  return {
    validator: (
      _rule: unknown,
      value: unknown,
      callback: (error?: Error) => void,
    ) => {
      if (value === undefined || value === null || value === "") {
        callback(new Error(`请输入${name}`));
        return;
      }
      const num = Number(value);
      if (Number.isNaN(num) || num < min || num > max) {
        callback(new Error(`${name}需在 ${min} ~ ${max} 之间`));
        return;
      }
      callback();
    },
    trigger: "blur",
  };
}

/** 选项型：必选校验（0 为有效值） */
function choiceRule(name: string) {
  return {
    validator: (
      _rule: unknown,
      value: unknown,
      callback: (error?: Error) => void,
    ) => {
      if (value === undefined || value === null) {
        callback(new Error(`请选择${name}`));
        return;
      }
      callback();
    },
    trigger: "change",
  };
}

const rules = computed<FormRules>(() => ({
  age: [numberRule("年龄", 35, 90)],
  height: [numberRule("身高", 100, 210)],
  weight: [numberRule("体重", 30, 150)],
  ldl: [numberRule("低密度脂蛋白", ldlRange.value.min, ldlRange.value.max)],
  hypertension: [choiceRule("是否有高血压")],
  diabetes: [choiceRule("是否有糖尿病")],
  smoking: [choiceRule("是否现在吸烟")],
  location: [choiceRule("症状性狭窄部位")],
  stenosis: [choiceRule("责任血管狭窄程度")],
}));

interface RiskResult {
  R3: string;
  R6: string;
  R12: string;
  bmi: string;
  z: string;
}

const resultVisible = ref(false);
const result = ref<RiskResult | null>(null);

/** 风险分级 */
function levelOf(value: string): "low" | "mid" | "high" | "unknown" {
  const num = Number(value);
  if (Number.isNaN(num)) return "unknown";
  if (num < RISK_THRESHOLD.low) return "low";
  if (num < RISK_THRESHOLD.high) return "mid";
  return "high";
}

function levelClass(value: string): string {
  const map = {
    low: "sc-mc-green",
    mid: "sc-mc-amber",
    high: "sc-mc-danger",
    unknown: "sc-mc-neutral",
  };
  return map[levelOf(value)];
}

function levelText(value: string): string {
  const map = { low: "低风险", mid: "中风险", high: "高风险", unknown: "—" };
  return map[levelOf(value)];
}

/** 计算复发风险 */
async function handleCalc() {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
  } catch {
    ElMessage.warning("请完整填写评估信息");
    return;
  }

  const {
    age,
    height,
    weight,
    ldl,
    ldlUnit,
    hypertension,
    diabetes,
    smoking,
    location,
    stenosis,
  } = form;
  if (
    age === undefined ||
    height === undefined ||
    weight === undefined ||
    ldl === undefined ||
    hypertension === undefined ||
    diabetes === undefined ||
    smoking === undefined ||
    location === undefined ||
    stenosis === undefined
  ) {
    ElMessage.warning("请完整填写评估信息");
    return;
  }

  // BMI = 体重(kg) / 身高(m)^2
  const bmi = Number((weight / Math.pow(0.01 * height, 2)).toFixed(1));
  // LDL-C 统一换算为 mg/dl
  const ldlValue = ldlUnit === 1 ? ldl * 38.7 : ldl;

  const z =
    0.0688 * (age - 61.0081) +
    0.0478 * (bmi - 25.0343) +
    0.4437 * hypertension +
    0.0183 * (ldlValue - 120.7439) +
    0.6723 * diabetes +
    0.4582 * smoking +
    0.2707 * location +
    0.852 * stenosis;

  const toPercent = (baseline: number) =>
    (100 * (1 - Math.pow(baseline, Math.exp(z)))).toFixed(2);

  result.value = {
    R3: toPercent(BASELINE_SURVIVAL.R3),
    R6: toPercent(BASELINE_SURVIVAL.R6),
    R12: toPercent(BASELINE_SURVIVAL.R12),
    bmi: bmi.toFixed(1),
    z: z.toFixed(4),
  };
  resultVisible.value = true;
}

/** 清除数据 */
function handleReset() {
  Object.assign(form, createForm());
  result.value = null;
  formRef.value?.clearValidate();
}

/** 重新计算：关闭弹窗并回到表单 */
function handleRecalc() {
  resultVisible.value = false;
}

/** 返回模型信息 */
function goBack() {
  router.push({ name: "ModelInfo" });
}
</script>

<style scoped>
.form-unit {
  margin-left: 12px;
  font-size: 12.5px;
  color: var(--el-text-color-secondary);
}

.note-body {
  font-size: 13.5px;
  line-height: 1.75;
  color: var(--el-text-color-regular);
}

.note-body h4 {
  position: relative;
  margin: 0 0 8px;
  padding-left: 10px;
  font-size: 14px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.note-body h4::before {
  content: "";
  position: absolute;
  left: 0;
  top: 5px;
  width: 3px;
  height: 14px;
  border-radius: 2px;
  background: linear-gradient(180deg, #4558d0, #6b82f0);
}

.note-formula {
  margin: 0 0 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(69, 88, 208, 0.04);
  border: 1px dashed rgba(69, 88, 208, 0.18);
  font-family: "JetBrains Mono", monospace;
  font-size: 12.5px;
  line-height: 1.8;
  color: var(--el-text-color-primary);
  word-break: break-all;
}
</style>
