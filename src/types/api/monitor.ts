/**
 * 电动车辆安全监控平台 - 业务类型定义
 */

/** 车辆实时状态 */
export interface Vehicle {
  /** 主键 */
  id: number;
  /** 车辆类型：通用车 / 特种车 */
  vehicleType: string;
  /** 车辆分类：摆渡车 / 牵引车 / 勤务车 / 行李牵引车 等 */
  category: string;
  /** 品牌 */
  brand: string;
  /** 型号 */
  model: string;
  /** 电池型号 */
  batteryModel: string;
  /** 电池容量（kWh） */
  batteryCapacity: number;
  /** 自编号 */
  selfNumber: string;
  /** 车牌号 */
  plateNumber: string;
  /** 车架号 VIN */
  vin: string;
  /** 运营公司 / 分公司 */
  company: string;
  /** 是否监控 */
  monitorFlag: boolean;
  /** VIN 充电 */
  vinCharge: boolean;
  /** 接入时间 */
  accessTime: string;
  /** 出厂时间 */
  factoryTime: string;
  /** 是否可用 */
  available: boolean;

  // ===== 实时状态 =====
  /** 在线状态 */
  online: boolean;
  /** 是否充电 */
  charging: boolean;
  /** 是否告警 */
  alarmFlag: boolean;
  /** 当前 SOC（%） */
  soc: number;
  /** 总电压（V） */
  voltage: number;
  /** 总电流（A） */
  current: number;
  /** 输出功率（kW） */
  power: number;
  /** 行驶速度（km/h） */
  speed: number;
  /** 累计里程（km） */
  totalMileage: number;
  /** 今日里程（km） */
  todayMileage: number;
  /** 上报间隔（秒） */
  reportInterval: number;
  /** 最近在线时间 */
  lastOnlineTime: string;
  /** 经度 */
  lng: number;
  /** 纬度 */
  lat: number;
  /** 位置描述 */
  position: string;
  /** 安全评估分数（0-100） */
  safetyScore: number;
  /** 单体最高电压（V） */
  cellMaxVoltage: number;
  /** 单体最低电压（V） */
  cellMinVoltage: number;
  /** 单体最高温度（℃） */
  cellMaxTemp: number;
  /** 单体最低温度（℃） */
  cellMinTemp: number;
  /** 档位 */
  gear: string;
  /** 绝缘电阻（kΩ） */
  insulationResistance: number;
  /** 运行模式 */
  runningMode: string;
  /** 整车状态 */
  vehicleStatus: string;
}

/** 告警记录 */
export interface AlarmRecord {
  id: number;
  /** 设备识别码 */
  deviceCode: string;
  /** 车辆自编号 */
  selfNumber: string;
  /** 车牌号 */
  plateNumber: string;
  /** 车辆单位 */
  vehicleUnit: string;
  /** 故障类型 */
  faultType: string;
  /** 故障码 */
  faultCode: string;
  /** 故障原因 */
  faultReason: string;
  /** 告警方式 */
  alarmWay: string;
  /** 告警级别：1 严重 / 2 重要 / 3 一般 */
  level: number;
  /** 故障日期 */
  faultDate: string;
  /** 故障发生时间 */
  faultTime: string;
  /** 最后更新时间 */
  updateTime: string;
  /** 告警内容 */
  content: string;
  /** 原始报文（Hex） */
  rawMessage: string;
}

/** 驱动电机信息 */
export interface MotorInfo {
  /** 电机序号 */
  index: number;
  /** 电机状态 */
  status: string;
  /** 控制器电流（A） */
  controllerCurrent: number;
  /** 控制器电压（V） */
  controllerVoltage: number;
  /** 电机转速（rpm） */
  speed: number;
  /** 电机转矩（N·m） */
  torque: number;
  /** 电机温度（℃） */
  temperature: number;
}

