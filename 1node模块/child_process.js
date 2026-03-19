const { exec, execSync, execFile, spawn, spawnSync, fork } = require("child_process");
const path = require("path");

// ==================== 1. exec - 执行 shell 命令 ====================
// exec(command[, options], callback)
// exec(command[, options]) - 返回 ChildProcess 对象
// 特点: 创建 shell 执行命令，有缓冲区限制（默认 1MB），适合简单命令

// 异步版本
exec("node -v", (error, stdout, stderr) => {
    if (error) {
        console.error("exec error:", error);
        return;
    }
    console.log("exec stdout:", stdout.trim()); // Node.js 版本
    if (stderr) console.error("exec stderr:", stderr);
});

// 带选项
exec(
    "echo hello",
    {
        cwd: __dirname, // 工作目录
        env: { ...process.env, MY_VAR: "test" }, // 环境变量
        timeout: 5000, // 超时时间（毫秒）
        maxBuffer: 1024 * 1024, // 最大缓冲区大小
        encoding: "utf8", // 输出编码
        shell: true, // 使用 shell 执行
    },
    (error, stdout, stderr) => {
        console.log("exec with options:", stdout.trim());
    }
);

// Promise 封装
const { promisify } = require("util");
const execPromise = promisify(exec);

async function runCommand(cmd) {
    try {
        const { stdout, stderr } = await execPromise(cmd);
        return stdout.trim();
    } catch (error) {
        throw error;
    }
}
// runCommand('node -v').then(console.log);

// ==================== 2. execSync - 同步执行 shell 命令 ====================
// execSync(command[, options])
// 返回: Buffer | string (stdout 输出内容)
// 特点: 阻塞进程直到命令完成，直接返回输出

try {
    const result = execSync("node -v", { encoding: "utf8" });
    console.log("execSync result:", result.trim());
} catch (error) {
    console.error("execSync error:", error.message);
}

// 静默执行（忽略输出）
try {
    execSync("echo silent", { stdio: "ignore" });
    console.log("execSync silent: 命令已执行");
} catch (error) {
    console.error(error);
}

// 继承父进程的 stdio（实时显示输出）
// execSync('npm install', { stdio: 'inherit' });

// ==================== 3. execFile - 直接执行可执行文件 ====================
// execFile(file[, args][, options], callback)
// execFile(file[, args][, options]) - 返回 ChildProcess 对象
// 特点: 不创建 shell，更安全高效，适合执行可执行文件

execFile("node", ["-v"], (error, stdout, stderr) => {
    if (error) {
        console.error("execFile error:", error);
        return;
    }
    console.log("execFile stdout:", stdout.trim());
});

// Windows 上执行 .bat 或 .cmd 文件需要 shell: true
// execFile('script.bat', [], { shell: true }, callback);

// ==================== 4. spawn - 流式执行命令 ====================
// spawn(command[, args][, options])
// 返回: ChildProcess 对象 (带 stdin, stdout, stderr 流)
// 特点: 返回流，适合大量数据输出，不受缓冲区限制

const ls = spawn("node", ["-v"]);

ls.stdout.on("data", data => {
    console.log("spawn stdout:", data.toString().trim());
});

ls.stderr.on("data", data => {
    console.error("spawn stderr:", data.toString());
});

ls.on("close", code => {
    console.log("spawn 子进程退出，退出码:", code);
});

ls.on("error", error => {
    console.error("spawn error:", error);
});

// spawn 执行 shell 命令（需要 shell: true）
const shellCmd = spawn("echo", ["hello from spawn"], {
    shell: true,
    cwd: __dirname,
    env: process.env,
});
shellCmd.stdout.on("data", data => console.log("spawn shell:", data.toString().trim()));

// spawn 选项详解
const spawnOptions = {
    cwd: __dirname, // 工作目录
    env: process.env, // 环境变量
    shell: true, // 使用 shell 执行
    stdio: "pipe", // 'pipe' | 'ignore' | 'inherit' | [stdin, stdout, stderr]
    detached: false, // 是否独立于父进程运行
    windowsHide: true, // Windows 上隐藏子进程窗口
};

// ==================== 5. spawnSync - 同步流式执行 ====================
// spawnSync(command[, args][, options])
// 返回: { pid, output, stdout, stderr, status, signal, error }
const spawnResult = spawnSync("node", ["-v"], { encoding: "utf8" });
console.log("spawnSync stdout:", spawnResult.stdout.trim());
console.log("spawnSync status:", spawnResult.status); // 退出码
// spawnResult.pid, spawnResult.signal, spawnResult.error

// ==================== 6. fork - 创建 Node.js 子进程 ====================
// fork(modulePath[, args][, options])
// 返回: ChildProcess 对象 (带 send() 方法和 'message' 事件)
// 特点: 专门用于创建 Node.js 子进程，自动建立 IPC 通道

