# RabbitMQ 使用文档

## 什么是 MQ？

MQ（Message Queue，消息队列）是一种应用程序间的通信方法，通过在消息的传输过程中保存消息来实现异步通信。

### 核心概念

- **生产者（Producer）**：发送消息的应用程序
- **消费者（Consumer）**：接收消息的应用程序
- **队列（Queue）**：存储消息的缓冲区
- **交换机（Exchange）**：接收生产者的消息并路由到队列
- **路由键（Routing Key）**：交换机用来决定如何路由消息的规则

### 为什么使用 MQ？

- **解耦**：生产者和消费者不需要直接通信
- **异步**：生产者发送消息后可以立即返回，不需要等待处理结果
- **削峰**：在高并发场景下，通过队列缓冲请求，避免系统崩溃
- **可靠性**：消息持久化，确保消息不丢失
- **扩展性**：可以轻松增加消费者来提高处理能力

---

## RabbitMQ 服务管理

### 启动服务

```bash
# Windows
rabbitmq-server

# Linux/Mac
sudo systemctl start rabbitmq-server
# 或
sudo service rabbitmq-server start

# Docker 方式启动
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:management
```

### 停止服务

```bash
# Windows
rabbitmqctl stop

# Linux/Mac
sudo systemctl stop rabbitmq-server
# 或
sudo service rabbitmq-server stop
```

### 查看服务状态

```bash
rabbitmqctl status
```

### 管理界面

访问 `http://localhost:15672`
- 默认用户名：`guest`
- 默认密码：`guest`

---

## 环境配置

```bash
# 安装依赖
npm install amqplib express
```

```javascript
// 连接 RabbitMQ
const connection = await amqplib.connect('amqp://localhost:5672')
const channel = await connection.createChannel()
```

---

## Test 1: 工作队列模式（Work Queue）

### 📁 目录：`test/`

### 特点
- 简单的点对点消息传递
- 支持消息持久化
- 手动确认消息（ACK）
- 适用于任务分发场景

### 生产者（producer.js）

```javascript
import express from 'express';
import amqplib from 'amqplib'

const connection = await amqplib.connect('amqp://localhost:5672')
const channel = await connection.createChannel()
const queue = 'task_queue'
const app = express()

app.get('/send', (req, res) => {
    const message = req.query.message
    channel.sendToQueue(queue, Buffer.from(message), {
        persistent: true, // 持久化消息
    })
    res.send("message sent") 
})

app.listen(3000, () => {
    console.log("server is running on port 3000")
})
```

### 消费者（consume.js）

```javascript
import amqplib from 'amqplib'

const connection = await amqplib.connect('amqp://localhost:5672')
const channel = await connection.createChannel()
const queue = 'task_queue'

// 声明队列，开启持久化
channel.assertQueue(queue, {durable: true}) 

// 消费消息
channel.consume(queue, (msg) => {
    console.log(msg.content.toString())
    // 确认消息被消费
    channel.ack(msg)
})
```

### 使用场景
- 任务队列
- 异步处理
- 负载均衡

---

## Test 2: 发布订阅模式（Publish/Subscribe）

### 📁 目录：`test2/`

### 特点
- 使用交换机（Exchange）进行消息路由
- 支持多种交换机类型
- 一对多消息分发

### 交换机类型

#### 1. Direct（直连）模式
精确匹配路由键

```javascript
await channel.assertExchange('logs', 'direct', {
    durable: true
})
channel.publish('logs', 'info', Buffer.from('消息内容'))
```

#### 2. Topic（主题）模式
支持通配符匹配
- `*` 匹配一个单词
- `#` 匹配多个单词

```javascript
await channel.assertExchange('topic_exchange', 'topic', {
    durable: true
})
channel.publish('topic_exchange', 'xiaomi.abc', Buffer.from('消息内容'))

// 消费者绑定
await channel.bindQueue(queue, 'topic_exchange', 'xiaomi.#')
```

#### 3. Headers（头部）模式
根据消息头部属性匹配

```javascript
await channel.assertExchange('headers_exchange', 'headers', {
    durable: true
})
channel.publish('headers_exchange', '', Buffer.from('消息内容'), {
    headers: {
        name: 'xiaomimoshi'
    }
})

// 消费者绑定
await channel.bindQueue(queue, 'headers_exchange', '', {
    'x-match': 'all', // 'all' 所有匹配，'any' 任意匹配
    name: 'xiaomimoshi'
})
```

