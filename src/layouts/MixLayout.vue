<template>
  <BaseLayout>
    <!-- 动态渐变背景 -->
    <div class="mix-bg-canvas">
      <div class="mix-blob mix-blob--1" />
      <div class="mix-blob mix-blob--2" />
      <div class="mix-blob mix-blob--3" />
      <div class="mix-blob mix-blob--4" />
    </div>

    <!-- 顶部菜单栏 -->
    <div class="layout__header">
      <div class="layout__header-content">
        <div v-if="showLogo" class="layout__header-logo">
          <LayoutLogo :collapse="isLogoCollapsed" />
        </div>

        <!-- 顶部菜单 -->
        <div class="layout__header-menu">
          <el-menu
            mode="horizontal"
            :default-active="activeTopMenuPath"
            :background-color="useMenuColors ? variables['menu-background'] : undefined"
            :text-color="useMenuColors ? variables['menu-text'] : undefined"
            :active-text-color="useMenuColors ? variables['menu-active-text'] : undefined"
            @select="handleTopMenuSelect"
          >
            <el-menu-item v-for="item in topMenuItems" :key="item.path" :index="item.path">
              <template v-if="item.meta">
                <MenuIcon :icon="item.meta.icon" />
                <span v-if="item.meta.title" class="ml-1">
                  {{ translateRouteTitle(item.meta.title) }}
                </span>
              </template>
            </el-menu-item>
          </el-menu>
        </div>

        <div class="layout__header-actions">
          <LayoutToolbar />
        </div>
      </div>
    </div>

    <!-- 主内容区容器 -->
    <div class="layout__container">
      <!-- 左侧菜单栏 -->
      <div class="layout__sidebar--left" :class="{ 'layout__sidebar--collapsed': !isSidebarOpen }">
        <!-- 侧边栏模块头部 -->
        <div v-if="isSidebarOpen && activeTopMenuItem" class="layout__sidebar-head">
          <div class="layout__sidebar-head-tag">Module</div>
          <div class="layout__sidebar-head-title">
            <div class="layout__sidebar-head-icon">
              <MenuIcon :icon="activeTopMenuItem.meta?.icon" />
            </div>
            {{ translateRouteTitle(activeTopMenuItem.meta?.title || '') }}
          </div>
        </div>
        <el-scrollbar>
          <el-menu
            :default-active="activeSideMenuPath"
            :collapse="!isSidebarOpen"
            :collapse-transition="false"
            :unique-opened="false"
            :background-color="variables['menu-background']"
            :text-color="variables['menu-text']"
            :active-text-color="variables['menu-active-text']"
          >
            <LayoutSidebarItem
              v-for="item in sideMenuRoutes"
              :key="item.path"
              :item="item"
              :base-path="resolvePath(item.path)"
            />
          </el-menu>
        </el-scrollbar>
        <div class="layout__sidebar-toggle">
          <Hamburger :is-active="isSidebarOpen" @toggle-click="toggleSidebar" />
        </div>
      </div>

      <!-- 主内容区 -->
      <div :class="{ hasTagsView: showTagsView }" class="layout__main">
        <LayoutTagsView v-if="showTagsView" />
        <LayoutMain />
      </div>
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import type { LocationQueryRaw, RouteRecordRaw } from "vue-router";
import { useWindowSize } from "@vueuse/core";
import { useLayout } from "./useLayout";
import { useAppStore, usePermissionStore, useSettingsStore } from "@/store";
import { isExternal } from "@/utils/index";
import { translateRouteTitle } from "@/lang/utils";
import { SidebarColor } from "@/enums/settings";
import { ElIcon } from "element-plus";
import BaseLayout from "./BaseLayout.vue";
import LayoutLogo from "./components/LayoutLogo.vue";
import LayoutToolbar from "./components/LayoutToolbar.vue";
import LayoutTagsView from "./components/LayoutTagsView.vue";
import LayoutMain from "./components/LayoutMain.vue";
import LayoutSidebarItem from "./components/LayoutSidebarItem.vue";
import Hamburger from "@/components/Hamburger/index.vue";
import variables from "@/styles/variables.module.scss";

// 菜单图标渲染组件
const MenuIcon = defineComponent({
  props: { icon: String },
  setup(props) {
    const isElIcon = computed(() => props.icon?.startsWith("el-icon"));
    const iconName = computed(() => props.icon?.replace("el-icon-", ""));

    return () => {
      if (!props.icon) {
        return h("div", { class: "i-svg:menu" });
      }

      // Element Plus 图标
      if (isElIcon.value) {
        return h(ElIcon, null, () => h(resolveComponent(iconName.value!)));
      }

      // SVG 图标
      return h("div", { class: `i-svg:${props.icon}` });
    };
  },
});

const route = useRoute();
const router = useRouter();
const { width } = useWindowSize();

const appStore = useAppStore();
const permissionStore = usePermissionStore();
const settingsStore = useSettingsStore();

const { showTagsView, showLogo, isSidebarOpen, toggleSidebar, sideMenuRoutes, activeTopMenuPath } =
  useLayout();

