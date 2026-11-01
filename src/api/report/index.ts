import request from "@/utils/request";
import { isMockEnabled } from "@/mock";
import { mockArchiveReport, mockCreateReport, mockGetReports } from "@/mock/base";

const REPORT_BASE_URL = "/api/v1/report";

/** 报告中心 API */
const ReportAPI = {
  /** 报告分页列表 */
  getReports(params: any): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockGetReports(params));
    return request({ url: `${REPORT_BASE_URL}/page`, method: "get", params });
  },
  archiveReport(id: number): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockArchiveReport(id));
    return request({ url: `${REPORT_BASE_URL}/${id}/archive`, method: "post" });
  },
  createReport(type: string): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockCreateReport(type));
    return request({ url: `${REPORT_BASE_URL}`, method: "post", data: { type } });
  },
};

export default ReportAPI;
