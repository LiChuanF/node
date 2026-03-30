import amqplib from 'amqplib'
const connection = await amqplib.connect('amqp://localhost:5672') // 连接rabbitmq
const channel = await connection.createChannel() // 创建channel
const queue = 'task_queue'

// 声明队列  durable队列和交换机的持久化
channel.assertQueue(queue,{durable: true}) 

// 消费消息
channel.consume(queue,(msg) => {
    console.log(msg.content.toString())
    // 确认消息被消费
    channel.ack(msg)
})
// 消费消息

