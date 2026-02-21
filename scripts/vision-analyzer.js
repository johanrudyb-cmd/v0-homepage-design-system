
const { PrismaClient } = require('@prisma/client');
const { OpenAI } = require('openai');
require('dotenv').config();

const prisma = new PrismaClient();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const ALLOWED_FOLDERS = [
    // HAUTS
    "T-Shirt Boxy", "T-Shirt Oversize", "T-Shirt Graphique", "T-Shirt Basique", "Débardeur", "Polo",
    // SWEATS & MAILLES
    "Hoodie Oversize", "Sweat-shirt Boxy", "Sweat-shirt Graphique", "Sweat Zip-up", "Pull en Maille", "Cardigan", "Gilet sans manche",
    // CHEMISES
    "Chemise en Lin", "Chemise Oversize", "Surchemise",
    // VESTES
    "Veste Bomber", "Veste en Cuir", "Veste Racing", "Veste Varsity", "Manteau", "Blazer",
    // BAS
    "Jean Baggy", "Jean Droit", "Pantalon Cargo", "Pantalon Large", "Jogging", "Short",
    // SPORT
    "Maillot de Sport"
];

async function analyzeWithVision(imageUrl, productName) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text", text: `You are a professional fashion buyer. 
            I am showing you an image of a product sold under the name: "${productName}".
            
            CRITICAL INSTRUCTION: Analyze ONLY the item mentioned in the name. 
            If the image shows a full outfit, IGNORE the other clothes and focus on the "${productName}".
            
            You MUST classify it into EXACTLY ONE of these folders:
            [${ALLOWED_FOLDERS.join(", ")}]

            Rules:
            1. Return ONLY a JSON object.
            2. "nicheLabel" MUST be one of the names above.
            3. BE LOGICAL: A shirt is not a t-shirt. A jogging is not a cargo.
            
            Return format: {"nicheLabel": "Folder Name", "cut": "Oversized/Slim/Regular", "material": "Material Name"}` },
                        {
                            type: "image_url",
                            image_url: {
                                "url": imageUrl,
                            },
                        },
                    ],
                },
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(response.choices[0].message.content);

        // Validation strict
        if (!ALLOWED_FOLDERS.includes(result.nicheLabel)) {
            console.log(`⚠️ AI returned invalid label: ${result.nicheLabel}.Cleaning...`);
            // On cherche le match le plus proche ou on met Autre
            const matched = ALLOWED_FOLDERS.find(f => result.nicheLabel.includes(f));
            if (matched) result.nicheLabel = matched;
            else result.nicheLabel = "Autre";
        }

        return result;
    } catch (error) {
        console.error(`❌ Error analyzing image ${imageUrl}: `, error.message);
        return null;
    }
}

async function run() {
    console.log('🚀 DÉMARRAGE DU RÉALIGEMENT TOTAL (L\'ARMOIRE)...');

    // On traite TOUS les produits pour les remettre dans les bons dossiers fixes
    const products = await prisma.trendProduct.findMany({
        take: 172
    });

    console.log(`📦 ${products.length} produits à analyser avec Vision.`);

    for (const product of products) {
        if (!product.imageUrl) continue;

        console.log(`🔍 Analyse de : ${product.name}...`);
        const analysis = await analyzeWithVision(product.imageUrl, product.name);

        if (analysis) {
            console.log(`✨ Résultat pour ${product.name} : ${analysis.nicheLabel}`);

            // Mapper le nicheLabel vers une catégorie technique
            let cat = "TSHIRT";
            const lb = analysis.nicheLabel;
            if (lb.includes("Jean")) cat = "JEAN";
            else if (lb.includes("Pantalon") || lb.includes("Short") || lb.includes("Jogging")) cat = "PANT";
            else if (lb.includes("Veste") || lb.includes("Bomber") || lb.includes("Manteau") || lb.includes("Blazer")) cat = "JACKEX";
            else if (lb.includes("Sweat") || lb.includes("Hoodie")) cat = "SWEAT";
            else if (lb.includes("Gilet") || lb.includes("Pull") || lb.includes("Cardigan")) cat = "SWEAT";
            else if (lb.includes("Maillot")) cat = "JERSEY";
            else if (lb.includes("Chemise") || lb.includes("Surchemise")) cat = "SHIRT";
            else if (lb.includes("Débardeur") || lb.includes("Polo") || lb.includes("T-Shirt")) cat = "TSHIRT";

            await prisma.trendProduct.update({
                where: { id: product.id },
                data: {
                    category: cat,
                    style: analysis.nicheLabel,
                    material: analysis.material || "Inconnu",
                    cut: analysis.cut || "Regular",
                    visualTags: analysis,
                    lastScan: "Vision Analysis",
                    updatedAt: new Date()
                }
            });
        }

        // Petite pause pour pas saturer l'API
        await new Promise(r => setTimeout(r, 500));
    }

    console.log('✅ Analyse Vision terminée.');
}

run().catch(console.error).finally(() => prisma.$disconnect());
