/**
 * Home-advantage reference data.
 *
 * Source: every completed league match from the last three seasons
 * (2023/24, 2024/25, 2025/26), results feed from football-data.co.uk
 * (files E0 / F1 / F2). Counted locally — see `scripts/home-advantage.mjs`,
 * which regenerates every number in this file.
 *
 * Ligue 2 played 380 matches in 2023/24 (20 clubs) and 306 from 2024/25
 * onwards, after the division was cut to 18 clubs.
 */

export type LeagueId = "EPL" | "L1" | "L2";

export interface SeasonSplit {
  season: string;
  matches: number;
  homeWinPct: number;
  drawPct: number;
  awayWinPct: number;
}

export interface League {
  id: LeagueId;
  name: string;
  localName: string;
  /** football-data.co.uk division code the sample came from. */
  code: string;
  matches: number;
  homeWinPct: number;
  drawPct: number;
  awayWinPct: number;
  /** Home win share once draws are removed: H / (H + A). */
  homeWinPctExclDraw: number;
  /**
   * Elo points to add to the home side. Solved from the three-year
   * draw-excluded home win rate so it is consistent with the
   * draw-excluded logistic used in `homeWinProbFromElo`:
   *   HA = -ELO_SCALE * log10(1 / p - 1)
   */
  homeAdvantageElo: number;
  /** Share of matches going over 2.5 goals — a sanity baseline for the O/U read. */
  over25Pct: number;
  goalsPerGame: number;
  seasons: SeasonSplit[];
}

export const LEAGUES: Record<LeagueId, League> = {
  EPL: {
    id: "EPL",
    name: "Premier League",
    localName: "英超",
    code: "E0",
    matches: 1140,
    homeWinPct: 0.4316,
    drawPct: 0.2447,
    awayWinPct: 0.3237,
    homeWinPctExclDraw: 0.5714,
    homeAdvantageElo: 50.0,
    over25Pct: 0.5877,
    goalsPerGame: 2.988,
    seasons: [
      { season: "2023/24", matches: 380, homeWinPct: 0.4605, drawPct: 0.2158, awayWinPct: 0.3237 },
      { season: "2024/25", matches: 380, homeWinPct: 0.4079, drawPct: 0.2447, awayWinPct: 0.3474 },
      { season: "2025/26", matches: 380, homeWinPct: 0.4263, drawPct: 0.2737, awayWinPct: 0.3 },
    ],
  },
  L1: {
    id: "L1",
    name: "Ligue 1",
    localName: "法甲",
    code: "F1",
    matches: 918,
    homeWinPct: 0.4401,
    drawPct: 0.2375,
    awayWinPct: 0.3224,
    homeWinPctExclDraw: 0.5771,
    homeAdvantageElo: 54.0,
    over25Pct: 0.537,
    goalsPerGame: 2.832,
    seasons: [
      { season: "2023/24", matches: 306, homeWinPct: 0.3922, drawPct: 0.2647, awayWinPct: 0.3431 },
      { season: "2024/25", matches: 306, homeWinPct: 0.4673, drawPct: 0.2026, awayWinPct: 0.3301 },
      { season: "2025/26", matches: 306, homeWinPct: 0.4608, drawPct: 0.2451, awayWinPct: 0.2941 },
    ],
  },
  L2: {
    id: "L2",
    name: "Ligue 2",
    localName: "法乙",
    code: "F2",
    matches: 990,
    homeWinPct: 0.4212,
    drawPct: 0.2768,
    awayWinPct: 0.302,
    homeWinPctExclDraw: 0.5824,
    homeAdvantageElo: 57.8,
    over25Pct: 0.4747,
    goalsPerGame: 2.521,
    seasons: [
      { season: "2023/24", matches: 379, homeWinPct: 0.4037, drawPct: 0.2876, awayWinPct: 0.3087 },
      { season: "2024/25", matches: 306, homeWinPct: 0.4869, drawPct: 0.2353, awayWinPct: 0.2778 },
      { season: "2025/26", matches: 305, homeWinPct: 0.377, drawPct: 0.3049, awayWinPct: 0.318 },
    ],
  },
};

export const LEAGUE_ORDER: LeagueId[] = ["L1", "L2", "EPL"];
