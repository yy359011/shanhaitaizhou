<script setup lang="ts">
/**
 * 封面图：加载失败时展示占位（对应 detail.html 的 .cover-placeholder）
 */
import { ref, watch } from 'vue'
import { COVER_FALLBACK_TEXT } from '@/constants/covers'

const props = defineProps<{
  src: string
  alt?: string
}>()

const failed = ref(false)

watch(
  () => props.src,
  () => {
    failed.value = false
  }
)
</script>

<template>
  <div class="cover-image">
    <img v-if="src && !failed" :src="src" :alt="alt || ''" @error="failed = true" />
    <div v-else class="cover-placeholder">{{ COVER_FALLBACK_TEXT }}</div>
  </div>
</template>

<style scoped>
.cover-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--st-bg-alt);
}

.cover-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-placeholder {
  font-size: 12px;
  color: var(--st-text-light);
  letter-spacing: 2px;
  background: linear-gradient(160deg, #f2efe8 0%, #e5e0d4 100%);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
