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
    path: "/screen",
    name: "SafetyScreen",
    component: () => import("@/views/screen/index.vue"),
    meta: { hidden: true, title: "安全监控大屏" },
  },

  {
    path: "/",
    name: "/",
    component: Layout,
    redirect: "/screen",
    meta: { hidden: true },
    children: [
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

  {
    path: "/dashboard",
    redirect: "/monitor/map",
    meta: { hidden: true },
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
    meta: { title: "监控预警", icon: "nav-monitor" },
    children: [
      {
        path: "map",
        component: () => import("@/views/monitor/map.vue"),
        name: "MonitorMap",
        meta: { title: "地图监控", icon: "nav-location", affix: true, keepAlive: true },
      },
      {
        path: "vehicle-list",
        component: () => import("@/views/monitor/vehicle-list.vue"),
        name: "MonitorVehicleList",
        meta: { title: "车辆监控", icon: "nav-vehicle", keepAlive: true },
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
        path: "heatmap",
        component: () => import("@/views/monitor/heatmap.vue"),
        name: "MonitorHeatmap",
        meta: { title: "充电热力图", icon: "nav-heatmap", keepAlive: true },
      },
    ],
  },

  // 告警管理
  {
    path: "/alarm",
    component: Layout,
    redirect: "/alarm/list",
    meta: { title: "告警管理", icon: "nav-alarm", alwaysShow: true },
    children: [
      {
        path: "fault-type",
        component: () => import("@/views/catalog/index.vue"),
        name: "AlarmFaultType",
        meta: { title: "故障字典", catalog: "faultType", keepAlive: true },
      },
      {
        path: "fault-code",
        component: () => import("@/views/catalog/index.vue"),
        name: "AlarmFaultCode",
        meta: { title: "车辆故障代码", catalog: "faultCode", keepAlive: true },
      },
      {
        path: "alarm-code",
        component: () => import("@/views/catalog/index.vue"),
        name: "AlarmAlarmCode",
        meta: { title: "车辆告警代码", catalog: "alarmCode", keepAlive: true },
      },
      {
        path: "list",
        component: () => import("@/views/monitor/alarm.vue"),
        name: "MonitorAlarm",
        meta: { title: "告警列表", icon: "nav-alarm", keepAlive: true },
      },
    ],
  },

  // 基础数据
  {
    path: "/base",
    component: Layout,
    redirect: "/base/vehicle",
    meta: { title: "基础数据", icon: "nav-database" },
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

  // 字典管理
  {
    path: "/dict",
    component: Layout,
    redirect: "/dict/unit",
    meta: { title: "字典管理", icon: "el-icon-Collection", alwaysShow: true },
    children: [
      {
        path: "unit",
        component: () => import("@/views/catalog/index.vue"),
        name: "DictUnit",
        meta: { title: "单位管理", catalog: "orgUnit", keepAlive: true },
      },
      {
        path: "brand",
        component: () => import("@/views/catalog/index.vue"),
        name: "DictBrand",
        meta: { title: "车品牌管理", catalog: "vehicleBrand", keepAlive: true },
      },
      {
        path: "vehicle",
        component: () => import("@/views/dict/vehicle-info.vue"),
        name: "DictVehicleInfo",
        meta: { title: "车辆信息管理", keepAlive: true },
      },
    ],
  },

  // 设备管理
  {
    path: "/device",
    component: Layout,
    redirect: "/device/list",
    meta: { title: "设备管理", icon: "el-icon-Cpu", alwaysShow: true },
    children: [
      {
        path: "list",
        component: () => import("@/views/catalog/index.vue"),
        name: "DeviceList",
        meta: { title: "设备管理", catalog: "device", keepAlive: true },
      },
      {
        path: "protocol",
        component: () => import("@/views/catalog/index.vue"),
        name: "DeviceProtocol",
        meta: { title: "协议管理", catalog: "protocol", keepAlive: true },
      },
    ],
  },

  // 授权管理
  {
    path: "/system",
    component: Layout,
    redirect: "/system/user",
    meta: { title: "授权管理", icon: "el-icon-user", alwaysShow: true },
    children: [
      {
        path: "user",
        component: () => import("@/views/system/user.vue"),
        name: "SystemUser",
        meta: { title: "用户管理", icon: "nav-user", keepAlive: true },
      },
      {
        path: "role",
        component: () => import("@/views/catalog/index.vue"),
        name: "SystemRole",
        meta: { title: "用户角色", catalog: "role", keepAlive: true },
      },
      {
        path: "role-level",
        component: () => import("@/views/catalog/index.vue"),
        name: "SystemRoleLevel",
        meta: { title: "角色级别", catalog: "roleLevel", keepAlive: true },
      },
      {
        path: "grant",
        component: () => import("@/views/system/grant.vue"),
        name: "SystemGrant",
        meta: { title: "资源授权", keepAlive: true },
      },
      {
        path: "resource",
        component: () => import("@/views/system/resource.vue"),
        name: "SystemResource",
        meta: { title: "系统资源", keepAlive: true },
      },
    ],
  },

  // 报告信息
  {
    path: "/report",
    component: Layout,
    redirect: "/report/center",
    meta: { title: "报告信息", icon: "nav-report", alwaysShow: true },
    children: [
      {
        path: "center",
        component: () => import("@/views/report/index.vue"),
        name: "ReportCenter",
        meta: { title: "运行报告", icon: "nav-report", keepAlive: true },
      },
      {
        path: "simple",
        component: () => import("@/views/catalog/index.vue"),
        name: "ReportSimple",
        meta: { title: "简单报告", catalog: "simpleReport", keepAlive: true },
      },
      {
        path: "charge",
        component: () => import("@/views/catalog/index.vue"),
        name: "ReportCharge",
        meta: { title: "充电报告", catalog: "chargeReport", keepAlive: true },
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
