<template>
  <scroll-view class="home-page" scroll-y>
    <!-- Banner -->
    <view class="banner">
      <view class="banner-content">
        <text class="banner-title">失物招领系统</text>
        <text class="banner-sub">快速找回您的失物，或帮助他人找回失物</text>
        <view class="banner-actions">
          <button class="btn-banner-primary" @click="goLost">浏览失物信息</button>
          <button class="btn-banner-default" @click="goPublish" v-if="isLoggedIn">发布失物</button>
        </view>
      </view>
    </view>

    <!-- 统计数据 -->
    <view class="stats-section">
      <view class="stat-item">
        <text class="stat-number">{{ statistics.totalItems || 0 }}</text>
        <text class="stat-label">失物总数</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ statistics.totalClaimed || 0 }}</text>
        <text class="stat-label">已认领</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ statistics.totalPending || 0 }}</text>
        <text class="stat-label">待认领</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ statistics.totalUsers || 0 }}</text>
        <text class="stat-label">用户数</text>
      </view>
    </view>

    <!-- 最新失物 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">最新失物信息</text>
        <text class="section-more" @click="goLost">查看全部 ›</text>
      </view>

      <view v-if="loading" class="loading-wrap">
        <text class="loading-text">加载中...</text>
      </view>
      <view v-else-if="!recentItems.length" style="padding: 60rpx 0; text-align: center;">
        <text style="color:#999;">暂无失物信息</text>
      </view>
      <scroll-view v-else scroll-x class="item-scroll">
        <view
          v-for="item in recentItems"
          :key="item.id"
          class="item-card"
          @click="viewDetail(item)"
        >
          <view class="item-image-wrap">
            <image v-if="getFirstImage(item.images)" :src="getFirstImage(item.images)" class="item-image" mode="aspectFill" />
            <view v-else class="item-no-image"><text>📦</text></view>
            <view class="item-category-badge"><text>{{ item.categoryName || '未分类' }}</text></view>
          </view>
          <view class="item-info">
            <text class="item-title">{{ item.title }}</text>
            <text class="item-place">📍 {{ item.lostPlace || '未知地点' }}</text>
            <view class="item-footer">
              <text class="item-date">{{ formatDate(item.createTime) }}</text>
              <view :class="['item-status-tag', 'status-' + item.status]">
                <text>{{ getStatusText(item.status) }}</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 使用指南 -->
    <view class="section">
      <text class="section-title">如何使用</text>
      <view class="guide-list">
        <view class="guide-item" v-for="(step, idx) in guideSteps" :key="idx">
          <view class="guide-icon"><text>{{ step.icon }}</text></view>
          <view class="guide-content">
            <text class="guide-step-title">{{ step.title }}</text>
            <text class="guide-step-desc">{{ step.desc }}</text>
          </view>
        </view>
      </view>
    </view>

    <view style="height: 40rpx;"></view>
  </scroll-view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import userStore from '@/store/user.js'
import request, { BASE_URL } from '@/utils/request.js'

const isLoggedIn = ref(false)
const loading = ref(false)
const recentItems = ref([])
const statistics = ref({ totalItems: 0, totalClaimed: 0, totalPending: 0, totalUsers: 0 })

const guideSteps = [
  { icon: '👤', title: '第一步：注册登录', desc: '注册账号并登录系统' },
  { icon: '➕', title: '第二步：发布失物', desc: '填写物品信息和图片' },
  { icon: '🔍', title: '第三步：搜索物品', desc: '浏览或搜索失物信息' },
  { icon: '📞', title: '第四步：联系认领', desc: '联系发布者并完成认领' }
]

onShow(() => {
  isLoggedIn.value = userStore.isLoggedIn()
})

onLoad(() => {
  fetchRecentItems()
  fetchStatistics()
})

const fetchRecentItems = async () => {
  loading.value = true
  try {
    const res = await request.get('/lost-item/page', { currentPage: 1, size: 8, status: 0 }, { showDefaultMsg: false })
    recentItems.value = (res && res.records) ? res.records : []
  } catch (e) {
    recentItems.value = []
  } finally {
    loading.value = false
  }
}

const fetchStatistics = async () => {
  try {
    const res = await request.get('/lost-item/statistics', {}, { showDefaultMsg: false })
    if (res) statistics.value = res
  } catch (e) {}
}

