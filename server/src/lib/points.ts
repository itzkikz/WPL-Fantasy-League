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

/**
 * Season-wide points breakdown. Every point rule is applied per match (saves &
 * defensive actions floored within each match, appearance from that match's
 * minutes, etc.) and then summed across all gameweek entries. The total of the
 * returned items is the player's canonical season points and matches
 * `calculatePlayerPoints` summed per match.
 */
export function getSeasonPointsBreakdown(gameweeks: any[], positionOr: string | undefined): PointsBreakdownItem[] {
    const position = resolvePosition(positionOr || '');

    let apps = 0;
    let apps60 = 0;
    let mins = 0;
    let goals = 0;
    let assists = 0;
    let cs = 0;
    let yellows = 0;
    let reds = 0;
    let penMiss = 0;
    let penSave = 0;
    let saves = 0;
    let defCont = 0;

    let appearancePts = 0;
    let goalsPts = 0;
    let assistsPts = 0;
    let csPts = 0;
    let yellowsPts = 0;
    let redsPts = 0;
    let penMissPts = 0;
    let penSavePts = 0;
    let savesPts = 0;
    let defPts = 0;

    gameweeks.forEach((gw) => {
        const s = gw.stats;
        if (!s) return;
        const minutes = s.minutesPlayed || 0;
        if (minutes === 0) return;

        mins += minutes;
        apps += 1;
        if (minutes >= 60) apps60 += 1;
        appearancePts += minutes >= 60 ? 2 : 1;

        const g = s.goals || 0;
        goals += g;
        if (g > 0) {
            goalsPts += g * (position === 'GK' ? 10 : position === 'DEF' ? 6 : position === 'MID' ? 5 : 4);
        }

        const a = s.goalAssist || 0;
        assists += a;
        assistsPts += a * 3;

        if (s.cleanSheet === 1) {
            cs += 1;
            if (position === 'GK' || position === 'DEF') csPts += 4;
            else if (position === 'MID') csPts += 1;
        }

        const y = s.yellowCards || 0;
        yellows += y;
        yellowsPts += y * -1;

        const r = s.redCards || 0;
        reds += r;
        redsPts += r * -3;

        const pm = s.penaltyMissed || 0;
        penMiss += pm;
        penMissPts += pm * -2;

        if (position === 'GK') {
            const ps = s.penaltySaved || 0;
            penSave += ps;
            penSavePts += ps * 5;

            const sv = s.saves || 0;
            saves += sv;
            if (sv >= 3) savesPts += Math.floor(sv / 3);
        }

        const dc = (s.totalTackle || 0) + (s.totalClearance || 0) + (s.outfielderBlock || 0) + (s.ballRecovery || 0);
        if (dc > 0) {
            defCont += dc;
            defPts += (position === 'DEF' ? Math.floor(dc / 10) : Math.floor(dc / 12)) * 2;
        }
    });

    if (apps === 0) return [];

    const items: PointsBreakdownItem[] = [];
    items.push({
        label: `Appearance (${apps} apps, ${apps60} × 60min+)`,
        value: `${mins} mins`,
        points: appearancePts,
    });
    if (goals > 0) items.push({ label: `Goals (${goals})`, value: `${goals}`, points: goalsPts });
    if (assists > 0) items.push({ label: `Assists (${assists})`, value: `${assists}`, points: assistsPts });
    if (cs > 0) items.push({ label: `Clean Sheets (${cs})`, value: `${cs}`, points: csPts });
    if (yellows > 0) items.push({ label: `Yellow Cards (${yellows})`, value: `${yellows}`, points: yellowsPts });
    if (reds > 0) items.push({ label: `Red Cards (${reds})`, value: `${reds}`, points: redsPts });
    if (penMiss > 0) items.push({ label: `Penalty Missed (${penMiss})`, value: `${penMiss}`, points: penMissPts });
    if (position === 'GK' && penSave > 0) items.push({ label: `Penalty Saved (${penSave})`, value: `${penSave}`, points: penSavePts });
    if (position === 'GK' && savesPts > 0) items.push({ label: `Saves (${saves})`, value: `${saves}`, points: savesPts });
    if (defPts > 0) items.push({ label: `Defensive Bonus (÷${position === 'DEF' ? 10 : 12})`, value: `${defCont}`, points: defPts });

    return items;
}
