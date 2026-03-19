# Redis 学习文档

## 目录
- [Redis 简介](#redis-简介)
- [基本使用](#基本使用)
- [发布订阅模式](#发布订阅模式)
- [事务](#事务)

---

## Redis 简介

Redis（Remote Dictionary Server）是一个开源的内存数据结构存储系统，可以用作数据库、缓存和消息代理。

### 特点
- 基于内存，读写速度极快
- 支持多种数据结构（字符串、哈希、列表、集合、有序集合等）
- 支持数据持久化
- 支持主从复制
- 支持发布订阅模式
- 支持事务

---

## 基本使用

### 安装与启动

```bash
# 启动 Redis 服务器
redis-server

# 启动 Redis 客户端
redis-cli
```

### 基本数据类型操作

#### 1. 字符串（String）

```bash
# 设置键值
SET key value
SET name "张三"

# 获取值
GET key
GET name

# 设置带过期时间的键值（秒）
SETEX key seconds value
SETEX session 3600 "user123"

# 批量设置
MSET key1 value1 key2 value2
MSET name "李四" age "25"

# 批量获取
MGET key1 key2
MGET name age

# 自增/自减
INCR counter
DECR counter
INCRBY counter 5
DECRBY counter 3
```

#### 2. 哈希（Hash）

```bash
# 设置哈希字段
HSET user:1 name "王五"
HSET user:1 age 30

# 批量设置
HMSET user:2 name "赵六" age 28 city "北京"

# 获取哈希字段
HGET user:1 name

# 获取所有字段
HGETALL user:1

# 获取多个字段
HMGET user:1 name age

# 删除字段
HDEL user:1 age

# 判断字段是否存在
HEXISTS user:1 name
```

#### 3. 列表（List）

```bash
# 从左侧插入
LPUSH list1 "元素1"
LPUSH list1 "元素2"

# 从右侧插入
RPUSH list1 "元素3"

# 获取列表范围
LRANGE list1 0 -1

# 从左侧弹出
LPOP list1

# 从右侧弹出
RPOP list1

# 获取列表长度
LLEN list1

# 获取指定索引元素
LINDEX list1 0
```

#### 4. 集合（Set）

```bash
# 添加成员
SADD myset "成员1"
SADD myset "成员2" "成员3"

# 获取所有成员
SMEMBERS myset

# 判断成员是否存在
SISMEMBER myset "成员1"

# 删除成员
SREM myset "成员1"

# 获取集合大小
SCARD myset

# 集合运算
SINTER set1 set2    # 交集
SUNION set1 set2    # 并集
SDIFF set1 set2     # 差集
```

#### 5. 有序集合（Sorted Set）

```bash
# 添加成员（带分数）
ZADD leaderboard 100 "玩家1"
ZADD leaderboard 200 "玩家2"
ZADD leaderboard 150 "玩家3"

# 获取排名范围（按分数升序）
ZRANGE leaderboard 0 -1

# 获取排名范围（带分数）
ZRANGE leaderboard 0 -1 WITHSCORES

# 获取排名范围（按分数降序）
ZREVRANGE leaderboard 0 -1

# 获取成员分数
ZSCORE leaderboard "玩家1"

# 获取成员排名
ZRANK leaderboard "玩家1"

# 增加成员分数
ZINCRBY leaderboard 50 "玩家1"
```

### 通用命令

```bash
# 查看所有键
KEYS *

# 查看匹配模式的键
KEYS user:*

# 检查键是否存在
EXISTS key

# 删除键
DEL key

# 设置过期时间（秒）
EXPIRE key 60

# 查看剩余生存时间
TTL key

# 查看键的类型
TYPE key

# 重命名键
RENAME oldkey newkey
```

---

## 发布订阅模式

Redis 的发布订阅（Pub/Sub）是一种消息通信模式，发送者（发布者）发送消息，订阅者接收消息。

### 基本概念

- **发布者（Publisher）**：发送消息的客户端
- **订阅者（Subscriber）**：接收消息的客户端
- **频道（Channel）**：消息传递的通道

### 基本命令

```bash
# 订阅频道
SUBSCRIBE channel1 channel2

# 订阅匹配模式的频道
PSUBSCRIBE news:*

# 发布消息
PUBLISH channel1 "这是一条消息"

# 取消订阅
UNSUBSCRIBE channel1

# 取消模式订阅
PUNSUBSCRIBE news:*

# 查看订阅信息
PUBSUB CHANNELS          # 列出所有活跃频道
PUBSUB NUMSUB channel1   # 查看频道订阅数
PUBSUB NUMPAT            # 查看模式订阅数
```

### Node.js 示例

#### 订阅者代码

```javascript
const redis = require('redis');

// 创建订阅客户端
const subscriber = redis.createClient();

subscriber.on('connect', () => {
  console.log('订阅者已连接到 Redis');
});

// 订阅频道
subscriber.subscribe('news', 'sports');

// 监听消息
subscriber.on('message', (channel, message) => {
  console.log(`收到来自频道 [${channel}] 的消息: ${message}`);
});

// 监听订阅事件
subscriber.on('subscribe', (channel, count) => {
  console.log(`已订阅频道: ${channel}，当前订阅数: ${count}`);
});
```

#### 发布者代码

```javascript
const redis = require('redis');

// 创建发布客户端
const publisher = redis.createClient();

publisher.on('connect', () => {
  console.log('发布者已连接到 Redis');
  
  // 发布消息
  publisher.publish('news', '今日头条新闻');
  publisher.publish('sports', '足球比赛结果');
  
  setTimeout(() => {
    publisher.publish('news', '财经快讯');
  }, 2000);
});
```

### 使用场景

- 实时消息推送
- 聊天室系统
- 实时通知系统
- 事件驱动架构

### 注意事项

- 订阅者在订阅期间不能执行其他 Redis 命令
- 消息不会持久化，如果订阅者离线，消息会丢失
- 发布的消息是即时的，不会存储历史消息

---

## 事务

Redis 事务允许一组命令在单个步骤中执行，事务中的所有命令都会按顺序执行，不会被其他客户端的命令打断。

### 基本概念

Redis 事务的三个阶段：
1. **开始事务**：使用 `MULTI` 命令
2. **命令入队**：将多个命令加入队列
3. **执行事务**：使用 `EXEC` 命令执行所有命令

### 基本命令

```bash
# 开始事务
MULTI

# 命令入队（这些命令不会立即执行）
SET account:1 100
SET account:2 200
INCR counter

# 执行事务
EXEC

# 取消事务
DISCARD
```

### 完整示例

```bash
# 转账示例
MULTI
DECRBY account:1 50    # 账户1减少50
INCRBY account:2 50    # 账户2增加50
EXEC
```

### WATCH 命令（乐观锁）

`WATCH` 命令用于监视一个或多个键，如果在事务执行前这些键被其他命令修改，事务将被打断。

```bash
# 监视键
WATCH account:1

# 获取当前值
GET account:1

# 开始事务
MULTI
SET account:1 150
EXEC

# 如果 account:1 在 WATCH 后被修改，EXEC 返回 nil
```

### Node.js 示例

```javascript
const redis = require('redis');
const client = redis.createClient();

client.on('connect', () => {
  console.log('已连接到 Redis');
  
  // 使用事务
  const multi = client.multi();
  
  multi.set('key1', 'value1');
  multi.set('key2', 'value2');
  multi.incr('counter');
  multi.get('counter');
  
  multi.exec((err, replies) => {
    if (err) {
      console.error('事务执行失败:', err);
    } else {
      console.log('事务执行结果:', replies);
      // 输出: [OK, OK, 1, '1']
    }
    client.quit();
  });
});

// 使用 WATCH 实现乐观锁
function transferMoney(fromAccount, toAccount, amount) {
  client.watch(fromAccount, (err) => {
    if (err) throw err;
    
    client.get(fromAccount, (err, balance) => {
      if (err) throw err;
      
      balance = parseInt(balance);
      
      if (balance < amount) {
        client.unwatch();
        console.log('余额不足');
        return;
      }
      
      const multi = client.multi();
      multi.decrby(fromAccount, amount);
      multi.incrby(toAccount, amount);
      
      multi.exec((err, replies) => {
        if (err) throw err;
        
        if (replies === null) {
          console.log('事务失败，键被修改，请重试');
        } else {
          console.log('转账成功');
        }
      });
    });
  });
}
```

### 事务特性

#### ACID 特性对比

- **原子性（Atomicity）**：部分支持
  - 命令入队时的错误会导致整个事务不执行
  - 执行时的错误不会回滚已执行的命令
  
- **一致性（Consistency）**：支持
  - Redis 会保证数据的一致性
  
- **隔离性（Isolation）**：支持
  - 事务中的命令串行执行，不会被其他命令打断
  
- **持久性（Durability）**：取决于持久化配置
  - 如果开启了 AOF 或 RDB，可以保证持久性

### 错误处理

#### 1. 命令入队错误（语法错误）

```bash
MULTI
SET key1 value1
SET key2          # 语法错误
SET key3 value3
EXEC              # 整个事务不会执行
```

#### 2. 命令执行错误（运行时错误）

```bash
MULTI
SET key1 "abc"
INCR key1         # 运行时错误（对字符串执行自增）
SET key2 "value2"
EXEC              # key2 仍然会被设置，不会回滚
```

### 使用场景

- 需要原子性操作的场景（如转账）
- 批量操作以提高性能
- 配合 WATCH 实现乐观锁

### 注意事项

- Redis 事务不支持回滚
- 事务中的命令在 EXEC 之前不会执行
- WATCH 只能在 MULTI 之前使用
- 事务执行期间，其他客户端的命令不会插入

---

## 最佳实践

### 1. 键命名规范

```bash
# 使用冒号分隔，便于管理
user:1000:profile
user:1000:sessions
order:2024:03:11
```

### 2. 设置合理的过期时间

```bash
# 避免内存溢出
SETEX cache:user:1000 3600 "user data"
```

### 3. 使用连接池

```javascript
// Node.js 使用连接池
const redis = require('redis');
const { promisify } = require('util');

const client = redis.createClient({
  host: 'localhost',
  port: 6379,
  retry_strategy: (options) => {
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('重试超时');
    }
    return Math.min(options.attempt * 100, 3000);
  }
});
```

### 4. 监控与性能优化

```bash
# 查看 Redis 信息
INFO

# 查看慢查询日志
SLOWLOG GET 10

# 监控实时命令
MONITOR
```

---

## 总结

Redis 是一个功能强大的内存数据库，掌握其基本使用、发布订阅模式和事务机制，可以帮助我们构建高性能的应用系统。

### 关键要点

- **基本使用**：熟练掌握各种数据类型的操作
- **发布订阅**：适用于实时消息推送场景，但消息不持久化
- **事务**：提供基本的原子性操作，配合 WATCH 实现乐观锁

### 进阶学习方向

- Redis 持久化（RDB、AOF）
- Redis 集群与高可用
- Redis 性能优化
- Redis 安全配置
