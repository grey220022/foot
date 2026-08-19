# Agents

放置项目特定的自定义 agent 定义。

Agent 定义包含 agent 的系统提示、工具权限和行为配置。

## 示例 agent

创建一个 `probability-analyzer.md` 文件来定义专门处理概率计算的 agent：

```markdown
---
name: probability-analyzer
description: 专门分析足球概率计算逻辑
---

你是一个概率计算专家，精通 Bradley-Terry 模型和 Elo 评分系统。
```