/** 时序曲线点（电池曲线/极值曲线） */
export interface CurvePoint {
  /** 时间 */
  time: string;
  /** 电流（A） */
  current?: number;
  /** 电压（V） */
  voltage?: number;
  /** SOC（%） */
  soc?: number;
  /** 最高电压（V） */
  maxVoltage?: number;
  /** 最低电压（V） */
  minVoltage?: number;
  /** 最高温度（℃） */
  maxTemp?: number;
  /** 最低温度（℃） */
  minTemp?: number;
}

/** 轨迹点 */
export interface TrackPoint {
  time: string;
  lng: number;
  lat: number;
  /** 轨迹段状态：normal 正常 / charging 充电 / alarm 告警 / offline 离线 */
  state: "normal" | "charging" | "alarm" | "offline";
  soc: number;
}

/** 单车详情（含曲线、电机、告警、轨迹） */
export interface VehicleDetail extends Vehicle {
  batteryCurve: CurvePoint[];
  extremeCurve: CurvePoint[];
  motorList: MotorInfo[];
  alarmList: AlarmRecord[];
  trackPoints: TrackPoint[];
}

/** 终端类型 */
export interface TerminalType {
  id: number;
  name: string;
  version: string;
  networkType: string;
  satelliteType: string;
  bmsVersion: string;
  bmsVendor: string;
  sendCycle: number;
  fileBlockSize: number;
}

/** 电池类型 */
export interface BatteryType {
  id: number;
  type: string;
  capacity: number;
  chargeVoltage: number;
  vendor: string;
  batteryCode: string;
  bmsCode: string;
  totalVoltage: number;
  groupNumber: number;
  produceDate: string;
}

/** BMS 厂家 */
export interface BmsVendor {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
}

/** 平台用户档案 */
export interface PlatformUser {
  id: number;
  /** 用户单位 */
  unit: string;
  /** 用户账号 */
  account: string;
  /** 用户角色 */
  role: string;
  /** 分公司及部门 */
  dept: string;
  /** 手机号 */
  phone: string;
  /** 邮箱 */
  email: string;
  /** 是否可用 */
  available: boolean;
  /** 是否超级用户 */
  superUser: boolean;
  /** 是否在线 */
  online: boolean;
  /** 最近在线时间 */
  lastOnlineTime: string;
  /** 登录时间 */
  loginTime: string;
  /** 登录设备 */
  loginDevice: string;
  /** 登录 IP */
  loginIp: string;
  /** 登录端口 */
  loginPort: number;
  /** 登录次数 */
  loginCount: number;
  /** 登录位置 */
  loginLocation: string;
}

/** 报告 */
export interface Report {
  id: number;
  /** 报告类型：周报 / 月报 / 半年报 / 年报 / 故障统计周报 / 接入统计周报 / 高危报警专项 / 车辆信息核查月报 */
  type: string;
  title: string;
  /** 报告周期 */
  period: string;
  /** 生成时间 */
  generateTime: string;
  /** 摘要 */
  summary: string;
  /** 文件格式 */
  fileType: string;
}

/** 推送记录 */
export interface PushRecord {
  id: number;
  time: string;
  plateNumber: string;
  /** 推送通道：短信 / 微信小程序 / 站内信 */
  channel: string;
  /** 推送类型：故障告警 / 满电提示 */
  type: string;
  content: string;
  /** 状态：已送达 / 失败 */
  status: string;
}

/** 总览统计数据 */
export interface OverviewStats {
  totalCharge: number;
  todayCharge: number;
  totalChargeCount: number;
  todayChargeCount: number;
  totalCarbon: number;
  todayCarbon: number;
  totalMileage: number;
  todayMileage: number;
  vehicleTotal: number;
  onlineCount: number;
  chargingCount: number;
  faultCount: number;
  safetyScore: number;
}

/** 充电热力图数据点 */
export interface ChargeHeatPoint {
  /** 区域 x 坐标（0-1 归一化） */
  x: number;
  /** 区域 y 坐标（0-1 归一化） */
  y: number;
  /** 使用率（0-100） */
  value: number;
}
