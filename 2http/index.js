const http = require('node:http')
const url = require('node:url')
const fs = require('node:fs')

const { createProxyMiddleware } = require('http-proxy-middleware')
const config = require('./config.js')

const html = fs.readFileSync('./index.html', 'utf-8')

// 创建代理中间件
const apiProxy = createProxyMiddleware({
    target: config.server['/api'].target,
    changeOrigin: config.server['/api'].changeOrigin,
    pathRewrite: config.server['/api'].pathRewrite
})

http.createServer((req, res) => {
    // 检查是否是代理请求
    if (req.url.startsWith('/api')) {
        return apiProxy(req, res)
    }

    // 解析 URL
    const parsedUrl = url.parse(req.url, true)
    const pathname = parsedUrl.pathname
    const query = parsedUrl.query

    // 设置响应头
    res.setHeader('Content-Type', 'application/json; charset=utf-8')

    // 处理 GET 请求
    if (req.method === 'GET') {
        if (pathname === '/') {
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(html)
        } else if (pathname === '/user') {
            res.statusCode = 200
            res.end(
                JSON.stringify({
                    message: '用户信息',
                    query: query
                })
            )
        } else if (pathname === '/realapi') {
            // 这是真实的 API 路由，会被代理访问
            res.statusCode = 200
            res.end(
                JSON.stringify({
                    message: '这是真实的 API 响应',
                    path: '原始路径是 /realapi',
                    note: '通过代理访问时路径是 /api'
                })
            )
        } else {
            // 404 处理
            res.statusCode = 404
            res.end(JSON.stringify({ error: '页面未找到' }))
        }
    }
    // 处理 POST 请求
    else if (req.method === 'POST') {
        if (pathname === '/data') {
            let body = ''

            // 接收数据块
            req.on('data', chunk => {
                body += chunk.toString()
            })

            // 数据接收完成
            req.on('end', () => {
                try {
                    const data = JSON.parse(body)
                    res.statusCode = 200
                    res.end(
                        JSON.stringify({
                            message: '数据接收成功',
                            received: data
                        })
                    )
                } catch (err) {
                    res.statusCode = 400
                    res.end(JSON.stringify({ error: '无效的 JSON 数据' }))
                }
            })
        } else {
            res.statusCode = 404
            res.end(JSON.stringify({ error: '接口未找到' }))
        }
    }
    // 其他请求方法
    else {
        res.statusCode = 405
        res.end(JSON.stringify({ error: '不支持的请求方法' }))
    }
}).listen(3000, () => {
    console.log('Server is running on http://localhost:3000')
})
