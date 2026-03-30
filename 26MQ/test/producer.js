import express from 'express';
import amqplib from 'amqplib'
const connection = await amqplib.connect('amqp://localhost:5672') // 连接rabbitmq
const channel = await connection.createChannel() // 创建channel
const queue = 'task_queue'
const app = express()


app.get('/send',(req,res) => {
    const message = req.query.message
    channel.sendToQueue(queue,Buffer.from(message),{
        persistent: true, // 持久化消息
    })
    res.send("message sent") 
})


app.listen(3000,() => {
    console.log("server is running on port 3000")
})