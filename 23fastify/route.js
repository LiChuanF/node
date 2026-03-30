import fastify from "fastify";

const app = fastify()

app.route({
    url: '/add',
    method: 'POST',
    // 处理函数
    handler: (request, reply) => {
        console.log(request.body);
        
        return {
            message: 'success',
            data: [
                {
                    a: request.body.a,
                    b: request.body.b,
                    result: request.body.a + request.body.b
                }
            ]
        }
    },
    // 序列化入参以及出参
    schema: {
        body: {
            type: 'object',
            properties: {
                a: {
                    type: 'number'
                },
                b: {
                    type: 'number'
                }
            }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                message: {
                    type: 'string'
                },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            a: {
                                type: 'number'
                            },
                            b: {
                                type: 'number'
                            },
                            result: {
                                type: 'number'
                            }
                        }
                    }
                }
            }
        }
    },
    // 验证入参
    validate: {
        source: 'body',
        schema: {
            type: 'object',
            properties: {
                a: {
                    type: 'number'
                },
                b: {
                    type: 'number'
                }
            }
        }
    }
})

app.listen({ port: 3000 }). then(() =>{
    console.log('server is running on port: 3000');
})