<template>
  <el-tooltip content="返回首页" placement="bottom" effect="dark" popper-class="shell-tooltip" :show-after="200">
    <div class="logo">
      <transition enter-active-class="animate__animated animate__fadeInLeft">
        <router-link :key="+collapse" class="brand" to="/screen">
          <img :src="logo" class="brand__mark" alt="" />
          <span v-if="!collapse" class="title">{{ appConfig.title }}</span>
        </router-link>
      </transition>
    </div>
  </el-tooltip>
</template>

<script lang="ts" setup>
import { appConfig } from "@/settings";
import logo from "@/assets/images/logo.svg";

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
  height: var(--navbar-height);
  background-color: $sidebar-logo-background;
}

.brand {
  display: flex;
  gap: 10px;
  align-items: center;
  width: max-content;
  height: 100%;
  text-decoration: none;

  &:focus-visible {
    outline: 1px solid #7ee7ff;
    outline-offset: 3px;
  }
}

.brand__mark {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
}

.title {
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
  color: $sidebar-logo-text-color;
}
</style>

<style lang="scss">
// 顶部布局和混合布局的特殊处理
.layout-top,
.layout-mix {
  .logo {
    background-color: transparent !important;

    .title {
      color: var(--menu-text);
    }
  }
}

// 宽屏时：openSidebar 状态下显示完整Logo+文字
.openSidebar {
  &.layout-top .layout__header-left .logo,
  &.layout-mix .layout__header-logo .logo {
    width: var(--sidebar-width);
  }
}

// 窄屏时：hideSidebar 状态下只显示Logo图标
.hideSidebar {
  &.layout-top .layout__header-left .logo,
  &.layout-mix .layout__header-logo .logo {
    width: var(--sidebar-width-collapsed);
  }

  .logo .title {
    display: none;
  }
}
</style>
