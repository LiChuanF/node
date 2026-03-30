import amqplib from 'amqplib'

// 连接mq
const connection = await amqplib.connect('amqp://localhost:5672') // 连接rabbitmq
// 创建一个通道
const channel = await connection.createChannel() // 创建channel

// 创建一个交换机
await channel.assertExchange('delayed_exchange','x-delayed-message',{
    durable: true, // 开启消息持久化
    arguments: {
        'x-delayed-type': 'direct'
    }
})

console.log(`发送消息时间: ${new Date().toLocaleTimeString('zh-CN', {hour12: false})}`)
channel.publish('delayed_exchange','key',Buffer.from('小满延迟模式发送的消息'),{
    headers: {
        'x-delay': 5000 // 5秒后发送
    }
})

// 关闭通道
await channel.close()
// 关闭连接
await connection.close()
// 退出进程
process.exit(0)


