/**
 * 电动车辆安全监控平台 - 基础数据 / 授权 / 报告 Mock
 */

import type { BatteryType, BmsVendor, PlatformUser, PushRecord, Report, TerminalType } from "@/types/api/monitor";
import { COMPANIES, NETWORK_TYPES, SATELLITE_TYPES } from "@/constants/monitor";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** 终端类型列表 */
const TERMINALS: TerminalType[] = [
  { id: 1, name: "工业级 4G 车载终端", version: "V2.3.1", networkType: "4G Cat.1", satelliteType: "单北斗", bmsVersion: "GB/T 32960", bmsVendor: "宁德时代", sendCycle: 5, fileBlockSize: 1024 },
  { id: 2, name: "T-Box 标准终端", version: "V1.8.0", networkType: "4G", satelliteType: "GPS+北斗", bmsVersion: "GB/T 32960", bmsVendor: "国轩高科", sendCycle: 10, fileBlockSize: 2048 },
  { id: 3, name: "OBD 数据采集终端", version: "V3.0.2", networkType: "4G Cat.1", satelliteType: "单北斗", bmsVersion: "OBD-II PID", bmsVendor: "通用", sendCycle: 5, fileBlockSize: 512 },
  { id: 4, name: "5G 车载智能终端", version: "V1.0.5", networkType: "5G", satelliteType: "GPS+北斗", bmsVersion: "GB/T 32960", bmsVendor: "亿纬锂能", sendCycle: 3, fileBlockSize: 4096 },
];

/** 电池类型列表 */
const BATTERIES: BatteryType[] = [
  { id: 1, type: "磷酸铁锂", capacity: 180, chargeVoltage: 640, vendor: "宁德时代", batteryCode: "CATL-LFP-180", bmsCode: "BMS-CATL-01", totalVoltage: 537.6, groupNumber: 10, produceDate: "2023-05-12" },
  { id: 2, type: "三元锂", capacity: 200, chargeVoltage: 400, vendor: "国轩高科", batteryCode: "GX-TRM-200", bmsCode: "BMS-GX-02", totalVoltage: 352, groupNumber: 8, produceDate: "2023-08-20" },
  { id: 3, type: "钛酸锂", capacity: 80, chargeVoltage: 300, vendor: "亿纬锂能", batteryCode: "EVE-TIO-80", bmsCode: "BMS-EVE-03", totalVoltage: 276, groupNumber: 6, produceDate: "2024-01-15" },
  { id: 4, type: "磷酸铁锂", capacity: 300, chargeVoltage: 640, vendor: "中创新航", batteryCode: "CALB-LFP-300", bmsCode: "BMS-CALB-04", totalVoltage: 640, groupNumber: 12, produceDate: "2023-11-08" },
];

/** BMS 厂家列表 */
const BMS_VENDORS: BmsVendor[] = [
  { id: 1, name: "宁德时代新能源科技股份有限公司", phone: "0593-2588000", email: "service@catl.com", address: "福建省宁德市蕉城区" },
  { id: 2, name: "国轩高科股份有限公司", phone: "0551-6573000", email: "service@gotion.com.cn", address: "安徽省合肥市包河区" },
  { id: 3, name: "亿纬锂能股份有限公司", phone: "0752-2618000", email: "service@evebattery.com", address: "广东省惠州市仲恺高新区" },
  { id: 4, name: "中创新航科技股份有限公司", phone: "0512-6688000", email: "service@calb.com.cn", address: "江苏省常州市金坛区" },
];

