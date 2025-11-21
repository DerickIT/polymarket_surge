const https = require('https');

const marketId = '0xe3b423dfad8c22ff75c9899c4e8176f628cf4ad4caa00481764d320e7415f7a9';

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
        console.log('1. Fetching Market from Gamma...');
        const gammaData = await fetchJson(`https://gamma-api.polymarket.com/markets?condition_id=${marketId}`);
        const market = Array.isArray(gammaData) ? gammaData[0] : gammaData;

        console.log('Market Found:', market.question);
        console.log('CLOB Token IDs:', market.clobTokenIds);

        let tokenIds = [];
        try {
            tokenIds = JSON.parse(market.clobTokenIds);
        } catch (e) {
            console.log('Could not parse clobTokenIds');
        }

        if (tokenIds.length > 0) {
            const tokenId = tokenIds[0];
            console.log(`2. Fetching Orderbook from CLOB for token ${tokenId}...`);
            const book = await fetchJson(`https://clob.polymarket.com/book?token_id=${tokenId}`);
            console.log('Orderbook Sample:', JSON.stringify(book, null, 2).substring(0, 500));
        }

        console.log('3. Fetching Candles from Data API...');
        // Try different candle intervals
        const candles = await fetchJson(`https://data-api.polymarket.com/candles?market=${marketId}&resolution=1h`);
        console.log('Candles Sample:', JSON.stringify(candles, null, 2).substring(0, 500));

    } catch (error) {
        console.error('Error:', error.message);
    }
}

run();
