export interface Pick {
    playerId: number;
    isCaptain: boolean;
    isViceCaptain: boolean;
    isStarting: boolean;
    subNumber: number;
}

export type PositionCategory = 'GK' | 'DEF' | 'MID' | 'FWD' | 'UNK';

export interface FormationRange {
    min: number;
    max: number;
}

// Starting-formation constraints. Applied to auto-subs AND to manual swaps
// (the swap validators carry their own copy for the manager flow).
export const AUTO_SUB_FORMATION_RULES: Record<'GK' | 'DEF' | 'MID' | 'FWD', FormationRange> = {
    GK: { min: 1, max: 1 },
    DEF: { min: 3, max: 5 },
    MID: { min: 3, max: 5 },
    FWD: { min: 1, max: 3 },
};

export const resolvePosition = (posStr: string): PositionCategory => {
    const p = (posStr || '').toUpperCase();
    if (p === 'GK' || p === 'GOALKEEPER' || p === 'G') return 'GK';
    if (p === 'DEF' || p === 'DEFENDER' || p === 'D') return 'DEF';
    if (p === 'MID' || p === 'MIDFIELDER' || p === 'M') return 'MID';
    if (p === 'FWD' || p === 'FORWARD' || p === 'ATTACKER' || p === 'A' || p === 'F') return 'FWD';
    return 'UNK';
};

export interface AutoSubInput {
    picks: Pick[];
    minutesMap: Map<number, number>;
    getPosition: (playerId: number) => PositionCategory;
    rules?: Record<'GK' | 'DEF' | 'MID' | 'FWD', FormationRange>;
}

export interface AutoSubOutput {
    picks: Pick[];
    applied: boolean;
}

// Replays FPL-style automatic substitutions for a single team's squad.
// Only toggles isStarting / subNumber; captain & vice-captain flags are kept
// on the players exactly as submitted (matching how gameweek completion works).
export const runAutoSubs = ({
    picks: inputPicks,
    minutesMap,
    getPosition,
    rules = AUTO_SUB_FORMATION_RULES,
}: AutoSubInput): AutoSubOutput => {
    const picks = JSON.parse(JSON.stringify(inputPicks)) as Pick[];
    let applied = false;

    const starters = picks.filter((p: any) => p.isStarting);
    const bench = picks
        .filter((p: any) => !p.isStarting)
        .sort((a: any, b: any) => (a.subNumber || 0) - (b.subNumber || 0));

    const getPos = (pick: any) => getPosition(pick.playerId);

    for (const starter of starters) {
        const starterMins = minutesMap.get(starter.playerId) || 0;
        if (starterMins === 0) {
            const starterPos = getPos(starter);

            if (starterPos === 'GK') {
                const benchGk = bench.find((b: any) => getPos(b) === 'GK');
                if (benchGk && (minutesMap.get(benchGk.playerId) || 0) > 0) {
                    starter.isStarting = false;
                    starter.subNumber = benchGk.subNumber;
                    benchGk.isStarting = true;
                    benchGk.subNumber = 0;
                    applied = true;
                }
            } else {
                for (const sub of bench) {
                    if (sub.isStarting || getPos(sub) === 'GK') continue;

                    if ((minutesMap.get(sub.playerId) || 0) > 0) {
                        const counts: Record<'GK' | 'DEF' | 'MID' | 'FWD', number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
                        for (const p of picks) {
                            if (p.isStarting && p.playerId !== starter.playerId) {
                                const cat = getPos(p);
                                if (cat !== 'UNK') counts[cat]++;
                            }
                        }
                        const subCat = getPos(sub);
                        if (subCat !== 'UNK') counts[subCat]++;

                        if (counts.DEF >= rules.DEF.min && counts.DEF <= rules.DEF.max &&
                            counts.MID >= rules.MID.min && counts.MID <= rules.MID.max &&
                            counts.FWD >= rules.FWD.min && counts.FWD <= rules.FWD.max
                        ) {
                            starter.isStarting = false;
                            starter.subNumber = sub.subNumber;
                            sub.isStarting = true;
                            sub.subNumber = 0;
                            applied = true;
                            break;
                        }
                    }
                }
            }
        }
    }

    // Clean up subNumber for starters (should be 0)
    picks.forEach((p: any) => {
        if (p.isStarting) p.subNumber = 0;
    });

    return { picks, applied };
};