#### 4. Fanout（广播）模式
广播到所有绑定的队列

```javascript
await channel.assertExchange('fanout_exchange', 'fanout', {
    durable: true
})
channel.publish('fanout_exchange', '', Buffer.from('广播消息'))

// 消费者绑定
await channel.bindQueue(queue, 'fanout_exchange', '')
```

### 使用场景
- 日志系统（Direct）
- 消息分类订阅（Topic）
- 广播通知（Fanout）
- 复杂路由规则（Headers）

---

## Test 3: 延迟消息模式（Delayed Message）

### 📁 目录：`test3/`

### 特点
- 支持延迟发送消息
- 需要安装 `rabbitmq_delayed_message_exchange` 插件
- 适用于定时任务场景

### 生产者（producer.js）

```javascript
import amqplib from 'amqplib'

const connection = await amqplib.connect('amqp://localhost:5672')
const channel = await connection.createChannel()

// 创建延迟交换机
await channel.assertExchange('delayed_exchange', 'x-delayed-message', {
    durable: true,
    arguments: {
        'x-delayed-type': 'direct'
    }
})

console.log(`发送消息时间: ${new Date().toLocaleTimeString('zh-CN', {hour12: false})}`)
channel.publish('delayed_exchange', 'key', Buffer.from('延迟消息'), {
    headers: {
        'x-delay': 5000 // 延迟 5 秒
    }
})

await channel.close()
await connection.close()
process.exit(0)
```

### 消费者（consume.js）

```javascript
import amqplib from 'amqplib'

const connection = await amqplib.connect('amqp://localhost:5672')
const channel = await connection.createChannel()

// 创建延迟交换机
await channel.assertExchange('delayed_exchange', 'x-delayed-message', {
    durable: true,
    arguments: {
        'x-delayed-type': 'direct'
    }
})

// 创建队列并绑定
const { queue } = await channel.assertQueue('task_queue')
await channel.bindQueue(queue, 'delayed_exchange', 'key')

// 消费消息
await channel.consume(queue, (msg) => {
    console.log(`收到消息时间: ${new Date().toLocaleTimeString('zh-CN', {hour12: false})}`)
    console.log(msg.content.toString())
}, {noAck: true})
```

### 插件安装

```bash
# 下载插件
wget https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases/download/v3.x.x/rabbitmq_delayed_message_exchange-3.x.x.ez

# 复制到插件目录
cp rabbitmq_delayed_message_exchange-3.x.x.ez /usr/lib/rabbitmq/plugins/

# 启用插件
rabbitmq-plugins enable rabbitmq_delayed_message_exchange
```

### 使用场景
- 定时任务
- 订单超时取消
- 延迟通知
- 定时提醒

---

## 核心概念对比

| 模式 | 交换机类型 | 路由方式 | 适用场景 |
|------|-----------|---------|---------|
| 工作队列 | 无（默认） | 直接队列 | 任务分发 |
| Direct | direct | 精确匹配 | 日志分级 |
| Topic | topic | 通配符匹配 | 消息分类 |
| Headers | headers | 头部匹配 | 复杂路由 |
| Fanout | fanout | 广播 | 全员通知 |
| Delayed | x-delayed-message | 延迟发送 | 定时任务 |

---

## 最佳实践

1. **消息持久化**：生产环境务必开启 `durable: true` 和 `persistent: true`
2. **手动确认**：使用 `channel.ack(msg)` 确保消息被正确处理
3. **错误处理**：添加 try-catch 和连接重试机制
4. **资源管理**：及时关闭 channel 和 connection
5. **监控告警**：监控队列堆积和消费速度

---

## 运行示例

```bash
# 启动消费者
node test/consume.js

# 启动生产者（工作队列模式）
node test/producer.js

# 发布订阅模式
node test2/producer.js
node test2/consume.js

# 延迟消息模式
node test3/producer.js
node test3/consume.js
```

---

## 参考资料

- [RabbitMQ 官方文档](https://www.rabbitmq.com/documentation.html)
- [amqplib NPM 包](https://www.npmjs.com/package/amqplib)
