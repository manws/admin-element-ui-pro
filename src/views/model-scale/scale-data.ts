/**
 * 量表信息数据定义（示例数据，需替换为业务正式清单）
 *
 * ⚠️ 以下 4 条为占位示例，仅用于验证页面结构与交互，
 *    正式上线前请由业务方提供准确的量表清单（名称、条目、评分范围、适用人群等）。
 *
 * 当前量表评分功能尚未接入，status 统一为 building，点击提示建设中。
 */

/** 量表状态 */
export type ScaleStatus = "available" | "building";

/** 量表信息 */
export interface ScaleItem {
  /** 量表编号（缩写），如 NIHSS */
  code: string;
  /** 中文名称 */
  nameZh: string;
  /** 英文名称 */
  nameEn: string;
  /** 所属领域 */
  domain: string;
  /** 条目数描述，如 "15 项" */
  itemsCount: string;
  /** 评分范围描述，如 "0 ~ 42 分" */
  scoreRange: string;
  /** 用途说明 */
  purpose: string;
  /** 状态 */
  status: ScaleStatus;
  /** 更新时间 */
  updatedAt: string;
}

/** 量表列表（示例数据） */
export const SCALE_LIST: ScaleItem[] = [
  {
    code: "NIHSS",
    nameZh: "美国国立卫生研究院卒中量表",
    nameEn: "National Institutes of Health Stroke Scale",
    domain: "神经内科 / 卒中",
    itemsCount: "15 项",
    scoreRange: "0 ~ 42 分",
    purpose:
      "评估卒中患者神经功能缺损的严重程度，覆盖意识、视野、面瘫、肢体运动、感觉、语言等维度，用于基线评估、病情监测与预后判断。",
    status: "building",
    updatedAt: "2026-10-29",
  },
  {
    code: "mRS",
    nameZh: "改良 Rankin 量表",
    nameEn: "modified Rankin Scale",
    domain: "神经内科 / 卒中康复",
    itemsCount: "1 项（整体功能评级）",
    scoreRange: "0 ~ 6 级",
    purpose:
      "评估卒中后患者的功能残疾程度与独立生活能力，0 级为完全无症状、6 级为死亡，是卒中临床试验最常用的功能结局指标。",
    status: "building",
    updatedAt: "2026-10-29",
  },
  {
    code: "MMSE",
    nameZh: "简易精神状态检查",
    nameEn: "Mini-Mental State Examination",
    domain: "神经内科 / 认知",
    itemsCount: "30 项",
    scoreRange: "0 ~ 30 分",
    purpose:
      "快速筛查认知功能障碍，覆盖时间/地点定向力、即刻与延迟记忆、注意与计算、语言命名与复述、视空间能力等维度。",
    status: "building",
    updatedAt: "2026-10-29",
  },
  {
    code: "GCS",
    nameZh: "格拉斯哥昏迷量表",
    nameEn: "Glasgow Coma Scale",
    domain: "神经内科 / 重症",
    itemsCount: "3 项（睁眼 / 语言 / 运动）",
    scoreRange: "3 ~ 15 分",
    purpose:
      "评估患者意识障碍程度，由睁眼反应、语言反应、运动反应三个维度相加计分，广泛用于急性脑损伤与重症监护场景。",
    status: "building",
    updatedAt: "2026-10-29",
  },
];
