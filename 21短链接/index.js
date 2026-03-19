import express from 'express'
import knex from 'knex'
import shortid from 'shortid'

const db = knex({
    client: 'mysql2',
    connection: {
        host: 'localhost',
        user: 'root',
        password: '12345',
        database: 'short_line'
    }
})

const app = express()
app.use(express.json())

//接口创建短码并且关联url
app.post('/create_url', async (req, res) => {
    const { url } = req.body
    const id = shortid.generate()
    await db('short').insert({ id, url })
    res.send(`http://localhost:3000/${id}`)
})

// 获取短码,重定向到原始url
app.get('/:id', async (req, res) => {
    const { id } = req.params
    const result = await db('short').where({ id }).first()
    if (result) {
        res.redirect(result.url)
    } else {
        res.status(404).send('URL not found')
    }
})

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})
