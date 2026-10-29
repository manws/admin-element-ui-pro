/**
 * 电动车辆安全监控平台 - 监控数据 Mock
 */

import type {
  AlarmRecord,
  ChargeHeatPoint,
  CurvePoint,
  MotorInfo,
  OverviewStats,
  TrackPoint,
  Vehicle,
  VehicleDetail,
} from "@/types/api/monitor";
import { ALARM_WAYS, COMPANIES, FAULT_TYPES, VEHICLE_BRANDS, VEHICLE_CATEGORIES } from "@/constants/monitor";

/** 伪随机数生成器（保证数据结构稳定） */
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20261029);

/** 取值范围 */
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

/** 数值区间 */
function num(min: number, max: number, digits = 1): number {
  const v = min + rand() * (max - min);
  return Number(v.toFixed(digits));
}

/** 生成时间字符串（最近 n 分钟内） */
function recentTime(minutesAgo: number): string {
  const d = new Date(Date.now() - minutesAgo * 60 * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/** 机场区域坐标（北京首都国际机场飞行区） */
const AIRPORT = { lngMin: 116.578, lngMax: 116.622, latMin: 40.068, latMax: 40.092 };

/** 机位/区域名称 */
const POSITIONS = [
  "T1 航站楼东停机坪",
  "T2 航站楼北停机坪",
  "T3 航站楼 C 区",
  "T3 航站楼 D 区",
  "货运区停机坪",
  "远机位 N 区",
  "充电保障区",
  "机库检修区",
  "滑行道 J 段",
];

/** 生成单体车辆 */
function makeVehicle(id: number): Vehicle {
  const brand = pick(VEHICLE_BRANDS);
  const category = pick(VEHICLE_CATEGORIES);
  const online = rand() > 0.15;
  const charging = online && rand() > 0.7;
  const alarmFlag = rand() > 0.85;
  const soc = num(20, 100, 0);
  const totalMileage = num(8000, 180000, 0);
  const speed = online ? (charging ? 0 : num(0, 60, 0)) : 0;

  return {
    id,
    vehicleType: category === "摆渡车" || category === "牵引车" || category === "除冰车" ? "特种车" : "通用车",
    category,
    brand,
    model: `${brand}-${pick(["EV", "Pro", "Plus", "智享"])}${Math.floor(num(1, 9, 0))}`,
    batteryModel: `${pick(["宁德时代", "国轩高科", "亿纬锂能", "中创新航"])}-${Math.floor(num(80, 300, 0))}kWh`,
    batteryCapacity: num(60, 300, 0),
    selfNumber: `JD${String(1000 + id)}`,
    plateNumber: `京A·${String(Math.floor(num(10000, 99999, 0)))}`,
    vin: `LJ${String(16000000000000000 + id * 137)}`.slice(0, 17),
    company: pick(COMPANIES),
    monitorFlag: rand() > 0.05,
    vinCharge: rand() > 0.5,
    accessTime: `${2022 + Math.floor(num(0, 4, 0))}-${String(Math.floor(num(1, 12, 0))).padStart(2, "0")}-${String(Math.floor(num(1, 28, 0))).padStart(2, "0")}`,
    factoryTime: `${2020 + Math.floor(num(0, 6, 0))}-${String(Math.floor(num(1, 12, 0))).padStart(2, "0")}`,
    available: rand() > 0.03,
    online,
    charging,
    alarmFlag,
    soc,
    voltage: num(300, 640, 1),
    current: charging ? num(-80, -10, 1) : speed > 0 ? num(20, 120, 1) : num(0, 5, 1),
    power: num(0, 160, 1),
    speed,
    totalMileage,
    todayMileage: num(0, 200, 1),
    reportInterval: num(5, 30, 0),
    lastOnlineTime: online ? recentTime(Math.floor(num(0, 1, 0))) : recentTime(Math.floor(num(30, 720, 0))),
    lng: num(AIRPORT.lngMin, AIRPORT.lngMax, 6),
    lat: num(AIRPORT.latMin, AIRPORT.latMax, 6),
    position: pick(POSITIONS),
    safetyScore: Math.round(num(70, 100, 0)),
    cellMaxVoltage: num(3.5, 4.3, 3),
    cellMinVoltage: num(3.0, 3.6, 3),
    cellMaxTemp: num(25, 45, 1),
    cellMinTemp: num(18, 28, 1),
    gear: speed > 0 ? "D" : "P",
    insulationResistance: num(50, 500, 0),
    runningMode: pick(["经济", "标准", "运动"]),
    vehicleStatus: charging ? "充电" : online ? (speed > 0 ? "行驶" : "停车") : "离线",
  };
}

/** 全量车辆列表 */
const VEHICLES: Vehicle[] = Array.from({ length: 120 }, (_, i) => makeVehicle(i + 1));

/** 生成告警记录 */
function makeAlarm(id: number): AlarmRecord {
  const vehicle = VEHICLES[id % VEHICLES.length];
  const faultType = pick(FAULT_TYPES);
  const level = rand() > 0.7 ? 1 : rand() > 0.5 ? 2 : 3;
  const alarmWay = pick(ALARM_WAYS);
  const faultTime = recentTime(Math.floor(num(1, 720, 0)));

  return {
    id,
    deviceCode: `IMEI${Math.floor(num(100000000000000, 999999999999999, 0))}`,
    selfNumber: vehicle.selfNumber,
    plateNumber: vehicle.plateNumber,
    vehicleUnit: vehicle.company,
    faultType,
    faultCode: `P${Math.floor(num(1000, 9999, 0))}`,
    faultReason: `${faultType}，${pick(["单体电压异常", "温差超限", "绝缘阻值过低", "电流突变", "通信超时"])}`,
    alarmWay,
    level,
    faultDate: faultTime.slice(0, 10),
    faultTime,
    updateTime: recentTime(Math.floor(num(0, 5, 0))),
    content: `${vehicle.selfNumber} 发生${faultType}告警`,
    rawMessage: `232302FE4C4A464A3030313101${Math.floor(num(1000, 9999, 0)).toString(16)}...`,
  };
}

/** 告警列表 */
const ALARMS: AlarmRecord[] = Array.from({ length: 80 }, (_, i) => makeAlarm(i + 1));

/** 生成时序曲线点 */
function makeCurve(points = 60, offset = 0): CurvePoint[] {
  return Array.from({ length: points }, (_, i) => {
    const t = recentTime(points - i);
    return {
      time: t,
      current: num(-60, 120, 1),
      voltage: num(340, 400, 1),
      soc: num(40 + offset, 60 + offset, 1),
      maxVoltage: num(3.9, 4.25, 3),
      minVoltage: num(3.2, 3.5, 3),
      maxTemp: num(30, 42, 1),
      minTemp: num(20, 28, 1),
    };
  });
}

/** 生成驱动电机列表 */
function makeMotors(): MotorInfo[] {
  const count = rand() > 0.5 ? 2 : 1;
  return Array.from({ length: count }, (_, i) => ({
    index: i + 1,
    status: pick(["运行", "停止", "运行"]),
    controllerCurrent: num(10, 120, 1),
    controllerVoltage: num(300, 400, 1),
    speed: num(0, 8000, 0),
    torque: num(0, 300, 1),
    temperature: num(40, 80, 1),
  }));
}

/** 生成历史轨迹点（沿机场滑行道往返） */
function makeTrack(): TrackPoint[] {
  const points: TrackPoint[] = [];
  const base = { lng: 116.59, lat: 40.078 };
  for (let i = 0; i < 40; i++) {
    const t = recentTime(40 - i);
    const phase = i / 40;
    const state: TrackPoint["state"] = phase < 0.15 ? "charging" : phase > 0.8 ? "normal" : "normal";
    points.push({
      time: t,
      lng: base.lng + Math.sin(phase * Math.PI * 2) * 0.012,
      lat: base.lat + Math.cos(phase * Math.PI * 2) * 0.008,
      state: phase > 0.7 ? "alarm" : state,
      soc: Math.round(90 - phase * 25),
    });
  }
  return points;
}

/** 获取车辆分页列表 */
export function mockGetVehicles(params: any): { list: Vehicle[]; total: number } {
  let list = [...VEHICLES];
  const {
    selfNumber,
    vin,
    online,
    company,
    brand,
    pageNum = 1,
    pageSize = 10,
  } = params || {};

  if (selfNumber) list = list.filter((v) => v.selfNumber.includes(selfNumber));
  if (vin) list = list.filter((v) => v.vin.includes(vin));
  if (online !== undefined && online !== null && online !== "") list = list.filter((v) => v.online === online);
  if (company) list = list.filter((v) => v.company === company);
  if (brand) list = list.filter((v) => v.brand === brand);

  const total = list.length;
  const start = (pageNum - 1) * pageSize;
  return { list: list.slice(start, start + pageSize), total };
}

/** 获取车辆总数（模拟全场 1900 余辆） */
export function mockVehicleTotal(): number {
  return 1936;
}

/** 获取单车详情 */
export function mockGetVehicleDetail(id: number): VehicleDetail {
  const vehicle = VEHICLES.find((v) => v.id === id) ?? VEHICLES[0];
  return {
    ...vehicle,
    batteryCurve: makeCurve(60, id % 20),
    extremeCurve: makeCurve(60, (id * 3) % 20),
    motorList: makeMotors(),
    alarmList: ALARMS.filter((a) => a.selfNumber === vehicle.selfNumber).slice(0, 5),
    trackPoints: makeTrack(),
  };
}

/** 获取告警分页列表 */
export function mockGetAlarms(params: any): { list: AlarmRecord[]; total: number } {
  let list = [...ALARMS];
  const {
    deviceCode,
    selfNumber,
    faultType,
    faultCode,
    faultReason,
    level,
    pageNum = 1,
    pageSize = 10,
  } = params || {};

  if (deviceCode) list = list.filter((a) => a.deviceCode.includes(deviceCode));
  if (selfNumber) list = list.filter((a) => a.selfNumber.includes(selfNumber));
  if (faultType) list = list.filter((a) => a.faultType === faultType);
  if (faultCode) list = list.filter((a) => a.faultCode.includes(faultCode));
  if (faultReason) list = list.filter((a) => a.faultReason.includes(faultReason));
  if (level !== undefined && level !== null && level !== "") list = list.filter((a) => a.level === level);

  const total = list.length;
  const start = (pageNum - 1) * pageSize;
  return { list: list.slice(start, start + pageSize), total };
}

/** 总览统计 */
export function mockOverviewStats(): OverviewStats {
  const total = 1936;
  const onlineCount = Math.round(total * num(0.8, 0.95, 2));
  return {
    totalCharge: Math.round(num(4200000, 5600000, 0)),
    todayCharge: Math.round(num(120000, 200000, 0)),
    totalChargeCount: Math.round(num(180000, 240000, 0)),
    todayChargeCount: Math.round(num(4000, 7000, 0)),
    totalCarbon: Math.round(num(2800000, 3600000, 0)),
    todayCarbon: Math.round(num(80000, 130000, 0)),
    totalMileage: Math.round(num(30000000, 42000000, 0)),
    todayMileage: Math.round(num(120000, 200000, 0)),
    vehicleTotal: total,
    onlineCount,
    chargingCount: Math.round(total * num(0.15, 0.35, 2)),
    faultCount: Math.round(total * num(0.02, 0.06, 2)),
    safetyScore: Math.round(num(82, 96, 0)),
  };
}

/** 24 小时充电功率曲线 */
export function mockChargeCurve(): Array<{ time: string; power: number }> {
  return Array.from({ length: 24 }, (_, hour) => ({
    time: `${String(hour).padStart(2, "0")}:00`,
    power: num(2000, 8000, 0),
  }));
}

/** 24 小时车辆运行热力图（[时段, 区域, 运行车辆数]） */
export function mockVehicleHeatmap(): Array<[number, number, number]> {
  const data: Array<[number, number, number]> = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let zone = 0; zone < 10; zone++) {
      // 白天（6-22 时）运行强度更高
      const peak = hour >= 6 && hour <= 22 ? 1 : 0.3;
      data.push([hour, zone, Math.round(num(0, 40, 0) * peak)]);
    }
  }
  return data;
}

