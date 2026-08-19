"use client";

import { useMemo, useState } from "react";

import { Card } from "@/components/Card";
import { DecimalField } from "@/components/DecimalField";
import { LeaguePicker } from "@/components/LeaguePicker";
import { Results } from "@/components/Results";
import { analyse } from "@/lib/ev";
import type { LeagueId } from "@/lib/leagues";

const EMPTY = {
  homeOdds: "",
  drawOdds: "",
  awayOdds: "",
  optaHome: "",
  optaAway: "",
  eloHome: "",
  eloAway: "",
  over25: "",
  under25: "",
};

const SAMPLE = {
  homeOdds: "1.85",
  drawOdds: "3.60",
  awayOdds: "4.20",
  optaHome: "72.5",
  optaAway: "61.25",
  eloHome: "1780",
  eloAway: "1695",
  over25: "1.95",
  under25: "1.90",
};

type Fields = typeof EMPTY;

function parse(raw: string): number | null {
  if (raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function oddsError(raw: string): string | null {
  const value = parse(raw);
  if (value === null) return null;
  if (value < 1.01) return "赔率需 ≥ 1.01";
  return null;
}

function optaError(raw: string): string | null {
  const value = parse(raw);
  if (value === null) return null;
  if (value <= 0 || value > 100) return "百分制，需在 0 – 100 之间";
  return null;
}

function eloError(raw: string): string | null {
  const value = parse(raw);
  if (value === null) return null;
  if (!Number.isInteger(value)) return "Elo 需为整数";
  if (value < 500 || value > 2500) return "Elo 通常在 500 – 2500 之间";
  return null;
}

export default function Home() {
  const [league, setLeague] = useState<LeagueId>("L1");
  const [fields, setFields] = useState<Fields>(EMPTY);

  const set = (key: keyof Fields) => (value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const errors = {
    homeOdds: oddsError(fields.homeOdds),
    drawOdds: oddsError(fields.drawOdds),
    awayOdds: oddsError(fields.awayOdds),
    optaHome: optaError(fields.optaHome),
    optaAway: optaError(fields.optaAway),
    eloHome: eloError(fields.eloHome),
    eloAway: eloError(fields.eloAway),
    over25: oddsError(fields.over25),
    under25: oddsError(fields.under25),
  };

  const analysis = useMemo(() => {
    const homeOdds = parse(fields.homeOdds);
    const drawOdds = parse(fields.drawOdds);
    const awayOdds = parse(fields.awayOdds);
    const optaHome = parse(fields.optaHome);
    const optaAway = parse(fields.optaAway);
    const eloHome = parse(fields.eloHome);
    const eloAway = parse(fields.eloAway);
    const over25 = parse(fields.over25);
    const under25 = parse(fields.under25);

    const core = [homeOdds, drawOdds, awayOdds, optaHome, optaAway, eloHome, eloAway];
    if (core.some((v) => v === null)) return null;
    if (Object.values(errors).some(Boolean)) return null;

    return analyse({
      league,
      homeOdds: homeOdds!,
      drawOdds: drawOdds!,
      awayOdds: awayOdds!,
      optaHome: optaHome!,
      optaAway: optaAway!,
      eloHome: eloHome!,
      eloAway: eloAway!,
      over25Odds: over25 ?? undefined,
      under25Odds: under25 ?? undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, league]);

  const totalsHalfFilled =
    (fields.over25.trim() === "") !== (fields.under25.trim() === "");

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">足球正 EV 寻找器</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          输入 1X2 赔率与两队的 Opta / Elo 评分，对比模型胜率与市场去抽水后的隐含概率，找出偏离。
          主场优势取自法甲、法乙、英超近三年（2023/24 – 2025/26）的真实赛果。
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[380px_1fr]">
        <div className="flex flex-col gap-4 lg:sticky lg:top-8">
          <Card
            title="比赛类型"
            right={
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFields(SAMPLE)}
                  className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
                >
                  示例
                </button>
                <button
                  type="button"
                  onClick={() => setFields(EMPTY)}
                  className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
                >
                  清空
                </button>
              </div>
            }
          >
            <LeaguePicker value={league} onChange={setLeague} />
          </Card>

          <Card title="1X2 赔率" subtitle="欧洲小数赔率，最多两位小数">
            <div className="flex flex-col gap-3">
              <DecimalField
                id="home-odds"
                label="主胜"
                sublabel="1"
                value={fields.homeOdds}
                onChange={set("homeOdds")}
                decimalScale={2}
                max={1000}
                placeholder="1.85"
                error={errors.homeOdds}
              />
              <DecimalField
                id="draw-odds"
                label="和局"
                sublabel="X"
                value={fields.drawOdds}
                onChange={set("drawOdds")}
                decimalScale={2}
                max={1000}
                placeholder="3.60"
                error={errors.drawOdds}
              />
              <DecimalField
                id="away-odds"
                label="客胜"
                sublabel="2"
                value={fields.awayOdds}
                onChange={set("awayOdds")}
                decimalScale={2}
                max={1000}
                placeholder="4.20"
                error={errors.awayOdds}
              />
            </div>
          </Card>

          <Card title="Opta 评分" subtitle="百分制，最多两位小数">
            <div className="grid grid-cols-2 gap-3">
              <DecimalField
                id="opta-home"
                label="主队"
                value={fields.optaHome}
                onChange={set("optaHome")}
                decimalScale={2}
                max={100}
                placeholder="72.5"
                error={errors.optaHome}
              />
              <DecimalField
                id="opta-away"
                label="客队"
                value={fields.optaAway}
                onChange={set("optaAway")}
                decimalScale={2}
                max={100}
                placeholder="61.25"
                error={errors.optaAway}
              />
            </div>
          </Card>

          <Card title="Elo 评分" subtitle="整数">
            <div className="grid grid-cols-2 gap-3">
              <DecimalField
                id="elo-home"
                label="主队"
                value={fields.eloHome}
                onChange={set("eloHome")}
                decimalScale={0}
                max={4000}
                placeholder="1780"
                error={errors.eloHome}
              />
              <DecimalField
                id="elo-away"
                label="客队"
                value={fields.eloAway}
                onChange={set("eloAway")}
                decimalScale={0}
                max={4000}
                placeholder="1695"
                error={errors.eloAway}
              />
            </div>
          </Card>

          <Card title="大小球 2.5 赔率" subtitle="可选，两个都填才会计算">
            <div className="grid grid-cols-2 gap-3">
              <DecimalField
                id="over-25"
                label="+2.5 球"
                sublabel="大球"
                value={fields.over25}
                onChange={set("over25")}
                decimalScale={2}
                max={1000}
                placeholder="1.95"
                error={errors.over25}
              />
              <DecimalField
                id="under-25"
                label="−2.5 球"
                sublabel="小球"
                value={fields.under25}
                onChange={set("under25")}
                decimalScale={2}
                max={1000}
                placeholder="1.90"
                error={errors.under25}
              />
            </div>
            {totalsHalfFilled ? (
              <p className="mt-2 text-xs text-amber-400">大小球需要两个赔率都填写才会计算。</p>
            ) : null}
          </Card>
        </div>

        <div>
          {analysis ? (
            <Results analysis={analysis} />
          ) : (
            <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/20 p-10 text-center">
              <p className="text-sm text-slate-400">
                填写 1X2 赔率、Opta 评分与 Elo 评分后，这里会显示偏离分析。
              </p>
              <p className="mt-2 text-xs text-slate-600">大小球赔率为可选项。</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
