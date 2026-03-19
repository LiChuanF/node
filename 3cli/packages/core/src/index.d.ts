export interface CreateProjectOptions {
    framework: 'vue' | 'react'
    language: 'js' | 'ts'
    plugins: Array<(projectPath: string, options: CreateProjectOptions) => void>
}

export function checkPath(targetPath: string): boolean
export function copyDir(src: string, dest: string, variables?: Record<string, string>): void
export function removeDir(targetPath: string): void
export function createProject(templateDir: string, projectPath: string, projectName: string, options?: CreateProjectOptions): boolean
