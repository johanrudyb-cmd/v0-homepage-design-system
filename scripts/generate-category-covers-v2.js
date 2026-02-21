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
        resolution: '1080p', // Higher resolution for better visibility
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
const SEGMENTS = ['homme', 'femme'];

const PROMPTS = {
    't-shirts': {
        homme: 'Ultra-realistic editorial fashion photo of a stylish young man wearing a premium bright white boxy t-shirt, high-end cotton texture visible, vibrant minimalist background, professional studio lighting, 8k resolution',
        femme: 'Ultra-realistic editorial fashion photo of a stylish young woman wearing a premium colorful crop top t-shirt, soft textures, high-fashion aesthetic, bright studio lighting, vibrant mood, 8k resolution'
    },
    'sweats': {
        homme: 'Ultra-realistic editorial fashion photo of a stylish young man wearing a high-end cream oversized hoodie, heavy fabric texture, minimalist high-fashion studio setting, bright lighting, 8k resolution',
        femme: 'Ultra-realistic editorial fashion photo of a stylish young woman wearing a premium pastel oversized sweatshirt, cozy aesthetic, high-fashion editorial pose, professional lighting, 8k resolution'
    },
    'vestes': {
        homme: 'Ultra-realistic fashion photography of a young man wearing a premium bright leather racing jacket with color accents, sharp details, cinematic high-fashion lighting, 8k photorealistic',
        femme: 'Ultra-realistic fashion photography of a young woman wearing a high-end designer bomber jacket in vibrant colors, stylish editorial pose, sharp focus on materials, studio lighting, 8k'
    },
    'pantalons': {
        homme: 'Ultra-realistic editorial photo of premium olive cargo pants on a male model, urban techwear aesthetic, sharp garment details, bright professional lighting, 8k resolution',
        femme: 'Ultra-realistic editorial photo of premium wide-leg trousers on a female model, vibrant colors, elegant high-fashion pose, bright studio lighting, detailed textures, 8k'
    },
    'jeans': {
        homme: 'Ultra-realistic fashion photo of premium light blue baggy denim jeans on a male model, visible denim weave, stylish streetwear pose, bright studio lighting, high resolution 8k',
        femme: 'Ultra-realistic fashion photo of high-waist vintage blue jeans on a female model, editorial high-fashion aesthetic, sharp details on stitching and cut, bright lighting, 8k'
    }
};

async function run() {
    const finalResults = { homme: {}, femme: {} };

    for (const segment of SEGMENTS) {
        console.log(`\n--- Generating for ${segment.toUpperCase()} ---`);
        for (const catId of CATEGORIES) {
            const prompt = PROMPTS[catId][segment];
            try {
                console.log(`Generating ${catId}...`);
                const url = await generateImage(prompt);
                finalResults[segment][catId] = url;
                console.log(`✅ ${catId}: ${url}`);
            } catch (e) {
                console.error(`❌ ${catId}: ${e.message}`);
            }
        }
    }

    fs.writeFileSync('category-covers-dual.json', JSON.stringify(finalResults, null, 2));
    console.log('\nAll images generated and saved to category-covers-dual.json');
}

run();
