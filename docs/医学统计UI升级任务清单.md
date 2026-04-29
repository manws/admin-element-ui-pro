# 医学统计模块 UI 统一升级任务清单

> 创建时间：2026-04-29 00:29
> 标杆页面：`basic/descriptive.vue`（已完成）
> 总计需升级：39 个文件（chi-square 6 个 + 旧风格 33 个）

---

## 升级标准（对照 basic/ 标杆）

每个页面必须包含：
1. **page-hero 页头** — 含 hero-title、hero-desc（详细描述）、hero-tag、水印大字
2. **param-sidebar 侧栏** — 检验原理/说明分块、适用场景、公式展示
3. **ref-section 参考文献** — 至少 1 条教材引用
4. **三标准按钮** — 「开始计算」「加载示例」「清除」
5. **统一 CSS 风格** — 14px 圆角卡片、指标卡片 metrics-grid、结果解读 narrative-body
6. **布局对齐** — 结果区统一 12:12 列宽
7. **P 值格式化** — 使用 `S.fmtP()` 显示 `< 0.0001`

---

## 批次 1：卡方检验（6 个文件）— 已有新风格，小改

差距：缺 ref-section、缺"清除"按钮、部分 hero-desc 过短、按钮文案不统一

- [ ] `chi-square/fourfold.vue` — 加 ref-section、"重置数据"改"清除"、加"加载示例"
- [ ] `chi-square/rc-table.vue` — 加 ref-section、加"清除"按钮、hero-desc 详细化
- [ ] `chi-square/paired.vue` — 加 ref-section、加"清除"按钮、hero-desc 详细化
- [ ] `chi-square/rr-table.vue` — 加 ref-section、加"清除"按钮、hero-desc 详细化
- [ ] `chi-square/fisher.vue` — 加 ref-section、加"清除"按钮
- [ ] `chi-square/p-value.vue` — 加 ref-section（工具页，按钮可只留"计算"）
- [ ] 🔍 第 1 轮验证
- [ ] 🔍 第 2 轮验证

## 批次 2：t 检验（5 个文件）— 旧风格，需完整重构

差距：无 page-hero、无/部分有 param-sidebar、无 ref-section、无"清除"、旧 CSS

- [ ] `t-test/one-sample.vue` — 完整重构为新风格
- [ ] `t-test/one-sample-raw.vue` — 完整重构为新风格
- [ ] `t-test/paired.vue` — 完整重构为新风格
- [ ] `t-test/independent.vue` — 完整重构为新风格
- [ ] `t-test/p-value.vue` — 完整重构为新风格（工具页）
- [ ] 🔍 第 1 轮验证
- [ ] 🔍 第 2 轮验证

## 批次 3：Z 检验（4 个文件）— 旧风格，需完整重构

- [ ] `z-test/one-sample.vue` — 完整重构
- [ ] `z-test/one-sample-raw.vue` — 完整重构
- [ ] `z-test/independent.vue` — 完整重构
- [ ] `z-test/independent-raw.vue` — 完整重构
- [ ] 🔍 第 1 轮验证
- [ ] 🔍 第 2 轮验证

## 批次 4：秩和检验（6 个文件）— 旧风格，需完整重构

- [ ] `rank-sum/paired.vue` — 完整重构
- [ ] `rank-sum/one-sample.vue` — 完整重构
- [ ] `rank-sum/two-sample.vue` — 完整重构
- [ ] `rank-sum/ordinal.vue` — 完整重构
- [ ] `rank-sum/kruskal-wallis.vue` — 完整重构
- [ ] `rank-sum/friedman.vue` — 完整重构
- [ ] 🔍 第 1 轮验证
- [ ] 🔍 第 2 轮验证

## 批次 5：小型检验组（6 个文件）

### Cochran Q 检验
- [ ] `cochran-q/index.vue` — 完整重构

### 游程检验
- [ ] `runs-test/binary.vue` — 完整重构
- [ ] `runs-test/numeric.vue` — 完整重构

### 方差齐性检验
- [ ] `variance-homo/f-test.vue` — 完整重构
- [ ] `variance-homo/bartlett.vue` — 完整重构
- [ ] `variance-homo/levene.vue` — 完整重构
- [ ] 🔍 第 1 轮验证
- [ ] 🔍 第 2 轮验证

## 批次 6：方差分析 + 回归分析（4 个文件）

### 方差分析
- [ ] `anova/one-way.vue` — 完整重构
- [ ] `anova/randomized-block.vue` — 完整重构

### 回归分析
- [ ] `regression/simple.vue` — 完整重构
- [ ] `regression/multiple.vue` — 完整重构
- [ ] 🔍 第 1 轮验证
- [ ] 🔍 第 2 轮验证

