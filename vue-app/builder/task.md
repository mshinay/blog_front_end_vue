 # 接口对齐驱动的前端改造计划

  ## 第 1 轮：统一 API 请求层与基础类型，使前端调用入口先与接口文档对齐

  本轮涉及模块：用户、文章、评论、分类、标签、后台管理

  ### Task Card 1

  目标
  [重构] 将用户 API 模块对齐到接口文档中的用户接口路径与返回结构。

  涉及文件
  src/api/modules/user.ts
  src/api/client.ts

  输入输出接口

  - POST /api/users/login
      - Body: { username, password }
      - Response: { code, message, data: { id, username, nickname, avatarUrl, role, status, jwtToken } }
  - POST /api/users/register
      - Body: { username, password, email, nickname, avatarUrl, bio }
      - Response: 同登录
  - GET /api/users/{userId}
      - Response: { code, message, data: { id, username, nickname, avatarUrl, bio } }

  不做什么
  不改登录页表单交互。
  不新增接口文档未定义的“更新用户信息”“上传头像”标准。

  完成标准

  - src/api/modules/user.ts 中登录、注册、获取用户信息均使用接口文档路径
  - 请求参数与响应解包字段符合文档
  - authentication 请求头逻辑保持可用
  - 控制台无因字段缺失导致的运行时报错

  风险点
  当前代码使用 /user/* 路径，切换后可能影响 auth store。
  当前 User 类型字段明显缺少 nickname、bio、status。

  ———

  ### Task Card 2

  目标
  [重构] 将文章 API 模块对齐到接口文档中的文章/后台文章接口。

  涉及文件
  src/api/modules/article.ts
  src/api/client.ts

  输入输出接口

  - GET /api/articles
      - Query: categoryId? tagId? authorId? slug? keyword? page pageSize
      - Response: data: { total, records[] }
  - GET /api/articles/{articleId}
      - Response: data: { id, title, slug, summary, coverUrl, content, contentType, author, category, tags, stats, allowComment, publishTime, updatedTime,
        wordCount, comments }
  - POST /api/articles
      - Body: { title, slug, summary, coverUrl, content, contentType, categoryId, tagIds, allowComment, status }
      - Response: data: articleId
  - DELETE /api/articles/{articleId}
  - GET /api/admin/articles
      - Query: authorId? categoryId? tagId? status? allowComment? isTop? slug? keyword? page pageSize

  不做什么
  不处理页面展示逻辑。
  不设计额外的文章搜索接口。

  完成标准

  - 旧路径 /article/* 调整为接口文档标准路径
  - createArticle 的返回值从“文章对象”改为“新建文章 ID”
  - 管理列表请求参数支持接口文档筛选字段
  - API 函数命名与用途一一对应，不依赖旧私有路径

  风险点
  当前详情页和编辑页可能依赖旧 Article 扁平结构。
  当前后台模块存在 /article/admin/list、/search 两套旧接口，需要收口。

  ———

  ### Task Card 3

  目标
  [重构] 将评论 API 模块对齐到接口文档中的评论/后台评论接口。

  涉及文件
  src/api/modules/comment.ts
  src/api/client.ts

  输入输出接口

  - POST /api/comments
      - Body: { articleId, parentId, rootId, replyUserId, replyToCommentId, content }
      - Response: data: null
  - GET /api/comments
      - Query: { articleId, page, pageSize }
      - Response: data: { total, records: [{ comment, children[] }] }
  - GET /api/admin/comments
      - Query: { userId? articleId? status? keyword? page pageSize }
      - Response: data: { total, records[] }

  不做什么
  不在本 task 处理评论组件如何渲染树。
  不补充接口文档未定义的评论更新接口标准。

  完成标准

  - 评论列表 API 返回类型切换到“评论树”
  - 评论发布 API 不再假设后端直接返回创建后的评论对象
  - 后台评论列表参数与返回模型按文档重建
  - 控制台无因 records[].comment / records[].children 结构变化导致的空指针

  风险点
  当前 CommentList.vue 直接 unshift(created)，与 data: null 不兼容。
  当前评论类型是扁平结构，重构会波及列表和管理页。

  ———

  ### Task Card 4

  目标
  [新增] 增加分类与标签 API 模块，补齐文章创建/筛选所需的基础数据入口。

  涉及文件
  src/api/modules/category.ts
  src/api/modules/tag.ts
  src/types/api.ts

  输入输出接口

  - GET /api/categories
      - Response: data: { total, records: [{ id, name, slug }] }
  - GET /api/tags
      - Response: data: { total, records: [{ id, name, slug }] }

  不做什么
  不在本 task 接入任何页面。
  不增加新增分类/标签管理功能。

  完成标准

  - 新增独立 API 模块
  - 返回类型与列表结构可被页面直接消费
  - 供后续文章编辑器、列表筛选复用

  风险点
  当前项目无对应模块，Builder 可能把拉取逻辑写进视图里。
  标签与分类类型若混用，会污染后续表单模型。

  ———

  ### Task Card 5

  目标
  [重构] 扩展 TypeScript 类型，建立与接口文档一一对应的数据模型。

  涉及文件
  src/types/user.ts
  src/types/article.ts
  src/types/comment.ts
  src/types/api.ts
  src/types/category.ts
  src/types/tag.ts

  输入输出接口
  覆盖文档中的：

  - 用户登录/注册/详情
  - 文章列表/详情/创建/后台列表
  - 评论列表树/后台评论列表
  - 分类列表
  - 标签列表

  不做什么
  不在类型层做字段兜底转换。
  不删除现有页面还在使用的旧字段前，先直接大面积改视图。

  完成标准

  - 至少拆出：UserSummary/UserProfile、ArticleListItem/ArticleDetail/AdminArticleItem/ArticlePayload、CommentNode/AdminCommentItem
  - 列表类型统一使用 PageResult<T>
  - 所有新增 API 模块不依赖 any

  风险点
  现有页面大量依赖 createTime、authorName、username 之类旧字段。
  若直接替换原类型名，改动面会扩大。

  ———

  ## 第 2 轮：对齐文章主链路页面数据接入，确保列表、详情、发布、编辑都使用标准接口

  本轮涉及模块：文章、分类、标签、Markdown

  ### Task Card 1

  目标
  [重构] 主站文章列表页对齐 GET /api/articles 的分页与筛选参数。

  涉及文件
  src/views/MainView.vue
  src/components/article/ArticleCard.vue
  src/api/modules/article.ts
  src/types/article.ts

  输入输出接口

  - GET /api/articles
      - Query: page pageSize categoryId? tagId? authorId? slug? keyword?
      - Response: data: { total, records[] }

  不做什么
  不新增复杂筛选 UI。
  不改无限滚动/分页交互模式。

  完成标准

  - 页面以 records 渲染文章卡片
  - 卡片字段映射到文档中的 publishTime、summary、coverUrl、tagList
  - 空列表时显式展示 empty state
  - 请求参数不再依赖旧搜索专用接口

  风险点
  当前卡片使用 createTime，需要替换为 publishTime。
  列表与搜索页若共享组件，字段兼容要一次性处理好。

  ———

  ### Task Card 2

  目标
  [重构] 搜索页收敛到 GET /api/articles 的 keyword 查询，不再依赖旧搜索接口。

  涉及文件
  src/views/SearchView.vue
  src/components/article/ArticleCard.vue
  src/api/modules/article.ts

  输入输出接口

  - GET /api/articles
      - Query: keyword page pageSize
      - Response: data: { total, records[] }

  不做什么
  不增加高级搜索条件。
  不处理服务端高亮。

  完成标准

  - 搜索页请求使用统一文章列表接口
  - 页面对 keyword 为空、无结果、加载失败都有明确状态
  - 与主列表页共用同一数据模型

  风险点
  当前存在 searchArticles() 旧封装，容易与统一列表接口并存。
  Builder 可能保留双通道调用，导致后续维护困难。

  ———

  ### Task Card 3

  目标
  [重构] 文章详情页对齐 GET /api/articles/{articleId} 的嵌套详情结构。

  涉及文件
  src/views/ArticleDetailView.vue
  src/utils/markdown.ts
  src/types/article.ts

  输入输出接口

  - GET /api/articles/{articleId}
      - Response: data: { author, category, tags, stats, allowComment, publishTime, updatedTime, comments }

  不做什么
  不在本 task 重做评论交互。
  不新增点赞、收藏等文档只返回统计值的功能按钮。

  完成标准

  - 页面正确渲染作者信息、分类、标签、统计信息、正文 markdown
  - allowComment 能影响评论区可用状态
  - 缺失 articleId 或接口失败时有显式错误状态
  - 控制台无因嵌套字段读取导致的报错

  风险点
  当前详情页可能使用扁平字段如 authorName。
  文档中 comments 已内嵌返回，需与现有独立评论拉取逻辑避免冲突。

  ———

  ### Task Card 4

  目标
  [重构] 发布文章页对齐 POST /api/articles 的完整入参，并接入分类/标签列表。

  涉及文件
  src/views/UploadArticleView.vue
  src/components/article/ArticleEditor.vue
  src/api/modules/article.ts
  src/api/modules/category.ts
  src/api/modules/tag.ts
  src/types/article.ts

  输入输出接口

  - POST /api/articles
      - Body: { title, slug, summary, coverUrl, content, contentType, categoryId, tagIds, allowComment, status }
      - Response: data: articleId
  - GET /api/categories
  - GET /api/tags

  不做什么
  不设计新表单字段超出接口文档范围。
  不处理图片上传标准化。

  完成标准

  - 页面提交参数完整匹配接口文档
  - 发布成功后使用返回的文章 ID 跳转详情页
  - 分类/标签下拉数据来源于标准接口
  - 表单校验失败时不发送无效请求

  风险点
  当前 ArticleMutationPayload 只有 title/content，差异很大。
  若编辑器组件内部状态设计过于扁平，接入 category/tag 可能冲击较大。

  ———

  ### Task Card 5

  目标
  [重构] 编辑文章页复用文章详情与创建入参模型，消除旧编辑接口字段漂移。

  涉及文件
  src/views/EditArticleView.vue
  src/components/article/ArticleEditor.vue
  src/api/modules/article.ts
  src/types/article.ts

  输入输出接口

  - 读取：GET /api/articles/{articleId}
  - 提交：以当前项目已有更新能力为基线，先对齐到与 POST /api/articles 同构的 payload 模型
      - Body 字段至少与 { title, slug, summary, coverUrl, content, contentType, categoryId, tagIds, allowComment, status } 一致

  不做什么
  不凭空发明接口文档未定义的新更新路径。
  不处理作者权限逻辑变更。

  完成标准

  - 编辑页回填字段来自详情接口标准结构
  - 编辑提交 payload 与创建模型一致
  - 页面不再依赖旧详情字段名
  - 未拿到文章详情时不渲染编辑器主表单

  风险点
  接口文档未显式给出更新文章接口，前端只能先统一 payload 模型，后续再与后端确认路径。
  这是本计划里唯一存在“接口缺失”的灰区，需单独标记。

  ———

  ## 第 3 轮：对齐评论与用户主链路，修正状态流和页面行为不一致

  本轮涉及模块：评论、用户、认证、个人中心、公开用户页

  ### Task Card 1

  目标
  [重构] 评论列表组件对齐 GET /api/comments 的评论树结构。

  涉及文件
  src/components/comment/CommentList.vue
  src/components/comment/CommentItem.vue
  src/types/comment.ts
  src/api/modules/comment.ts

  输入输出接口

  - GET /api/comments
      - Query: { articleId, page, pageSize }
      - Response: data: { total, records: [{ comment, children[] }] }

  不做什么
  不修改评论权限规则。
  不增加折叠/展开新交互。

  完成标准

  - 根评论与子评论都能正确渲染
  - 回复关系字段 replyUserName、replyToCommentId 被正确使用
  - 空列表、加载中、加载失败状态明确
  - 控制台无因树结构访问导致的报错

  风险点
  当前组件可能按一维数组渲染。
  评论项复用中容易把根评论和子评论类型混淆。

  ———

  ### Task Card 2

  目标
  [重构] 评论发布流程对齐 POST /api/comments 的请求参数和“成功不回显实体”的返回行为。

  涉及文件
  src/components/comment/CommentList.vue
  src/components/comment/CommentEditor.vue
  src/api/modules/comment.ts

  输入输出接口

  - POST /api/comments
      - Body:
          - 根评论：{ articleId, parentId: 0, rootId: 0, replyUserId: 0, replyToCommentId: 0, content }
          - 回复评论：{ articleId, parentId, rootId, replyUserId, replyToCommentId, content }
      - Response: data: null

  不做什么
  不定义评论编辑/删除的新接口。
  不处理本地乐观更新动画。

  完成标准

  - 提交参数区分根评论与回复评论
  - 发布成功后通过“重新拉取评论列表”或等价标准刷新，而不是依赖返回实体插入本地
  - 未登录用户无法提交
  - 失败时有明确错误提示

  风险点
  当前逻辑 unshift(created) 会失效。
  回复链路需要正确带上 parentId/rootId/replyUserId/replyToCommentId。

  ———

  ### Task Card 3

  目标
  [重构] 认证状态流对齐登录/注册返回用户结构，修正 auth store 的持久化字段。

  涉及文件
  src/stores/auth.ts
  src/api/modules/user.ts
  src/types/user.ts
  tests/auth.store.spec.ts

  输入输出接口

  - POST /api/users/login
  - POST /api/users/register
  - Response data: { id, username, nickname, avatarUrl, role, status, jwtToken }

  不做什么
  不新增刷新 token 机制。
  不改 router guard 的权限策略。

  完成标准

  - localStorage.jwt 与 localStorage.user 保持现有存储约定
  - auth store 能正确识别管理员 role === 0
  - 登录/注册后页面能拿到 nickname/avatarUrl/status
  - 相关 store 测试更新通过

  风险点
  当前 User 类型字段不完整，可能导致持久化对象丢字段。
  登录/注册页若仍提交旧表单字段，会与标准接口冲突。

  ———

  ### Task Card 4

  目标
  [重构] 注册页对齐标准注册入参，补全昵称、头像、简介等接口字段映射。

  涉及文件
  src/views/RegisterView.vue
  src/stores/auth.ts
  src/api/modules/user.ts
  src/types/user.ts

  输入输出接口

  - POST /api/users/register
      - Body: { username, password, email, nickname, avatarUrl, bio }

  不做什么
  不设计头像上传流程。
  不增加邮箱验证等文档未定义能力。

  完成标准

  - 页面提交参数与接口文档一致
  - 可为空的字段处理明确，不发送无意义脏值
  - 注册成功后状态写入 auth store
  - 表单校验与接口字段一一对应

  风险点
  当前注册 payload 可能只有 username/email/password。
  新增字段后需避免 Builder 顺手改动 UI 风格。

  ———

  ### Task Card 5

  目标
  [重构] 公开用户页与个人中心基础信息读取对齐 GET /api/users/{userId}。

  涉及文件
  src/views/UserPageView.vue
  src/views/PersonCenterView.vue
  src/components/person/AccountSettingsPanel.vue
  src/api/modules/user.ts
  src/types/user.ts

  输入输出接口

  - GET /api/users/{userId}
      - Response: { id, username, nickname, avatarUrl, bio }

  不做什么
  不处理“更新个人资料”后端标准缺失问题。
  不改“我的文章/我的评论”分页数据源。

  完成标准

  - 公开用户页渲染昵称、头像、简介
  - 个人中心基础展示不再依赖不完整的本地缓存字段
  - 路由参数缺失或接口失败时有显式错误态

  风险点
  当前 getPublicUser 使用 /user/public/{id} 旧接口。
  本地 auth user 与服务端 user profile 字段集不完全一致。

  ———

  ## 第 4 轮：对齐后台管理与收口验证，确保管理页面和回归测试基于标准接口稳定运行

  本轮涉及模块：后台文章、后台评论、测试、路由联动

  ### Task Card 1

  目标
  [重构] 后台文章管理页对齐 GET /api/admin/articles 的过滤参数与列表字段。

  涉及文件
  src/views/AdminArticlesView.vue
  src/api/modules/article.ts
  src/types/article.ts

  输入输出接口

  - GET /api/admin/articles
      - Query: { authorId?, categoryId?, tagId?, status?, allowComment?, isTop?, slug?, keyword?, page, pageSize }
      - Response: data: { total, records[] }

  不做什么
  不增加批量操作。
  不处理后台文章编辑新流程。

  完成标准

  - 页面展示文档字段：authorName、categoryName、status、isTop、allowComment、publishTime、updatedTime
  - 至少支持当前页面已存在的关键字筛选，并保留扩展到标准筛选参数的接口能力
  - 删除操作后列表能正确刷新

  风险点
  当前管理页使用旧字段 createTime。
  旧接口 /article/admin/search 若残留，会造成行为不一致。

  ———

  ### Task Card 2

  目标
  [重构] 后台评论管理页对齐 GET /api/admin/comments 的返回结构。

  涉及文件
  src/views/AdminCommentsView.vue
  src/api/modules/comment.ts
  src/types/comment.ts

  输入输出接口

  - GET /api/admin/comments
      - Query: { userId?, articleId?, status?, keyword?, page, pageSize }
      - Response: data: { total, records: [{ commentId, articleId, articleTitle, articleStatus, userId, userName, replyUserId, replyUserName, content, status,
        rootId, parentId, createdTime, updatedTime }] }

  不做什么
  不新增评论审核操作。
  不重构页面布局样式。

  完成标准

  - 页面基于标准后台评论项渲染，而不是自定义 AdminCommentGroup
  - 关键字筛选和分页请求参数符合文档
  - 删除后界面状态与列表数据一致

  风险点
  当前 API 返回模型是“按文章分组 comments[]”，与文档完全不一致。
  视图复用现有评论组件时可能出现字段不兼容。

  ———

  ### Task Card 3

  目标
  [重构] 个人中心中的“我的文章”“我的评论”面板收口到标准接口能力范围内。

  涉及文件
  src/components/person/MyArticlesPanel.vue
  src/components/person/MyCommentsPanel.vue
  src/api/modules/article.ts
  src/api/modules/comment.ts

  输入输出接口

  - 文章面板：复用 GET /api/articles?authorId={userId}&page&pageSize
  - 评论面板：若接口文档无“按用户评论列表”标准，则维持现状功能边界并显式标记为“非标准接口依赖点”

  不做什么
  不新增后端未定义的用户评论标准接口。
  不扩展个人中心新 Tab。

  完成标准

  - “我的文章”完全切换到标准文章列表接口
  - “我的评论”若仍依赖旧接口，代码和任务文档中有明确隔离标记
  - 面板行为不影响权限模型

  风险点
  接口文档未提供“用户评论列表”标准，这是现有功能与标准之间的缺口。
  若 Builder 强行改为后台评论接口，会破坏权限边界。

  ———

  ### Task Card 4

  目标
  [新增/重构] 补齐接口对齐后的测试，覆盖关键请求路径、字段映射和权限不回归。

  涉及文件
  tests/user-modules.spec.ts
  tests/auth.store.spec.ts
  tests/comment-item.spec.ts
  tests/person-center-view.spec.ts
  tests/router.guards.spec.ts
  新增需要的 tests/*

  输入输出接口
  覆盖以下标准接口的前端消费行为：

  - POST /api/users/login
  - POST /api/users/register
  - GET /api/users/{userId}
  - GET /api/articles
  - GET /api/articles/{articleId}
  - POST /api/articles
  - GET /api/comments
  - POST /api/comments
  - GET /api/admin/articles
  - GET /api/admin/comments

  不做什么
  不做 E2E。
  不追求一次性补齐所有 UI 快照测试。

  完成标准

  - API 模块测试断言请求路径、参数、返回映射正确
  - auth store、评论流、详情页关键状态流有回归覆盖
  - 现有权限测试继续通过
  - npm run test 可作为本轮独立验收手段

  风险点
  现有测试可能深度绑定旧字段名和旧接口路径。
  若先改页面再补测试，回归定位成本会升高。

  ———

  ### Task Card 5

  目标
  [收口] 建立“标准接口已覆盖 / 仍依赖非标准接口”的清单，作为 Builder 后续 review 基线。

  涉及文件
  pre_read.md
  AGENTS.md
  如需记录，也可新增内部对齐说明文档

  输入输出接口
  以 前后端对齐接口文档.md 为唯一标准，逐项标记：

  - 已完全对齐
  - 需新增后端标准接口
  - 前端保留临时兼容

  不做什么
  不修改业务代码。
  不做产品规划说明。

  完成标准

  - 至少明确以下灰区：文章更新接口、用户资料更新接口、用户评论列表接口、头像上传接口
  - 后续 Builder review 时能据此判断“是否越界实现”
  - 文档与当前代码状态一致

  风险点
  如果不显式记录灰区，Builder 容易在实现时自行发明接口。
  文档若不持续更新，会失去 Planner 约束力。