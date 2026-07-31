import { Request, Response } from 'express';
import { FantasyTeam } from '../models/FantasyTeam';
import { Player } from '../models/Player';
import { User } from '../models/User';
import { Gameweek } from '../models/Gameweek';
import { Transfer } from '../models/Transfer';

const POS_MAX: Record<string, number> = { GK: 2, DEF: 5, MID: 5, FWD: 3 };

function normalizePosition(pos?: string): string {
    const p = (pos || '').toUpperCase();
    if (p === 'GK' || p === 'GOALKEEPER' || p === 'G') return 'GK';
    if (p === 'DEF' || p === 'DEFENDER' || p === 'D') return 'DEF';
    if (p === 'MID' || p === 'MIDFIELDER' || p === 'M') return 'MID';
    if (p === 'FWD' || p === 'FORWARD' || p === 'ATTACKER' || p === 'A' || p === 'F') return 'FWD';
    return 'UNK';
}

function getPositionCounts(picks: any[], playersMap: Map<number, any>): Record<string, number> {
    const counts: Record<string, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0, UNK: 0 };
    for (const pick of picks) {
        const pos = normalizePosition(playersMap.get(pick.playerId)?.position);
        counts[pos]++;
    }
    return counts;
}

async function getTakenPlayerIds(excludeTeamId?: string): Promise<Set<number>> {
    const query: any = {};
    if (excludeTeamId) query._id = { $ne: excludeTeamId };
    const teams = await FantasyTeam.find(query).lean();
    const taken = new Set<number>();
    for (const t of teams) {
        for (const pick of t.currentSquad?.picks || []) {
            taken.add(pick.playerId);
        }
    }
    return taken;
}

function clonePicks(team: any): any[] {
    return JSON.parse(JSON.stringify(team.currentSquad?.picks || []));
}

function playerSnapshot(player: any, pick?: any) {
    return {
        playerId: player.id,
        name: player.name || player.webName || 'Unknown',
        position: player.position || '',
        tmPosition: player.tm_position || '',
        auctionPrice: player.auctionPrice ?? null,
        isCaptain: pick?.isCaptain || false,
        isViceCaptain: pick?.isViceCaptain || false,
        isStarting: pick?.isStarting || false,
        subNumber: pick?.subNumber || 0,
    };
}

function normalizeCaptaincy(picks: any[]) {
    const captains = picks.filter(p => p.isCaptain);
    if (captains.length > 1) {
        captains.forEach((c, i) => { if (i > 0) c.isCaptain = false; });
    }
    if (picks.filter(p => p.isCaptain).length === 0) {
        const vice = picks.find(p => p.isViceCaptain);
        if (vice) {
            vice.isCaptain = true;
            vice.isViceCaptain = false;
        } else if (picks.length > 0) {
            picks[0].isCaptain = true;
        }
    }
    const vcs = picks.filter(p => p.isViceCaptain);
    if (vcs.length > 1) {
        vcs.forEach((v, i) => { if (i > 0) v.isViceCaptain = false; });
    }
    if (picks.filter(p => p.isViceCaptain).length === 0) {
        const target = picks.find(p => p.isStarting && !p.isCaptain) || picks.find(p => !p.isCaptain);
        if (target) target.isViceCaptain = true;
    }
}

function healLineup(picks: any[], playersMap: Map<number, any>) {
    normalizeCaptaincy(picks);

    const starters = picks.filter(p => p.isStarting);
    if (starters.length >= 11) return;

    const bench = picks
        .filter(p => !p.isStarting)
        .sort((a, b) => (a.subNumber || 0) - (b.subNumber || 0));

    for (const b of bench) {
        if (starters.length >= 11) break;
        const pos = normalizePosition(playersMap.get(b.playerId)?.position);
        const hasStartingGK = starters.some(s => normalizePosition(playersMap.get(s.playerId)?.position) === 'GK');
        if (pos === 'GK' && hasStartingGK) continue;
        b.isStarting = true;
        b.subNumber = 0;
        starters.push(b);
    }
}

function validatePositionAfterChange(counts: Record<string, number>, addPos?: string, removePos?: string): string | null {
    const next = { ...counts };
    if (removePos) next[removePos] = Math.max(0, (next[removePos] || 0) - 1);
    if (addPos) next[addPos] = (next[addPos] || 0) + 1;
    for (const pos of Object.keys(POS_MAX)) {
        if (next[pos] > POS_MAX[pos]) {
            return `Position limit exceeded: max ${POS_MAX[pos]} ${pos} allowed`;
        }
    }
    return null;
}

