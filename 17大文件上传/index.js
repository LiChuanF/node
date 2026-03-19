import express from 'express'
import multer from 'multer'
import cors from 'cors'
import fs from 'node:fs'
import path from 'node:path'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, `${req.body.index}-${req.body.fileName}`)
    }
})
const upload = multer({ storage })
const app = express()

app.use(cors())
app.use(express.json())

app.post('/up', upload.single('file'), (req, res) => {
    console.log(req.file)

    res.send('ok')
})

app.post('/merge', async (req, res) => {
    const uploadPath = './uploads'
    let files = fs.readdirSync(path.join(process.cwd(), uploadPath))
    files = files.sort((a, b) => a.split('-')[0] - b.split('-')[0])
    const writePath = path.join(process.cwd(), `video`, `${req.body.fileName}.mp4`)
    files.forEach(item => {
        fs.appendFileSync(writePath, fs.readFileSync(path.join(process.cwd(), uploadPath, item)))
        fs.unlinkSync(path.join(process.cwd(), uploadPath, item))
    })

    res.send('ok')
})

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})
