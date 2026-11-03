#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jsonPath = path.join(root, "docs/airport-area-traced.json");
const amapPath = path.join(root, "src/utils/amap.ts");

if (!fs.existsSync(jsonPath)) {
  console.error("缺少 docs/airport-area-traced.json，请先在地图页点「同步到项目」");
  process.exit(1);
}

const points = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
if (!Array.isArray(points) || points.length < 3) {
  console.error("坐标无效");
  process.exit(1);
}

const lines = points.map((p) => `  { lng: ${p.lng}, lat: ${p.lat} },`).join("\n");
const block = `/** 首都机场飞行区（WGS84），地图圈定采集 */\nexport const AIRPORT_AREA: LngLat[] = [\n${lines}\n];`;

let src = fs.readFileSync(amapPath, "utf8");
const replaced = src.replace(
  /\/\*\* 首都机场飞行区[\s\S]*?\nexport const AIRPORT_AREA: LngLat\[\] = \[[\s\S]*?\n\];/,
  block,
);
if (replaced === src) {
  console.error("未找到 AIRPORT_AREA 定义，请手动合并");
  process.exit(1);
}
fs.writeFileSync(amapPath, replaced, "utf8");
console.log(`已写入 ${points.length} 个点到 src/utils/amap.ts`);
