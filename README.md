# Blog Front End（个人内部版）

个人博客前端重写项目（legacy + vue 并行阶段）。

## 当前结论（先看这个）

- Vue 主链路已可用：登录/注册、首页、搜索、详情、评论、发文、编辑、个人中心、公开用户页、管理页
- 权限规则已统一：作者可编辑，管理员仅删除
- 阶段 1~6 已完成并推送
- 当前仍保留 legacy 目录，用于过渡与对照

---

## 仓库结构（最小认知）

```txt
.
├─ ai-html/     # legacy 页面
├─ js/          # legacy 脚本
├─ css/         # legacy 样式
└─ vue-app/     # Vue 重写主线（主要维护这里）
```

---

## 本地启动（我的常用流程）

1. 启动后端（`http://localhost:8080`）
2. 启动前端：

```bash
cd vue-app
npm install
npm run dev
```

3. 打包前检查：

```bash
npm run lint
npm run test
npm run build
```

---

## 环境变量

`vue-app/.env.development`：

```env
VITE_API_BASE_URL=http://localhost:8080
```

---

## 关键约定（防自己踩坑）

- token 存储：
  - `localStorage.jwt`
  - `localStorage.user`
- 请求头：`authentication: <token>`
- 管理员：`role === 0`
- 权限：
  - 文章：仅作者可编辑；作者/管理员可删除
  - 评论：仅评论作者可编辑；评论作者/管理员可删除
  - 管理员对他人内容不显示编辑 UI（仅删除）

---

## 已完成阶段

- [x] 阶段1：Vue 工程骨架
- [x] 阶段2：认证与权限底座
- [x] 阶段3：主链路（首页/搜索/详情/评论）
- [x] 阶段4：文章编辑（ByteMD）
- [x] 阶段5：权限规则全量统一
- [x] 阶段6：个人中心深度迁移 + 公开用户页 + 交互测试

---

## 下一步（内部执行）

1. 管理页增强（批量操作、筛选）
2. 旧入口兼容重定向（`/ai-html/*.html` -> Vue 路由）
3. 上线级收口（包体拆分、监控、回滚预案）
4. 稳定后下线 legacy

---

## 常用命令速查

```bash
# 开发
cd vue-app && npm run dev

# 质量检查
cd vue-app && npm run lint
cd vue-app && npm run test
cd vue-app && npm run build
```

---

## 备注

- 现阶段新功能只写 `vue-app/`
- legacy 不主动扩展，只做迁移过渡
- 每次改权限逻辑，优先改 `src/utils/permissions.ts` 并补测试
