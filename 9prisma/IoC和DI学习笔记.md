# IoC（控制反转）和 DI（依赖注入）学习笔记

## 📚 核心概念

### 什么是 IoC（Inversion of Control）？

**控制反转**是一种设计原则，它改变了对象创建和管理的方式。

- **传统方式**：你的代码主动创建和管理依赖对象
- **IoC 方式**：由容器（框架）来创建和管理对象，你只需要声明需要什么

### 什么是 DI（Dependency Injection）？

**依赖注入**是实现 IoC 的一种具体方式，通过外部注入依赖，而不是在类内部创建。

---

## 🔄 传统方式 vs IoC/DI 方式对比

### 传统方式（紧耦合）

```typescript
// ❌ 传统方式：每个类都要自己创建依赖
class UserController {
    private userService: UserService
    
    constructor() {
        // 需要知道如何创建 UserService
        const prismaClient = new PrismaClient({ adapter: ... })
        const prismaDb = new PrismaDb(prismaClient)
        this.userService = new UserService(prismaDb)
    }
    
    async getUsers() {
        return this.userService.getList()
    }
}

// 使用时
const controller = new UserController() // 每次都要手动创建整个依赖链
```

**问题：**
1. ❌ Controller 需要知道 Service 的所有依赖细节
2. ❌ 代码耦合度高，修改依赖需要改很多地方
3. ❌ 难以测试（无法轻松替换为 Mock 对象）
4. ❌ 每次使用都要重复创建依赖链

---

### IoC/DI 方式（松耦合）

```typescript
// ✅ IoC/DI 方式：容器自动管理依赖

// 1. 声明类可以被注入
@injectable()
class UserService {
    constructor(
        @inject('PrismaDb') private prismaDb: PrismaDb
    ) {}
    // 不需要知道 PrismaDb 如何创建
}

// 2. Controller 只需要声明需要什么
@controller('/user')
class UserController {
    constructor(
        @inject('UserService') private userService: UserService
    ) {}
    // 不需要知道 UserService 如何创建
    
    @GetMapping('/index')
    async getUsers() {
        return this.userService.getList()
    }
}

// 3. 在容器中注册（只需要配置一次）
container.bind<UserService>('UserService').to(UserService)
container.bind<PrismaDb>('PrismaDb').to(PrismaDb)
container.bind<PrismaClient>('PrismaClient').toDynamicValue(() => new PrismaClient())

// 4. 容器自动创建和注入
const server = new InversifyExpressServer(container)
// 容器会自动：
//   - 创建 PrismaClient
//   - 创建 PrismaDb（注入 PrismaClient）
//   - 创建 UserService（注入 PrismaDb）
//   - 创建 UserController（注入 UserService）
```

**优势：**
1. ✅ 每个类只关注自己的职责
2. ✅ 容器自动管理依赖链
3. ✅ 易于测试（可以注入 Mock）
4. ✅ 易于维护和扩展

---

## 🏗️ 你的项目架构

### 依赖关系图

```
┌─────────────────┐
│  PrismaClient   │ ← 最底层：数据库连接
└────────┬────────┘
         │ 注入
         ↓
┌─────────────────┐
│    PrismaDb     │ ← 数据库封装层
└────────┬────────┘
         │ 注入
         ↓
┌─────────────────┐
│   UserService   │ ← 业务逻辑层
└────────┬────────┘
         │ 注入
         ↓
┌─────────────────┐
│ UserController  │ ← 控制器层（处理 HTTP 请求）
└─────────────────┘
```

### 容器的工作流程

```
1. 启动时（main.ts）：
   ├─ 创建容器
   ├─ 注册所有依赖
   └─ 构建 Express 服务器

2. 收到请求时：
   ├─ 路由匹配到 UserController
   ├─ 容器检查 UserController 需要什么依赖
   ├─ 发现需要 UserService
   ├─ 容器检查 UserService 需要什么依赖
   ├─ 发现需要 PrismaDb
   ├─ 容器检查 PrismaDb 需要什么依赖
   ├─ 发现需要 PrismaClient
   ├─ 从底层开始创建：PrismaClient → PrismaDb → UserService → UserController
   └─ 执行 Controller 方法
```

---

## 🎯 关键装饰器说明

### @injectable()
```typescript
@injectable()
class UserService { }
```
- **作用**：告诉容器"这个类可以被注入"
- **必须添加**：否则容器无法管理这个类
- **位置**：所有需要被注入的类都要加

### @inject('标识符')
```typescript
constructor(@inject('UserService') private userService: UserService) {}
```
- **作用**：告诉容器"我需要这个依赖"
- **标识符**：在 main.ts 中注册时使用的字符串
- **自动注入**：容器会自动创建并注入实例

### @controller('/路径')
```typescript
@controller('/user')
class UserController { }
```
- **作用**：声明这是一个控制器，设置路由前缀
- **自动注册**：Inversify 会自动注册路由
- **结合使用**：配合 @GetMapping、@PostMapping 等

### @GetMapping('/路径')
```typescript
@GetMapping('/index')
async getUsers() { }
```
- **作用**：将方法映射到 GET 请求
- **完整路由**：`@controller 的路径` + `@GetMapping 的路径`
- **其他方法**：@PostMapping、@PutMapping、@DeleteMapping 等

---

## 💡 实际应用场景

### 场景 1：添加日志功能

**传统方式**：需要修改所有创建 Service 的地方
```typescript
// ❌ 需要在每个地方都加上 logger
const service = new UserService(prismaDb, logger)
```

**IoC 方式**：只需要在容器中注册一次
```typescript
// ✅ 只需要修改一处
@injectable()
class UserService {
    constructor(
        @inject('PrismaDb') private prismaDb: PrismaDb,
        @inject('Logger') private logger: Logger  // 新增
    ) {}
}

// 在 main.ts 中注册
container.bind<Logger>('Logger').to(Logger)
```

### 场景 2：单元测试

**传统方式**：难以替换依赖
```typescript
// ❌ 无法轻松替换为 Mock
const controller = new UserController()
```

**IoC 方式**：轻松注入 Mock 对象
```typescript
// ✅ 测试时使用 Mock
const mockService = { getList: jest.fn() }
container.bind('UserService').toConstantValue(mockService)
```

---

## 📝 你的项目文件说明

### main.ts - 应用入口
- 创建 IoC 容器
- 注册所有依赖
- 配置 Express 服务器
- **这是整个依赖注入的配置中心**

### src/user/controller.ts - 控制器层
- 处理 HTTP 请求和响应
- 注入 UserService
- 使用装饰器定义路由

### src/user/service.ts - 业务逻辑层
- 处理业务逻辑
- 注入 PrismaDb
- 数据验证

### src/db/index.ts - 数据库封装层
- 封装 PrismaClient
- 注入 PrismaClient
- 统一数据库操作

---

## 🎓 学习建议

1. **理解依赖链**：从 Controller → Service → Db → Client，每一层都是通过注入获得依赖
2. **记住装饰器**：@injectable、@inject、@controller 是核心
3. **看容器配置**：main.ts 中的 bind 操作决定了如何创建对象
4. **对比传统方式**：想象如果不用 IoC，你需要手动创建多少对象

---

## 🚀 下一步

你可以尝试：
1. 添加一个 Logger 服务，注入到 UserService 中
2. 创建 PostController 和 PostService，体验依赖注入
3. 写单元测试，使用 Mock 对象替换真实依赖
