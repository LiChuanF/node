import express from 'express'

const router = express.Router()

// 李白《梦游天姥吟留别》
const poem = `海客谈瀛洲，烟涛微茫信难求。
越人语天姥，云霞明灭或可睹。
天姥连天向天横，势拔五岳掩赤城。
天台四万八千丈，对此欲倒东南倾。
我欲因之梦吴越，一夜飞度镜湖月。
湖月照我影，送我至剡溪。谢公宿处今尚在，渌水荡漾清猿啼。
脚著谢公屐，身登青云梯。
半壁见海日，空中闻天鸡。
千岩万转路不定，迷花倚石忽已暝。
熊咆龙吟殷岩泉，栗深林兮惊层巅。
云青青兮欲雨，水澹澹兮生烟。列缺霹雳，丘峦崩摧。洞天石扉，訇然中开。
青冥浩荡不见底，日月照耀金银台。
霓为衣兮风为马，云之君兮纷纷而来下。
虎鼓瑟兮鸾回车，仙之人兮列如麻。
忽魂悸以魄动，恍惊起而长嗟。惟觉时之枕席，失向来之烟霞。
世间行乐亦如此，古来万事东流水。
别君去兮何时还？且放白鹿青崖间，须行即骑访名山。
安能摧眉折腰事权贵，使我不得开心颜！`

router.get('/see', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream')  // 设置响应头为 SSE 格式
    res.setHeader('Cache-Control', 'no-cache') // 不缓存响应，实时推送
    res.setHeader('Connection', 'keep-alive') // 保持连接，不关闭
    res.status(200)

    let index = 0
    const interval = setInterval(() => {
        if (index < poem.length) {
            res.write('event: poem\n')
            res.write('data: ' + poem[index] + '\n\n')
            index++
        } else {
            // 诗句发送完毕，发送结束标记
            res.write('event: end\n') // 自定义事件名  不写也可以,默认事件名为 message
            res.write('data: 诗句发送完毕\n\n')
            clearInterval(interval)
            res.end()
        }
    }, 100) // 每 100ms 发送一个字

    // 客户端断开连接时清理定时器
    req.on('close', () => {
        clearInterval(interval)
    })
})

export default router
