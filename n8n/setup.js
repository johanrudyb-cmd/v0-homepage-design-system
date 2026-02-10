const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Configuration du serveur n8n pour OUTFITY...');

// 1. Vérifier si n8n est installé
try {
    console.log('📦 Vérification de n8n...');
    execSync('npx n8n --version', { stdio: 'ignore' });
    console.log('✅ n8n est disponible via npx');
} catch (e) {
    console.log('❌ n8n n\'est pas accessible. Assurez-vous d\'avoir Node.js installé.');
    process.exit(1);
}

// 2. Créer les dossiers nécessaires
const userHome = process.env.HOME || process.env.USERPROFILE;
const n8nDir = path.join(userHome, '.n8n');
if (!fs.existsSync(n8nDir)) {
    fs.mkdirSync(n8nDir, { recursive: true });
}

console.log(`📂 Dossier de configuration : ${n8nDir}`);

// 3. Copier les workflows pour import manuel facile
const workflowsDir = path.join(__dirname, 'workflows');
const destDir = path.join(n8nDir, 'workflows_backup');
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

if (fs.existsSync(workflowsDir)) {
    const files = fs.readdirSync(workflowsDir);
    files.forEach(file => {
        if (file.endsWith('.json')) {
            fs.copyFileSync(path.join(workflowsDir, file), path.join(destDir, file));
            console.log(`📄 Copié ${file} vers ${destDir}`);
        }
    });
}

console.log('\n✅ Configuration terminée !');
console.log('\n👉 Pour lancer le serveur n8n :');
console.log('   cd n8n');
console.log('   npm install');
console.log('   npm start');
console.log('\n👉 Une fois lancé, ouvrez http://localhost:5678');
console.log('   Configurez votre compte admin');
console.log('   Puis importez les workflows depuis le menu : Workflows > Import from File');
console.log(`   Les fichiers sont dans : ${workflowsDir}`);
