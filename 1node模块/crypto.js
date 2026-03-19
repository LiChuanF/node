/**
 * Node.js crypto 模块学习
 *
 * crypto 模块提供加密功能，包括：
 * 1. 哈希算法 (Hash) - MD5, SHA256 等
 * 2. HMAC - 带密钥的哈希
 * 3. 对称加密 (Cipher/Decipher) - AES 等
 * 4. 非对称加密 - RSA 等
 * 5. 随机数生成
 */

const crypto = require("crypto");

// ==================== 1. 哈希算法 (Hash) ====================
console.log("===== 1. 哈希算法 =====");

// MD5 哈希   创新哈希对象，更新哈西对象，并以十六进制字符串个形式输出
const md5Hash = crypto.createHash("md5").update("hello world").digest("hex");
console.log("MD5:", md5Hash);

// SHA256 哈希
const sha256Hash = crypto.createHash("sha256").update("hello world").digest("hex");
console.log("SHA256:", sha256Hash);

// 多次 update（适合大文件分块处理）
const hash = crypto.createHash("sha256");
hash.update("hello");
hash.update(" world");
console.log("SHA256 (多次update):", hash.digest("hex"));

// ==================== 2. HMAC ====================
console.log("\n===== 2. HMAC =====");

const secret = "my-secret-key";
const hmac = crypto.createHmac("sha256", secret).update("hello world").digest("hex");
console.log("HMAC-SHA256:", hmac);

// ==================== 3. 对称加密 AES ====================
console.log("\n===== 3. 对称加密 AES =====");

// AES-256-CBC 加密
function aesEncrypt(text, key) {
    const iv = crypto.randomBytes(16); //生成一个随机的 16 字节的初始化向量 (IV)
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);  //创建加密实例，使用 AES-256-CBC 算法，提供密钥和初始化向量

    // 对输入数据进行加密，并输出加密结果的十六进制表示
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return { iv: iv.toString("hex"), encrypted };
}

// AES-256-CBC 解密
function aesDecrypt(encrypted, key, iv) {
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, Buffer.from(iv, "hex"));
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

const aesKey = crypto.randomBytes(32); // 生成一个随机的 32 字节的密钥
const plainText = "这是需要加密的内容";
const encryptedData = aesEncrypt(plainText, aesKey);
console.log("加密结果:", encryptedData);

const decryptedText = aesDecrypt(encryptedData.encrypted, aesKey, encryptedData.iv);
console.log("解密结果:", decryptedText);

// ==================== 4. 非对称加密 RSA ====================
console.log("\n===== 4. 非对称加密 RSA =====");

// 生成 RSA 密钥对
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" }, 
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

console.log("公钥 (前100字符):", publicKey.substring(0, 100) + "...");

// RSA 加密
const rsaPlainText = "RSA加密测试";
const rsaEncrypted = crypto.publicEncrypt(publicKey, Buffer.from(rsaPlainText));
console.log("RSA加密结果:", rsaEncrypted.toString("base64").substring(0, 50) + "...");

// RSA 解密
const rsaDecrypted = crypto.privateDecrypt(privateKey, rsaEncrypted);
console.log("RSA解密结果:", rsaDecrypted.toString());

// ==================== 5. 数字签名 ====================
console.log("\n===== 5. 数字签名 =====");

const signData = "需要签名的数据";

// 签名
const sign = crypto.createSign("SHA256");
sign.update(signData);
const signature = sign.sign(privateKey, "hex");
console.log("签名:", signature.substring(0, 50) + "...");

// 验签
const verify = crypto.createVerify("SHA256");
verify.update(signData);
const isValid = verify.verify(publicKey, signature, "hex");
console.log("验签结果:", isValid);

// ==================== 6. 随机数生成 ====================
console.log("\n===== 6. 随机数生成 =====");

// 生成随机字节
const randomBytes = crypto.randomBytes(16);
console.log("随机字节 (hex):", randomBytes.toString("hex"));

// 生成随机整数
const randomInt = crypto.randomInt(1, 100);
console.log("随机整数 (1-100):", randomInt);

// 生成 UUID
const uuid = crypto.randomUUID();
console.log("UUID:", uuid);

// ==================== 7. 密码哈希 (pbkdf2) ====================
console.log("\n===== 7. 密码哈希 pbkdf2 =====");

const password = "user-password";
const salt = crypto.randomBytes(16);

// 同步方式
const derivedKey = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512");
console.log("派生密钥:", derivedKey.toString("hex").substring(0, 50) + "...");

// ==================== 8. scrypt (更安全的密码哈希) ====================
console.log("\n===== 8. scrypt =====");

const scryptKey = crypto.scryptSync(password, salt, 64);
console.log("scrypt密钥:", scryptKey.toString("hex").substring(0, 50) + "...");

console.log("\n===== 学习完成 =====");
