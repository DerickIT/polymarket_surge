const https = require('https');

const id1 = '0x59d1576e8e85c4ffbd9bf9e80e56b72fafdc94ee465290523a9c78e999f8fa7f';
const id2 = '0xcb111226a8271fed0c71bb5ec1bd67b2a4fd72f1eb08466e2180b9efa99d3f32';

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
                    reject(new Error(`Status ${res.statusCode} from ${url}`));
                }
            });
        }).on('error', reject);
    });
}

async function getMarket(conditionId) {
    // Simulating the logic in src/lib/polymarket-api.ts
    const url = `https://gamma-api.polymarket.com/markets?condition_ids=${conditionId}&active=true`;
    const data = await fetchJson(url);
    return Array.isArray(data) ? data[0] : data;
}

async function run() {
    console.log('Verifying fix...');

    const m1 = await getMarket(id1);
    console.log(`Market 1 (${id1.substring(0, 10)}...): ${m1 ? m1.question.substring(0, 40) : 'Not Found'}`);

    const m2 = await getMarket(id2);
    console.log(`Market 2 (${id2.substring(0, 10)}...): ${m2 ? m2.question.substring(0, 40) : 'Not Found'}`);

    if (m1 && m2 && m1.question !== m2.question) {
        console.log('SUCCESS: Markets are different and correctly fetched!');
    } else {
        console.error('FAIL: Markets are still the same or not found.');
    }
}

run();
