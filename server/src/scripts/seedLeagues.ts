import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db';
import { Season } from '../models/Season';
import { League } from '../models/League';

dotenv.config();

const seedLeagues = async () => {
  try {
    await connectDB();
    console.log('Connected to DB');

    // Drop orphan unique indexes that no longer match the current schema
    const leagueIndexes = await League.collection.indexes();
    for (const idx of leagueIndexes) {
      const key = idx.key || {};
      const fields = Object.keys(key);
      const onlyField = fields.length === 1 ? fields[0] : null;
      if (idx.unique && onlyField === 'code') {
        await League.collection.dropIndex(idx.name!);
        console.log(`Dropped orphan unique index ${idx.name}`);
      }
    }
    await League.syncIndexes();

    // Ensure season for 2026/27 exists
    let season = await Season.findOne({ name: '2026/27' });
    if (!season) {
      season = new Season({
        name: '2026/27',
        id: 2026, // using start year as ID; adjust if needed
        isCurrent: false,
        startDate: new Date('2026-08-01'),
        endDate: new Date('2027-05-31')
      });
      await season.save();
      console.log('Season created:', season);
    } else {
      console.log('Season already exists:', season);
    }

    const leagueData = [
      {
        name: 'Premier League',
        leagueId: 17,
        leagueSeasonId: 96668,
        leagueSeason: '26-27',
        seasonId: season._id
      },
      {
        name: 'LaLiga',
        leagueId: 8,
        leagueSeasonId: 97268,
        leagueSeason: '26-27',
        seasonId: season._id
      },
      {
        name: 'Bundesliga',
        leagueId: 35,
        leagueSeasonId: 97464,
        leagueSeason: '26-27',
        seasonId: season._id
      },
      {
        name: 'Serie A',
        leagueId: 23,
        leagueSeasonId: 95836,
        leagueSeason: '26-27',
        seasonId: season._id
      },
      {
        name: 'Ligue 1',
        leagueId: 34,
        leagueSeasonId: 96127,
        leagueSeason: '26-27',
        seasonId: season._id
      }
    ];

    for (const data of leagueData) {
      const result = await League.findOneAndUpdate(
        { leagueId: data.leagueId },
        { $set: data },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
          runValidators: true
        }
      );
      console.log(`League ${result.name} upserted`);
    }

    console.log('League seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding leagues:', error);
    process.exit(1);
  }
};

seedLeagues();