const getFirstImage = (images) => {
  if (!images) return ''
  const arr = images.split(',').filter(Boolean)
  if (!arr.length) return ''
  return arr[0].startsWith('http') ? arr[0] : BASE_URL + arr[0]
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const getStatusText = (status) => ({ 0: '待认领', 1: '已认领', 2: '已关闭' }[status] ?? '未知')

const viewDetail = (item) => uni.navigateTo({ url: `/pages/lost/detail?id=${item.id}` })
const goLost = () => uni.switchTab({ url: '/pages/lost/index' })
const goPublish = () => {
  if (!userStore.isLoggedIn()) return uni.navigateTo({ url: '/pages/auth/login' })
  uni.navigateTo({ url: '/pages/lost/publish' })
}
</script>

<style scoped>
.home-page { background: #F5F7FA; }
.banner { background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%); padding: 60rpx 40rpx; }
.banner-title { display: block; font-size: 46rpx; font-weight: 700; color: #fff; margin-bottom: 16rpx; }
.banner-sub { display: block; font-size: 26rpx; color: rgba(255,255,255,0.85); margin-bottom: 36rpx; line-height: 1.6; }
.banner-actions { display: flex; gap: 20rpx; }
.btn-banner-primary {
  background: #fff; color: #4A90D9; border-radius: 40rpx; font-size: 26rpx;
  font-weight: 600; padding: 0 32rpx; height: 76rpx; line-height: 76rpx; border: none;
}
.btn-banner-primary::after { border: none; }
.btn-banner-default {
  background: transparent; border: 2rpx solid rgba(255,255,255,0.8); color: #fff;
  border-radius: 40rpx; font-size: 26rpx; padding: 0 32rpx; height: 76rpx; line-height: 76rpx;
}
.btn-banner-default::after { border: none; }

.stats-section { display: flex; background: #fff; padding: 30rpx 0; margin-bottom: 20rpx; }
.stat-item { flex: 1; display: flex; flex-direction: column; align-items: center; border-right: 1rpx solid #eee; }
.stat-item:last-child { border-right: none; }
.stat-number { font-size: 44rpx; font-weight: 700; color: #4A90D9; }
.stat-label { font-size: 22rpx; color: #999; margin-top: 6rpx; }

.section { background: #fff; padding: 30rpx; margin-bottom: 20rpx; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx; }
.section-title { font-size: 32rpx; font-weight: 700; color: #333; display: block; margin-bottom: 20rpx; }
.section-more { font-size: 26rpx; color: #4A90D9; }

.loading-wrap { text-align: center; padding: 40rpx; }
.loading-text { color: #999; font-size: 26rpx; }

.item-scroll { white-space: nowrap; }
.item-card {
  display: inline-block; width: 280rpx; margin-right: 20rpx;
  background: #f9f9f9; border-radius: 16rpx; overflow: hidden; vertical-align: top;
}
.item-image-wrap { position: relative; width: 280rpx; height: 200rpx; }
.item-image { width: 100%; height: 100%; }
.item-no-image { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #eee; font-size: 50rpx; }
.item-category-badge { position: absolute; bottom: 10rpx; left: 10rpx; background: rgba(0,0,0,0.5); border-radius: 8rpx; padding: 4rpx 10rpx; }
.item-category-badge text { font-size: 20rpx; color: #fff; }
.item-info { padding: 16rpx; }
.item-title { display: block; font-size: 26rpx; font-weight: 600; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-place { display: block; font-size: 22rpx; color: #999; margin: 8rpx 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-footer { display: flex; justify-content: space-between; align-items: center; }
.item-date { font-size: 20rpx; color: #bbb; }
.item-status-tag { padding: 4rpx 10rpx; border-radius: 8rpx; }
.item-status-tag text { font-size: 20rpx; }
.status-0 { background: #ECF5FF; } .status-0 text { color: #409EFF; }
.status-1 { background: #F0F9EB; } .status-1 text { color: #67C23A; }
.status-2 { background: #FEF0F0; } .status-2 text { color: #F56C6C; }

.guide-list { display: flex; flex-direction: column; gap: 24rpx; }
.guide-item { display: flex; align-items: center; gap: 24rpx; }
.guide-icon { width: 80rpx; height: 80rpx; background: #EBF4FF; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36rpx; flex-shrink: 0; }
.guide-content { display: flex; flex-direction: column; }
.guide-step-title { font-size: 28rpx; font-weight: 600; color: #333; }
.guide-step-desc { font-size: 24rpx; color: #999; margin-top: 4rpx; }
</style>
