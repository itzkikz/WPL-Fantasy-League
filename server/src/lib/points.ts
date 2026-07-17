import { Player, SofaScoreStats } from '../types/players';
import { resolvePosition } from '../utils';

export function calculatePlayerPoints(player: Player, stats: SofaScoreStats): number {
    let points = 0;

    const position = resolvePosition(player.position || '');
    const minutesPlayed = stats.minutesPlayed || 0;
    const cleansheet = stats.cleanSheet === 1;

    if (minutesPlayed === 0) {
        return 0;
    }

    // 1. Appearance
    if (minutesPlayed >= 60) {
        points += 2;
    } else {
        points += 1;
    }

    // 2. Goal
    const goals = stats.goals || 0;
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
    const assists = stats.goalAssist || 0;
    if (assists > 0) {
        points += (assists * 3);
    }

    // 4. Cleansheet
    if (cleansheet) {
        if (position === 'GK') {
            points += 4;
        } else if (position === 'DEF') {
            points += 4;
        } else if (position === 'MID') {
            points += 1;
        }
    }

    // 5. Yellow Card
    const yellowCards = stats.yellowCards || 0;
    if (yellowCards > 0) {
        points += (yellowCards * -1);
    }

    // 6. Red Card
    const redCards = stats.redCards || 0;
    if (redCards > 0) {
        points += (redCards * -3);
    }

    // 7. Penalty Miss
    const penaltyMissed = stats.penaltyMissed || 0;
    if (penaltyMissed > 0) {
        points += (penaltyMissed * -2);
    }

    // 8. Penalty Save & 9. Every 3 Saves (Goalkeepers only)
    if (position === 'GK') {
        const penaltySaved = stats.penaltySaved || 0;
        if (penaltySaved > 0) {
            points += (penaltySaved * 5);
        }

        const saves = stats.saves || 0;
        if (saves >= 3) {
            points += Math.floor(saves / 3);
        }
    }

    // 10. Defensive Contributions
    const tackles = stats.totalTackle || 0;
    const clearances = stats.totalClearance || 0;
    const blocks = stats.outfielderBlock || 0;
    const ballRecovery = stats.ballRecovery || 0;

    const defensiveContributions = tackles + clearances + blocks + ballRecovery;

    if (position === 'DEF') {
        points += Math.floor(defensiveContributions / 10) * 2;
    } else {
        points += Math.floor(defensiveContributions / 12) * 2;
    }

    return points;
}
