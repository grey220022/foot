---
name: pr-body
description: 按项目模板撰写或修订 PR 描述（Summary + Test plan）。用户说写 PR body、PR 描述、合并请求说明、按模板写时使用。
disable-model-invocation: true
---

# PR Body 模板

输出可直接粘贴到 `gh pr create --body` 或 GitHub 网页的 Markdown。

## 固定结构

```markdown
## Summary

- （1–3 条 bullet，完整句子，说明 **为什么** 做这次改动）
- （聚焦意图与影响，不要只列文件名）

## Test plan

- [ ] （验证项 1）
- [ ] （验证项 2）
```

## 撰写规则

1. **先读 diff**：`git diff main...HEAD`（或实际 base 分支），覆盖 **所有** 将进 PR 的 commit，不只最新一条
2. **Summary**：用「add / fix / update」等准确动词；2–3 句为宜；不写实现细节堆砌
3. **Test plan**：具体、可执行；本项目默认候选：
   - `bun test`
   - `bun run typecheck`
   - `bun run lint`
   - `bun run build` 后预览静态站（若动到构建或页面）
4. 若改动纯文档或配置，Test plan 可写「无需运行时验证，已人工通读」

## 修订已有 PR

若 PR 已存在：

```bash
gh pr view --json number,body,url
gh pr edit <number> --body "$(cat <<'EOF'
…
EOF
)"
```

## 输出

- 给出完整 body 原文（用户可复制）
- 若已创建 PR，说明是否已用 `gh pr edit` 更新
