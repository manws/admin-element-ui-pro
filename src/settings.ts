/**
 * 应用配置
 */

import {
  LayoutMode,
  ComponentSize,
  SidebarColor,
  ThemeMode,
  LanguageEnum,
} from "@/enums";

const env = import.meta.env;
const { pkg } = __APP_INFO__;
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

// ============================================
// 应用配置
// ============================================
export const appConfig = {
  name: pkg.name as string,
  version: pkg.version as string,
  title: (env.VITE_APP_TITLE as string) || pkg.name,

  /**
   * 是否从后端获取菜单生成路由
   *
   * - true:  调用后端接口获取菜单，动态生成路由（需要后端支持）
   * - false: 使用本地定义的 constantRoutes 中的业务路由
   */
  isRemoteRoute: false,

  // ===== 工具栏显隐配置 =====
  /** 显示搜索（命令面板） */
  showSearch: false,
  /** 显示全屏切换 */
  showFullscreen: true,
  /** 显示布局大小选择 */
  showSizeSelect: false,
  /** 显示语言选择 */
  showLangSelect: false,
} as const;

// ============================================
// 用户偏好默认值
// ============================================
export const defaults = {
  theme: prefersDark ? ThemeMode.DARK : ThemeMode.LIGHT,
  themeColor: "#4080FF",
  sidebarColorScheme: SidebarColor.CLASSIC_BLUE,
  layout: LayoutMode.MIX,
  size: ComponentSize.DEFAULT,
  language: LanguageEnum.ZH_CN,
  showTagsView: false,
  showAppLogo: true,
  showWatermark: false,
  pageSwitchingAnimation: "fade-slide",
  showSettings: true,
  watermarkContent: pkg.name,
} as const;

// ============================================
// 主题色预设
// ============================================
export const themeColorPresets = [
  "#4080FF",
  "#1890FF",
  "#409EFF",
  "#FA8C16",
  "#722ED1",
  "#13C2C2",
  "#52C41A",
  "#F5222D",
  "#2F54EB",
  "#EB2F96",
] as const;
