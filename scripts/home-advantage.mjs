/**
 * Regenerates the home-advantage figures in src/lib/leagues.ts.
 *
 * Downloads every result from the last three completed seasons of the Premier
 * League (E0), Ligue 1 (F1) and Ligue 2 (F2) from football-data.co.uk, counts
 * the home/draw/away splits, and solves for the Elo home-advantage bonus that
 * reproduces the observed draw-excluded home win rate.
 *
 *   bun run home-advantage
 */

const ELO_SCALE = 400;

const LEAGUES = [
  { code: "E0", name: "Premier League" },
  { code: "F1", name: "Ligue 1" },
  { code: "F2", name: "Ligue 2" },
];

// football-data.co.uk season slugs, oldest first.
const SEASONS = ["2324", "2425", "2526"];

const SEASON_LABEL = { 2324: "2023/24", 2425: "2024/25", 2526: "2025/26" };

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(",");
  const iResult = header.indexOf("FTR");
  const iHomeGoals = header.indexOf("FTHG");
  const iAwayGoals = header.indexOf("FTAG");

  const tally = { matches: 0, home: 0, draw: 0, away: 0, goals: 0, over25: 0 };
  for (const line of lines.slice(1)) {
    const cells = line.split(",");
    const result = cells[iResult];
    if (!result) continue; // trailing blank rows / unplayed fixtures

    tally.matches += 1;
    if (result === "H") tally.home += 1;
    else if (result === "D") tally.draw += 1;
    else tally.away += 1;

    const goals = Number(cells[iHomeGoals]) + Number(cells[iAwayGoals]);
    tally.goals += goals;
    if (goals > 2.5) tally.over25 += 1;
  }
  return tally;
}

const round = (value, digits) => Number(value.toFixed(digits));

for (const league of LEAGUES) {
  const total = { matches: 0, home: 0, draw: 0, away: 0, goals: 0, over25: 0 };
  const seasons = [];

  for (const season of SEASONS) {
    const url = `https://www.football-data.co.uk/mmz4281/${season}/${league.code}.csv`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url} -> HTTP ${response.status}`);

    const tally = parseCsv(await response.text());
    seasons.push({ season: SEASON_LABEL[season], ...tally });
    for (const key of Object.keys(total)) total[key] += tally[key];
  }

  // Over a full season every club plays an equal number of home and away
  // games, so the average rating gap is zero and the entire excess of the
  // home win rate over 50% is home advantage.
  const homeWinExclDraw = total.home / (total.home + total.away);
  const homeAdvantageElo = -ELO_SCALE * Math.log10(1 / homeWinExclDraw - 1);

  console.log(`\n=== ${league.name} (${league.code}) — ${total.matches} matches ===`);
  for (const s of seasons) {
    console.log(
      `  ${s.season}  n=${s.matches}  H=${round((s.home / s.matches) * 100, 2)}%` +
        `  D=${round((s.draw / s.matches) * 100, 2)}%` +
        `  A=${round((s.away / s.matches) * 100, 2)}%`,
    );
  }
  console.log(
    JSON.stringify(
      {
        matches: total.matches,
        homeWinPct: round(total.home / total.matches, 4),
        drawPct: round(total.draw / total.matches, 4),
        awayWinPct: round(total.away / total.matches, 4),
        homeWinPctExclDraw: round(homeWinExclDraw, 4),
        homeAdvantageElo: round(homeAdvantageElo, 1),
        over25Pct: round(total.over25 / total.matches, 4),
        goalsPerGame: round(total.goals / total.matches, 3),
      },
      null,
      2,
    ),
  );
}
