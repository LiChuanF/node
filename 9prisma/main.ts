// ============================================================
// 1. 必要的导入
// ============================================================
import 'dotenv/config' // 加载 .env 文件中的环境变量
import 'reflect-metadata' // 【重要】TypeScript 装饰器的元数据支持，IoC 容器需要它来读取类型信息

import { InversifyExpressServer } from 'inversify-express-utils' // Inversify 与 Express 的集成工具
import { Container } from 'inversify' // IoC 容器，用于管理所有依赖
import express from 'express'
import { PrismaClient } from './generated/prisma/client' // Prisma 数据库客户端
import { PrismaMariaDb } from '@prisma/adapter-mariadb' // MariaDB 适配器
import { PrismaDb } from '@/db' // 我们封装的数据库类

import { JWT } from '@/jwt'
// ============================================================
// 2. 创建 IoC 容器（依赖注入的核心）
// ============================================================
/**
 * Container 是 Inversify 的核心，它就像一个"服务仓库"
 * 
 * 传统方式的问题：
 *   const userService = new UserService(new PrismaDb(new PrismaClient()))
 *   - 每次都要手动创建依赖
 *   - 代码耦合度高，难以测试和维护
 * 
 * IoC 容器的优势：
 *   - 容器帮你管理所有对象的创建和生命周期
 *   - 你只需要告诉容器"我需要 UserService"，它会自动注入所有依赖
 */
const container = new Container()

// ============================================================
// 3. 配置数据库适配器
// ============================================================
const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 5
})

// ============================================================
// 4. 导入需要注册的类
// ============================================================
import { UserController } from '@/user/controller'
import { UserService } from '@/user/service'

// ============================================================
// 5. 向容器注册依赖（依赖注入的配置阶段）
// ============================================================
/**
 * 这里是 IoC 的核心配置：告诉容器如何创建和管理对象
 * 
 * bind() 的作用：
 *   - 左边：标识符（字符串 'UserService'），用于查找依赖
 *   - 右边：实际的类（UserService），容器会自动实例化
 * 
 * 为什么要这样做？
 *   - 解耦：代码不直接依赖具体实现，而是依赖标识符
 *   - 灵活：可以轻松替换实现（比如测试时用 MockUserService）
 */

// 注册 UserService：当有人需要 'UserService' 时，容器会创建 UserService 实例
container.bind<UserService>('UserService').to(UserService)

// 注册 UserController：当有人需要 'UserController' 时，容器会创建 UserController 实例
container.bind<UserController>('UserController').to(UserController)

/**
 * 注册 PrismaClient（使用动态值）
 * 
 * toDynamicValue() 的作用：
 *   - 当需要更复杂的初始化逻辑时使用
 *   - 这里我们需要传入 adapter 配置，所以用工厂函数创建
 */
container.bind<PrismaClient>('PrismaClient').toDynamicValue(() => {
    return new PrismaClient({ adapter })
})

// 注册 PrismaDb：封装了 PrismaClient 的数据库操作类
container.bind<PrismaDb>('PrismaDb').to(PrismaDb)


container.bind<JWT>('JWT').to(JWT)


// ============================================================
// 6. 创建 Express 服务器（Inversify 自动处理路由和依赖注入）
// ============================================================
/**
 * InversifyExpressServer 的作用：
 *   - 自动扫描所有带 @controller 装饰器的类
 *   - 自动注册路由
 *   - 自动注入依赖到 Controller 的构造函数
 */
const server = new InversifyExpressServer(container)

// 配置 Express 中间件
server.setConfig(app => {
    app.use(express.json()) // 解析 JSON 请求体
    app.use(container.get<JWT>('JWT').init()) // 跟express关联
})

// 构建最终的 Express 应用
const app = server.build()

// ============================================================
// 7. 启动服务器
// ============================================================
app.listen(3000, () => {
    console.log('服务器启动成功，监听端口 3000')
    console.log('IoC 容器已配置完成，所有依赖都由容器自动管理')
})
