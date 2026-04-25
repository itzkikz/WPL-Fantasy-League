const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
    // Changes the cache location for Puppeteer so it resolves correctly on Render/Vercel
    cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
