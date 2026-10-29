import request from "@/utils/request";
import { isMockEnabled } from "@/mock";
import {
  mockGetTerminals,
  mockGetBatteries,
  mockGetBmsVendors,
  mockGetCompanies,
  mockSaveTerminal,
  mockDeleteTerminals,
  mockSaveBattery,
  mockDeleteBatteries,
  mockSaveBmsVendor,
  mockDeleteBmsVendors,
} from "@/mock/base";
import type { BatteryType, BmsVendor, TerminalType } from "@/types/api/monitor";

const BASE_URL = "/api/v1/base";

/** 基础数据模块 API */
const BaseAPI = {
  /** 终端类型分页 */
  getTerminals(params: any): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockGetTerminals(params));
    return request({ url: `${BASE_URL}/terminals`, method: "get", params });
  },
  saveTerminal(data: TerminalType): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockSaveTerminal(data));
    return request({ url: `${BASE_URL}/terminals`, method: "post", data });
  },
  deleteTerminals(ids: string): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockDeleteTerminals(ids));
    return request({ url: `${BASE_URL}/terminals/${ids}`, method: "delete" });
  },

  /** 电池类型分页 */
  getBatteries(params: any): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockGetBatteries(params));
    return request({ url: `${BASE_URL}/batteries`, method: "get", params });
  },
  saveBattery(data: BatteryType): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockSaveBattery(data));
    return request({ url: `${BASE_URL}/batteries`, method: "post", data });
  },
  deleteBatteries(ids: string): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockDeleteBatteries(ids));
    return request({ url: `${BASE_URL}/batteries/${ids}`, method: "delete" });
  },

  /** BMS 厂家分页 */
  getBmsVendors(params: any): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockGetBmsVendors(params));
    return request({ url: `${BASE_URL}/bms-vendors`, method: "get", params });
  },
  saveBmsVendor(data: BmsVendor): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockSaveBmsVendor(data));
    return request({ url: `${BASE_URL}/bms-vendors`, method: "post", data });
  },
  deleteBmsVendors(ids: string): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockDeleteBmsVendors(ids));
    return request({ url: `${BASE_URL}/bms-vendors/${ids}`, method: "delete" });
  },

  /** 运营分公司字典 */
  getCompanies(): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockGetCompanies());
    return request({ url: `${BASE_URL}/companies`, method: "get" });
  },
};

export default BaseAPI;
