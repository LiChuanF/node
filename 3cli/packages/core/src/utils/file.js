import fs from 'fs-extra'
import path from 'node:path'

/**
 * 检查路径是否存在
 */
export const checkPath = targetPath => {
    return fs.existsSync(targetPath)
}

/**
 * 复制目录并替换模板变量
 */
export const copyDir = (src, dest, variables = {}) => {
    fs.mkdirSync(dest, { recursive: true })
    const entries = fs.readdirSync(src, { withFileTypes: true })

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name)
        const destPath = path.join(dest, entry.name)

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath, variables)
        } else {
            let content = fs.readFileSync(srcPath, 'utf-8')
            Object.entries(variables).forEach(([key, value]) => {
                content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
            })
            fs.writeFileSync(destPath, content)
        }
    }
}

/**
 * 删除目录
 */
export const removeDir = targetPath => {
    fs.rmSync(targetPath, { recursive: true, force: true })
}
