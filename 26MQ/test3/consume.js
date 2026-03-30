import amqplib from 'amqplib'
// 连接mq
const connection = await amqplib.connect('amqp://localhost:5672') 
// 创建一个通道
const channel = await connection.createChannel() 

// 创建一个交换机
await channel.assertExchange('delayed_exchange','x-delayed-message',{
    durable: true, // 开启消息持久化
    arguments: {
        'x-delayed-type': 'direct'
    }
})

// 创建一个队列
const { queue } = await channel.assertQueue('task_queue') 

// 绑定队列到交换机  
await channel.bindQueue(queue,'delayed_exchange','key')


// 消费消息 
await channel.consume(queue,(msg) => {
    console.log(`收到消息时间: ${new Date().toLocaleTimeString('zh-CN', {hour12: false})}`)
    console.log(msg.content.toString())
},{noAck: true})