/** 单车里程最新 5 条 */
export function mockTopMileage(): Vehicle[] {
  return [...VEHICLES].sort((a, b) => b.lastOnlineTime.localeCompare(a.lastOnlineTime)).slice(0, 5);
}

/** 最新 5 条告警 */
export function mockLatestAlarms(): AlarmRecord[] {
  return [...ALARMS].sort((a, b) => b.faultTime.localeCompare(a.faultTime)).slice(0, 5);
}

/** 车辆状态统计（用于地图统计面板） */
export function mockMonitorStats() {
  const total = 1936;
  const onlineCount = Math.round(total * num(0.8, 0.95, 2));
  return {
    vehicleTotal: total,
    onlineCount,
    onlineRate: Number((onlineCount / total).toFixed(4)),
    chargingCount: Math.round(total * num(0.15, 0.35, 2)),
    totalMileage: Math.round(num(30000000, 42000000, 0)),
  };
}

/** 充电热力图数据点（网格） */
export function mockHeatmap(): ChargeHeatPoint[] {
  const points: ChargeHeatPoint[] = [];
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 14; x++) {
      // 中心区域使用率高，边缘低
      const cx = Math.abs(x - 7) / 7;
      const cy = Math.abs(y - 5) / 5;
      const value = Math.round(num(0, 100, 0) * (1 - (cx + cy) / 2.5));
      points.push({ x, y, value: Math.max(0, value) });
    }
  }
  return points;
}

