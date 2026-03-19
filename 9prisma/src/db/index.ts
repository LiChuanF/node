import { injectable, inject } from 'inversify'
import { PrismaClient } from '../../generated/prisma/client'

/**
 * ============================================================
 * 数据库封装层
 * ============================================================
 * 
 * 为什么要封装 PrismaClient？
 *   1. 统一管理：所有数据库操作都通过这个类
 *   2. 易于扩展：可以添加日志、缓存、事务等功能
 *   3. 易于测试：可以轻松替换为 Mock 实现
 *   4. 符合依赖注入原则：PrismaClient 也是被注入的
 */
@injectable() // 标记为可注入，让容器可以管理这个类
export class PrismaDb {
    prisma: PrismaClient
    
    /**
     * 【依赖注入的最底层】
     * 
     * PrismaDb 依赖 PrismaClient
     * PrismaClient 在 main.ts 中通过 toDynamicValue 创建
     * 
     * 完整的依赖链：
     *   UserController -> UserService -> PrismaDb -> PrismaClient
     *   
     * 容器的解析顺序（从底层到顶层）：
     *   1. 创建 PrismaClient（使用 toDynamicValue 工厂函数）
     *   2. 创建 PrismaDb（注入 PrismaClient）
     *   3. 创建 UserService（注入 PrismaDb）
     *   4. 创建 UserController（注入 UserService）
     */
    constructor(
        @inject('PrismaClient')
        prismaClient: PrismaClient
    ) {
        this.prisma = prismaClient
    }
    
    /**
     * 可以在这里添加更多数据库相关的方法
     * 例如：
     *   - 事务处理
     *   - 连接池管理
     *   - 查询日志
     *   - 性能监控
     */
}
