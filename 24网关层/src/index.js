import fastify from 'fastify'
import proxy from '@fastify/http-proxy' //负载代理技术
import rateLimit from '@fastify/rate-limit' //限流技术
import proxyConfig from './proxy/index.js' //请往下翻
import caching from '@fastify/caching' //缓存技术
import CircuitBreaker from 'opossum' //熔断技术
import { rateLimitConfig, cachingConfig, breakerConfig } from './config/index.js'

const app = fastify()

const breaker = new CircuitBreaker((url) => {
    return fetch(url).then((res) => res.json()) //检测服务是否挂掉
}, breakerConfig)

// 限流技术
app.register(rateLimit,rateLimitConfig)

// 缓存
app.register(caching,cachingConfig)

// 熔断技术
proxyConfig.forEach(item => {
    app.register(proxy, {
        ...item,
        preHandler: (req, res, done) => {
            breaker.fire(item.upstream).then(() => {
                done()
            }).catch(() => {
                res.send({
                    code: 503,
                    msg: '熔断器已打开，服务不可用，请稍后重试。',
                })
            })
        },
    })
})


app.listen({ port: 3000 }, () => {
    console.log(`Server is running on port ${3000}`) 
})