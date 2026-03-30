import express from 'express'

const app = express()

app.get('/info', (req, res) => {
    res.send({
        code: 200,
        port: parseInt(process.argv[2]),
    })
})

app.get('/', (req, res) => {
    res.send({
        code: 200
    })
})

app.listen(process.argv[2], () => console.log(`Server running on port ${process.argv[2]}`))
