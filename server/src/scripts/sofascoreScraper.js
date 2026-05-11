const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

/**
 * Fetches JSON from a URL using Puppeteer Stealth
 * to bypass Cloudflare.
 *
 * Optionally accepts an existing browser page
 * to reuse sessions.
 */
const fetchSofascoreJSON = async (url, existingPage = null) => {

    // Reuse existing warm page
    if (existingPage) {

        await existingPage.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        const data = await existingPage.evaluate(() => {

            try {
                return JSON.parse(document.body.innerText);
            } catch {
                return {
                    _rawText: document.body.innerText
                };
            }
        });

        if (
            data &&
            data.error &&
            data.error.code === 403
        ) {
            throw new Error(
                `Cloudflare 403 Forbidden on URL: ${url}`
            );
        }

        return data;
    }

    // Otherwise launch fresh browser
    let browser;

    try {

        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();

        await page.setRequestInterception(true);

        page.on('request', (req) => {

            const rt = req.resourceType();

            if (
                rt === 'image' ||
                rt === 'stylesheet' ||
                rt === 'media' ||
                rt === 'font'
            ) {
                req.abort();
            } else {
                req.continue();
            }
        });

        // Warm session
        await page.goto(
            'https://www.sofascore.com/',
            {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            }
        );

        await new Promise(resolve =>
            setTimeout(resolve, 4000)
        );

        // Visit target URL
        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        const data = await page.evaluate(() => {

            try {
                return JSON.parse(document.body.innerText);
            } catch {
                return {
                    _rawText: document.body.innerText
                };
            }
        });

        if (
            data &&
            data.error &&
            data.error.code === 403
        ) {
            throw new Error(
                `Cloudflare 403 Forbidden on URL: ${url}`
            );
        }

        await browser.close();

        return data;

    } catch (error) {

        if (browser) {
            await browser.close();
        }

        throw error;
    }
};

/**
 * Launches a warm Puppeteer browser session
 * with Cloudflare clearance.
 */
const launchWarmSession = async () => {

    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    });

    const page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on('request', (req) => {

        const rt = req.resourceType();

        if (
            rt === 'image' ||
            rt === 'stylesheet' ||
            rt === 'media' ||
            rt === 'font'
        ) {
            req.abort();
        } else {
            req.continue();
        }
    });

    // Warm up session
    console.log('🌐 Warming up session on sofascore.com...');

    await page.goto(
        'https://www.sofascore.com/',
        {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        }
    );

    await new Promise(resolve =>
        setTimeout(resolve, 5000)
    );

    console.log('✅ Session warm, CF clearance obtained.');

    return {
        browser,
        page
    };
};

module.exports = {
    fetchSofascoreJSON,
    launchWarmSession
};