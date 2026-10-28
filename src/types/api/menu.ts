/**
 * Menu 路由类型定义
 */

/** 路由对象 */
export interface RouteItem {
  /** 子路由列表 */
  children: RouteItem[];
  /** 组件路径 */
  component?: string;
  /** 路由名称 */
  name?: string;
  /** 路由路径 */
  path?: string;
  /** 路由属性 */
  meta?: Meta;
  /** 跳转链接 */
  redirect?: string;
}

/** 路由属性 */
export interface Meta {
  /** 【目录】只有一个子路由是否始终显示 */
  alwaysShow?: boolean;
  /** 是否隐藏(true-是 false-否) */
  hidden?: boolean;
  /** ICON */
  icon?: string;
  /** 【菜单】是否开启页面缓存 */
  keepAlive?: boolean;
  /** 路由参数 */
  params?: Record<string, any>;
  /** 角色集合 */
  roles?: string[];
  /** 路由title */
  title?: string;
}
