import { Player, SofaScoreStats } from '../types/players';
import { resolvePosition } from '../utils';

export interface PointsBreakdownItem {
    label: string;
    value: string;
    points: number;
}

/**
 * Compute the points breakdown for a SINGLE match. All point rules are applied
 * to one match's stats only (appearance from that match's minutes, saves &
 * defensive actions floored within that match, etc.). This is the canonical
 * per-match breakdown; `calculatePlayerPoints` is simply the sum of these.
 */
export function getMatchPointsBreakdown(stats: SofaScoreStats, positionOr: string | undefined): PointsBreakdownItem[] {
    const position = resolvePosition(positionOr || '');
    const minutesPlayed = stats.minutesPlayed || 0;

    if (minutesPlayed === 0) {
        return [];
    }

    const items: PointsBreakdownItem[] = [];

    // 1. Appearance
    items.push({
        label: "Minutes Played",
        value: `${minutesPlayed} mins`,
        points: minutesPlayed >= 60 ? 2 : 1,
    });

    // 2. Goal
    const goals = stats.goals || 0;
    if (goals > 0) {
        let points = 0;
        if (position === 'GK') points = goals * 10;
        else if (position === 'DEF') points = goals * 6;
        else if (position === 'MID') points = goals * 5;
        else if (position === 'FWD') points = goals * 4;
        if (points > 0) {
            items.push({ label: `Goals (${goals})`, value: `${goals}`, points });
        }
    }

    // 3. Assist
    const assists = stats.goalAssist || 0;
    if (assists > 0) {
        items.push({ label: `Assists (${assists})`, value: `${assists}`, points: assists * 3 });
    }

    // 4. Cleansheet
    const cleansheet = stats.cleanSheet === 1;
    if (cleansheet) {
        if (position === 'GK' || position === 'DEF') {
            items.push({ label: "Clean Sheet", value: "Yes", points: 4 });
        } else if (position === 'MID') {
            items.push({ label: "Clean Sheet", value: "Yes", points: 1 });
        }
    }

    // 5. Yellow Card
    const yellowCards = stats.yellowCards || 0;
    if (yellowCards > 0) {
        items.push({ label: "Yellow Cards", value: `${yellowCards}`, points: yellowCards * -1 });
    }

    // 6. Red Card
    const redCards = stats.redCards || 0;
    if (redCards > 0) {
        items.push({ label: "Red Card", value: "Yes", points: -3 });
    }

    // 7. Penalty Miss
    const penaltyMissed = stats.penaltyMissed || 0;
    if (penaltyMissed > 0) {
        items.push({ label: "Penalty Missed", value: `${penaltyMissed}`, points: penaltyMissed * -2 });
    }

    // 8. Penalty Save & 9. Every 3 Saves (Goalkeepers only)
    if (position === 'GK') {
        const penaltySaved = stats.penaltySaved || 0;
        if (penaltySaved > 0) {
            items.push({ label: "Penalty Saved", value: `${penaltySaved}`, points: penaltySaved * 5 });
        }

        const saves = stats.saves || 0;
        if (saves >= 3) {
            items.push({ label: `Saves (${saves})`, value: `${saves}`, points: Math.floor(saves / 3) });
        }
    }

    // 10. Defensive Contributions
    const tackles = stats.totalTackle || 0;
    const clearances = stats.totalClearance || 0;
    const blocks = stats.outfielderBlock || 0;
    const ballRecovery = stats.ballRecovery || 0;

    const defensiveContributions = tackles + clearances + blocks + ballRecovery;
    if (defensiveContributions > 0) {
        const defPoints = position === 'DEF'
            ? Math.floor(defensiveContributions / 10) * 2
            : Math.floor(defensiveContributions / 12) * 2;
        if (defPoints > 0) {
            items.push({
                label: `Defensive Actions (${defensiveContributions})`,
                value: `${defensiveContributions}`,
                points: defPoints,
            });
        }
    }

    return items;
}

export function calculatePlayerPoints(player: Player, stats: SofaScoreStats): number {
    return getMatchPointsBreakdown(stats, player.position).reduce((points, item) => points + item.points, 0);
}
