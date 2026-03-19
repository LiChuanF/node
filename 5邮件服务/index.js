// 邮件服务 重点使用两个库，nodemailer 和 js-yaml

import nodemailer from 'nodemailer'
import yaml from 'js-yaml'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const mailConfig = yaml.load(fs.readFileSync(path.join(process.cwd(), 'config.yaml'), 'utf8')) // 加载配置文件
// 配置 nodemailer  transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
    auth: {
        user: mailConfig.user,
        pass: mailConfig.pass
    }
})

http.createServer((req, res) => {
    const { url, method } = req

    // 设置 CORS
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (method === 'OPTIONS') {
        res.writeHead(200)
        res.end()
        return
    }

    if (method === 'POST' && url === '/api/send-mail') {
        let body = ''

        req.on('data', chunk => {
            body += chunk.toString()
        })

        req.on('end', () => {
            try {
                const data = JSON.parse(body)
                const { from, to, subject, text, html, template } = data

                // 基础参数校验
                if (!to || !subject) {
                    res.writeHead(400, { 'Content-Type': 'application/json' })
                    res.end(JSON.stringify({ error: '缺少必要参数: to 和 subject' }))
                    return
                }

                // 如果使用模板
                let emailContent = text
                let emailHtml = html

                if (template === 'dismissal') {
                    const { name, dismissalDate, handoverDate, company, department, manager, phone, date } = data

                    // 模板参数校验
                    if (!name || !dismissalDate || !handoverDate || !company || !department || !manager || !phone || !date) {
                        res.writeHead(400, { 'Content-Type': 'application/json' })
                        res.end(JSON.stringify({ error: '使用 dismissal 模板时缺少必要参数' }))
                        return
                    }

                    emailContent = `尊敬的【${name}】：

您好。

感谢您在任职期间为公司所付出的努力与贡献。经过公司综合评估并慎重讨论，我们很遗憾地通知您：公司决定自【${dismissalDate}】起，与您解除劳动关系。

该决定是基于公司当前的业务调整及岗位需求变化作出的，与您个人品质无关。公司将严格依据相关法律法规及劳动合同约定，妥善处理薪资结算、未休年假、社会保险及其他相关事宜。

请您于【${handoverDate}】前完成工作交接，并与人力资源部联系办理离职手续。

如您对本通知或相关安排有任何疑问，欢迎随时与我们沟通。

再次感谢您在公司期间的付出，祝愿您在未来的职业发展中一切顺利。

此致
敬礼

【${company}】
【${department}】
【${manager}】
【${phone}】
【${date}】`
                } else if (!text && !html) {
                    // 如果不使用模板，必须提供 text 或 html
                    res.writeHead(400, { 'Content-Type': 'application/json' })
                    res.end(JSON.stringify({ error: '缺少邮件内容: text 或 html' }))
                    return
                }

                transporter.sendMail(
                    {
                        from: from || mailConfig.user,
                        to,
                        subject,
                        text: emailContent,
                        html: emailHtml
                    },
                    (err, info) => {
                        if (err) {
                            console.error('发送失败:', err)
                            res.writeHead(500, { 'Content-Type': 'application/json' })
                            res.end(JSON.stringify({ error: '邮件发送失败', details: err.message }))
                        } else {
                            console.log('发送成功:', info.messageId)
                            res.writeHead(200, { 'Content-Type': 'application/json' })
                            res.end(
                                JSON.stringify({
                                    success: true,
                                    message: '邮件发送成功',
                                    messageId: info.messageId
                                })
                            )
                        }
                    }
                )
            } catch (error) {
                console.error('解析错误:', error)
                res.writeHead(400, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ error: '请求格式错误' }))
            }
        })
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: '接口不存在' }))
    }
}).listen(3000, () => {
    console.log('邮件服务运行在 http://localhost:3000')
})
