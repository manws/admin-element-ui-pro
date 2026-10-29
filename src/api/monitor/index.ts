import request from "@/utils/request";
import { isMockEnabled } from "@/mock";
import {
  mockGetVehicles,
  mockGetVehicleDetail,
  mockGetAlarms,
  mockOverviewStats,
  mockChargeCurve,
  mockVehicleHeatmap,
  mockTopMileage,
  mockLatestAlarms,
  mockMonitorStats,
  mockHeatmap,
  mockVehiclePositions,
  mockSaveVehicle,
  mockDeleteVehicles,
  mockModifyVehicle,
} from "@/mock/monitor";
import { mockGetPushRecords } from "@/mock/base";
import type { Vehicle } from "@/types/api/monitor";

const BASE_URL = "/api/v1/monitor";

/** 监控预警模块 API */
const MonitorAPI = {
  /** 车辆分页列表 */
  getVehicles(params: any): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockGetVehicles(params));
    return request({ url: `${BASE_URL}/vehicles`, method: "get", params });
  },
  /** 单车详情 */
  getVehicleDetail(id: number): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockGetVehicleDetail(id));
    return request({ url: `${BASE_URL}/vehicles/${id}`, method: "get" });
  },
  /** 新增/更新车辆 */
  saveVehicle(data: Vehicle): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockSaveVehicle(data));
    return request({ url: `${BASE_URL}/vehicles`, method: "post", data });
  },
  /** 批量删除车辆 */
  deleteVehicles(ids: string): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockDeleteVehicles(ids));
    return request({ url: `${BASE_URL}/vehicles/${ids}`, method: "delete" });
  },
  /** 修改车辆字段 */
  modifyVehicle(data: { id: number; field: string; value: any }): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockModifyVehicle(data));
    return request({ url: `${BASE_URL}/vehicles/modify`, method: "post", data });
  },
  /** 告警分页列表 */
  getAlarms(params: any): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockGetAlarms(params));
    return request({ url: `${BASE_URL}/alarms`, method: "get", params });
  },
  /** 总览统计 */
  getOverviewStats(): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockOverviewStats());
    return request({ url: `${BASE_URL}/overview/stats`, method: "get" });
  },
  /** 24 小时充电曲线 */
  getChargeCurve(): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockChargeCurve());
    return request({ url: `${BASE_URL}/overview/charge-curve`, method: "get" });
  },
  /** 24 小时车辆运行热力图 */
  getVehicleHeatmap(): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockVehicleHeatmap());
    return request({ url: `${BASE_URL}/overview/vehicle-heatmap`, method: "get" });
  },
  /** 单车里程 TOP5 */
  getTopMileage(): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockTopMileage());
    return request({ url: `${BASE_URL}/overview/top-mileage`, method: "get" });
  },
  /** 最新 5 条告警 */
  getLatestAlarms(): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockLatestAlarms());
    return request({ url: `${BASE_URL}/overview/latest-alarms`, method: "get" });
  },
  /** 监控统计面板数据 */
  getMonitorStats(): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockMonitorStats());
    return request({ url: `${BASE_URL}/stats`, method: "get" });
  },
  /** 充电热力图 */
  getHeatmap(): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockHeatmap());
    return request({ url: `${BASE_URL}/heatmap`, method: "get" });
  },
  /** 车辆位置散点 */
  getVehiclePositions(): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockVehiclePositions());
    return request({ url: `${BASE_URL}/positions`, method: "get" });
  },
  /** 推送记录 */
  getPushRecords(params: any): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockGetPushRecords(params));
    return request({ url: `${BASE_URL}/push-records`, method: "get", params });
  },
};

export default MonitorAPI;
