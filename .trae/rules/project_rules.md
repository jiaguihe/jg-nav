# jg-nav 项目开发规则（Agent 必读）

完整规范见仓库根目录 `DEVELOPMENT.md`，提交命名规范见 `.trae/skills/commit-spec/SKILL.md`。本文件为强制规则摘要，所有代码改动必须遵守。

## 项目结构

- `nav-pc/`：前端（Vue 3 + TS + Vite + Element Plus）
- `nav-services/`：后端（NestJS + TypeORM + MySQL）
- 改动必须落在正确的包内，禁止前后端职责互相越界

## 前端规则（nav-pc）

1. 组件一律 `<script setup lang="ts">`，模板顺序 template → script → style
2. 样式必须 `scoped`，全局样式只写 `src/styles/index.scss`
3. 所有 HTTP 请求只能写在 `src/services/`，组件禁止直接用 axios
4. 静态资源必须 `import img from '@/assets/...'`，禁止字符串相对路径
5. 定时器、事件监听必须在 `onUnmounted` 清理
6. 提示统一用 `ElMessage` / `ElMessageBox`
7. 不引入 Element Plus 之外的组件库

## 后端规则（nav-services）

1. Controller 只做参数接收、鉴权、调 Service、组装响应；业务逻辑写在 Service
2. 新模块按 `module/links/` 的目录结构组织（dto/entities/controller/service/module）
3. 统一返回 `ResponseDto { code, message, data }`，code=0 成功、-1 失败
4. 错误抛 `HttpException` 子类交给全局过滤器，禁止 Controller 手写 try/catch 包装
5. 所有写接口（增删改）和读他人数据的接口必须加 `@UseGuards(JwtAuthGuard)`
6. 涉及资源归属的操作必须校验 `req.user.id` 与资源 `userId` 一致
7. 密码只允许 bcrypt 加密存储，禁止明文或可逆加密

## 命名规范

- 变量/函数 camelCase，函数动词开头（get/handle/remove）
- 布尔值 is/has/can 或 Visible 等状态词开头
- 类型/实体/DTO PascalCase，DTO 文件 kebab-case（create-user.dto.ts）
- API 路由用复数名词

## 安全红线

1. `.env`、密钥、证书文件永不提交，新配置项从 `process.env` 读取
2. 禁止硬编码密钥、账号、内网地址
3. 生产环境不暴露 Swagger

## Git 提交

- 提交前必须加载 commit-spec skill，按 `<type>(<scope>): <subject>` 格式生成
- scope 只用 nav-pc / nav-services / repo，中文 subject，不相关改动拆分提交
- 提交前运行对应子包 `pnpm build` 确认可编译
