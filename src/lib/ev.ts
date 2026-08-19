import { LEAGUES, type LeagueId } from "./leagues";

/**
 * Rating-difference scale for the draw-excluded logistic.
 *
 * Elo uses the conventional 400. Opta power rankings live on a 0-100 scale
 * whose effective spread is roughly a tenth of a club-Elo spread, so 40 keeps
 * a given rating gap worth about the same probability in both models — and it
 * means one league home-advantage figure (in Elo points) converts to Opta
 * points by a straight ratio.
 */
export const ELO_SCALE = 400;
export const OPTA_SCALE = 40;

/** 1 / (1 + 10^-x) — the Elo/Bradley-Terry logistic, base 10. */
export function logistic10(x: number): number {
  return 1 / (1 + Math.pow(10, -x));
}

/** Home advantage expressed in Opta points rather than Elo points. */
export function homeAdvantageOpta(homeAdvantageElo: number): number {
  return homeAdvantageElo * (OPTA_SCALE / ELO_SCALE);
}

export function impliedProb(decimalOdds: number): number {
  return 1 / decimalOdds;
}

export interface TwoWayMarket {
  /** Raw (vig-inclusive) implied probabilities. */
  rawA: number;
  rawB: number;
  /** rawA + rawB. Above 1 by the size of the book's edge. */
  bookSum: number;
  /** bookSum - 1. */
  overround: number;
  /**
   * 1 - 1/bookSum — the share of stake the book keeps. Only meaningful for a
   * genuine two-outcome market such as over/under. Feeding in a 1X2 home and
   * away price leaves the draw's probability mass unaccounted for, so bookSum
   * lands below 1 and this goes negative; ignore it in that case and read the
   * three-way margin instead.
   */
  margin: number;
  /** Vig removed proportionally; fairA + fairB === 1. */
  fairA: number;
  fairB: number;
}

/** Two-outcome de-vig (over/under, or win/win with the draw ignored). */
export function devigTwoWay(oddsA: number, oddsB: number): TwoWayMarket {
  const rawA = impliedProb(oddsA);
  const rawB = impliedProb(oddsB);
  const bookSum = rawA + rawB;
  return {
    rawA,
    rawB,
    bookSum,
    overround: bookSum - 1,
    margin: 1 - 1 / bookSum,
    fairA: rawA / bookSum,
    fairB: rawB / bookSum,
  };
}

export interface ThreeWayMarket {
  rawHome: number;
  rawDraw: number;
  rawAway: number;
  bookSum: number;
  overround: number;
  margin: number;
  fairHome: number;
  fairDraw: number;
  fairAway: number;
}

/** 1X2 de-vig, proportional (multiplicative) method. */
export function devigThreeWay(home: number, draw: number, away: number): ThreeWayMarket {
  const rawHome = impliedProb(home);
  const rawDraw = impliedProb(draw);
  const rawAway = impliedProb(away);
  const bookSum = rawHome + rawDraw + rawAway;
  return {
    rawHome,
    rawDraw,
    rawAway,
    bookSum,
    overround: bookSum - 1,
    margin: 1 - 1 / bookSum,
    fairHome: rawHome / bookSum,
    fairDraw: rawDraw / bookSum,
    fairAway: rawAway / bookSum,
  };
}

/**
 * Market's home win probability with the draw discarded entirely, i.e. the
 * two-way price on "who wins". Directly comparable to the model outputs.
 */
export function marketHomeWinExclDraw(homeOdds: number, awayOdds: number): number {
  return devigTwoWay(homeOdds, awayOdds).fairA;
}

/** P(home wins | not a draw) from Opta ratings, home advantage already applied. */
export function homeWinProbFromOpta(
  optaHome: number,
  optaAway: number,
  homeAdvOpta: number,
): number {
  return logistic10((optaHome + homeAdvOpta - optaAway) / OPTA_SCALE);
}

/** P(home wins | not a draw) from Elo ratings, home advantage already applied. */
export function homeWinProbFromElo(
  eloHome: number,
  eloAway: number,
  homeAdvElo: number,
): number {
  return logistic10((eloHome + homeAdvElo - eloAway) / ELO_SCALE);
}

export type DeviationDirection = "model-higher" | "model-lower" | "level";

export interface Deviation {
  model: number;
  market: number;
  /** Signed percentage-point gap: (model - market) * 100. */
  diffPp: number;
  /** Signed relative gap: (model / market - 1) * 100. */
  diffRelPct: number;
  direction: DeviationDirection;
}

const LEVEL_TOLERANCE = 1e-4;

export function deviation(model: number, market: number): Deviation {
  const diff = model - market;
  return {
    model,
    market,
    diffPp: diff * 100,
    diffRelPct: market === 0 ? Number.NaN : (model / market - 1) * 100,
    direction:
      Math.abs(diff) < LEVEL_TOLERANCE ? "level" : diff > 0 ? "model-higher" : "model-lower",
  };
}

