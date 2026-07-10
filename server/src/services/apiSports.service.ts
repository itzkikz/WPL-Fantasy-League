import axios from 'axios';

const API_BASE_URL = 'https://v3.football.api-sports.io';

export const fetchFixturesByDate = async (date: string) => {
    if (!process.env.API_FOOTBALL_KEY) {
        throw new Error('API_FOOTBALL_KEY is not configured');
    }

    const response = await axios.get(`${API_BASE_URL}/fixtures`, {
        params: { date },
        headers: {
            'x-apisports-key': process.env.API_FOOTBALL_KEY
        }
    });

    if (response.data && response.data.errors && Object.keys(response.data.errors).length > 0) {
        throw new Error(`API-Sports Error: ${JSON.stringify(response.data.errors)}`);
    }

    return response.data;
};

export const fetchFixturePlayers = async (fixtureId: number | string) => {
    if (!process.env.API_FOOTBALL_KEY) {
        throw new Error('API_FOOTBALL_KEY is not configured');
    }

    const response = await axios.get(`${API_BASE_URL}/fixtures/players`, {
        params: { fixture: fixtureId },
        headers: {
            'x-apisports-key': process.env.API_FOOTBALL_KEY
        }
    });

    if (response.data && response.data.errors && Object.keys(response.data.errors).length > 0) {
        throw new Error(`API-Sports Error: ${JSON.stringify(response.data.errors)}`);
    }

    return response.data;
};

export const fetchFixtureEvents = async (fixtureId: number | string) => {
    if (!process.env.API_FOOTBALL_KEY) {
        throw new Error('API_FOOTBALL_KEY is not configured');
    }

    const response = await axios.get(`${API_BASE_URL}/fixtures/events`, {
        params: { fixture: fixtureId },
        headers: {
            'x-apisports-key': process.env.API_FOOTBALL_KEY
        }
    });

    if (response.data && response.data.errors && Object.keys(response.data.errors).length > 0) {
        throw new Error(`API-Sports Error: ${JSON.stringify(response.data.errors)}`);
    }

    return response.data;
};
