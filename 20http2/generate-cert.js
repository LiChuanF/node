const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const certDir = path.join(__dirname, 'cert')
const keyPath = path.join(certDir, 'server.key')
const certPath = path.join(certDir, 'server.crt')
const isCheck = process.argv.includes('--check')

const run = args => {
    const result = spawnSync('openssl', args, {
        stdio: 'inherit'
    })
    if (result.error && result.error.code === 'ENOENT') {
        process.stderr.write('未找到 openssl，请先安装并加入 PATH\n')
        return { status: 1 }
    }
    return result
}

if (isCheck) {
    const result = run(['version'])
    process.exit(result.status ?? 1)
}

fs.mkdirSync(certDir, { recursive: true })

const baseArgs = ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', keyPath, '-out', certPath, '-days', '365', '-subj', '/CN=localhost']

const withAltName = [...baseArgs, '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1']

let result = run(withAltName)
if (result.status !== 0) {
    result = run(baseArgs)
}

process.exit(result.status ?? 1)
