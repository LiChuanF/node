export interface PluginContext {
  framework: 'vue' | 'react'
  language: 'js' | 'ts'
}

export function applyTypeScript(projectPath: string, context: PluginContext): void
