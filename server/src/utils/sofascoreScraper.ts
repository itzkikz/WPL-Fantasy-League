import { addExtra } from 'puppeteer-extra';
import rebrowserPuppeteer from 'rebrowser-puppeteer-core';
import { executablePath } from 'puppeteer';

// rebrowser-puppeteer-core is a drop-in puppeteer fork patched to remove the
// CDP signals (Runtime.Enable leak, pptr sourceURL, utility-world name) that
// Sofascore's HUMAN/Panorama challenge uses to fingerprint headless browsers.
// The patched browser is what allows the warm-session XHR to pass the
// {"error":{"code":403,"reason":"challenge"}} check.
const puppeteer = addExtra(rebrowserPuppeteer as any);

const LAUNCH_ARGS = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-blink-features=AutomationControlled',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--lang=en-US'
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const launchBrowser = () => puppeteer.launch({
    // Keep the binary from the regular `puppeteer` package (no second download)
    executablePath: executablePath(),
    headless: true,
    args: LAUNCH_ARGS
});

/**
 * Fetches JSON from a Sofascore API URL from inside a warm page.
 *
 * Uses an in-page XHR carrying `X-Requested-With: XMLHttpRequest` and retries
 * transient 403/429/503/5xx responses with exponential backoff. A 404 returns
 * null (endpoint has no data); any other failure throws with a readable message.
 */
export const fetchViaPage = async (page: any, url: string, retries = 4) => {
    let delay = 2000;
    for (let attempt = 0; attempt <= retries; attempt++) {
        const result = await page.evaluate(async (fetchUrl: string) => {
            const res = await fetch(fetchUrl, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            const text = await res.text();
            let parsed: any = null;
            try { parsed = JSON.parse(text); } catch { /* non-JSON body */ }
            return { status: res.status, body: parsed, raw: text };
        }, url);

        if (result.status === 404) return null;
        if (result.status >= 200 && result.status < 300) return result.body;

        const reason = result.body?.error?.reason ?? '';
        // "Forbidden" means the IP is flagged (IP-level block) — retrying the same
        // session is pointless; only "challenge" (fingerprint) and transient
        // rate/5xx errors are worth retrying in-session.
        const retryable = result.status === 429 || result.status === 503 || result.status >= 500
            || (result.status === 403 && reason !== 'Forbidden');
        if (retryable && attempt < retries) {
            await sleep(delay);
            delay *= 2;
            continue;
        }
        throw new Error(`HTTP ${result.status}${reason ? ` (${reason})` : ''} for ${url.split('/').pop()}`);
    }
    throw new Error(`HTTP fetch failed for ${url}`);
};

/**
 * Fetches JSON from a Sofascore API URL.
 *
 * If a warm page is provided it is reused (session cookies preserved); otherwise
 * a fresh browser is launched, warmed on the homepage, fetched and closed.
 */
export const fetchSofascoreJSON = async (url: string, existingPage?: any) => {
    if (existingPage) {
        return await fetchViaPage(existingPage, url);
    }

    let browser: any;
    try {
        browser = await launchBrowser();
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });
        await page.goto('https://www.sofascore.com/', { waitUntil: 'networkidle2', timeout: 90000 });
        await sleep(10000);
        return await fetchViaPage(page, url);
    } finally {
        if (browser) await browser.close();
    }
};

/**
 * Launches a warm Puppeteer session with Sofascore's challenge solved.
 * Returns { browser, page } for reuse across multiple fetches.
 */
export const launchWarmSession = async () => {
    const browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    console.log('🌐 Warming up session on sofascore.com...');
    await page.goto('https://www.sofascore.com/', { waitUntil: 'networkidle2', timeout: 90000 });
    // Let the challenge JS settle and issue the session token before any API call.
    await sleep(10000);
    console.log('✅ Session warm.');

    return { browser, page };
};