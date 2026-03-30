import fastify from 'fastify'
import fp from 'fastify-plugin'

const app = fastify()

const fn = fp((fastify,opts,done) =>{
    // done === next 
    fastify.decorate('add',(a,b) => a + b)
    done()
})

app.register(fn)


app.post('/add',(request,reply) =>{
    return {
        message: 'success',
        data: [
            {
                a: request.body.a,
                b: request.body.b,
                result: app.add(request.body.a,request.body.b)
            }
        ]
    }
})

app.listen({ port: 3000 }). then(() =>{
    console.log('server is running on port: 3000');
})