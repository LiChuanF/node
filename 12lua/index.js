import express from "express";
import Redis from "ioredis";
import fs from "node:fs";
const lua = fs.readFileSync("./test.lua", "utf8");

const redis = process.env.REDIS_URL?.trim()
    ? new Redis(process.env.REDIS_URL.trim())
    : new Redis({
          host: process.env.REDIS_HOST?.trim() || "127.0.0.1",
          port: Number(process.env.REDIS_PORT) || 6379,
      });

redis.on("error", (err) => {
    console.error("[redis] connection error:", err?.message || err);
});

const app = express();

//限流阀
const TIME = 30; // 时间窗口
const CHANGE = 5; // 时间窗口内允许的最大请求次数
const KEY = "lottery"; // 限流的key

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

app.get("/lottery", (req, res) => {
    //lua 就是lua的脚本
    //1 代表有一个key
    //key就是接受的key
    //TIME 是 第一个参数
    //CHANGE 是 第二个参数
    redis.eval(lua, 1, KEY, CHANGE, TIME, (err, result) => {
        console.log(result);

        if (err) {
            console.error("[redis] eval error:", err?.message || err);
            res.status(500).send("Redis异常，请检查服务是否可用");
            return;
        }

        console.log("[lottery] eval result:", result, "type:", typeof result);
        const ok = Number(result) === 1;
        if (ok) res.send("抽奖成功");
        else res.send("请稍后重试！");
    });
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});
