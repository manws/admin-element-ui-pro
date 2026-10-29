<template>
  <div class="app-container">
    <!-- 页头 Hero -->
    <div class="page-hero mb-4">
      <div class="hero-text">
        <h1 class="hero-title">量表信息</h1>
        <p class="hero-desc">
          集中展示临床评定量表，支持按编号、中文名、英文名检索；条目与评分范围仅供参考，以量表原文为准。
        </p>
      </div>
      <el-tag class="hero-tag" effect="plain" size="large" round>SCALE</el-tag>
      <div class="hero-watermark">S</div>
    </div>

    <el-alert
      class="mb-4"
      type="warning"
      :closable="false"
      description="当前为示例数据，用于验证页面结构；正式清单与量表评分功能待业务确认后接入。"
    />

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
          @click="openScale()"
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

          <div class="ms-facts">
            <div class="ms-fact">
              <span class="ms-fact-label">条目数</span>
              <span class="ms-fact-value">{{ item.itemsCount }}</span>
            </div>
            <div class="ms-fact">
              <span class="ms-fact-label">评分范围</span>
              <span class="ms-fact-value">{{ item.scoreRange }}</span>
            </div>
          </div>

          <p class="ms-summary">{{ item.purpose }}</p>

          <div class="ms-foot">
            <span class="ms-time">更新 {{ item.updatedAt }}</span>
            <span class="ms-enter">
              {{ item.status === "available" ? "进入评分" : "敬请期待" }}
              <el-icon><ArrowRight /></el-icon>
            </span>
          </div>
        </div>
      </el-col>

      <el-col v-if="!filteredList.length" :span="24">
        <el-empty description="未找到匹配的量表" />
      </el-col>
    </el-row>

    <!-- 列表视图 -->
    <el-card v-else shadow="never">
      <el-table :data="filteredList" border stripe>
        <el-table-column prop="code" label="编号" width="110">
          <template #default="{ row }">
            <span class="ms-table-code">{{ row.code }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="nameZh"
          label="中文名称"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column
          prop="nameEn"
          label="英文名称"
          min-width="280"
          show-overflow-tooltip
        />
        <el-table-column prop="domain" label="领域" width="140" />
        <el-table-column prop="itemsCount" label="条目数" width="150" />
        <el-table-column
          prop="scoreRange"
          label="评分范围"
          width="120"
          align="center"
        />
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
        <template #empty>
          <el-empty description="未找到匹配的量表" />
        </template>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { computed, ref } from "vue";

import { SCALE_LIST } from "./scale-data";

defineOptions({ name: "ScaleInfo" });

/** 搜索关键字 */
const keyword = ref("");
/** 视图模式：card 卡片 / list 列表 */
const viewMode = ref<"card" | "list">("card");

/** 过滤后的量表列表 */
const filteredList = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) return SCALE_LIST;
  return SCALE_LIST.filter((item) =>
    [item.code, item.nameZh, item.nameEn, item.domain].some((field) =>
      field.toLowerCase().includes(kw),
    ),
  );
});

/** 量表评分功能尚未接入，仅作提示 */
function openScale() {
  ElMessage.info("量表评分功能正在建设中，敬请期待");
}
</script>
