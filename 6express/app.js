import express from 'express'
import cors from 'cors'
import userRouter from './src/user.js'
import listRouter from './src/list.js'
import seeRouter from './src/see.js'
import loggerMiddleware from './middleware/logger.js'

const app = express()

// ========== 中间件配置 ==========

// 1. CORS 跨域处理（必须放最前面）
app.use(
    cors({
        origin: 'http://127.0.0.1:5500', // 允许的来源，生产环境可改为具体域名
        credentials: true, // 允许携带 Cookie
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 允许的请求方法
        allowedHeaders: ['Content-Type', 'Authorization'] // 允许的请求头
    })
)

// 2. 白名单验证中间件
const whiteList = ['localhost', '127.0.0.1']
const whiteListMiddleware = (req, res, next) => {
    const referer = req.get('referer')
    console.log('🍩 referer', referer)

    if (referer) {
        const { hostname } = new URL(referer)
        if (whiteList.includes(hostname)) {
            next() // ✅ 白名单通过
        } else {
            res.status(403).json({ error: 'Forbidden' }) // ❌ 拒绝访问
        }
    } else {
        next() // ✅ 没有 referer（直接访问），允许通过
    }
}
app.use(whiteListMiddleware)

// 3. 解析 JSON 请求体
app.use(express.json())

// 4. 解析 URL 编码的请求体（表单提交）
app.use(express.urlencoded({ extended: true }))

// 5. 日志记录器
app.use(loggerMiddleware)

// 6. 静态资源托管
app.use('/assets', express.static('static'))

// ========== 路由配置 ==========

// API 路由
app.use('/user', userRouter)
app.use('/list', listRouter)
app.use('/sse', seeRouter) // Server-Sent Events 实时推送

// 健康检查接口
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404 处理
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', path: req.path })
})

// 全局错误处理
app.use((err, req, res, next) => {
    console.error('❌ Error:', err)
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    })
})

// ========== 启动服务器 ==========

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`🚀 Server is running on: http://localhost:${PORT}`)
    console.log(`📁 Static files: http://localhost:${PORT}/assets`)
    console.log(`💚 Health check: http://localhost:${PORT}/health`)
})
