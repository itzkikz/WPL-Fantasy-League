export const EXCLUDED_KEYS = new Set([
    'changes', 'eventFilters', 'correctAiInsight', 'correctHalftimeAiInsight',
    'crowdsourcingDataDisplayEnabled', 'customId', 'detailId', 'feedLocked',
    'finalResultOnly', 'hasEventPlayerHeatMap', 'hasGlobalHighlights', 'hasXg'
]);

/**
 * Picks the fields we persist for a Sofascore fixture event, collapsing nested
 * team/tournament/season objects to just their ids and mapping `id` -> `fixtureId`.
 */
export const pickFields = (event: any): Record<string, any> => {
    const doc: Record<string, any> = {};

    for (const key of Object.keys(event)) {
        if (EXCLUDED_KEYS.has(key)) continue;

        if (key === 'tournament') {
            doc.tournament = { id: event.tournament?.id };
            doc.uniqueTournament = { id: event.tournament?.uniqueTournament?.id };
        } else if (key === 'season') {
            doc.season = { id: event.season?.id };
        } else if (key === 'homeTeam') {
            doc.homeTeam = { id: event.homeTeam?.id };
        } else if (key === 'awayTeam') {
            doc.awayTeam = { id: event.awayTeam?.id };
        } else if (key !== 'id') {
            doc[key] = event[key];
        }
    }

    return doc;
};

/**
 * Maps a Sofascore lineups payload ({ home: { players }, away: { players } })
 * to the MatchDetails.lineups format used for fantasy scoring.
 */
export const mapLineups = (data: any): { playerId: number; teamId: number; statistics: any; side: string; position: string }[] => {
    const lineups: { playerId: number; teamId: number; statistics: any; side: string; position: string }[] = [];
    if (!data) return lineups;

    for (const side of ['home', 'away'] as const) {
        for (const entry of (data[side]?.players ?? [])) {
            if (!entry.player?.id) continue;
            lineups.push({
                playerId: entry.player.id,
                teamId: entry.teamId,
                statistics: entry.statistics ?? {},
                side,
                position: entry.position || ''
            });
        }
    }

    return lineups;
};