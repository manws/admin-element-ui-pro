import request from "@/utils/request";
import { isMockEnabled } from "@/mock";
import { mockGetReports } from "@/mock/base";

const REPORT_BASE_URL = "/api/v1/report";

/** 报告中心 API */
const ReportAPI = {
  /** 报告分页列表 */
  getReports(params: any): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockGetReports(params));
    return request({ url: `${REPORT_BASE_URL}/page`, method: "get", params });
  },
};

export default ReportAPI;
