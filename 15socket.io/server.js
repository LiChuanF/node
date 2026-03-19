import http from 'http'
import express from 'express'
import path from 'node:path'

import { Server } from 'socket.io'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

/**
 * 跨域处理
 */
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', '*')
    res.setHeader('Access-Control-Allow-Methods', '*')
    // 预检请求
    if (req.method === 'OPTIONS') {
        res.statusCode = 204
        return res.end()
    }
    // 非预检请求，继续处理
    next()
})

// 静态资源处理
app.use(express.static(__dirname))

// 首页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})


const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    } //允许跨域
})


const groupList = {}
/**
 * [{1008:[{name,room,id}]}]
 */
io.on('connection', socket => {
    //加入房间
    socket.on('join', ({ name, room }) => {
        socket.join(room)
        if (groupList[room]) {
            groupList[room].push({ name, room, id: socket.id })
        } else {
            groupList[room] = [{ name, room, id: socket.id }]
        }
        socket.emit('message', { user: '管理员', text: `${name}进入了房间` })
        socket.emit('groupList', groupList)
        socket.broadcast.emit('groupList', groupList)
    })
    //发送消息
    socket.on('message', ({ text, room, user }) => {
        socket.broadcast.to(room).emit('message', {
            text,
            user
        })
    })
    //断开链接内置事件
    socket.on('disconnect', () => {
        Object.keys(groupList).forEach(key => {
            let leval = groupList[key].find(item => item.id === socket.id)
            if (leval) {
                socket.broadcast.to(leval.room).emit('message', { user: '管理员', text: `${leval.name}离开了房间` })
            }
            groupList[key] = groupList[key].filter(item => item.id !== socket.id)
        })
        socket.broadcast.emit('groupList', groupList)
    })
})

server.listen(3030, () => {
    console.log('listening on *:3030')
})
