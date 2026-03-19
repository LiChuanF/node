import fs from 'fs-extra'
import path from 'node:path'

/**
 * TypeScript 插件
 * @param {string} projectPath - 项目路径
 * @param {object} context - 上下文信息 { framework: 'vue' | 'react' }
 */
export function applyTypeScript(projectPath, context) {
    const { framework } = context

    // 读取 package.json
    const pkgPath = path.join(projectPath, 'package.json')
    const pkg = fs.readJsonSync(pkgPath)

    // 添加 TypeScript 依赖
    pkg.devDependencies = pkg.devDependencies || {}
    pkg.devDependencies.typescript = '^5.3.0'

    if (framework === 'vue') {
        applyVueTypeScript(projectPath, pkg)
    } else if (framework === 'react') {
        applyReactTypeScript(projectPath, pkg)
    }

    // 保存 package.json
    fs.writeJsonSync(pkgPath, pkg, { spaces: 2 })
}

/**
 * 应用 Vue TypeScript
 */
function applyVueTypeScript(projectPath, pkg) {
    pkg.devDependencies['vue-tsc'] = '^1.8.0'
    pkg.scripts.build = 'vue-tsc && vite build'

    // 重命名文件
    fs.renameSync(path.join(projectPath, 'src/main.js'), path.join(projectPath, 'src/main.ts'))

    // 更新 index.html
    const indexHtml = fs.readFileSync(path.join(projectPath, 'index.html'), 'utf-8')
    fs.writeFileSync(path.join(projectPath, 'index.html'), indexHtml.replace('/src/main.js', '/src/main.ts'))

    // 更新 App.vue
    const appVue = fs.readFileSync(path.join(projectPath, 'src/App.vue'), 'utf-8')
    fs.writeFileSync(
        path.join(projectPath, 'src/App.vue'),
        appVue
            .replace('<script setup>', '<script setup lang="ts">')
            .replace(/const (\w+) = ref\(/g, 'const $1 = ref<string>(')
            .replace(/const count = ref<string>\(/g, 'const count = ref<number>(')
    )

    // 重命名 vite.config.js
    if (fs.existsSync(path.join(projectPath, 'vite.config.js'))) {
        fs.renameSync(path.join(projectPath, 'vite.config.js'), path.join(projectPath, 'vite.config.ts'))
    }

    // 生成 tsconfig.json
    fs.writeJsonSync(
        path.join(projectPath, 'tsconfig.json'),
        {
            compilerOptions: {
                target: 'ES2020',
                useDefineForClassFields: true,
                module: 'ESNext',
                lib: ['ES2020', 'DOM', 'DOM.Iterable'],
                skipLibCheck: true,
                moduleResolution: 'bundler',
                allowImportingTsExtensions: true,
                resolveJsonModule: true,
                isolatedModules: true,
                noEmit: true,
                jsx: 'preserve',
                strict: true,
                noUnusedLocals: true,
                noUnusedParameters: true,
                noFallthroughCasesInSwitch: true
            },
            include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
            references: [{ path: './tsconfig.node.json' }]
        },
        { spaces: 2 }
    )

    fs.writeJsonSync(
        path.join(projectPath, 'tsconfig.node.json'),
        {
            compilerOptions: {
                composite: true,
                skipLibCheck: true,
                module: 'ESNext',
                moduleResolution: 'bundler',
                allowSyntheticDefaultImports: true
            },
            include: ['vite.config.ts']
        },
        { spaces: 2 }
    )
}

/**
 * 应用 React TypeScript
 */
function applyReactTypeScript(projectPath, pkg) {
    pkg.devDependencies['@types/react'] = '^18.2.0'
    pkg.devDependencies['@types/react-dom'] = '^18.2.0'
    pkg.scripts.build = 'tsc && vite build'

    // 重命名文件
    fs.renameSync(path.join(projectPath, 'src/main.jsx'), path.join(projectPath, 'src/main.tsx'))
    fs.renameSync(path.join(projectPath, 'src/App.jsx'), path.join(projectPath, 'src/App.tsx'))

    // 更新 index.html
    const indexHtml = fs.readFileSync(path.join(projectPath, 'index.html'), 'utf-8')
    fs.writeFileSync(path.join(projectPath, 'index.html'), indexHtml.replace('/src/main.jsx', '/src/main.tsx'))

    // 更新 App.tsx
    const appContent = fs.readFileSync(path.join(projectPath, 'src/App.tsx'), 'utf-8')
    fs.writeFileSync(path.join(projectPath, 'src/App.tsx'), appContent.replace('useState(0)', 'useState<number>(0)'))

    // 更新 main.tsx
    const mainContent = fs.readFileSync(path.join(projectPath, 'src/main.tsx'), 'utf-8')
    fs.writeFileSync(path.join(projectPath, 'src/main.tsx'), mainContent.replace("document.getElementById('root')", "document.getElementById('root')!"))

    // 重命名 vite.config.js
    if (fs.existsSync(path.join(projectPath, 'vite.config.js'))) {
        fs.renameSync(path.join(projectPath, 'vite.config.js'), path.join(projectPath, 'vite.config.ts'))
    }

    // 生成 tsconfig.json
    fs.writeJsonSync(
        path.join(projectPath, 'tsconfig.json'),
        {
            compilerOptions: {
                target: 'ES2020',
                useDefineForClassFields: true,
                lib: ['ES2020', 'DOM', 'DOM.Iterable'],
                module: 'ESNext',
                skipLibCheck: true,
                moduleResolution: 'bundler',
                allowImportingTsExtensions: true,
                resolveJsonModule: true,
                isolatedModules: true,
                noEmit: true,
                jsx: 'react-jsx',
                strict: true,
                noUnusedLocals: true,
                noUnusedParameters: true,
                noFallthroughCasesInSwitch: true
            },
            include: ['src'],
            references: [{ path: './tsconfig.node.json' }]
        },
        { spaces: 2 }
    )

    fs.writeJsonSync(
        path.join(projectPath, 'tsconfig.node.json'),
        {
            compilerOptions: {
                composite: true,
                skipLibCheck: true,
                module: 'ESNext',
                moduleResolution: 'bundler',
                allowSyntheticDefaultImports: true
            },
            include: ['vite.config.ts']
        },
        { spaces: 2 }
    )
}
