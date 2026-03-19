import express from 'express'

const router = express.Router()

router.post('/getList', (req, res) => {
    res.json({
        code: 200,
        msg: '登录成功',
        data: [
            {
                id: 1,
                name: 'trae',
                age: 18,
            },
            {
                id: 2,
                name: 'trae2',
                age: 19,
            },
            {
                id: 3,
                name: 'trae3',
                age: 20,
            },
        ],
    })
})

export default router
