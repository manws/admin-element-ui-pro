<template>
  <div :class="['navbar-actions', navbarActionsClass]">
    <!-- 桌面端工具项 -->
    <template v-if="isDesktop">
      <!-- 搜索 -->
      <div v-if="appConfig.showSearch" class="navbar-actions__item">
        <CommandPalette />
      </div>

      <!-- 全屏 -->
      <div v-if="appConfig.showFullscreen" class="navbar-actions__item">
        <Fullscreen />
      </div>

      <!-- 布局大小 -->
      <div v-if="appConfig.showSizeSelect" class="navbar-actions__item">
        <SizeSelect />
      </div>

      <!-- 语言选择 -->
      <div v-if="appConfig.showLangSelect" class="navbar-actions__item">
        <LangSelect />
      </div>
    </template>

    <!-- 系统设置 -->
    <div
      v-if="defaults.showSettings"
      class="navbar-actions__item"
      @click="handleSettingsClick"
    >
      <div class="i-svg:setting" />
    </div>

    <div class="navbar-actions__item navbar-actions__notify" @click="handleNotify">
      <span class="notify-bell" aria-hidden="true">
        <svg viewBox="0 0 18 18" width="18" height="18">
          <path
            fill="currentColor"
            d="M9 1.2a5.2 5.2 0 0 0-5.2 5.2c0 1.6-.3 2.8-.8 3.7-.4.7-.2 1.4.4 1.6h11.2c.6-.2.8-.9.4-1.6-.5-.9-.8-2.1-.8-3.7A5.2 5.2 0 0 0 9 1.2Zm0 1.4a3.8 3.8 0 0 1 3.8 3.8c0 1.8.4 3.2.9 4.1H4.3c.5-.9.9-2.3.9-4.1A3.8 3.8 0 0 1 9 2.6ZM7.4 14.2a1.6 1.6 0 0 0 3.2 0H7.4Z"
          />
        </svg>
        <i class="notify-dot" />
      </span>
    </div>
    <span class="navbar-actions__divider" aria-hidden="true" />

    <!-- 用户菜单 -->
    <div class="navbar-actions__item">
      <el-dropdown trigger="click">
        <div class="user-profile">
          <el-avatar :size="26" :src="userStore.userInfo.avatar || defaultAvatar" />
          <span class="user-profile__name">{{
            userStore.userInfo.userName || userStore.userInfo.userCode || "用户"
          }}</span>
          <span class="user-profile__arrow" aria-hidden="true" />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="logout">
              {{ t("navbar.logout") }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { defaults, appConfig } from "@/settings";
import {
  DeviceEnum,
  SidebarColor,
  ThemeMode,
  LayoutMode,
} from "@/enums/settings";
import { useAppStore, useSettingsStore, useUserStore } from "@/store";
import defaultAvatar from "@/assets/images/avatar-default.svg";

// 导入子组件
import CommandPalette from "@/components/CommandPalette/index.vue";
import Fullscreen from "@/components/Fullscreen/index.vue";
import SizeSelect from "@/components/SizeSelect/index.vue";
import LangSelect from "@/components/LangSelect/index.vue";

const { t } = useI18n();
const appStore = useAppStore();
const settingStore = useSettingsStore();
const userStore = useUserStore();

const route = useRoute();
const router = useRouter();

// 是否为桌面设备
const isDesktop = computed(() => appStore.device === DeviceEnum.DESKTOP);

// 根据主题和侧边栏配色方案选择样式类
const navbarActionsClass = computed(() => {
  const { theme, sidebarColorScheme, layout } = settingStore;

  // 暗黑主题下，所有布局都使用白色文字
  if (theme === ThemeMode.DARK) {
    return "navbar-actions--white-text";
  }

  // 明亮主题下
  if (theme === ThemeMode.LIGHT) {
    // 顶部布局和混合布局的顶部区域：
    // - 如果侧边栏是经典蓝色，使用白色文字
    // - 如果侧边栏是极简白色，使用深色文字
    if (layout === LayoutMode.TOP || layout === LayoutMode.MIX) {
      if (sidebarColorScheme === SidebarColor.CLASSIC_BLUE) {
        return "navbar-actions--white-text";
      } else {
        return "navbar-actions--dark-text";
      }
    }
  }

  return "navbar-actions--dark-text";
});

/**
 * 退出登录
 */
function logout() {
  ElMessageBox.confirm("确定注销并退出系统吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
    lockScroll: false,
  }).then(() => {
    userStore.logout().then(() => {
      router.push(`/login?redirect=${route.fullPath}`);
    });
  });
}

/**
 * 打开系统设置页面
 */
function handleSettingsClick() {
  settingStore.$patch({ settingsVisible: true });
}

function handleNotify() {
  ElMessage.info("暂无新的通知");
}
</script>

<style lang="scss" scoped>
.navbar-actions {
  display: flex;
  align-items: center;
  min-height: 44px;

  &__item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 44px; /* 增加最小点击区域到44px，符合人机交互标准 */
    height: 44px;
    padding: 0 8px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;

    // 确保子元素居中
    > * {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    // 确保 Element Plus 组件可以正常工作
    :deep(.el-dropdown),
    :deep(.el-tooltip) {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 44px;
    }

    :deep(.i-svg\:language) {
      flex-shrink: 0;
      width: 18px;
      height: 18px;
      font-size: 18px;
      line-height: 18px;
      background-size: 18px 18px;
    }

    // 图标样式
    :deep([class^="i-svg:"]) {
      font-size: 18px;
      line-height: 1;
      color: var(--el-text-color-regular);
      transition: color 0.3s;
    }

    &:hover {
      background: var(--el-fill-color-light);

      :deep([class^="i-svg:"]) {
        color: var(--el-color-primary);
      }
    }
  }

  .user-profile {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 44px;
    padding: 0 8px;

    &__avatar {
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      border-radius: 50%;
    }

    &__name {
      margin-left: 8px;
      color: var(--el-text-color-regular);
      white-space: nowrap;
      transition: color 0.3s;
    }
  }
}

// 白色文字样式（用于深色背景：暗黑主题、顶部布局、混合布局等）
.navbar-actions--white-text {
  .navbar-actions__item {
    :deep([class^="i-svg:"]) {
      color: color-mix(in srgb, var(--el-color-white) 85%, transparent);
    }

    &:hover {
      background: color-mix(in srgb, var(--el-color-white) 10%, transparent);

      :deep([class^="i-svg:"]) {
        color: var(--el-color-white);
      }
    }
  }

  .user-profile__name {
    color: color-mix(in srgb, var(--el-color-white) 85%, transparent);
  }
}

// 深色文字样式（用于浅色背景：明亮主题下的左侧布局等）
.navbar-actions--dark-text {
  .navbar-actions__item {
    :deep([class^="i-svg:"]) {
      color: var(--el-text-color-regular) !important;
    }

    &:hover {
      background: rgba(0, 0, 0, 0.04);

      :deep([class^="i-svg:"]) {
        color: var(--el-color-primary) !important;
      }
    }
  }

  .user-profile__name {
    color: var(--el-text-color-regular) !important;
  }
}

// 确保下拉菜单中的图标不受影响
::v-deep(.el-dropdown-menu) {
  [class^="i-svg:"] {
    color: var(--el-text-color-regular) !important;

    &:hover {
      color: var(--el-color-primary) !important;
    }
  }
}
</style>
