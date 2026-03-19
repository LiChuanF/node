const os = require("os");

// ==================== 1. 操作系统信息 ====================
// os.type() - 操作系统类型
console.log("os.type()", os.type());
// Windows: Windows_NT, macOS: Darwin, Linux: Linux

// os.platform() - 操作系统平台
console.log("os.platform()", os.platform());
// win32, darwin, linux, freebsd 等

// os.release() - 操作系统版本号
console.log("os.release()", os.release());

// os.version() - 操作系统版本字符串
console.log("os.version()", os.version());

// os.arch() - CPU 架构
console.log("os.arch()", os.arch());
// x64, arm, arm64, ia32 等

// os.machine() - 机器类型 (Node.js 16.18+)
// console.log("os.machine()", os.machine());

// os.endianness() - CPU 字节序
console.log("os.endianness()", os.endianness());
// BE: 大端序, LE: 小端序

// ==================== 2. 主机信息 ====================
// os.hostname() - 主机名
console.log("os.hostname()", os.hostname());

// os.uptime() - 系统运行时间（秒）
console.log("os.uptime()", os.uptime());
console.log("系统运行时间", formatUptime(os.uptime()));

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}天 ${hours}小时 ${minutes}分钟`;
}

// ==================== 3. 用户信息 ====================
// os.userInfo() - 当前用户信息
console.log("os.userInfo()", os.userInfo());
// 返回: { uid, gid, username, homedir, shell }

// os.homedir() - 用户主目录
console.log("os.homedir()", os.homedir());

// os.tmpdir() - 系统临时目录
console.log("os.tmpdir()", os.tmpdir());

// ==================== 4. 内存信息 ====================
// os.totalmem() - 系统总内存（字节）
console.log("os.totalmem()", os.totalmem());
console.log("总内存", formatBytes(os.totalmem()));

// os.freemem() - 系统空闲内存（字节）
console.log("os.freemem()", os.freemem());
console.log("空闲内存", formatBytes(os.freemem()));

// 内存使用率
const memUsage = ((1 - os.freemem() / os.totalmem()) * 100).toFixed(2);
console.log("内存使用率", memUsage + "%");

function formatBytes(bytes) {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
        bytes /= 1024;
        i++;
    }
    return bytes.toFixed(2) + " " + units[i];
}

// ==================== 5. CPU 信息 ====================
// os.cpus() - CPU 核心信息数组
console.log("os.cpus()", os.cpus());
// 返回每个核心的: { model, speed, times: { user, nice, sys, idle, irq } }

// CPU 核心数
console.log("CPU 核心数", os.cpus().length);

// CPU 型号
console.log("CPU 型号", os.cpus()[0].model);

// 计算 CPU 使用率
function getCpuUsage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
        for (const type in cpu.times) {
            totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
    });

    return ((1 - totalIdle / totalTick) * 100).toFixed(2) + "%";
}
console.log("CPU 使用率", getCpuUsage());

// os.loadavg() - 系统负载平均值 (1, 5, 15 分钟)
// Windows 上返回 [0, 0, 0]
console.log("os.loadavg()", os.loadavg());

// ==================== 6. 网络接口 ====================
// os.networkInterfaces() - 网络接口信息
console.log("os.networkInterfaces()", os.networkInterfaces());
// 返回: { 接口名: [{ address, netmask, family, mac, internal, cidr }] }

// 获取本机 IP 地址
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // 跳过内部接口和非 IPv4 地址
            if (!iface.internal && iface.family === "IPv4") {
                return iface.address;
            }
        }
    }
    return "127.0.0.1";
}
console.log("本机 IP", getLocalIP());

// 获取 MAC 地址
function getMacAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (!iface.internal && iface.mac !== "00:00:00:00:00:00") {
                return iface.mac;
            }
        }
    }
    return null;
}
console.log("MAC 地址", getMacAddress());

// ==================== 7. 系统常量 ====================
// os.EOL - 操作系统的换行符
console.log("os.EOL", JSON.stringify(os.EOL));
// Windows: \r\n, POSIX: \n

// os.devNull - 空设备路径
console.log("os.devNull", os.devNull);
// Windows: \\.\nul, POSIX: /dev/null

// ==================== 8. 优先级常量 ====================
console.log("os.constants.priority", os.constants.priority);
// PRIORITY_LOW, PRIORITY_BELOW_NORMAL, PRIORITY_NORMAL,
// PRIORITY_ABOVE_NORMAL, PRIORITY_HIGH, PRIORITY_HIGHEST

// os.getPriority() - 获取进程优先级
console.log("os.getPriority()", os.getPriority());

// os.setPriority(priority) - 设置进程优先级
// os.setPriority(os.constants.priority.PRIORITY_HIGH);

// ==================== 9. 信号常量 ====================
console.log("os.constants.signals", os.constants.signals);
// SIGINT, SIGTERM, SIGKILL 等

// ==================== 10. 错误常量 ====================
console.log("os.constants.errno", os.constants.errno);
// ENOENT, EACCES, EEXIST 等

// ==================== 11. 实际应用场景 ====================

// 场景1: 系统信息面板
function getSystemInfo() {
    return {
        操作系统: `${os.type()} ${os.release()} (${os.arch()})`,
        主机名: os.hostname(),
        CPU: `${os.cpus()[0].model} x ${os.cpus().length}`,
        内存: `${formatBytes(os.freemem())} / ${formatBytes(os.totalmem())}`,
        运行时间: formatUptime(os.uptime()),
        用户: os.userInfo().username,
    };
}
console.log("系统信息:", getSystemInfo());

// 场景2: 根据平台执行不同逻辑
function getPlatformCommand(cmd) {
    const platform = os.platform();
    const commands = {
        win32: { clear: "cls", list: "dir" },
        darwin: { clear: "clear", list: "ls -la" },
        linux: { clear: "clear", list: "ls -la" },
    };
    return commands[platform]?.[cmd] || cmd;
}
console.log("清屏命令:", getPlatformCommand("clear"));

// 场景3: 判断是否有足够内存执行任务
function hasEnoughMemory(requiredMB) {
    const freeMB = os.freemem() / 1024 / 1024;
    return freeMB >= requiredMB;
}
console.log("是否有 1GB 空闲内存:", hasEnoughMemory(1024));

// 场景4: 生成跨平台的文件内容
function createFileContent(lines) {
    return lines.join(os.EOL);
}
console.log("跨平台文件内容:", createFileContent(["line1", "line2", "line3"]));

// 场景5: 获取可用于并行任务的 CPU 数量
function getParallelismLevel() {
    // 通常留一个核心给系统
    return Math.max(1, os.cpus().length - 1);
}
console.log("建议并行数:", getParallelismLevel());
