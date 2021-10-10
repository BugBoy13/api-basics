const fs = require('fs')
const http = require('http')

const server = http.createServer();

server.on('request', (req, res) => {
    // Solution 1
    // fs.readFile('test-file.txt', (err, data) => {
    //     if (err) console.error(err);
    //     res.end(data);
    // })

    // Solution 2
    // const readable = fs.createReadStream('test-file.txt')
    // readable.on('data', (chunk) => {
    //     res.write(chunk)
    // })
    // readable.on('end', () => {
    //     res.end();
    // })
    // readable.on('error', err => {
    //     console.error(err);
    //     res.statusCode = 500
    //     res.end('File not found')
    // })

    // Solution3
    const readable = fs.createReadStream('test-file.txt')
    readable.pipe(res)
    // readableSource.pipe(writeableDest)
})

server.listen(8000, '127.0.0.1', () => {
    console.log('Listening...');
})