import { Request, Response } from 'express';
import { fetchFixturesByDate } from '../services/apiSports.service';
import { Fixture } from '../models/Fixture';
import dotenv from 'dotenv';

dotenv.config();

export const getFixtures = async (req: Request, res: Response) => {
  try {
    let targetDate = req.query.date as string;
    
    // If no date provided, take today's date in YYYY-MM-DD format
    if (!targetDate) {
      const today = new Date();
      targetDate = today.toISOString().split('T')[0];
    }

    if (!process.env.API_FOOTBALL_KEY) {
      return res.status(500).json({ success: false, error: 'API_FOOTBALL_KEY not set' });
    }

    console.log(`Fetching fixtures for date: ${targetDate}`);
    
    const data = await fetchFixturesByDate(targetDate);

    const fixtures = data.response;
    if (!fixtures || !Array.isArray(fixtures)) {
      return res.status(500).json({ success: false, error: 'Invalid response from API' });
    }

    // Filter for World Cup (league id 1)
    const worldCupFixtures = fixtures.filter((f: any) => f.league && f.league.id === 1);

    console.log(`Found ${worldCupFixtures.length} World Cup fixtures for ${targetDate}`);

    let savedCount = 0;
    for (const apiFixture of worldCupFixtures) {
      const existing = await Fixture.findOne({ 'fixture.id': apiFixture.fixture.id });
      if (existing) {
        Object.assign(existing, apiFixture);
        await existing.save();
      } else {
        await Fixture.create(apiFixture);
      }
      savedCount++;
    }

    res.json({
      success: true,
      message: `Saved ${savedCount} World Cup fixtures for date ${targetDate}`,
      data: worldCupFixtures
    });

  } catch (error: any) {
    console.error('Error fetching/saving fixtures:', error.message || error);
    res.status(500).json({ success: false, error: 'Failed to fetch and save fixtures' });
  }
};
