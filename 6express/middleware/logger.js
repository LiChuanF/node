import log4js from 'log4js'

// 配置 log4js，将日志输出到控制台
log4js.configure({
    // 定义一个 appender，将日志输出到控制台
    appenders: {
        console: { type: 'console' },
        out: {
            type: 'stdout',
            layout: { type: 'colored' },
            filename: 'app.log',
        },
        file: {
            type: 'file',
            filename: 'app.log',
            layout: { type: 'colored' },
        },
    },
    categories: {
        default: { appenders: ['console'], level: 'debug' },
    },
})

const logger = log4js.getLogger('default')

// 中间件：日志记录器，打印每个请求的方法和 URL
// req：请求对象，包含请求信息（如方法、URL、头信息、体数据等）
// res：响应对象，用于发送响应给客户端（如设置状态码、头信息、体数据等）
// next：函数，调用它将控制权传递给下一个中间件或路由处理函数

const loggerMiddleware = (req, res, next) => {
    logger.debug(`[${req.method}] ${req.url}`)
    next()
}
export default loggerMiddleware
