const https = require('https');

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error(`Failed to parse JSON from ${url}`));
                    }
                } else {
                    reject(new Error(`Status ${res.statusCode} from ${url}: ${data.substring(0, 100)}`));
                }
            });
        }).on('error', reject);
    });
}

async function run() {
    try {
        console.log('1. Fetching Active Market from Gamma...');
        const markets = await fetchJson(`https://gamma-api.polymarket.com/markets?active=true&limit=1&closed=false`);
        if (markets.length > 0) {
            const market = markets[0];
            console.log('Keys:', Object.keys(market));
            console.log('Condition ID:', market.conditionId);
            console.log('CLOB Token IDs:', market.clobTokenIds);

            // Try Candles with this ID
            if (market.conditionId) {
                console.log('3. Fetching Candles from Data API...');
                try {
                    const candles = await fetchJson(`https://data-api.polymarket.com/candles?market=${market.conditionId}&resolution=1h`);
                    console.log('Candles Sample:', JSON.stringify(candles, null, 2).substring(0, 200));
                } catch (e) {
                    console.log('Candles failed:', e.message);
                }
            }
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

run();
