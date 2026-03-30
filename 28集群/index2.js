import http from 'node:http'

http.createServer((req, res) => {
    res.end('hello world')
}).listen(6000, () => {
    console.log('server is running on port 6000');
})

