---
name: check-ci
description: 诊断 GitHub CI / Actions 失败原因。用户说 CI 红了、checks 失败、流水线挂了、GitHub 构建失败时使用。
disable-model-invocation: true
---

# 检查 CI 失败

用 `gh` 查状态，用日志定位根因，用中文总结 **原因 + 建议改法**。

## 1. 确定查什么

- 当前分支 PR：`gh pr view --json number,url,statusCheckRollup,headRefName`
- 无 PR 时：`gh run list --branch "$(git branch --show-current)" --limit 5`
- 用户给了 PR 号或 URL：直接 `gh pr view <n>` 或解析 URL

## 2. 拉失败详情

对失败的 check / workflow run：

```bash
gh run view <run-id> --log-failed
```

必要时：

```bash
gh pr checks <number>
gh run view <run-id>
```

## 3. 分析输出

- 指出 **第一个/root cause** 错误（类型错误、lint、测试失败、构建失败）
- 关联到 **文件与行号**（若日志里有）
- 区分：代码问题 vs 环境/权限 vs flaky
- **不要** 在没看日志前猜测；**不要** 为了过 CI 而 `--no-verify` 或删测试

## 4. 回复格式

```markdown
## CI 状态
（PR / 分支、哪些 check 红）

## 根因
（一句话 + 关键日志摘录）

## 建议修复
（具体改哪、跑什么命令本地复现）
```

## 5. 本地复现（本项目）

根据失败类型建议：

| 失败类型 | 本地命令 |
|---------|---------|
| TypeScript | `bun run typecheck` |
| ESLint | `bun run lint` |
| 测试 | `bun test` |
| 构建 | `bun run build` |

## 6. gh 未登录

若 `gh auth status` 失败，提示用户运行 `gh auth login` 或 `gh auth refresh`，不要伪造 CI 结果。
