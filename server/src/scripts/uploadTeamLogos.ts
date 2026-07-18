import dotenv from 'dotenv';
import connectDB from '../config/db';
import { Team } from '../models/Team';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer-extra';
import { HTTPRequest } from 'puppeteer';
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const bucket = process.env.SUPABASE_BUCKET || 'fantasy';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment variables');
    process.exit(1);
}

const keyParts = supabaseKey.split('.');
if (keyParts.length !== 3) {
    console.error(`Invalid SUPABASE_SERVICE_KEY format: expected 3 dot-separated parts, got ${keyParts.length}`);
    console.error('Make sure you are using the service_role key, not the anon key.');
    process.exit(1);
}

console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Supabase key: ...${supabaseKey.slice(-8)}`);
console.log(`Bucket: ${bucket}`);

const supabase = createClient(supabaseUrl, supabaseKey);
const publicBaseUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}`;

const DELAY_MS = 1500;
const SOFASCORE_IMAGE_BASE = 'https://img.sofascore.com/api/v1/team';

const EXTENSION_MAP: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
};

const MAGIC_BYTES: Record<string, number[]> = {
    'image/jpeg': [0xff, 0xd8, 0xff],
    'image/png': [0x89, 0x50, 0x4e, 0x47],
    'image/webp': [0x52, 0x49, 0x46, 0x46],
    'image/gif': [0x47, 0x49, 0x46],
};

const detectContentType = (bytes: number[]): string | null => {
    for (const [ct, magic] of Object.entries(MAGIC_BYTES)) {
        if (magic.every((m, i) => bytes[i] === m)) return ct;
    }
    return null;
};

const uploadTeamLogos = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        const teams = await Team.find(
            { id: { $exists: true } },
            { id: 1, name: 1, _id: 0 }
        ).lean();

        console.log(`Found ${teams.length} teams.`);

        if (teams.length === 0) {
            console.warn('No teams found. Run seed:teams first.');
            process.exit(0);
        }

        console.log('Launching Puppeteer...');
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-dev-shm-usage',
                '--disable-gpu',
            ],
        });
        const page = await browser.newPage();

        await page.setRequestInterception(true);
        page.on('request', (req: HTTPRequest) => {
            const rt = req.resourceType();
            if (rt === 'stylesheet' || rt === 'media' || rt === 'font') {
                req.abort();
            } else {
                req.continue();
            }
        });

        console.log('Warming up session on sofascore.com...');
        await page.goto('https://www.sofascore.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log('Session warm, starting image uploads.\n');

        const { error: bucketError } = await supabase.storage.getBucket(bucket);
        if (bucketError) {
            console.error(`Bucket "${bucket}" error: ${bucketError.message}`);
            console.error('Make sure the bucket exists and the service role key has access.');
            process.exit(1);
        }
        console.log(`Bucket "${bucket}" verified.\n`);

        console.log('Checking existing images in bucket...');
        const existingImages = new Map<number, string>();
        let offset = 0;
        const pageLimit = 1000;
        while (true) {
            const { data, error: listError } = await supabase.storage
                .from(bucket)
                .list('teams', { limit: pageLimit, offset });
            if (listError) {
                console.error(`Error listing bucket: ${listError.message}`);
                break;
            }
            if (!data || data.length === 0) break;
            for (const file of data) {
                const parts = file.name.split('.');
                const id = parseInt(parts[0], 10);
                const ext = parts[1];
                if (!isNaN(id) && ext) existingImages.set(id, ext);
            }
            if (data.length < pageLimit) break;
            offset += pageLimit;
        }
        console.log(`Found ${existingImages.size} existing images in bucket.\n`);

        let uploaded = 0;
        let skipped = 0;
        let alreadyExists = 0;
        let errors = 0;

        try {
            for (const [index, team] of teams.entries()) {
                const t = team as any;
                const teamId = t.id as number;
                const teamName = t.name || `Team ${teamId}`;

                if (existingImages.has(teamId)) {
                    const ext = existingImages.get(teamId);
                    const logoUrl = `${publicBaseUrl}/teams/${teamId}.${ext}`;
                    await Team.updateOne({ id: teamId }, { $set: { logo: logoUrl } });
                    alreadyExists++;
                    continue;
                }

                try {
                    const imageUrl = `${SOFASCORE_IMAGE_BASE}/${teamId}/image`;

                    const result = await page.evaluate(async (url: string) => {
                        const res = await fetch(url);
                        if (!res.ok) {
                            return { error: `HTTP ${res.status}` };
                        }
                        const contentType = res.headers.get('content-type') || 'image/png';
                        const buffer = await res.arrayBuffer();
                        const bytes = new Uint8Array(buffer);
                        let binary = '';
                        for (let i = 0; i < bytes.length; i++) {
                            binary += String.fromCharCode(bytes[i]);
                        }
                        return {
                            base64: btoa(binary),
                            contentType,
                            size: bytes.length,
                        };
                    }, imageUrl);

                    if ('error' in result) {
                        console.warn(`  [${index + 1}/${teams.length}] ${teamName} (${teamId}) - ${result.error}`);
                        skipped++;
                        continue;
                    }

                    if (!result.base64 || result.size === 0) {
                        console.warn(`  [${index + 1}/${teams.length}] ${teamName} (${teamId}) - Empty image`);
                        skipped++;
                        continue;
                    }

                    const buffer = Buffer.from(result.base64, 'base64');
                    const headerBytes = Array.from(buffer.slice(0, 8));
                    const detectedType = detectContentType(headerBytes);

                    if (!detectedType) {
                        const preview = buffer.slice(0, 100).toString('utf-8').replace(/[^\x20-\x7E]/g, '?');
                        console.warn(`  [${index + 1}/${teams.length}] ${teamName} (${teamId}) - Not a valid image (${result.contentType}, ${result.size} bytes). First bytes: ${preview}`);
                        skipped++;
                        continue;
                    }

                    const ext = EXTENSION_MAP[detectedType] || 'jpg';
                    const filePath = `teams/${teamId}.${ext}`;

                    const { error } = await supabase.storage
                        .from(bucket)
                        .upload(filePath, buffer, {
                            contentType: detectedType,
                            upsert: true,
                        });

                    if (error) {
                        console.error(`  [${index + 1}/${teams.length}] ${teamName} (${teamId}) - Upload error: ${error.message} (${detectedType}, ${result.size} bytes)`);
                        errors++;
                        continue;
                    }

                    const logoUrl = `${publicBaseUrl}/${filePath}`;
                    await Team.updateOne({ id: teamId }, { $set: { logo: logoUrl } });

                    uploaded++;
                    if ((index + 1) % 50 === 0 || index === teams.length - 1) {
                        console.log(`  Progress: ${index + 1}/${teams.length} (${uploaded} uploaded, ${alreadyExists} existing, ${skipped} skipped, ${errors} errors)`);
                    }
                } catch (err: any) {
                    console.error(`  [${index + 1}/${teams.length}] ${teamName} (${teamId}) - ${err.message}`);
                    errors++;
                }

                if (index < teams.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, DELAY_MS));
                }
            }
        } finally {
            await browser.close();
            console.log('Browser closed');
        }

        console.log(`\nDone. ${uploaded} uploaded, ${alreadyExists} already existed, ${skipped} skipped, ${errors} errors out of ${teams.length} teams.`);
        process.exit(0);
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
};

uploadTeamLogos();
