/**
 * AuraWed 数据库索引
 * 导出所有本地数据库内容
 */

// 设计数据库
export * from './design-data'

// 策划数据库
export * from './planner-data'

// 故事数据库
export * from './story-data'

/**
 * 获取所有可用的配色方案
 */
export function getAllColorPalettes() {
  return colorPalettes
}

/**
 * 获取所有风格方向
 */
export function getAllStyleDirections() {
  return styleDirections
}

/**
 * 获取所有花艺风格
 */
export function getAllFloralStyles() {
  return floralStyles
}

/**
 * 获取所有灯光设计
 */
export function getAllLightingDescriptions() {
  return lightingDescriptions
}

/**
 * 获取所有预算模板
 */
export function getAllBudgetTemplates() {
  return budgetTemplates
}

/**
 * 获取所有流程模板
 */
export function getAllTimelineTemplates() {
  return timelineTemplates
}

/**
 * 获取所有区域模板
 */
export function getAllAreaTemplates() {
  return areaTemplates
}

/**
 * 获取所有服务套餐
 */
export function getAllServicePackages() {
  return servicePackages
}

/**
 * 获取所有故事模板
 */
export function getAllStoryTemplates() {
  return storyTemplates
}

/**
 * 根据ID获取故事模板
 */
export function getStoryTemplateById(id: string) {
  return storyTemplates.find(t => t.id === id)
}

// 导入
import {
  colorPalettes,
  styleDirections,
  floralStyles,
  lightingDescriptions,
  budgetTemplates,
  timelineTemplates,
  areaTemplates,
  servicePackages,
  storyTemplates,
  generateLocalStory,
  styleToTags
} from './story-data'
