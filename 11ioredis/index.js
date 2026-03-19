import { Redis } from 'ioredis'

// 创建Redis客户端实例
const redis = new Redis({
    host: '127.0.0.1',
    port: 6379,
    family: 4 // 强制使用 IPv4
})
const redis2 = new Redis({
    host: '127.0.0.1',
    port: 6379,
    family: 4
})
const publisher = new Redis({
    host: '127.0.0.1',
    port: 6379,
    family: 4
}) // 专门用于发布消息的连接

// redis.set('key', '123')
// redis.get('key').then(value => {
//     console.log(value)
// })

// redis.setex('key', 6, '456')
// redis.get('key').then(value => {
//     console.log(value)
// })

// 集合

// redis.sadd('set', '张是你')
// redis.smembers('set').then(value => {
//     console.log(value)
// })

redis.subscribe('xiaomi')
redis.on('message', (channel, message) => {
    console.log(`Redis 1 收到 ${channel} 频道的消息: ${message}`)
})

redis2.subscribe('xiaomi2')
redis2.on('message', (channel, message) => {
    console.log(`Redis 2 收到 ${channel} 频道的消息: ${message}`)
})

// 使用独立的发布连接
publisher.publish('xiaomi', '你好，Redis 2！')
publisher.publish('xiaomi2', '你好，Redis 1！')