export const getTransfers = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

        const { teamId, gameweek } = req.query;
        const query: any = {};
        if (teamId) query.fantasyTeam = teamId;
        if (gameweek) query.gameweek = Number(gameweek);

        const transfers = await Transfer.find(query)
            .sort({ date: -1, createdAt: -1 })
            .lean();

        res.json({ data: transfers });
    } catch (error: any) {
        console.error('Error fetching transfers:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createTransfer = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

        const { fantasyTeamId, type, playerOutId, playerInId, gameweek, date, note, playerInAuctionPrice, playerInTmPosition } = req.body;

        if (!fantasyTeamId) return res.status(400).json({ error: 'fantasyTeamId is required' });
        if (!['swap', 'release', 'sign'].includes(type)) return res.status(400).json({ error: 'Invalid transfer type' });

        const team = await FantasyTeam.findById(fantasyTeamId);
        if (!team) return res.status(404).json({ error: 'Fantasy team not found' });

        const playerIds = [...new Set([playerOutId, playerInId].filter((id: any) => id !== undefined && id !== null).map(Number))];
        const players = await Player.find({ id: { $in: playerIds } }).lean();
        const playersMap = new Map(players.map(p => [p.id, p]));

        const picks = clonePicks(team);
        const squadIds = picks.map(p => p.playerId);
        const squadPlayers = await Player.find({ id: { $in: squadIds } }).lean();
        const squadPlayersMap = new Map(squadPlayers.map(p => [p.id, p]));

        // --- Validation ---
        let outPick: any = null;
        if (playerOutId !== undefined && playerOutId !== null) {
            outPick = picks.find(p => p.playerId === Number(playerOutId));
            if (!outPick) return res.status(400).json({ error: 'Outgoing player is not in this squad' });
        }

        if (playerInId !== undefined && playerInId !== null) {
            const inId = Number(playerInId);
            if (!playersMap.has(inId)) return res.status(400).json({ error: 'Incoming player not found' });
            if (picks.some(p => p.playerId === inId)) return res.status(400).json({ error: 'Player is already in this squad' });
            const taken = await getTakenPlayerIds(team._id.toString());
            if (taken.has(inId)) return res.status(400).json({ error: 'Incoming player is already in another team' });
        }

        const counts = getPositionCounts(picks, squadPlayersMap);

        if (type === 'swap') {
            if (playerOutId === undefined || playerInId === undefined) {
                return res.status(400).json({ error: 'Swap requires both an outgoing and incoming player' });
            }
            if (Number(playerOutId) === Number(playerInId)) {
                return res.status(400).json({ error: 'Players must be different' });
            }
            const outPos = normalizePosition(squadPlayersMap.get(Number(playerOutId))?.position);
            const inPos = normalizePosition(playersMap.get(Number(playerInId))?.position);
            const err = validatePositionAfterChange(counts, inPos, outPos);
            if (err) return res.status(400).json({ error: err });
        } else if (type === 'sign') {
            if (playerInId === undefined || playerInId === null) {
                return res.status(400).json({ error: 'Sign requires an incoming player' });
            }
            if (picks.length >= 15) return res.status(400).json({ error: 'Squad is already full (15 players)' });
            const inPos = normalizePosition(playersMap.get(Number(playerInId))?.position);
            const err = validatePositionAfterChange(counts, inPos);
            if (err) return res.status(400).json({ error: err });
        } else if (type === 'release') {
            if (playerOutId === undefined || playerOutId === null) {
                return res.status(400).json({ error: 'Release requires an outgoing player' });
            }
        }

        // --- Apply ---
        const outWasCaptain = !!outPick?.isCaptain;
        const outWasVice = !!outPick?.isViceCaptain;

        if (playerOutId !== undefined && playerOutId !== null) {
            const idx = picks.findIndex(p => p.playerId === Number(playerOutId));
            if (idx !== -1) picks.splice(idx, 1);
        }
        if (playerInId !== undefined && playerInId !== null) {
            const maxSub = picks.reduce((m, p) => Math.max(m, p.subNumber || 0), 0);
            picks.push({
                playerId: Number(playerInId),
                isCaptain: false,
                isViceCaptain: false,
                isStarting: false,
                subNumber: maxSub + 1,
            });
        }

        // Captaincy healing for the swap/sign case
        if (playerInId !== undefined && playerInId !== null) {
            const newPick = picks[picks.length - 1];
            if (outWasCaptain) {
                const vice = picks.find(p => p.isViceCaptain && p !== newPick);
                if (vice) {
                    vice.isCaptain = true;
                    vice.isViceCaptain = false;
                }
                newPick.isViceCaptain = true;
            } else if (outWasVice) {
                if (!picks.some(p => p.isViceCaptain && p !== newPick)) {
                    newPick.isViceCaptain = true;
                }
            }
        }

        healLineup(picks, squadPlayersMap);

        const gwDoc = await Gameweek.findOne({ isCurrent: true }).lean();
        const gw = Number(gameweek) || gwDoc?.number || 1;
        const adminUser = await User.findOne({ username: req.user.userId });

        // Sign-side pricing: admin provides tm_position + auction price for the incoming player.
        const inAuctionPrice =
            playerInAuctionPrice !== undefined && playerInAuctionPrice !== null && playerInAuctionPrice !== ''
                ? Number(playerInAuctionPrice)
                : null;

        const inSnapshot = playerInId !== undefined && playerInId !== null
            ? playerSnapshot(playersMap.get(Number(playerInId)))
            : null;
        if (inSnapshot && type === 'sign') {
            if (playerInTmPosition !== undefined && playerInTmPosition !== '') inSnapshot.tmPosition = playerInTmPosition;
            if (inAuctionPrice !== null) inSnapshot.auctionPrice = inAuctionPrice;
        }

        // Create the record first for auditability, then apply squad change.
        const transfer = await Transfer.create({
            fantasyTeam: team._id,
            teamName: team.name,
            type,
            playerOut: playerOutId !== undefined && playerOutId !== null ? playerSnapshot(playersMap.get(Number(playerOutId)), outPick) : null,
            playerIn: inSnapshot,
            gameweek: gw,
            date: date ? new Date(date) : new Date(),
            note: note || '',
            createdBy: adminUser?._id,
        });

        try {
            team.currentSquad.picks = picks;
            await team.save();

            // Keep player records in sync with free-agency / signing pricing.
            if (type === 'release') {
                await Player.updateOne({ id: Number(playerOutId) }, { $set: { auctionPrice: null } });
            }
            if (type === 'sign') {
                const setFields: any = { auctionPrice: inAuctionPrice };
                if (playerInTmPosition !== undefined && playerInTmPosition !== '') setFields.tm_position = playerInTmPosition;
                await Player.updateOne({ id: Number(playerInId) }, { $set: setFields });
            }
        } catch (err) {
            // Compensation: keep records consistent with actual squad state
            await Transfer.findByIdAndDelete(transfer._id);
            throw err;
        }

        res.status(201).json({ data: transfer });
    } catch (error: any) {
        console.error('Error creating transfer:', error);
        res.status(500).json({ error: error.message });
    }
};

