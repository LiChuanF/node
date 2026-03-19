import puppeteer from 'puppeteer'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

const btnText = process.argv[2] || '前端' // 获取命令行参数
const projectRoot = process.cwd()
const venvPythonWin = path.join(projectRoot, '.venv', 'Scripts', 'python.exe')
const venvPythonPosix = path.join(projectRoot, '.venv', 'bin', 'python')
const pythonCmd = fs.existsSync(venvPythonWin)
    ? venvPythonWin
    : (fs.existsSync(venvPythonPosix) ? venvPythonPosix : 'python')

const browser = await puppeteer.launch({
    headless: false
})

const page = await browser.newPage()
page.setViewport({
    width: 1980,
    height: 1300
})

await page.goto('https://juejin.cn/')

await page.waitForSelector('.side-navigator-wrap')

const elements = await page.$$('.side-navigator-wrap .nav-item-wrap span') //获取menu下面的span

const articleList = []

// 定义采集函数
const collectFunc = async () => {
    await page.waitForSelector('.entry-list') // 等待文章列表加载完成
    const elements = await page.$$('.entry-list .title-row a')  // 获取文章列表中的标题元素
    for await (let el of elements) {
        const text = await el.getProperty('innerText')
        const name = await text.jsonValue()
        articleList.push(name)
    }
    const pythonProcess = spawn(pythonCmd, ['index.py', ...articleList]) // 打开文章列表中的所有文章
    pythonProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`)
    })
    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`)
    })
    pythonProcess.on('close', (code) => {
        console.log(`子进程退出,退出码 ${code}`)
    })
    console.log(articleList)
}

for await (let el of elements) {
    const text = await el.getProperty('innerText') //获取span的属性
    const name = await text.jsonValue() //获取内容
    if (name.trim() === (btnText || '前端')) {
        await el.click() //自动点击对应的菜单
        await collectFunc() //调用函数
    }
}
