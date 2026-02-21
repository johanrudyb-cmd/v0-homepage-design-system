import { refreshAllTrends } from './lib/refresh-all-trends';

async function main() {
    console.log('Starting full trends refresh...');
    try {
        const result = await refreshAllTrends();
        console.log('Refresh results:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Refresh failed:', error);
    }
}

main();
