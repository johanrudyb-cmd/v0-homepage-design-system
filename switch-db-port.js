const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
let content = fs.readFileSync(envPath, 'utf8');

if (content.includes(':6543')) {
    console.log('🔄 Switching DATABASE_URL port from 6543 (pooler) to 5432 (direct) for migration...');
    content = content.replace(':6543', ':5432');
    fs.writeFileSync(envPath, content);
    console.log('✅ Done.');
} else {
    console.log('ℹ️ Port is already not 6543, assuming 5432 or other.');
}
