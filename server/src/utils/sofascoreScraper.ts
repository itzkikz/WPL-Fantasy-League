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
            headless: true, // Use the new headless mode if 'true' causes issues, e.g headless: "new"
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Realistic viewport and user agent are handled largely by the stealth plugin, 
        // but we can enforce a standard one to be safe.
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36");

        // Wait until network is idle so Cloudflare's JS challenges have time to execute and resolve
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

        // Wait a brief moment just to ensure any fast JS redirects finish
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Extract JSON from the page body
        const data = await page.evaluate(() => {
            try {
                return JSON.parse(document.body.innerText);
            } catch (err) {
                // If it fails to parse, we might be stuck on a challenge page or got HTML back
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
