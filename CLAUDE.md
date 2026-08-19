# 足球正 EV 寻找器

## 项目概要

纯前端的足球赔率偏离分析工具。输入 1X2 赔率与两队的 Opta / Elo 评分，对比模型概率与市场去抽水后的隐含概率，给出偏离方向与幅度，用于筛选正 EV 的下注机会。

## 技术栈

- Next.js 16（App Router）+ React 19 + TypeScript + Tailwind 4
- Bun 作为包管理器
- 静态导出（`output: "export"`），构建产物在 `out/`，无需服务端

## 关键文件

- `src/lib/ev.ts` — 核心概率计算；`analyse()` 为入口，一次返回页面所需的全部数字
- `src/lib/leagues.ts` — 联赛常量与主场优势数据
- `src/lib/ev.test.ts` — 单元测试（含主场优势校准）
- `src/app/page.tsx` — 主表单页面与校验
- `src/components/DecimalField.tsx` — 赔率 / 评分输入约束（`NumericFormat`）
- `scripts/home-advantage.mjs` — 主场优势数据生成；`bun run home-advantage` 重跑

## 开发注意事项

- `bun run dev` 启动开发服务器，`bun test` / `bun run typecheck` / `bun run lint` 做检查
- 计算层是纯函数，与 UI 解耦；改概率逻辑优先改 `src/lib/ev.ts`
- 勿引入 API Route、Server Actions 等需要 Node 服务端的能力
- 模型尺度参数 `ELO_SCALE` / `OPTA_SCALE` 在 `ev.ts` 顶部；`homeAdvantageOpta()` 会随联赛主场优势自动换算
- 偏离不等于优势：模型只看 Opta / Elo，页面上是筛选工具而非下注依据
