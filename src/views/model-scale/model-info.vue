<template>
  <div class="app-container">
    <!-- 页头 Hero -->
    <div class="page-hero mb-4">
      <div class="hero-text">
        <h1 class="hero-title">模型信息</h1>
        <p class="hero-desc">
          集中管理预测模型与风险评分工具，支持按编号、中文名、英文名检索；点击卡片进入模型评估。
        </p>
      </div>
      <el-tag class="hero-tag" effect="plain" size="large" round>MODEL</el-tag>
      <div class="hero-watermark">M</div>
    </div>

    <!-- 工具条：搜索 + 视图切换 -->
    <div class="ms-toolbar mb-4">
      <el-input
        v-model="keyword"
        placeholder="搜索编号 / 中文名 / 英文名"
        clearable
        class="ms-search"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-radio-group v-model="viewMode">
        <el-radio-button value="card">
          <el-icon class="mr-1"><Grid /></el-icon>卡片
        </el-radio-button>
        <el-radio-button value="list">
          <el-icon class="mr-1"><List /></el-icon>列表
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- 卡片视图 -->
    <el-row v-if="viewMode === 'card'" :gutter="16">
      <el-col
        v-for="item in filteredList"
        :key="item.code"
        :lg="8"
        :md="12"
        :xs="24"
        class="mb-4"
      >
        <div
          class="ms-card"
          :class="{ 'is-disabled': item.status !== 'available' }"
          @click="openModel(item)"
        >
          <div class="ms-head">
            <span class="ms-code">{{ item.code }}</span>
            <el-tag
              size="small"
              effect="light"
              :type="item.status === 'available' ? 'success' : 'info'"
            >
              {{ item.status === "available" ? "可用" : "建设中" }}
            </el-tag>
          </div>

          <div class="ms-name-zh">{{ item.nameZh }}</div>
          <div class="ms-name-en">{{ item.nameEn }}</div>

          <div class="ms-meta">
            <el-tag size="small" effect="plain">{{ item.domain }}</el-tag>
          </div>

          <p class="ms-summary">{{ item.summary }}</p>

          <div class="ms-meta">
            <el-tag
              v-for="o in item.outputs"
              :key="o"
              size="small"
              effect="plain"
              type="info"
            >
              {{ o }}
            </el-tag>
          </div>

          <div class="ms-foot">
            <span class="ms-time">更新 {{ item.updatedAt }}</span>
            <span class="ms-enter">
              {{ item.status === "available" ? "进入计算" : "敬请期待" }}
              <el-icon><ArrowRight /></el-icon>
            </span>
          </div>
        </div>
      </el-col>

      <el-col v-if="!filteredList.length" :span="24">
        <el-empty description="未找到匹配的模型" />
      </el-col>
    </el-row>

    <!-- 列表视图 -->
    <el-card v-else shadow="never">
      <el-table :data="filteredList" border stripe>
        <el-table-column prop="code" label="编号" width="120">
          <template #default="{ row }">
            <span class="ms-table-code">{{ row.code }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="nameZh"
          label="中文名称"
          min-width="220"
          show-overflow-tooltip
        />
        <el-table-column
          prop="nameEn"
          label="英文名称"
          min-width="300"
          show-overflow-tooltip
        />
        <el-table-column prop="domain" label="领域" width="130" />
        <el-table-column label="输出指标" min-width="200">
          <template #default="{ row }">
            <el-tag
              v-for="o in row.outputs"
              :key="o"
              size="small"
              effect="plain"
              type="info"
              class="mr-1"
            >
              {{ o }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag
              size="small"
              effect="light"
              :type="row.status === 'available' ? 'success' : 'info'"
            >
              {{ row.status === "available" ? "可用" : "建设中" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="updatedAt"
          label="更新时间"
          width="120"
          align="center"
        />
        <el-table-column label="操作" width="110" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              :disabled="row.status !== 'available'"
              @click="openModel(row)"
            >
              进入计算
            </el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="未找到匹配的模型" />
        </template>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import { MODEL_LIST, type ModelItem } from "./model-data";

defineOptions({ name: "ModelInfo" });

const router = useRouter();

/** 搜索关键字 */
const keyword = ref("");
/** 视图模式：card 卡片 / list 列表 */
const viewMode = ref<"card" | "list">("card");

/** 过滤后的模型列表 */
const filteredList = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) return MODEL_LIST;
  return MODEL_LIST.filter((item) =>
    [item.code, item.nameZh, item.nameEn, item.domain].some((field) =>
      field.toLowerCase().includes(kw),
    ),
  );
});

/** 进入模型评估页 */
function openModel(item: ModelItem) {
  if (item.status !== "available") {
    ElMessage.info("该模型正在建设中，敬请期待");
    return;
  }
  router.push({ name: "ModelEvaluation", params: { code: item.code } });
}
</script>
