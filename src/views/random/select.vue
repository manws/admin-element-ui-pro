<template>
  <div class="app-container random-select">
    <!-- 页头 Hero -->
    <div class="page-hero mb-4">
      <div class="hero-text">
        <h1 class="hero-title">随机选择</h1>
        <p class="hero-desc">通过问答式评估，智能推荐最适合的临床试验随机化方法</p>
      </div>
      <el-tag class="hero-tag" effect="plain" size="large" round>RANDOM SELECTOR</el-tag>
      <div class="hero-watermark">RS</div>
    </div>

    <!-- 选择流程 + 输出内容 -->
    <el-row :gutter="16" class="mb-4" style="align-items:stretch">
      <el-col :lg="16" :xs="24">
        <div class="algo-card">
          <div class="algo-card-header">
            <div class="algo-card-icon"><div class="i-svg:el-icon-Document" style="width:16px;height:16px" /></div>
            <span>选择流程</span>
          </div>
          <div class="algo-body">
            <h3>随机化方法选择</h3>
            <h4>第一步：特性与场景对比</h4>
            <p>先比较简单随机、分层随机、分层区组随机、最小化随机在协变量平衡、人数平衡、实施复杂度和系统依赖上的差异。</p>
            <h4>第二步：伦理与目标筛查</h4>
            <p>判断本研究更偏向"保留充分随机性"还是"优先追求过程平衡"，并明确是否重点控制协变量与人数偏差。</p>
            <h4>第三步：环境硬约束与复杂度评分</h4>
            <p>结合 IWRS/EDC 支持、执行团队成熟度、多中心规模与区组可预测性风险，对候选方法做可实施性筛查。</p>
            <h4>第四步：样本量与大数定律评估</h4>
            <p>样本量越大，简单随机越能依靠大数定律自然收敛；样本量越小、因素越多，越需要分层或最小化类方法辅助。</p>
          </div>
        </div>
      </el-col>
      <el-col :lg="8" :xs="24">
        <div class="param-sidebar">
          <div class="param-sidebar-header"><div class="param-sidebar-icon"><div class="i-svg:el-icon-InfoFilled" style="width:14px;height:14px;color:var(--el-color-primary)" /></div><span>输出内容</span></div>
          <div class="param-sidebar-list">
            <div class="param-sidebar-item"><div class="param-sidebar-num">01</div><div><div class="param-sidebar-name">方法比较矩阵</div><div class="param-sidebar-desc">用表格整理各随机化方法的核心机制、均衡能力、实施难度与典型适用场景，便于会议讨论。</div></div></div>
            <div class="param-sidebar-item"><div class="param-sidebar-num">02</div><div><div class="param-sidebar-name">决策结果</div><div class="param-sidebar-desc">给出推荐指数、硬约束提示、复杂度量化评分以及次优备选方案，帮助快速做技术路线选择。</div></div></div>
            <div class="param-sidebar-item"><div class="param-sidebar-num">03</div><div><div class="param-sidebar-name">随机化方案摘要</div><div class="param-sidebar-desc">自动输出参数建议、预期平衡度、操作难度评分与执行提示，可直接作为随机化方案讨论稿。</div></div></div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 方法对比表 -->
    <el-card shadow="never" class="mb-4">
      <template #header><span class="font-bold">随机化方法对比</span></template>
      <el-table :data="methodRows" size="small" stripe border>
        <el-table-column prop="title" label="方法" width="120" />
        <el-table-column prop="mechanism" label="核心机制" min-width="200" />
        <el-table-column prop="covariate" label="协变量平衡" width="130" />
        <el-table-column prop="count" label="人数平衡" width="120" />
        <el-table-column prop="difficulty" label="操作难度" width="140" />
        <el-table-column prop="systemNeed" label="系统依赖" width="80" />
        <el-table-column prop="scene" label="典型应用场景" min-width="200" />
      </el-table>
    </el-card>

    <!-- 问答决策器 -->
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">临床试验随机化问答决策器</span><span class="text-xs text-gray">逐题选择 / 每题单选 / 完成后生成结果</span></div></template>

      <!-- 进度 -->
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-bold">已完成 {{ answeredCount }} / {{ questions.length }} 题</span>
        <span class="text-xs text-gray">第 {{ currentIdx + 1 }} 题 / 共 {{ questions.length }} 题</span>
      </div>
      <el-progress :percentage="Math.round((answeredCount / questions.length) * 100)" :show-text="false" :stroke-width="8" class="mb-4" />

      <!-- 当前题目 -->
      <div class="mb-2"><el-tag size="small" effect="plain">问答模式</el-tag></div>
      <h3 class="text-lg font-bold mb-1">{{ currentQ.title }}</h3>
      <p class="text-xs text-gray mb-4">{{ currentQ.description }}</p>

      <el-row :gutter="12" class="mb-4">
        <el-col v-for="opt in currentQ.options" :key="opt.value" :lg="6" :md="8" :xs="12">
          <div class="option-card" :class="{ active: answers[currentQ.id] === opt.value }" @click="selectOption(currentQ.id, opt.value)">
            <div class="font-bold mb-1">{{ opt.label }}</div>
            <div class="text-xs text-gray">{{ opt.description }}</div>
          </div>
        </el-col>
      </el-row>

      <!-- 导航按钮 -->
      <div class="flex justify-between items-center">
        <el-button :disabled="currentIdx === 0" @click="currentIdx--">上一题</el-button>
        <div class="flex gap-2">
          <el-button @click="resetAll">重新答题</el-button>
          <el-button type="primary" :disabled="!answers[currentQ.id]" @click="goNext">
            {{ currentIdx === questions.length - 1 ? '生成结果' : '下一题' }}
          </el-button>
        </div>
      </div>

      <!-- 回答概览 -->
      <div class="answer-overview">
        <div class="flex justify-between items-center mb-2 mt-4"><strong class="text-sm">当前回答概览</strong><span class="text-xs text-gray">每题单选，可随时返回修改</span></div>
        <el-row :gutter="8">
          <el-col v-for="(q, qi) in questions" :key="q.id" :lg="4" :md="6" :xs="8">
            <div class="answer-chip" :class="{ pending: !answers[q.id] }">
              <div class="text-xs font-bold" style="color:var(--el-color-primary)">Q{{ qi + 1 }}</div>
              <div class="text-xs text-gray">{{ q.summaryLabel }}</div>
              <div class="text-xs font-bold">{{ answers[q.id] ? getLabel(q.id, answers[q.id]) : '待回答' }}</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 统计指标 -->
    <el-row :gutter="16" class="mb-4">
      <el-col :lg="6" :md="6" :xs="12"><div class="metric-card mc-blue" data-watermark="★"><div class="mc-content"><div class="mc-label">推荐方法</div><div class="mc-value mc-value-sm">{{ result.winnerTitle }}</div><div class="mc-sub">{{ result.runnerUpHint }}</div></div><div class="mc-icon"><div class="i-svg:el-icon-Trophy" /></div></div></el-col>
      <el-col :lg="6" :md="6" :xs="12"><div class="metric-card mc-green" data-watermark="⭐"><div class="mc-content"><div class="mc-label">推荐指数</div><div class="mc-value mc-value-sm">{{ result.starsText }}</div><div class="mc-sub">综合得分 {{ result.winnerScore }}</div></div><div class="mc-icon"><div class="i-svg:el-icon-StarFilled" /></div></div></el-col>
      <el-col :lg="6" :md="6" :xs="12"><div class="metric-card mc-amber" data-watermark="∞"><div class="mc-content"><div class="mc-label">大数定律评估</div><div class="mc-value mc-value-sm">{{ result.llnLabel }}</div><div class="mc-sub">{{ result.llnDetail }}</div></div><div class="mc-icon"><div class="i-svg:el-icon-TrendCharts" /></div></div></el-col>
      <el-col :lg="6" :md="6" :xs="12"><div class="metric-card mc-neutral" data-watermark="!"><div class="mc-content"><div class="mc-label">硬约束数</div><div class="mc-value">{{ result.constraintCount }}</div><div class="mc-sub">{{ result.constraintHint }}</div></div><div class="mc-icon"><div class="i-svg:el-icon-Warning" /></div></div></el-col>
    </el-row>

    <!-- 决策说明 + 方案摘要 -->
    <el-row :gutter="16" class="mb-4" style="align-items:stretch">
      <el-col :lg="12" :xs="24" style="display:flex">
        <el-card shadow="never" style="flex:1">
          <template #header><span class="font-bold">决策说明</span></template>
          <div class="text-sm leading-relaxed" v-html="result.narrativeHtml" />
        </el-card>
      </el-col>
      <el-col :lg="12" :xs="24" style="display:flex">
        <el-card shadow="never" style="flex:1">
          <template #header><span class="font-bold">随机化方案摘要</span></template>
          <div class="text-sm leading-relaxed" v-html="result.summaryHtml" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 评分明细 -->
    <el-card shadow="never" class="mb-4">
      <template #header><span class="font-bold">评分明细</span></template>
      <el-table :data="result.scoreRows" size="small" stripe border>
        <el-table-column prop="title" label="方法" width="120" />
        <el-table-column prop="score" label="总分" width="80">
          <template #default="{ row }"><el-tag :type="row.isWinner ? 'success' : 'info'" size="small" effect="plain">{{ row.available ? row.score : '--' }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="conclusion" label="结论" width="100">
          <template #default="{ row }"><el-tag :type="row.isWinner ? 'success' : row.available ? 'warning' : 'danger'" size="small">{{ row.conclusion }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="covariate" label="协变量平衡" width="130" />
        <el-table-column prop="count" label="人数平衡" width="120" />
        <el-table-column prop="difficulty" label="操作难度" width="140" />
        <el-table-column prop="noteText" label="说明" min-width="240" />
      </el-table>
    </el-card>

    <!-- 参考文献 -->
    <div class="ref-card mb-4">
      <div class="ref-card-header">
        <div class="ref-card-icon"><div class="i-svg:el-icon-Collection" style="width:16px;height:16px" /></div>
        <span>参考文献</span>
        <span class="ref-card-count">{{ references.length }} 篇</span>
      </div>
      <div class="ref-card-body">
        <div v-for="(ref, i) in references" :key="i" class="ref-item">
          <div class="ref-num">{{ i + 1 }}</div>
          <div class="ref-content">
            <div class="ref-authors">{{ ref.authors }}</div>
            <div class="ref-title">{{ ref.title }}</div>
            <div class="ref-source">
              <span class="ref-journal">{{ ref.journal }}</span>
              <span v-if="ref.year" class="ref-year">{{ ref.year }}</span>
              <span v-if="ref.volume" class="ref-volume">{{ ref.volume }}</span>
              <el-tag v-if="ref.doi" size="small" effect="plain" class="ref-doi" @click="openDoi(ref.doi)">DOI</el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "RandomSelect" });

