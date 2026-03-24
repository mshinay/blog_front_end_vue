# Blog Frontend Refactor

## 1. 技术栈与选型（Tech Stack）

### Vue 3 + TypeScript

选择 Vue 3 的核心原因是它更适合这类“从页面到模块”的渐进式重构场景。团队原有项目是页面驱动的结构，Vue 单文件组件能自然把模板、交互和局部样式收在一个边界内，同时保留比 React 更低的迁移阻力。  
TypeScript 不是为了“加类型装饰”，而是为了把接口模型、组件输入输出和状态结构固定下来，减少重构阶段的隐式回归。

### Pinia

选择 Pinia 而不是 Vuex，原因很直接：

- API 更轻，组合式写法和 Vue 3 更一致
- 类型推导更自然，状态定义和消费成本更低
- 对这个项目来说，状态核心集中在 auth 和少量全局上下文，不需要 Vuex 的样板层级

### Vue Router

路由不只是页面切换器，而是权限入口。这个项目把登录态、管理员态和重定向逻辑收在路由层处理，避免每个页面重复写“未登录跳登录”的判断。

### Axios

Axios 的作用不在“发请求”，而在“建立请求层边界”：统一 `baseURL`、统一 token 注入、统一错误转译、统一响应解包，页面层只处理业务结果，不直接处理传输细节。

### Vite

Vite 是这类重构项目的合理选择：

- 启动快，适合高频迭代页面和接口联调
- TypeScript、Vue SFC、按需构建链路简单
- 配置面小，不需要为一个中型前端项目背过重的工程负担

### 不引入 UI 框架

这个项目刻意没有引入 Element Plus、Ant Design Vue 一类 UI 框架，原因不是“追求纯手写”，而是为了避免在重构阶段把设计系统、组件库依赖和业务迁移耦合在一起。  
当前优先级是先把业务模型、组件边界和交互行为稳定下来，再决定是否抽象设计系统。

---

## 2. 前端架构设计（Architecture）

### 2.1 目录结构设计

```text
src/
├─ api/           # 请求客户端与 API 模块
├─ components/    # 业务组件与公共组件
├─ composables/   # 可复用交互逻辑
├─ router/        # 路由表与守卫
├─ stores/        # Pinia 状态
├─ types/         # 领域模型与接口类型
├─ utils/         # 权限、markdown 等纯工具能力
└─ views/         # 页面级容器组件
```

职责划分原则：

- `views` 负责页面编排、路由参数消费、数据加载时机
- `components` 负责可复用 UI/交互单元，不承担跨页面路由职责
- `api` 负责协议层边界，不让页面直接拼 URL 或处理通用错误
- `stores` 只保存真正跨页面共享的状态，不把页面态塞进全局
- `composables` 用来承载诸如无限滚动这类“跨页面复用但不应全局化”的交互逻辑

### 2.2 请求层设计（Axios 封装）

请求统一经 [`src/api/client.ts`](D:/work/project/myproject/blog-front-end/front-end/vue-app/src/api/client.ts) 出口，做了几件事：

- 基于 `VITE_API_BASE_URL` 创建统一 `baseURL`
- 从 `localStorage.jwt` 自动注入 `authentication` 请求头
- 统一把后端响应里的 `code/message/data` 转换为前端可消费的结果
- 把 HTTP 错误和业务错误统一收敛成 `AppError`
- 遇到 `401` 时清理本地登录态，避免脏 token 持续污染后续请求

这样做的价值在于：

- 页面层不感知鉴权头细节
- API 模块只关心“这个接口返回什么类型”
- 视图层只处理“成功态 / 错误态 / 空态”，不直接处理 Axios 细节

### 2.3 状态管理设计（Pinia）

全局状态目前刻意保持克制，核心只有 auth：

- token 持久化在 `localStorage.jwt`
- 用户摘要持久化在 `localStorage.user`
- 应用启动和路由切换时通过 `hydrate()` 恢复状态
- `updateCurrentUser()` 用于局部资料更新后的最小同步

