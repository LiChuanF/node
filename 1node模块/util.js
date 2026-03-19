const util = require("util");
const fs = require("fs");

/**
 * 1. util.promisify()
 * 将传统的“错误优先”(error-first) 的回调函数转换为返回 Promise 的函数。
 * 这是 util 模块最常用的功能之一。
 */
const readFile = util.promisify(fs.readFile);

console.log("--- util.promisify ---");
readFile(__filename)
    .then((data) => {
        console.log(`成功读取文件，内容长度: ${data.length}`);
    }) 
    .catch((err) => {
        console.error("读取失败:", err);
    });

// 或者在 async/await 中使用
async function runPromisify() {
    try {
        const data = await readFile(__filename);
        // console.log('Async/Await 读取成功');
    } catch (err) {
        console.error(err);
    }
}
runPromisify();

/**
 * 2. util.format()
 * 类似于 C 语言的 printf，用于格式化字符串。
 * %s: 字符串, %d: 数值, %j: JSON, %%: 百分号
 */
console.log("\n--- util.format ---");
const str = util.format("%s 已经 %d 岁了", "Node.js", 14);
console.log(str);
console.log(util.format("JSON 数据: %j", { name: "Trae", type: "AI" }));

/**
 * 3. util.inspect()
 * 将对象转换为字符串，通常用于调试。
 * 它可以处理循环引用，并且可以控制显示的深度。
 */
console.log("\n--- util.inspect ---");
const complexObj = {
    a: 1,
    b: {
        c: 2,
        d: [3, 4],
        e: { f: 5 },
    },
};
// depth: 1 表示只展开一层
console.log(util.inspect(complexObj, { showHidden: false, depth: 1, colors: true }));

/**
 * 4. util.callbackify()
 * 与 promisify 相反，将 Promise 函数转换回回调形式（较少用，主要用于兼容旧代码）。
 */
console.log("\n--- util.callbackify ---");
async function fn() {
    return "hello world";
}
const callbackFunction = util.callbackify(fn);

callbackFunction((err, ret) => {
    if (err) throw err;
    console.log("Callbackify 返回:", ret);
});

/**
 * 5. util.types
 * 提供各种内置类型的类型检查。
 */
console.log("\n--- util.types ---");
console.log("是否为 Promise:", util.types.isPromise(Promise.resolve()));
console.log("是否为 RegExp:", util.types.isRegExp(/abc/));
console.log("是否为 Date:", util.types.isDate(new Date()));

/**
 * 6. util.inherits (已弃用，建议使用 ES6 class extends)
 * 以前用于实现继承，现在推荐直接使用 class 和 extends 关键字。
 * 这里仅作知识点了解。
 */
function Base() {
    this.name = "base";
}
Base.prototype.showName = function () {
    console.log(this.name);
};

function Sub() {
    this.name = "sub";
}
util.inherits(Sub, Base);

console.log("\n--- util.inherits (Legacy) ---");
const obj = new Sub();
obj.showName();