/** 车辆位置散点（地图） */
export function mockVehiclePositions(): Vehicle[] {
  return VEHICLES.slice(0, 80);
}

// ===== 车辆/告警 增删改（内存操作） =====

/** 新增/更新车辆 */
export function mockSaveVehicle(data: Vehicle): Vehicle {
  const id = Number(data.id);
  if (id) {
    const idx = VEHICLES.findIndex((v) => v.id === id);
    if (idx >= 0) {
      VEHICLES[idx] = { ...VEHICLES[idx], ...data, id };
      return VEHICLES[idx];
    }
  }
  const vehicle = { ...makeVehicle(VEHICLES.length + 1), ...data, id: VEHICLES.length + 1 };
  VEHICLES.unshift(vehicle);
  return vehicle;
}

/** 批量删除车辆 */
export function mockDeleteVehicles(ids: string): void {
  const idArr = ids.split(",").map(Number);
  for (let i = VEHICLES.length - 1; i >= 0; i--) {
    if (idArr.includes(VEHICLES[i].id)) VEHICLES.splice(i, 1);
  }
}

/** 修改车辆字段（开关类） */
export function mockModifyVehicle(data: { id: number; field: string; value: any }): void {
  const vehicle = VEHICLES.find((v) => v.id === Number(data.id));
  if (vehicle) (vehicle as any)[data.field] = data.value;
}
