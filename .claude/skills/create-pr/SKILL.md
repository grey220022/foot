---
name: create-pr
description: 创建 GitHub Pull Request。用户说开 PR、提 pull request、push 并提交评审、创建合并请求时使用。
disable-model-invocation: true
arguments: [title, base]
---

# 创建 Pull Request

用 `gh` 和 `git` 完成，不要跳过任何检查步骤。

调用格式：`/create-pr "PR 标题" <目标分支>`

示例：`/create-pr "修复 EV 边界计算" main`

## 0. 参数检查

两个参数都是必填：

- `$title`：PR 标题（含空格须加引号）
- `$base`：目标分支（如 `main`、`develop`）

若 `$title` 为空：
- **停止执行**
- 提示：「缺少 PR 标题，格式：`/create-pr "标题" <目标分支>`」

若 `$base` 为空：
- **停止执行**
- 提示：「缺少目标分支，格式：`/create-pr "标题" <目标分支>`」
- 不要擅自猜测或默认 main

## 1. 分支安全检查

运行：

```bash
git branch --show-current
```

若当前分支是 `main`、`master` 或 `develop`：
- **停止执行，不要 push**
- 提示：「当前在受保护分支（$当前分支名），请先切到 feature 分支再开 PR」
- 建议命令：`git checkout -b feature/xxx` 或 `git checkout <已有分支>`
- 不要继续往下走

## 2. 了解当前状态

并行执行：

- `git status`
- `git diff`（含 staged 与 unstaged）
- `git log --oneline -10`
- `git diff main...HEAD`

## 3. 提交相关改动

**不要自动执行 `git add .` 或 `git commit`**。

若发现工作区有未 staged / 未 commit 的改动：
- 列出具体文件，询问用户是否要一并提交
- 等用户明确同意后，才可以 `git add` + `git commit`
- 用户说「不用」则只 push 已有 commit

**检查禁止提交的文件：**
- 不要 stage `.env`、`.env.*`、密钥、token
- 发现这类文件立即停下并告知

## 4. Push

```bash
git push -u origin HEAD
```

若 push 失败，说明原因（权限、冲突、未登录），不要 blind retry。

## 5. 写 PR body

按固定模板：

```markdown
## Summary
- …

## Test plan
- [ ] …
```

- Summary：1–3 条，写 **为什么**，不只列文件名
- Test plan：本项目候选：`bun test`、`bun run typecheck`、`bun run lint`、预览 `out/`

## 6. 创建 PR

用用户传入的 `$title` 作为标题：

```bash
gh pr create --title "$title" --base "$base" --body "$(cat <<'EOF'
## Summary
…

## Test plan
- [ ] …

EOF
)"
```

创建成功后 **返回 PR URL**。

## 7. 禁止

- 不要 `git push --force` 到任何分支
- 不要 amend 已 push 的 commit（除非用户明确要求）
- 不要更新 git config
- 不要跳过步骤 0、1、3 的检查
