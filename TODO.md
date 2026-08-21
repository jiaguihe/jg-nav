# jg-nav v2 重构：交接待办

> 新项目位于 `f:\jg-nav-new`（未初始化 git）。旧项目 `f:\jg-nav` 保持线上运行，新项目验证稳定后强制推送替换。
> 项目详情见 `f:\jg-nav-new\README.md`。

## 当前状态（2026-08-21）

- [x] Monorepo 骨架：pnpm workspace（apps/ + packages/）
- [x] packages/api-types 共享类型包，构建通过
- [x] apps/nav-services：NestJS 11 + TypeORM 1.1，构建通过
- [x] apps/nav-pc：Vue 3.6-rc.4 + Vite 8 + Pinia 4 + TanStack Query 5，构建通过
- [x] 库表结构沿用旧库（synchronize: false），user/link 原样
- [x] 静态资源（背景图 7 张、default.png、police-logo.png）已复制
- [x] apps/nav-services/.env 已从旧项目复制
- [x] **运行时验证：已完成（2026-08-21）**，过程中发现并修复 1 个阻断性 bug，见下

### 首次启动验证结果（2026-08-21，全部通过）

- [x] 旧账号登录成功（旧库 4 账号数据完好；错误密码正确返回 401）
- [x] httpOnly Cookie（jg_token，HttpOnly + SameSite=Lax + 7 天）生效
- [x] 刷新页面会话保持（/api/user/me 恢复，浏览器实测通过）
- [x] 收藏列表展示、新增（www 自动补 https://，库里已验证）、删除（带确认框）
- [x] 注册新账号 → 自动登录（浏览器实测：注册成功即进入登录态）
- [x] 退出登录后 Cookie 清除（Set-Cookie 过期时间 1970）
- [x] Swagger 可访问：http://localhost:3000/api/docs
- [x] 越权防护：B 账号删/改 A 的 link 均 403，伪造 token 401，列表不泄露他人数据

### 验证中发现并修复的问题

1. **[已修复] 登录 500：JWT_SECRET 未加载**（阻断性）。原因：`user.module.ts` 的
   `JwtModule.register()` 在装饰器求值时执行，早于 `ConfigModule.forRoot()` 加载 `.env`；
   之前 DB 能连上纯属 app.module.ts 内求值顺序的侥幸。修复：JWT 改 `registerAsync` +
   ConfigService（缺 JWT_SECRET 启动即报错），TypeORM 同步改 `forRootAsync` 消除顺序依赖。
2. **[已改进] 全局异常过滤器不打日志**：未捕获异常只返回 500 无堆栈，排查困难。已加
   `console.error` 输出原始异常。
3. **[说明] 退出登录后旧 JWT 在有效期内仍可用**：无状态 JWT 的标准行为（登出=客户端清
   Cookie），v1 相同；如需服务端失效需引入 token 黑名单，暂不做。

### 遗留观察（非阻断）

- 后端冷启动约 40s（编译 + 连库），watch 重载约 15s，属正常范围
- 浏览器端到端验证截图存于 `gui-test-screenshots/`（7 张，不需要可删）

## 二、已知技术事项

- [ ] **Vue 3.6.0-rc.4**：正式版发布后 `pnpm up vue@latest`，API 兼容无需改码
- [ ] TanStack Query 的 ElMessage 依赖 element-plus 样式，main.ts 已全量引入（v1 是按需，若在意首屏体积可改回按需）
- [ ] 前端 chunk 超 500KB 警告（element-plus 全量所致），可接受；优化项非必须
- [ ] loginDialog 中 register 是动态 import，如遇加载问题可改静态

## 三、上线部署（替换旧站）

- [ ] 生产 HTTPS：旧项目 Nest 直接挂 ssl/heartbright.top 证书（main.ts 当年做法），新项目可沿用或改 nginx 反代
- [ ] `.env` 生产配置：`NODE_ENV=production`（Swagger 自动关闭、Cookie 加 secure）、`CORS_ORIGIN=https://www.heartbright.top`、`PORT`
- [ ] 前端 `pnpm build` 产物部署路径确认
- [ ] 数据回归：旧账号登录、收藏列表与 v1 完全一致（共用同一库，理论无差异）
- [ ] 数据库备份一次再切换（防御性）

## 四、Git 替换流程（用户既定方案）

1. 新项目验证稳定后，在 `f:\jg-nav-new` 内 `git init`
2. 复制旧仓库的 `.trae/`（rules + commit-spec skill）与 `DEVELOPMENT.md` 过来
3. 首次提交，然后：
   ```
   git remote add origin git@github.com:jiaguihe/jg-nav.git
   git push -f origin master   # 强推覆盖远程
   ```
4. 确认远程与线上无误后，删除旧目录 `f:\jg-nav`

## 五、可选优化（不影响上线）

- [ ] 收藏编辑功能（updateLink 后端已有，前端 UI 未做）
- [ ] 背景图切换（7 张图已有，v1 也未做）
- [ ] 忘记密码/改密（update 接口 v1 有、v2 未迁）
- [ ] Vitest 单测（packages 与后端 service 层适合先覆盖）
