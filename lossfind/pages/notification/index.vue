<template>
  <view class="page">
    <!-- 顶部操作 -->
    <view class="top-bar">
      <scroll-view scroll-x class="filter-scroll">
        <view class="filter-tabs">
          <view v-for="t in typeTabs" :key="String(t.value)"
            :class="['filter-tab', typeFilter === t.value ? 'filter-tab-active' : '']"
            @click="onTypeFilter(t.value)">{{ t.label }}</view>
        </view>
      </scroll-view>
      <button class="btn-read-all" :disabled="unreadCount === 0" @click="markAllAsRead">全部已读</button>
    </view>

    <!-- 列表 -->
    <view v-if="loading" style="text-align:center; padding: 80rpx;"><text style="color:#999;">加载中...</text></view>
    <view v-else-if="list.length === 0" style="text-align:center; padding: 100rpx;">
      <text style="font-size: 80rpx;">🔔</text>
      <text style="display:block; color:#999; margin-top:20rpx;">暂无通知消息</text>
    </view>
    <view v-else class="list-wrap">
      <view v-for="item in list" :key="item.id" :class="['notif-card', item.isRead === 0 ? 'notif-unread' : '']">
        <view class="notif-header">
          <view class="notif-title-row">
            <view v-if="item.isRead === 0" class="unread-dot"></view>
            <text class="notif-title">{{ item.title }}</text>
          </view>
          <text class="notif-type">{{ item.typeDescription }}</text>
        </view>
        <text class="notif-content">{{ item.content }}</text>
        <view class="notif-footer">
          <text class="notif-time">{{ formatTime(item.createTime) }}</text>
          <view class="notif-actions">
            <text v-if="item.isRead === 0" class="action-btn action-read" @click="markAsRead(item)">标为已读</text>
            <text class="action-btn action-delete" @click="deleteNotif(item.id)">删除</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="!loading && hasMore && list.length > 0" class="load-more" @click="loadMore"><text>加载更多</text></view>
    <view v-if="!hasMore && list.length > 0" class="no-more"><text>没有更多了</text></view>
    <view style="height: 60rpx;"></view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import userStore from '@/store/user.js'
import request from '@/utils/request.js'
import DateUtils from '@/utils/dateUtils.js'

const list = ref([])
const loading = ref(false)
const currentPage = ref(1)
const hasMore = ref(true)
const typeFilter = ref(null)
const unreadCount = ref(0)

const typeTabs = [
  { label: '全部', value: null },
  { label: '系统消息', value: 0 },
  { label: '申请消息', value: 1 },
  { label: '审核消息', value: 2 }
]

onLoad(() => { if (!userStore.isLoggedIn()) uni.reLaunch({ url: '/pages/auth/login' }) })
onShow(() => resetAndFetch())

const resetAndFetch = () => {
  list.value = []; currentPage.value = 1; hasMore.value = true
  fetchList()
}

const fetchList = async () => {
  if (loading.value) return
  loading.value = true
  try {
    const params = { currentPage: currentPage.value, size: 10 }
    if (typeFilter.value !== null) params.type = typeFilter.value
    const res = await request.get('/notification/list', params, { showDefaultMsg: false })
    const records = res?.records || []
    if (currentPage.value === 1) list.value = records
    else list.value.push(...records)
    hasMore.value = records.length === 10
    unreadCount.value = list.value.filter(n => n.isRead === 0).length
  } catch (e) {} finally { loading.value = false }
}

const loadMore = () => { currentPage.value++; fetchList() }
const onTypeFilter = (v) => { typeFilter.value = v; resetAndFetch() }

const markAsRead = async (item) => {
  try {
    await request.put(`/notification/${item.id}/read`, {}, { showDefaultMsg: false })
    item.isRead = 1
    unreadCount.value = list.value.filter(n => n.isRead === 0).length
    uni.showToast({ title: '已标记为已读', icon: 'success' })
  } catch (e) {}
}

const markAllAsRead = async () => {
  try {
    await request.put('/notification/read-all', {}, { successMsg: '全部标记为已读' })
    list.value.forEach(n => { n.isRead = 1 })
    unreadCount.value = 0
  } catch (e) {}
}

const deleteNotif = (id) => {
  uni.showModal({ title: '提示', content: '确定要删除这条通知吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request.delete(`/notification/${id}`, { successMsg: '删除成功' })
          const idx = list.value.findIndex(n => n.id === id)
          if (idx > -1) {
            if (list.value[idx].isRead === 0) unreadCount.value--
            list.value.splice(idx, 1)
          }
        } catch (e) {}
      }
    }
  })
}

const formatTime = (d) => d ? DateUtils.formatDateTime(d) : ''
</script>

<style scoped>
.page { background: #F5F7FA; min-height: 100vh; }
.top-bar { background: #fff; display: flex; align-items: center; border-bottom: 1rpx solid #f0f0f0; padding-right: 20rpx; }
.filter-scroll { flex: 1; }
.filter-tabs { display: flex; white-space: nowrap; padding: 0 10rpx; }
.filter-tab { padding: 24rpx 26rpx; font-size: 26rpx; color: #666; display: inline-block; border-bottom: 4rpx solid transparent; }
.filter-tab-active { color: #4A90D9; border-bottom-color: #4A90D9; font-weight: 600; }
.btn-read-all { background: #ECF5FF; color: #4A90D9; border: none; border-radius: 30rpx; font-size: 24rpx; height: 56rpx; line-height: 56rpx; padding: 0 24rpx; flex-shrink: 0; }
.btn-read-all::after { border: none; }
.list-wrap { padding: 20rpx; }
.notif-card { background: #fff; border-radius: 16rpx; padding: 28rpx; margin-bottom: 20rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06); }
.notif-unread { border-left: 6rpx solid #4A90D9; }
.notif-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16rpx; }
.notif-title-row { display: flex; align-items: center; gap: 12rpx; flex: 1; }
.unread-dot { width: 16rpx; height: 16rpx; background: #4A90D9; border-radius: 50%; flex-shrink: 0; }
.notif-title { font-size: 30rpx; font-weight: 700; color: #333; flex: 1; }
.notif-type { font-size: 22rpx; color: #999; background: #f5f5f5; padding: 4rpx 14rpx; border-radius: 20rpx; flex-shrink: 0; margin-left: 10rpx; }
.notif-content { font-size: 26rpx; color: #555; line-height: 1.7; display: block; margin-bottom: 20rpx; }
.notif-footer { display: flex; justify-content: space-between; align-items: center; }
.notif-time { font-size: 24rpx; color: #bbb; }
.notif-actions { display: flex; gap: 24rpx; }
.action-btn { font-size: 26rpx; }
.action-read { color: #4A90D9; }
.action-delete { color: #F56C6C; }
.load-more, .no-more { text-align: center; padding: 30rpx; font-size: 26rpx; color: #999; }
</style>
