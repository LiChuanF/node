import amqplib from 'amqplib'
// 连接mq
const connection = await amqplib.connect('amqp://localhost:5672') 
// 创建一个通道
const channel = await connection.createChannel() 

/**
 * direct模式
 */
// 声明一个交换机
// await channel.assertExchange('x','direct',{
//     durable: true // 开启消息持久化
// })


/**
 * topic模式
 */
// await channel.assertExchange('topic_exchange','topic',{
//     durable: true // 开启消息持久化
// })

/**
 * headers模式
 */

// await channel.assertExchange('headers_exchange','headers',{
//     durable: true // 开启消息持久化
// })


/**
 * Fanout模式
 */

// 声明一个交换机
await channel.assertExchange('fanout_exchange','fanout',{
    durable: true // 开启消息持久化
})



// 创建一个队列
const { queue } = await channel.assertQueue('task_queue',{durable: true}) 

// 绑定队列到交换机
/**
 * @param {string} queue 队列名称
 * @param {string} exchange 交换机的名称
 * @param {string} routingKey 路由键
 */
// await channel.bindQueue(queue,'topic_exchange','xiaomi.#')

// await channel.bindQueue(queue,'headers_exchange','',{
//     'x-match': 'all', // 'all' 表示所有headers都要匹配，'any' 表示匹配任意一个
//     name: 'xiaomimoshi'
// })

// 绑定队列到交换机
await channel.bindQueue(queue,'fanout_exchange','',{
    'x-match': 'all', // 'all' 表示所有headers都要匹配，'any' 表示匹配任意一个
    name: 'xiaomimoshi'
})

// 消费消息 
await channel.consume(queue,(msg) => {
    console.log(msg.content.toString())
    // 确认消息被消费
    channel.ack(msg)
})