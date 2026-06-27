import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db';
import { Fixture } from './models/Fixture';

dotenv.config();

const data = [
  {
    fixture: {
      id: 1208021,
      referee: "R. Jones",
      timezone: "UTC",
      date: "2024-08-16T19:00:00+00:00",
      timestamp: 1723834800,
      periods: { first: 1723834800, second: 1723838400 },
      venue: { id: 556, name: "Old Trafford", city: "Manchester" },
      status: { long: "Match Finished", short: "FT", elapsed: 90, extra: null }
    },
    league: {
      id: 39,
      name: "Premier League",
      country: "England",
      logo: "https://media.api-sports.io/football/leagues/39.png",
      flag: "https://media.api-sports.io/flags/gb-eng.svg",
      season: 2024,
      round: "Regular Season - 1",
      standings: true
    },
    teams: {
      home: { id: 33, name: "Manchester United", logo: "https://media.api-sports.io/football/teams/33.png", winner: true },
      away: { id: 36, name: "Fulham", logo: "https://media.api-sports.io/football/teams/36.png", winner: false }
    },
    goals: { home: 1, away: 0 },
    score: {
      halftime: { home: 0, away: 0 },
      fulltime: { home: 1, away: 0 },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null }
    }
  },
  {
    fixture: {
      id: 1208022,
      referee: "T. Robinson",
      timezone: "UTC",
      date: "2024-08-17T11:30:00+00:00",
      timestamp: 1723894200,
      periods: { first: 1723894200, second: 1723897800 },
      venue: { id: 545, name: "Portman Road", city: "Ipswich, Suffolk" },
      status: { long: "Match Finished", short: "FT", elapsed: 90, extra: null }
    },
    league: {
      id: 39,
      name: "Premier League",
      country: "England",
      logo: "https://media.api-sports.io/football/leagues/39.png",
      flag: "https://media.api-sports.io/flags/gb-eng.svg",
      season: 2024,
      round: "Regular Season - 1",
      standings: true
    },
    teams: {
      home: { id: 57, name: "Ipswich", logo: "https://media.api-sports.io/football/teams/57.png", winner: false },
      away: { id: 40, name: "Liverpool", logo: "https://media.api-sports.io/football/teams/40.png", winner: true }
    },
    goals: { home: 0, away: 2 },
    score: {
      halftime: { home: 0, away: 0 },
      fulltime: { home: 0, away: 2 },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null }
    }
  },
  {
    fixture: {
      id: 1208025,
      referee: "C. Pawson",
      timezone: "UTC",
      date: "2024-08-17T14:00:00+00:00",
      timestamp: 1723903200,
      periods: { first: 1723903200, second: 1723906800 },
      venue: { id: 562, name: "St. James' Park", city: "Newcastle upon Tyne" },
      status: { long: "Match Finished", short: "FT", elapsed: 90, extra: null }
    },
    league: {
      id: 39,
      name: "Premier League",
      country: "England",
      logo: "https://media.api-sports.io/football/leagues/39.png",
      flag: "https://media.api-sports.io/flags/gb-eng.svg",
      season: 2024,
      round: "Regular Season - 1",
      standings: true
    },
    teams: {
      home: { id: 34, name: "Newcastle", logo: "https://media.api-sports.io/football/teams/34.png", winner: true },
      away: { id: 41, name: "Southampton", logo: "https://media.api-sports.io/football/teams/41.png", winner: false }
    },
    goals: { home: 1, away: 0 },
    score: {
      halftime: { home: 1, away: 0 },
      fulltime: { home: 1, away: 0 },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null }
    }
  },
  {
    fixture: {
      id: 1208023,
      referee: "J. Gillett",
      timezone: "UTC",
      date: "2024-08-17T14:00:00+00:00",
      timestamp: 1723903200,
      periods: { first: 1723903200, second: 1723906800 },
      venue: { id: 494, name: "Emirates Stadium", city: "London" },
      status: { long: "Match Finished", short: "FT", elapsed: 90, extra: null }
    },
    league: {
      id: 39,
      name: "Premier League",
      country: "England",
      logo: "https://media.api-sports.io/football/leagues/39.png",
      flag: "https://media.api-sports.io/flags/gb-eng.svg",
      season: 2024,
      round: "Regular Season - 1",
      standings: true
    },
    teams: {
      home: { id: 42, name: "Arsenal", logo: "https://media.api-sports.io/football/teams/42.png", winner: true },
      away: { id: 39, name: "Wolves", logo: "https://media.api-sports.io/football/teams/39.png", winner: false }
    },
    goals: { home: 2, away: 0 },
    score: {
      halftime: { home: 1, away: 0 },
      fulltime: { home: 2, away: 0 },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null }
    }
  },
  {
    fixture: {
      id: 1208024,
      referee: "S. Hooper",
      timezone: "UTC",
      date: "2024-08-17T14:00:00+00:00",
      timestamp: 1723903200,
      periods: { first: 1723903200, second: 1723906800 },
      venue: { id: 8560, name: "Goodison Park", city: "Liverpool" },
      status: { long: "Match Finished", short: "FT", elapsed: 90, extra: null }
    },
    league: {
      id: 39,
      name: "Premier League",
      country: "England",
      logo: "https://media.api-sports.io/football/leagues/39.png",
      flag: "https://media.api-sports.io/flags/gb-eng.svg",
      season: 2024,
      round: "Regular Season - 1",
      standings: true
    },
    teams: {
      home: { id: 45, name: "Everton", logo: "https://media.api-sports.io/football/teams/45.png", winner: false },
      away: { id: 51, name: "Brighton", logo: "https://media.api-sports.io/football/teams/51.png", winner: true }
    },
    goals: { home: 0, away: 3 },
    score: {
      halftime: { home: 0, away: 1 },
      fulltime: { home: 0, away: 3 },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null }
    }
  },
  {
    fixture: {
      id: 1208026,
      referee: "M. Oliver",
      timezone: "UTC",
      date: "2024-08-17T14:00:00+00:00",
      timestamp: 1723903200,
      periods: { first: 1723903200, second: 1723906800 },
      venue: { id: 566, name: "The City Ground", city: "Nottingham, Nottinghamshire" },
      status: { long: "Match Finished", short: "FT", elapsed: 90, extra: null }
    },
    league: {
      id: 39,
      name: "Premier League",
      country: "England",
      logo: "https://media.api-sports.io/football/leagues/39.png",
      flag: "https://media.api-sports.io/flags/gb-eng.svg",
      season: 2024,
      round: "Regular Season - 1",
      standings: true
    },
    teams: {
      home: { id: 65, name: "Nottingham Forest", logo: "https://media.api-sports.io/football/teams/65.png", winner: null },
      away: { id: 35, name: "Bournemouth", logo: "https://media.api-sports.io/football/teams/35.png", winner: null }
    },
    goals: { home: 1, away: 1 },
    score: {
      halftime: { home: 1, away: 0 },
      fulltime: { home: 1, away: 1 },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null }
    }
  },
  {
    fixture: {
      id: 1208027,
      referee: "T. Harrington",
      timezone: "UTC",
      date: "2024-08-17T16:30:00+00:00",
      timestamp: 1723912200,
      periods: { first: 1723912200, second: 1723915800 },
      venue: { id: 598, name: "London Stadium", city: "London" },
      status: { long: "Match Finished", short: "FT", elapsed: 90, extra: null }
    },
    league: {
      id: 39,
      name: "Premier League",
      country: "England",
      logo: "https://media.api-sports.io/football/leagues/39.png",
      flag: "https://media.api-sports.io/flags/gb-eng.svg",
      season: 2024,
      round: "Regular Season - 1",
      standings: true
    },
    teams: {
      home: { id: 48, name: "West Ham", logo: "https://media.api-sports.io/football/teams/48.png", winner: false },
      away: { id: 66, name: "Aston Villa", logo: "https://media.api-sports.io/football/teams/66.png", winner: true }
    },
    goals: { home: 1, away: 2 },
    score: {
      halftime: { home: 1, away: 1 },
      fulltime: { home: 1, away: 2 },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null }
    }
  },
  {
    fixture: {
      id: 1208028,
      referee: "S. Barrott",
      timezone: "UTC",
      date: "2024-08-18T13:00:00+00:00",
      timestamp: 1723986000,
      periods: { first: 1723986000, second: 1723989600 },
      venue: { id: 10503, name: "Gtech Community Stadium", city: "Brentford, Middlesex" },
      status: { long: "Match Finished", short: "FT", elapsed: 90, extra: null }
    },
    league: {
      id: 39,
      name: "Premier League",
      country: "England",
      logo: "https://media.api-sports.io/football/leagues/39.png",
      flag: "https://media.api-sports.io/flags/gb-eng.svg",
      season: 2024,
      round: "Regular Season - 1",
      standings: true
    },
    teams: {
      home: { id: 55, name: "Brentford", logo: "https://media.api-sports.io/football/teams/55.png", winner: true },
      away: { id: 52, name: "Crystal Palace", logo: "https://media.api-sports.io/football/teams/52.png", winner: false }
    },
    goals: { home: 2, away: 1 },
    score: {
      halftime: { home: 1, away: 0 },
      fulltime: { home: 2, away: 1 },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null }
    }
  },
  {
    fixture: {
      id: 1208029,
      referee: "A. Taylor",
      timezone: "UTC",
      date: "2024-08-18T15:30:00+00:00",
      timestamp: 1723995000,
      periods: { first: 1723995000, second: 1723998600 },
      venue: { id: 519, name: "Stamford Bridge", city: "London" },
      status: { long: "Match Finished", short: "FT", elapsed: 90, extra: null }
    },
    league: {
      id: 39,
      name: "Premier League",
      country: "England",
      logo: "https://media.api-sports.io/football/leagues/39.png",
      flag: "https://media.api-sports.io/flags/gb-eng.svg",
      season: 2024,
      round: "Regular Season - 1",
      standings: true
    },
    teams: {
      home: { id: 49, name: "Chelsea", logo: "https://media.api-sports.io/football/teams/49.png", winner: false },
      away: { id: 50, name: "Manchester City", logo: "https://media.api-sports.io/football/teams/50.png", winner: true }
    },
    goals: { home: 0, away: 2 },
    score: {
      halftime: { home: 0, away: 1 },
      fulltime: { home: 0, away: 2 },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null }
    }
  },
  {
    fixture: {
      id: 1208030,
      referee: "C. Kavanagh",
      timezone: "UTC",
      date: "2024-08-19T19:00:00+00:00",
      timestamp: 1724094000,
      periods: { first: 1724094000, second: 1724097600 },
      venue: { id: 547, name: "King Power Stadium", city: "Leicester, Leicestershire" },
      status: { long: "Match Finished", short: "FT", elapsed: 90, extra: null }
    },
    league: {
      id: 39,
      name: "Premier League",
      country: "England",
      logo: "https://media.api-sports.io/football/leagues/39.png",
      flag: "https://media.api-sports.io/flags/gb-eng.svg",
      season: 2024,
      round: "Regular Season - 1",
      standings: true
    },
    teams: {
      home: { id: 46, name: "Leicester", logo: "https://media.api-sports.io/football/teams/46.png", winner: null },
      away: { id: 47, name: "Tottenham", logo: "https://media.api-sports.io/football/teams/47.png", winner: null }
    },
    goals: { home: 1, away: 1 },
    score: {
      halftime: { home: 0, away: 1 },
      fulltime: { home: 1, away: 1 },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null }
    }
  }
];

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to DB');

    // Remove existing if needed (optional, keeping it clean):
    // await Fixture.deleteMany({});
    
    // Insert new data
    // Use upsert to avoid duplicate errors if script is run multiple times
    for (const item of data) {
      await Fixture.findOneAndUpdate(
        { 'fixture.id': item.fixture.id },
        item,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    
    console.log('Fixtures inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error inserting fixtures:', error);
    process.exit(1);
  }
};

seedData();