/** 平台用户档案列表 */
const USERS: PlatformUser[] = [
  { id: 1, unit: "首都机场股份公司", account: "admin", role: "超级管理员", dept: "信息管理部", phone: "13800138000", email: "admin@cia.com.cn", available: true, superUser: true, online: true, lastOnlineTime: "2026-10-29 09:30:00", loginTime: "2026-10-29 09:00:00", loginDevice: "Chrome/Windows", loginIp: "10.20.1.12", loginPort: 443, loginCount: 328, loginLocation: "北京市朝阳区" },
  { id: 2, unit: "首都机场股份公司", account: "safety", role: "安全监管员", dept: "安全监察部", phone: "13800138001", email: "safety@cia.com.cn", available: true, superUser: false, online: true, lastOnlineTime: "2026-10-29 09:20:00", loginTime: "2026-10-29 08:50:00", loginDevice: "Chrome/Windows", loginIp: "10.20.1.20", loginPort: 443, loginCount: 156, loginLocation: "北京市顺义区" },
  { id: 3, unit: "地服公司", account: "dispatch", role: "运营调度员", dept: "运行调度中心", phone: "13800138002", email: "dispatch@ghd.com", available: true, superUser: false, online: false, lastOnlineTime: "2026-10-28 18:40:00", loginTime: "2026-10-28 18:00:00", loginDevice: "Safari/macOS", loginIp: "10.20.2.30", loginPort: 443, loginCount: 89, loginLocation: "北京市顺义区" },
  { id: 4, unit: "机务工程部", account: "repair", role: "维修技师", dept: "机务维修队", phone: "13800138003", email: "repair@cia.com.cn", available: true, superUser: false, online: false, lastOnlineTime: "2026-10-27 17:10:00", loginTime: "2026-10-27 17:00:00", loginDevice: "App/Android", loginIp: "10.20.3.8", loginPort: 443, loginCount: 45, loginLocation: "北京市顺义区" },
  { id: 5, unit: "动力能源公司", account: "energy", role: "企业领导", dept: "能源管理部", phone: "13800138004", email: "energy@cia.com.cn", available: false, superUser: false, online: false, lastOnlineTime: "2026-10-20 10:00:00", loginTime: "2026-10-20 09:40:00", loginDevice: "Edge/Windows", loginIp: "10.20.4.5", loginPort: 443, loginCount: 12, loginLocation: "北京市朝阳区" },
];

/** 报告列表 */
const REPORTS: Report[] = [
  { id: 1, type: "周报", title: "新能源汽车运行监控周报（2026-10-19 ~ 10-25）", period: "2026 第 43 周", generateTime: "2026-10-26 12:00:00", summary: "本周全场车辆在线率 92.3%，故障总数 45 起，环比下降 8%，无高危报警。", fileType: "PDF + Excel" },
  { id: 2, type: "月报", title: "新能源汽车运行监控月报（2026-09）", period: "2026 年 9 月", generateTime: "2026-10-05 09:00:00", summary: "9 月总充电量 560 万 kWh，碳减排 3600 吨，车辆可用率 98.1%，提出充电策略优化建议 3 条。", fileType: "PDF" },
  { id: 3, type: "半年报", title: "新能源汽车运行监控半年报（2026 上半年）", period: "2026 年 1-6 月", generateTime: "2026-07-05 09:00:00", summary: "上半年累计行驶里程 2.1 亿公里，平均能耗 0.18 kWh/km，资产健康度评分 91 分。", fileType: "PDF" },
  { id: 4, type: "年报", title: "新能源汽车运行监控年报（2025）", period: "2025 年", generateTime: "2026-01-10 09:00:00", summary: "全年碳减排 4.2 万吨，车辆接入率 100%，平台可用性 99.99%。", fileType: "PDF" },
  { id: 5, type: "故障统计周报", title: "电动车辆故障统计分析周报（2026-10-19 ~ 10-25）", period: "2026 第 43 周", generateTime: "2026-10-26 12:00:00", summary: "TOP 故障类型：电池温度异常 18 起、通信中断 12 起、绝缘故障 8 起。", fileType: "PDF + Excel" },
  { id: 6, type: "接入统计周报", title: "车辆接入情况统计分析周报（2026-10-19 ~ 10-25）", period: "2026 第 43 周", generateTime: "2026-10-26 12:00:00", summary: "本周新增接入 12 辆，累计接入 1936 辆，接入率 100%，数据完整率 98.5%。", fileType: "PDF + Excel" },
  { id: 7, type: "高危报警专项", title: "高危报警专项分析报告（车辆 JD1023 电池温差超限）", period: "2026-10-22", generateTime: "2026-10-23 15:00:00", summary: "车辆 JD1023 单体温差 18℃ 触发高危报警，经排查为 BMS 温度传感器漂移，已安排更换。", fileType: "PDF" },
  { id: 8, type: "车辆信息核查月报", title: "车辆信息核查管理月报（2026-10）", period: "2026 年 10 月", generateTime: "2026-10-29 09:00:00", summary: "本月信息完整率 99.2%，发现重复 VIN 2 条，已下发整改通知。", fileType: "PDF" },
];

