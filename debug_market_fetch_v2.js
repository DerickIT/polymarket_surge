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

async function test(name, url1, url2) {
    console.log(`--- Testing ${name} ---`);
    try {
        const d1 = await fetchJson(url1);
        const m1 = Array.isArray(d1) ? d1[0] : d1;
        console.log(`ID1 Question: ${m1 ? m1.question.substring(0, 30) : 'Not Found'}`);

        const d2 = await fetchJson(url2);
        const m2 = Array.isArray(d2) ? d2[0] : d2;
        console.log(`ID2 Question: ${m2 ? m2.question.substring(0, 30) : 'Not Found'}`);

        if (m1 && m2 && m1.question !== m2.question) {
            console.log('RESULT: SUCCESS (Different markets returned)');
        } else {
            console.log('RESULT: FAIL (Same market or not found)');
        }
    } catch (e) {
        console.log(`RESULT: ERROR (${e.message})`);
    }
    console.log('');
}

async function run() {
    await test('condition_id + active=true',
        `https://gamma-api.polymarket.com/markets?condition_id=${id1}&active=true`,
        `https://gamma-api.polymarket.com/markets?condition_id=${id2}&active=true`
    );

    await test('condition_id ONLY',
        `https://gamma-api.polymarket.com/markets?condition_id=${id1}`,
        `https://gamma-api.polymarket.com/markets?condition_id=${id2}`
    );

    await test('conditionId (camelCase)',
        `https://gamma-api.polymarket.com/markets?conditionId=${id1}`,
        `https://gamma-api.polymarket.com/markets?conditionId=${id2}`
    );
}

run();