const isLogoCollapsed = computed(() => width.value < 768);

// 当前激活的顶部菜单项（用于侧边栏模块头部显示）
const activeTopMenuItem = computed(() => {
  return topMenuItems.value.find((item) => item.path === activeTopMenuPath.value);
});

// 是否使用深色菜单配色（暗色主题或经典蓝侧边栏）
const useMenuColors = computed(
  () =>
    settingsStore.theme === "dark" || settingsStore.sidebarColorScheme === SidebarColor.CLASSIC_BLUE
);

// 顶部菜单项（处理单子菜单显示优化）
const topMenuItems = computed(() => {
  const routes = permissionStore.routes.filter((item) => !item.meta?.hidden);

  return routes.map((route) => {
    // alwaysShow 或无子菜单，直接返回
    if (route.meta?.alwaysShow || !route.children?.length) return route;

    // 过滤可见子菜单
    const visibleChildren = route.children.filter((child) => !child.meta?.hidden);

    // 仅一个可见子菜单时，显示子菜单信息
    if (visibleChildren.length === 1) {
      const child = visibleChildren[0];
      return {
        ...route,
        meta: {
          ...route.meta,
          title: child.meta?.title || route.meta?.title,
          icon: child.meta?.icon || route.meta?.icon,
        },
      };
    }
    return route;
  });
});

// 左侧菜单激活路径
const activeSideMenuPath = computed(() => {
  const { meta, path } = route;
  return typeof meta?.activeMenu === "string" ? meta.activeMenu : path;
});

// 解析左侧菜单路径
function resolvePath(routePath: string) {
  if (isExternal(routePath)) return routePath;
  if (routePath.startsWith("/")) return activeTopMenuPath.value + routePath;
  return `${activeTopMenuPath.value}/${routePath}`;
}

// 从路径提取顶级菜单路径
function extractTopMenuPath(path: string): string {
  return path.split("/").filter(Boolean).length > 1 ? path.match(/^\/[^/]+/)?.[0] || "/" : "/";
}

// 顶部菜单点击
function handleTopMenuSelect(menuPath: string) {
  if (menuPath === activeTopMenuPath.value) return;

  appStore.activeTopMenu(menuPath);
  permissionStore.setMixLayoutSideMenus(menuPath);
  navigateToFirstMenu(permissionStore.mixLayoutSideMenus);
}

// 导航到第一个可访问菜单
function navigateToFirstMenu(menus: RouteRecordRaw[]) {
  if (!menus.length) return;

  const [first] = menus;
  if (first.children?.length) {
    navigateToFirstMenu(first.children as RouteRecordRaw[]);
  } else if (first.name) {
    router.push({
      name: first.name,
      query:
        typeof first.meta?.params === "object"
          ? (first.meta.params as LocationQueryRaw)
          : undefined,
    });
  }
}

// 监听路由变化，同步顶部菜单状态
watch(
  () => route.path,
  (newPath) => {
    const topMenuPath = extractTopMenuPath(newPath);
    const isTopMenuChanged = topMenuPath !== activeTopMenuPath.value;

    if (isTopMenuChanged) {
      appStore.activeTopMenu(topMenuPath);
    }

    // 切换布局（如左侧 -> 混合）时，activeTopMenuPath 可能已是正确值，
    // 但 mixLayoutSideMenus 仍为空，需要补一次初始化。
    if (isTopMenuChanged || permissionStore.mixLayoutSideMenus.length === 0) {
      permissionStore.setMixLayoutSideMenus(topMenuPath);
    }
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
// ===== 动态渐变背景 =====
.mix-bg-canvas {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: var(--mix-bg-color);
  overflow: hidden;
  pointer-events: none;
}

.mix-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.6;
  animation: mixBlobMove 18s ease-in-out infinite alternate;

  &--1 {
    width: 600px;
    height: 600px;
    background: var(--mix-blob-1);
    top: -10%;
    left: -5%;
    animation-delay: 0s;
  }

  &--2 {
    width: 500px;
    height: 500px;
    background: var(--mix-blob-2);
    top: 50%;
    right: -8%;
    animation-delay: -6s;
  }

  &--3 {
    width: 450px;
    height: 450px;
    background: var(--mix-blob-3);
    bottom: -10%;
    left: 30%;
    animation-delay: -12s;
  }

  &--4 {
    width: 350px;
    height: 350px;
    background: var(--mix-blob-4);
    top: 20%;
    left: 50%;
    animation-delay: -4s;
  }
}

@keyframes mixBlobMove {
  0% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(40px, -30px) scale(1.08);
  }
  66% {
    transform: translate(-20px, 40px) scale(0.95);
  }
  100% {
    transform: translate(30px, 10px) scale(1.03);
  }
}

