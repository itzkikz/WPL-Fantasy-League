import express from 'express';
import puppeteer from 'puppeteer-extra';
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

/**
 * Fetches JSON payload from a URL using Puppeteer Stealth to bypass Cloudflare API bot blocks.
 */
export const fetchSofascoreJSON = async (url: string) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled'
            ]
        });
        const page = await browser.newPage();

        // 1. First go to the main page to get Cloudflare clearance cookies.
        // Cloudflare challenges often fail if you request an API/JSON endpoint directly 
        // from a datacenter IP because it injects HTML into a JSON parser.
        await page.goto('https://www.sofascore.com/', { waitUntil: 'networkidle2', timeout: 30000 });

        // Wait an extra moment to ensure the clearance cookie (cf_clearance) is saved
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 2. Now navigate to the actual API endpoint
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

        // Extract JSON from the page body
        const data = await page.evaluate(() => {
            try {
                return JSON.parse(document.body.innerText);
            } catch (err) {
                return { _rawText: document.body.innerText };
            }
        });

        await browser.close();
        return data;
    } catch (error) {
        if (browser) await browser.close();
        throw error;
    }
};
