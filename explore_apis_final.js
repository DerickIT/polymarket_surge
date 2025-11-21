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
        console.log('1. Fetching High Volume Market from Gamma...');
        // Order by volume to ensure it's a real, active market
        const markets = await fetchJson(`https://gamma-api.polymarket.com/markets?active=true&limit=1&order=volume24hr&closed=false`);

        if (markets.length > 0) {
            const market = markets[0];
            console.log('Market:', market.question);
            console.log('Condition ID:', market.conditionId);
            console.log('CLOB Token IDs:', market.clobTokenIds);

            // If clobTokenIds is a string, parse it
            let tokenIds = [];
            if (typeof market.clobTokenIds === 'string') {
                tokenIds = JSON.parse(market.clobTokenIds);
            } else if (Array.isArray(market.clobTokenIds)) {
                tokenIds = market.clobTokenIds;
            }

            console.log('Parsed Token IDs:', tokenIds);

            if (tokenIds.length > 0) {
                const tokenId = tokenIds[0];
                console.log(`2. Fetching Orderbook for token ${tokenId}...`);
                try {
                    const book = await fetchJson(`https://clob.polymarket.com/book?token_id=${tokenId}`);
                    console.log('Orderbook Status: OK');
                    console.log('Bids:', book.bids ? book.bids.length : 0);
                } catch (e) {
                    console.log('Orderbook Failed:', e.message);
                }
            }

            if (market.conditionId) {
                console.log('3. Fetching Candles...');
                try {
                    const candles = await fetchJson(`https://data-api.polymarket.com/candles?market=${market.conditionId}&resolution=1h`);
                    console.log('Candles Status: OK');
                    console.log('Candles Count:', candles.length);
                } catch (e) {
                    console.log('Candles Failed:', e.message);
                }
            }
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

run();