// ===== 布局主体 =====
.layout {
  &__header {
    position: sticky;
    top: 0;
    z-index: 999;
    width: 100%;
    height: $navbar-height;
    // 毛玻璃效果
    background: var(--mix-glass-strong);
    backdrop-filter: var(--mix-glass-blur);
    -webkit-backdrop-filter: var(--mix-glass-blur);
    border-bottom: 1px solid var(--mix-glass-border);
    box-shadow: var(--mix-header-shadow);

    // 底部渐变装饰线
    &::after {
      content: "";
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 1px;
      background: var(--mix-header-line);
    }

    &-content {
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0;
    }

    &-logo {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    &-menu {
      display: flex;
      flex: 1;
      align-items: center;
      min-width: 0;
      height: 100%;
      overflow: hidden;

      :deep(.el-menu) {
        height: 100%;
        background-color: transparent;
        border: none;
      }

      :deep(.el-menu--horizontal) {
        display: flex;
        align-items: center;
        height: 100%;
        gap: 4px;

        // 顶部导航 - 胶囊样式
        .el-menu-item {
          height: 36px;
          padding: 0 18px;
          margin: 0 1px;
          line-height: 36px;
          font-size: 13.5px;
          font-weight: 500;
          border-radius: 100px;
          border-bottom: none !important;
          border: 1.5px solid transparent;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;

          &:hover:not(.is-active) {
            background-color: var(--mix-pill-hover-bg) !important;
          }

          &.is-active {
            background-color: var(--mix-pill-active-bg) !important;
            border-color: var(--mix-pill-active-border);
            font-weight: 600;
            box-shadow: var(--mix-pill-active-shadow);

            // 底部渐变短条
            &::after {
              content: "";
              position: absolute;
              bottom: -2px;
              left: 50%;
              transform: translateX(-50%);
              width: 16px;
              height: 3px;
              border-radius: 3px;
              background: var(--mix-grad);
            }
          }
        }
      }
    }

    &-actions {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      height: 100%;
      padding: 0 16px;
    }
  }

  &__container {
    display: flex;
    height: calc(100vh - $navbar-height);
    padding-top: 0;
    position: relative;
    z-index: 1;

    .layout__sidebar--left {
      position: relative;
      width: $sidebar-width;
      height: 100%;
      // 毛玻璃效果
      background: var(--mix-glass);
      backdrop-filter: var(--mix-glass-blur);
      -webkit-backdrop-filter: var(--mix-glass-blur);
      border-right: 1px solid var(--mix-glass-border);
      box-shadow: var(--mix-sidebar-shadow);
      transition: width 0.28s;
      display: flex;
      flex-direction: column;

      &.layout__sidebar--collapsed {
        width: $sidebar-width-collapsed !important;

        .layout__sidebar-head {
          display: none;
        }
      }

      :deep(.el-scrollbar) {
        flex: 1;
        min-height: 0;
      }

      :deep(.el-menu) {
        height: 100%;
        border: none;
        padding: 6px 8px;
        background-color: transparent !important;

        // 左侧菜单项统一圆角
        .el-menu-item,
        .el-sub-menu__title {
          margin: 2px 0;
          border-radius: 10px;
          position: relative;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        // hover 态
        .el-menu-item:hover,
        .el-sub-menu__title:hover {
          background-color: var(--mix-sidebar-hover-bg) !important;
        }

        // 选中态 - 左侧渐变指示条
        .el-menu-item.is-active {
          font-weight: 600;
          background-color: var(--mix-sidebar-active-bg) !important;

          &::before {
            content: "";
            position: absolute;
            left: 0;
            top: 22%;
            bottom: 22%;
            width: 3px;
            border-radius: 0 3px 3px 0;
            background: var(--mix-grad);
            box-shadow: 0 0 8px var(--mix-grad-glow);
          }
        }
      }

      // 侧边栏模块头部
      .layout__sidebar-head {
        padding: 16px 18px 12px;
        border-bottom: 1px solid var(--mix-glass-border);
        flex-shrink: 0;

        &-tag {
          font-family: "IBM Plex Mono", "Consolas", monospace;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--el-text-color-placeholder);
        }

        &-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--el-text-color-primary);
          margin-top: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        &-icon {
          width: 26px;
          height: 26px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--mix-sidebar-active-bg);
          flex-shrink: 0;

          :deep([class^="i-svg:"]) {
            width: 14px;
            height: 14px;
            color: var(--el-color-primary);
          }
        }
      }

      .layout__sidebar-toggle {
        position: relative;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 50px;
        line-height: 50px;
        background-color: transparent;
        border-top: 1px solid var(--mix-glass-border);
      }
    }

    .layout__main {
      flex: 1;
      min-width: 0;
      height: 100%;
      margin-left: 0;
      overflow-y: auto;
    }
  }
}

:deep(.mobile) {
  .layout__container {
    .layout__sidebar--left {
      position: fixed;
      top: $navbar-height;
      bottom: 0;
      left: 0;
      z-index: 1000;
      transition: transform 0.28s;
    }
  }

  &.hideSidebar {
    .layout__sidebar--left {
      width: $sidebar-width !important;
      transform: translateX(-$sidebar-width);
    }
  }
}

:deep(.hasTagsView) {
  .app-main {
    height: calc(100vh - $navbar-height - $tags-view-height) !important;
  }
}
</style>
