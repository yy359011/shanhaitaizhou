<script setup lang="ts">
/**
 * 首页
 * 还原 index-user.html：英雄区 + 推荐导读 + 山海十景 + 舌尖山海
 * 说明：原型 assets/ 位图改为文生图服务地址（mock 内已生成）
 */
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { getScenerySpots, getFoodItems } from '@/api/home'
import { findLiteratureByTitle, getRecommendList } from '@/api/literature'
import CoverImage from '@/components/CoverImage.vue'
import { SYSTEM_SETTINGS } from '@/mock/admin'
import bannerUrl from '@/images/banner.jpeg'
import type { FoodItem, RecommendCard, ScenerySpot } from '@/types'

const router = useRouter()

const keyword = ref('')
const recommends = ref<RecommendCard[]>([])
const spots = ref<ScenerySpot[]>([])
const foods = ref<FoodItem[]>([])
const expandedIndex = ref<number | null>(null)

const heroStyle = computed(() => ({
  backgroundImage: `url(${bannerUrl})`,
}))

function isMobile() {
  return window.matchMedia('(max-width: 768px)').matches
}

function doHeroSearch() {
  const q = keyword.value.trim()
  router.push({ name: 'search', query: q ? { q } : undefined })
}

function goGraph(graphId: string) {
  router.push({ name: 'knowledge-graph', query: graphId ? { graph: graphId } : undefined })
}

function onFoodClick(food: FoodItem) {
  // 视频类内容：按关联题名定位到对应视频文献的元数据页
  if (food.videoTitle) {
    const video = findLiteratureByTitle(food.videoTitle)
    if (video) {
      router.push({ name: 'detail', query: { sysId: video.sysId, from: 'home' } })
      return
    }
  }
  // 知识类内容：跳转到知识图谱页
  goGraph(food.graphId)
}

function expand(index: number) {
  expandedIndex.value = index
}

function toggleExpand(index: number) {
  expandedIndex.value = expandedIndex.value === index ? null : index
}

function onCardClick(index: number) {
  if (!isMobile()) return
  toggleExpand(index)
}

function onNarrowClick(index: number, spot: ScenerySpot) {
  if (isMobile()) {
    toggleExpand(index)
    return
  }
  goGraph(spot.graphId)
}

onMounted(async () => {
  const [recommendList, sceneryList, foodList] = await Promise.all([
    getRecommendList(),
    getScenerySpots(),
    getFoodItems(),
  ])
  recommends.value = recommendList
  spots.value = sceneryList
  foods.value = foodList
})
</script>

