const EventEmitter = require("events");

/**
 * 1. 基础用法：创建实例并监听/触发事件
 */
const myEmitter = new EventEmitter();

// 注册事件监听器
myEmitter.on("greet", (name) => {
    console.log(`Hello, ${name}!`);
});

// 触发事件
console.log("--- 基础用法 ---");
myEmitter.emit("greet", "Node.js");

/**
 * 2. 传递多个参数
 */
myEmitter.on("login", (username, time) => {
    console.log(`用户 ${username} 在 ${time} 登录了`);
});

console.log("\n--- 传递参数 ---");
myEmitter.emit("login", "Alice", new Date().toLocaleTimeString());

/**
 * 3. 只触发一次的事件 (once)
 */
myEmitter.once("init", () => {
    console.log("系统初始化完成（只会显示一次）");
});

console.log("\n--- once 用法 ---");
myEmitter.emit("init");
myEmitter.emit("init"); // 第二次触发不会有反应

/**
 * 4. 移除监听器
 */
const callback = () => {
    console.log("这条消息不应该被看到");
};

myEmitter.on("removeTest", callback); 
myEmitter.off("removeTest", callback); // 或者使用 removeListener

console.log("\n--- 移除监听器 ---");
myEmitter.emit("removeTest"); // 不会有输出

/**
 * 5. 错误处理 (Error events)
 * 如果触发 'error' 事件而没有监听器，Node 会抛出异常并退出进程
 */
myEmitter.on("error", (err) => {
    console.error("捕获到错误:", err.message);
});

console.log("\n--- 错误处理 ---");
myEmitter.emit("error", new Error("哎呀，出错了"));

/**
 * 6. 继承 EventEmitter (常见模式)
 */
class MyBus extends EventEmitter {
    start() {
        console.log("Bus 启动中...");
        this.emit("started");
    }
}

const bus = new MyBus();
bus.on("started", () => {
    console.log("监听到 Bus 已启动！");
});

console.log("\n--- 继承 EventEmitter ---");
bus.start();
