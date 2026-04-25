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
                '--disable-blink-features=AutomationControlled',
                '--disable-dev-shm-usage', // fixes crashes + timeouts on Render/cloud
                '--disable-gpu'
            ]
        });
        const page = await browser.newPage();

        // Intercept and block heavy resources (images, css) to speed up load time drastically
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const rt = req.resourceType();
            if (rt === 'image' || rt === 'stylesheet' || rt === 'media' || rt === 'font') {
                req.abort();
            } else {
                req.continue();
            }
        });

        // 1. Visit main page but ONLY wait for domcontentloaded.
        // networkidle0 times out on sports sites because they keep WebSockets open for live scores!
        await page.goto('https://www.sofascore.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Wait 4 seconds for Cloudflare's invisible JS to solve
        await new Promise(resolve => setTimeout(resolve, 4000));

        // 2. Now navigate to the actual API endpoint
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

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
