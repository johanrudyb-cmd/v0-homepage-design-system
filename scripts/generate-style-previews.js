
const fs = require('fs');
require('dotenv').config();

const HIGGSFIELD_BASE = 'https://platform.higgsfield.ai';
const HIGGSFIELD_API_KEY = process.env.HIGGSFIELD_API_KEY;
const HIGGSFIELD_API_SECRET = process.env.HIGGSFIELD_API_SECRET;
const DEFAULT_MODEL_ID = 'higgsfield-ai/soul/standard';

function getAuthHeader() {
    if (!HIGGSFIELD_API_KEY || !HIGGSFIELD_API_SECRET) {
        throw new Error('HIGGSFIELD_API_KEY et HIGGSFIELD_API_SECRET doivent être définis');
    }
    return `Key ${HIGGSFIELD_API_KEY}:${HIGGSFIELD_API_SECRET}`;
}

async function generateImage(prompt, options = {}) {
    const modelId = options.model_id ?? DEFAULT_MODEL_ID;
    const url = `${HIGGSFIELD_BASE}/${modelId}`;

    const body = {
        prompt,
        aspect_ratio: '3:4', // Plus adapté pour des vêtements à plat
        resolution: '1080p',
    };

    const submitRes = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: getAuthHeader(),
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!submitRes.ok) {
        const errText = await submitRes.text();
        throw new Error(`Higgsfield: ${submitRes.status} — ${errText}`);
    }

    const submitData = await submitRes.json();
    const statusUrl = submitData.status_url;
    if (!statusUrl) throw new Error('Missing status_url');

    for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const statusRes = await fetch(statusUrl, {
            headers: { Authorization: getAuthHeader(), Accept: 'application/json' },
        });
        const statusData = await statusRes.json();
        if (statusData.status === 'completed') return statusData.images?.[0]?.url;
        if (statusData.status === 'failed') throw new Error('Generation failed');
    }
    throw new Error('Timeout');
}

// Mapping des catégories pour les prompts
const CATEGORY_PROMPTS = {
    'TSHIRT': 'A premium cotton T-shirt, style: {style}, spread completely flat on a pure white minimalist background, photobooth style, commercial fashion photography, overhead view, high-end finishing, 8k resolution. No people, no mannequin, no background clutter.',
    'SWEAT': 'A luxury hoodie or sweatshirt, style: {style}, heavy fabric, spread flat on a pure white background, cinematic studio lighting, commercial fashion shot, 8k. No humans, no mannequin.',
    'JACKET': 'A high-end jacket, style: {style}, structured design, spread flat on a pure white background, professional photography, clean edges, 8k. No humans, no mannequin.',
    'PANT': 'Premium trousers or pants, style: {style}, spread flat showing the full length and details, pure white background, photorealistic, 8k. No model, no mannequin.',
    'JEAN': 'Premium denim jeans, style: {style}, visible grain and details, spread flat on a white background, commercial style, 8k. No model.',
    'DRESS': 'A stylish dress, style: {style}, spread flat on a white background, minimalist fashion photography, 8k. No people.'
};

async function run() {
    const PrismaClient = require('@prisma/client').PrismaClient;
    const prisma = new PrismaClient();

    try {
        const products = await prisma.trendProduct.findMany({
            select: { category: true, style: true }
        });

        const stylesByCategory = {};
        products.forEach(p => {
            const cat = p.category || 'AUTRE';
            if (!stylesByCategory[cat]) stylesByCategory[cat] = new Set();
            if (p.style) stylesByCategory[cat].add(p.style);
        });

        let mapping = {};
        if (fs.existsSync('public/style-previews.json')) {
            mapping = JSON.parse(fs.readFileSync('public/style-previews.json'));
        }

        console.log(`\n--- Generating Style Previews (Flat Lays) ---`);

        for (const [cat, styles] of Object.entries(stylesByCategory)) {
            if (!CATEGORY_PROMPTS[cat]) continue;

            if (!mapping[cat]) mapping[cat] = {};

            const stylesArray = Array.from(styles);
            for (const style of stylesArray) {
                // Skip if already generated (optional)
                // if (mapping[cat][style]) continue;

                const prompt = CATEGORY_PROMPTS[cat].replace('{style}', style);
                try {
                    console.log(`Generating preview for ${cat} > ${style}...`);
                    const url = await generateImage(prompt);
                    mapping[cat][style] = url;
                    console.log(`✅ Success: ${url}`);

                    // Save incrementally
                    fs.writeFileSync('public/style-previews.json', JSON.stringify(mapping, null, 2));
                } catch (e) {
                    console.error(`❌ Failed for ${style}: ${e.message}`);
                    if (e.message.includes('capacity') || e.message.includes('exhausted')) {
                        console.log('STOPPING: API Quota reached.');
                        return;
                    }
                }
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
