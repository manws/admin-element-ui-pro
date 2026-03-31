# admin-element-ui-pro 基准项目清理记录

> 基于 vue3-element-admin v4.3.0 (有来开源组织) 改造为基准项目
> 清理日期：2026-03-30

---

## 一、已删除的文件/目录

### 1. Demo 演示页面（整个目录）
| 路径 | 说明 |
|------|------|
| `src/views/demo/` | 全部 43 个文件，包括 CURD 演示、拖拽、图标、富文本、上传、多级菜单、VXE Table、字典同步、电子签名等 |

### 2. 代码生成器
| 路径 | 说明 |
|------|------|
| `src/views/codegen/index.vue` | 代码生成器页面（40KB） |
| `src/api/codegen.ts` | 代码生成器 API |
| `src/types/api/codegen.ts` | 代码生成器类型定义 |
| `src/enums/codegen.ts` | 代码生成器枚举 |

### 3. GitHub 角标
| 路径 | 说明 |
|------|------|
| `src/components/GithubCorner/` | Dashboard 右上角 GitHub 角标组件 |

### 4. 多租户功能（完整移除）
| 路径 | 说明 |
|------|------|
| `src/views/system/tenant/index.vue` | 租户管理页面 |
| `src/views/system/tenant/plan.vue` | 租户套餐管理页面 |
| `src/store/modules/tenant.ts` | 租户 Pinia Store |
| `src/api/system/tenant.ts` | 租户 API |
| `src/api/system/tenant-plan.ts` | 租户套餐 API |
| `src/types/api/tenant.ts` | 租户类型定义 |
| `src/types/api/tenant-plan.ts` | 租户套餐类型定义 |
| `src/components/TenantSwitcher/` | 租户切换器组件 |
| `src/utils/tenant.ts` | 租户工具函数 |
| `mock/tenant.mock.ts` | 租户 Mock 数据 |
| `mock/tenant-plan.mock.ts` | 租户套餐 Mock 数据 |

---

## 二、已修改的文件（清理引用）

| 文件 | 修改内容 |
|------|----------|
| `src/router/index.ts` | 删除 `DemoDetail` 路由（原第 67-72 行） |
| `src/types/api/index.ts` | 删除 `codegen`、`tenant`、`tenant-plan` 的 export |
| `src/store/index.ts` | 删除 `export * from "./modules/tenant"` |
| `src/enums/index.ts` | 删除 `export * from "./codegen"` |
| `src/router/guards/permission.ts` | 删除 `useTenantStoreHook`、`isTenantEnabled` 引用及 `initTenantContext()` 函数 |
| `src/api/auth.ts` | 删除 `switchTenant` 方法，删除 login 中的 `tenantId` 参数 |
| `src/types/api/auth.ts` | 删除 `LoginRequest` 中的 `tenantId` 字段 |
| `src/settings.ts` | 删除 `tenantEnabled` 配置项 |
| `src/constants/index.ts` | 删除 `PLATFORM_TENANT_ID` 常量和 `TENANT_ID`/`TENANT_INFO` 存储键 |
| `src/layouts/components/LayoutToolbar.vue` | 删除 `TenantSwitcher` 组件引用、import、模板、逻辑、样式 |
| `src/views/system/menu/index.vue` | 删除 `isTenantEnabled` 引用，`showMenuScope` 改为 `false` |
| `src/views/dashboard/index.vue` | 删除 `<github-corner>` 组件 |
| `src/views/login/index.vue` | 删除 `tenantEnabled` 变量和模板中的多租户标签 |
| `src/types/components.d.ts` | 删除 `GithubCorner`、`TenantSwitcher` 类型声明 |

---

## 三、保留的内容

### 框架核心（必须保留）
- 入口：`main.ts`、`App.vue`、`settings.ts`
- 路由：`router/index.ts`、`router/guards/permission.ts`
- 布局：`layouts/` 全部（3 种布局 + 8 个子组件）
- 状态管理：`store/modules/` 中的 app、permission、settings、tags-view、user、dict
- 工具：`utils/` 中的 auth、request、storage、format、download、validate、theme
- 核心视图：login、error（401/404）、redirect、profile、dashboard
- 全部公共组件（24 个，含 CURD、ECharts、Upload、DictSelect 等）
- 指令、常量、枚举、国际化、样式、类型定义

### 系统管理模块（标准 RBAC）
- `views/system/user/` — 用户管理
- `views/system/role/` — 角色管理
- `views/system/menu/` — 菜单管理
- `views/system/dept/` — 部门管理
- `views/system/dict/` — 字典管理
- `views/system/config/` — 系统配置
- `views/system/log/` — 操作日志
- `views/system/notice/` — 通知公告

### 新增的业务模块
- `views/sample-calc/` — 样本量计算（6 个 Vue3 SFC 页面）
  - `two-means.vue` — 两独立样本均值比较
  - `two-proportions.vue` — 两独立样本率比较
  - `logrank.vue` — 生存分析 LogRank 检验
  - `non-inferiority.vue` — 非劣效性设计两样本率
  - `diagnostic.vue` — 诊断试验灵敏度与特异度
  - `paired.vue` — 配对设计均数/率
- `mock/menu.mock.ts` 中新增「样本量计算」一级菜单及 6 个子菜单路由

---

## 四、环境变量变更

| 变量 | 变更 |
|------|------|
| `VITE_APP_TENANT_ENABLED` | 可删除（已无租户功能） |
| `VITE_MOCK_DEV_SERVER` | 保持 `true`（开发环境使用 Mock） |

---

## 五、注意事项

1. `mock/menu.mock.ts` 中仍残留已删除的 demo/codegen 相关菜单路由配置，这些路由会指向 404 页面（因为对应的 view 文件已删除），如需清理可手动删除 mock 中的对应菜单项
2. `src/composables/sse/` 目录保留（SSE 服务），但如果 Dashboard 不再需要在线人数功能可以后续删除
3. Dashboard 首页（`views/dashboard/index.vue`）仍包含有来科技的推广链接（Gitee/GitHub/CSDN/掘金/B站），建议后续重写为自己的业务仪表盘
