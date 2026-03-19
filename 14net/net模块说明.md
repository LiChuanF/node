## net 模块学习记录

### 基本概念

- **模块作用**：`net` 是 Node.js 提供的 TCP/IPC 网络通信模块，用来创建 TCP 服务器和客户端，属于比较底层的网络 API。
- **常见场景**：
  - 自定义协议的 TCP 服务（游戏服、网关、自定义 RPC 等）
  - 做 HTTP 以外的长连接服务
  - 进程间通信（在某些平台上使用 UNIX socket/命名管道）

### 创建 TCP 服务器

- **基本用法**：

```js
import net from 'node:net'

const server = net.createServer(socket => {
  // 新客户端连接时触发
})

server.listen(3000, () => {
  console.log('Server is running on port 3000')
})
```

- **关键点**：
  - `net.createServer(callback)`：`callback` 的参数是一个 `socket`，表示与当前客户端的连接。
  - `server.listen(port, host?, callback?)`：开始监听端口；`host` 默认 `0.0.0.0`（所有网卡）。

### socket（表示一次客户端连接）

你在 `server.js` 里使用了：

```js
const server = net.createServer(socket => {
  socket.write('Hello from server')
  socket.on('data', data => {
    console.log('Received data from client:', data.toString())
  })
  socket.on('error', err => {
    console.error(err)
  })
  socket.on('close', () => {
    console.log('Client disconnected')
  })
})
```

- **常用方法**：
  - `socket.write(data)`：向客户端发送数据（`Buffer` 或字符串）。
  - `socket.end([data])`：发送完最后一段数据后关闭连接。

- **常用事件**：
  - `'data'`：收到客户端发来的数据（`Buffer` 类型）。
  - `'error'`：连接出错。
  - `'close'`：连接完全关闭。
  - `'end'`：对端调用 `end()` 结束连接时触发。

### 创建 TCP 客户端（简单示例）

```js
import net from 'node:net'

const client = net.createConnection({ port: 3000 }, () => {
  console.log('connected to server')
  client.write('Hello from client')
})

client.on('data', data => {
  console.log('Received from server:', data.toString())
})

client.on('end', () => {
  console.log('Disconnected from server')
})
```

- **关键点**：
  - `net.createConnection(options, callback)` / `net.connect(...)`：创建客户端并连接服务器。
  - `options` 里常用 `port`、`host`（默认 `localhost`）。

### 与 HTTP 的区别（简单理解）

- **HTTP**：
  - 基于 TCP 之上的应用层协议。
  - 有请求/响应格式（方法、URL、头、body 等）。
  - Node 中平时用 `http`/`https` 模块或框架（如 Express）。

- **net（纯 TCP）**：
  - 只负责“收发字节流”，没有约定数据格式。
  - 协议完全由自己设计（比如用 JSON、定长包、分隔符等）。
  - 更灵活也更底层，适合自定义协议或高性能长连接应用。

### 小结

- **记住几件事**：
  - `net.createServer` + `server.listen`：搭建 TCP 服务器。
  - 回调里的 `socket` 就是与某个客户端的连接，读写都靠它。
  - 主要事件：`'data'`、`'error'`、`'close'`、`'end'`。
  - 客户端用 `net.createConnection` 连接服务端。

