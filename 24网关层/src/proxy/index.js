export default [
    {
        upstream: 'http://localhost:9001',
        prefix: '/pc',
        rewritePrefix: '',
        httpMethods: ['GET', 'POST', 'PUT', 'DELETE']
    },
    {
        upstream: 'http://localhost:9002',
        prefix: '/mobile',
        rewritePrefix: '',
        httpMethods: ['GET', 'POST', 'PUT', 'DELETE']
    }
]