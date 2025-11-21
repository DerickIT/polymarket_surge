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
                    reject(new Error(`Status ${res.statusCode} from ${url}`));
                }
            });
        }).on('error', reject);
    });
}

async function run() {
    const url = 'https://gamma-api.polymarket.com/markets?limit=50&active=true&order=volume24hr';
    console.log(`Fetching: ${url}`);
    try {
        const data = await fetchJson(url);
        console.log(`Received ${data.length} markets.`);

        const seen = new Set();
        const duplicates = [];

        data.forEach(m => {
            if (seen.has(m.question)) {
                duplicates.push(m);
            } else {
                seen.add(m.question);
            }
        });

        if (duplicates.length > 0) {
            console.log(`FOUND ${duplicates.length} DUPLICATE QUESTIONS!`);
            duplicates.forEach(d => {
                console.log(`- ${d.question} (${d.conditionId})`);
            });
        } else {
            console.log('No duplicate questions found in API response.');
        }

    } catch (e) {
        console.error(e.message);
    }
}

run();
