import { describe, expect, test } from "bun:test";

import {
  ELO_SCALE,
  analyse,
  deviation,
  devigThreeWay,
  devigTwoWay,
  expectedValue,
  homeAdvantageOpta,
  homeWinProbFromElo,
  homeWinProbFromOpta,
  impliedProb,
  logistic10,
  marketHomeWinExclDraw,
} from "./ev";
import { LEAGUES, LEAGUE_ORDER } from "./leagues";

describe("implied probability and de-vig", () => {
  test("implied probability is the reciprocal of decimal odds", () => {
    expect(impliedProb(2)).toBe(0.5);
    expect(impliedProb(4)).toBe(0.25);
  });

  test("a fair three-way book has zero margin", () => {
    const m = devigThreeWay(3, 3, 3);
    expect(m.bookSum).toBeCloseTo(1, 12);
    expect(m.overround).toBeCloseTo(0, 12);
    expect(m.margin).toBeCloseTo(0, 12);
    expect(m.fairHome).toBeCloseTo(1 / 3, 12);
  });

  test("three-way margin is 1 - 1/bookSum", () => {
    const m = devigThreeWay(1.9, 3.5, 4);
    expect(m.bookSum).toBeCloseTo(1.0620300751, 9);
    expect(m.overround).toBeCloseTo(0.0620300751, 9);
    expect(m.margin).toBeCloseTo(0.0584071, 6);
    expect(m.fairHome + m.fairDraw + m.fairAway).toBeCloseTo(1, 12);
  });

  test("two-way de-vig normalises to 1", () => {
    const m = devigTwoWay(1.95, 1.9);
    expect(m.fairA + m.fairB).toBeCloseTo(1, 12);
    // The shorter price carries the higher fair probability.
    expect(m.fairB).toBeGreaterThan(m.fairA);
  });

  test("draw-excluded market probability ignores the draw price entirely", () => {
    expect(marketHomeWinExclDraw(2, 2)).toBeCloseTo(0.5, 12);
    // 1.50 vs 3.00 -> 0.6667 / (0.6667 + 0.3333)
    expect(marketHomeWinExclDraw(1.5, 3)).toBeCloseTo(2 / 3, 12);
  });
});

describe("rating models", () => {
  test("logistic10 is 0.5 at zero and symmetric", () => {
    expect(logistic10(0)).toBe(0.5);
    expect(logistic10(1) + logistic10(-1)).toBeCloseTo(1, 12);
  });

  test("Elo: one full scale of edge is 90.91%", () => {
    expect(homeWinProbFromElo(1800, 1800, 0)).toBeCloseTo(0.5, 12);
    expect(homeWinProbFromElo(1800 + ELO_SCALE, 1800, 0)).toBeCloseTo(10 / 11, 9);
  });

  test("Opta: 40 points of edge matches 400 Elo points", () => {
    expect(homeWinProbFromOpta(70, 70, 0)).toBeCloseTo(0.5, 12);
    expect(homeWinProbFromOpta(90, 50, 0)).toBeCloseTo(homeWinProbFromElo(2200, 1800, 0), 12);
  });

  test("home advantage converts between scales by a tenth", () => {
    expect(homeAdvantageOpta(50)).toBeCloseTo(5, 12);
    expect(homeAdvantageOpta(57.8)).toBeCloseTo(5.78, 12);
  });

  test("home advantage lifts the home side above a coin flip", () => {
    const league = LEAGUES.L1;
    const p = homeWinProbFromElo(1700, 1700, league.homeAdvantageElo);
    expect(p).toBeGreaterThan(0.5);
    expect(p).toBeCloseTo(league.homeWinPctExclDraw, 3);
  });
});

describe("league home-advantage calibration", () => {
  // Each stored Elo bonus must reproduce that league's real three-year
  // draw-excluded home win rate when both teams are equally rated.
  for (const id of LEAGUE_ORDER) {
    const league = LEAGUES[id];
    test(`${league.name} round-trips to its observed home win rate`, () => {
      const modelled = logistic10(league.homeAdvantageElo / ELO_SCALE);
      expect(modelled).toBeCloseTo(league.homeWinPctExclDraw, 3);
    });

    test(`${league.name} splits sum to 1`, () => {
      expect(league.homeWinPct + league.drawPct + league.awayWinPct).toBeCloseTo(1, 2);
      const seasonTotal = league.seasons.reduce((n, s) => n + s.matches, 0);
      expect(seasonTotal).toBe(league.matches);
    });
  }
});

describe("deviation", () => {
  test("model above market reads as underpriced", () => {
    const d = deviation(0.6, 0.55);
    expect(d.direction).toBe("model-higher");
    expect(d.diffPp).toBeCloseTo(5, 9);
    expect(d.diffRelPct).toBeCloseTo(9.0909, 3);
  });

  test("model below market reads as overpriced", () => {
    const d = deviation(0.5, 0.55);
    expect(d.direction).toBe("model-lower");
    expect(d.diffPp).toBeCloseTo(-5, 9);
    expect(d.diffRelPct).toBeCloseTo(-9.0909, 3);
  });

  test("a negligible gap is reported as level", () => {
    expect(deviation(0.5, 0.5).direction).toBe("level");
    expect(deviation(0.5, 0.500_01).direction).toBe("level");
  });
});

