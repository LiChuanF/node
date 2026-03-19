import schedule from "node-schedule";
import config from "./config.js";

let inFlight = false;
async function runOnce() {
    if (inFlight) {
        console.log("上一次请求未结束，本次跳过：", new Date().toString());
        return;
    }

    inFlight = true;
    const startedAt = Date.now();
    console.log("触发时间：", new Date().toString());

    const ac = new AbortController();
    const timeout = setTimeout(() => ac.abort(), 10_000);

    try {
        const res = await fetch(config.check_url, {
            method: "POST",
            headers: {
                Referer: config.url,
                Cookie: config.cookie,
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            },
            signal: ac.signal,
        });

        const body = await res.text();
        const ms = Date.now() - startedAt;
        console.log(`请求完成：HTTP ${res.status}，耗时 ${ms}ms`);

        if (res.ok) console.log(body);
        else console.error(`HTTP ${res.status} ${res.statusText}\n${body}`);
    } catch (err) {
        const ms = Date.now() - startedAt;
        console.error(`请求失败（耗时 ${ms}ms）：`, err);
    } finally {
        clearTimeout(timeout);
        inFlight = false;
    }
}

// 启动后先跑一次，便于立刻看到输出
runOnce();

// 每天 00:30:00 执行一次
const job = schedule.scheduleJob("0 30 0 * * *", runOnce);
console.log("定时任务已启动。下一次触发时间：", job.nextInvocation()?.toString?.() ?? String(job.nextInvocation()));
