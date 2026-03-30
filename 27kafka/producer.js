// 导入所需的模块
import { Kafka } from 'kafkajs'

// 创建一个 Kafka 实例，配置客户端ID和代理服务器地址（broker）
const kafka = new Kafka({
    clientId: 'xiaoMan', // 客户端ID，用于在 Kafka 中标识此客户端
    brokers: ['localhost:9092'] // 代理服务器地址（broker），这里使用本地地址和默认端口
})

// 创建一个生产者实例
const producer = await kafka.producer()

// 连接到 Kafka 代理服务器
await producer.connect()

// 发送消息到指定主题
await producer.send({
    topic: 'task-1', // 指定要发送消息的主题
    messages: [
        { value: '这是一条测试数据' } // 要发送的消息内容
    ]
})

// 断开与 Kafka 代理服务器的连接
await producer.disconnect()
