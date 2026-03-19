import ora from 'ora'
import chalk from 'chalk'
import { copyDir } from './file.js'

/**
 * 创建项目
 * @param {string} templateDir - 模板目录路径
 * @param {string} projectPath - 项目目标路径
 * @param {string} projectName - 项目名称
 * @param {object} options - 额外选项
 * @param {string} options.language - 语言 'js' | 'ts'
 * @param {string} options.framework - 框架 'vue' | 'react'
 * @param {Function[]} options.plugins - 插件函数数组
 */
export const createProject = (templateDir, projectPath, projectName, options = {}) => {
    const spinner = ora('正在创建项目...').start()

    try {
        const { plugins = [] } = options

        // 1. 复制基础模板
        copyDir(templateDir, projectPath, { projectName })

        // 2. 应用插件
        for (const plugin of plugins) {
            plugin(projectPath, options)
        }

        spinner.succeed(chalk.green('项目创建成功！'))
        return true
    } catch (error) {
        spinner.fail(chalk.red('项目创建失败'))
        throw error
    }
}
