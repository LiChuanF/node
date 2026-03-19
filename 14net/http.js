import net from 'node:net'

const response = `
HTTP/1.1 200 OK
Content-Type: text/html

<html>
    <body>
        <h1>Hello World</h1>
    </body>
</html>
`
const server = net.createServer(socket => {
    socket.write(response)
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

server.listen(7777, () => {
    console.log('Server is running on port 7777')
})