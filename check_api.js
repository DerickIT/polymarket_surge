const https = require('https');

const id = '0x59d1576e8e85c4ffbd9bf9e80e56b72fafdc94ee465290523a9c78e999f8fa7f';
const urls = [
    `https://gamma-api.polymarket.com/markets/${id}`,
    `https://gamma-api.polymarket.com/markets?id=${id}`,
    `https://gamma-api.polymarket.com/markets?condition_id=${id}`
];

urls.forEach(url => {
    https.get(url, (res) => {
        console.log(`${url} => Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`Response from ${url}:`, data.substring(0, 200));
            });
        }
    }).on('error', (e) => {
        console.error(`${url} => Error: ${e.message}`);
    });
});
