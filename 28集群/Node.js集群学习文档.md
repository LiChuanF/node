# Node.js 集群（Cluster）学习文档

## 目录
- [什么是集群](#什么是集群)
- [为什么需要集群](#为什么需要集群)
- [集群的工作原理](#集群的工作原理)
- [如何使用集群](#如何使用集群)
- [实际代码示例](#实际代码示例)
- [性能测试与压测](#性能测试与压测)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

---

## 什么是集群

Node.js 集群（Cluster）是 Node.js 内置的一个模块，允许你轻松创建共享服务器端口的子进程。通过集群，你可以充分利用多核 CPU 系统的性能，提高应用程序的并发处理能力。

### 核心概念

- **主进程（Primary/Master）**：负责管理和协调所有工作进程
- **工作进程（Worker）**：实际处理请求的子进程
- **进程间通信（IPC）**：主进程和工作进程之间的通信机制

---

## 为什么需要集群

### Node.js 的单线程特性

Node.js 默认运行在单个进程中，只能使用一个 CPU 核心。这意味着：

- 在多核服务器上，其他 CPU 核心处于闲置状态
- 单个进程的计算能力有限
- 无法充分利用服务器硬件资源

### 集群的优势

1. **充分利用多核 CPU**：为每个 CPU 核心创建一个工作进程
2. **提高并发处理能力**：多个进程可以同时处理请求
3. **提升应用可靠性**：某个工作进程崩溃不会影响其他进程
4. **零停机重启**：可以逐个重启工作进程，实现平滑更新

---

## 集群的工作原理

### 架构图

```
┌─────────────────────────────────────┐
│      主进程 (Primary Process)        │
│   - 管理工作进程                      │
│   - 监听端口                          │
│   - 分发连接                          │
└──────────┬──────────────────────────┘
           │
           ├─────────┬─────────┬─────────┐
           │         │         │         │
      ┌────▼───┐ ┌──▼────┐ ┌──▼────┐ ┌──▼────┐
      │Worker 1│ │Worker2│ │Worker3│ │Worker4│
      │ 处理请求│ │处理请求│ │处理请求│ │处理请求│
      └────────┘ └───────┘ └───────┘ └───────┘
```

### 负载均衡策略

Node.js 集群使用两种负载均衡策略：

1. **轮询（Round-Robin）**：默认策略（除 Windows 外），主进程轮流将连接分配给工作进程
2. **操作系统调度**：由操作系统内核决定哪个进程处理连接

---

## 如何使用集群

### 基本步骤

1. 导入 `cluster` 和 `os` 模块
2. 检查当前进程是主进程还是工作进程
3. 主进程：创建工作进程
4. 工作进程：启动服务器

### 核心 API

```javascript
import cluster from 'node:cluster'
import os from 'node:os'

// 判断是否为主进程
cluster.isPrimary  // 或 cluster.isMaster（已废弃）

// 判断是否为工作进程
cluster.isWorker

// 创建工作进程
cluster.fork()

// 获取 CPU 核心数
os.cpus().length

// 监听工作进程事件
cluster.on('exit', (worker, code, signal) => {
  console.log(`工作进程 ${worker.process.pid} 已退出`)
})
```

---

## 实际代码示例

### 示例 1：集群模式服务器（index.js）

```javascript
import os from 'node:os'
import cluster from 'node:cluster'
import http from 'node:http'

const cpus = os.cpus().length

if (cluster.isPrimary) {
    // 主进程：为每个 CPU 核心创建一个工作进程
    console.log(`主进程 ${process.pid} 正在运行`)
    console.log(`CPU 核心数：${cpus}`)
    
    for (let i = 0; i < cpus; i++) {
        cluster.fork()
    }
    
    // 监听工作进程退出事件
    cluster.on('exit', (worker, code, signal) => {
        console.log(`工作进程 ${worker.process.pid} 已退出`)
        // 可以选择重启工作进程
        console.log('启动新的工作进程...')
        cluster.fork()
    })
} else {
    // 工作进程：创建 HTTP 服务器
    http.createServer((req, res) => {
        res.end('hello world')
    }).listen(3000, () => {
        console.log(`工作进程 ${process.pid} 在端口 3000 上运行`)
    })
}
```

### 示例 2：单进程模式服务器（index2.js）

```javascript
import http from 'node:http'

http.createServer((req, res) => {
    res.end('hello world')
}).listen(6000, () => {
    console.log('server is running on port 6000')
})
```

### 对比说明

| 特性 | 集群模式（index.js） | 单进程模式（index2.js） |
|------|---------------------|----------------------|
| 进程数 | 等于 CPU 核心数 | 1 个 |
| CPU 利用率 | 充分利用所有核心 | 仅使用单核 |
| 并发能力 | 高 | 低 |
| 容错能力 | 单个进程崩溃不影响整体 | 进程崩溃导致服务中断 |

---

## 性能测试与压测

### 使用 loadtest 进行压测

`loadtest` 是一个简单易用的 HTTP 压测工具。

#### 安装

```bash
npm install -g loadtest
```

#### 基本用法

```bash
# 压测集群模式服务器（端口 3000）
loadtest -c 100 -n 10000 http://localhost:3000

# 压测单进程服务器（端口 6000）
loadtest -c 100 -n 10000 http://localhost:6000
```

#### 参数说明

- `-c`：并发连接数（concurrent connections）
- `-n`：总请求数（number of requests）
- `-t`：测试持续时间（秒）
- `-k`：使用 keep-alive
- `--rps`：每秒请求数限制

#### 压测示例

```bash
# 示例 1：100 并发，总共 10000 个请求
loadtest -c 100 -n 10000 http://localhost:3000

# 示例 2：持续 30 秒，200 并发
loadtest -c 200 -t 30 http://localhost:3000

# 示例 3：限制每秒 1000 个请求
loadtest -c 50 --rps 1000 -t 60 http://localhost:3000

# 示例 4：使用 keep-alive 提高性能
loadtest -c 100 -n 10000 -k http://localhost:3000
```

### 性能对比测试

#### 测试步骤

1. 启动集群模式服务器
```bash
node index.js
```

2. 在另一个终端进行压测
```bash
loadtest -c 100 -n 10000 http://localhost:3000
```

3. 启动单进程服务器
```bash
node index2.js
```

4. 压测单进程服务器
```bash
loadtest -c 100 -n 10000 http://localhost:6000
```

#### 预期结果

集群模式通常会显示：
- 更高的 RPS（每秒请求数）
- 更低的平均响应时间
- 更好的并发处理能力

### 压测结果分析

压测完成后，loadtest 会输出类似以下的结果：

```
Requests: 10000
Completed requests: 10000
Total time: 5.2 s
Requests per second: 1923
Mean latency: 51.2 ms
Effective rps: 1923
```

关键指标：
- **Requests per second (RPS)**：每秒处理的请求数，越高越好
- **Mean latency**：平均响应时间，越低越好
- **Percentiles**：响应时间分布，关注 95% 和 99% 的值

---

## 最佳实践

### 1. 工作进程数量

```javascript
// 推荐：根据 CPU 核心数创建工作进程
const numWorkers = os.cpus().length

// 或者：预留一些资源给其他服务
const numWorkers = Math.max(1, os.cpus().length - 1)
```

### 2. 进程崩溃处理

```javascript
if (cluster.isPrimary) {
    cluster.on('exit', (worker, code, signal) => {
        console.log(`工作进程 ${worker.process.pid} 退出`)
        
        // 自动重启
        if (!worker.exitedAfterDisconnect) {
            console.log('工作进程意外退出，正在重启...')
            cluster.fork()
        }
    })
}
```

### 3. 优雅关闭

```javascript
// 在主进程中
process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信号，开始优雅关闭...')
    
    for (const id in cluster.workers) {
        cluster.workers[id].disconnect()
    }
})

// 在工作进程中
process.on('SIGTERM', () => {
    server.close(() => {
        console.log('服务器已关闭')
        process.exit(0)
    })
})
```

### 4. 进程间通信

```javascript
// 主进程发送消息给工作进程
if (cluster.isPrimary) {
    const worker = cluster.fork()
    worker.send({ msg: 'hello from primary' })
}

// 工作进程接收消息
if (cluster.isWorker) {
    process.on('message', (msg) => {
        console.log('收到消息:', msg)
    })
}
```

### 5. 零停机重启

```javascript
// 逐个重启工作进程
function restartWorkers() {
    const workers = Object.values(cluster.workers)
    
    function restartNext(index) {
        if (index >= workers.length) return
        
        const worker = workers[index]
        worker.disconnect()
        
        cluster.once('exit', (exitedWorker) => {
            if (exitedWorker.id === worker.id) {
                cluster.fork()
                setTimeout(() => restartNext(index + 1), 1000)
            }
        })
    }
    
    restartNext(0)
}
```

---

## 常见问题

### Q1: 集群模式下如何共享状态？

**A**: 工作进程之间不共享内存。解决方案：
- 使用 Redis 等外部存储
- 通过主进程进行进程间通信
- 使用共享数据库

### Q2: 什么时候不应该使用集群？

**A**: 以下情况可能不需要集群：
- 应用是 I/O 密集型而非 CPU 密集型
- 服务器只有单核 CPU
- 使用了 PM2 等进程管理工具（它们已经提供了集群功能）

### Q3: 集群模式下如何处理 WebSocket？

**A**: 需要使用 sticky session（粘性会话）确保同一客户端的连接总是路由到同一个工作进程。

### Q4: 集群和多线程有什么区别？

**A**: 
- 集群使用多进程，每个进程有独立的内存空间
- 多线程（Worker Threads）共享内存，适合 CPU 密集型计算
- 集群更适合 Web 服务器场景

### Q5: 如何监控集群性能？

**A**: 可以使用：
- PM2 的监控功能
- Node.js 内置的 `process.memoryUsage()` 和 `process.cpuUsage()`
- 第三方监控工具如 New Relic、Datadog

---

## 总结

Node.js 集群是提升应用性能和可靠性的重要工具。通过合理使用集群：

✅ 充分利用多核 CPU 资源
✅ 提高并发处理能力
✅ 增强应用容错能力
✅ 实现零停机部署

结合 loadtest 等压测工具，可以直观地看到集群带来的性能提升。在生产环境中，建议配合 PM2 等进程管理工具使用，以获得更完善的集群管理功能。

---

## 参考资源

- [Node.js 官方文档 - Cluster](https://nodejs.org/api/cluster.html)
- [loadtest GitHub](https://github.com/alexfernandez/loadtest)
- [PM2 文档](https://pm2.keymetrics.io/)
