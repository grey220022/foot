# Workflows

放置项目特定的自定义工作流脚本。

工作流使用 JavaScript 编写，可以编排多个 agent 并行或串行执行任务。

## 示例工作流

```javascript
export const meta = {
  name: 'example-workflow',
  description: '示例工作流',
  phases: [
    { title: '分析', detail: '分析代码' },
    { title: '实现', detail: '实现功能' }
  ]
}

export default async function() {
  // 工作流逻辑
}
```

## 相关命令

- 查看工作流：`/workflows`
- 运行工作流：使用 Workflow 工具
