/**
 * 通用 API 类型定义
 */

/** API 响应结构 */
export interface ApiResponse<T = any> {
  /** 响应码 */
  code: number;
  /** 响应数据 */
  result: T;
  /** 响应消息 */
  message: string;
}

/** 基础查询参数 */
export interface BaseQueryParams {
  /** 页码 */
  pageIndex: number;
  /** 每页记录数 */
  pageSize: number;
}

/** 分页数据结构 */
export interface PageResult<T> {
  /** 数据列表 */
  list: T[];
  /** 总记录数 */
  total: number;
  /** 分页信息 */
  page?: {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
  };
}

/** 下拉选项 */
export interface OptionItem {
  /** 选项值 */
  value: string | number;
  /** 选项标签 */
  label: string;
  /** 子选项 */
  children?: OptionItem[];
}

/** Excel 导入结果 */
export interface ExcelResult {
  /** 响应码 */
  code: number;
  /** 无效数据数量 */
  invalidCount: number;
  /** 有效数据数量 */
  validCount: number;
  /** 错误信息列表 */
  messageList: string[];
}
