import fastify from 'fastify'


const app = fastify()

// 支持get
// 给前端反值
//1. 没有.json方法，但是可以使用.send方法
//2. 直接return
app.get('/', (req, res) => {
    console.log(req.query);
    
    res.send({ message: 'Hello World!' })
    // return {
    //     message: 'Hello World!'
    // }
})

// 天然支持post
app.post('/login', (req, res) => {
    console.log(req.body);
    
    res.send({ message: 'Login successful!' })
})

app.listen({ port: 3000 }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})
