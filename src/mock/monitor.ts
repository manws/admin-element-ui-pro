/**
 * 电动车辆安全监控平台 - 监控数据 Mock
 */

import type {
  AlarmRecord,
  CellSample,
  ChargeHeatPoint,
  CurvePoint,
  MotorInfo,
  NoticeRecord,
  OverviewStats,
  TrackPoint,
  Vehicle,
  VehicleDetail,
} from "@/types/api/monitor";
import {
  ACCESS_METHODS,
  ALARM_WAYS,
  COMPANIES,
  COMPANY_TREE,
  COST_BEARERS,
  FAULT_TYPES,
  PROTOCOL_CATEGORIES,
  VEHICLE_BRANDS,
  VEHICLE_CATEGORIES,
  VEHICLE_MAKES,
} from "@/constants/monitor";
import { STORAGE_KEYS } from "@/constants";
import { Storage } from "@/utils/storage";

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

function currentDataScope(): string {
  const user = Storage.get<{ dataScope?: string } | null>(STORAGE_KEYS.USER_INFO, null);
  return user?.dataScope ?? "";
}

function inScope(company: string): boolean {
  const scope = currentDataScope();
  return !scope || company === scope;
}

function companyMembers(value: string): string[] {
  for (const node of COMPANY_TREE) {
    if (node.value === value) return node.children.map((child) => child.value);
  }
  return [value];
}

function formatTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/** 在线车辆的最近上报时间始终落在 60 秒内 */
function stamp(vehicle: Vehicle): Vehicle {
  const ageSec = vehicle.online ? vehicle.id % 50 : 180 + (vehicle.id % 90) * 40;
  return {
    ...vehicle,
    lastOnlineTime: formatTime(new Date(Date.now() - ageSec * 1000)),
    online: ageSec < 60,
  };
}