// ===== 方法目录 =====
const methodCatalog: Record<string, any> = {
  simple: { title: "简单随机", mechanism: "完全依赖随机数，不预先控制协变量或区组结构。", covariate: "中到高", count: "中", difficulty: "⭐ 极易", systemNeed: "低", scene: "样本量较大、关键协变量较少。" },
  stratified: { title: "分层随机", mechanism: "先按关键因素分层，再在各层内独立做随机分配。", covariate: "中到低", count: "中", difficulty: "⭐⭐ 较易", systemNeed: "中", scene: "关键协变量有限且明确。" },
  stratifiedBlock: { title: "分层区组随机", mechanism: "先分层，再在各层内用区组随机控制分配比例。", covariate: "低", count: "低/接近0", difficulty: "⭐⭐⭐ 中等", systemNeed: "中", scene: "中小样本、多中心。" },
  minimization: { title: "最小化随机", mechanism: "逐例比较进入各组后的失衡分，以高概率分配到更平衡的一组。", covariate: "低", count: "低", difficulty: "⭐⭐⭐⭐⭐ 难", systemNeed: "高", scene: "样本量有限、关键因素较多。" },
};
const methodRows = Object.values(methodCatalog);

// ===== 问题流 =====
const questions = [
  { id: "sampleSize", summaryLabel: "样本量", title: "计划样本量大概是多少？", description: "样本量越大，简单随机越可能依赖大数定律自然平衡。", options: [{ value: "small", label: "120例以下", description: "偏小样本" }, { value: "medium", label: "120-299例", description: "中等样本" }, { value: "large", label: "300例及以上", description: "较大样本" }] },
  { id: "centerScale", summaryLabel: "中心规模", title: "研究中心规模属于哪一种？", description: "中心越多，越需要关注中心间差异。", options: [{ value: "single", label: "单中心", description: "执行链条更短" }, { value: "limited", label: "2-5个中心", description: "需兼顾中心差异" }, { value: "multi", label: "6个及以上", description: "多中心需重点控制" }] },
  { id: "factorScope", summaryLabel: "关键因素", title: "需要重点控制的关键因素有多少？", description: "因素越多，最小化随机的优势越明显。", options: [{ value: "limited", label: "1-2个", description: "少量核心因素" }, { value: "standard", label: "3-4个", description: "适合分层决策" }, { value: "complex", label: "5个及以上", description: "动态方法更有优势" }] },
  { id: "ratio", summaryLabel: "分配比例", title: "试验分配比例更接近哪一种？", description: "非1:1分配更需要关注人数偏差。", options: [{ value: "1:1", label: "1:1", description: "最常见" }, { value: "2:1", label: "2:1", description: "探索性设计" }, { value: "3:1", label: "3:1", description: "不等比分配" }] },
  { id: "covariatePriority", summaryLabel: "协变量目标", title: "对协变量平衡的要求有多高？", description: "目标越高，越需要分层或最小化。", options: [{ value: "low", label: "一般", description: "总体随机即可" }, { value: "medium", label: "较高", description: "关键协变量尽量平衡" }, { value: "high", label: "很高", description: "核心目标" }] },
  { id: "countPriority", summaryLabel: "人数目标", title: "对各组人数过程平衡要求有多高？", description: "目标越高，越偏向区组方法。", options: [{ value: "low", label: "一般", description: "接受波动" }, { value: "medium", label: "较高", description: "减少偏差" }, { value: "high", label: "很高", description: "严格控制" }] },
  { id: "ethics", summaryLabel: "伦理侧重", title: "伦理与目标侧重更接近哪一种？", description: "在随机性与平衡性之间取舍。", options: [{ value: "randomness", label: "随机性优先", description: "重视不可预测性" }, { value: "hybrid", label: "并重", description: "兼顾随机与平衡" }, { value: "balanced", label: "平衡性优先", description: "持续控制失衡" }] },
  { id: "systemSupport", summaryLabel: "系统支持", title: "当前系统支持条件？", description: "最小化随机通常依赖实时系统。", options: [{ value: "none", label: "无集中系统", description: "纸质或离线" }, { value: "local", label: "基础电子系统", description: "常规操作可用" }, { value: "iwrs", label: "IWRS/EDC实时", description: "可承接复杂随机" }] },
  { id: "opsLevel", summaryLabel: "团队成熟度", title: "执行团队成熟度？", description: "决定能否稳定执行复杂方案。", options: [{ value: "basic", label: "基础", description: "流程简单为宜" }, { value: "medium", label: "中等", description: "可承担分层执行" }, { value: "advanced", label: "成熟", description: "可执行复杂随机" }] },
  { id: "predictability", summaryLabel: "可预测性", title: "对区组可预测性的顾虑？", description: "若研究者可能预判后续分组。", options: [{ value: "low", label: "顾虑较低", description: "区组可正常使用" }, { value: "high", label: "顾虑较高", description: "需变区组或更低可预测方法" }] },
];

