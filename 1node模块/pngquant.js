const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

async function getPngquantPath() {
    try {
        const mod = await import("pngquant-bin");
        return mod.default || mod;
    } catch {
        return "pngquant";
    }
}

function isPngFile(filePath) {
    try {
        const fd = fs.openSync(filePath, "r");
        const header = Buffer.alloc(8);
        fs.readSync(fd, header, 0, 8, 0);
        fs.closeSync(fd);
        return header.toString("hex") === "89504e470d0a1a0a";
    } catch {
        return false;
    }
}

function findFirstPngInDir(dirPath) {
    try {
        console.log(`正在扫描目录: ${dirPath}`);
        if (!fs.existsSync(dirPath)) {
            console.log("目录不存在。");
            return null;
        }
        const files = fs.readdirSync(dirPath);
        if (files.length === 0) {
            console.log("目录为空。");
            return null;
        }

        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stat = fs.statSync(filePath);
            if (!stat.isFile()) continue;

            process.stdout.write(`检查文件: ${file} ... `);
            if (isPngFile(filePath)) {
                console.log(`OK (有效 PNG)`);
                return filePath;
            } else {
                // 读取前几个字节看看是什么
                try {
                    const fd = fs.openSync(filePath, "r");
                    const header = Buffer.alloc(8);
                    fs.readSync(fd, header, 0, 8, 0);
                    fs.closeSync(fd);
                    const hex = header.toString("hex");
                    console.log(`跳过`);
                    console.log(`   └-> 原因: 文件头签名不匹配 (Hex: ${hex})`);
                    if (hex.startsWith("ffd8")) {
                        console.log(`   └-> 提示: 这是一个 JPG 图片，尽管扩展名可能是 .png`);
                    }
                } catch (e) {
                    console.log(`读取失败: ${e.message}`);
                }
            }
        }
        return null;
    } catch (err) {
        console.error("扫描目录出错:", err.message);
        return null;
    }
}

/**
 * pngquant 是一个常用的 PNG 图片压缩工具。
 * 在 Node.js 学习中，它经常被用来演示如何通过 child_process 操控外部二进制程序，
 * 以及如何利用“流 (Stream)”和“管道 (Pipe)”处理数据。
 */

// 模拟一个压缩图片的函数
function compressImage(pngquantPath, inputPath, outputPath) {
    /**
     * 1. spawn('pngquant', [options])
     * 第一个参数是命令名，第二个参数是参数数组。
     * '-' 表示从标准输入 (stdin) 读取数据，输出到标准输出 (stdout)。
     */
    const args = ["--force", "--output", "-", "256", "-"];
    const cp = spawn(pngquantPath, args);

    // 2. 创建读取流和写入流
    const inputStream = fs.createReadStream(inputPath);
    const outputStream = fs.createWriteStream(outputPath);

    // 3. 管道连接 (Pipe)
    // 输入文件流 -> pngquant 的标准输入
    inputStream.pipe(cp.stdin);

    // pngquant 的标准输出 -> 输出文件流
    cp.stdout.pipe(outputStream);

    // 4. 事件监听
    cp.on("close", (code) => {
        if (code === 0) {
            console.log(`压缩完成！文件已保存至: ${outputPath}`);
        } else {
            console.log(`pngquant 退出，状态码: ${code}`);
            if (code === 127) {
                console.error("错误：未在系统中找到 pngquant 命令。请先安装 pngquant。");
            }
        }
    });

    cp.stderr.on("data", (data) => {
        console.error(`stderr: ${data.toString()}`);
    });

    cp.stdin.on("error", () => {});
    inputStream.on("error", (err) => {
        console.error("读取图片失败:", err.message);
    });
    outputStream.on("error", (err) => {
        console.error("写入图片失败:", err.message);
    });

    cp.on("error", (err) => {
        if (err.code === "ENOENT") {
            console.error("错误：找不到 pngquant 执行文件。可选方案：安装 pngquant 到 PATH，或安装依赖 pngquant-bin。");
        } else {
            console.error("发生错误:", err.message);
        }
    });
}

/**
 * 知识点要点：
 */

// --- 5. 如何在 Node.js 中安装 pngquant 库？ ---
// 虽然我们可以直接调用系统命令，但更推荐使用封装好的 npm 包：
// npm install pngquant-bin  (提供跨平台的二进制文件)
// 或者使用更高级的：
// npm install imagemin-pngquant

console.log("--- pngquant 学习 Demo ---");
console.log("注意：此 Demo 演示了如何利用 spawn 和管道处理图片流。");
console.log("优先使用 pngquant-bin（若已安装），否则尝试调用系统 pngquant。\n");

const imagesDir = path.join(__dirname, "public", "images");
const input = findFirstPngInDir(imagesDir);

if (input) {
    const output = path.join(imagesDir, `${path.parse(input).name}-compressed.png`);
    console.log(`发现 PNG 图片: ${input}`);
    getPngquantPath().then((pngquantPath) => compressImage(pngquantPath, input, output));
} else {
    console.log(`[提示] ${imagesDir} 下未找到 PNG 文件。`);
    console.log("注意：pngquant 只能压缩 PNG。你现在的 img.png 可能实际是 JPG（仅扩展名是 .png）。");
}
