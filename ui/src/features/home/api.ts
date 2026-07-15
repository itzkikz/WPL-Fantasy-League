import { axiosInstance } from "../../api/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import { HomePageData } from "./types";

// TODO: Replace with actual API call when backend endpoint is ready
// export const homeApi = {
//   getHomePageData: async (): Promise<HomePageData> => {
//     const response = await axiosInstance.get('/home');
//     return response.data;
//   },
// };

// Temporary mock data for development
export const getMockHomeData = (): HomePageData => ({
  teamOverview: {
    teamName: "Foot lovers",
    gameweek: 12,
    gwPoints: 52,
    totalPoints: 1156,
    rank: 12450,
    transfers: 1,
    rankChange: -3,
  },
  gameweekProgress: {
    teamSelected: true,
    transfersMade: true,
    captainChosen: false,
    teamConfirmed: false,
    deadline: "Tomorrow, 8:30 PM",
  },
  upcomingMatch: {
    homeTeam: "Man City",
    homeTeamShort: "MCI",
    awayTeam: "Arsenal",
    awayTeamShort: "ARS",
    kickoffTime: "Tomorrow, 8:30 PM",
    gameweek: 12,
  },
  leagueStats: {
    totalPoints: 1156,
    overallRank: 12450,
    avgPointsPerGW: 48.2,
    highestGW: 72,
    teamValue: 101.5,
  },
  leagueStandings: [
    { rank: 1, team: "Foot lovers", gameweekPoints: 52, totalPoints: 1156, rankChange: 0 },
    { rank: 2, team: "Foot lovers 2", gameweekPoints: 47, totalPoints: 1141, rankChange: 0 },
    { rank: 3, team: "Goal Diggers", gameweekPoints: 39, totalPoints: 1128, rankChange: 0 },
    { rank: 4, team: "Game Changers", gameweekPoints: 36, totalPoints: 1098, rankChange: 0 },
    { rank: 5, team: "Pitch Invaders", gameweekPoints: 33, totalPoints: 1054, rankChange: 0 },
  ],
  recentGameweeks: [
    { gameweek: 8, points: 45 },
    { gameweek: 9, points: 62 },
    { gameweek: 10, points: 38 },
    { gameweek: 11, points: 41 },
    { gameweek: 12, points: 52 },
  ],
  topPlayers: [
    { rank: 1, name: "E. Haaland", team: "Man City", position: "FWD", points: 16, ownedBy: 68 },
    { rank: 2, name: "B. Saka", team: "Arsenal", position: "MID", points: 13, ownedBy: 54 },
    { rank: 3, name: "M. Salah", team: "Liverpool", position: "MID", points: 12, ownedBy: 72 },
    { rank: 4, name: "P. Foden", team: "Man City", position: "MID", points: 11, ownedBy: 45 },
    { rank: 5, name: "A. Isak", team: "Newcastle", position: "FWD", points: 10, ownedBy: 31 },
  ],
  playerSpotlight: {
    player: {
      id: 1,
      name: "Erling Haaland",
      team: "MCI",
      teamColor: "#6CABDD",
      point: 16,
      position: "FWD",
      isCaptain: false,
      isViceCaptain: false,
      isPowerPlayer: false,
      fullTeamName: "Man City",
      clean_sheet: 0,
      goal: 3,
      assist: 1,
      yellow_card: 0,
      red_card: 0,
      save: 0,
      penalty_save: 0,
      penalty_miss: 0,
      app: 1,
      gw: 12,
      photo: undefined,
    },
    gameweekPoints: 16,
    gameweekRank: 1,
    selectedBy: 68,
    price: 14.5,
    stats: {
      goals: 3,
      assists: 1,
      shots: 7,
    },
  },
  pointsBreakdown: {
    goals: 18,
    assists: 3,
    cleanSheet: 4,
    bonus: 3,
    minutesPlayed: 2,
    totalPoints: 52,
  },
  seasonStats: {
    avgPoints: 48.2,
    totalPoints: 1156,
    highestPoints: 72,
    totalRank: 12450,
  },
  bestPerformers: [
    { rank: 1, name: "Erling Haaland", team: "Man City", position: "FWD", points: 128 },
    { rank: 2, name: "B. Saka", team: "Arsenal", position: "MID", points: 115 },
    { rank: 3, name: "M. Salah", team: "Liverpool", position: "MID", points: 112 },
    { rank: 4, name: "P. Foden", team: "Man City", position: "MID", points: 98 },
    { rank: 5, name: "K. De Bruyne", team: "Man City", position: "MID", points: 94 },
  ],
  fixtureDifficulty: [
    { gameweek: 13, opponent: "CHE", home: true, difficulty: "Hard" },
    { gameweek: 14, opponent: "BRE", home: false, difficulty: "Medium" },
    { gameweek: 15, opponent: "LUT", home: true, difficulty: "Easy" },
    { gameweek: 16, opponent: "AVL", home: false, difficulty: "Medium" },
    { gameweek: 17, opponent: "WHU", home: true, difficulty: "Easy" },
  ],
  squadInfo: {
    teamValue: 101.5,
    inBank: 1.2,
    bank: 1.2,
  },
  squadComposition: {
    goalkeepers: 2,
    defenders: 5,
    midfielders: 5,
    forwards: 3,
    total: 15,
  },
  yourPlayers: {
    goalkeepers: [
      { name: "Ederson", team: "MCI", points: 74, price: 5.5 },
      { name: "A. Ramsdale", team: "ARS", points: 68, price: 4.5 },
    ],
    defenders: [
      { name: "R. Dias", team: "MCI", points: 92, price: 6.0 },
      { name: "T. Alexander-Arnold", team: "LIV", points: 85, price: 7.0 },
      { name: "G. Gabriel", team: "ARS", points: 78, price: 4.5 },
      { name: "M. Akanji", team: "MCI", points: 65, price: 4.5 },
      { name: "K. Trippier", team: "NEW", points: 60, price: 5.5 },
    ],
    midfielders: [
      { name: "M. Salah", team: "LIV", points: 112, price: 12.5 },
      { name: "B. Saka", team: "ARS", points: 115, price: 9.5 },
      { name: "P. Foden", team: "MCI", points: 98, price: 8.0 },
      { name: "K. De Bruyne", team: "MCI", points: 94, price: 10.0 },
      { name: "M. Odegaard", team: "ARS", points: 72, price: 7.0 },
    ],
    forwards: [
      { name: "E. Haaland", team: "MCI", points: 128, price: 14.5 },
      { name: "A. Isak", team: "NEW", points: 88, price: 8.5 },
      { name: "D. Nunez", team: "LIV", points: 60, price: 7.0 },
    ],
  },
  miniLeague: [
    { rank: 1, team: "Foot lovers", gameweekPoints: 52, totalPoints: 1156, rankChange: 0 },
    { rank: 2, team: "Foot lovers 2", gameweekPoints: 47, totalPoints: 1141, rankChange: 0 },
    { rank: 3, team: "Goal Diggers", gameweekPoints: 39, totalPoints: 1128, rankChange: 0 },
    { rank: 4, team: "Game Changers", gameweekPoints: 36, totalPoints: 1098, rankChange: 0 },
    { rank: 5, team: "Pitch Invaders", gameweekPoints: 33, totalPoints: 1054, rankChange: 0 },
  ],
});