const currentIdx = ref(0);
const answers = reactive<Record<string, string>>({});
const generated = ref(false);

const currentQ = computed(() => questions[currentIdx.value]);
const answeredCount = computed(() => questions.filter(q => answers[q.id]).length);

function getLabel(qId: string, val: string) {
  const q = questions.find(q => q.id === qId);
  return q?.options.find(o => o.value === val)?.label || val;
}

function selectOption(qId: string, val: string) {
  const prev = answers[qId];
  answers[qId] = val;
  if (generated.value && prev !== val) { generated.value = false; evaluate(); }
}

function goNext() {
  if (currentIdx.value < questions.length - 1) { currentIdx.value++; return; }
  generated.value = true;
  evaluate();
}

function resetAll() {
  currentIdx.value = 0;
  Object.keys(answers).forEach(k => delete answers[k]);
  generated.value = false;
  evaluate();
}

// ===== 评估引擎 =====
interface EvalResult { winnerTitle: string; winnerScore: number; runnerUpHint: string; starsText: string; llnLabel: string; llnDetail: string; constraintCount: number; constraintHint: string; narrativeHtml: string; summaryHtml: string; scoreRows: any[]; }

const result = ref<EvalResult>({
  winnerTitle: "-", winnerScore: 0, runnerUpHint: "完成问答后生成", starsText: "-", llnLabel: "-", llnDetail: "等待判断",
  constraintCount: 0, constraintHint: "等待识别", narrativeHtml: "请完成全部问答后生成结果。", summaryHtml: "", scoreRows: [],
});

