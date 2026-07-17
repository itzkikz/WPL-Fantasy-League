import { SofaScoreStats } from '../types/players';
import { ILineupEntry } from '../models/MatchDetails';

function countCards(entry: ILineupEntry, incidents: any[]): { yellow: number; red: number } {
    const pid = entry.playerId;
    let yellow = 0;
    let red = 0;

    for (const inc of incidents) {
        if (inc.incidentType !== 'card') continue;
        if (inc.player?.id !== pid) continue;

        if (inc.incidentClass === 'yellow' || inc.incidentClass === 'yellowRed') {
            yellow += 1;
        }
        if (inc.incidentClass === 'red') {
            red = 1;
        }
    }

    return { yellow, red };
}

function countGoalsConceded(entry: ILineupEntry, incidents: any[], subOn: number, subOff: number): number {
    const side = entry.side;

    return incidents.filter((inc) => {
        if (inc.incidentType !== 'goal') return false;

        const goalMinute = inc.time;
        if (goalMinute == null) return false;
        if (goalMinute < subOn || goalMinute > subOff) return false;

        if (inc.incidentClass === 'ownGoal') {
            if (side === 'home' && inc.isHome === true) return true;
            if (side === 'away' && inc.isHome === false) return true;
            return false;
        }

        if (side === 'home' && inc.isHome === false) return true;
        if (side === 'away' && inc.isHome === true) return true;

        return false;
    }).length;
}

export function mapSofascoreToPlayerMatchStat(
    entry: ILineupEntry,
    incidents: any[]
): SofaScoreStats {
    const s = entry.statistics || {};

    const pid = entry.playerId;
    let subOn = 0;
    let subOff = 90;

    const subOnEvent = incidents.find(
        (inc) => inc.incidentType === 'substitution' && inc.playerIn?.id === pid
    );
    if (subOnEvent) {
        subOn = subOnEvent.time;
    } else {
        const minutesPlayed = s.minutesPlayed || 0;
        if (minutesPlayed > 0 && minutesPlayed < 90) {
            subOn = 90 - minutesPlayed;
        }
    }

    const subOffEvent = incidents.find(
        (inc) => inc.incidentType === 'substitution' && inc.playerOut?.id === pid
    );
    if (subOffEvent) {
        subOff = subOffEvent.time;
    } else {
        const redCard = incidents.find(
            (inc) =>
                inc.incidentType === 'card' &&
                inc.incidentClass === 'red' &&
                inc.player?.id === pid
        );
        if (redCard) {
            subOff = redCard.time;
        }
    }

    const { yellow, red } = countCards(entry, incidents);
    const goalsConceded = countGoalsConceded(entry, incidents, subOn, subOff);
    const minutesPlayed = s.minutesPlayed || 0;
    const isSubstitute = subOn > 0;
    const played60 = minutesPlayed >= 60;
    const cleanSheet = played60 && goalsConceded === 0 ? 1 : 0;

    return {
        totalPass: s.totalPass ?? 0,
        accuratePass: s.accuratePass ?? 0,
        totalLongBalls: s.totalLongBalls ?? 0,
        accurateLongBalls: s.accurateLongBalls ?? 0,
        accurateOwnHalfPasses: s.accurateOwnHalfPasses ?? 0,
        totalOwnHalfPasses: s.totalOwnHalfPasses ?? 0,
        accurateOppositionHalfPasses: s.accurateOppositionHalfPasses ?? 0,
        totalOppositionHalfPasses: s.totalOppositionHalfPasses ?? 0,
        totalCross: s.totalCross ?? 0,
        aerialLost: s.aerialLost ?? 0,
        aerialWon: s.aerialWon ?? 0,
        duelLost: s.duelLost ?? 0,
        duelWon: s.duelWon ?? 0,
        challengeLost: s.challengeLost ?? 0,
        dispossessed: s.dispossessed ?? 0,
        totalContest: s.totalContest ?? 0,
        wonContest: s.wonContest ?? 0,
        unsuccessfulTouch: s.unsuccessfulTouch ?? 0,
        onTargetScoringAttempt: s.onTargetScoringAttempt ?? 0,
        totalShots: s.totalShots ?? 0,
        goals: s.goals ?? 0,
        goalAssist: s.goalAssist ?? 0,
        shotValueNormalized: s.shotValueNormalized ?? 0,
        totalClearance: s.totalClearance ?? 0,
        clearanceOffLine: s.clearanceOffLine ?? 0,
        outfielderBlock: s.outfielderBlock ?? 0,
        ballRecovery: s.ballRecovery ?? 0,
        totalTackle: s.totalTackle ?? 0,
        wonTackle: s.wonTackle ?? 0,
        wasFouled: s.wasFouled ?? 0,
        fouls: s.fouls ?? 0,
        minutesPlayed,
        touches: s.touches ?? 0,
        possessionLostCtrl: s.possessionLostCtrl ?? 0,
        rating: s.rating ?? 0,
        ratingVersions: s.ratingVersions ?? { original: 0, alternative: 0 },
        expectedGoals: s.expectedGoals ?? 0,
        expectedGoalsOnTarget: s.expectedGoalsOnTarget ?? 0,
        expectedAssists: s.expectedAssists ?? 0,
        topSpeed: s.topSpeed ?? 0,
        kilometersCovered: s.kilometersCovered ?? 0,
        numberOfSprints: s.numberOfSprints ?? 0,
        metersCoveredWalkingKm: s.metersCoveredWalkingKm ?? 0,
        metersCoveredJoggingKm: s.metersCoveredJoggingKm ?? 0,
        metersCoveredRunningKm: s.metersCoveredRunningKm ?? 0,
        metersCoveredHighSpeedRunningKm: s.metersCoveredHighSpeedRunningKm ?? 0,
        metersCoveredSprintingKm: s.metersCoveredSprintingKm ?? 0,
        goodHighClaim: s.goodHighClaim ?? 0,
        savedShotsFromInsideTheBox: s.savedShotsFromInsideTheBox ?? 0,
        saves: s.saves ?? 0,
        punches: s.punches ?? 0,
        keeperSaveValue: s.keeperSaveValue ?? 0,
        goalsPrevented: s.goalsPrevented ?? 0,
        goalkeeperValueNormalized: s.goalkeeperValueNormalized ?? 0,
        defensiveValueNormalized: s.defensiveValueNormalized ?? 0,
        passValueNormalized: s.passValueNormalized ?? 0,
        dribbleValueNormalized: s.dribbleValueNormalized ?? 0,
        ballCarriesCount: s.ballCarriesCount ?? 0,
        totalBallCarriesDistance: s.totalBallCarriesDistance ?? 0,
        totalProgression: s.totalProgression ?? 0,
        statisticsType: s.statisticsType ?? { sportSlug: 'football', statisticsType: 'player' },
        substitute: isSubstitute,
        yellowCards: yellow,
        redCards: red,
        goalsConceded,
        cleanSheet,
        penaltyWon: 0,
        penaltyCommitted: 0,
        penaltyScored: 0,
        penaltyMissed: 0,
        penaltySaved: 0,
        offsides: 0,
    };
}
