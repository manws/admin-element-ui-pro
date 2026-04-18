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
        meta: { title: "简单随机", icon: "el-icon-Aim", keepAlive: true },
      },
      {
        path: "block",
        component: () => import("@/views/random/block.vue"),
        name: "RandomBlock",
        meta: { title: "区组随机", icon: "el-icon-Grid", keepAlive: true },
      },
      {
        path: "stratified-block",
        component: () => import("@/views/random/stratified-block.vue"),
        name: "RandomStratifiedBlock",
        meta: { title: "分层区组随机", icon: "el-icon-CopyDocument", keepAlive: true },
      },
      {
        path: "minimization",
        component: () => import("@/views/random/minimization.vue"),
        name: "RandomMinimization",
        meta: { title: "最小化随机", icon: "el-icon-ScaleToOriginal", keepAlive: true },
      },
      {
        path: "select",
        component: () => import("@/views/random/select.vue"),
        name: "RandomSelect",
        meta: { title: "随机选择", icon: "el-icon-Compass", keepAlive: true },
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
        meta: { title: "两独立样本均值比较", icon: "el-icon-DataLine", keepAlive: true },
      },
      {
        path: "two-proportions",
        component: () => import("@/views/sample-calc/two-proportions.vue"),
        name: "TwoProportions",
        meta: { title: "两独立样本率比较", icon: "el-icon-PieChart", keepAlive: true },
      },
      {
        path: "logrank",
        component: () => import("@/views/sample-calc/logrank.vue"),
        name: "LogRank",
        meta: { title: "生存分析LogRank检验", icon: "el-icon-Timer", keepAlive: true },
      },
      {
        path: "non-inferiority",
        component: () => import("@/views/sample-calc/non-inferiority.vue"),
        name: "NonInferiority",
        meta: { title: "非劣效性设计两样本率", icon: "el-icon-Medal", keepAlive: true },
      },
      {
        path: "diagnostic",
        component: () => import("@/views/sample-calc/diagnostic.vue"),
        name: "Diagnostic",
        meta: { title: "诊断试验灵敏度与特异度", icon: "el-icon-View", keepAlive: true },
      },
      {
        path: "paired",
        component: () => import("@/views/sample-calc/paired.vue"),
        name: "Paired",
        meta: { title: "配对设计均数/率", icon: "el-icon-Connection", keepAlive: true },
      },
    ],
  },

  // 医学统计（基本统计 + 卡方检验 作为子菜单组）
  {
    path: "/medical-stats",
    component: Layout,
    redirect: "/medical-stats/basic/descriptive",
    name: "MedicalStats",
    meta: { title: "医学统计", icon: "el-icon-PieChart", alwaysShow: true },
    children: [
      // 基本统计
      {
        path: "basic",
        component: () => import("@/views/medical-stats/layout.vue"),
        name: "BasicStats",
        meta: { title: "基本统计", icon: "el-icon-Histogram", alwaysShow: true },
        children: [
          {
            path: "descriptive",
            component: () => import("@/views/medical-stats/basic/descriptive.vue"),
            name: "Descriptive",
            meta: { title: "描述性统计量", keepAlive: true },
          },
          {
            path: "frequency",
            component: () => import("@/views/medical-stats/basic/frequency.vue"),
            name: "Frequency",
            meta: { title: "频数分布", keepAlive: true },
          },
          {
            path: "normal",
            component: () => import("@/views/medical-stats/basic/normal.vue"),
            name: "NormalDist",
            meta: { title: "正态分布", keepAlive: true },
          },
          {
            path: "binomial",
            component: () => import("@/views/medical-stats/basic/binomial.vue"),
            name: "BinomialDist",
            meta: { title: "二项分布", keepAlive: true },
          },
          {
            path: "poisson",
            component: () => import("@/views/medical-stats/basic/poisson.vue"),
            name: "PoissonDist",
            meta: { title: "Poisson分布", keepAlive: true },
          },
        ],
      },
      // 卡方检验
      {
        path: "chi-square",
        component: () => import("@/views/medical-stats/layout.vue"),
        name: "ChiSquare",
        meta: { title: "卡方检验", icon: "el-icon-Grid", alwaysShow: true },
        children: [
          {
            path: "fourfold",
            component: () => import("@/views/medical-stats/chi-square/fourfold.vue"),
            name: "Fourfold",
            meta: { title: "四格表", keepAlive: true },
          },
          {
            path: "rc-table",
            component: () => import("@/views/medical-stats/chi-square/rc-table.vue"),
            name: "RCTable",
            meta: { title: "R×C列联表", keepAlive: true },
          },
          {
            path: "paired",
            component: () => import("@/views/medical-stats/chi-square/paired.vue"),
            name: "ChiPaired",
            meta: { title: "配对资料", keepAlive: true },
          },
          {
            path: "rr-table",
            component: () => import("@/views/medical-stats/chi-square/rr-table.vue"),
            name: "RRTable",
            meta: { title: "R×R列联表", keepAlive: true },
          },
          {
            path: "fisher",
            component: () => import("@/views/medical-stats/chi-square/fisher.vue"),
            name: "FisherTest",
            meta: { title: "Fisher检验", keepAlive: true },
          },
          {
            path: "p-value",
            component: () => import("@/views/medical-stats/chi-square/p-value.vue"),
            name: "ChiPValue",
            meta: { title: "卡方P值", keepAlive: true },
          },
        ],
      },
      // t检验
      {
        path: "t-test",
        component: () => import("@/views/medical-stats/layout.vue"),
        name: "TTest",
        meta: { title: "t检验", icon: "el-icon-DataLine", alwaysShow: true },
        children: [
          { path: "one-sample", component: () => import("@/views/medical-stats/t-test/one-sample.vue"), name: "TOneSample", meta: { title: "单样本t检验", keepAlive: true } },
          { path: "one-sample-raw", component: () => import("@/views/medical-stats/t-test/one-sample-raw.vue"), name: "TOneSampleRaw", meta: { title: "单样本t检验(原始资料)", keepAlive: true } },
          { path: "paired", component: () => import("@/views/medical-stats/t-test/paired.vue"), name: "TPaired", meta: { title: "配对样本t检验", keepAlive: true } },
          { path: "independent", component: () => import("@/views/medical-stats/t-test/independent.vue"), name: "TIndependent", meta: { title: "独立样本t检验", keepAlive: true } },
          { path: "p-value", component: () => import("@/views/medical-stats/t-test/p-value.vue"), name: "TPValue", meta: { title: "t检验P值", keepAlive: true } },
        ],
      },
      // Z检验
      {
        path: "z-test",
        component: () => import("@/views/medical-stats/layout.vue"),
        name: "ZTest",
        meta: { title: "Z检验", icon: "el-icon-TrendCharts", alwaysShow: true },
        children: [
          { path: "one-sample", component: () => import("@/views/medical-stats/z-test/one-sample.vue"), name: "ZOneSample", meta: { title: "单样本Z检验", keepAlive: true } },
          { path: "one-sample-raw", component: () => import("@/views/medical-stats/z-test/one-sample-raw.vue"), name: "ZOneSampleRaw", meta: { title: "单样本Z检验(原始资料)", keepAlive: true } },
          { path: "independent", component: () => import("@/views/medical-stats/z-test/independent.vue"), name: "ZIndependent", meta: { title: "独立样本Z检验", keepAlive: true } },
          { path: "independent-raw", component: () => import("@/views/medical-stats/z-test/independent-raw.vue"), name: "ZIndependentRaw", meta: { title: "独立样本Z检验(原始资料)", keepAlive: true } },
        ],
      },
      // 秩和检验
      {
        path: "rank-sum",
        component: () => import("@/views/medical-stats/layout.vue"),
        name: "RankSum",
        meta: { title: "秩和检验", icon: "el-icon-Sort", alwaysShow: true },
        children: [
          { path: "paired", component: () => import("@/views/medical-stats/rank-sum/paired.vue"), name: "RSPaired", meta: { title: "配对样本", keepAlive: true } },
          { path: "one-sample", component: () => import("@/views/medical-stats/rank-sum/one-sample.vue"), name: "RSOneSample", meta: { title: "单样本", keepAlive: true } },
          { path: "two-sample", component: () => import("@/views/medical-stats/rank-sum/two-sample.vue"), name: "RSTwoSample", meta: { title: "两独立样本", keepAlive: true } },
          { path: "ordinal", component: () => import("@/views/medical-stats/rank-sum/ordinal.vue"), name: "RSOrdinal", meta: { title: "等级资料", keepAlive: true } },
          { path: "kruskal-wallis", component: () => import("@/views/medical-stats/rank-sum/kruskal-wallis.vue"), name: "RSKruskalWallis", meta: { title: "Kruskal-Wallis H", keepAlive: true } },
          { path: "friedman", component: () => import("@/views/medical-stats/rank-sum/friedman.vue"), name: "RSFriedman", meta: { title: "Friedman M", keepAlive: true } },
        ],
      },
      // CochranQ检验
      {
        path: "cochran-q",
        component: () => import("@/views/medical-stats/cochran-q/index.vue"),
        name: "CochranQ",
        meta: { title: "CochranQ检验", icon: "el-icon-Connection", keepAlive: true },
      },
      // 游程检验
      {
        path: "runs-test",
        component: () => import("@/views/medical-stats/layout.vue"),
        name: "RunsTest",
        meta: { title: "游程检验", icon: "el-icon-Finished", alwaysShow: true },
        children: [
          { path: "binary", component: () => import("@/views/medical-stats/runs-test/binary.vue"), name: "RunsBinary", meta: { title: "二分类变量", keepAlive: true } },
          { path: "numeric", component: () => import("@/views/medical-stats/runs-test/numeric.vue"), name: "RunsNumeric", meta: { title: "数值型变量", keepAlive: true } },
        ],
      },
      // 方差齐性检验
      {
        path: "variance-homo",
        component: () => import("@/views/medical-stats/layout.vue"),
        name: "VarianceHomo",
        meta: { title: "方差齐性检验", icon: "el-icon-Operation", alwaysShow: true },
        children: [
          { path: "f-test", component: () => import("@/views/medical-stats/variance-homo/f-test.vue"), name: "VHFTest", meta: { title: "F检验", keepAlive: true } },
          { path: "bartlett", component: () => import("@/views/medical-stats/variance-homo/bartlett.vue"), name: "VHBartlett", meta: { title: "Bartlett检验", keepAlive: true } },
          { path: "levene", component: () => import("@/views/medical-stats/variance-homo/levene.vue"), name: "VHLevene", meta: { title: "Levene检验", keepAlive: true } },
        ],
      },
      // 方差分析
      {
        path: "anova",
        component: () => import("@/views/medical-stats/layout.vue"),
        name: "ANOVA",
        meta: { title: "方差分析", icon: "el-icon-DataBoard", alwaysShow: true },
        children: [
          { path: "one-way", component: () => import("@/views/medical-stats/anova/one-way.vue"), name: "ANOVAOneWay", meta: { title: "完全随机设计", keepAlive: true } },
          { path: "randomized-block", component: () => import("@/views/medical-stats/anova/randomized-block.vue"), name: "ANOVABlock", meta: { title: "随机区组设计", keepAlive: true } },
        ],
      },
      // 回归分析
      {
        path: "regression",
        component: () => import("@/views/medical-stats/layout.vue"),
        name: "Regression",
        meta: { title: "回归分析", icon: "el-icon-SetUp", alwaysShow: true },
        children: [
          { path: "simple", component: () => import("@/views/medical-stats/regression/simple.vue"), name: "RegSimple", meta: { title: "一元线性回归", keepAlive: true } },
          { path: "multiple", component: () => import("@/views/medical-stats/regression/multiple.vue"), name: "RegMultiple", meta: { title: "多元线性回归", keepAlive: true } },
        ],
      },
      // 相关分析
      {
        path: "correlation",
        component: () => import("@/views/medical-stats/layout.vue"),
        name: "Correlation",
        meta: { title: "相关分析", icon: "el-icon-Share", alwaysShow: true },
        children: [
          { path: "pearson", component: () => import("@/views/medical-stats/correlation/pearson.vue"), name: "CorPearson", meta: { title: "Pearson直线相关", keepAlive: true } },
          { path: "spearman", component: () => import("@/views/medical-stats/correlation/spearman.vue"), name: "CorSpearman", meta: { title: "Spearman秩相关", keepAlive: true } },
          { path: "kendall", component: () => import("@/views/medical-stats/correlation/kendall.vue"), name: "CorKendall", meta: { title: "Kendall秩相关", keepAlive: true } },
        ],
      },
      // 生存分析
      {
        path: "survival",
        component: () => import("@/views/medical-stats/layout.vue"),
        name: "Survival",
        meta: { title: "生存分析", icon: "el-icon-Timer", alwaysShow: true },
        children: [
          { path: "kaplan-meier", component: () => import("@/views/medical-stats/survival/kaplan-meier.vue"), name: "KaplanMeier", meta: { title: "Kaplan-Meier", keepAlive: true } },
          { path: "life-table", component: () => import("@/views/medical-stats/survival/life-table.vue"), name: "LifeTable", meta: { title: "寿命表法", keepAlive: true } },
          { path: "compare", component: () => import("@/views/medical-stats/survival/compare.vue"), name: "SurvivalCompare", meta: { title: "生存率比较", keepAlive: true } },
        ],
      },
      // 聚类分析
      {
        path: "cluster",
        component: () => import("@/views/medical-stats/layout.vue"),
        name: "Cluster",
        meta: { title: "聚类分析", icon: "el-icon-Help", alwaysShow: true },
        children: [
          { path: "sample", component: () => import("@/views/medical-stats/cluster/sample.vue"), name: "ClusterSample", meta: { title: "样品聚类", keepAlive: true } },
          { path: "variable", component: () => import("@/views/medical-stats/cluster/variable.vue"), name: "ClusterVariable", meta: { title: "变量聚类", keepAlive: true } },
        ],
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
