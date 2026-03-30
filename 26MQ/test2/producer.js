import express from 'express';
import amqplib from 'amqplib'

/**
 * MQ  发布订阅
 */


// 连接mq
const connection = await amqplib.connect('amqp://localhost:5672') // 连接rabbitmq
// 创建一个通道
const channel = await connection.createChannel() // 创建channel

//声明一个交换机
/**
 * @param {String} exchange 交换机的名称
 * @param {String} type "direct" | "topic" | "headers" | "fanout" | "match" | 使用广播模式
 * @param {Object} options {durable: true} //开启消息持久化
 */

// 发布订阅的模式分为四种
// Direct（直连）模式：把消息放到交换机指定key的队列里面。
// Topic（主题）模式： 把消息放到交换机指定key的队列里面，额外增加使用"*"匹配一个单词或使用"#"匹配多个单词
// Headers（头部）模式：把消息放到交换机头部属性去匹配队列
// Fanout（广播）模式：把消息放入交换机所有的队列，实现广播
// 创建一个交换机，类型为direct模式,如果你没有创建过就会创建，如果你创建过了就不会再创建了

/**
 * 发布订阅的模式
 */

/**
 * direct模式
 */
// await channel.assertExchange('logs','direct',{
//     durable: true // 开启消息持久化
// })
// channel.publish('logs','info',Buffer.from('小满direct模式发送的消息'))

/**
 * topic模式
 */
// await channel.assertExchange('topic_exchange','topic',{
//     durable: true // 开启消息持久化
// })
/**
 * @param {String} exchange 交换机的名称
 * @param {String} routingKey 路由键
 * @param {Buffer} content 消息内容
 */

// channel.publish('topic_exchange','xiaomi.abc',Buffer.from('小满topic模式发送的消息'))


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

// channel.publish('fanout_exchange','',Buffer.from('小满headers模式发送的消息'),{
//     headers: {
//         name: 'xiaomimoshi'
//     }
// })

channel.publish('fanout_exchange','',Buffer.from('小满Fanout模式发送的消息'))

// 关闭通道
await channel.close()
// 关闭连接
await connection.close()
// 退出进程
process.exit(0)


