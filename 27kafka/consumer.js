// 导入所需的模块
import { Kafka } from 'kafkajs'

// 创建一个 Kafka 实例，配置客户端ID和代理服务器地址（broker）
const kafka = new Kafka({
    clientId: 'xiaoMan', // 客户端ID，用于在 Kafka 中标识此客户端
    brokers: ['localhost:9092'] // 代理服务器地址（broker），这里使用本地地址和默认端口
})

// 创建一个消费者实例，指定消费者组ID
const consumer = await kafka.consumer({ groupId: 'my-group' })

// 连接到 Kafka 代理服务器
await consumer.connect()

// 订阅指定主题的消息，从头开始消费
await consumer.subscribe({ topic: 'task-1', fromBeginning: true })

// 启动消费者并处理每条消息
await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
        console.log({
            value: message.value.toString(),
        })
    },
})
