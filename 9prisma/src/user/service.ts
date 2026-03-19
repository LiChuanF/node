// ============================================================
// Service 层：业务逻辑层
// ============================================================
/**
 * Service 层的职责：
 *   - 处理业务逻辑（验证、计算、数据转换等）
 *   - 调用数据库操作
 *   - 不直接处理 HTTP 请求/响应
 */
import { injectable, inject } from 'inversify'
import { PrismaDb } from '@/db'
import { UserDto } from './user.dto'
import { plainToInstance } from 'class-transformer' // 将普通对象转换为类实例
import { validate } from 'class-validator' // 验证类实例是否符合规则
import { JWT } from '@/jwt'
/**
 * @injectable() 装饰器的作用：
 *   - 告诉 Inversify："这个类可以被注入到其他类中"
 *   - 必须添加此装饰器，否则容器无法管理这个类
 *   - 它让类成为 IoC 容器的一部分
 */
@injectable()
export class UserService {
    /**
     * 【依赖注入示例】
     * 
     * Service 需要数据库操作，所以注入 PrismaDb
     * 
     * 依赖链：
     *   UserController 依赖 -> UserService 依赖 -> PrismaDb 依赖 -> PrismaClient
     *   容器会自动解析整个依赖链，从最底层开始创建对象
     * 
     * @inject('PrismaDb') 的作用：
     *   - 告诉容器："我需要 'PrismaDb' 这个依赖"
     *   - 容器会查找 main.ts 中的注册信息
     *   - 自动创建 PrismaDb 实例并注入
     */
    constructor(
        @inject('PrismaDb')
        private readonly prismaDb: PrismaDb,
        @inject('JWT')
        private readonly JWT: JWT
    ) {
        // prismaDb 已经由容器自动注入
        // 我们不需要手动创建 PrismaDb 或 PrismaClient
    }

    /**
     * 获取用户列表
     * 
     * 直接使用注入的 prismaDb 进行数据库操作
     */
    public async getList() {
        return await this.prismaDb.prisma.user.findMany()
    }

    /**
     * 创建用户（带数据验证）
     * 
     * 业务逻辑：
     *   1. 将普通对象转换为 UserDto 类实例
     *   2. 使用 class-validator 验证数据
     *   3. 验证通过后创建用户
     */
    public async createUser(user: any) {
        // 将普通 JS 对象转换为 UserDto 类实例
        // 这样才能使用 class-validator 的装饰器验证
        let userDto = plainToInstance(UserDto, user)
        
        // 验证 userDto 是否符合 UserDto 类中定义的规则
        const errors = await validate(userDto)
        
        if (errors.length > 0) {
            // 验证失败，返回错误信息
            return errors
        } else {
            // 验证成功，创建用户
            let result =  await this.prismaDb.prisma.user.create({
                data: user
            })
            return {
                ...result,
                token: this.JWT.createToken(result)
            }
        }
    }
}
