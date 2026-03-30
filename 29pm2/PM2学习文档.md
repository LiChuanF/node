# PM2 学习文档

## 什么是 PM2？

PM2 是一个带有负载均衡功能的 Node.js 应用进程管理器。它可以让你的 Node.js 应用永久运行，在应用崩溃时自动重启，并且可以在不停机的情况下重新加载应用。

### 主要特性

- **进程管理**：自动重启崩溃的应用
- **负载均衡**：内置负载均衡器（使用 Node.js cluster 模块）
- **日志管理**：自动记录应用日志
- **监控**：实时监控 CPU 和内存使用情况
- **零停机重载**：更新应用时不中断服务
- **启动脚本**：系统重启后自动启动应用

## 安装 PM2

```bash
# 全局安装
npm install pm2 -g

# 或使用 yarn
yarn global add pm2
```

## 基本使用

### 启动应用

```bash
# 启动应用
pm2 start app.js

# 启动应用并命名
pm2 start app.js --name "my-app"

# 启动应用并设置实例数量（集群模式）
pm2 start app.js -i 4

# 启动应用并使用最大 CPU 核心数
pm2 start app.js -i max
```

## 常用命令

### 进程管理命令

```bash
# 启动应用
pm2 start <app_name|id|script>

# 停止应用
pm2 stop <app_name|id|all>

# 重启应用
pm2 restart <app_name|id|all>

# 重新加载应用（零停机）
pm2 reload <app_name|id|all>

# 删除应用
pm2 delete <app_name|id|all>
```

### 查看和监控命令

```bash
# 查看所有运行的应用
pm2 list
# 或
pm2 ls

# 查看应用详细信息
pm2 show <app_name|id>

# 实时监控所有应用
pm2 monit

# 查看应用日志
pm2 logs

# 查看特定应用日志
pm2 logs <app_name|id>

# 清空日志
pm2 flush
```

### 集群模式命令

```bash
# 以集群模式启动（4个实例）
pm2 start app.js -i 4

# 扩展实例数量
pm2 scale <app_name> <number>

# 例如：扩展到 8 个实例
pm2 scale my-app 8
```

### 环境管理命令

```bash
# 保存当前进程列表
pm2 save

# 恢复之前保存的进程列表
pm2 resurrect

# 设置开机自启动
pm2 startup

# 取消开机自启动
pm2 unstartup
```

### 更新和维护命令

```bash
# 更新 PM2
pm2 update

# 重置重启次数
pm2 reset <app_name|id|all>

# 停止并删除所有应用
pm2 kill
```

## 配置文件使用

### 创建配置文件

```bash
# 生成配置文件模板
pm2 ecosystem
# 或
pm2 init
```

### 配置文件示例 (ecosystem.config.js)

```javascript
module.exports = {
  apps: [{
    name: 'my-app',
    script: './app.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['node_modules', 'logs']
  }]
};
```

### 使用配置文件

```bash
# 使用配置文件启动
pm2 start ecosystem.config.js

# 使用生产环境配置
pm2 start ecosystem.config.js --env production

# 停止配置文件中的所有应用
pm2 stop ecosystem.config.js

# 重启配置文件中的所有应用
pm2 restart ecosystem.config.js
```

## 高级功能

### 监听文件变化自动重启

```bash
# 启用 watch 模式
pm2 start app.js --watch

# 忽略特定目录
pm2 start app.js --watch --ignore-watch="node_modules"
```

### 设置内存限制

```bash
# 内存超过限制自动重启
pm2 start app.js --max-memory-restart 300M
```

### 定时重启

```bash
# 每天凌晨 2 点重启
pm2 start app.js --cron-restart="0 2 * * *"
```

## 实用技巧

### 快速查看状态

```bash
# 简洁列表
pm2 ls

# 紧凑格式
pm2 ls --compact
```

### 日志管理

```bash
# 实时查看日志
pm2 logs --lines 100

# 只看错误日志
pm2 logs --err

# 只看输出日志
pm2 logs --out
```

### 性能监控

```bash
# 查看 CPU 和内存使用
pm2 monit

# 查看详细指标
pm2 describe <app_name>
```

## 常见问题

### 如何确保应用开机自启？

```bash
# 1. 设置启动脚本
pm2 startup

# 2. 启动你的应用
pm2 start app.js

# 3. 保存进程列表
pm2 save
```

### 如何实现零停机部署？

```bash
# 使用 reload 而不是 restart
pm2 reload app.js
```

### 如何查看应用崩溃原因？

```bash
# 查看错误日志
pm2 logs <app_name> --err

# 查看应用详情（包括重启次数）
pm2 show <app_name>
```

## 总结

PM2 是 Node.js 应用部署和管理的强大工具，掌握这些命令可以帮助你更好地管理生产环境中的应用。建议在实际项目中使用配置文件来管理复杂的应用配置。
