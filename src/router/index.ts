import type { App } from "vue";
import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";

export const Layout = () => import("@/layouts/index.vue");

// 静态路由
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: "/redirect/:path(.*)",
        component: () => import("@/views/redirect/index.vue"),
      },
    ],
  },

  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: { hidden: true },
  },

  {
    path: "/",
    name: "/",
    component: Layout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        name: "Dashboard",
        meta: {
          title: "dashboard",
          icon: "homepage",
          affix: true,
          keepAlive: true,
        },
      },
      {
        path: "401",
        component: () => import("@/views/error/401.vue"),
        meta: { hidden: true },
      },
      {
        path: "404",
        component: () => import("@/views/error/404.vue"),
        meta: { hidden: true },
      },
    ],
  },

  // ============================================
  // 业务路由（isRemoteRoute=false 时随 constantRoutes 一起加载；
  // isRemoteRoute=true 时由后端菜单动态生成）
  // ============================================

  // 监控预警
  {
    path: "/monitor",
    component: Layout,
    redirect: "/monitor/map",
    meta: { title: "监控预警", icon: "el-icon-monitor" },
    children: [
      {
        path: "map",
        component: () => import("@/views/monitor/map.vue"),
        name: "MonitorMap",
        meta: { title: "地图监控", icon: "el-icon-location", keepAlive: true },
      },
      {
        path: "vehicle-list",
        component: () => import("@/views/monitor/vehicle-list.vue"),
        name: "MonitorVehicleList",
        meta: { title: "车辆列表", icon: "el-icon-van", keepAlive: true },
      },
      {
        path: "vehicle-detail",
        component: () => import("@/views/monitor/vehicle-detail.vue"),
        name: "MonitorVehicleDetail",
        meta: { title: "单车详情", hidden: true, activeMenu: "/monitor/vehicle-list" },
      },
      {
        path: "track",
        component: () => import("@/views/monitor/track.vue"),
        name: "MonitorTrack",
        meta: { title: "历史轨迹", hidden: true, activeMenu: "/monitor/vehicle-list" },
      },
      {
        path: "alarm",
        component: () => import("@/views/monitor/alarm.vue"),
        name: "MonitorAlarm",
        meta: { title: "告警管理", icon: "el-icon-bell", keepAlive: true },
      },
      {
        path: "heatmap",
        component: () => import("@/views/monitor/heatmap.vue"),
        name: "MonitorHeatmap",
        meta: { title: "充电热力图", icon: "el-icon-data-analysis", keepAlive: true },
      },
    ],
  },

  // 基础数据
  {
    path: "/base",
    component: Layout,
    redirect: "/base/vehicle",
    meta: { title: "基础数据", icon: "el-icon-collection" },
    children: [
      {
        path: "vehicle",
        component: () => import("@/views/base/vehicle.vue"),
        name: "BaseVehicle",
        meta: { title: "车辆管理", icon: "el-icon-van", keepAlive: true },
      },
      {
        path: "terminal",
        component: () => import("@/views/base/terminal.vue"),
        name: "BaseTerminal",
        meta: { title: "终端类型管理", icon: "el-icon-cpu", keepAlive: true },
      },
      {
        path: "battery",
        component: () => import("@/views/base/battery.vue"),
        name: "BaseBattery",
        meta: { title: "电池类型管理", icon: "el-icon-lightning", keepAlive: true },
      },
      {
        path: "bms",
        component: () => import("@/views/base/bms.vue"),
        name: "BaseBms",
        meta: { title: "BMS厂家管理", icon: "el-icon-office-building", keepAlive: true },
      },
    ],
  },

  // 授权管理
  {
    path: "/system",
    component: Layout,
    redirect: "/system/user",
    meta: { title: "授权管理", icon: "el-icon-user" },
    children: [
      {
        path: "user",
        component: () => import("@/views/system/user.vue"),
        name: "SystemUser",
        meta: { title: "用户管理", icon: "el-icon-user", keepAlive: true },
      },
    ],
  },

  // 报告中心
  {
    path: "/report",
    component: Layout,
    meta: { title: "报告中心", icon: "el-icon-document" },
    children: [
      {
        path: "",
        component: () => import("@/views/report/index.vue"),
        name: "ReportCenter",
        meta: { title: "报告中心", icon: "el-icon-document", keepAlive: true },
      },
    ],
  },
];

/**
 * 创建路由
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// 全局注册 router
export function setupRouter(app: App<Element>) {
  app.use(router);
}

export default router;