<template>
  <div class="home-page">
    <!-- 英雄区 -->
    <section class="hero" :style="heroStyle">
      <div class="hero-content">
        <h1 class="hero-title">山海台州•文旅记忆</h1>
        <p class="hero-subtitle">{{ SYSTEM_SETTINGS.siteSubtitle }}</p>
        <div class="hero-search">
          <el-input
            v-model="keyword"
            class="hero-search-input"
            placeholder="搜索山海台州的景色、美食"
            @keyup.enter="doHeroSearch"
          />
          <el-button class="hero-search-btn" @click="doHeroSearch">检索</el-button>
        </div>
      </div>
      <div class="scroll-hint">
        <span>向下探寻</span>
        <i class="arrow">⌄</i>
      </div>
    </section>

    <!-- 推荐导读 -->
    <section class="section-recommend">
      <h2 class="st-section-title">推荐导读</h2>
      <div class="st-section-title-bar"></div>

      <div class="book-grid">
        <RouterLink
          v-for="card in recommends"
          :key="card.sysId"
          class="book-card"
          :to="{ name: 'detail', query: { sysId: card.sysId, from: 'home' } }"
        >
          <div class="book-cover">
            <CoverImage :src="card.cover" :alt="card.title" />
          </div>
          <div class="book-info">
            <div class="book-name">{{ card.title }}</div>
            <span class="book-tag">{{ card.tag }}</span>
          </div>
        </RouterLink>
      </div>
    </section>

    <!-- 山海十景 -->
    <section class="section-scenery">
      <h2 class="st-section-title">山海十景</h2>
      <div class="st-section-title-bar"></div>
      <p class="section-desc">
        精选台州十大风景名胜，揽山海峰洞，阅古城人文，展现台州自然风光与历史文脉。
      </p>

      <div class="scenery-container" @mouseleave="expandedIndex = null">
        <div
          v-for="(spot, i) in spots"
          :key="spot.name"
          class="scenery-card"
          :class="{ expanded: expandedIndex === i }"
          @mouseenter="expand(i)"
          @click="onCardClick(i)"
        >
          <div class="card-narrow" @click.stop="onNarrowClick(i, spot)" title="点击查看知识图谱">
            <span class="card-narrow-name">{{ spot.name }}</span>
            <div class="card-narrow-divider"></div>
            <span class="card-narrow-summary">{{ spot.short }}</span>
          </div>

          <div class="card-wide">
            <img class="card-wide-img" :src="spot.img" :alt="spot.name" />
            <div class="card-wide-info">
              <div class="card-wide-name">{{ spot.name }}</div>
              <div class="card-wide-rating">{{ spot.rating }}</div>
              <div class="card-wide-desc">{{ spot.desc }}</div>
              <div class="card-wide-addr">地址：{{ spot.addr }}</div>
              <button class="card-wide-btn" @click.stop="goGraph(spot.graphId)">查 看</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 舌尖山海 -->
    <section class="section-food">
      <h2 class="st-section-title">舌尖山海</h2>
      <div class="st-section-title-bar"></div>

      <div class="food-grid">
        <div
          v-for="food in foods"
          :key="food.name"
          class="food-card"
          @click="onFoodClick(food)"
        >
          <img class="food-img" :src="food.img" :alt="food.name" />
          <div class="food-info">
            <div class="food-name">{{ food.name }}</div>
            <div class="food-meta">{{ food.region }}</div>
            <span class="food-tag">{{ food.tag }}</span>
            <div class="food-desc">{{ food.desc }}</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ---------- 英雄区 ---------- */
.hero {
  position: relative;
  height: 100vh;
  width: 100%;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: #22303f;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.55) 100%);
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 720px;
  padding: 0 24px;
  width: 100%;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 10px;
  margin-bottom: 16px;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.88);
  letter-spacing: 4px;
  margin-bottom: 40px;
  font-weight: 300;
}

.hero-search {
  display: flex;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.hero-search-input {
  flex: 1;
  min-width: 0;
}

.hero-search-input :deep(.el-input__wrapper) {
  height: 54px;
  padding: 0 28px;
  background: transparent;
  box-shadow: none;
}

.hero-search-input :deep(.el-input__inner) {
  height: 100%;
  font-size: 15px;
  color: var(--st-text);
}

.hero-search-input :deep(.el-input__inner::placeholder) {
  color: var(--st-text-light);
}

.hero-search-btn {
  width: 100px;
  height: 54px;
  border: none;
  border-radius: 0;
  background: var(--st-primary);
  color: #fff;
  font-size: 15px;
  letter-spacing: 3px;
  font-weight: 600;
  transition: background 0.25s;
}

.hero-search-btn:hover,
.hero-search-btn:focus {
  background: #d45a20;
  color: #fff;
}

.scroll-hint {
  position: absolute;
  bottom: 36px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.scroll-hint span {
  font-size: 13px;
  letter-spacing: 3px;
  display: block;
}

.scroll-hint .arrow {
  display: block;
  margin-top: 6px;
  font-size: 18px;
  font-style: normal;
  animation: floatY 2s ease-in-out infinite;
}

@keyframes floatY {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  50% {
    transform: translateY(8px);
    opacity: 1;
  }
}

/* ---------- 区块标题（局部覆盖全局间距） ---------- */
.st-section-title {
  margin-bottom: 12px;
}

.st-section-title-bar {
  margin: 0 auto 48px;
}

/* ---------- 推荐导读 ---------- */
.section-recommend {
  background: var(--st-bg);
  padding: 80px var(--st-gutter);
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 28px;
  max-width: 1100px;
  margin: 0 auto;
}

.book-card {
  background: #fff;
  border-radius: var(--st-radius-lg);
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  display: block;
}

.book-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

.book-cover {
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: var(--st-bg-alt);
}

.book-info {
  padding: 16px 18px;
}

.book-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--st-text);
  letter-spacing: 1px;
  line-height: 1.5;
}

.book-tag {
  display: inline-block;
  margin-top: 8px;
  font-size: 11px;
  color: var(--st-primary);
  background: #FDF3EE;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 1px;
}

