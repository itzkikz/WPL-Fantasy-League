const mongoose = require('mongoose');
(async () => {
    await mongoose.connect('mongodb+srv://wpl_user:d-36_HE9J_BF5TK@wpl.ab25zg4.mongodb.net/fantasy');
    const F = mongoose.model('Fixture', new mongoose.Schema({}, { strict: false }), 'fixtures');
    const T = mongoose.model('Team', new mongoose.Schema({}, { strict: false }), 'teams');
    const f = await F.findOne({ fixtureId: 14025065 }).lean();
    console.log('FIXTURE', JSON.stringify({ fixtureId: f.fixtureId, home: f.homeTeam, away: f.awayTeam, round: f.roundInfo }, null, 1));
    const t = await T.find({ id: { $in: [f.homeTeam.id, f.awayTeam.id] } }).lean();
    console.log('TEAMS', JSON.stringify(t.map(x => ({ id: x.id, name: x.name, nameCode: x.nameCode, shortName: x.shortName }))));
    await mongoose.disconnect();
})().catch(e => { console.error(e); process.exit(1); });