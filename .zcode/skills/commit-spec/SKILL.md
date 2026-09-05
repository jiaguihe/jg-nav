---
name: "commit-spec"
description: "Generates git commit messages following Conventional Commits for the jg-nav monorepo (nav-pc frontend / nav-services backend). Invoke when the user asks to commit, write a commit message, or prepare a push."
---

# Git 提交命名规范（jg-nav）

为本仓库生成提交信息时，必须遵循以下规范。

## 提交信息格式

```
<type>(<scope>): <subject>

[可选 body]

[可选 footer]
```

## type 类型（必须使用以下小写单词）

| type | 含义 | 示例 |
|------|------|------|
| feat | 新功能 | 新增网址收藏、新增登录 |
| fix | 缺陷修复 | 修复越权删除、修复 favicon 兜底图 |
| docs | 文档变更 | 补充开发规范、更新 README |
| style | 代码格式（不影响逻辑） | 格式化缩进、删多余空行 |
| refactor | 重构（既不是新增也不是修复） | 抽取公共方法、拆分组件 |
| perf | 性能优化 | 减少重复请求、懒加载 |
| test | 测试相关 | 新增单测 |
| chore | 构建/工具/依赖等杂项 | 更新依赖、配置 vite |

## scope 范围（必须使用以下值）

| scope | 范围 |
|-------|------|
| nav-pc | 前端项目 `apps/nav-pc/` |
| nav-services | 后端项目 `apps/nav-services/` |
| api-types | 共享类型包 `packages/api-types/` |
| repo | 仓库级：根目录、文档、构建脚本、CI |

- 只改一个包：单 scope，如 `fix(nav-services): ...`
- 同一目的改动跨前后端：双 scope 用逗号分隔，如 `feat(nav-pc,nav-services): ...`
- 仓库级改动：`docs(repo): ...`

## subject 规则

1. 使用中文，简洁描述"做了什么"，一行不超过 30 个汉字
2. 祈使语气，结尾不加句号、顿号等任何标点
3. 不写"修改了一些东西"这类模糊描述；要能看出改动点
4. 首字母无需大写（中文不涉及），不重复 type/scope 已表达的信息

## body 规则（可选）

- 当改动较复杂时补充：背景原因、主要改动点（用 `-` 列表）、影响面
- 每行不超过 72 字符

## footer 规则（可选）

- 不兼容变更必须注明：`BREAKING CHANGE: <描述>`
- 关联 issue：`Closes #12`

## 示例

好的提交：

```
feat(nav-pc): 新增网址收藏的添加与删除功能
fix(nav-services): 修复未登录用户可查看他人收藏的越权问题
refactor(nav-pc): 移除登录弹窗中无用的用户列表请求
docs(repo): 补充开发规范与提交规范文档
chore(nav-pc): 升级 element-plus 至 2.9.0
feat(nav-pc,nav-services): 收藏图标加载失败时展示默认占位图

fix(nav-pc): 修复打包后默认占位图路径失效

- favicon 兜底图由字符串路径改为模块导入
- 由 Vite 构建器处理资源路径，避免 build 后 404
```

坏的提交（禁止出现）：

```
更新                      # 无 type、无 scope、描述模糊
fix: 修改了bug            # bug 未说明是什么问题，缺 scope
feat(nav-pc): 新增功能。  # 结尾带句号
FIX(NAV-PC): 修复问题     # type/scope 必须小写
修改了登录和注册还有样式   # 多个不相关改动混在一个提交
```

## 生成提交信息时的流程

1. 用 `git diff --staged`（或 `git status` + `git diff`）查看实际改动
2. 判断改动属于哪个 type、哪个 scope
3. 不相关的改动建议用户拆分成多个提交，而不是混在一起
4. 按 `git commit -m "$(cat <<'EOF' ... EOF)"` 的格式提交