/* ---------- 山海十景 ---------- */
.section-scenery {
  background: var(--st-bg-alt);
  padding: 80px 0;
  background-image: radial-gradient(ellipse at 30% 0%, rgba(201, 169, 110, 0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 100%, rgba(69, 118, 122, 0.04) 0%, transparent 50%);
}

.section-desc {
  text-align: center;
  font-size: 13px;
  color: var(--st-text-light);
  letter-spacing: 1.5px;
  margin: 0 auto 48px;
  max-width: 600px;
  line-height: 1.8;
}

.scenery-container {
  display: flex;
  justify-content: center;
  align-items: stretch;
  max-width: var(--st-content-max-wide);
  margin: 0 auto;
  height: 520px;
  padding: 0 32px;
  gap: 6px;
}

.scenery-card {
  position: relative;
  flex: 1 1 0;
  min-width: 72px;
  max-width: 110px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid rgba(180, 155, 100, 0.35);
  background: linear-gradient(175deg, #f7f2e8 0%, #ede7d9 50%, #f0ebe0 100%);
  box-shadow: inset 0 0 12px rgba(160, 130, 80, 0.06);
  transition: flex 0.35s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.35s, border-color 0.35s;
  display: flex;
  flex-direction: column;
}

.scenery-card::before {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  right: 4px;
  bottom: 4px;
  border: 1px solid rgba(180, 155, 100, 0.15);
  border-radius: 2px;
  pointer-events: none;
  z-index: 1;
}

.scenery-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: linear-gradient(90deg, transparent, rgba(180, 155, 100, 0.4), transparent);
  z-index: 1;
}

.scenery-card.expanded::before,
.scenery-card.expanded::after {
  display: none;
}

.scenery-card.expanded {
  flex: 4.5 1 0;
  max-width: 420px;
  min-width: 340px;
  border-color: var(--st-gold);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.card-narrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 6px;
  height: 100%;
}

.scenery-card.expanded .card-narrow {
  display: none;
}

.card-narrow-name {
  writing-mode: vertical-rl;
  font-size: 19px;
  font-weight: 700;
  color: var(--st-text);
  letter-spacing: 8px;
  font-family: var(--st-font-serif);
}

.card-narrow-divider {
  width: 16px;
  height: 1px;
  background: rgba(180, 155, 100, 0.4);
  margin: 14px 0;
}

.card-narrow-summary {
  writing-mode: vertical-rl;
  font-size: 11px;
  color: var(--st-text-light);
  letter-spacing: 2px;
  line-height: 1.6;
}

.card-wide {
  display: none;
  height: 100%;
}

.scenery-card.expanded .card-wide {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.card-wide-img {
  width: 100%;
  height: 52%;
  object-fit: cover;
  display: block;
}

.card-wide-info {
  width: 100%;
  flex: 1;
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(170deg, #faf8f4 0%, #f2efe8 100%);
  overflow: hidden;
}

.card-wide-name {
  font-size: 22px;
  font-weight: 700;
  color: var(--st-text);
  letter-spacing: 3px;
  margin-bottom: 6px;
  font-family: var(--st-font-serif);
}

.card-wide-name::before {
  content: '\25C6';
  color: var(--st-primary);
  margin-right: 8px;
  font-size: 14px;
}

.card-wide-rating {
  font-size: 11px;
  color: var(--st-primary);
  margin-bottom: 14px;
  letter-spacing: 1px;
  font-weight: 600;
}

.card-wide-desc {
  font-size: 12.5px;
  color: var(--st-text-secondary);
  line-height: 2;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
}

.card-wide-addr {
  font-size: 11px;
  color: var(--st-text-light);
  letter-spacing: 0.5px;
  line-height: 1.6;
  margin-bottom: 20px;
}

.card-wide-btn {
  display: inline-block;
  background: var(--st-brown);
  color: #fff;
  border: none;
  padding: 8px 28px;
  border-radius: 20px;
  font-size: 12px;
  letter-spacing: 4px;
  cursor: pointer;
  transition: background 0.25s;
  align-self: flex-start;
}

.card-wide-btn:hover {
  background: var(--st-brown-dark);
}

/* ---------- 舌尖山海 ---------- */
.section-food {
  background: var(--st-bg-greenish);
  padding: 80px var(--st-gutter);
  background-image: radial-gradient(ellipse at 20% 0%, rgba(58, 107, 77, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 100%, rgba(201, 169, 110, 0.05) 0%, transparent 50%);
}

.food-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 28px;
  max-width: 1200px;
  margin: 0 auto;
}

.food-card {
  background: #fff;
  border-radius: var(--st-radius-lg);
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.food-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

.food-img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
  background: var(--st-bg-alt);
}

.food-info {
  padding: 16px 18px;
}

.food-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--st-text);
  letter-spacing: 1px;
  margin-bottom: 6px;
}

.food-meta {
  font-size: 11px;
  color: var(--st-text-light);
  margin-bottom: 10px;
  letter-spacing: 0.5px;
}

.food-tag {
  display: inline-block;
  font-size: 11px;
  color: var(--st-primary);
  background: rgba(232, 104, 43, 0.08);
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 1px;
  margin-bottom: 10px;
}

.food-desc {
  font-size: 12.5px;
  color: var(--st-text-secondary);
  line-height: 1.8;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ---------- 响应式（1920 基准 → 1440 / 1200 / 1024 / 992 / 768） ---------- */
@media (max-width: 1440px) {
  .section-scenery {
    padding: 72px 0;
  }

  .scenery-container {
    height: 500px;
  }
}

@media (max-width: 1200px) {
  .hero-title {
    font-size: 42px;
    letter-spacing: 8px;
  }

  .section-recommend,
  .section-food {
    padding: 68px var(--st-gutter);
  }

  .book-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }

  .food-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }

  .scenery-container {
    height: 470px;
    padding: 0 20px;
  }

  .scenery-card {
    min-width: 64px;
    max-width: 96px;
  }

  .scenery-card.expanded {
    max-width: 380px;
    min-width: 300px;
  }
}

