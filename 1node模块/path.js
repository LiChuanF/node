const path = require("path");

// ==================== 1. 路径拼接 ====================
// path.join() - 将多个路径片段拼接成一个规范化的路径
console.log("path.join()", path.join("/foo", "bar", "baz/asdf", "quux", ".."));
// 输出: /foo/bar/baz/asdf (.. 会回退一级)

console.log("path.join()", path.join(__dirname, "files", "test.txt"));
// 输出: 当前目录/files/test.txt

// ==================== 2. 路径解析 ====================
// path.resolve() - 将路径解析为绝对路径（从右到左处理，遇到绝对路径停止）
console.log("path.resolve()", path.resolve("foo", "bar", "baz"));
// 输出: 当前工作目录/foo/bar/baz

console.log("path.resolve()", path.resolve("/foo", "/bar", "baz"));
// 输出: /bar/baz (遇到 /bar 绝对路径，从这里开始)

console.log("path.resolve()", path.resolve(__dirname, "./files", "test.txt"));
// 输出: 当前目录/files/test.txt

// ==================== 3. 获取路径各部分 ====================
const filePath = "/home/user/documents/file.txt";

// path.dirname() - 获取目录名
console.log("path.dirname()", path.dirname(filePath));
// 输出: /home/user/documents

// path.basename() - 获取文件名
console.log("path.basename()", path.basename(filePath));
// 输出: file.txt

// path.basename() - 获取不带扩展名的文件名
console.log("path.basename()", path.basename(filePath, ".txt"));
// 输出: file

// path.extname() - 获取扩展名
console.log("path.extname()", path.extname(filePath));
// 输出: .txt

// ==================== 4. 路径解析与格式化 ====================
// path.parse() - 将路径字符串解析为对象
console.log("path.parse()", path.parse(filePath));
// 输出: { root: '/', dir: '/home/user/documents', base: 'file.txt', ext: '.txt', name: 'file' }

// path.format() - 将对象格式化为路径字符串
const pathObject = {
    root: "/",
    dir: "/home/user/documents",
    base: "file.txt",
    ext: ".txt",
    name: "file",
};
console.log("path.format()", path.format(pathObject));
// 输出: /home/user/documents/file.txt

// ==================== 5. 路径规范化 ====================
// path.normalize() - 规范化路径，处理 . 和 .. 以及多余的分隔符
console.log("path.normalize()", path.normalize("/foo/bar//baz/asdf/quux/.."));
// 输出: /foo/bar/baz/asdf

console.log("path.normalize()", path.normalize("C:\\temp\\\\foo\\bar\\..\\"));
// 输出: C:\temp\foo\ (Windows)

// ==================== 6. 相对路径 ====================
// path.relative() - 获取从 from 到 to 的相对路径
console.log("path.relative()", path.relative("/data/orandea/test/aaa", "/data/orandea/impl/bbb"));
// 输出: ../../impl/bbb

console.log("path.relative()", path.relative("/a/b/c", "/a/b/c/d/e"));
// 输出: d/e

// ==================== 7. 判断路径 ====================
// path.isAbsolute() - 判断是否为绝对路径
console.log("path.isAbsolute()", path.isAbsolute("/foo/bar")); // true
console.log("path.isAbsolute()", path.isAbsolute("./foo/bar")); // false
console.log("path.isAbsolute()", path.isAbsolute("C:\\foo\\bar")); // true (Windows)

// ==================== 8. 平台相关 ====================
// path.sep - 路径分隔符 (Windows: \, POSIX: /)
console.log("path.sep", path.sep);

// path.delimiter - 环境变量分隔符 (Windows: ;, POSIX: :)
console.log("path.delimiter", path.delimiter);

// path.win32 - Windows 风格的 path 方法
console.log("path.win32.basename()", path.win32.basename("C:\\temp\\myfile.html"));
// 输出: myfile.html

// path.posix - POSIX 风格的 path 方法
console.log("path.posix.basename()", path.posix.basename("/tmp/myfile.html"));
// 输出: myfile.html

// ==================== 9. 实际应用场景 ====================

// 场景1: 获取当前文件所在目录的其他文件
const configPath = path.join(__dirname, "config.json");
console.log("配置文件路径:", configPath);

// 场景2: 处理用户上传的文件名（安全处理）
const userInput = "../../../etc/passwd";
const safeName = path.basename(userInput); // 只取文件名，防止路径穿越
console.log("安全文件名:", safeName); // passwd

// 场景3: 动态构建静态资源路径
const staticDir = path.resolve(__dirname, "../public");
const assetPath = path.join(staticDir, "images", "logo.png");
console.log("静态资源路径:", assetPath);

// 场景4: 获取文件扩展名判断文件类型
function getFileType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const types = {
        ".jpg": "image",
        ".jpeg": "image",
        ".png": "image",
        ".gif": "image",
        ".mp4": "video",
        ".mp3": "audio",
        ".pdf": "document",
        ".txt": "text",
    };
    return types[ext] || "unknown";
}
console.log("文件类型:", getFileType("photo.JPG")); // image

// 场景5: 跨平台路径处理
function toPosixPath(p) {
    return p.split(path.sep).join(path.posix.sep);
}
console.log("POSIX路径:", toPosixPath("foo\\bar\\baz")); // foo/bar/baz

// ==================== 10. __dirname vs process.cwd() ====================
console.log("__dirname", __dirname); // 当前文件所在目录（固定）
console.log("process.cwd()", process.cwd()); // 当前工作目录（可变，取决于从哪里运行）

// 区别示例：
// 如果在 /home/user 目录下运行 node /project/src/index.js
// __dirname = /project/src
// process.cwd() = /home/user
