import net from 'node:net'

const server = net.createServer(socket => {
    socket.write('Hello from server')
    socket.on('data', data => {
        console.log('Received data from client:', data.toString())
    })
    socket.on('error', err => {
        console.error(err)
    })
    socket.on('close', () => {
        console.log('Client disconnected')
    })
})

server.listen(3000, () => {
    console.log('Server is running on port 3000')
})
