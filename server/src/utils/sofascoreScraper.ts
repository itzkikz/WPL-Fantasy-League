import puppeteer from 'puppeteer';

/**
 * Fetches JSON payload from a URL using Puppeteer to bypass simple API bot blocks.
 */
export const fetchSofascoreJSON = async (url: string) => {
    let browser;
    try {
        // We launch a new headless instance for each request
        // Alternatively, you could maintain a single global browser instance to speed up requests
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // Set a realistic user agent
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36");

        // Go directly to the JSON endpoint
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Extract JSON from the page body
        const data = await page.evaluate(() => {
            try {
                return JSON.parse(document.body.innerText);
            } catch (err) {
                return null;
            }
        });

        await browser.close();
        return data;
    } catch (error) {
        if (browser) await browser.close();
        throw error;
    }
};
