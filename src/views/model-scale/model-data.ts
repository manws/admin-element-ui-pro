/**
 * 模型信息数据定义
 *
 * 说明：当前为前端本地常量，后续接入接口时只需把 MODEL_LIST 换成接口返回即可，
 * 类型 ModelItem 保持不变。
 */

/** 模型状态 */
export type ModelStatus = "available" | "building";

/** 模型信息 */
export interface ModelItem {
  /** 模型编号，如 PROMISE */
  code: string;
  /** 中文名称 */
  nameZh: string;
  /** 英文名称 */
  nameEn: string;
  /** 所属领域 */
  domain: string;
  /** 一句话简介 */
  summary: string;
  /** 输出指标 */
  outputs: string[];
  /** 状态 */
  status: ModelStatus;
  /** 更新时间 */
  updatedAt: string;
}

/** 模型列表 */
export const MODEL_LIST: ModelItem[] = [
  {
    code: "PROMISE",
    nameZh: "症状性颅内动脉狭窄卒中复发风险计算器",
    nameEn:
      "Symptomatic Intracranial Atherosclerotic Stenosis Stroke Recurrence Risk Calculator",
    domain: "神经内科 / 卒中",
    summary:
      "基于 Cox 比例风险模型，评估颅内动脉狭窄 50%-99% 的症状性卒中或 TIA 患者未来 1 年内缺血性卒中复发风险，输出 3/6/12 个月的个体化复发概率。",
    outputs: ["3个月复发风险", "6个月复发风险", "12个月复发风险"],
    status: "available",
    updatedAt: "2026-10-29",
  },
];

/** 按编号查找模型 */
export function getModelByCode(code: string): ModelItem | undefined {
  return MODEL_LIST.find((item) => item.code === code);
}
