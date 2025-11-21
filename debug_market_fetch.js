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

async function run() {
    console.log('Fetching ID 1:', id1);
    const d1 = await fetchJson(`https://gamma-api.polymarket.com/markets?condition_id=${id1}&active=true`);
    const m1 = Array.isArray(d1) ? d1[0] : d1;
    console.log('M1 Question:', m1 ? m1.question : 'Not Found');
    console.log('M1 Image:', m1 ? m1.image : 'N/A');

    console.log('Fetching ID 2:', id2);
    const d2 = await fetchJson(`https://gamma-api.polymarket.com/markets?condition_id=${id2}&active=true`);
    const m2 = Array.isArray(d2) ? d2[0] : d2;
    console.log('M2 Question:', m2 ? m2.question : 'Not Found');
    console.log('M2 Image:', m2 ? m2.image : 'N/A');

    if (m1 && m2 && m1.question === m2.question) {
        console.error('CRITICAL: Both IDs returned the same market!');
    } else {
        console.log('SUCCESS: Markets are different.');
    }
}

run();
