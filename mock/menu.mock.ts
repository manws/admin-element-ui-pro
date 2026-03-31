import { defineMock } from "./base";

export default defineMock([
  {
    url: "menus/routes",
    method: ["GET"],
    body: {
      code: "00000",
      data: [
        {
          path: "/sample-calc",
          component: "Layout",
          redirect: "/sample-calc/two-means",
          name: "/sample-calc",
          meta: {
            title: "样本量计算",
            icon: "el-icon-DataAnalysis",
            hidden: false,
            alwaysShow: true,
            params: null,
          },
          children: [
            {
              path: "two-means",
              component: "sample-calc/two-means",
              name: "TwoMeans",
              meta: { title: "两独立样本均值比较", icon: "", hidden: false, keepAlive: true, alwaysShow: false, params: null },
            },
            {
              path: "two-proportions",
              component: "sample-calc/two-proportions",
              name: "TwoProportions",
              meta: { title: "两独立样本率比较", icon: "", hidden: false, keepAlive: true, alwaysShow: false, params: null },
            },
            {
              path: "logrank",
              component: "sample-calc/logrank",
              name: "LogRank",
              meta: { title: "生存分析LogRank检验", icon: "", hidden: false, keepAlive: true, alwaysShow: false, params: null },
            },
            {
              path: "non-inferiority",
              component: "sample-calc/non-inferiority",
              name: "NonInferiority",
              meta: { title: "非劣效性设计两样本率", icon: "", hidden: false, keepAlive: true, alwaysShow: false, params: null },
            },
            {
              path: "diagnostic",
              component: "sample-calc/diagnostic",
              name: "Diagnostic",
              meta: { title: "诊断试验灵敏度与特异度", icon: "", hidden: false, keepAlive: true, alwaysShow: false, params: null },
            },
            {
              path: "paired",
              component: "sample-calc/paired",
              name: "Paired",
              meta: { title: "配对设计均数/率", icon: "", hidden: false, keepAlive: true, alwaysShow: false, params: null },
            },
          ],
        },
      ],
      msg: "一切ok",
    },
  },
]);
