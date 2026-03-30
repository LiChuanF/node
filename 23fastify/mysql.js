import fastify from 'fastify'
import mysql from '@fastify/mysql'
const app = fastify()

app.register(mysql, {
    promise: true,
    connectionString: 'mysql://root:123456@localhost:3306/xiaomi'
})

// 测试数据库连接
app.get('/test', async (req, reply) => {
    try {
        const connection = await app.mysql.getConnection()
        const [rows] = await connection.query('SELECT 1 as test')
        connection.release()
        reply.send({ status: 'ok', result: rows })
    } catch (err) {
        console.error('Database connection error:', err)
        reply.status(500).send({ error: err.message })
    }
})

app.get('/user/:id', (req, reply) => {
    app.mysql.getConnection(onConnect)

    async function onConnect (err, client) {
        if (err) return reply.send(err)

        try {
            const result = await client.query(
                'SELECT id, username, hash, salt FROM user WHERE id=?', [req.params.id]
            )
            reply.send(result)
        } finally {
            client.release()
        }
    }
})

app.post('/add', async (request, reply) => {
    try {
        const connection = await app.mysql.getConnection()
        const { name, hobby } = request.body
        
        try {
            const [result] = await connection.query(
                "INSERT INTO user(create_time, name, hobby) VALUES(?, ?, ?)", 
                [new Date(), name, hobby]
            )
            reply.send({ message: 'success', insertId: result.insertId })
        } catch (e) {
            console.error('Query error:', e)
            reply.status(500).send({ error: e.message })
        } finally {
            connection.release()
        }
    } catch (err) {
        console.error('Connection error:', err)
        reply.status(500).send({ error: err.message })
    }
})

//查询
app.get('/list', async (request, reply) => {
    try {
        const connection = await app.mysql.getConnection()
        
        try {
            const [result] = await connection.query("SELECT * FROM user")
            reply.send({ result })
        } finally {
            connection.release()
        }
    } catch (err) {
        console.error('Error:', err)
        reply.status(500).send({ error: err.message })
    }
})

app.listen({ port: 3000 }, err => {
    if (err) throw err
    console.log(`server listening on ${app.server.address().port}`)
})
