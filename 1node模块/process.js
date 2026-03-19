console.log("__dirname", __dirname); // __dirname表示当前文件所在目录的绝对路径
console.log("__filename", __filename); // __filename表示当前文件的绝对路径
// process 进程对象

console.log("process", process.env.NODE_ENV); // 表示当前环境是否为开发环境
console.log("process.cwd()", process.cwd()); // 表示当前进程的工作目录

// ==================== 1. 基本信息 ====================
console.log("process.version", process.version); // Node.js 版本
console.log("process.versions", process.versions); // Node.js 及其依赖的版本信息
console.log("process.platform", process.platform); // 操作系统平台 (win32, darwin, linux)
console.log("process.arch", process.arch); // CPU 架构 (x64, arm64)
console.log("process.pid", process.pid); // 当前进程 ID
console.log("process.ppid", process.ppid); // 父进程 ID
console.log("process.uptime()", process.uptime()); // 进程运行时间（秒）
console.log("process.title", process.title); // 进程名称
console.log("process.execPath", process.execPath); // Node.js 可执行文件的绝对路径

// ==================== 2. 命令行参数 ====================
console.log("process.argv", process.argv); // 命令行参数数组 [node路径, 脚本路径, ...其他参数]
console.log("process.argv0", process.argv0); // 启动 Node.js 进程时传入的原始参数
console.log("process.execArgv", process.execArgv); // Node.js 的命令行选项 (如 --inspect)

// ==================== 3. 环境变量 ====================
console.log("process.env.PATH", process.env.PATH); // 系统 PATH 环境变量
console.log("process.env.HOME", process.env.HOME || process.env.USERPROFILE); // 用户主目录
// 设置自定义环境变量
process.env.MY_CUSTOM_VAR = "custom_value";
console.log("process.env.MY_CUSTOM_VAR", process.env.MY_CUSTOM_VAR);

// ==================== 4. 内存使用情况 ====================
console.log("process.memoryUsage()", process.memoryUsage());
// 返回对象包含:
// - rss: 常驻内存大小
// - heapTotal: V8 堆内存总量
// - heapUsed: V8 已用堆内存
// - external: V8 管理的 C++ 对象绑定的内存
// - arrayBuffers: ArrayBuffer 和 SharedArrayBuffer 的内存

// ==================== 5. CPU 使用情况 ====================
console.log("process.cpuUsage()", process.cpuUsage());
// 返回对象包含:
// - user: 用户代码执行时间（微秒）
// - system: 系统代码执行时间（微秒）

// ==================== 6. 标准输入输出 ====================
// process.stdin - 标准输入流 (可读流)
// process.stdout - 标准输出流 (可写流)
// process.stderr - 标准错误流 (可写流)
process.stdout.write("Hello from process.stdout\n");
process.stderr.write("This is an error message\n");

// 读取用户输入示例（注释掉避免阻塞）
// process.stdin.on('data', (data) => {
//     console.log(`You typed: ${data}`);
// });

// ==================== 7. process.nextTick ====================
// 微任务，在当前执行栈结束后，下一次事件循环开始前执行
// 优先级高于 Promise.then 和 setImmediate
process.nextTick(() => {
    console.log("process.nextTick executed");
});

// 对比执行顺序
Promise.resolve().then(() => console.log("Promise.then executed"));
setImmediate(() => console.log("setImmediate executed"));

// ==================== 8. 事件监听 ====================
// exit - 进程退出时触发（同步代码，不能执行异步操作）
process.on("exit", code => {
    console.log(`About to exit with code: ${code}`);
});

// beforeExit - 事件循环清空后触发（可以执行异步操作延迟退出）
process.on("beforeExit", code => {
    console.log(`beforeExit with code: ${code}`);
});

// uncaughtException - 未捕获的异常
process.on("uncaughtException", err => {
    console.log("uncaughtException", err);
});

// unhandledRejection - 未处理的 Promise 拒绝
process.on("unhandledRejection", (reason, promise) => {
    console.log("unhandledRejection", reason);
});

// warning - 进程警告
process.on("warning", warning => {
    console.log("warning", warning.name, warning.message);
});

// SIGINT - 接收到中断信号 (Ctrl+C)
process.on("SIGINT", () => {
    console.log("Received SIGINT. Press Control-D to exit.");
});

// SIGTERM - 接收到终止信号
process.on("SIGTERM", () => {
    console.log("Received SIGTERM");
    process.exit(0);
});

// ==================== 9. 进程控制 ====================
// process.exit(code) - 立即退出进程，0 表示成功，非 0 表示失败
// process.exit(0);

// process.abort() - 立即终止进程并生成核心转储文件
// process.abort();

// process.kill(pid, signal) - 向进程发送信号
// process.kill(process.pid, 'SIGTERM');

// ==================== 10. 高分辨率时间 ====================
// process.hrtime() - 返回高分辨率时间（纳秒级）
const start = process.hrtime();
// 执行一些操作...
const end = process.hrtime(start);
console.log(`执行时间: ${end[0]}秒 ${end[1] / 1000000}毫秒`);

// process.hrtime.bigint() - 返回 BigInt 格式的纳秒时间
const startBigInt = process.hrtime.bigint();
const endBigInt = process.hrtime.bigint();
console.log(`执行时间: ${endBigInt - startBigInt} 纳秒`);

// ==================== 11. 其他实用方法 ====================
// process.chdir(directory) - 改变当前工作目录
// process.chdir('/tmp');

// process.umask([mask]) - 设置/获取文件权限掩码
console.log("process.umask()", process.umask().toString(8));

// process.getuid() / process.getgid() - 获取用户/组 ID (仅 POSIX)
// console.log("process.getuid()", process.getuid());

// process.resourceUsage() - 获取资源使用情况
console.log("process.resourceUsage()", process.resourceUsage());

// ==================== 12. 调试相关 ====================
// process.debugPort - 调试端口（默认 9229）
console.log("process.debugPort", process.debugPort);

// process.report - 生成诊断报告
// process.report.writeReport(); // 生成报告文件

