const http2 = require('http2')
const fs = require('fs')
const path = require('path')

const certDir = path.join(__dirname, 'cert')
const keyPath = path.join(certDir, 'server.key')
const certPath = path.join(certDir, 'server.crt')
const isSecure = fs.existsSync(keyPath) && fs.existsSync(certPath)

const server =
    isSecure ?
        http2.createSecureServer({
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath)
        })
    :   http2.createServer()

server.on('stream', (stream, headers) => {
    const requestPath = headers[':path'] || '/'
    if (requestPath === '/json') {
        const body = JSON.stringify({ ok: true, path: requestPath, http2: true })
        stream.respond({
            'content-type': 'application/json; charset=utf-8',
            ':status': 200
        })
        stream.end(body)
        return
    }

    const body = `<html><body><h1>HTTP/2 OK</h1><p>${requestPath}</p></body></html>`
    stream.respond({
        'content-type': 'text/html; charset=utf-8',
        ':status': 200
    })
    stream.end(body)
})

const port = Number(process.env.PORT) || (isSecure ? 8443 : 8080)
const host = process.env.HOST || '0.0.0.0'

server.listen(port, host, () => {
    process.stdout.write(`HTTP/2 server listening on ${isSecure ? 'https' : 'http'}://${host}:${port}\n`)
})
