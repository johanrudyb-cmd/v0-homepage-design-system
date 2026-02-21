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
        aspect_ratio: '9:16',
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

const CATEGORIES = ['t-shirts', 'sweats', 'vestes', 'pantalons', 'jeans'];

const PROMPTS_HOMME = {
    't-shirts': 'Ultra-realistic editorial fashion photo of a stylish Caucasian male model wearing a premium bright white boxy t-shirt, blond hair, high-end cotton texture, vibrant blue minimalist background, professional studio lighting, 8k resolution',
    'sweats': 'Ultra-realistic editorial fashion photo of a young Asian male model wearing a high-end cream oversized hoodie, heavy fabric texture, minimalist aesthetic, warm golden lighting, 8k resolution, professional pose',
    'vestes': 'Ultra-realistic fashion photography of a young Hispanic male model wearing a premium red leather racing jacket with white stripes, sharp details, cinematic high-fashion lighting, bright atmosphere, 8k photorealistic',
    'pantalons': 'Ultra-realistic editorial photo of premium sand-colored cargo pants on a tall Caucasian male model, brown hair, techwear aesthetic, sharp garment details, bright professional lighting, 8k resolution',
    'jeans': 'Ultra-realistic fashion photo of premium light baby blue baggy denim jeans on a stylish young male model, visible denim weave, urban streetwear pose, bright daylight studio lighting, high resolution 8k'
};

async function run() {
    let existingCovers = {};
    if (fs.existsSync('category-covers-dual.json')) {
        existingCovers = JSON.parse(fs.readFileSync('category-covers-dual.json'));
    }

    console.log(`\n--- Regenerating for HOMME (Diverse ethnicities & Bright colors) ---`);
    for (const catId of CATEGORIES) {
        const prompt = PROMPTS_HOMME[catId];
        try {
            console.log(`Generating ${catId}...`);
            const url = await generateImage(prompt);
            if (!existingCovers.homme) existingCovers.homme = {};
            existingCovers.homme[catId] = url;
            console.log(`✅ ${catId}: ${url}`);
        } catch (e) {
            console.error(`❌ ${catId}: ${e.message}`);
        }
    }

    fs.writeFileSync('category-covers-dual.json', JSON.stringify(existingCovers, null, 2));
    console.log('\nHomme images updated in category-covers-dual.json');
}

run();
