<template>
  <div class="ref-card mb-4">
    <div class="ref-card-header">
      <div class="ref-card-icon"><div class="i-svg:el-icon-Collection" style="width:16px;height:16px" /></div>
      <span>参考文献</span>
      <span class="ref-card-count">{{ references.length }} 篇</span>
    </div>
    <div class="ref-card-body">
      <div v-for="(ref, i) in references" :key="i" class="ref-item">
        <div class="ref-num">{{ i + 1 }}</div>
        <div class="ref-content">
          <div class="ref-authors">{{ ref.authors }}</div>
          <div class="ref-title">{{ ref.title }}</div>
          <div class="ref-source">
            <span class="ref-journal">{{ ref.journal }}</span>
            <span v-if="ref.year" class="ref-year">{{ ref.year }}</span>
            <span v-if="ref.volume" class="ref-volume">{{ ref.volume }}</span>
            <el-tag v-if="ref.doi" size="small" effect="plain" class="ref-doi" @click="openDoi(ref.doi)">DOI</el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "References" });

interface Reference { authors: string; title: string; journal: string; year?: string; volume?: string; doi?: string; }

defineProps<{ references: Reference[]; }>();

function openDoi(doi: string) { if (doi) window.open(`https://doi.org/${doi}`, "_blank"); }
</script>

<style>
@import './sample-calc-shared.css';
</style>
