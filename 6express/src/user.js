import express from 'express'

const router = express.Router()

router.post('/login', (req, res) => {
    const { username, password } = req.body

    // 检查账号密码是否存在
    if (!username || !password) {
        return res.json({
            code: 400,
            msg: '账号或密码不能为空',
        })
    }

    res.json({
        code: 200,
        msg: '登录成功',
        data: { username },
    })
})

router.post('/register', (req, res) => {
    const { username, password } = req.body

    // 检查账号密码是否存在
    if (!username || !password) {
        return res.json({
            code: 400,
            msg: '账号或密码不能为空',
        })
    }

    res.json({
        code: 200,
        msg: '注册成功',
        data: { username },
    })
})

export default router
