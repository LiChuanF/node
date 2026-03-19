import net from 'node:net'

const client = net.createConnection(
    {
        host: 'localhost',
        port: 3000
    },
    () => {
        console.log('Connected to server')
        client.write('Hello from client')
        client.on('data', data => {
            console.log('Received data from server:', data.toString())
        })
        client.on('error', err => {
            console.error(err)
        })
        client.on('close', () => {
            console.log('Server disconnected')
        })
    }
)
