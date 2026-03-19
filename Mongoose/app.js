const express = require('express');
const app = express();

//引入刚才定义的hero路由
const hero = require('./router')
app.use('/api',hero)

app.get('/', (req, res) => {
    res.send('Hello, World!');
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})