@media (max-width: 1024px) {
  .hero-title {
    font-size: 34px;
    letter-spacing: 6px;
  }

  .hero-subtitle {
    font-size: 15px;
    letter-spacing: 3px;
    margin-bottom: 32px;
  }

  .book-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .food-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .scenery-container {
    height: 430px;
    padding: 0 var(--st-gutter);
  }

  .scenery-card {
    min-width: 56px;
  }

  .scenery-card.expanded {
    max-width: 340px;
    min-width: 280px;
  }

  .card-wide-name {
    font-size: 19px;
  }

  .card-wide-desc {
    line-height: 1.8;
  }
}

@media (max-width: 992px) {
  .section-recommend,
  .section-food {
    padding: 56px var(--st-gutter);
  }

  .section-scenery {
    padding: 56px 0;
  }

  .scenery-container {
    height: 400px;
  }

  .scenery-card {
    min-width: 48px;
  }

  .scenery-card.expanded {
    max-width: 320px;
    min-width: 260px;
  }

  .card-wide-info {
    padding: 16px 18px;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 26px;
    letter-spacing: 4px;
  }

  .hero-subtitle {
    font-size: 13px;
    letter-spacing: 2px;
  }

  .hero-search-input :deep(.el-input__wrapper) {
    height: 46px;
    padding: 0 18px;
  }

  .hero-search-btn {
    width: 84px;
    height: 46px;
    letter-spacing: 2px;
  }

  .section-recommend,
  .section-food {
    padding: 44px var(--st-gutter);
  }

  .section-scenery {
    padding: 44px 0;
  }

  .section-desc {
    padding: 0 var(--st-gutter);
    margin-bottom: 32px;
  }

  .book-grid,
  .food-grid {
    gap: 16px;
  }

  /* 移动端：横向滑动浏览，点击卡片展开 */
  .scenery-container {
    height: 430px;
    padding: 0 var(--st-gutter);
    justify-content: flex-start;
    overflow-x: auto;
    gap: 8px;
  }

  .scenery-card {
    flex: 0 0 auto;
    width: 62px;
    min-width: 62px;
    max-width: 62px;
  }

  .scenery-card.expanded {
    flex: 0 0 auto;
    width: 280px;
    min-width: 280px;
    max-width: 280px;
  }

  .card-narrow-name {
    font-size: 16px;
    letter-spacing: 6px;
  }
}

@media (max-width: 640px) {
  .book-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .food-grid {
    grid-template-columns: 1fr;
  }
}
</style>
