const http = require('http');

const postData = JSON.stringify({});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/categories/init-sample-data',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response:', JSON.parse(data));
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(postData);
req.end(); 