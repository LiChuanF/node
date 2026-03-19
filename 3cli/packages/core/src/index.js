/**
 * @typedef {Object} CreateProjectOptions
 * @property {string} framework - 框架类型
 * @property {string} language - 语言类型
 * @property {Function[]} plugins - 插件数组
 */

export { checkPath, copyDir, removeDir } from './utils/file.js'
export { createProject } from './utils/createProject.js'
