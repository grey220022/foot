---
name: merge-pr
description: 合并 GitHub Pull Request。用户说 merge PR、合并这个 PR、approve 并合并时使用。
disable-model-invocation: true
---

# 合并 Pull Request

**写操作**：合并前必须确认用户意图，并展示 PR 摘要。

## 1. 定位 PR

- 用户未指定编号：当前分支 `gh pr view --json number,title,url,state,mergeable,statusCheckRollup`
- 用户给了 URL/编号：`gh pr view <n> --json number,title,url,state,mergeable,statusCheckRollup,headRefName,baseRefName`

若 **没有 open 的 PR**，说明情况并停止。

## 2. 合并前检查

必须确认：

- [ ] PR 状态为 `OPEN`
- [ ] `mergeable` 为 true（或有说明冲突需先解决）
- [ ] 关键 CI checks 已通过（若有失败，**默认不 merge**，除非用户明确接受）
- [ ] 不是误 merge 到错误分支（展示 base / head）

运行：

```bash
gh pr checks <number>
```

## 3. 执行合并

默认使用 **squash merge**（历史干净；若用户要求 merge commit / rebase，按其指定）：

```bash
gh pr merge <number> --squash --delete-branch
```

可选：

- `--merge` — merge commit
- `--rebase` — rebase merge
- 不加 `--delete-branch` — 保留远程 head 分支（用户要求时）

## 4. 合并后

- 返回合并结果与 PR URL
- 若本地还在 feature 分支，提示可 `git checkout main && git pull`

## 5. 禁止

- **不要** force merge 有冲突的 PR
- **不要** merge 到 `main` 若 CI 全红且用户未明确同意
- **不要** `git push --force` 到 shared 默认分支
- 用户只说「review」时 **不要** 误执行 merge
