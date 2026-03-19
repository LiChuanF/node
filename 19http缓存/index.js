import express from 'express'
import cors from 'cors'
const app = express()
// 跨域
app.use(cors())
// 静态资源目录
app.use(express.static('./static'))

//动态资源缓存 接口
// expires 强缓存
app.get('/expires', (req, res) => {
    res.setHeader('Expires', new Date('2026-3-16 16:00:00').toUTCString()) //设置过期时间
    res.json({
        name: 'cache',
        version: '1.0.0'
    })
})
// cache-control 强缓存
// max-age 过期时间，单位秒
// no-cache 不缓存
// no-store 禁止任何缓存策略。
// public 所有用户都可以缓存
// private 只有浏览器可以缓存
// 如果 max-age 和 Expires 同时出现 max-age 优先级高
app.get('/cache-control', (req, res) => {
    res.setHeader('Cache-Control', 'max-age=10, public') //设置过期时间
    res.json({
        name: 'cache-control',
        version: '1.0.0'
    })
})

// 协商缓存 接口
// last-modified 协商缓存  配合 If-Modified-Since
// 1. 浏览器第一次请求资源，服务器返回资源，并在响应头中添加 Last-Modified 字段
// 2. 浏览器第二次请求资源，在请求头中添加 If-Modified-Since 字段，值为第一次返回的 Last-Modified 字段值
// 3. 服务器判断 If-Modified-Since 字段值是否与资源的最后修改时间相同
// 4. 如果相同，返回 304 状态码，不返回资源内容
// 5. 如果不同，返回资源内容，并在响应头中添加 Last-Modified 字段
app.get('/last-modified', (req, res) => {
    res.setHeader('Last-Modified', new Date('2026-3-17 10:35:00').toUTCString()) //设置过期时间
    res.json({
        name: 'last-modified',
        version: '1.0.0'
    })
})

// etag 协商缓存
// 1. 浏览器第一次请求资源，服务器返回资源，并在响应头中添加 ETag 字段
// 2. 浏览器第二次请求资源，在请求头中添加 If-None-Match 字段，值为第一次返回的 ETag 字段值
// 3. 服务器判断 If-None-Match 字段值是否与资源的 ETag 值相同
// 4. 如果相同，返回 304 状态码，不返回资源内容
// 5. 如果不同，返回资源内容，并在响应头中添加 ETag 字段

app.get('/etag', (req, res) => {
    res.setHeader('ETag', '10') //设置过期时间
    res.json({
        name: 'etag',
        version: '1.0.0'
    })
})

// 强缓存和协商缓存同时出现的时候，协商缓存优先级高
app.get('/check', (req, res) => {
    res.setHeader('Expires', new Date('2026-3-16 16:00:00').toUTCString()) //设置过期时间
    res.setHeader('Cache-Control', 'max-age=10, public') //设置过期时间
    res.setHeader('Last-Modified', new Date('2026-3-17 10:35:00').toUTCString()) //设置过期时间
    res.setHeader('ETag', '10') //设置过期时间
    res.json({
        name: 'check',
        version: '1.0.0'
    })
})


app.listen(3000, () => {
    console.log('Example app listening on port 3000!')
})
