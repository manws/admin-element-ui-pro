<template>
  <div class="logo">
    <router-link :key="+collapse" class="logo-link" to="/">
      <!-- 图标 -->
      <div class="logo-mark">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12h4l3-9 4 18 3-9h4" />
        </svg>
      </div>
      <!-- 文字 -->
      <div v-if="!collapse" class="logo-text">
        <div class="logo-name">宣海科技</div>
        <div class="logo-sub">Medical Statistics Platform</div>
      </div>
    </router-link>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  collapse: {
    type: Boolean,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.logo {
  width: 100%;
  height: $navbar-height;
  background-color: $sidebar-logo-background;

  .logo-link {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 0 12px;
    text-decoration: none;
    gap: 10px;
  }

  .logo-mark {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.08), rgba(8, 145, 178, 0.06));
    border: 1px solid rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.12);
    flex-shrink: 0;

    svg {
      width: 18px;
      height: 18px;
      color: var(--el-color-primary);
    }
  }

  .logo-text {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
    flex-shrink: 0;
  }

  .logo-name {
    font-size: 15px;
    font-weight: 700;
    color: $sidebar-logo-text-color;
    letter-spacing: 0.02em;
    line-height: 1.2;
  }

  .logo-sub {
    font-size: 10px;
    color: var(--el-text-color-placeholder);
    letter-spacing: 0.03em;
    line-height: 1.2;
  }
}
</style>

<style lang="scss">
// 顶部布局和混合布局的特殊处理
.layout-top,
.layout-mix {
  .logo {
    background-color: transparent !important;

    .logo-name {
      color: var(--el-text-color-primary);
    }
  }
}

// 经典蓝侧边栏 — Logo 白色适配
html.sidebar-color-blue {
  .layout-mix .logo,
  .layout-top .logo {
    .logo-mark {
      background: rgba(255, 255, 255, 0.15) !important;
      border-color: rgba(255, 255, 255, 0.2) !important;

      svg {
        color: #fff !important;
      }
    }

    .logo-name {
      color: #fff !important;
    }

    .logo-sub {
      color: rgba(255, 255, 255, 0.55) !important;
    }
  }
}

// 宽屏时：openSidebar 状态下显示完整Logo+文字
.openSidebar {
  &.layout-top .layout__header-left .logo,
  &.layout-mix .layout__header-logo .logo {
    width: $sidebar-width;
  }
}

// 窄屏时：hideSidebar 状态下只显示Logo图标
.hideSidebar {
  &.layout-top .layout__header-left .logo,
  &.layout-mix .layout__header-logo .logo {
    width: $sidebar-width-collapsed;
  }

  .logo .logo-text {
    display: none;
  }
}
</style>
