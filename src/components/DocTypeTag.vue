<script setup lang="ts">
/**
 * 文献类型标签（配色取自 detail.html 的 .meta-tag.type-*）
 */
import { computed } from 'vue'
import type { DocType } from '@/types'

const props = withDefaults(
  defineProps<{
    type: DocType
    /** compact 用于列表表格内的小号标签 */
    compact?: boolean
  }>(),
  { compact: false }
)

const TYPE_COLORS: Record<DocType, { color: string; background: string }> = {
  图书: { color: '#45767A', background: 'rgba(69,118,122,0.1)' },
  折页: { color: '#2C5F8A', background: 'rgba(44,95,138,0.1)' },
  期刊: { color: '#8B5E3C', background: 'rgba(139,94,60,0.1)' },
  宣传册: { color: '#DD7138', background: 'rgba(221,113,56,0.1)' },
  地图: { color: '#52A368', background: 'rgba(82,163,104,0.1)' },
  视频: { color: '#3A7CA5', background: 'rgba(58,124,165,0.1)' },
}

const style = computed(() => TYPE_COLORS[props.type] || TYPE_COLORS.图书)
</script>

<template>
  <span class="doc-type-tag" :class="{ compact }" :style="style">{{ type }}</span>
</template>

<style scoped>
.doc-type-tag {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  line-height: 1.4;
  white-space: nowrap;
}

.doc-type-tag.compact {
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 500;
}
</style>
