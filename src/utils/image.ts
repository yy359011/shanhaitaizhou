/**
 * 图片资源工具
 * 项目原型中的 assets/ 位图统一改为「按提示词实时生成」的图片服务地址，
 * 保证任何环境下都能取到与原型语义一致的配图。
 */

export type ImageSize =
  | 'square_hd'
  | 'square'
  | 'portrait_4_3'
  | 'portrait_16_9'
  | 'landscape_4_3'
  | 'landscape_16_9'

const TEXT_TO_IMAGE = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image'

/** 生成一张配图地址 */
export function img(prompt: string, size: ImageSize = 'landscape_4_3'): string {
  return `${TEXT_TO_IMAGE}?prompt=${encodeURIComponent(prompt)}&image_size=${size}`
}
