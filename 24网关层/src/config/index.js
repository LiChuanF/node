export const rateLimitConfig = {
    max: 5,
    timeWindow: 1000 * 60,
}

export const cachingConfig = {
    max: 1000,
    expire: 1000 * 60,
}

export const breakerConfig = {
    timeout: 1000 * 6, //熔断时间
    errorThreshold: 50, //错误率阈值
    resetWindow: 1000 * 6, //重置窗口时间
}