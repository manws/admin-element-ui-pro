/**
 * 电动车辆安全监控平台 - 业务字典与枚举常量
 */

import type { OptionItem } from "@/types/api/common";

/** 车辆类型 */
export const VEHICLE_TYPES = ["通用车", "特种车"] as const;

/** 车辆分类（飞行区作业车辆） */
export const VEHICLE_CATEGORIES = [
  "摆渡车",
  "牵引车",
  "勤务车",
  "行李牵引车",
  "升降平台车",
  "飞机引导车",
  "客梯车",
  "行李传送车",
  "除冰车",
  "加水车",
] as const;

/** 汽车品牌（示例） */
export const VEHICLE_BRANDS = [
  "比亚迪",
  "北汽福田",
  "吉利",
  "埃安",
  "长安",
  "大众新能源",
  "宇通客车",
  "北汽新能源",
  "江淮汽车",
  "中通客车",
  "特斯拉",
  "腾势",
] as const;

/** 运营分公司 */
export const COMPANIES = [
  "首都机场飞行区管理部",
  "首都机场地服公司",
  "首都机场动力能源公司",
  "首都机场股份公司机务",
  "首航勤务分公司",
  "海航地服分公司",
] as const;

/** 在线状态 */
export const ONLINE_STATUS = [
  { label: "在线", value: true },
  { label: "离线", value: false },
] as const;

/** 告警级别 */
export const ALARM_LEVELS: OptionItem[] = [
  { label: "严重", value: 1 },
  { label: "重要", value: 2 },
  { label: "一般", value: 3 },
];

/** 告警级别标签映射 */
export const ALARM_LEVEL_MAP: Record<number, { label: string; type: "danger" | "warning" | "info" }> = {
  1: { label: "严重", type: "danger" },
  2: { label: "重要", type: "warning" },
  3: { label: "一般", type: "info" },
};

/** 告警方式 */
export const ALARM_WAYS = ["平台弹窗", "短信", "微信小程序", "站内信", "电话"] as const;

/** 故障类型 */
export const FAULT_TYPES = [
  "电池温度异常",
  "电池电压异常",
  "SOC 跳变",
  "绝缘故障",
  "电机故障",
  "充电异常",
  "通信中断",
  "BMS 告警",
] as const;

/** 终端网络类型 */
export const NETWORK_TYPES = ["4G", "5G", "4G Cat.1"] as const;

/** 卫星定位类型 */
export const SATELLITE_TYPES = ["单北斗", "GPS+北斗", "GPS"] as const;

/** 电池化学体系类型 */
export const BATTERY_CHEMISTRY = ["磷酸铁锂", "三元锂", "钛酸锂"] as const;

/** 报告类型 */
export const REPORT_TYPES: OptionItem[] = [
  { label: "运行监控周报", value: "周报" },
  { label: "运行监控月报", value: "月报" },
  { label: "运行监控半年报", value: "半年报" },
  { label: "运行监控年报", value: "年报" },
  { label: "故障统计分析周报", value: "故障统计周报" },
  { label: "车辆接入统计周报", value: "接入统计周报" },
  { label: "高危报警专项报告", value: "高危报警专项" },
  { label: "车辆信息核查月报", value: "车辆信息核查月报" },
];

/** 推送通道 */
export const PUSH_CHANNELS = ["短信", "微信小程序", "站内信"] as const;

/** 推送类型 */
export const PUSH_TYPES = ["故障告警", "满电提示"] as const;

/** 整车状态 */
export const VEHICLE_STATUSES = ["行驶", "停车", "充电", "怠速"] as const;

/** 运行模式 */
export const RUNNING_MODES = ["经济", "标准", "运动"] as const;

/** 档位 */
export const GEARS = ["P", "R", "N", "D"] as const;

/** 电机状态 */
export const MOTOR_STATUSES = ["运行", "停止", "故障"] as const;
