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
  // 业务路由（isRemoteRoute=false 时随 constantRoutes 一起加载）
  // ============================================
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