这类状态不适合交给 local state，原因是它天然跨页面、跨刷新，并且直接影响路由守卫和权限判断。  
相反，文章列表加载状态、评论区展开状态、搜索关键字等局部状态仍留在页面或组件内部，避免把全局状态做成“垃圾场”。

### 2.4 路由与权限控制

路由结构和守卫逻辑分离：

- [`src/router/index.ts`](D:/work/project/myproject/blog-front-end/front-end/vue-app/src/router/index.ts) 定义页面路由和 `meta`
- [`src/router/guards.ts`](D:/work/project/myproject/blog-front-end/front-end/vue-app/src/router/guards.ts) 负责重定向决策

当前权限模型：

- `requiresAuth` 页面：未登录跳转到登录页，并带上 `redirect`
- 已登录用户访问登录/注册页：直接回首页
- `requiresAdmin` 页面：非管理员跳回首页，并显式带上拒绝标记

这种设计的重点不是“拦住页面”，而是把权限判断从视图组件中抽离出来，避免页面内部到处散落登录态判断。

---

## 3. 核心功能拆解（Features）

### 登录 / 注册

关键设计不是表单本身，而是把认证协议和前端状态管理打通：

- 登录/注册 API 模块直接返回强类型 `AuthUser`
- auth store 统一负责 token 持久化、用户摘要持久化和恢复
- 路由守卫消费 store 状态，保证登录跳转链路一致

### 首页文章列表（无限滚动）

首页不是简单“拉列表”，而是把列表分页加载抽象成可复用交互：

- 滚动触发由 `IntersectionObserver` 驱动
- 无限滚动逻辑下沉到 `useInfiniteScroll`
- 近期补充了失败熔断策略，请求失败后停止自动重试，避免无效流量打爆后端

重点在于：首页、搜索、后台管理页、评论区等列表能力可以共享相同交互模型，而不是各写一套滚动脚本。

### 搜索

搜索页没有单独发明接口模型，而是复用文章列表接口，通过 `keyword` 参数收敛查询能力。  
这样做避免了“首页一套 DTO，搜索页一套 DTO”的分裂，分页模型和卡片渲染模型都可以复用。

### 文章详情 + 评论

详情页设计重点在两个层面：

- 文章正文使用统一 markdown 渲染工具，经过 `marked + DOMPurify` 处理后再进入视图，避免直接信任服务端 HTML
- 评论区按树形结构渲染，根评论和子评论由统一组件递归承载，而不是在页面里写嵌套 DOM 拼装

这意味着详情页同时承接“内容展示”和“交互树渲染”两种复杂性，但职责边界仍然清晰。

### 发布 / 编辑文章

文章发布和编辑没有各自做一套表单：

- 共用 `ArticleEditor`
- 编辑器采用 ByteMD，源数据保持 markdown，不存 HTML 快照
- 分类、标签、正文、摘要等字段在提交前统一组装为 API payload

核心思路是把“内容编辑”视为领域组件，而不是页面临时表单。

### 用户中心

用户中心的重点不是 Tab 页面，而是“个人资料、我的文章、我的评论”三类职责分离：

- 资料面板负责个人资料展示与更新
- 文章面板复用标准文章列表能力
- 评论面板保留在当前接口基线允许的兼容范围内

个人资料更新现在已经切到标准接口，状态同步通过 auth store 和父级资料摘要联动，避免“表单更新了但页面头部还是旧数据”的常见问题。

---

## 4. 组件设计与复用（Component Design）

这个项目的组件拆分不是按纯 UI 原子化拆，而是按“业务稳定边界”拆：

- `ArticleCard` 负责文章摘要展示，是列表页和用户页的复用单元
- `CommentItem` 负责单条评论及其子评论递归展示
- `CommentEditor` 承接评论输入，不把表单逻辑散在列表组件里
- `ArticleEditor` 承接发布和编辑两条业务链路

