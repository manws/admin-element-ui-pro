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

    <!-- 用户菜单（已登录） -->
    <div v-if="isLoggedIn" class="navbar-actions__item">
      <el-dropdown trigger="click">
        <div class="user-profile">
          <el-avatar :size="28" :src="userStore.userInfo.avatar">
            <el-icon :size="16"><User /></el-icon>
          </el-avatar>
          <span class="user-profile__name">{{
            userStore.userInfo.userName || userStore.userInfo.userCode || "用户"
          }}</span>
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

    <!-- 未登录头像（点击打开登录弹框） -->
    <div v-else class="navbar-actions__item" @click="openLogin">
      <div class="user-profile user-profile--guest">
        <div class="guest-avatar">
          <svg viewBox="0 0 36 36" class="guest-avatar__svg" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="guest-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#e8efff" />
                <stop offset="100%" stop-color="#d0dcff" />
              </linearGradient>
              <linearGradient id="guest-fg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#6b82f0" />
                <stop offset="100%" stop-color="#4558d0" />
              </linearGradient>
            </defs>
            <circle cx="18" cy="18" r="18" fill="url(#guest-bg)" />
            <circle cx="18" cy="14" r="5.5" fill="url(#guest-fg)" />
            <path d="M6.5 32 C 8 24 12.5 21 18 21 C 23.5 21 28 24 29.5 32 Z" fill="url(#guest-fg)" />
          </svg>
          <span class="guest-avatar__dot" />
        </div>
        <span class="user-profile__name">未登录</span>
      </div>
    </div>

    <!-- 系统设置 -->
    <div
      v-if="defaults.showSettings"
      class="navbar-actions__item"
      @click="handleSettingsClick"
    >
      <div class="i-svg:setting" />
    </div>

    <!-- 登录弹框 -->
    <LoginDialog v-model="loginDialogVisible" @success="handleLoginSuccess" />

    <!-- Token 失效提示弹框 -->
    <el-dialog
      v-model="tokenExpiredDialogVisible"
      title="登录已过期"
      width="380"
      align-center
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="token-expired-body">
        <el-icon class="token-expired-icon" :size="22"><WarningFilled /></el-icon>
        <span>{{ tokenExpiredMessage }}</span>
      </div>
      <template #footer>
        <el-button type="primary" @click="handleTokenExpiredConfirm">确认</el-button>
      </template>
    </el-dialog>
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
import { useAppStore, useSettingsStore, useUserStore, usePermissionStore } from "@/store";
import {
  loginDialogVisible,
  tokenExpiredDialogVisible,
  tokenExpiredMessage,
} from "@/utils/auth-events";

// 导入子组件
import CommandPalette from "@/components/CommandPalette/index.vue";
import Fullscreen from "@/components/Fullscreen/index.vue";
import SizeSelect from "@/components/SizeSelect/index.vue";
import LangSelect from "@/components/LangSelect/index.vue";
import LoginDialog from "@/components/LoginDialog/index.vue";

const { t } = useI18n();
const appStore = useAppStore();
const settingStore = useSettingsStore();
const userStore = useUserStore();
const permissionStore = usePermissionStore();

const route = useRoute();
const router = useRouter();

// 登录态（响应式）— 用 userInfo.userId 判断，登录成功后该字段变化会触发 UI 刷新
const isLoggedIn = computed(() => !!userStore.userInfo?.userId);

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
      // 登出后刷新路由状态，让菜单回到"游客"视角
      permissionStore.resetRouter();
      router.replace("/").catch(() => {});
      // 触发重新生成路由
      setTimeout(() => {
        permissionStore.generateRoutes().catch(() => {});
      }, 0);
    });
  });
}

/**
 * 打开登录弹框
 */
function openLogin() {
  loginDialogVisible.value = true;
}

/**
 * 登录成功回调：若当前在登录页则跳首页
 */
function handleLoginSuccess() {
  if (route.path === "/login") {
    router.replace("/").catch(() => {});
  }
}

/**
 * Token 失效弹框确认：清理认证态 + 重置路由 + 回首页
 */
async function handleTokenExpiredConfirm() {
  await userStore.resetAllState();
  tokenExpiredDialogVisible.value = false;
  // 重新生成路由（此时用户已登出，菜单自动进入游客视角）
  try {
    await permissionStore.generateRoutes();
  } catch {
    // ignore
  }
  // 若当前页面需要登录则回首页，否则保持当前页
  const currentPath = router.currentRoute.value.fullPath;
  const needsAuth =
    router.currentRoute.value.meta?.requiresAuth ||
    router.currentRoute.value.matched.some((m) => m.meta?.requiresAuth);
  if (needsAuth) {
    router.replace("/").catch(() => {});
  } else {
    router.replace(currentPath).catch(() => {});
  }
}

/**
 * 打开系统设置页面
 */
function handleSettingsClick() {
  settingStore.$patch({ settingsVisible: true });
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

    &__guest-avatar {
      background: color-mix(in srgb, var(--el-color-primary) 12%, transparent);
      color: var(--el-color-primary);
    }

    &--guest {
      cursor: pointer;
      transition: opacity 0.2s;

      &:hover {
        opacity: 0.85;
      }
    }

    &__name {
      margin-left: 8px;
      color: var(--el-text-color-regular);
      white-space: nowrap;
      transition: color 0.3s;
    }
  }
}

// 未登录默认头像（SVG）
.guest-avatar {
  position: relative;
  display: inline-flex;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: visible;
  box-shadow: 0 0 0 2px rgba(69, 88, 208, 0.12);
  transition: box-shadow 0.25s ease, transform 0.25s ease;

  &__svg {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: block;
  }

  &__dot {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #f59e0b;
    border: 2px solid #fff;
    box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
  }
}

.user-profile--guest:hover .guest-avatar {
  box-shadow: 0 0 0 3px rgba(69, 88, 208, 0.2);
  transform: scale(1.03);
}

// Token 失效弹框
.token-expired-body {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 4px 16px;
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
}
.token-expired-icon {
  color: var(--el-color-warning);
  flex-shrink: 0;
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
