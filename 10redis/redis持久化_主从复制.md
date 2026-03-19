# Redis 持久化与主从复制

## 目录
- [Redis 持久化](#redis-持久化)
  - [RDB 持久化](#rdb-持久化)
  - [AOF 持久化](#aof-持久化)
  - [混合持久化](#混合持久化)
- [主从复制](#主从复制)
- [哨兵模式](#哨兵模式)

---

## Redis 持久化

Redis 提供了两种主要的持久化方式：RDB（快照）和 AOF（追加文件），以及混合持久化模式。

---

## RDB 持久化

### 什么是 RDB

RDB（Redis Database）是 Redis 的快照持久化方式，它会在指定的时间间隔内生成数据集的时间点快照（point-in-time snapshot）。

### 工作原理

1. Redis 调用 fork() 创建子进程
2. 子进程将数据集写入临时 RDB 文件
3. 写入完成后，用新文件替换旧文件
4. 父进程继续处理客户端请求

### 触发方式

#### 1. 自动触发

在 `redis.conf` 中配置：

```conf
# 格式：save <seconds> <changes>
# 900秒内至少有1个key被修改
save 900 1

# 300秒内至少有10个key被修改
save 300 10

# 60秒内至少有10000个key被修改
save 60 10000

# RDB 文件名
dbfilename dump.rdb

# RDB 文件保存目录
dir ./

# 是否压缩 RDB 文件
rdbcompression yes

# 是否校验 RDB 文件
rdbchecksum yes

# 持久化失败后是否继续提供服务
stop-writes-on-bgsave-error yes
```

#### 2. 手动触发

```bash
# SAVE 命令（阻塞）
# 会阻塞 Redis 服务器进程，直到 RDB 文件创建完成
SAVE

# BGSAVE 命令（非阻塞）
# 在后台异步保存，不阻塞客户端命令
BGSAVE

# 查看最后一次保存时间
LASTSAVE
```

#### 3. 其他触发场景

```bash
# 执行 SHUTDOWN 命令时
SHUTDOWN

# 执行 FLUSHALL 命令时（会生成空的 RDB 文件）
FLUSHALL

# 主从复制时，主节点自动执行 BGSAVE
```

### RDB 优点

- 文件紧凑，适合备份和灾难恢复
- 恢复速度快，适合大数据集
- 性能影响小（fork 子进程处理）
- 文件格式紧凑，占用空间小

### RDB 缺点

- 数据安全性较低，可能丢失最后一次快照后的数据
- fork 子进程时，如果数据集很大，可能导致短暂的服务暂停
- 不适合实时持久化场景

### 使用场景

- 对数据完整性要求不高
- 需要定期备份
- 需要快速恢复大数据集

---

## AOF 持久化

### 什么是 AOF

AOF（Append Only File）持久化记录服务器执行的所有写操作命令，并在服务器启动时重新执行这些命令来还原数据集。

### 工作原理

1. 客户端发送写命令到 Redis
2. Redis 执行命令并将命令追加到 AOF 缓冲区
3. 根据同步策略将缓冲区内容写入 AOF 文件
4. 定期重写 AOF 文件以压缩体积

### 配置

在 `redis.conf` 中配置：

```conf
# 开启 AOF 持久化
appendonly yes

# AOF 文件名
appendfilename "appendonly.aof"

# AOF 文件保存目录
dir ./

# AOF 同步策略
# always: 每个写命令都同步到磁盘（最安全，性能最差）
# everysec: 每秒同步一次（推荐，平衡性能和安全）
# no: 由操作系统决定何时同步（性能最好，安全性最差）
appendfsync everysec

# 重写期间是否同步
no-appendfsync-on-rewrite no

# 自动重写触发条件
# AOF 文件大小超过上次重写后大小的 100%
auto-aof-rewrite-percentage 100

# AOF 文件最小重写大小
auto-aof-rewrite-min-size 64mb

# 加载 AOF 文件时是否忽略最后一条可能不完整的命令
aof-load-truncated yes

# 是否使用 RDB-AOF 混合持久化
aof-use-rdb-preamble yes
```


### AOF 同步策略对比

| 策略 | 说明 | 性能 | 安全性 | 数据丢失 |
|------|------|------|--------|----------|
| always | 每个命令都同步 | 差 | 高 | 几乎不丢失 |
| everysec | 每秒同步一次 | 好 | 较高 | 最多丢失1秒 |
| no | 操作系统决定 | 最好 | 低 | 可能丢失较多 |

### AOF 重写

#### 为什么需要重写

随着时间推移，AOF 文件会越来越大，重写可以：
- 压缩文件体积
- 优化命令序列
- 提高恢复速度

#### 重写原理

```bash
# 原始命令序列
SET key1 value1
SET key1 value2
SET key1 value3
DEL key2
SET key2 value4

# 重写后
SET key1 value3
SET key2 value4
```

#### 手动触发重写

```bash
# 手动触发 AOF 重写
BGREWRITEAOF

# 查看 AOF 重写状态
INFO persistence
```

#### 重写过程

1. Redis 调用 fork() 创建子进程
2. 子进程根据内存数据生成新的 AOF 文件
3. 父进程继续处理命令，并将新命令追加到 AOF 重写缓冲区
4. 子进程完成后，父进程将缓冲区内容追加到新文件
5. 用新文件替换旧文件

### AOF 优点

- 数据安全性高，最多丢失1秒数据（everysec）
- 文件可读，便于分析和修复
- 自动重写机制，控制文件大小
- 即使文件损坏，也可以使用 redis-check-aof 工具修复

### AOF 缺点

- 文件体积通常比 RDB 大
- 恢复速度比 RDB 慢
- 性能开销比 RDB 大
- 可能存在 bug（历史上出现过）

### 使用场景

- 对数据完整性要求高
- 可以容忍较慢的恢复速度
- 需要可读的持久化文件

---

## 混合持久化

### 什么是混合持久化

Redis 4.0 引入的混合持久化结合了 RDB 和 AOF 的优点。

### 工作原理

在 AOF 重写时：
1. 将内存数据以 RDB 格式写入 AOF 文件开头
2. 将重写期间的增量命令以 AOF 格式追加到文件末尾

### 配置

```conf
# 开启混合持久化（Redis 4.0+）
aof-use-rdb-preamble yes
```

### 文件结构

```
[RDB 格式的数据快照] + [AOF 格式的增量命令]
```

### 优点

- 恢复速度快（RDB 部分）
- 数据安全性高（AOF 部分）
- 文件体积相对较小

### 缺点

- 文件不再是纯 AOF 格式，可读性降低
- 需要 Redis 4.0+ 版本

---

## 持久化策略选择

### 对比表

| 特性 | RDB | AOF | 混合持久化 |
|------|-----|-----|------------|
| 文件大小 | 小 | 大 | 中 |
| 恢复速度 | 快 | 慢 | 较快 |
| 数据安全性 | 低 | 高 | 高 |
| 性能影响 | 小 | 中 | 中 |
| 可读性 | 否 | 是 | 部分 |

### 推荐方案

#### 1. 高可用场景（推荐）

```conf
# 同时开启 RDB 和 AOF
save 900 1
save 300 10
save 60 10000

appendonly yes
appendfsync everysec
aof-use-rdb-preamble yes
```

#### 2. 性能优先场景

```conf
# 只使用 RDB
save 900 1
save 300 10
appendonly no
```

#### 3. 数据安全优先场景

```conf
# 只使用 AOF
save ""
appendonly yes
appendfsync always
```

### 数据恢复优先级

Redis 启动时的加载顺序：
1. 如果 AOF 开启，优先加载 AOF 文件
2. 如果 AOF 关闭，加载 RDB 文件
3. 如果都不存在，启动空实例

---

## 主从复制

### 什么是主从复制

主从复制（Replication）是 Redis 实现高可用的基础，允许从服务器（slave）复制主服务器（master）的数据。

### 主从复制的作用

- 数据冗余：实现数据的热备份
- 故障恢复：主节点故障时，从节点可以提供服务
- 负载均衡：读写分离，主节点写，从节点读
- 高可用基础：是哨兵和集群的基础

### 复制原理

#### 1. 全量复制（首次同步）

```
1. 从节点发送 PSYNC 命令到主节点
2. 主节点执行 BGSAVE 生成 RDB 文件
3. 主节点将 RDB 文件发送给从节点
4. 从节点清空旧数据，加载 RDB 文件
5. 主节点将缓冲区的写命令发送给从节点
```

#### 2. 增量复制（断线重连）

```
1. 从节点记录复制偏移量
2. 断线重连后，发送 PSYNC 命令和偏移量
3. 主节点检查偏移量是否在复制积压缓冲区内
4. 如果在，发送缺失的命令（增量复制）
5. 如果不在，执行全量复制
```

#### 3. 命令传播（正常同步）

```
主节点执行写命令后，异步发送给所有从节点
```

### 配置主从复制

#### 方式一：配置文件（永久）

在从节点的 `redis.conf` 中配置：

```conf
# 指定主节点的 IP 和端口
replicaof 127.0.0.1 6379

# 如果主节点设置了密码
masterauth <master-password>

# 从节点是否只读（推荐）
replica-read-only yes

# 复制超时时间
repl-timeout 60

# 是否使用无磁盘复制
repl-diskless-sync no

# 无磁盘复制延迟时间
repl-diskless-sync-delay 5

# 复制积压缓冲区大小（用于增量复制）
repl-backlog-size 1mb

# 复制积压缓冲区超时时间
repl-backlog-ttl 3600
```

#### 方式二：命令行（临时）

```bash
# 在从节点执行
REPLICAOF 127.0.0.1 6379

# 如果主节点有密码
CONFIG SET masterauth <password>

# 取消复制，变为主节点
REPLICAOF NO ONE
```

#### 方式三：启动参数

```bash
redis-server --replicaof 127.0.0.1 6379
```

### 搭建主从复制示例

#### 1. 准备配置文件

```bash
# 主节点配置 redis-master.conf
port 6379
daemonize yes
pidfile /var/run/redis-6379.pid
logfile "6379.log"
dbfilename dump-6379.rdb
dir ./

# 从节点1配置 redis-slave1.conf
port 6380
daemonize yes
pidfile /var/run/redis-6380.pid
logfile "6380.log"
dbfilename dump-6380.rdb
dir ./
replicaof 127.0.0.1 6379
replica-read-only yes

# 从节点2配置 redis-slave2.conf
port 6381
daemonize yes
pidfile /var/run/redis-6381.pid
logfile "6381.log"
dbfilename dump-6381.rdb
dir ./
replicaof 127.0.0.1 6379
replica-read-only yes
```

#### 2. 启动服务

```bash
# 启动主节点
redis-server redis-master.conf

# 启动从节点
redis-server redis-slave1.conf
redis-server redis-slave2.conf
```

#### 3. 验证主从关系

```bash
# 在主节点查看
redis-cli -p 6379
INFO replication

# 输出示例
role:master
connected_slaves:2
slave0:ip=127.0.0.1,port=6380,state=online,offset=123,lag=0
slave1:ip=127.0.0.1,port=6381,state=online,offset=123,lag=0

# 在从节点查看
redis-cli -p 6380
INFO replication

# 输出示例
role:slave
master_host:127.0.0.1
master_port:6379
master_link_status:up
```

#### 4. 测试数据同步

```bash
# 在主节点写入数据
redis-cli -p 6379
SET key1 "hello"
SET key2 "world"

# 在从节点读取数据
redis-cli -p 6380
GET key1  # 返回 "hello"
GET key2  # 返回 "world"

# 尝试在从节点写入（会失败）
redis-cli -p 6380
SET key3 "test"  # 错误：READONLY You can't write against a read only replica
```

### 级联复制

从节点也可以有自己的从节点，形成级联结构：

```
Master (6379)
  ├── Slave1 (6380)
  │     └── Slave3 (6382)
  └── Slave2 (6381)
```

配置 Slave3：

```conf
port 6382
replicaof 127.0.0.1 6380
```

### 主从切换

#### 手动切换

```bash
# 1. 在从节点执行，提升为主节点
redis-cli -p 6380
REPLICAOF NO ONE

# 2. 其他从节点指向新主节点
redis-cli -p 6381
REPLICAOF 127.0.0.1 6380
```

### 常用命令

```bash
# 查看复制信息
INFO replication

# 查看主从延迟
INFO replication | grep master_repl_offset
INFO replication | grep slave_repl_offset

# 手动触发全量复制
REPLICAOF 127.0.0.1 6379

# 取消复制
REPLICAOF NO ONE

# 查看从节点列表（主节点执行）
CLIENT LIST
```

### Node.js 读写分离示例

```javascript
const redis = require('redis');

// 主节点客户端（写操作）
const masterClient = redis.createClient({
  host: '127.0.0.1',
  port: 6379
});

// 从节点客户端（读操作）
const slaveClients = [
  redis.createClient({ host: '127.0.0.1', port: 6380 }),
  redis.createClient({ host: '127.0.0.1', port: 6381 })
];

let currentSlaveIndex = 0;

// 写操作
function writeData(key, value) {
  return new Promise((resolve, reject) => {
    masterClient.set(key, value, (err, reply) => {
      if (err) reject(err);
      else resolve(reply);
    });
  });
}

// 读操作（轮询负载均衡）
function readData(key) {
  const client = slaveClients[currentSlaveIndex];
  currentSlaveIndex = (currentSlaveIndex + 1) % slaveClients.length;
  
  return new Promise((resolve, reject) => {
    client.get(key, (err, reply) => {
      if (err) reject(err);
      else resolve(reply);
    });
  });
}

// 使用示例
async function example() {
  await writeData('user:1000', 'John');
  const value = await readData('user:1000');
  console.log(value); // John
}

example();
```

### 主从复制的问题

#### 1. 复制延迟

- 主从之间存在网络延迟
- 从节点可能读到旧数据
- 解决：监控 `master_repl_offset` 和 `slave_repl_offset`

#### 2. 主节点故障

- 需要手动切换主从
- 可能导致数据丢失
- 解决：使用哨兵模式自动故障转移

#### 3. 从节点故障

- 不影响主节点和其他从节点
- 重启后自动重新同步

#### 4. 全量复制开销

- 主节点需要 fork 子进程
- 网络传输 RDB 文件
- 从节点清空数据并加载
- 解决：使用无磁盘复制、优化网络

---

## 哨兵模式

### 什么是哨兵

Redis Sentinel（哨兵）是 Redis 的高可用解决方案，提供监控、通知和自动故障转移功能。

### 哨兵的功能

1. 监控：检查主从节点是否正常运行
2. 通知：通过 API 通知管理员或应用程序
3. 自动故障转移：主节点故障时，自动提升从节点为主节点
4. 配置提供者：客户端通过哨兵获取当前主节点地址

### 哨兵架构

```
Sentinel1    Sentinel2    Sentinel3
    \           |           /
     \          |          /
      \         |         /
       \        |        /
        Master (6379)
          /         \
         /           \
    Slave1(6380)  Slave2(6381)
```

### 配置哨兵

#### 1. 哨兵配置文件 sentinel.conf

```conf
# 哨兵端口
port 26379

# 后台运行
daemonize yes

# 日志文件
logfile "sentinel-26379.log"

# 工作目录
dir ./

# 监控主节点
# sentinel monitor <master-name> <ip> <port> <quorum>
# quorum: 判定主节点下线需要的哨兵数量
sentinel monitor mymaster 127.0.0.1 6379 2

# 主节点密码
sentinel auth-pass mymaster <password>

# 主节点多久无响应视为下线（毫秒）
sentinel down-after-milliseconds mymaster 5000

# 故障转移超时时间
sentinel failover-timeout mymaster 60000

# 同时向新主节点同步的从节点数量
sentinel parallel-syncs mymaster 1

# 通知脚本
sentinel notification-script mymaster /path/to/notify.sh

# 故障转移脚本
sentinel client-reconfig-script mymaster /path/to/reconfig.sh
```

#### 2. 启动多个哨兵

```bash
# 哨兵1
redis-sentinel sentinel-26379.conf

# 哨兵2
redis-sentinel sentinel-26380.conf

# 哨兵3
redis-sentinel sentinel-26381.conf
```

### 故障转移过程

1. 主观下线（SDOWN）：单个哨兵认为主节点下线
2. 客观下线（ODOWN）：达到 quorum 数量的哨兵认为主节点下线
3. 选举领导者：哨兵之间选举出领导者执行故障转移
4. 选择新主节点：根据优先级、复制偏移量、运行 ID 选择
5. 更新配置：通知其他从节点和客户端

### 哨兵命令

```bash
# 连接哨兵
redis-cli -p 26379

# 查看监控的主节点
SENTINEL masters

# 查看指定主节点信息
SENTINEL master mymaster

# 查看从节点
SENTINEL slaves mymaster

# 查看其他哨兵
SENTINEL sentinels mymaster

# 获取主节点地址
SENTINEL get-master-addr-by-name mymaster

# 手动故障转移
SENTINEL failover mymaster

# 检查主节点状态
SENTINEL ckquorum mymaster

# 重置主节点
SENTINEL reset mymaster
```

### Node.js 使用哨兵

```javascript
const redis = require('redis');

// 使用 ioredis 库（推荐）
const Redis = require('ioredis');

const client = new Redis({
  sentinels: [
    { host: '127.0.0.1', port: 26379 },
    { host: '127.0.0.1', port: 26380 },
    { host: '127.0.0.1', port: 26381 }
  ],
  name: 'mymaster',
  password: '<password>',
  // 自动重连
  retryStrategy: (times) => {
    return Math.min(times * 50, 2000);
  }
});

client.on('connect', () => {
  console.log('已连接到 Redis');
});

client.on('error', (err) => {
  console.error('Redis 错误:', err);
});

// 使用
client.set('key', 'value');
client.get('key', (err, result) => {
  console.log(result);
});
```

---

## 最佳实践

### 1. 持久化配置

```conf
# 生产环境推荐配置
save 900 1
save 300 10
save 60 10000

appendonly yes
appendfsync everysec
aof-use-rdb-preamble yes

auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
```

### 2. 主从复制配置

```conf
# 从节点配置
replicaof <master-ip> <master-port>
replica-read-only yes
repl-backlog-size 10mb
repl-timeout 60
```

### 3. 监控指标

```bash
# 持久化监控
INFO persistence

# 复制监控
INFO replication

# 关键指标
- rdb_last_save_time: 最后一次 RDB 保存时间
- aof_current_size: AOF 文件当前大小
- master_repl_offset: 主节点复制偏移量
- slave_repl_offset: 从节点复制偏移量
- master_link_status: 主从连接状态
```

### 4. 备份策略

```bash
# 定期备份 RDB 文件
0 2 * * * cp /var/redis/dump.rdb /backup/redis/dump-$(date +\%Y\%m\%d).rdb

# 定期备份 AOF 文件
0 3 * * * cp /var/redis/appendonly.aof /backup/redis/aof-$(date +\%Y\%m\%d).aof

# 保留最近7天的备份
find /backup/redis -name "dump-*.rdb" -mtime +7 -delete
```

### 5. 故障恢复

```bash
# 1. 停止 Redis
redis-cli SHUTDOWN

# 2. 恢复 RDB 文件
cp /backup/redis/dump-20240311.rdb /var/redis/dump.rdb

# 3. 或恢复 AOF 文件
cp /backup/redis/aof-20240311.aof /var/redis/appendonly.aof

# 4. 启动 Redis
redis-server /etc/redis/redis.conf

# 5. 验证数据
redis-cli
DBSIZE
```

---

## 总结

### 持久化选择

- RDB：适合备份和快速恢复
- AOF：适合数据安全要求高的场景
- 混合持久化：推荐使用，兼顾性能和安全

### 主从复制

- 实现数据冗余和读写分离
- 是高可用的基础
- 需要配合哨兵实现自动故障转移

### 哨兵模式

- 自动监控和故障转移
- 至少部署3个哨兵节点
- 生产环境必备

### 进阶学习

- Redis Cluster（集群模式）
- Redis 性能优化
- Redis 安全加固
- Redis 监控和运维
