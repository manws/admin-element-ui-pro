/**
 * 新增菜单的内存数据。刷新页面后恢复初始值。
 */

type Row = Record<string, any>;

const YES_NO = ["是", "否"] as const;

const stores: Record<string, Row[]> = {
  faultType: [
    { id: 1, typeCode: "BAT_TEMP", typeName: "电池温度异常", active: "是" },
    { id: 2, typeCode: "BAT_VOLT", typeName: "电池电压异常", active: "是" },
    { id: 3, typeCode: "INSUL", typeName: "绝缘故障", active: "是" },
    { id: 4, typeCode: "MOTOR", typeName: "电机故障", active: "是" },
    { id: 5, typeCode: "COMM", typeName: "通信中断", active: "否" },
  ],
  faultCode: [
    { id: 1, faultType: "电池温度异常", faultCode: "T101", reason: "单体温度超过上限", active: "是" },
    { id: 2, faultType: "绝缘故障", faultCode: "I203", reason: "绝缘电阻过低", active: "是" },
    { id: 3, faultType: "电机故障", faultCode: "M018", reason: "电机控制器过温", active: "是" },
    { id: 4, faultType: "通信中断", faultCode: "C001", reason: "终端超过 60 秒无上报", active: "否" },
  ],
  alarmCode: [
    { id: 1, faultType: "电池温度异常", faultCode: "A-T101", reason: "电池热失控前兆", level: "严重", enabled: "是", active: "是" },
    { id: 2, faultType: "绝缘故障", faultCode: "A-I203", reason: "绝缘电阻过低", level: "重要", enabled: "是", active: "是" },
    { id: 3, faultType: "电池电压异常", faultCode: "A-V012", reason: "单体电压过低", level: "一般", enabled: "是", active: "是" },
    { id: 4, faultType: "电机故障", faultCode: "A-M018", reason: "电机控制器过温", level: "重要", enabled: "否", active: "否" },
  ],
  orgUnit: [
    { id: 1, unitCode: "ORG-DFS", unitName: "首都机场地服公司", company: "首都机场地服公司", active: "是" },
    { id: 2, unitCode: "ORG-PWR", unitName: "首都机场动力能源公司", company: "首都机场动力能源公司", active: "是" },
    { id: 3, unitCode: "ORG-FLT", unitName: "首都机场飞行区管理部", company: "首都机场飞行区管理部", active: "是" },
  ],
  vehicleBrand: [
    { id: 1, brandCode: "BYD", brandName: "比亚迪", active: "是" },
    { id: 2, brandCode: "YUTONG", brandName: "宇通客车", active: "是" },
    { id: 3, brandCode: "TESLA", brandName: "特斯拉", active: "是" },
    { id: 4, brandCode: "WULING", brandName: "五菱", active: "否" },
  ],
  device: [
    { id: 1, deviceNo: "DEV-10021", deviceCode: "IMEI86010021", sim: "14700001021", bound: "是", updater: "管理员", updatedAt: "2026-11-17 09:12:00", protocolNo: "GB32960-2016" },
    { id: 2, deviceNo: "DEV-10088", deviceCode: "IMEI86010088", sim: "14700001088", bound: "否", updater: "安全监管员", updatedAt: "2026-11-16 18:40:00", protocolNo: "GB32960-2016" },
    { id: 3, deviceNo: "DEV-10134", deviceCode: "IMEI86010134", sim: "14700001134", bound: "是", updater: "管理员", updatedAt: "2026-11-15 11:05:00", protocolNo: "JT808-2019" },
  ],
  protocol: [
    { id: 1, name: "新能源汽车远程监控", dict: "GB/T 32960", updater: "管理员", updatedAt: "2026-10-20 10:00:00" },
    { id: 2, name: "道路运输终端", dict: "JT/T 808", updater: "管理员", updatedAt: "2026-09-02 15:20:00" },
  ],
  role: [
    { id: 1, roleCode: "ROOT", roleName: "超级管理员", roleLevel: "1", description: "全部菜单与数据", permission: "全部菜单", active: "是" },
    { id: 2, roleCode: "SAFETY", roleName: "安全监管员", roleLevel: "2", description: "监控、告警、报告", permission: "监控预警、告警管理、报告信息", active: "是" },
    { id: 3, roleCode: "DISPATCH", roleName: "运营调度员", roleLevel: "3", description: "本单位车辆监控", permission: "车辆列表、地图监控", active: "是" },
  ],
  roleLevel: [
    { id: 1, roleName: "超级管理员", roleLevel: "1", superUser: "是", active: "是" },
    { id: 2, roleName: "安全监管员", roleLevel: "2", superUser: "否", active: "是" },
    { id: 3, roleName: "运营调度员", roleLevel: "3", superUser: "否", active: "是" },
  ],
  simpleReport: [
    { id: 1, title: "京A·D0412 运行简报", plateNumber: "京A·D0412", vin: "LVS2026D041200001", company: "首都机场地服公司", brand: "比亚迪", generateTime: "2026-11-17 08:00:00" },
    { id: 2, title: "京A·D1078 运行简报", plateNumber: "京A·D1078", vin: "LVS2026D107800001", company: "首都机场股份公司机务", brand: "宇通客车", generateTime: "2026-11-16 08:00:00" },
  ],
  chargeReport: [
    { id: 1, title: "京A·D0412 充电报告", plateNumber: "京A·D0412", vin: "LVS2026D041200001", company: "首都机场地服公司", brand: "比亚迪", generateTime: "2026-11-17 12:30:00" },
    { id: 2, title: "京A·D0835 充电报告", plateNumber: "京A·D0835", vin: "LVS2026D083500001", company: "首都机场动力能源公司", brand: "特斯拉", generateTime: "2026-11-17 06:10:00" },
  ],
};

function nextId(list: Row[]) {
  return list.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

function filterRows(list: Row[], params: Record<string, any>) {
  return list.filter((item) =>
    Object.entries(params || {}).every(([key, value]) => {
      if (value === undefined || value === null || value === "") return true;
      if (key === "pageIndex" || key === "pageNum" || key === "pageSize") return true;
      return String(item[key] ?? "").includes(String(value));
    }),
  );
}

export function mockCatalogPage(key: string, params: Record<string, any>) {
  const list = filterRows(stores[key] || [], params);
  const pageNum = Number(params?.pageNum ?? params?.pageIndex) || 1;
  const pageSize = Number(params?.pageSize) || 10;
  const start = (pageNum - 1) * pageSize;
  return { list: list.slice(start, start + pageSize), total: list.length };
}

export function mockCatalogSave(key: string, data: Row) {
  const list = stores[key];
  if (!list) return data;
  const id = Number(data.id);
  if (id) {
    const index = list.findIndex((item) => item.id === id);
    if (index >= 0) {
      list[index] = { ...list[index], ...data, id };
      return list[index];
    }
  }
  const entity = { ...data, id: nextId(list) };
  list.unshift(entity);
  return entity;
}

export function mockCatalogRemove(key: string, ids: string) {
  const list = stores[key];
  if (!list) return;
  const idSet = new Set(ids.split(",").map(Number));
  for (let i = list.length - 1; i >= 0; i--) {
    if (idSet.has(Number(list[i].id))) list.splice(i, 1);
  }
}

export const YES_NO_OPTIONS = YES_NO.map((item) => ({ label: item, value: item }));
