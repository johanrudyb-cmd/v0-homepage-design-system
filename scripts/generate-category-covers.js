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
        aspect_ratio: options.aspect_ratio ?? '9:16',
        resolution: options.resolution ?? '720p',
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
        throw new Error(`Higgsfield submit: ${submitRes.status} — ${errText}`);
    }

    const submitData = await submitRes.json();
    const statusUrl = submitData.status_url;

    if (!statusUrl) throw new Error('Higgsfield: status_url manquant');

    console.log(`Generation started for: ${prompt.substring(0, 30)}...`);

    for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const statusRes = await fetch(statusUrl, {
            headers: { Authorization: getAuthHeader(), Accept: 'application/json' },
        });
        const statusData = await statusRes.json();
        if (statusData.status === 'completed') return statusData.images?.[0]?.url;
        if (statusData.status === 'failed') throw new Error('Failed');
    }
    throw new Error('Timeout');
}

const CATEGORIES = [
    { id: 't-shirts', prompt: 'High-end editorial fashion photo of a stylish young man wearing a premium boxy t-shirt, minimalist studio lighting, high fashion mood, street style' },
    { id: 'sweats', prompt: 'High-end editorial fashion photography of a young model wearing a premium oversized hoodie, cinematic lighting, moody atmosphere, fashion portfolio' },
    { id: 'vestes', prompt: 'High-end editorial fashion photography of a young man wearing a sleek leather racing jacket, professional studio lighting, sharp focus, editorial style' },
    { id: 'pantalons', prompt: 'High-end editorial fashion photography of premium cargo pants, fashion model posing, urban minimalist backdrop, cinematic lighting' },
    { id: 'jeans', prompt: 'High-end editorial fashion photography of baggy denim jeans, emphasis on texture and cut, stylish model, professional fashion lighting' },
];

async function run() {
    const results = {};
    for (const cat of CATEGORIES) {
        try {
            const url = await generateImage(cat.prompt);
            results[cat.id] = url;
            console.log(`✅ ${cat.id}: ${url}`);
        } catch (e) {
            console.error(`❌ ${cat.id}: ${e.message}`);
        }
    }
    fs.writeFileSync('category-covers.json', JSON.stringify(results, null, 2));
}

run();
