项目定位
- Vue 重写主线位于 vue-app/，已覆盖博客核心业务，legacy 仍并行保留。
- 当前可作为日常开发与联调主入口使用。
功能完成度（Vue）
- 已完成页面：/login、/register、/main、/search、/article/:articleId、/upload、/edit-article/:articleId、/person、/user/:userId、/admin/articles、/admin/comments（见 vue-app/src/views/*.vue）。
- 认证与守卫：requiresAuth/requiresAdmin 已上线（vue-app/src/router/index.ts, vue-app/src/router/guards.ts）。
- 权限模型已统一：作者可编辑，作者/管理员可删除；管理员对他人内容仅删除不编辑（vue-app/src/utils/permissions.ts）。
- 文章链路：列表、搜索、详情、发布、编辑均已迁移；编辑器为 ByteMD。
- 评论链路：列表、发布、行内编辑、删除已迁移。
- 个人中心：账号设置、我的博客、我的评论已落地；公开用户页已落地（vue-app/src/views/PersonCenterView.vue, vue-app/src/views/UserPageView.vue）。
测试与质量
- 现有测试 9 个 spec，覆盖路由守卫、权限、auth store、markdown、评论组件、个人中心 tab、账号设置交互、API 模块调用（见 vue-app/tests/*.spec.ts）。
- 最近一次完整验证结果：lint + test + build 已通过（你之前这轮阶段六完成时已跑通）。
最近里程碑提交
- 68c3d07：个人中心/用户页迁移 + 交互测试。
- 3341889：内部维护版 README 更新。
当前注意点
- 目前 vue-app 工作区有 1 个未提交变更：vue-app/README.md 显示为删除状态（D），建议确认是否为预期操作。
- 仓库整体仍有较多 legacy 侧未提交改动，与 Vue 主线功能本身无直接冲突，但会影响“整仓干净度”。
总体判断
- “Vue 可用重写版”已基本完成（可进入持续迭代阶段）。
- 距离“legacy 完全替换 + 上线级收口”还差：旧入口重定向、管理页增强、上线观测/回滚与 legacy 下线流程。