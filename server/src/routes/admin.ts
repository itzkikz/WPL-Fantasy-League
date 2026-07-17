import express from 'express';
import { getFixtures, getGameweeks, createGameweek, updateGameweek, getSeasons, updateFixturesFromApi, getMatchDetails, getMatchIncidentsAndStats, getUsers, createFantasyTeam, getAdminPlayers, getFantasyTeams, getFantasyTeamById, updateFantasyTeam, completeGameweek, revertGameweek, togglePickTeam, getPickTeamStatus, getLeagues, fetchLeagueRounds, updateLeague, getH2HLeague, upsertH2HLeague, deleteH2HLeague, generateH2HFixtures, getH2HLeagueFixtures } from '../controllers/admin';

const router = express.Router();

router.get('/fixtures', getFixtures);
router.post('/fixtures/update', updateFixturesFromApi);
router.post('/fixtures/:id/details', getMatchDetails);
router.get('/fixtures/:id/stats', getMatchIncidentsAndStats);
router.get('/gameweeks', getGameweeks);
router.post('/gameweeks', createGameweek);
router.put('/gameweeks/:id', updateGameweek);
router.post('/gameweeks/:id/complete', completeGameweek);
router.post('/gameweeks/:id/revert', revertGameweek);
router.get('/seasons', getSeasons);
router.get('/users', getUsers);
router.get('/players', getAdminPlayers);
router.post('/fantasy-teams', createFantasyTeam);
router.get('/fantasy-teams', getFantasyTeams);
router.get('/fantasy-teams/:id', getFantasyTeamById);
router.put('/fantasy-teams/:id', updateFantasyTeam);
router.get('/leagues', getLeagues);
router.post('/leagues/:id/fetch-rounds', fetchLeagueRounds);
router.put('/leagues/:id', updateLeague);
router.get('/settings/pick-team', getPickTeamStatus);
router.post('/settings/pick-team', togglePickTeam);

router.get('/h2h-leagues', getH2HLeague);
router.post('/h2h-leagues', upsertH2HLeague);
router.delete('/h2h-leagues/:id', deleteH2HLeague);
router.post('/h2h-leagues/:id/generate-fixtures', generateH2HFixtures);
router.get('/h2h-leagues/:id/fixtures', getH2HLeagueFixtures);

export default router;
