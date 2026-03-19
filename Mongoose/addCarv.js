const mongoose = require('mongoose')
const Carv = require('./models/carv')

// 连接数据库
const connectDb = async () => {
    await mongoose.connect('mongodb://localhost:27017/lol')
    console.log('数据库连接成功')
}

// 添加特斯拉数据
const addTesla = async () => {
    try {
        await connectDb()

        const tesla = await Carv.create({
            name: '特斯拉'
        })

        console.log('数据添加成功:', tesla)
        process.exit(0)
    } catch (err) {
        console.error('添加数据失败:', err)
        process.exit(1)
    }
}

addTesla()
