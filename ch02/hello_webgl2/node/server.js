const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    const filePath = path.join(__dirname, req.url);

    // CORS 헤더 추가
    res.setHeader('Access-Control-Allow-Origin', '*');

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        }
    });
});

const port = 8080; // 사용할 포트 번호를 지정하세요
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/`);
});
