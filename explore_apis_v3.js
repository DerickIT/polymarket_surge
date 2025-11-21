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
    let marketId = '';
    let tokenId = '';

    // 1. Get an active market
    try {
        console.log('1. Fetching Active Market from Gamma...');
        const markets = await fetchJson(`https://gamma-api.polymarket.com/markets?active=true&limit=1&closed=false`);
        if (markets.length > 0) {
            const market = markets[0];
            console.log('Active Market:', market.question);
            marketId = market.conditionId;

            try {
                const tokenIds = JSON.parse(market.clobTokenIds);
                if (tokenIds.length > 0) tokenId = tokenIds[0];
            } catch (e) { console.log('Parse error for tokens'); }

            console.log('Market ID:', marketId);
            console.log('Token ID:', tokenId);
        }
    } catch (e) {
        console.error('Step 1 Failed:', e.message);
    }

    // 2. Test CLOB
    if (tokenId) {
        try {
            console.log(`2. Fetching Orderbook from CLOB for token ${tokenId}...`);
            const book = await fetchJson(`https://clob.polymarket.com/book?token_id=${tokenId}`);
            console.log('Orderbook Sample:', JSON.stringify(book, null, 2).substring(0, 200));
        } catch (e) {
            console.error('Step 2 Failed:', e.message);
        }
    } else {
        console.log('Skipping Step 2 (No Token ID)');
    }

    // 3. Test Candles
    if (marketId) {
        try {
            console.log('3. Fetching Candles from Data API...');
            // Try different candle intervals
            const candles = await fetchJson(`https://data-api.polymarket.com/candles?market=${marketId}&resolution=1h`);
            console.log('Candles Sample:', JSON.stringify(candles, null, 2).substring(0, 200));
        } catch (e) {
            console.error('Step 3 Failed:', e.message);
        }
    }
}

run();
