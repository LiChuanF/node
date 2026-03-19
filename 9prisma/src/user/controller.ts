// ============================================================
// Controller 层：处理 HTTP 请求和响应
// ============================================================
import { controller, httpGet as GetMapping, httpPost as PostMapping } from 'inversify-express-utils'
import { inject } from 'inversify'
import type { Request, Response } from 'express'
import { UserService } from './service'
import { JWT } from '@/jwt'
import { ExceptionResult } from 'node_modules/inversify-express-utils/lib/cjs/results'

/**
 * @controller 装饰器的作用：
 *   1. 告诉 Inversify 这是一个控制器类
 *   2. 设置路由前缀为 '/user'
 *   3. 自动注册到 Express 路由系统
 *
 * 最终路由：
 *   - GET  /user/index  -> getIndex()
 *   - POST /user/create -> createUser()
 */
@controller('/user')
export class UserController {
    /**
     * 【依赖注入的核心】构造函数注入
     *
     * 传统方式（紧耦合）：
     *   constructor() {
     *     this.userService = new UserService(new PrismaDb(...))
     *   }
     *   问题：Controller 需要知道如何创建 UserService 和它的所有依赖
     *
     * IoC 方式（松耦合）：
     *   constructor(@inject('UserService') private readonly userService: UserService) {}
     *   优势：
     *     - Controller 不需要知道 UserService 如何创建
     *     - 容器自动注入 UserService 实例
     *     - 容易测试（可以注入 Mock 对象）
     *
     * @inject('UserService') 的作用：
     *   - 告诉容器："我需要标识符为 'UserService' 的依赖"
     *   - 容器会从 main.ts 中的注册信息找到对应的类并实例化
     *   - 如果 UserService 也有依赖，容器会递归注入
     */
    constructor(
        @inject('UserService')
        private readonly userService: UserService
    ) {
        // 这里不需要任何初始化代码
        // userService 已经由容器自动注入并可以直接使用
    }

    /**
     * @GetMapping 装饰器：
     *   - 将此方法映射到 GET /user/index 路由
     *   - 自动处理路由注册
     */
    @GetMapping('/index', JWT.middleware()) // 鉴权
    public async getIndex(req: Request, res: Response) {
        console.log(req.user.id)

        // 直接使用注入的 userService，无需关心它是如何创建的
        let result = await this.userService.getList()
        res.send(result)
    }

    /**
     * @PostMapping 装饰器：
     *   - 将此方法映射到 POST /user/create 路由
     */
    @PostMapping('/create')
    public async createUser(req: Request, res: Response) {
        // 同样直接使用 userService
        let result = await this.userService.createUser(req.body)
        res.send(result)
    }
}