// 创建子进程文件 child.js 内容示例:
/*
process.on('message', (msg) => {
    console.log('子进程收到消息:', msg);
    process.send({ reply: 'Hello from child', data: msg.data * 2 });
});
*/

// 主进程代码
const childPath = path.join(__dirname, "fork_child.js");

// 检查文件是否存在再 fork（示例用）
const fs = require("fs");
if (fs.existsSync(childPath)) {
    const child = fork(childPath, [], {
        cwd: __dirname,
        env: process.env,
        execArgv: [], // Node.js 命令行参数，如 ['--inspect']
        silent: false, // true 时 stdout/stderr 通过管道传递给父进程
    });

    // 发送消息给子进程
    child.send({ type: "greeting", data: 10 });

    // 接收子进程消息
    child.on("message", msg => {
        console.log("fork 父进程收到消息:", msg);
    });

    child.on("exit", code => {
        console.log("fork 子进程退出，退出码:", code);
    });

    child.on("error", error => {
        console.error("fork error:", error);
    });

    // 断开 IPC 通道
    // child.disconnect();

    // 终止子进程
    // child.kill('SIGTERM');
}

// ==================== 7. stdio 配置详解 ====================
/*
stdio 可以是字符串或数组:

字符串形式:
- 'pipe': 创建管道，父子进程间可通信 (默认)
- 'ignore': 忽略子进程的 stdio
- 'inherit': 继承父进程的 stdio，直接输出到控制台

数组形式 [stdin, stdout, stderr, ...额外的 IPC/fd]:
- 'pipe': 创建管道
- 'ignore': 忽略
- 'inherit': 继承
- 'ipc': 创建 IPC 通道（fork 自动添加）
- Stream 对象: 共享流
- 数字: 文件描述符
- null/undefined: 默认值
*/

// 示例: 将子进程输出写入文件
// const out = fs.openSync('./out.log', 'a');
// const err = fs.openSync('./err.log', 'a');
// spawn('node', ['script.js'], { stdio: ['ignore', out, err] });

// ==================== 8. 实际应用场景 ====================

// 场景1: 执行系统命令获取结果
async function getSystemInfo() {
    const platform = process.platform;
    let cmd;
    if (platform === "win32") {
        cmd = 'systeminfo | findstr /B /C:"OS Name" /C:"OS Version"';
    } else {
        cmd = "uname -a";
    }
    try {
        const { stdout } = await execPromise(cmd);
        return stdout.trim();
    } catch (e) {
        return "获取失败";
    }
}

// 场景2: 运行 npm 脚本
function runNpmScript(script, cwd) {
    return new Promise((resolve, reject) => {
        const npm = spawn("npm", ["run", script], {
            cwd,
            shell: true,
            stdio: "inherit",
        });
        npm.on("close", code => {
            code === 0 ? resolve() : reject(new Error(`npm run ${script} failed`));
        });
    });
}

// 场景3: 并行执行多个命令
async function runParallel(commands) {
    const promises = commands.map(
        cmd =>
            new Promise((resolve, reject) => {
                exec(cmd, (error, stdout) => {
                    error ? reject(error) : resolve(stdout.trim());
                });
            })
    );
    return Promise.all(promises);
}
// runParallel(['node -v', 'npm -v']).then(console.log);

// 场景4: 长时间运行的子进程（守护进程）
function startDaemon(script) {
    const child = spawn("node", [script], {
        detached: true, // 独立于父进程
        stdio: "ignore", // 忽略 stdio
    });
    child.unref(); // 允许父进程独立退出
    console.log("守护进程已启动，PID:", child.pid);
    return child.pid;
}

// 场景5: 带超时的命令执行
function execWithTimeout(cmd, timeout) {
    return new Promise((resolve, reject) => {
        const child = exec(cmd, { timeout }, (error, stdout, stderr) => {
            if (error) {
                if (error.killed) {
                    reject(new Error("命令执行超时"));
                } else {
                    reject(error);
                }
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

// 场景6: 实时输出的命令执行
function execRealtime(cmd, args = []) {
    return new Promise((resolve, reject) => {
        const child = spawn(cmd, args, { shell: true });
        let output = "";

        child.stdout.on("data", data => {
            const str = data.toString();
            process.stdout.write(str); // 实时输出
            output += str;
        });

        child.stderr.on("data", data => {
            process.stderr.write(data.toString());
        });

        child.on("close", code => {
            code === 0 ? resolve(output) : reject(new Error(`Exit code: ${code}`));
        });
    });
}

// ==================== 9. exec vs spawn vs fork 对比 ====================
/*
| 方法     | shell | 输出方式 | 适用场景                    |
|----------|-------|----------|----------------------------|
| exec     | 是    | 缓冲     | 简单命令，输出量小          |
| execFile | 否    | 缓冲     | 直接执行可执行文件，更安全  |
| spawn    | 可选  | 流       | 大量输出，长时间运行        |
| fork     | 否    | 流+IPC   | Node.js 子进程，需要通信    |
*/

console.log("\n=== child_process 模块演示完成 ===");
