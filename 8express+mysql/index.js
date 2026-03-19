// -- Active: 1769050084707@@127.0.0.1@3306
import fs from 'node:fs'
import path from 'node:path'
import express from 'express'
import yaml from 'js-yaml'
import knex from 'knex'
const yamlFile = fs.readFileSync(path.resolve(process.cwd(), 'db.config.yaml'), 'utf8')
const config = yaml.load(yamlFile)

// const sql = await mysql.createConnection(config.db)
const db = knex({
    client: 'mysql2',
    connection: config.db
})

db.schema
    .createTableIfNotExists('table', table => {
        table.increments('id').primary()
        table.string('name')
        table.integer('age')
        table.string('email')
        table.timestamps(true, true)
    })
    .then(() => {
        console.log('Table created successfully')
    })

const app = express()

app.use(express.json()) // 解析请求体为 JSON 格式

// 查询
app.get('/', async (req, res) => {
    // const [data] = await sql.query('SELECT * FROM user')
    const data = await db('user').select()
    res.send(data)
})

// 单个查询param
app.get('/user/:id', async (req, res) => {
    console.log(req.params)
    const { id } = req.params
    // const [data] = await sql.query('SELECT * FROM user WHERE id = ?', [id])
    const data = await db('user').where({ id })
    res.send(data)
})

// 新增
app.post('/create', async (req, res) => {
    const { name, age } = req.body
    // await sql.query('INSERT INTO user (name, age) VALUES (?, ?)', [name, age])
    await db('user').insert({ name, age })
    res.send({
        code: 200,
        msg: 'success'
    })
})

// 编辑
app.post('/update', async (req, res) => {
    const { name, age, id } = req.body
    // await sql.query('UPDATE user SET name = ?, age = ? WHERE id = ?', [name, age, id])
    await db('user').where({ id }).update({ name, age })
    res.send({
        code: 200,
        msg: 'success'
    })
})

// 删除
app.post('/delete', async (req, res) => {
    const { id } = req.body
    // await sql.query('DELETE FROM user WHERE id = ?', [id])
    await db('user').where({ id }).delete()
    res.send({
        code: 200,
        msg: 'success'
    })
})

app.listen(3000, () => {
    console.log('Server is running on port 3000: http://localhost:3000')
})
