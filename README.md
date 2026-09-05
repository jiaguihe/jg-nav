# jg-nav

个人导航站：收藏导航 + 外卖记录 + 效率工具（待办 / 便签 / 纪念日 / 番茄钟），Monorepo 架构，前后端共享接口类型。

## 功能

- **导航主页**：收藏卡片分组管理、多搜索引擎切换、玻璃拟态 UI
- **外卖记录**：点餐记录与统计
- **效率工具页**：待办、便签、纪念日、番茄钟
- **实用小工具**（无需登录）：JSON 格式化/压缩/校验/转义、URL 编解码与解析、时间戳双向转换、图片地址下载
- **翻译**：百度翻译 API 后端代理（服务端签名与 QPS 限速，密钥不出后端）
- **使用统计**：收藏点击等使用数据

## 技术栈

| 层 | 技术 | 版本 |
|----|------|------|
| 前端 | Vue + Vite (Rolldown) + Pinia + TanStack Query + Element Plus | Vue 3.6-rc / Vite 8 |
| 后端 | NestJS + TypeORM + MySQL + class-validator | NestJS 11 / TypeORM 1.1 |
| 共享 | @jg/api-types 前后端契约类型包 | TS 5.9 |

## 目录结构

```
jg-nav/
├── apps/
│   ├── nav-pc/            # 前端 SPA（导航 / 外卖 / 效率工具三个页面）
│   └── nav-services/      # 后端 API（user / link / takeaway / todo / note / memorial 模块）
└── packages/
    └── api-types/         # 前后端共享类型（改接口先改这里）
```

## 架构特性

- **Monorepo**：pnpm workspace，依赖统一管理，接口类型前后端共享
- **httpOnly Cookie 会话**：替代 localStorage token，XSS 无法窃取；前端零 token 管理
- **/api/user/me 会话恢复**：刷新页面自动恢复登录态
- **TanStack Query**：服务端状态缓存、自动失效刷新
- **class-validator 入参校验**：后端 DTO 统一校验
- **统一 ResponseDto 静态工厂**：success/fail 语义化构造
- **可选 HTTPS**：Nest 可直接挂证书，或走 nginx 反代

## 快速开始

环境要求：Node >= 22，pnpm >= 10，MySQL。

```bash
# 1. 配置环境变量
cp apps/nav-services/.env.example apps/nav-services/.env
# 填写 DB_PASSWORD、JWT_SECRET（必填，无默认值兜底）
# 空库首次部署可设 DB_SYNCHRONIZE=true 自动建表，建完改回 false

# 2. 安装依赖（根目录）
pnpm install

# 3. 构建共享类型包（首次必做，前后端都依赖）
pnpm build:types

# 4. 启动
pnpm dev:all                               # 前后端一起启动
pnpm --filter @jg/nav-services start:dev   # 或单启后端 :3000
pnpm --filter @jg/nav-pc dev               # 或单启前端 :5173（代理 /api）

# 全量构建
pnpm build
```

## 开发约定

- 修改接口：先改 `packages/api-types/src`，再改后端实现，前端类型自动同步
- Agent 规则摘要见 [AGENTS.md](./AGENTS.md)，提交规范 skill 在 `.zcode/skills/commit-spec`，格式 `<type>(<scope>): <subject>`
- 其余开发规范见 [DEVELOPMENT.md](./DEVELOPMENT.md)
