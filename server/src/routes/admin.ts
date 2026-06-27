import express from 'express';
import { getFixtures, getGameweeks, createGameweek, updateGameweek, getSeasons, updateFixturesFromApi, getMatchDetails, getUsers, createFantasyTeam, getAdminPlayers, getFantasyTeams, getFantasyTeamById, updateFantasyTeam, completeGameweek, revertGameweek, togglePickTeam, getPickTeamStatus } from '../controllers/admin';

const router = express.Router();

router.get('/fixtures', getFixtures);
router.post('/fixtures/update', updateFixturesFromApi);
router.post('/fixtures/:id/details', getMatchDetails);
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
router.get('/settings/pick-team', getPickTeamStatus);
router.post('/settings/pick-team', togglePickTeam);

export default router;
