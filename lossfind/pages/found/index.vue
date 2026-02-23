<template>
  <view class="page">
    <!-- 搜索区域 -->
    <view class="search-area">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <input v-model="searchForm.title" class="search-input" placeholder="搜索招领标题..." placeholder-style="color:#bbb" @confirm="fetchFoundItems" />
        <text v-if="searchForm.title" class="clear-icon" @click="clearTitle">✕</text>
      </view>
      <scroll-view scroll-x class="category-scroll">
        <view :class="['category-item', !searchForm.categoryId ? 'category-active' : '']" @click="selectCategory('')">
          <text>全部</text>
        </view>
        <view v-for="cat in categoryOptions" :key="cat.id" :class="['category-item', searchForm.categoryId === cat.id ? 'category-active' : '']" @click="selectCategory(cat.id)">
          <text>{{ cat.name }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 发布按钮 -->
    <view class="publish-bar" v-if="isLoggedIn">
      <button class="btn-publish" @click="goPublish">➕ 发布招领信息</button>
    </view>

    <view v-if="loading" class="loading-wrap"><text class="loading-text">加载中...</text></view>
    <view v-else-if="!foundItems.length" style="padding: 80rpx 0; text-align: center;">
      <text style="color:#999; font-size:28rpx;">暂无招领信息</text>
    </view>
    <view v-else class="item-list">
      <view v-for="item in foundItems" :key="item.id" class="item-card" @click="viewDetail(item.id)">
        <view class="card-image-wrap">
          <image v-if="getFirstImage(item.images)" :src="getFirstImage(item.images)" class="card-image" mode="aspectFill" />
          <view v-else class="card-no-image"><text>📦</text></view>
          <view :class="['status-badge', 'status-' + item.status]">
            <text>{{ getStatusText(item.status) }}</text>
          </view>
        </view>
        <view class="card-body">
          <text class="card-title">{{ item.title }}</text>
          <text class="card-category">📁 {{ item.categoryName || '未分类' }}</text>
          <text class="card-place">📍 {{ item.foundPlace || '未知地点' }}</text>
          <view class="card-footer">
            <text class="card-date">🕐 {{ formatTime(item.foundTime) }}</text>
            <text class="card-create">{{ formatDate(item.createTime) }}</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="foundItems.length && foundItems.length < total" class="load-more" @click="loadMore">
      <text>加载更多 ({{ foundItems.length }}/{{ total }})</text>
    </view>
    <view v-if="foundItems.length && foundItems.length >= total && total > 0" style="text-align:center; padding: 20rpx; color:#999; font-size:24rpx;">
      <text>已加载全部</text>
    </view>
    <view style="height: 40rpx;"></view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import userStore from '@/store/user.js'
import request, { BASE_URL } from '@/utils/request.js'
import DateUtils from '@/utils/dateUtils.js'

const isLoggedIn = ref(false)
const loading = ref(false)
const foundItems = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)
const categoryOptions = ref([])
const searchForm = reactive({ title: '', categoryId: '' })

onShow(() => { isLoggedIn.value = userStore.isLoggedIn() })
onLoad(() => { fetchCategories(); fetchFoundItems() })

const fetchFoundItems = async (reset = true) => {
  if (reset) { currentPage.value = 1; foundItems.value = [] }
  loading.value = true
  try {
    const res = await request.get('/found-item/page', {
      title: searchForm.title,
      categoryId: searchForm.categoryId || undefined,
      status: 0,
      currentPage: currentPage.value,
      size: pageSize.value
    }, { showDefaultMsg: false })
    if (res) {
      foundItems.value = reset ? (res.records || []) : [...foundItems.value, ...(res.records || [])]
      total.value = res.total || 0
    }
  } catch (e) {}
  finally { loading.value = false }
}

const fetchCategories = async () => {
  try {
    const res = await request.get('/category/list', {}, { showDefaultMsg: false })
    if (res) categoryOptions.value = res
  } catch (e) {}
}

const selectCategory = (id) => { searchForm.categoryId = id; fetchFoundItems() }
const clearTitle = () => { searchForm.title = ''; fetchFoundItems() }
const loadMore = () => { currentPage.value++; fetchFoundItems(false) }
const viewDetail = (id) => uni.navigateTo({ url: `/pages/found/detail?id=${id}` })
const goPublish = () => {
  if (!userStore.isLoggedIn()) return uni.navigateTo({ url: '/pages/auth/login' })
  uni.navigateTo({ url: '/pages/found/publish' })
}

const getFirstImage = (images) => {
  if (!images) return ''
  const arr = images.split(',').filter(Boolean)
  return arr.length ? (arr[0].startsWith('http') ? arr[0] : BASE_URL + arr[0]) : ''
}
const getStatusText = (s) => ({ 0: '待认领', 1: '已认领', 2: '已关闭' }[s] ?? '')
const formatDate = (d) => d ? DateUtils.formatDate(d) : ''
const formatTime = (d) => d ? DateUtils.format(d, 'YYYY-MM-DD HH:mm') : ''
</script>

<style scoped>
.page { background: #F5F7FA; min-height: 100vh; }
.search-area { background: #fff; padding: 20rpx; position: sticky; top: 0; z-index: 10; }
.search-input-wrap { display: flex; align-items: center; background: #f5f7fa; border-radius: 40rpx; padding: 0 24rpx; height: 80rpx; margin-bottom: 16rpx; }
.search-icon { font-size: 28rpx; margin-right: 12rpx; }
.search-input { flex: 1; font-size: 28rpx; color: #333; }
.clear-icon { font-size: 24rpx; color: #999; padding: 10rpx; }
.category-scroll { white-space: nowrap; }
.category-item { display: inline-block; padding: 10rpx 28rpx; background: #f5f7fa; border-radius: 40rpx; margin-right: 16rpx; font-size: 26rpx; color: #666; }
.category-active { background: #4A90D9; color: #fff; }
.publish-bar { padding: 20rpx; }
.btn-publish { background: #4A90D9; color: #fff; border-radius: 12rpx; font-size: 28rpx; font-weight: 600; height: 88rpx; line-height: 88rpx; border: none; width: 100%; }
.btn-publish::after { border: none; }
.loading-wrap { text-align: center; padding: 80rpx; }
.loading-text { color: #999; font-size: 28rpx; }
.item-list { padding: 0 20rpx; }
.item-card { display: flex; background: #fff; border-radius: 16rpx; margin-bottom: 20rpx; overflow: hidden; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06); }
.card-image-wrap { position: relative; width: 200rpx; height: 200rpx; flex-shrink: 0; }
.card-image { width: 100%; height: 100%; }
.card-no-image { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f0f0f0; font-size: 50rpx; }
.status-badge { position: absolute; top: 10rpx; left: 0; padding: 4rpx 12rpx; border-radius: 0 8rpx 8rpx 0; }
.status-badge text { font-size: 20rpx; color: #fff; }
.status-0 { background: #409EFF; } .status-1 { background: #67C23A; } .status-2 { background: #909399; }
.card-body { flex: 1; padding: 20rpx; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; }
.card-title { font-size: 30rpx; font-weight: 700; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.card-category, .card-place { font-size: 24rpx; color: #999; margin-top: 8rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.card-footer { display: flex; justify-content: space-between; margin-top: 8rpx; }
.card-date, .card-create { font-size: 22rpx; color: #aaa; }
.load-more { text-align: center; padding: 30rpx; }
.load-more text { font-size: 26rpx; color: #4A90D9; }
</style>