describe("expected value", () => {
  test("EV is p * odds - 1", () => {
    expect(expectedValue(0.5, 2.1)).toBeCloseTo(0.05, 12);
    expect(expectedValue(0.5, 2)).toBeCloseTo(0, 12);
    expect(expectedValue(0.4, 2)).toBeCloseTo(-0.2, 12);
  });
});

describe("analyse", () => {
  const input = {
    league: "L1" as const,
    homeOdds: 1.85,
    drawOdds: 3.6,
    awayOdds: 4.2,
    optaHome: 72.5,
    optaAway: 61.25,
    eloHome: 1780,
    eloAway: 1695,
    over25Odds: 1.95,
    under25Odds: 1.9,
  };

  test("market probabilities are internally consistent", () => {
    const a = analyse(input);
    expect(a.matchOdds.fairHome + a.matchOdds.fairDraw + a.matchOdds.fairAway).toBeCloseTo(1, 12);
    expect(a.marketHomeExclDraw + a.marketAwayExclDraw).toBeCloseTo(1, 12);
    expect(a.matchOdds.margin).toBeGreaterThan(0);
  });

  test("both models apply the league's home advantage", () => {
    const a = analyse(input);
    expect(a.homeAdvantageElo).toBe(LEAGUES.L1.homeAdvantageElo);
    expect(a.homeAdvantageOpta).toBeCloseTo(5.4, 12);
    expect(a.elo.homeRatingAdjusted).toBeCloseTo(1780 + 54, 12);
    expect(a.opta.homeRatingAdjusted).toBeCloseTo(72.5 + 5.4, 12);
    expect(a.elo.adjustedEdge).toBeCloseTo(1780 + 54 - 1695, 12);
  });

  test("home and away probabilities complement within each model", () => {
    const a = analyse(input);
    for (const report of [a.opta, a.elo]) {
      expect(report.homeWinExclDraw + report.awayWinExclDraw).toBeCloseTo(1, 12);
      // Scaled back to three-way, the pair plus the fair draw covers the book.
      expect(report.homeWinAbsolute + report.awayWinAbsolute + a.matchOdds.fairDraw).toBeCloseTo(
        1,
        12,
      );
    }
  });

  test("EV matches the absolute probability and the offered price", () => {
    const a = analyse(input);
    expect(a.opta.evHome).toBeCloseTo(a.opta.homeWinAbsolute * input.homeOdds - 1, 12);
    expect(a.elo.evAway).toBeCloseTo(a.elo.awayWinAbsolute * input.awayOdds - 1, 12);
  });

  test("fair odds invert the absolute probability and agree with the EV sign", () => {
    const a = analyse(input);
    for (const report of [a.opta, a.elo]) {
      expect(report.fairOddsHome).toBeCloseTo(1 / report.homeWinAbsolute, 9);
      expect(report.fairOddsAway).toBeCloseTo(1 / report.awayWinAbsolute, 9);
      // Positive EV exactly when the offered price beats the model's fair price.
      expect(report.evHome > 0).toBe(input.homeOdds > report.fairOddsHome);
      expect(report.evAway > 0).toBe(input.awayOdds > report.fairOddsAway);
    }
  });

  test("home and away deviations mirror each other in percentage points", () => {
    const a = analyse(input);
    expect(a.opta.homeDeviation.diffPp).toBeCloseTo(-a.opta.awayDeviation.diffPp, 9);
  });

  test("a stronger home side than the market implies flags the home lean", () => {
    const a = analyse({ ...input, eloHome: 2100 });
    expect(a.elo.homeDeviation.direction).toBe("model-higher");
    expect(a.elo.awayDeviation.direction).toBe("model-lower");
    expect(a.elo.evHome).toBeGreaterThan(0);
  });

  test("totals de-vig favours the shorter under price", () => {
    const a = analyse(input);
    expect(a.totals).toBeDefined();
    expect(a.totals!.fairUnder25 + a.totals!.fairOver25).toBeCloseTo(1, 12);
    expect(a.totals!.fairUnder25).toBeGreaterThan(a.totals!.fairOver25);
    expect(a.totals!.leagueOver25).toBe(LEAGUES.L1.over25Pct);
  });

  test("totals are skipped unless both prices are supplied", () => {
    expect(analyse({ ...input, under25Odds: undefined }).totals).toBeUndefined();
    expect(analyse({ ...input, over25Odds: undefined }).totals).toBeUndefined();
  });

  test("switching league changes only the home advantage", () => {
    const l1 = analyse(input);
    const l2 = analyse({ ...input, league: "L2" });
    expect(l2.homeAdvantageElo).toBeGreaterThan(l1.homeAdvantageElo);
    expect(l2.elo.homeWinExclDraw).toBeGreaterThan(l1.elo.homeWinExclDraw);
    expect(l2.marketHomeExclDraw).toBeCloseTo(l1.marketHomeExclDraw, 12);
  });
});
