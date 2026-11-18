export interface KpiItem {
  id: string;
  label: string;
  icon: string;
  color: string;
  value: number;
  decimals: number;
  sub: string;
  share: number;
}

const svg = (name: string) => `/screen/assets/svg/${name}`;

export const kpis: KpiItem[] = [
  {
    id: "thermal",
    label: "当日热失控前兆告警",
    icon: "ri-fire-line",
    color: "#ff6b6b",
    value: 6,
    decimals: 0,
    sub: "占比 26.1%",
    share: 26.1,
  },
  {
    id: "insulation",
    label: "当日绝缘电阻过低告警",
    icon: "ri-shield-flash-line",
    color: "#ff6b6b",
    value: 5,
    decimals: 0,
    sub: "占比 21.7%",
    share: 21.7,
  },
  {
    id: "sensor",
    label: "当日温度传感器失效告警",
    icon: "ri-temp-cold-line",
    color: "#ff6b6b",
    value: 4,
    decimals: 0,
    sub: "占比 17.4%",
    share: 17.4,
  },
  {
    id: "motor",
    label: "当日电机控制器过温告警",
    icon: "ri-cpu-line",
    color: "#ff6b6b",
    value: 3,
    decimals: 0,
    sub: "占比 13.0%",
    share: 13,
  },
  {
    id: "voltage",
    label: "当日单体电压过低告警",
    icon: "ri-battery-low-line",
    color: "#f5c15a",
    value: 3,
    decimals: 0,
    sub: "占比 13.0%",
    share: 13,
  },
  {
    id: "rise",
    label: "当日电池包温升异常告警",
    icon: "ri-temp-hot-line",
    color: "#f5c15a",
    value: 2,
    decimals: 0,
    sub: "占比 8.7%",
    share: 8.7,
  },
];

export const units = [
  { name: "地服公司", color: "#3ad4ff", value: 520 },
  { name: "航空货运", color: "#7eb6ff", value: 390 },
  { name: "机务工程", color: "#2ee59a", value: 293 },
  { name: "特种车辆", color: "#7ee7ff", value: 228 },
  { name: "空管中心", color: "#14c0f0", value: 48 },
  { name: "安保部", color: "#8aecff", value: 42 },
  { name: "物流公司", color: "#8ef06a", value: 35 },
  { name: "旅客服务", color: "#1aa8e6", value: 28 },
  { name: "基建部", color: "#1ed98a", value: 24 },
  { name: "能源公司", color: "#5d8eaa", value: 18 },
];

export const grades = [
  { grade: "S", count: 1264, color: "#2ee59a" },
  { grade: "A", count: 516, color: "#3ad4ff" },
  { grade: "B", count: 132, color: "#f5c15a" },
  { grade: "C", count: 24, color: "#ff6b6b" },
];

export const mapLegend = [
  { name: "在线", color: "#2ee59a" },
  { name: "充电", color: "#7dffc3" },
  { name: "告警", color: "#ff6b6b" },
  { name: "离线", color: "#5d8eaa" },
];

export const mapSrc = svg("472_1579-20261117_231023189.svg");

export const mileage = [
  { plate: "01  京A·D0412", value: 21.9 },
  { plate: "02  京A·D1078", value: 20.4 },
  { plate: "03  京A·D0835", value: 19.8 },
  { plate: "04  京A·D1520", value: 18.7 },
  { plate: "05  京A·D0269", value: 17.6 },
];

export const mileageMax = 24.6;

export const recentAlarms = [
  {
    title: "电池热失控前兆",
    time: "13:00:42",
    meta: "京A·D0412  ·  地服公司  ·  比亚迪 牵引车",
    color: "#ff6b6b",
    hot: true,
  },
  {
    title: "绝缘电阻过低",
    time: "12:58:17",
    meta: "京A·D0875  ·  机务工程  ·  宇通 客梯车",
    color: "#f5c15a",
    hot: false,
  },
  {
    title: "温度传感器失效",
    time: "12:54:03",
    meta: "京A·D1342  ·  航空货运  ·  特斯拉 摆渡车",
    color: "#ffd27a",
    hot: false,
  },
  {
    title: "电机控制器过温",
    time: "12:49:36",
    meta: "京A·D0639  ·  特种车辆  ·  五菱 除冰车",
    color: "#3ad4ff",
    hot: false,
  },
  {
    title: "单体电压过低",
    time: "12:47:10",
    meta: "京A·D1121  ·  地服公司  ·  比亚迪 行李车",
    color: "#7eb6ff",
    hot: false,
  },
];

export const alarmLegend = [
  { name: "热失控前兆", color: "#ff6b6b", value: 6 },
  { name: "绝缘电阻过低", color: "#f5c15a", value: 5 },
  { name: "温度传感器失效", color: "#ffd27a", value: 4 },
  { name: "电机控制器过温", color: "#3ad4ff", value: 3 },
  { name: "单体电压过低", color: "#7eb6ff", value: 3 },
  { name: "电池包温升异常", color: "#ff8a8a", value: 2 },
];
