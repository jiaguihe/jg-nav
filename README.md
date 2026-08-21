# jg-nav v2

个人导航站 Monorepo 重构版。原项目见 `f:\jg-nav`（上线稳定后本仓库将替换它）。

## 技术栈

| 层 | 技术 | 版本 |
|----|------|------|
| 前端 | Vue + Vite (Rolldown) + Pinia + TanStack Query + Element Plus | Vue 3.6-rc / Vite 8 |
| 后端 | NestJS + TypeORM + MySQL + class-validator | NestJS 11 / TypeORM 1.1 |
| 共享 | @jg/api-types 前后端契约类型包 | TS 5.9 |

## 目录结构

```
jg-nav-new/
├── apps/
│   ├── nav-pc/            # 前端 SPA
│   └── nav-services/      # 后端 API
└── packages/
    └── api-types/         # 前后端共享类型（改接口先改这里）
```

## 相比 v1 的架构升级

- **Monorepo**：pnpm workspace，依赖统一管理，接口类型前后端共享
- **httpOnly Cookie 会话**：替代 localStorage token，XSS 无法窃取；前端零 token 管理
- **/api/user/me 会话恢复**：刷新页面不再依赖可伪造的 userInfo cookie
- **TanStack Query**：服务端状态缓存、自动失效刷新，替代手写 getLinks()
- **class-validator 入参校验**：后端 DTO 校验，替代仅前端校验
- **统一 ResponseDto 静态工厂**：success/fail 语义化构造
- **库表结构不变**：直接连旧库 jgnav，user/link 两表原样沿用

## 快速开始

```bash
# 1. 配置环境变量
cp apps/nav-services/.env.example apps/nav-services/.env
# 填写 DB_PASSWORD、JWT_SECRET（必填，无默认值兜底）

# 2. 安装依赖（根目录）
pnpm install

# 3. 构建共享类型包（首次必做，前后端都依赖）
pnpm build:types

# 4. 启动
pnpm --filter @jg/nav-services start:dev   # 后端 :3000
pnpm --filter @jg/nav-pc dev               # 前端 :5173（代理 /api）

# 全量构建
pnpm build
```

## 开发约定

- 修改接口：先改 `packages/api-types/src`，再改后端实现，前端类型自动同步
- 提交规范沿用 `.trae/skills/commit-spec`（随旧仓库迁移）
- 开发规范见旧仓库 `DEVELOPMENT.md`（上线替换时一并迁移）

## 待办（上线前）

- [ ] 生产 HTTPS 配置（nginx 或 Nest 直接挂证书）
- [ ] 生产 CORS_ORIGIN 与 NODE_ENV=production
- [ ] 前端 dist 部署路径确认
- [ ] 数据回归验证（旧账号登录、收藏列表完整）
