// 简单的文件下载示例服务（基于 Express）
import express from 'express'
import fs from 'fs'
import path from 'path'
import cors from 'cors'

// 创建 Express 应用实例
const app = express()

// 允许跨域访问，方便前端本地页面直接请求这个服务
app.use(cors())

// 解析 JSON 请求体，方便从 body 里拿到 fileName
app.use(express.json())

// 把 ./static 目录暴露为静态资源目录（可以直接通过 URL 访问静态文件）
app.use(express.static('./static'))

// 处理文件下载的接口：前端 POST /download，传入 { fileName }
app.post('/download', function (req, res) {
    // 从请求体中拿到要下载的文件名
    const fileName = req.body.fileName
    console.log('请求下载文件：', fileName)

    // 根据当前工程目录 + static 目录 拼出文件的绝对路径
    const filePath = path.join(process.cwd(), './static', fileName)

    // 如果文件不存在，返回 404，避免前端保存了一个错误页面
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: '文件不存在', fileName })
    }

    // 设置响应头，明确告诉浏览器这是 mp4 视频，并作为附件下载
    res.setHeader('Content-Type', 'video/mp4')
    res.setHeader('Content-Disposition', 'attachment; filename="' + encodeURIComponent(fileName) + '"')

    // 使用流的方式读取并返回文件，防止大文件阻塞
    const readStream = fs.createReadStream(filePath)
    readStream.on('error', error => {
        console.error('读取文件出错：', error)
        res.status(500).end('文件读取失败')
    })
    readStream.pipe(res)
})

// 启动服务，监听 3000 端口
app.listen(3000, () => {
    console.log('文件下载服务已启动：http://localhost:3000')
})
