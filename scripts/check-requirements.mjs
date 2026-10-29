/**
 * 需求 & 功能自动化检查脚本
 *
 * 用途：
 *   1. 校验需求文档（docs/需求文档.md）与功能追踪矩阵的一致性；
 *   2. 校验每个功能点对应的「路由」是否已在 src/router/index.ts 注册；
 *   3. 校验每个功能点对应的「页面文件」是否真实存在。
 *
 * 运行方式：
 *   node scripts/check-requirements.mjs
 *
 * 退出码：0 表示全部通过，1 表示存在缺失项。
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

/** 功能追踪矩阵（与 docs/需求文档.md 第三章保持一致） */
const FEATURES = [
  { id: "F-01-01", name: "账号密码登录", route: "/login", file: "src/views/login/index.vue" },
  { id: "F-01-02", name: "双因素认证", route: "/login", file: "src/views/login/components/Login.vue" },
  { id: "F-01-03", name: "角色权限体系", route: "/system/user", file: "src/views/system/user.vue" },
  { id: "F-01-04", name: "登录安全审计", route: "/system/user", file: "src/views/system/user.vue" },
  { id: "F-02-01", name: "24 小时车辆运行热力图", route: "/dashboard", file: "src/views/dashboard/index.vue" },
  { id: "F-02-02", name: "实时充电曲线", route: "/dashboard", file: "src/views/dashboard/index.vue" },
  { id: "F-02-03", name: "核心指标卡", route: "/dashboard", file: "src/views/dashboard/index.vue" },
  { id: "F-02-04", name: "单车里程统计", route: "/dashboard", file: "src/views/dashboard/index.vue" },
  { id: "F-02-05", name: "车辆状态统计", route: "/dashboard", file: "src/views/dashboard/index.vue" },
  { id: "F-02-06", name: "车辆安全评估", route: "/dashboard", file: "src/views/dashboard/index.vue" },
  { id: "F-02-07", name: "最新告警信息", route: "/dashboard", file: "src/views/dashboard/index.vue" },
  { id: "F-03-01", name: "地图车辆位置", route: "/monitor/map", file: "src/views/monitor/map.vue" },
  { id: "F-03-02", name: "监控统计面板", route: "/monitor/map", file: "src/views/monitor/map.vue" },
  { id: "F-03-03", name: "充电热力图", route: "/monitor/heatmap", file: "src/views/monitor/heatmap.vue" },
  { id: "F-03-04", name: "车辆列表查询", route: "/monitor/vehicle-list", file: "src/views/monitor/vehicle-list.vue" },
  { id: "F-03-05", name: "单车详情", route: "/monitor/vehicle-detail", file: "src/views/monitor/vehicle-detail.vue" },
  { id: "F-03-06", name: "历史轨迹回放", route: "/monitor/track", file: "src/views/monitor/track.vue" },
  { id: "F-03-07", name: "告警管理", route: "/monitor/alarm", file: "src/views/monitor/alarm.vue" },
  { id: "F-03-08", name: "消息推送", route: "/monitor/alarm", file: "src/views/monitor/alarm.vue" },
  { id: "F-04-01", name: "车辆管理", route: "/base/vehicle", file: "src/views/base/vehicle.vue" },
  { id: "F-04-02", name: "终端类型管理", route: "/base/terminal", file: "src/views/base/terminal.vue" },
  { id: "F-04-03", name: "电池类型管理", route: "/base/battery", file: "src/views/base/battery.vue" },
  { id: "F-04-04", name: "BMS 厂家管理", route: "/base/bms", file: "src/views/base/bms.vue" },
  { id: "F-05-01", name: "用户档案管理", route: "/system/user", file: "src/views/system/user.vue" },
  { id: "F-05-02", name: "超级管理员权限", route: "/system/user", file: "src/views/system/user.vue" },
  { id: "F-06-01", name: "运行监控报告", route: "/report", file: "src/views/report/index.vue" },
  { id: "F-06-02", name: "故障统计分析周报", route: "/report", file: "src/views/report/index.vue" },
  { id: "F-06-03", name: "接入情况统计", route: "/report", file: "src/views/report/index.vue" },
  { id: "F-06-04", name: "高危报警专项报告", route: "/report", file: "src/views/report/index.vue" },
  { id: "F-06-05", name: "车辆信息核查报告", route: "/report", file: "src/views/report/index.vue" },
];

const routerSource = readFileSync(resolve(ROOT, "src/router/index.ts"), "utf8");
const reqDoc = existsSync(resolve(ROOT, "docs/需求文档.md"))
  ? readFileSync(resolve(ROOT, "docs/需求文档.md"), "utf8")
  : "";

let passCount = 0;
let failCount = 0;
const failures = [];

console.log("=".repeat(60));
console.log("  需求 & 功能自动化检查报告");
console.log("=".repeat(60));

for (const feature of FEATURES) {
  const problems = [];

  // 1. 需求文档是否记录该功能点
  if (!reqDoc.includes(feature.id)) {
    problems.push(`需求文档缺少 ${feature.id}`);
  }

  // 2. 路由是否注册
  if (!routerSource.includes(feature.route)) {
    problems.push(`路由未注册 ${feature.route}`);
  }

  // 3. 页面文件是否存在
  if (!existsSync(resolve(ROOT, feature.file))) {
    problems.push(`文件缺失 ${feature.file}`);
  }

  if (problems.length === 0) {
    passCount += 1;
    console.log(`  [PASS] ${feature.id} ${feature.name}`);
  } else {
    failCount += 1;
    failures.push({ feature, problems });
    console.log(`  [FAIL] ${feature.id} ${feature.name}`);
    problems.forEach((p) => console.log(`         - ${p}`));
  }
}

console.log("=".repeat(60));

// 反向检查：需求文档中声明的功能点是否全部在追踪矩阵中
if (reqDoc) {
  const declaredIds = [...reqDoc.matchAll(/\| (F-\d{2}-\d{2}) \|/g)].map((m) => m[1]);
  const matrixIds = new Set(FEATURES.map((f) => f.id));
  const missingInMatrix = [...new Set(declaredIds)].filter((id) => !matrixIds.has(id));
  if (missingInMatrix.length > 0) {
    console.log(`  [WARN] 需求文档声明但追踪矩阵未覆盖: ${missingInMatrix.join(", ")}`);
  }
}

console.log("");
console.log(`  总计: ${FEATURES.length} 个功能点`);
console.log(`  通过: ${passCount}`);
console.log(`  失败: ${failCount}`);
console.log("=".repeat(60));

if (failCount > 0) {
  console.log("\n  结论: 存在未完成或未对齐的功能点，请修复后重新运行本脚本。");
  process.exitCode = 1;
} else {
  console.log("\n  结论: 所有功能点均已对齐需求文档，并通过路由与文件检查。");
  process.exitCode = 0;
}
