const https = require('https');

const targetId = '0xcb111226a8271fed0c71bb5ec1bd67b2a4fd72f1eb08466e2180b9efa99d3f32';

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

async function run() {
    // Test 1: Fetch list to get an internal ID
    console.log('1. Fetching list to get internal ID...');
    const list = await fetchJson('https://gamma-api.polymarket.com/markets?limit=1');
    const first = list[0];
    console.log('Internal ID:', first.id);
    console.log('Condition ID:', first.conditionId);

    // Test 2: Fetch by internal ID path
    console.log('\n2. Fetching by internal ID path...');
    try {
        const m = await fetchJson(`https://gamma-api.polymarket.com/markets/${first.id}`);
        console.log('SUCCESS: Fetched by internal ID!');
        console.log('Question:', m.question);
    } catch (e) {
        console.log('FAIL:', e.message);
    }

    // Test 3: Fetch by condition_ids (plural)
    console.log('\n3. Fetching by condition_ids (plural)...');
    try {
        // Note: targetId is from a different market than first.id, so we expect different result if it works
        const url = `https://gamma-api.polymarket.com/markets?condition_ids=${targetId}`;
        const data = await fetchJson(url);
        if (Array.isArray(data) && data.length > 0 && data[0].conditionId === targetId) {
            console.log('SUCCESS: Fetched by condition_ids!');
            console.log('Question:', data[0].question);
        } else {
            console.log('FAIL: condition_ids ignored or empty.');
            if (data.length > 0) console.log('Got:', data[0].conditionId);
        }
    } catch (e) {
        console.log('FAIL:', e.message);
    }
}

run();
