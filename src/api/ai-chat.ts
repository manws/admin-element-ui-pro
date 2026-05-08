/**
 * AI 聊天接口 - 支持通义千问 / 豆包 / DeepSeek 等 OpenAI 兼容格式
 *
 * 配置说明：
 * 1. 通义千问：baseURL = "https://dashscope.aliyuncs.com/compatible-mode/v1", model = "qwen-plus"
 * 2. 豆包(字节)：baseURL = "https://ark.cn-beijing.volces.com/api/v3", model = 你的endpoint id
 * 3. DeepSeek：baseURL = "https://api.deepseek.com/v1", model = "deepseek-chat"
 * 4. 硅基流动：baseURL = "https://api.siliconflow.cn/v1", model = "Qwen/Qwen2.5-72B-Instruct"
 */

export interface AIChatConfig {
  /** API 基础地址 */
  baseURL: string;
  /** API Key */
  apiKey: string;
  /** 模型名称 */
  model: string;
  /** 系统提示词（基础角色） */
  systemPrompt?: string;
  /** 启用的技能 ID 列表 */
  enabledSkills?: string[];
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** 技能定义 */
export interface AISkill {
  id: string;
  name: string;
  description: string;
  /** 追加到 system prompt 的指令 */
  prompt: string;
}

// ========== 技能库 ==========
export const aiSkills: AISkill[] = [
  {
    id: "sample-size",
    name: "样本量计算专家",
    description: "精通各类临床试验样本量计算公式与软件操作",
    prompt: `【样本量计算技能】
你精通以下样本量计算场景，能给出完整公式、参数说明和计算步骤：
- 两独立样本均值比较（t检验）
- 两独立样本率比较（卡方/Fisher）
- 配对设计均数/率比较
- 非劣效性/等效性设计
- 优效性设计
- 生存分析（LogRank检验）
- 诊断试验（灵敏度/特异度）
- 多组比较（方差分析）
计算时请明确：α水平、检验效能(1-β)、效应量、分配比例、脱落率等参数。给出 PASS/nQuery/G*Power 等软件的操作建议。`,
  },
  {
    id: "randomization",
    name: "随机化方案设计",
    description: "擅长各种随机分组方案设计与实施",
    prompt: `【随机化设计技能】
你精通以下随机化方案并能为具体研究推荐最佳方案：
- 简单随机化
- 区组随机化（固定/可变区组长度）
- 分层区组随机化
- 最小化随机法（Pocock & Simon）
- 中心随机化
- 动态随机化
- 整群随机化
能分析各方案的优劣、适用条件，提供 SAS/R 实现代码，并考虑实施中的盲法保护。`,
  },
  {
    id: "stat-methods",
    name: "统计方法选择",
    description: "根据研究设计和数据类型推荐合适的统计方法",
    prompt: `【统计方法选择技能】
你能根据以下信息推荐最合适的统计分析方法：
- 研究设计类型（RCT、队列、病例对照、横断面等）
- 结局变量类型（连续、分类、有序、生存时间）
- 分组情况（两组/多组/配对/重复测量）
- 数据分布（正态/偏态/非参数）
- 混杂控制需求
推荐时说明：方法名称、适用前提、检验假设、效应量指标、软件实现(SAS/R/SPSS)，以及结果解读要点。`,
  },
  {
    id: "meta-analysis",
    name: "Meta分析",
    description: "系统评价与Meta分析方法学指导",
    prompt: `【Meta分析技能】
你精通系统评价与Meta分析的全流程：
- 文献检索策略（PICOS框架）
- 质量评价工具（RoB 2、ROBINS-I、NOS等）
- 效应量计算（OR/RR/HR/MD/SMD）
- 异质性检验（Q检验、I²统计量）
- 固定效应与随机效应模型选择
- 亚组分析与Meta回归
- 发表偏倚检测（漏斗图、Egger检验）
- 敏感性分析
- 网状Meta分析（NMA）
能提供 RevMan/Stata/R(meta/metafor包) 的操作指导。`,
  },
  {
    id: "report-writing",
    name: "统计报告撰写",
    description: "指导统计分析报告和论文统计部分的撰写",
    prompt: `【统计报告撰写技能】
你能指导以下内容的规范撰写：
- 统计分析计划（SAP）的结构与要素
- 论文方法学部分的统计描述（符合CONSORT/STROBE/PRISMA声明）
- 统计结果的规范报告（P值、置信区间、效应量）
- 统计表格与图形的制作规范
- 审稿人统计相关意见的回复
遵循 ICMJE、各大期刊统计报告指南的要求。`,
  },
  {
    id: "r-programming",
    name: "R语言编程",
    description: "提供R语言统计分析代码",
    prompt: `【R语言编程技能】
你能提供高质量的R语言代码用于：
- 数据清洗与预处理（tidyverse）
- 描述性统计与可视化（ggplot2）
- 假设检验与回归分析
- 生存分析（survival、survminer）
- 混合效应模型（lme4、nlme）
- 倾向性评分匹配（MatchIt）
- 样本量计算（pwr、gsDesign）
- 随机化方案生成（blockrand、randomizeR）
代码要求：注释清晰、可直接运行、包含结果解读。`,
  },
];

// ========== 在这里配置你的模型 ==========
// 切换不同模型只需修改这个配置
export const aiConfig: AIChatConfig = {
  // --- 硅基流动 ---
  baseURL: "https://api.siliconflow.cn/v1",
  apiKey: "sk-myaeguyrdqshgdqostdrtvykuwxiqqmjjrcecygmezvotnlp",
  model: "Qwen/Qwen2.5-7B-Instruct", // 免费模型，不消耗余额，72B 比 7B 专业能力强很多要花钱

  // --- 豆包（字节跳动） ---
  // baseURL: "https://ark.cn-beijing.volces.com/api/v3",
  // apiKey: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  // model: "ep-xxxxxxxxxxxxxxx",

  // --- DeepSeek ---
  // baseURL: "https://api.deepseek.com/v1",
  // apiKey: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  // model: "deepseek-chat",

  systemPrompt: `你是一位拥有生物统计学博士学位的资深医学统计顾问，在三甲医院临床研究中心和CRO公司工作超过15年。你的专业领域包括：

**核心能力：**
- 临床试验设计（I-IV期、真实世界研究、适应性设计）
- 样本量与检验效能计算
- 随机化方案设计与实施
- 统计分析计划（SAP）撰写
- 主要终点与次要终点的统计分析
- 缺失数据处理策略（MMRM、MI、LOCF等）
- 多重比较校正（Bonferroni、Holm、FDR等）
- 期中分析与数据监查委员会（DMC/DSMB）

**回答原则：**
1. 以循证医学和ICH-E9/E9(R1)指导原则为基础
2. 引用权威文献和指南时标注来源（如CONSORT、STROBE、ICH等）
3. 区分探索性分析和验证性分析的严谨程度
4. 对于样本量计算，必须说明：假设来源、α水平、检验效能、效应量依据、预期脱落率
5. 给出具体公式时同时说明各参数的临床含义
6. 涉及争议性问题时，给出不同学派观点并说明主流共识
7. 对常见误用（如P值解读、多重比较不校正、过度拟合）主动提示纠正
8. 必要时建议咨询统计师或提交伦理审查的注意事项

**输出格式要求：**
- 使用 Markdown 格式组织内容（标题、加粗、列表、表格）
- 公式用文字说明 + 符号表达双重呈现
- 复杂问题分步骤回答，每步有小结
- 给出实际案例辅助理解
- 结尾附"注意事项"或"常见陷阱"提醒`,

  // 启用的技能（填入 skill id），留空或注释则不启用额外技能
  enabledSkills: ["sample-size", "randomization", "stat-methods", "meta-analysis", "report-writing", "r-programming"],
};

/**
 * 流式调用 AI Chat（SSE）
 * @param messages 对话消息列表
 * @param onChunk 每收到一个 token 的回调
 * @param onDone 完成回调
 * @param onError 错误回调
 * @param signal 可选的 AbortSignal，用于中断请求
 */
export async function streamChat(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: Error) => void,
  signal?: AbortSignal,
) {
  const { baseURL, apiKey, model, systemPrompt, enabledSkills } = aiConfig;

  // 构建完整的 system prompt = 基础角色 + 启用的技能
  let fullSystemPrompt = systemPrompt || "";
  if (enabledSkills && enabledSkills.length > 0) {
    const skillPrompts = enabledSkills
      .map((id) => aiSkills.find((s) => s.id === id))
      .filter(Boolean)
      .map((s) => s!.prompt)
      .join("\n\n");
    if (skillPrompts) {
      fullSystemPrompt += `\n\n--- 以下是你具备的专业技能 ---\n\n${skillPrompts}`;
    }
  }

  const allMessages: ChatMessage[] = [];
  if (fullSystemPrompt) {
    allMessages.push({ role: "system", content: fullSystemPrompt });
  }
  allMessages.push(...messages);

  try {
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: allMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      }),
      signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API 请求失败 (${response.status}): ${errText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("无法读取响应流");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === "data: [DONE]") continue;
        if (!trimmed.startsWith("data: ")) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            onChunk(delta);
          }
        } catch {
          // 忽略解析错误的行
        }
      }
    }

    onDone();
  } catch (err) {
    // 用户主动中断不视为错误
    if (err instanceof DOMException && err.name === "AbortError") {
      onDone();
      return;
    }
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}
