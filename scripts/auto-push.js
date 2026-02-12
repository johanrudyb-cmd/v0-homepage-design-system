
const { execSync } = require('child_process');

function log(msg) {
    console.log(`[${new Date().toISOString()}] ${msg}`);
}

async function startAutoPush() {
    log('🚀 Starting Auto-Push service (every 1 hour)');

    while (true) {
        try {
            log('🔄 Checking for changes...');
            const status = execSync('git status --porcelain').toString();

            if (status.trim().length > 0) {
                log('📝 Changes detected, committing and pushing...');
                execSync('git add -A');
                execSync(`git commit -m "chore: auto-push ${new Date().toLocaleString()}"`);
                execSync('git push origin main');
                log('✅ Push successful');
            } else {
                log('😴 No changes to push.');
            }
        } catch (error) {
            log(`❌ Error during auto-push: ${error.message}`);
        }

        log('⏳ Waiting for 1 hour...');
        await new Promise(resolve => setTimeout(resolve, 3600000)); // 1 hour
    }
}

startAutoPush();