function frameOf(id: number): { hex: string; ascii: string } {
  const bytes = Array.from({ length: 32 }, (_, index) => (id * 17 + index * 13) & 0xff);
  return {
    hex: bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase(),
    ascii: bytes.map((byte) => (byte >= 32 && byte < 127 ? String.fromCharCode(byte) : ".")).join(""),
  };
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
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
  const make = pick(VEHICLE_MAKES);
  const category = pick(VEHICLE_CATEGORIES);
  const online = rand() > 0.15;
  const charging = online && rand() > 0.7;
  const chargingStatus: Vehicle["chargingStatus"] = charging ? (id % 2 === 0 ? "park" : "drive") : "none";
  const alarmFlag = rand() > 0.85;
  const frame = frameOf(id);
  const soc = num(20, 100, 0);
  const totalMileage = num(8000, 180000, 0);
  const speed = online ? (charging ? 0 : num(0, 60, 0)) : 0;

  const accessMethod = id % 11 === 0 ? "OBD" : id % 13 === 0 ? "其他" : pick(ACCESS_METHODS);
  const protocolCategory = accessMethod === "协议对接" ? pick(PROTOCOL_CATEGORIES) : "";
  const materialArrivalTime = `${2024 + (id % 2)}-${String((id % 12) + 1).padStart(2, "0")}-${String((id % 27) + 1).padStart(2, "0")}`;
  const requiredFinishTime = addDays(materialArrivalTime, 7);
  const late = id % 17 === 0;
  const actualFinishTime = late ? "" : addDays(materialArrivalTime, id % 5);
  const overdue = late || (actualFinishTime !== "" && actualFinishTime > requiredFinishTime);
  const entryQuarter = `2026-Q${(id % 4) + 1}`;

  return {
    id,
    vehicleType: category === "摆渡车" || category === "牵引车" || category === "除冰车" ? "特种车" : "通用车",
    category,
    make,
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
    accessMethod,
    protocolCategory,
    materialArrivalTime,
    requiredFinishTime,
    actualFinishTime,
    overdue,
    entryQuarter,
    countInQuarterRate: entryQuarter === "2026-Q4",
    costBearer: accessMethod === "协议对接" ? "" : pick(COST_BEARERS),
    online,
    charging,
    chargingStatus,
    remoteControl: id % 5 !== 0,
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
    cellMaxIndex: (id % 90) + 1,
    cellMinIndex: (id % 40) + 1,
    probeMaxIndex: (id % 16) + 1,
    probeMinIndex: (id % 8) + 1,
    gpsAccuracy: Number((0.6 + (id % 20) / 10).toFixed(1)),
    satelliteCount: 8 + (id % 10),
    lastFrame: frame.hex,
    lastFrameAscii: frame.ascii,
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
  const frame = frameOf(id + 800);

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
    rawMessage: frame.hex,
    rawAscii: frame.ascii,
    recovered: level !== 1 && id % 4 === 0,
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

/** 生成历史轨迹点。默认约 1 万点，覆盖近 6 天，供回放页抽稀。 */
function makeTrack(count = 48, seed = 1): TrackPoint[] {
  const points: TrackPoint[] = [];
  const base = { lng: 116.59 + ((seed % 17) - 8) * 0.0004, lat: 40.078 };
  const spanMinutes = 6 * 24 * 60;
  for (let i = 0; i < count; i++) {
    const phase = count <= 1 ? 0 : i / (count - 1);
    const t = formatTime(new Date(Date.now() - (1 - phase) * spanMinutes * 60 * 1000));
    const segment: TrackPoint["state"] = phase < 0.1 ? "offline" : phase < 0.25 ? "charging" : phase > 0.85 ? "alarm" : "normal";
    points.push({
      time: t,
      lng: base.lng + Math.sin(phase * Math.PI * 2) * 0.012,
      lat: base.lat + Math.cos(phase * Math.PI * 2) * 0.008,
      state: segment,
      soc: Math.round(90 - phase * 25),
      speed: segment === "charging" || segment === "offline" ? 0 : Math.round(12 + phase * 30),
      voltage: Number((360 + Math.sin(phase * 6) * 8).toFixed(1)),
      current: Number((segment === "charging" ? -40 : 30 + phase * 40).toFixed(1)),
      power: Number((segment === "offline" ? 0 : 20 + phase * 50).toFixed(1)),
      vehicleStatus: segment === "charging" ? "充电" : segment === "offline" ? "离线" : "行驶",
      gear: segment === "charging" || segment === "offline" ? "P" : "D",
      insulationResistance: Math.round(420 - phase * 80),
      maxVoltage: Number((4.15 - phase * 0.08).toFixed(3)),
      minVoltage: Number((3.42 - phase * 0.06).toFixed(3)),
      maxTemp: Number((32 + phase * 8).toFixed(1)),
      minTemp: Number((24 + phase * 2).toFixed(1)),
      alarmContent: segment === "alarm" ? "电池温差超限" : "",
    });
  }
  return points;
}

/** 获取车辆分页列表 */
export function mockGetVehicles(params: any): { list: Vehicle[]; total: number } {
  let list = VEHICLES.filter((v) => inScope(v.company));
  const {
    selfNumber,
    vin,
    vinMode,
    online,
    company,
    brand,
    category,
    charging,
    monitorFlag,
    pageNum = 1,
    pageSize = 10,
  } = params || {};

  if (selfNumber) list = list.filter((v) => v.selfNumber.includes(String(selfNumber)));
  if (vin) {
    const keyword = String(vin);
    list = list.filter((v) => (vinMode === "exact" ? v.vin === keyword : v.vin.includes(keyword)));
  }
  if (online === true || online === "true" || online === false || online === "false") {
    const flag = online === true || online === "true";
    list = list.filter((v) => v.online === flag);
  }
  if (company) {
    const selected = Array.isArray(company) ? company[company.length - 1] : company;
    if (selected) {
      const members = companyMembers(String(selected));
      list = list.filter((v) => members.includes(v.company));
    }
  }
  if (Array.isArray(brand) && brand.length) list = list.filter((v) => brand.includes(v.brand));
  else if (brand) list = list.filter((v) => v.brand === brand);
  if (category) list = list.filter((v) => v.category === category);
  if (charging === 1 || charging === "1" || charging === true) {
    list = list.filter((v) => v.chargingStatus === "park" || v.chargingStatus === "drive");
  }
  if (monitorFlag === true || monitorFlag === "true") list = list.filter((v) => v.monitorFlag);

  const total = list.length;
  const start = (pageNum - 1) * pageSize;
  return { list: list.slice(start, start + pageSize).map(stamp), total };
}

/** 获取车辆总数（模拟全场 1900 余辆） */
export function mockVehicleTotal(): number {
  return 1936;
}

/** 获取单车详情 */
export function mockGetVehicleDetail(id: number): VehicleDetail {
  const vehicle = stamp(VEHICLES.find((v) => v.id === id) ?? VEHICLES[0]);
  return {
    ...vehicle,
    batteryCurve: makeCurve(60, id % 20),
    extremeCurve: makeCurve(60, (id * 3) % 20),
    motorList: makeMotors(),
    alarmList: ALARMS.filter((a) => a.selfNumber === vehicle.selfNumber).slice(0, 5),
    trackPoints: makeTrack(48, id),
    cells: Array.from({ length: 8 }, (_, i) => ({
      index: i + 1,
      voltage: Number((vehicle.cellMinVoltage + ((vehicle.cellMaxVoltage - vehicle.cellMinVoltage) * i) / 7).toFixed(3)),
      temperature: Number((vehicle.cellMinTemp + ((vehicle.cellMaxTemp - vehicle.cellMinTemp) * (i % 4)) / 3).toFixed(1)),
    })) satisfies CellSample[],
  };
}

/** 获取告警分页列表 */
function scopedAlarms(): AlarmRecord[] {
  return ALARMS.filter((a) => inScope(a.vehicleUnit));
}

export function mockAlarmStats() {
  const list = scopedAlarms();
  const severe = list.filter((a) => a.level === 1).length;
  return {
    total: list.length,
    severe,
    important: list.filter((a) => a.level === 2).length,
    normal: list.filter((a) => a.level === 3).length,
    keyVehicle: severe,
  };
}

export function mockGetAlarms(params: any): { list: AlarmRecord[]; total: number } {
  let list = scopedAlarms();
  const {
    deviceCode,
    selfNumber,
    plateNumber,
    faultType,
    faultCode,
    faultReason,
    level,
    pageNum = 1,
    pageSize = 10,
  } = params || {};

  if (deviceCode) list = list.filter((a) => a.deviceCode.includes(deviceCode));
  if (selfNumber) list = list.filter((a) => a.selfNumber.includes(selfNumber));
  if (plateNumber) list = list.filter((a) => a.plateNumber === plateNumber);
  if (faultType) list = list.filter((a) => a.faultType === faultType);
  if (faultCode) list = list.filter((a) => a.faultCode.includes(faultCode));
  if (faultReason) list = list.filter((a) => a.faultReason.includes(faultReason));
  if (level !== undefined && level !== null && level !== "") list = list.filter((a) => a.level === Number(level));
  if (params?.recovered === false || params?.recovered === "false") list = list.filter((a) => !a.recovered);

  list = [...list].sort((a, b) => {
    const rank = (item: AlarmRecord) => {
      if (!item.recovered && item.level === 1) return 0;
      if (!item.recovered && item.level === 2) return 1;
      return 2;
    };
    const diff = rank(a) - rank(b);
    return diff || b.faultTime.localeCompare(a.faultTime);
  });

  const total = list.length;
  const start = (pageNum - 1) * pageSize;
  return { list: list.slice(start, start + pageSize), total };
}

/** 总览统计 */
export function mockOverviewStats(): OverviewStats {
  const scoped = VEHICLES.filter((v) => inScope(v.company));
  if (currentDataScope()) {
    const total = scoped.length;
    const onlineCount = scoped.filter((v) => v.online).length;
    return {
      totalCharge: Math.round(scoped.reduce((sum, v) => sum + v.batteryCapacity * 12, 0)),
      todayCharge: Math.round(scoped.reduce((sum, v) => sum + (v.charging ? v.power : 0), 0)),
      totalChargeCount: total * 40,
      todayChargeCount: scoped.filter((v) => v.charging).length,
      totalCarbon: Math.round(scoped.reduce((sum, v) => sum + v.totalMileage * 0.12, 0)),
      todayCarbon: Math.round(scoped.reduce((sum, v) => sum + v.todayMileage * 0.12, 0)),
      totalMileage: Math.round(scoped.reduce((sum, v) => sum + v.totalMileage, 0)),
      todayMileage: Math.round(scoped.reduce((sum, v) => sum + v.todayMileage, 0)),
      vehicleTotal: total,
      onlineCount,
      chargingCount: scoped.filter((v) => v.charging).length,
      faultCount: scoped.filter((v) => v.alarmFlag).length,
      safetyScore: total ? Math.round(scoped.reduce((sum, v) => sum + v.safetyScore, 0) / total) : 0,
      safetyFactors: [
        { name: "在线稳定系数", value: total ? Number((onlineCount / total).toFixed(2)) : 0 },
        { name: "电池一致性系数", value: 0.91 },
        { name: "绝缘安全系数", value: 0.94 },
        { name: "告警收敛系数", value: total ? Number((1 - scoped.filter((v) => v.alarmFlag).length / total).toFixed(2)) : 0 },
      ],
    };
  }
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
    safetyFactors: [
      { name: "在线稳定系数", value: 0.96 },
      { name: "电池一致性系数", value: 0.91 },
      { name: "绝缘安全系数", value: 0.94 },
      { name: "告警收敛系数", value: 0.88 },
    ],
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
  return VEHICLES.filter((v) => inScope(v.company))
    .sort((a, b) => b.lastOnlineTime.localeCompare(a.lastOnlineTime))
    .slice(0, 5);
}

/** 最新 5 条告警 */
export function mockLatestAlarms(): AlarmRecord[] {
  return scopedAlarms().sort((a, b) => b.faultTime.localeCompare(a.faultTime)).slice(0, 5);
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
  return VEHICLES.filter((v) => inScope(v.company) && v.monitorFlag).slice(0, 80).map(stamp);
}

/** 约 1 万个定位点，供历史回放抽稀 */
export function mockGetTrack(id: number): { points: TrackPoint[]; rawCount: number } {
  const points = makeTrack(10000, id);
  return { points, rawCount: points.length };
}

/** 未解除的严重告警，每车保留一条 */
export function mockFocusAlarms(): AlarmRecord[] {
  const picked = new Map<string, AlarmRecord>();
  scopedAlarms()
    .filter((item) => item.level === 1 && !item.recovered)
    .sort((a, b) => b.faultTime.localeCompare(a.faultTime))
    .forEach((item) => {
      if (!picked.has(item.selfNumber)) picked.set(item.selfNumber, item);
    });
  return [...picked.values()];
}

const AUDIT_LOGS: Array<{ time: string; action: string; detail: string }> = [];

export function mockRecordAudit(action: string, detail: string) {
  AUDIT_LOGS.unshift({ time: formatTime(new Date()), action, detail });
  return AUDIT_LOGS.slice(0, 20);
}

export function mockGetAudit() {
  return AUDIT_LOGS.slice(0, 20);
}

export function mockOnlineSummary() {
  const monitored = VEHICLES.filter((v) => v.monitorFlag && inScope(v.company));
  const online = monitored.filter((v) => v.online).length;
  return { monitored: monitored.length, online, offline: monitored.length - online };
}

export function mockAccessQuarterStats() {
  const list = VEHICLES.filter((v) => v.countInQuarterRate && inScope(v.company));
  const entered = list.length;
  const connected = list.filter((v) => v.actualFinishTime).length;
  return {
    quarter: "2026-Q4",
    entered,
    connected,
    rate: entered ? Math.round((connected / entered) * 1000) / 10 : 100,
    target: 100,
    overdue: list.filter((v) => v.overdue).length,
  };
}

const NOTICES: NoticeRecord[] = [
  {
    id: 1,
    noticeTime: "2026-10-29 09:20:00",
    target: "首都机场股份公司运行值班",
    channel: "短信",
    content: "车辆 JD1023 电池温差超限，已列为重点车辆告警",
    arrangement: "采购人要求 2 小时内现场复核传感器",
    result: "",
  },
  {
    id: 2,
    noticeTime: "2026-10-28 16:05:00",
    target: "地服公司调度",
    channel: "微信小程序",
    content: "车辆 JD1108 通信中断超过 30 分钟",
    arrangement: "安排驾驶员回场检查终端",
    result: "终端重启后恢复上报",
  },
];

export function mockGetNotices() {
  return { list: [...NOTICES], total: NOTICES.length };
}

export function mockSaveNotice(data: NoticeRecord) {
  if (data.id) {
    const idx = NOTICES.findIndex((item) => item.id === data.id);
    if (idx >= 0) {
      NOTICES[idx] = { ...NOTICES[idx], ...data };
      return NOTICES[idx];
    }
  }
  const entity = { ...data, id: NOTICES.reduce((max, item) => Math.max(max, item.id), 0) + 1 };
  NOTICES.unshift(entity);
  return entity;
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
