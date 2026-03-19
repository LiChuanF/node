const fs = require("fs");
const path = require("path"); //

// 示例文件路径
// 修正拼写：pubilc -> public，并确保目录存在
const filePath = path.join(__dirname, "public", "text", "hello.txt");
const copyPath = path.join(__dirname, "public", "text", "hello-copy.txt");

// 确保父目录存在，否则 writeFileSync 会报错 ENOENT
const dirName = path.dirname(filePath);
if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName, { recursive: true });
    console.log(`已创建目录: ${dirName}`);
}

/**
 * 1. 同步操作 (Sync)
 * 阻塞主线程，直到操作完成。适合启动时加载配置等场景，不建议在服务器请求处理中使用。
 */
console.log("--- 1. 同步写入与读取 ---");
try {
    fs.writeFileSync(filePath, "Hello Node.js FS Module!", "utf8");
    console.log("写入成功");

    const content = fs.readFileSync(filePath, "utf8");
    console.log("读取内容:", content);
} catch (err) {
    console.error("同步操作出错:", err);
}

/**
 * 2. 异步回调操作 (Callback)
 * 经典的错误优先回调 (error-first callback)。
 * 不会阻塞主线程，但在处理复杂逻辑时容易导致“回调地狱”。
 */
console.log("\n--- 2. 异步回调 ---");
fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
        console.error("读取失败:", err);
        return;
    }
    console.log("异步读取成功:", data);

    // 追加内容
    fs.appendFile(filePath, "\nAppended Content", (err) => {
        if (err) throw err;
        console.log("追加成功");
    });
});

/**
 * 3. Promise API (fs/promises) - 推荐用法
 * Node.js v10+ 引入，v14+ 稳定。配合 async/await 使用非常优雅。
 */
const fsPromises = require("fs").promises;

async function runFsPromises() {
    console.log("\n--- 3. Promise API (async/await) ---");
    try {
        await fsPromises.writeFile(filePath, "Hello from Promises API");
        const data = await fsPromises.readFile(filePath, "utf8");
        console.log("Promise 读取:", data);

        // 获取文件信息
        const stat = await fsPromises.stat(filePath);
        console.log(`文件大小: ${stat.size} 字节`);
        console.log(`创建时间: ${stat.birthtime}`);
    } catch (err) {
        console.error("Promise 操作出错:", err);
    }
}
// 稍后执行以免输出混淆
setTimeout(runFsPromises, 100);

/**
 * 4. 文件流 (Stream)
 * 适合处理大文件（如视频、大日志），不会一次性占用大量内存。
 */
setTimeout(() => {
    console.log("\n--- 4. 流操作 (Stream) ---");
    // 创建读取流
    const readStream = fs.createReadStream(filePath, { encoding: "utf8" });
    // 创建写入流
    const writeStream = fs.createWriteStream(copyPath);

    // 管道流：读取 -> 写入
    readStream.pipe(writeStream);

    readStream.on("data", (chunk) => {
        console.log(`[Stream] 读取到数据块 (${chunk.length} 字节)`);
    });

    writeStream.on("finish", () => {
        console.log("[Stream] 写入完成 (复制成功)");
    });

    // --- 补充：手动 write 示例 ---
    const manualPath = path.join(__dirname, "public", "text", "manual.txt");
    const manualStream = fs.createWriteStream(manualPath);

    // write() 方法可以直接写入数据
    manualStream.write("第一行数据\n");
    manualStream.write("第二行数据\n");

    // end() 用于写入最后的数据并关闭流
    manualStream.end("这是最后一行，写入完毕。");

    manualStream.on("finish", () => {
        console.log("[Manual Stream] 手动写入完成");
    });
}, 500);

/**
 * 5. 目录操作
 */
setTimeout(async () => {
    console.log("\n--- 5. 目录操作 ---");
    const dirPath = path.join(__dirname, "test-dir");

    try {
        // 检查目录是否存在，不存在则创建
        if (!fs.existsSync(dirPath)) {
            await fsPromises.mkdir(dirPath);
            console.log("目录创建成功");
        }

        // 读取目录内容
        const files = await fsPromises.readdir(__dirname);
        const jsFiles = files.filter((f) => f.endsWith(".js"));
        console.log("当前目录下的 JS 文件:", jsFiles);

        // 删除目录 (必须为空目录，或者使用 recursive: true)
        await fsPromises.rmdir(dirPath);
        console.log("目录删除成功");
    } catch (err) {
        console.error("目录操作出错:", err);
    }
}, 1000);
