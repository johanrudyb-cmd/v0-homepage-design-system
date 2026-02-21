const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
let content = fs.readFileSync(envPath, 'utf8');

if (content.includes(':5432')) {
    console.log('🔄 Switching DATABASE_URL port back from 5432 (direct) to 6543 (pooler)...');
    content = content.replace(':5432', ':6543');
    fs.writeFileSync(envPath, content);
    console.log('✅ Done.');
} else {
    console.log('ℹ️ Port is already not 5432, assuming 6543 or other.');
}