拆分原则：

- 页面容器负责拿数据和协调状态
- 业务组件负责一段完整、可复用的交互单元
- 公共组件只沉淀真正跨场景稳定的结构，不为了“显得抽象”而强行拆小

`props / emits` 的设计思路也偏工程化：

- `props` 传入稳定数据模型，而不是零散字段
- `emits` 只暴露业务动作，如“更新成功”“删除完成”，不向父层泄漏内部实现
- 组件尽量不依赖全局上下文，只有 auth 等真正全局能力才通过 store 获取

---

## 5. 工程化与规范（Engineering）

### ESLint / Prettier

项目把代码风格问题从 review 中前置到工具链：

- `eslint` 负责 Vue、TS 和通用代码质量检查
- `prettier` 负责统一格式，避免无意义 diff

### TypeScript 使用策略

TypeScript 的使用重点在“领域模型”和“协议模型”：

- `src/types` 统一维护用户、文章、评论、API 响应类型
- API 模块显式声明请求参数和返回值
- 组件输入输出尽量使用领域类型而不是 `any`

### 代码组织原则

- 接口调用只能经过 `src/api`
- 权限逻辑只能沉淀在 `src/utils/permissions.ts`
- 路由鉴权只能沉淀在 router guard
- 页面不直接拼接鉴权头、不直接实现通用错误策略

这套约束的目的，是防止项目在迭代中重新退化回“每个页面自带一套规则”的状态。

---

## 6. 性能优化（Performance）

当前项目的性能策略偏务实：

- 列表加载使用 `IntersectionObserver` 实现无限滚动，避免粗暴滚动监听
- 编辑器通过异步组件加载，降低非编辑页面首屏负担
- 组件复用和职责拆分降低重复渲染和重复请求逻辑
- 请求层统一处理错误，避免失败场景下的重试风暴

没有引入 SSR，原因也很明确：当前项目优先级是完成 SPA 重构和工程体系收口，而不是在未稳定业务边界前叠加服务端渲染复杂度。  
如果后续 SEO 成为明确目标，再评估 SSR 或静态生成方案更合理。

---

## 7. 项目结构（Project Structure）

关键目录说明：

- `src/api`
  - `client.ts`：Axios 实例、请求/响应拦截器、`AppError`
  - `modules/*`：按用户、文章、评论、分类、标签拆分 API 模块
- `src/stores`
  - `auth.ts`：认证状态、持久化恢复、当前用户更新
- `src/router`
  - `index.ts`：路由表
  - `guards.ts`：路由守卫与跳转决策
- `src/views`
  - 页面级容器，负责路由入口和业务流程编排
- `src/components`
  - 文章、评论、个人中心等业务组件
- `src/composables`
  - 复用交互逻辑，例如无限滚动
- `src/utils`
  - markdown 渲染、权限规则等纯工具能力
- `tests`
  - Vitest 测试，覆盖权限、路由、API 模块、评论区、个人中心等关键链路

---

## 8. 快速启动（Getting Started）

### 安装依赖

```bash
npm install
```

### 配置环境变量

`.env.example`

```env
VITE_API_BASE_URL=http://localhost:8080
```

复制为本地环境文件或直接使用现有 `.env.development`。

### 启动开发环境

```bash
npm run dev
```

### 质量检查

```bash
npm run lint
npm run test
npm run build
```

---

## 9. 与后端对接说明

### baseURL

- 由 `VITE_API_BASE_URL` 提供
- 默认开发环境指向 `http://localhost:8080`

### JWT 存储方式

- token：`localStorage.jwt`
- 用户摘要：`localStorage.user`

### 请求头规范

- 鉴权头使用：`authentication: <token>`
- 请求层自动注入，业务页面不直接处理

### 响应约定

统一按以下结构消费：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

列表接口统一约定：

```json
{
  "total": 0,
  "records": []
}
```

---