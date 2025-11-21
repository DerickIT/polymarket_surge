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
    const url = `https://gamma-api.polymarket.com/markets?condition_id=${targetId}`;
    console.log(`Fetching: ${url}`);
    try {
        const data = await fetchJson(url);
        if (Array.isArray(data)) {
            console.log(`Received ${data.length} markets.`);
            const found = data.find(m => m.conditionId === targetId);
            if (found) {
                console.log('SUCCESS: Found target market in list!');
                console.log('Question:', found.question);
            } else {
                console.log('FAIL: Target market NOT found in list.');
                console.log('First market:', data[0].question);
                console.log('First market ID:', data[0].conditionId);
            }
        } else {
            console.log('Received object, not array.');
        }
    } catch (e) {
        console.error(e.message);
    }
}

run();