/** 推送记录列表 */
const PUSH_RECORDS: PushRecord[] = [
  { id: 1, time: "2026-10-29 09:12:00", plateNumber: "京A·23456", channel: "短信", type: "故障告警", content: "车辆 JD1023 发生电池温差超限告警", status: "已送达" },
  { id: 2, time: "2026-10-29 09:05:00", plateNumber: "京A·56789", channel: "微信小程序", type: "满电提示", content: "车辆 JD1105 已充满电，SOC 100%", status: "已送达" },
  { id: 3, time: "2026-10-29 08:40:00", plateNumber: "京A·34567", channel: "站内信", type: "故障告警", content: "车辆 JD1078 发生绝缘故障告警", status: "已送达" },
  { id: 4, time: "2026-10-29 08:12:00", plateNumber: "京A·89012", channel: "短信", type: "故障告警", content: "车辆 JD1099 发生 SOC 跳变告警", status: "失败" },
  { id: 5, time: "2026-10-28 23:50:00", plateNumber: "京A·12345", channel: "微信小程序", type: "满电提示", content: "车辆 JD1011 已充满电，SOC 100%", status: "已送达" },
];

function filterBy<T extends Record<string, any>>(list: T[], params: Record<string, any>): T[] {
  let result = [...list];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (key === "pageIndex" || key === "pageSize") continue;
    if (typeof value === "string") {
      result = result.filter((item) => String(item[key] ?? "").includes(value));
    } else {
      result = result.filter((item) => item[key] === value);
    }
  }
  return result;
}

function paginate<T>(list: T[], params: Record<string, any>) {
  const pageNum = Number(params.pageNum ?? params.pageIndex) || 1;
  const pageSize = Number(params.pageSize) || 10;
  const total = list.length;
  const start = (pageNum - 1) * pageSize;
  return { list: list.slice(start, start + pageSize), total };
}

export function mockGetTerminals(params: any) {
  return paginate(filterBy(TERMINALS, params || {}), params || {});
}

export function mockGetBatteries(params: any) {
  return paginate(filterBy(BATTERIES, params || {}), params || {});
}

export function mockGetBmsVendors(params: any) {
  return paginate(filterBy(BMS_VENDORS, params || {}), params || {});
}

export function mockGetUsers(params: any) {
  return paginate(filterBy(USERS, params || {}), params || {});
}

export function mockGetReports(params: any) {
  return paginate(filterBy(REPORTS, params || {}), params || {});
}

export function mockGetPushRecords(params: any) {
  return paginate(filterBy(PUSH_RECORDS, params || {}), params || {});
}

export function mockGetCompanies() {
  return COMPANIES;
}

// ===== 增删改（内存操作，刷新页面后重置） =====

type AnyRecord = Record<string, any>;

function nextId(list: AnyRecord[]): number {
  return list.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

function saveEntity<T extends AnyRecord>(list: T[], data: T): T {
  const id = Number(data.id);
  if (id) {
    const idx = list.findIndex((item) => item.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...data, id };
      return list[idx];
    }
  }
  const entity = { ...data, id: nextId(list) } as T;
  list.unshift(entity);
  return entity;
}

function deleteEntities<T extends AnyRecord>(list: T[], ids: string): void {
  const idArr = ids.split(",").map(Number);
  for (let i = list.length - 1; i >= 0; i--) {
    if (idArr.includes(Number(list[i].id))) list.splice(i, 1);
  }
}

export function mockSaveTerminal(data: TerminalType) {
  return saveEntity(TERMINALS, data);
}
export function mockDeleteTerminals(ids: string) {
  deleteEntities(TERMINALS, ids);
}

export function mockSaveBattery(data: BatteryType) {
  return saveEntity(BATTERIES, data);
}
export function mockDeleteBatteries(ids: string) {
  deleteEntities(BATTERIES, ids);
}

export function mockSaveBmsVendor(data: BmsVendor) {
  return saveEntity(BMS_VENDORS, data);
}
export function mockDeleteBmsVendors(ids: string) {
  deleteEntities(BMS_VENDORS, ids);
}

export function mockSaveUser(data: PlatformUser) {
  return saveEntity(USERS, data);
}
export function mockDeleteUsers(ids: string) {
  deleteEntities(USERS, ids);
}
