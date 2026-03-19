process.on("message", msg => {
    console.log("子进程收到消息:", msg);
    process.send({ reply: "Hello from child", data: msg.data * 2 });
});
