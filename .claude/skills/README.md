# Skills

Claude Code 技能目录。每个技能必须是 **子目录 + `SKILL.md`**，不能是根下的单个 `.md` 文件。

## 目录结构

```
.claude/skills/
├── create-pr/
│   └── SKILL.md
├── pr-body/
│   └── SKILL.md
├── check-ci/
│   └── SKILL.md
└── merge-pr/
    └── SKILL.md
```

## 相关命令

- 查看技能列表：`/skills`
- 运行技能：`/create-pr`、`/pr-body`、`/check-ci`、`/merge-pr`

## 新增技能

```bash
mkdir -p .claude/skills/my-skill
# 编辑 .claude/skills/my-skill/SKILL.md
```

`SKILL.md` 需要 YAML frontmatter（至少 `description`），目录名即斜杠命令名。
