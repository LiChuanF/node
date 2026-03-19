#!/usr/bin/env node

import { program } from 'commander'
import inquirer from 'inquirer'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'
import { checkPath, createProject } from '@lcf-cli/core'
import { applyTypeScript } from '@lcf-cli/plugin-typescript'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8'))

program.name('lcf-cli').version(chalk.green(packageJson.version)).description('快速创建项目模板')

program
    .command('create <projectName>')
    .alias('c')
    .description('创建新项目')
    .option('-f, --force', '强制覆盖已存在的目录')
    .action(async (projectName, options) => {
        const projectPath = path.resolve(process.cwd(), projectName)

        if (checkPath(projectPath)) {
            if (!options.force) {
                const { overwrite } = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'overwrite',
                        message: `目录 ${chalk.cyan(projectName)} 已存在，是否覆盖？`,
                        default: false
                    }
                ])
                if (!overwrite) {
                    console.log(chalk.yellow('已取消创建'))
                    return
                }
            }
            fs.rmSync(projectPath, { recursive: true })
        }

        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'framework',
                message: '请选择框架',
                choices: [
                    { name: 'Vue 3', value: 'vue' },
                    { name: 'React', value: 'react' }
                ]
            },
            {
                type: 'list',
                name: 'language',
                message: '请选择语言',
                choices: [
                    { name: 'JavaScript', value: 'js' },
                    { name: 'TypeScript', value: 'ts' }
                ]
            }
        ])

        try {
            const { framework, language } = answers
            const templateDir = path.join(__dirname, '../templates', framework)

            // 收集插件
            const plugins = []
            if (language === 'ts') {
                plugins.push(applyTypeScript)
            }

            createProject(templateDir, projectPath, projectName, {
                framework,
                language,
                plugins
            })

            console.log(`\n${chalk.green('🎉 项目创建成功！')}\n`)
            console.log(`  ${chalk.cyan('cd')} ${projectName}`)
            console.log(`  ${chalk.cyan('pnpm install')}`)
            console.log(`  ${chalk.cyan('pnpm dev')}\n`)
        } catch (error) {
            console.error(chalk.red('创建项目失败:'), error.message)
            process.exit(1)
        }
    })

program.parse()