## 批次 7：相关分析 + 生存分析 + 聚类分析（8 个文件）

### 相关分析
- [ ] `correlation/pearson.vue` — 完整重构
- [ ] `correlation/spearman.vue` — 完整重构
- [ ] `correlation/kendall.vue` — 完整重构

### 生存分析
- [ ] `survival/kaplan-meier.vue` — 完整重构
- [ ] `survival/life-table.vue` — 完整重构
- [ ] `survival/compare.vue` — 完整重构

### 聚类分析
- [ ] `cluster/sample.vue` — 完整重构
- [ ] `cluster/variable.vue` — 完整重构
- [ ] 🔍 第 1 轮验证
- [ ] 🔍 第 2 轮验证

---

## 进度追踪

| 批次 | 文件数 | 状态 | 完成时间 |
|------|--------|------|---------|
| 基本统计 (basic/) | 5 | ✅ 已完成 | 2026-04-28 |
| 批次 1：卡方检验 | 6 | ✅ 已完成 | 2026-04-29 |
| 批次 2：t 检验 | 5 | ✅ 已完成 | 2026-04-29 |
| 批次 3：Z 检验 | 4 | ✅ 已完成 | 2026-04-29 |
| 批次 4：秩和检验 | 6 | ✅ 已完成 | 2026-04-29 |
| 批次 5：小型检验组 | 6 | ✅ 已完成 | 2026-04-29 |
| 批次 6：方差+回归 | 4 | ✅ 已完成 | 2026-04-29 |
| 批次 7：相关+生存+聚类 | 8 | ✅ 已完成 | 2026-04-29 |

---

## 重构模板（旧风格 → 新风格）

对于旧风格文件，重构步骤：

### 1. 模板结构替换

```
旧：el-card #header 作为页头
新：page-hero（hero-title + hero-desc + hero-tag + 水印）

旧：el-card 包裹输入表单
新：el-row 16:8 → 左侧 input-card + 右侧 param-sidebar

旧：el-button "计算" / "示例"
新：action-bar 三按钮（开始计算 + 加载示例 + 清除）

旧：结果直接显示
新：transition result-fade → metrics-grid + detail-card + narrative-body
```

### 2. CSS 替换

删除旧的内联/紧凑样式，使用标准 CSS 类：
- `.page-hero` / `.hero-inner` / `.hero-title` / `.hero-desc` / `.hero-tag`
- `.input-row` / `.input-card` / `.param-sidebar` / `.param-sidebar-header`
- `.principle-content` / `.principle-block` / `.principle-label`
- `.ref-section` / `.ref-title` / `.ref-item`
- `.action-bar` / `.calc-btn` / `.reset-btn`
- `.metrics-grid` / `.metric-card` / `.metric-indicator` / `.metric-label` / `.metric-value`
- `.detail-card` / `.card-header-inner` / `.header-icon`
- `.narrative-body`
- `.result-fade-*` / `.result-section` / `@keyframes slideUp`

### 3. 参考文献模板

```html
<div class="ref-section">
  <div class="ref-title">参考文献</div>
  <p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p>
</div>
```

### 4. 各检验方法对应的参考文献

| 模块 | 推荐参考文献 |
|------|------------|
| 卡方检验 | [1] 方积乾《卫生统计学》 [2] Pearson K. Phil Mag, 1900 |
| t 检验 | [1] 方积乾《卫生统计学》 [2] Student. Biometrika, 1908 |
| Z 检验 | [1] 方积乾《卫生统计学》 |
| 秩和检验 | [1] 方积乾《卫生统计学》 [2] Wilcoxon F. Biometrics, 1945 |
| Cochran Q | [1] 方积乾《卫生统计学》 [2] Cochran WG. Biometrika, 1950 |
| 游程检验 | [1] 方积乾《卫生统计学》 [2] Wald A, Wolfowitz J. Ann Math Stat, 1940 |
| 方差齐性 | [1] 方积乾《卫生统计学》 [2] Levene H. In: Olkin I (ed), 1960 |
| 方差分析 | [1] 方积乾《卫生统计学》 [2] Fisher RA. Statistical Methods, 1925 |
| 回归分析 | [1] 方积乾《卫生统计学》 [2] Draper NR, Smith H. Applied Regression Analysis, 1998 |
| 相关分析 | [1] 方积乾《卫生统计学》 [2] Spearman C. Am J Psychol, 1904 |
| 生存分析 | [1] 方积乾《卫生统计学》 [2] Kaplan EL, Meier P. JASA, 1958 |
| 聚类分析 | [1] 方积乾《卫生统计学》 [2] Ward JH Jr. JASA, 1963 |