/** Expected profit per 1 unit staked: p * odds - 1. */
export function expectedValue(prob: number, decimalOdds: number): number {
  return prob * decimalOdds - 1;
}

export interface ModelReport {
  label: string;
  /** Rating gap fed to the logistic, home advantage included. */
  adjustedEdge: number;
  homeRatingAdjusted: number;
  homeWinExclDraw: number;
  awayWinExclDraw: number;
  homeDeviation: Deviation;
  awayDeviation: Deviation;
  /** Draw-excluded probabilities scaled by (1 - fair draw), so they sum with it to 1. */
  homeWinAbsolute: number;
  awayWinAbsolute: number;
  /** Zero-vig price the model implies, 1 / absolute probability. Beat it to be +EV. */
  fairOddsHome: number;
  fairOddsAway: number;
  evHome: number;
  evAway: number;
}

export interface AnalysisInput {
  league: LeagueId;
  homeOdds: number;
  drawOdds: number;
  awayOdds: number;
  optaHome: number;
  optaAway: number;
  eloHome: number;
  eloAway: number;
  /** Optional — the over/under block is analysed only when both are present. */
  over25Odds?: number;
  under25Odds?: number;
}

export interface Analysis {
  league: (typeof LEAGUES)[LeagueId];
  homeAdvantageElo: number;
  homeAdvantageOpta: number;
  matchOdds: ThreeWayMarket;
  /** Draw-excluded market home win probability — the comparison baseline. */
  marketHomeExclDraw: number;
  marketAwayExclDraw: number;
  /** Vig on just the home/away pair, draw ignored. */
  winMarketTwoWay: TwoWayMarket;
  opta: ModelReport;
  elo: ModelReport;
  totals?: {
    market: TwoWayMarket;
    /** De-vigged probability of under 2.5 goals (the "-2.5" side). */
    fairUnder25: number;
    fairOver25: number;
    /** League's actual over-2.5 rate across the last three seasons. */
    leagueOver25: number;
  };
}

function buildModelReport(
  label: string,
  homeWinExclDraw: number,
  homeRatingAdjusted: number,
  adjustedEdge: number,
  marketHomeExclDraw: number,
  fairDraw: number,
  homeOdds: number,
  awayOdds: number,
): ModelReport {
  const awayWinExclDraw = 1 - homeWinExclDraw;
  const marketAwayExclDraw = 1 - marketHomeExclDraw;
  const homeWinAbsolute = homeWinExclDraw * (1 - fairDraw);
  const awayWinAbsolute = awayWinExclDraw * (1 - fairDraw);

  return {
    label,
    adjustedEdge,
    homeRatingAdjusted,
    homeWinExclDraw,
    awayWinExclDraw,
    homeDeviation: deviation(homeWinExclDraw, marketHomeExclDraw),
    awayDeviation: deviation(awayWinExclDraw, marketAwayExclDraw),
    homeWinAbsolute,
    awayWinAbsolute,
    fairOddsHome: 1 / homeWinAbsolute,
    fairOddsAway: 1 / awayWinAbsolute,
    evHome: expectedValue(homeWinAbsolute, homeOdds),
    evAway: expectedValue(awayWinAbsolute, awayOdds),
  };
}

export function analyse(input: AnalysisInput): Analysis {
  const league = LEAGUES[input.league];
  const haElo = league.homeAdvantageElo;
  const haOpta = homeAdvantageOpta(haElo);

  const matchOdds = devigThreeWay(input.homeOdds, input.drawOdds, input.awayOdds);
  const winMarketTwoWay = devigTwoWay(input.homeOdds, input.awayOdds);
  const marketHomeExclDraw = winMarketTwoWay.fairA;

  const optaProb = homeWinProbFromOpta(input.optaHome, input.optaAway, haOpta);
  const eloProb = homeWinProbFromElo(input.eloHome, input.eloAway, haElo);

  const analysis: Analysis = {
    league,
    homeAdvantageElo: haElo,
    homeAdvantageOpta: haOpta,
    matchOdds,
    marketHomeExclDraw,
    marketAwayExclDraw: winMarketTwoWay.fairB,
    winMarketTwoWay,
    opta: buildModelReport(
      "Opta",
      optaProb,
      input.optaHome + haOpta,
      input.optaHome + haOpta - input.optaAway,
      marketHomeExclDraw,
      matchOdds.fairDraw,
      input.homeOdds,
      input.awayOdds,
    ),
    elo: buildModelReport(
      "Elo",
      eloProb,
      input.eloHome + haElo,
      input.eloHome + haElo - input.eloAway,
      marketHomeExclDraw,
      matchOdds.fairDraw,
      input.homeOdds,
      input.awayOdds,
    ),
  };

  if (input.over25Odds && input.under25Odds) {
    const market = devigTwoWay(input.over25Odds, input.under25Odds);
    analysis.totals = {
      market,
      fairOver25: market.fairA,
      fairUnder25: market.fairB,
      leagueOver25: league.over25Pct,
    };
  }

  return analysis;
}
