const https = require('https');

const marketId = '0xe3b423dfad8c22ff75c9899c4e8176f628cf4ad4caa00481764d320e7415f7a9'; // From user example
const assetId = '21742633143463906290569050155826241533067272736897614950488156847949938836455'; // Need to find a valid asset ID/Token ID for CLOB usually

const apis = [
    { name: 'GAMMA', url: `https://gamma-api.polymarket.com/markets?condition_id=${marketId}` },
    { name: 'DATA_TRADES', url: `https://data-api.polymarket.com/trades?market=${marketId}&limit=1` },
    { name: 'CLOB_BOOK', url: `https://clob.polymarket.com/book?token_id=${assetId}` }, // Guessing endpoint
    { name: 'CLOB_MARKETS', url: `https://clob.polymarket.com/markets` }, // Guessing endpoint
];

// Helper to fetch
const fetchUrl = (api) => {
    console.log(`Testing ${api.name}: ${api.url}`);
    https.get(api.url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(`[${api.name}] Status: ${res.statusCode}`);
            if (res.statusCode === 200) {
                console.log(`[${api.name}] Sample: ${data.substring(0, 300)}...`);
            } else {
                console.log(`[${api.name}] Error: ${data.substring(0, 100)}`);
            }
        });
    }).on('error', e => console.error(`[${api.name}] Failed: ${e.message}`));
};

apis.forEach(fetchUrl);
