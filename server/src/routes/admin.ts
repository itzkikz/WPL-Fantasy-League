import express from 'express';
import { getFixtures, getGameweeks, createGameweek, updateGameweek, getSeasons, updateFixturesFromApi, getMatchDetails, undoAddToFantasy, getMatchIncidentsAndStats, getUsers, createFantasyTeam, getAdminPlayers, updateAdminPlayer, getAdminTeams, getFantasyTeams, getFantasyTeamById, updateFantasyTeam, completeGameweek, revertGameweek, togglePickTeam, getPickTeamStatus, getLeagues, fetchLeagueRounds, updateLeague, importFixturesFromJSON, getH2HLeague, upsertH2HLeague, deleteH2HLeague, createH2HFixture, bulkCreateH2HFixtures, deleteH2HFixture, getH2HLeagueFixtures, getAdminFacts, createAdminFact, updateAdminFact, deleteAdminFact, importIncidentsFromJSON, importLineupsFromJSON } from '../controllers/admin';
import { getTransfers, createTransfer, reverseTransfer } from '../controllers/transfers';
import { getSubstitutionHistory } from '../controllers/manager';
import { SheetController } from '../controllers/sheetController';

const router = express.Router();

router.get('/fixtures', getFixtures);
router.post('/fixtures/update', updateFixturesFromApi);
router.post('/fixtures/:id/details', getMatchDetails);
router.post('/fixtures/:id/incidents', importIncidentsFromJSON);
router.post('/fixtures/:id/lineups', importLineupsFromJSON);
router.delete('/fixtures/:id/fantasy', undoAddToFantasy);
router.get('/fixtures/:id/stats', getMatchIncidentsAndStats);
router.get('/gameweeks', getGameweeks);
router.post('/gameweeks', createGameweek);
router.put('/gameweeks/:id', updateGameweek);
router.post('/gameweeks/:id/complete', completeGameweek);
router.post('/gameweeks/:id/revert', revertGameweek);
router.get('/seasons', getSeasons);
router.get('/users', getUsers);
router.get('/teams', getAdminTeams);
router.get('/players', getAdminPlayers);
router.put('/players/:id', updateAdminPlayer);
router.post('/fantasy-teams', createFantasyTeam);
router.get('/fantasy-teams', getFantasyTeams);
router.get('/fantasy-teams/:id', getFantasyTeamById);
router.put('/fantasy-teams/:id', updateFantasyTeam);
router.get('/leagues', getLeagues);
router.post('/leagues/:id/fetch-rounds', fetchLeagueRounds);
router.post('/leagues/:id/import-fixtures', importFixturesFromJSON);
router.put('/leagues/:id', updateLeague);
router.get('/settings/pick-team', getPickTeamStatus);
router.post('/settings/pick-team', togglePickTeam);

router.get('/transfers', getTransfers);
router.post('/transfers', createTransfer);
router.delete('/transfers/:id', reverseTransfer);

router.get('/h2h-leagues', getH2HLeague);
router.post('/h2h-leagues', upsertH2HLeague);
router.delete('/h2h-leagues/:id', deleteH2HLeague);
router.post('/h2h-leagues/:id/fixtures', createH2HFixture);
router.post('/h2h-leagues/:id/fixtures/bulk', bulkCreateH2HFixtures);
router.delete('/h2h-leagues/:id/fixtures/:fixtureId', deleteH2HFixture);
router.get('/h2h-leagues/:id/fixtures', getH2HLeagueFixtures);

router.get('/substitutions', getSubstitutionHistory);

router.get('/facts', getAdminFacts);
router.post('/facts', createAdminFact);
router.put('/facts/:id', updateAdminFact);
router.delete('/facts/:id', deleteAdminFact);

router.get('/sheets/fantasy-teams-gamewise', SheetController.getFantasyTeamsGamewise);
router.post('/sheets/fantasy-teams-gamewise', SheetController.updateFantasyTeamsGamewise);
router.get('/sheets/player-stats', SheetController.getPlayerStatsStatus);
router.post('/sheets/player-stats', SheetController.updatePlayerStatsSheet);
router.get('/sheets/fixtures', SheetController.getCurrentFixturesStatus);
router.post('/sheets/fixtures', SheetController.updateCurrentFixturesSheet);

export default router;