function evaluate() {
  const missing = questions.find(q => !answers[q.id]);
  if (missing) {
    result.value = { winnerTitle: "-", winnerScore: 0, runnerUpHint: "完成问答后生成", starsText: "-", llnLabel: "-", llnDetail: "等待判断", constraintCount: 0, constraintHint: "等待识别", narrativeHtml: "请完成全部问答后生成结果。", summaryHtml: "", scoreRows: [] };
    return;
  }

  const a = answers;
  const scores: Record<string, number> = { simple: 60, stratified: 58, stratifiedBlock: 62, minimization: 60 };
  const notes: Record<string, string[]> = { simple: [], stratified: [], stratifiedBlock: [], minimization: [] };
  const available: Record<string, boolean> = { simple: true, stratified: true, stratifiedBlock: true, minimization: true };
  const constraints: string[] = [];

  function add(k: string, d: number, r?: string) { scores[k] += d; if (r) notes[k].push(r); }

  // 样本量
  if (a.sampleSize === "large") { add("simple", 14, "大样本可依赖大数定律"); add("stratifiedBlock", 4); add("minimization", -2); }
  else if (a.sampleSize === "medium") { add("stratified", 8); add("stratifiedBlock", 10); add("minimization", 8); }
  else { add("simple", -12, "小样本波动大"); add("stratified", 10); add("stratifiedBlock", 14); add("minimization", 18, "小样本最小化优势最大"); }

  // 因素
  if (a.factorScope === "complex") { add("simple", -14); add("minimization", 18, "多因素最小化更优"); }
  else if (a.factorScope === "standard") { add("simple", -8); add("stratified", 10); add("stratifiedBlock", 10); add("minimization", 12); }
  else { add("simple", 4); }

  // 中心
  if (a.centerScale === "multi") { add("simple", -4); add("stratified", 10); add("stratifiedBlock", 10); add("minimization", 6); }
  else if (a.centerScale === "limited") { add("stratified", 6); add("stratifiedBlock", 8); }
  else { add("simple", 4); }

  // 协变量
  if (a.covariatePriority === "high") { add("simple", -12); add("stratified", 12); add("stratifiedBlock", 14); add("minimization", 18); }
  else if (a.covariatePriority === "medium") { add("simple", -4); add("stratified", 6); add("stratifiedBlock", 8); add("minimization", 10); }

  // 人数
  if (a.countPriority === "high") { add("simple", -8); add("stratifiedBlock", 16); add("minimization", 8); }
  else if (a.countPriority === "medium") { add("stratifiedBlock", 10); }

  // 伦理
  if (a.ethics === "randomness") { add("simple", 12); add("minimization", -10); }
  else if (a.ethics === "balanced") { add("simple", -10); add("stratifiedBlock", 12); add("minimization", 16); }

  // 系统
  if (a.systemSupport === "none") { available.minimization = false; constraints.push("无实时系统，最小化不可选"); }
  else if (a.systemSupport === "local") { add("minimization", -6); }
  else { add("minimization", 10); }

  // 团队
  if (a.opsLevel === "basic") { add("simple", 8); add("stratifiedBlock", -6); add("minimization", -18); constraints.push("基础团队不适合复杂随机"); }
  else if (a.opsLevel === "advanced") { add("stratifiedBlock", 8); add("minimization", 12); }

  // 可预测性
  if (a.predictability === "high") { add("simple", 4); add("stratifiedBlock", -8); add("minimization", 4); constraints.push("区组可预测性风险"); }

  // 排名
  const ranked = Object.keys(methodCatalog).map(k => ({
    key: k, ...methodCatalog[k], available: available[k], score: available[k] ? scores[k] : -999,
    noteText: notes[k].slice(0, 3).join("；") || "无额外说明",
  })).sort((a, b) => b.score - a.score);

  const winner = ranked.find(r => r.available)!;
  const runner = ranked.filter(r => r.available)[1];
  let stars = winner.score >= 88 ? 5 : winner.score >= 76 ? 4 : winner.score >= 64 ? 3 : 2;
  if (runner && winner.score - runner.score < 5 && stars > 3) stars--;
  if (constraints.length >= 3 && stars > 3) stars--;
  stars = Math.max(2, Math.min(5, stars));

  // 大数定律
  const sampleMap: Record<string, number> = { small: 80, medium: 180, large: 360 };
  const ss = sampleMap[a.sampleSize] || 180;
  let llnLabel = "部分可依赖", llnDetail = "中等样本量";
  if (ss >= 300 && a.factorScope === "limited") { llnLabel = "可较多依赖"; llnDetail = "大样本+少因素，简单随机可收敛"; }
  else if (ss < 120) { llnLabel = "依赖不足"; llnDetail = "小样本需受控方法"; }

  const scoreRows = ranked.map((r, i) => ({
    ...r, isWinner: i === 0 && r.available,
    conclusion: !r.available ? "受限" : i === 0 ? "推荐" : "备选",
  }));

  result.value = {
    winnerTitle: winner.title,
    winnerScore: winner.score,
    runnerUpHint: runner ? `次优：${runner.title}（${runner.score}分）` : "无次优",
    starsText: "⭐".repeat(stars),
    llnLabel, llnDetail,
    constraintCount: constraints.length,
    constraintHint: constraints[0] || "无硬约束",
    narrativeHtml: `当前场景为 <strong>${ss}</strong> 例，综合评估后推荐 <strong>${winner.title}</strong>，综合得分 <strong>${winner.score}</strong>。${runner ? `次优方案 ${runner.title}（${runner.score}分）。` : ''}${constraints.length ? '<br/><br/>硬约束提示：' + constraints.join('；') : ''}`,
    summaryHtml: `<div style="padding:12px;border-radius:12px;background:rgba(var(--el-color-primary-rgb,64,158,255),0.04);margin-bottom:12px"><strong style="font-size:18px">${winner.title}</strong> <span style="font-size:12px;color:var(--el-color-primary)">${"⭐".repeat(stars)} ${stars}星推荐</span><p style="margin:8px 0 0;font-size:13px;color:#666">综合考虑伦理、系统支持、执行复杂度与大数定律影响后的推荐方案。</p></div><p>该建议基于当前 ${questions.length} 道问答的综合评分，可返回修改答案重新生成。</p>`,
    scoreRows,
  };
}

