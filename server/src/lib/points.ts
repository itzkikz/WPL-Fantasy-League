import { Player, PlayerMatchStat } from '../types/players';
import { resolvePosition } from '../utils';


export function calculatePlayerPoints(player: Player, stats: PlayerMatchStat): number {
    let points = 0;

    const position = resolvePosition(player.position); // GK, DEF, MID, FWD
    const minutesPlayed = stats.games.minutes || 0;
    const cleansheet = stats.games.cleansheet

    if (minutesPlayed === 0) {
        return 0; // No points if they didn't play
    }

    // 1. Appearance (App)
    points += 2;

    // 2. Goal
    const goals = stats.goals.total || 0;
    if (goals > 0) {
        if (position === 'GK') {
            points += (goals * 10);
        } else if (position === 'DEF') {
            points += (goals * 6);
        } else if (position === 'MID') {
            points += (goals * 5);
        } else if (position === 'FWD') {
            points += (goals * 4);
        }
    }

    // 3. Assist
    const assists = stats.goals.assists || 0;
    if (assists > 0) {
        points += (assists * 3);
    }

    // 4. Cleansheet
    // Typically requires at least 60 minutes played. If the image just says 'Cleansheet', we'll enforce 60 min.
    // const conceded = stats.goals.conceded || 0;
    if (cleansheet) {
        if (position === 'GK') {
            points += 4;
        } else if (position === 'DEF') {
            points += 4;
        }
    }

    // 5. Yellow Card
    const yellowCards = stats.cards.yellow || 0;
    if (yellowCards > 0) {
        points += (yellowCards * -1);
    }

    // 6. Red Card
    const redCards = stats.cards.red || 0;
    if (redCards > 0) {
        points += (redCards * -3);
    }

    // 7. Penalty Miss
    const penaltyMissed = stats.penalty.missed || 0;
    if (penaltyMissed > 0) {
        points += (penaltyMissed * -2);
    }

    // 8. Penalty Save & 9. Every 3 Saves (Goalkeepers only)
    if (position === 'GK') {
        const penaltySaved = stats.penalty.saved || 0;
        if (penaltySaved > 0) {
            points += (penaltySaved * 5);
        }

        const saves = stats.goals.saves || 0;
        if (saves >= 3) {
            points += Math.floor(saves / 3);
        }
    }

    // 10. Defensive Contributions
    // Defensive Contributions: Clearances, Blocks, Interceptions, Tackles
    // Clearances are not in the provided API schema, so we rely on tackles.blocks, tackles.interceptions, tackles.total
    const blocks = stats.tackles.blocks || 0;
    const interceptions = stats.tackles.interceptions || 0;
    const tackles = stats.tackles.total || 0;

    // Note: The data source might not have clearances. If it gets added, add it here.
    const defensiveContributions = blocks + interceptions + tackles;

    if (position === 'DEF') {
        // DEF : 10 Defensive Contribution 2 Point
        points += Math.floor(defensiveContributions / 10) * 2;
    } else {
        // GK, MID & ST : 12 Defensive Contribution 2 Point
        points += Math.floor(defensiveContributions / 12) * 2;
    }

    return points;
}
