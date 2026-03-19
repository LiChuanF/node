import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import mime from 'mime'

http.createServer((req, res) => {
    const { url, method } = req

    // 静态资源的处理
    if (method === 'GET' && url.startsWith('/static')) {
        const filePath = path.join(process.cwd(), url)
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' })
                res.end('404 Not Found')
            } else {
                console.log('缓存了啊')

                const contentType = mime.getType(filePath)
                res.writeHead(200, { 'Content-Type': contentType, 'cache-control': 'public, max-age=3600' })
                res.end(data)
            }
        })
    }

    // 动态资源的处理
    if ((method === 'GET' || method === 'POST') && url.startsWith('/api')) {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ name: 'trae' }))
    }
}).listen(3000, () => {
    console.log('server is running at http://localhost:3000')
})
