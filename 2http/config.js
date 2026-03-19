module.exports = {
    server: {
        '/api': {
            target: 'http://localhost:3000', // 转发的地址
            changeOrigin: true, // 跨域
            pathRewrite: {
                '^/api': '/realapi' // 重写路径，将 /api 替换为 /realapi
            }
        }
    }
}
