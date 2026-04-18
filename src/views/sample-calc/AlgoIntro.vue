<template>
  <div class="intro-section mb-4">
    <!-- 页头 Hero -->
    <div class="page-hero mb-4">
      <div class="hero-text">
        <h1 class="hero-title">{{ title }}</h1>
        <p class="hero-desc">{{ heroDesc }}</p>
      </div>
      <el-tag class="hero-tag" effect="plain" size="large" round>{{ heroTag }}</el-tag>
      <div class="hero-watermark">{{ watermark }}</div>
    </div>

    <!-- 算法介绍 + 参数介绍 -->
    <el-row :gutter="16" class="mb-4" style="align-items:stretch">
      <el-col :lg="16" :xs="24">
        <div class="algo-card">
          <div class="algo-card-header">
            <div class="algo-card-icon"><div class="i-svg:el-icon-Document" style="width:16px;height:16px" /></div>
            <span>算法介绍</span>
          </div>
          <div class="algo-body">
            <h3>{{ title }}</h3>
            <h4>算法定义</h4>
            <p v-for="(p, i) in definition" :key="'d'+i" v-html="p" />
            <h4>适用场景</h4>
            <ul>
              <li v-for="(s, i) in scenarios" :key="'s'+i" v-html="s" />
            </ul>
            <h4>方法特点</h4>
            <ul>
              <li v-for="(f, i) in features" :key="'f'+i" v-html="f" />
            </ul>
          </div>
        </div>
      </el-col>
      <el-col :lg="8" :xs="24">
        <div class="param-sidebar">
          <div class="param-sidebar-header">
            <div class="param-sidebar-icon"><div class="i-svg:el-icon-InfoFilled" style="width:14px;height:14px;color:var(--el-color-primary)" /></div>
            <span>核心参数</span>
          </div>
          <div class="param-sidebar-list">
            <div v-for="(p, i) in params" :key="p.title" class="param-sidebar-item">
              <div class="param-sidebar-num">{{ String(i + 1).padStart(2, '0') }}</div>
              <div>
                <div class="param-sidebar-name">{{ p.title }}</div>
                <div class="param-sidebar-desc">{{ p.desc }}</div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "AlgoIntro" });

interface ParamItem { title: string; desc: string; }

defineProps<{
  title: string;
  heroDesc: string;
  heroTag: string;
  watermark: string;
  definition: string[];
  scenarios: string[];
  features: string[];
  params: ParamItem[];
}>();
</script>

<style>
@import './sample-calc-shared.css';
</style>

