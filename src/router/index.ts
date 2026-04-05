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

  // 隐藏的辅助路由（Dashboard / 错误页）
  {
    path: "/",
    component: Layout,
    redirect: "/random",
    meta: { hidden: true },
    children: [
      {
        path: "dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        name: "Dashboard",
        meta: { title: "dashboard", icon: "homepage", hidden: true },
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
  // 业务路由
  // ============================================

  // 随机分组（原首页位置，作为第一个可见菜单）
  {
    path: "/random",
    component: Layout,
    redirect: "/random/simple",
    name: "Random",
    meta: { title: "随机分组", icon: "el-icon-Switch", alwaysShow: true },
    children: [
      {
        path: "simple",
        component: () => import("@/views/random/simple.vue"),
        name: "RandomSimple",
        meta: { title: "简单随机", keepAlive: true },
      },
      {
        path: "block",
        component: () => import("@/views/random/block.vue"),
        name: "RandomBlock",
        meta: { title: "区组随机", keepAlive: true },
      },
      {
        path: "stratified-block",
        component: () => import("@/views/random/stratified-block.vue"),
        name: "RandomStratifiedBlock",
        meta: { title: "分层区组随机", keepAlive: true },
      },
      {
        path: "minimization",
        component: () => import("@/views/random/minimization.vue"),
        name: "RandomMinimization",
        meta: { title: "最小化随机", keepAlive: true },
      },
      {
        path: "select",
        component: () => import("@/views/random/select.vue"),
        name: "RandomSelect",
        meta: { title: "随机选择", keepAlive: true },
      },
    ],
  },

  // 样本量计算
  {
    path: "/sample-calc",
    component: Layout,
    redirect: "/sample-calc/two-means",
    name: "SampleCalc",
    meta: { title: "样本量计算", icon: "el-icon-DataAnalysis", alwaysShow: true },
    children: [
      {
        path: "two-means",
        component: () => import("@/views/sample-calc/two-means.vue"),
        name: "TwoMeans",
        meta: { title: "两独立样本均值比较", keepAlive: true },
      },
      {
        path: "two-proportions",
        component: () => import("@/views/sample-calc/two-proportions.vue"),
        name: "TwoProportions",
        meta: { title: "两独立样本率比较", keepAlive: true },
      },
      {
        path: "logrank",
        component: () => import("@/views/sample-calc/logrank.vue"),
        name: "LogRank",
        meta: { title: "生存分析LogRank检验", keepAlive: true },
      },
      {
        path: "non-inferiority",
        component: () => import("@/views/sample-calc/non-inferiority.vue"),
        name: "NonInferiority",
        meta: { title: "非劣效性设计两样本率", keepAlive: true },
      },
      {
        path: "diagnostic",
        component: () => import("@/views/sample-calc/diagnostic.vue"),
        name: "Diagnostic",
        meta: { title: "诊断试验灵敏度与特异度", keepAlive: true },
      },
      {
        path: "paired",
        component: () => import("@/views/sample-calc/paired.vue"),
        name: "Paired",
        meta: { title: "配对设计均数/率", keepAlive: true },
      },
    ],
  },

  // 医学统计
  {
    path: "/medical-stats",
    component: Layout,
    redirect: "/medical-stats/index",
    name: "MedicalStats",
    meta: { title: "医学统计", icon: "el-icon-PieChart" },
    children: [
      {
        path: "index",
        component: () => import("@/views/medical-stats/index.vue"),
        name: "MedicalStatsIndex",
        meta: { title: "医学统计", keepAlive: true },
      },
    ],
  },

  // 医学统计AI
  {
    path: "/medical-stats-ai",
    component: Layout,
    redirect: "/medical-stats-ai/index",
    name: "MedicalStatsAI",
    meta: { title: "医学统计AI", icon: "el-icon-MagicStick" },
    children: [
      {
        path: "index",
        component: () => import("@/views/medical-stats-ai/index.vue"),
        name: "MedicalStatsAIIndex",
        meta: { title: "医学统计AI", keepAlive: true },
      },
    ],
  },

  // 我的数据
  {
    path: "/my-data",
    component: Layout,
    redirect: "/my-data/index",
    name: "MyData",
    meta: { title: "我的数据", icon: "el-icon-FolderOpened" },
    children: [
      {
        path: "index",
        component: () => import("@/views/my-data/index.vue"),
        name: "MyDataIndex",
        meta: { title: "我的数据", keepAlive: true },
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
