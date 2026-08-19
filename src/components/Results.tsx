import { Card, StatRow } from "@/components/Card";
import type { Analysis, Deviation, ModelReport } from "@/lib/ev";
import { pct, signedNumber, signedPct, signedPp } from "@/lib/format";

function DeviationBadge({ deviation, side }: { deviation: Deviation; side: "主胜" | "客胜" }) {
  const { direction } = deviation;
  const tone =
    direction === "model-higher"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
      : direction === "model-lower"
        ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
        : "border-slate-600 bg-slate-800/60 text-slate-300";
  const text =
    direction === "model-higher"
      ? `模型偏高 · ${side}被低估`
      : direction === "model-lower"
        ? `模型偏低 · ${side}被高估`
        : "与市场一致";

  return (
    <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${tone}`}>{text}</span>
  );
}

function DeviationRow({ label, deviation }: { label: string; deviation: Deviation }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-slate-800/70 py-2 last:border-b-0">
      <span className="text-sm text-slate-300">{label}</span>
      <span className="font-mono text-sm whitespace-nowrap text-slate-50 tabular-nums">
        {signedPp(deviation.diffPp)}
        <span className="ml-2 text-slate-500">相对 {signedPct(deviation.diffRelPct)}</span>
      </span>
    </div>
  );
}

function ModelCard({
  report,
  analysis,
  ratingUnit,
  homeAdvantage,
  scaleNote,
}: {
  report: ModelReport;
  analysis: Analysis;
  ratingUnit: string;
  homeAdvantage: number;
  scaleNote: string;
}) {
  return (
    <Card
      title={`${report.label} 模型偏离`}
      subtitle={`主队评分已加主场优势 ${signedNumber(homeAdvantage, 2)} ${ratingUnit}；${scaleNote}`}
      right={
        <div className="flex flex-col items-end gap-1">
          <DeviationBadge deviation={report.homeDeviation} side="主胜" />
          <DeviationBadge deviation={report.awayDeviation} side="客胜" />
        </div>
      }
    >
      <div className="grid gap-x-8 gap-y-0 md:grid-cols-2">
        <div>
          <StatRow
            label="调整后评分差"
            value={`${signedNumber(report.adjustedEdge, 2)} ${ratingUnit}`}
            hint="含主场优势"
          />
          <StatRow
            label={`${report.label} 主胜率`}
            value={pct(report.homeWinExclDraw)}
            hint="不含和局"
          />
          <StatRow
            label={`${report.label} 客胜率`}
            value={pct(report.awayWinExclDraw)}
            hint="不含和局"
          />
        </div>
        <div>
          <StatRow
            label="市场主胜率"
            value={pct(analysis.marketHomeExclDraw)}
            hint="忽略和局赔率"
          />
          <StatRow
            label="市场客胜率"
            value={pct(analysis.marketAwayExclDraw)}
            hint="忽略和局赔率"
          />
          <StatRow
            label="模型公平赔率"
            value={`${report.fairOddsHome.toFixed(2)} / ${report.fairOddsAway.toFixed(2)}`}
            hint="主 / 客，已折算和局"
          />
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-1">
        <DeviationRow label="主胜偏离（模型 − 市场）" deviation={report.homeDeviation} />
        <DeviationRow label="客胜偏离（模型 − 市场）" deviation={report.awayDeviation} />
      </div>
    </Card>
  );
}

function EvCell({ value }: { value: number }) {
  const tone = value > 0 ? "text-emerald-300" : value < 0 ? "text-rose-300" : "text-slate-300";
  return <span className={`font-mono tabular-nums ${tone}`}>{signedPct(value * 100)}</span>;
}

export function Results({ analysis }: { analysis: Analysis }) {
  const { league, matchOdds, totals } = analysis;

  return (
    <div className="flex flex-col gap-4">
      <Card
        title="市场抽水"
        subtitle="主胜 / 和局 / 客胜 按比例去抽水后的公平概率"
        right={
          <span className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-mono text-xs text-amber-300">
            抽水 {pct(matchOdds.margin)}
          </span>
        }
      >
        <div className="grid gap-x-8 gap-y-0 md:grid-cols-2">
          <div>
            <StatRow label="赔率总和 (book sum)" value={matchOdds.bookSum.toFixed(4)} />
            <StatRow label="超额 (overround)" value={pct(matchOdds.overround)} />
            <StatRow label="抽水百分比 (margin)" value={pct(matchOdds.margin)} hint="1 − 1/总和" />
          </div>
          <div>
            <StatRow
              label="主胜"
              value={`${pct(matchOdds.rawHome)} → ${pct(matchOdds.fairHome)}`}
              hint="原始 → 公平"
            />
            <StatRow
              label="和局"
              value={`${pct(matchOdds.rawDraw)} → ${pct(matchOdds.fairDraw)}`}
              hint="原始 → 公平"
            />
            <StatRow
              label="客胜"
              value={`${pct(matchOdds.rawAway)} → ${pct(matchOdds.fairAway)}`}
              hint="原始 → 公平"
            />
          </div>
        </div>
      </Card>

      <ModelCard
        report={analysis.opta}
        analysis={analysis}
        ratingUnit="分"
        homeAdvantage={analysis.homeAdvantageOpta}
        scaleNote="百分制，尺度 40"
      />

      <ModelCard
        report={analysis.elo}
        analysis={analysis}
        ratingUnit="Elo"
        homeAdvantage={analysis.homeAdvantageElo}
        scaleNote="标准 Elo 尺度 400"
      />

      {totals ? (
        <Card
          title="大小球 2.5"
          subtitle="按比例去抽水后的公平概率"
          right={
            <span className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-mono text-xs text-amber-300">
              抽水 {pct(totals.market.margin)}
            </span>
          }
        >
          <div className="grid gap-x-8 gap-y-0 md:grid-cols-2">
            <div>
              <StatRow
                label="−2.5 球（小球）公平概率"
                value={pct(totals.fairUnder25)}
                hint="去抽水后"
              />
              <StatRow
                label="+2.5 球（大球）公平概率"
                value={pct(totals.fairOver25)}
                hint="去抽水后"
              />
            </div>
            <div>
              <StatRow label="赔率总和" value={totals.market.bookSum.toFixed(4)} />
              <StatRow
                label={`${league.localName} 近三年大球率`}
                value={pct(totals.leagueOver25)}
                hint={`${league.matches} 场`}
              />
            </div>
          </div>
        </Card>
      ) : null}

      <Card
        title="EV 参考"
        subtitle="把模型的不含和局胜率按市场公平和局率还原成三项概率后，计算每 1 单位本金的期望收益。和局概率取自市场，因此这是有假设的推导值，不是纯模型输出。"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs tracking-wide text-slate-500 uppercase">
                <th className="py-2 pr-4 font-medium">模型</th>
                <th className="py-2 pr-4 font-medium">主胜概率</th>
                <th className="py-2 pr-4 font-medium">主胜 EV</th>
                <th className="py-2 pr-4 font-medium">客胜概率</th>
                <th className="py-2 font-medium">客胜 EV</th>
              </tr>
            </thead>
            <tbody>
              {[analysis.opta, analysis.elo].map((report) => (
                <tr key={report.label} className="border-b border-slate-800/60 last:border-b-0">
                  <td className="py-2 pr-4 text-slate-200">{report.label}</td>
                  <td className="py-2 pr-4 font-mono text-slate-300 tabular-nums">
                    {pct(report.homeWinAbsolute)}
                  </td>
                  <td className="py-2 pr-4">
                    <EvCell value={report.evHome} />
                  </td>
                  <td className="py-2 pr-4 font-mono text-slate-300 tabular-nums">
                    {pct(report.awayWinAbsolute)}
                  </td>
                  <td className="py-2">
                    <EvCell value={report.evAway} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card
        title={`${league.localName} 主场优势 · 近三年`}
        subtitle={`${league.name}，${league.matches} 场（2023/24 – 2025/26），数据源 football-data.co.uk`}
      >
        <div className="grid gap-x-8 gap-y-0 md:grid-cols-2">
          <div>
            <StatRow label="主胜 / 和局 / 客胜" value={`${pct(league.homeWinPct, 1)} / ${pct(league.drawPct, 1)} / ${pct(league.awayWinPct, 1)}`} />
            <StatRow label="不含和局的主胜率" value={pct(league.homeWinPctExclDraw)} />
            <StatRow label="场均总进球" value={league.goalsPerGame.toFixed(2)} />
          </div>
          <div>
            <StatRow
              label="主场优势 (Elo)"
              value={signedNumber(analysis.homeAdvantageElo, 1)}
              hint="加给主队"
            />
            <StatRow
              label="主场优势 (Opta)"
              value={signedNumber(analysis.homeAdvantageOpta, 2)}
              hint="加给主队"
            />
            <StatRow label="大于 2.5 球" value={pct(league.over25Pct)} />
          </div>
        </div>

        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left text-xs tracking-wide text-slate-500 uppercase">
              <th className="py-2 pr-4 font-medium">赛季</th>
              <th className="py-2 pr-4 font-medium">场次</th>
              <th className="py-2 pr-4 font-medium">主胜</th>
              <th className="py-2 pr-4 font-medium">和局</th>
              <th className="py-2 font-medium">客胜</th>
            </tr>
          </thead>
          <tbody>
            {league.seasons.map((s) => (
              <tr key={s.season} className="border-b border-slate-800/60 last:border-b-0">
                <td className="py-2 pr-4 text-slate-200">{s.season}</td>
                <td className="py-2 pr-4 font-mono text-slate-400 tabular-nums">{s.matches}</td>
                <td className="py-2 pr-4 font-mono text-slate-300 tabular-nums">
                  {pct(s.homeWinPct, 1)}
                </td>
                <td className="py-2 pr-4 font-mono text-slate-300 tabular-nums">
                  {pct(s.drawPct, 1)}
                </td>
                <td className="py-2 font-mono text-slate-300 tabular-nums">
                  {pct(s.awayWinPct, 1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
