const mongoose = require('mongoose')

// 定义 carv 数据模型
const carvSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        }
    },
    {
        collection: 'carv'
    }
)

// 导出 model 模块
module.exports = mongoose.model('carv', carvSchema)