const references = [
  { authors: "Suresh KP.", title: "An overview of randomization techniques: an unbiased assessment of outcome in clinical research.", journal: "Journal of Human Reproductive Sciences", year: "2011", volume: "4(1): 8-11", doi: "10.4103/0974-1208.82352" },
  { authors: "Schulz KF, Grimes DA.", title: "Generation of allocation sequences in randomised trials: chance, not choice.", journal: "The Lancet", year: "2002", volume: "359(9305): 515-519", doi: "10.1016/S0140-6736(02)07683-3" },
  { authors: "Rosenberger WF, Lachin JM.", title: "Randomization in Clinical Trials: Theory and Practice.", journal: "John Wiley & Sons", year: "2015", volume: "2nd Edition", doi: "10.1002/9781118742112" },
  { authors: "Pocock SJ, Simon R.", title: "Sequential treatment assignment with balancing for prognostic factors in the controlled clinical trial.", journal: "Biometrics", year: "1975", volume: "31(1): 103-115", doi: "10.2307/2529712" },
  { authors: "ICH Expert Working Group.", title: "ICH E9: Statistical Principles for Clinical Trials.", journal: "International Council for Harmonisation", year: "1998", volume: "Step 4 Guideline", doi: "" },
];
function openDoi(doi: string) { if (doi) window.open(`https://doi.org/${doi}`, "_blank"); }

onMounted(evaluate);
</script>

<style scoped>
@import './random-shared.css';

.param-list { display: grid; gap: 12px; }
.param-item { padding: 12px 14px; border-radius: 12px; background: rgba(255,255,255,0.3); border: 1px solid var(--el-border-color-lighter); }

.option-card {
  padding: 14px;
  border: 1.5px solid var(--el-border-color-lighter);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 12px;
  min-height: 80px;
}
.option-card:hover {
  border-color: var(--el-color-primary-light-3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}
.option-card.active {
  border-color: var(--el-color-primary);
  background: rgba(69, 88, 208, 0.04);
  box-shadow: 0 4px 20px rgba(69, 88, 208, 0.08);
}

.answer-chip {
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
  margin-bottom: 8px;
  min-height: 60px;
}
.answer-chip.pending { opacity: 0.5; }
</style>
