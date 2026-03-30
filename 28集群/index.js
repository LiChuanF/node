import os from 'node:os'
import cluster from 'node:cluster'
import http from 'node:http'

const cpus = os.cpus().length

if (cluster.isPrimary) {
    for (let i = 0; i < cpus; i++) {
        cluster.fork()
    }
} else {
    http.createServer((req, res) => {
        res.end('hello world')
    }).listen(3000, () => {
        console.log('server is running on port 3000');
    })
}