export const reverseTransfer = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

        const { id } = req.params;
        const transfer = await Transfer.findById(id);
        if (!transfer) return res.status(404).json({ error: 'Transfer record not found' });

        const team = await FantasyTeam.findById(transfer.fantasyTeam);
        if (!team) return res.status(404).json({ error: 'Fantasy team not found' });

        const picks = clonePicks(team);
        const squadIds = picks.map(p => p.playerId);
        const squadPlayers = await Player.find({ id: { $in: squadIds } }).lean();
        const squadPlayersMap = new Map(squadPlayers.map(p => [p.id, p]));
        const counts = getPositionCounts(picks, squadPlayersMap);

        // Validate reversal is still possible
        if (transfer.type === 'swap' || transfer.type === 'sign') {
            if (!transfer.playerIn) return res.status(400).json({ error: 'Invalid transfer record' });
            const inIdx = picks.findIndex(p => p.playerId === transfer.playerIn!.playerId);
            if (inIdx === -1) {
                return res.status(400).json({ error: 'Cannot reverse: incoming player is no longer in this squad' });
            }
        }
        if (transfer.type === 'swap' || transfer.type === 'release') {
            if (!transfer.playerOut) return res.status(400).json({ error: 'Invalid transfer record' });
            if (picks.some(p => p.playerId === transfer.playerOut!.playerId)) {
                return res.status(400).json({ error: 'Cannot reverse: player is already back in this squad' });
            }
            const taken = await getTakenPlayerIds(team._id.toString());
            if (taken.has(transfer.playerOut.playerId)) {
                return res.status(400).json({ error: 'Cannot reverse: released player has been signed by another team' });
            }
            const outPos = normalizePosition(transfer.playerOut.position);
            const err = validatePositionAfterChange(counts, outPos);
            if (err) return res.status(400).json({ error: err });
        }

        // Apply reversal
        if (transfer.type === 'swap' || transfer.type === 'sign') {
            const inIdx = picks.findIndex(p => p.playerId === transfer.playerIn!.playerId);
            if (inIdx !== -1) picks.splice(inIdx, 1);
        }
        if (transfer.type === 'swap' || transfer.type === 'release') {
            const out = transfer.playerOut!;
            picks.push({
                playerId: out.playerId,
                isCaptain: out.isCaptain || false,
                isViceCaptain: out.isViceCaptain || false,
                isStarting: out.isStarting || false,
                subNumber: out.subNumber || picks.length,
            });
        }

        healLineup(picks, squadPlayersMap);

        try {
            team.currentSquad.picks = picks;
            await team.save();

            // Player pricing side-effects for reversal:
            // - Incoming player (swap/sign) leaves the squad -> free agent, no auction price.
            // - Outgoing player (swap/release) returns -> restore their recorded price/position.
            if (transfer.type === 'swap' || transfer.type === 'sign') {
                await Player.updateOne({ id: transfer.playerIn!.playerId }, { $set: { auctionPrice: null } });
            }
            if (transfer.type === 'swap' || transfer.type === 'release') {
                const out = transfer.playerOut!;
                const setFields: any = {};
                if (out.auctionPrice !== undefined && out.auctionPrice !== null) setFields.auctionPrice = out.auctionPrice;
                if (out.tmPosition) setFields.tm_position = out.tmPosition;
                if (Object.keys(setFields).length > 0) {
                    await Player.updateOne({ id: out.playerId }, { $set: setFields });
                }
            }
        } catch (err) {
            throw err;
        }

        await Transfer.findByIdAndDelete(transfer._id);

        res.json({ message: 'Transfer reversed and record removed' });
    } catch (error: any) {
        console.error('Error reversing transfer:', error);
        res.status(500).json({ error: error.message });
    }
};
