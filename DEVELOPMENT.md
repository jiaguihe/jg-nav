# jg-nav 开发规范

个人项目规范，以约定为主、不强制检查。目标：代码风格统一、结构清晰、半年后自己还能看懂。

## 1. 项目结构

```
jg-nav/
├── apps/
│   ├── nav-pc/          # 前端：Vue 3 + TS + Vite + Element Plus
│   └── nav-services/    # 后端：NestJS + TypeORM + MySQL
├── packages/
│   └── api-types/       # 前后端共享接口类型包 @jg/api-types
├── AGENTS.md            # Agent 强制规则摘要
├── DEVELOPMENT.md       # 本文档
└── .zcode/skills/       # AI 辅助 skill（提交命名等）
```

约定：

- pnpm workspace 管理依赖，根目录 `package.json` 只放 dev / build / lint 等快捷命令
- 修改接口：先改 `packages/api-types/src`，再改后端实现，前端类型自动同步
- 公共问题不改两边各一套：前端只关心 API 契约，后端只关心数据与业务
- 新功能先想清楚落在哪个模块，避免"功能越界"（如前端做权限判断、后端做样式文案）

## 2. 命名规范

| 对象 | 规范 | 示例 |
|------|------|------|
| 目录 | kebab-case | `api-types/`、`login-register/`（新增目录时遵守） |
| Vue 组件文件 | 组件用 PascalCase，页面用 camelCase | `LinkCard.vue`（组件）、`navPage.vue`（页面） |
| 变量 / 函数 | camelCase，函数用动词开头 | `getLinks`、`handleAdd`、`removeLink` |
| 常量 | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 类型 / 接口 | PascalCase，接口可加 `I` 前缀或不加（二选一保持统一） | `Link`、`ResponseDto` |
| TS 类型文件 | 与被描述对象同名 | `user.entity.ts`、`create-user.dto.ts` |
| 事件处理 | `handle` + 事件名 | `handleClick`、`handleImgError` |
| 布尔值 | `is/has/can` 开头 | `isAgreed`、`dialogVisible` |
| 数据库表 / 字段 | snake_case，表名用单数名词 | `user.username`、`link.description` |
| API 路由 | 复数名词 + 参数用资源 id | `GET /api/links/:userId` |

## 3. 前端规范（nav-pc）

### 3.1 组件写法

- 一律使用 `<script setup lang="ts">`，不写 Options API
- 组件模板顺序：`<template>` → `<script setup>` → `<style scoped>`
- 样式一律 `scoped` + SCSS，避免全局污染；全局样式只放 `styles/index.scss`
- 单组件控制在 300 行内，超了就拆子组件

### 3.2 状态与数据流

- 组件内状态用 `ref`/`reactive`；跨组件流转优先 props/emit；服务端状态用 TanStack Query（缓存 + 自动失效刷新）；复杂共享状态用 Pinia
- 登录态：token 由后端写入 httpOnly Cookie（`jg_token`），前端零 token 管理；会话恢复走 `GET /api/user/me`，不依赖本地缓存判断登录
- 定时器、事件监听必须在 `onUnmounted` 清理

### 3.3 API 层

- 所有请求只写在 `src/services/` 下，组件不直接使用 axios
- 新接口按现有风格导出函数：`export function xxx() { return service.xxx(...) }`
- 请求 / 响应类型从 `@jg/api-types` 导入，不在前端重复定义
- 静态资源一律 `import img from '@/assets/...'`，禁止字符串路径（打包会失效）

### 3.4 UI

- 统一使用 Element Plus，不混用其他组件库
- 用户提示统一用 `ElMessage`/`ElMessageBox`，文案明确说"发生了什么、该怎么做"

## 4. 后端规范（nav-services）

### 4.1 模块结构

公共设施在 `src/common/`（全局异常过滤器、`ResponseDto`、`JwtAuthGuard`），业务模块在 `src/modules/<name>/`，现有模块：user、link、takeaway、todo、note、memorial。新模块按现有结构组织：

```
modules/<name>/
├── dto/           # 入参校验（create-xxx.dto.ts / update-xxx.dto.ts）
├── entities/      # TypeORM 实体
├── <name>.controller.ts
├── <name>.service.ts
└── <name>.module.ts
```

- Controller 只做参数接收、鉴权、调 Service、组装响应；业务逻辑写在 Service
- 错误通过抛 `HttpException` 子类（`ForbiddenException` 等）交给全局过滤器，不要在 Controller 里 try/catch 包一层再返回

### 4.2 接口约定

- 统一前缀 `/api`（`main.ts` 全局设置），统一返回 `ResponseDto { code, message, data }`
- `code = 0` 成功，`code = -1` 失败（前端拦截器依赖此约定）
- 会话：JWT 存 httpOnly Cookie `jg_token`，`JwtAuthGuard` 从 Cookie 读取（兼容 Authorization 头）
- 写操作（增删改）和读他人数据的接口必须加 `@UseGuards(JwtAuthGuard)`
- 涉及资源归属的操作（改/删/查他人数据），必须校验 `req.user.id` 与资源 `userId` 一致

### 4.3 配置与密钥

- 数据库、JWT 密钥等一律放 `.env`，**`.env` 不提交**（已在 `.gitignore`）
- 代码中通过 `process.env.XXX` 读取，不允许硬编码密钥
- 新增配置项时同步更新 `.env.example`（不含真实值），方便换机部署

## 5. 代码风格

- 格式化交给 Prettier（两包已有配置），保存即格式化，不做手工争论
- 缩进 2 空格、单引号、分号结尾
- 注释写"为什么"，不写"是什么"；函数自解释则不加注释
- 删代码就删干净，不留注释掉的旧代码
- 提交前本地过一遍 `pnpm build`（或对应子包 build），保证可编译

## 6. Git 工作流（个人简化版）

- 主干分支 `master`，日常小改动直接提交到 master
- 较大功能或重构：从 master 拉 `feat/xxx` 或 `fix/xxx` 分支，完成后合回
- **提交命名规范见 `.zcode/skills/commit-spec/SKILL.md`**，核心格式：

```
<type>(<scope>): <subject>
```

- scope 只用 `nav-pc` / `nav-services` / `api-types` / `repo`
- 不相关的改动拆成多个提交，一次提交只做一件事

## 7. 安全红线（个人项目也要守）

1. `.env`、密钥、证书文件永不提交
2. 所有写接口必须鉴权，所有资源操作必须校验归属
3. 用户密码必须 bcrypt 加密存储（已有），不引入明文/可逆加密
4. 生产部署不暴露 Swagger（或加访问控制）
5. 依赖出现漏洞告警时，及时升级
