declare module '@lcf-cli/core' {
    export function checkPath(targetPath: string): boolean
    export function createProject(
        templateDir: string,
        projectPath: string,
        projectName: string,
        options?: {
            framework: string
            language: string
            plugins: Function[]
        }
    ): boolean
}

declare module '@lcf-cli/plugin-typescript' {
    export function applyTypeScript(projectPath: string, context: { framework: string; language: string }): void
}
