<template>
  <view class="page">
    <!-- 筛选栏 -->
    <view class="filter-bar">
      <scroll-view scroll-x class="filter-scroll">
        <view class="filter-tabs">
          <view v-for="s in statusTabs" :key="s.value"
            :class="['filter-tab', searchStatus === s.value ? 'filter-tab-active' : '']"
            @click="onStatusFilter(s.value)">{{ s.label }}</view>
        </view>
      </scroll-view>
    </view>

    <!-- 列表 -->
    <view v-if="loading" style="text-align:center; padding: 80rpx;"><text style="color:#999;">加载中...</text></view>
    <view v-else-if="list.length === 0" style="text-align:center; padding: 100rpx;">
      <text style="font-size: 80rpx;">📭</text>
      <text style="display:block; color:#999; margin-top:20rpx;">暂无申请记录</text>
    </view>
    <view v-else class="list-wrap">
      <view v-for="item in list" :key="item.id" class="claim-card" @click="viewDetail(item)">
        <view class="card-header-row">
          <text class="item-title">{{ item.itemTitle }}</text>
          <view :class="['status-tag', 'status-' + item.status]">
            <text>{{ statusText(item.status) }}</text>
          </view>
        </view>
        <view class="card-meta">
          <view :class="['type-tag', item.itemType === 0 ? 'type-found' : 'type-lost']">
            <text>{{ item.itemType === 0 ? '招领' : '失物' }}</text>
          </view>
          <text class="meta-time">{{ item.createTime ? item.createTime.substring(0, 16) : '' }}</text>
        </view>
        <text class="claim-desc">{{ item.description }}</text>
        <view class="card-actions" @click.stop="">
          <button v-if="item.status === 0" class="btn-cancel-small" @click.stop="cancelClaim(item)">取消申请</button>
        </view>
      </view>
    </view>

    <!-- 加载更多 -->
    <view v-if="!loading && hasMore && list.length > 0" class="load-more" @click="loadMore">
      <text>加载更多</text>
    </view>
    <view v-if="!hasMore && list.length > 0" class="no-more"><text>没有更多了</text></view>

    <!-- 详情浮层 -->
    <view class="modal-mask" v-if="showDetail" @click="showDetail = false">
      <view class="modal-box" @click.stop="">
        <text class="modal-title">申请详情</text>
        <view class="detail-rows" v-if="currentItem">
          <view class="detail-row"><text class="dl">物品标题</text><text class="dv">{{ currentItem.itemTitle }}</text></view>
          <view class="detail-row"><text class="dl">物品类型</text><text class="dv">{{ currentItem.itemType === 0 ? '招领物品' : '失物信息' }}</text></view>
          <view class="detail-row"><text class="dl">申请说明</text><text class="dv">{{ currentItem.description }}</text></view>
          <view class="detail-row"><text class="dl">申请状态</text><text class="dv">{{ statusText(currentItem.status) }}</text></view>
          <view class="detail-row"><text class="dl">申请时间</text><text class="dv">{{ currentItem.createTime ? currentItem.createTime.substring(0, 16) : '' }}</text></view>
          <view class="detail-row" v-if="currentItem.status !== 0"><text class="dl">审核时间</text><text class="dv">{{ currentItem.auditTime || '-' }}</text></view>
          <view class="detail-row" v-if="currentItem.status !== 0"><text class="dl">审核人</text><text class="dv">{{ currentItem.auditName || currentItem.auditUsername || '-' }}</text></view>
          <view class="detail-row" v-if="currentItem.status !== 0"><text class="dl">审核备注</text><text class="dv">{{ currentItem.auditRemark || '-' }}</text></view>
        </view>
        <button class="modal-close-btn" @click="showDetail = false">关闭</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import userStore from '@/store/user.js'
import request from '@/utils/request.js'

const list = ref([])
const loading = ref(false)
const currentPage = ref(1)
const hasMore = ref(true)
const searchStatus = ref(null)
const showDetail = ref(false)
const currentItem = ref(null)

const statusTabs = [
  { label: '全部', value: null },
  { label: '待审核', value: 0 },
  { label: '已通过', value: 1 },
  { label: '已拒绝', value: 2 }
]

onLoad(() => { if (!userStore.isLoggedIn()) uni.reLaunch({ url: '/pages/auth/login' }) })
onShow(() => { resetAndFetch() })

const resetAndFetch = () => {
  list.value = []; currentPage.value = 1; hasMore.value = true
  fetchList()
}

const fetchList = async () => {
  if (loading.value) return
  loading.value = true
  try {
    const params = { currentPage: currentPage.value, size: 10 }
    if (searchStatus.value !== null) params.status = searchStatus.value
    const res = await request.get('/claim/my', params, { showDefaultMsg: false })
    const records = res?.records || []
    if (currentPage.value === 1) list.value = records
    else list.value.push(...records)
    hasMore.value = records.length === 10
  } catch (e) {}
  finally { loading.value = false }
}

const loadMore = () => {
  currentPage.value++
  fetchList()
}

const onStatusFilter = (v) => {
  searchStatus.value = v
  resetAndFetch()
}

const viewDetail = (item) => { currentItem.value = item; showDetail.value = true }

const cancelClaim = (item) => {
  uni.showModal({
    title: '提示', content: '确定要取消该申请吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request.put(`/claim/cancel/${item.id}`, null, { successMsg: '取消申请成功' })
          resetAndFetch()
        } catch (e) {}
      }
    }
  })
}

const statusText = (s) => ({ 0: '待审核', 1: '已通过', 2: '已拒绝' }[s] ?? '-')
</script>

<style scoped>
.page { background: #F5F7FA; min-height: 100vh; }
.filter-bar { background: #fff; padding: 0 20rpx; border-bottom: 1rpx solid #f0f0f0; }
.filter-scroll { width: 100%; }
.filter-tabs { display: flex; gap: 0; white-space: nowrap; }
.filter-tab { padding: 24rpx 30rpx; font-size: 28rpx; color: #666; display: inline-block; border-bottom: 4rpx solid transparent; }
.filter-tab-active { color: #4A90D9; border-bottom-color: #4A90D9; font-weight: 600; }
.list-wrap { padding: 20rpx; }
.claim-card { background: #fff; border-radius: 16rpx; padding: 28rpx; margin-bottom: 20rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06); }
.card-header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16rpx; }
.item-title { font-size: 30rpx; font-weight: 700; color: #333; flex: 1; margin-right: 16rpx; }
.status-tag { padding: 6rpx 18rpx; border-radius: 30rpx; flex-shrink: 0; }
.status-tag text { font-size: 24rpx; font-weight: 600; }
.status-0 { background: #ECF5FF; } .status-0 text { color: #409EFF; }
.status-1 { background: #F0F9EB; } .status-1 text { color: #67C23A; }
.status-2 { background: #FEF0F0; } .status-2 text { color: #F56C6C; }
.card-meta { display: flex; align-items: center; gap: 16rpx; margin-bottom: 16rpx; }
.type-tag { padding: 4rpx 16rpx; border-radius: 20rpx; }
.type-tag text { font-size: 22rpx; }
.type-found { background: #F0F9EB; } .type-found text { color: #67C23A; }
.type-lost { background: #FEF0F0; } .type-lost text { color: #E6A23C; }
.meta-time { font-size: 24rpx; color: #999; }
.claim-desc { font-size: 26rpx; color: #666; line-height: 1.6; display: block; margin-bottom: 16rpx; }
.card-actions { display: flex; justify-content: flex-end; }
.btn-cancel-small { background: #FEF0F0; color: #F56C6C; border: 1rpx solid #FBC4C4; border-radius: 30rpx; font-size: 24rpx; height: 56rpx; line-height: 56rpx; padding: 0 28rpx; }
.btn-cancel-small::after { border: none; }
.load-more, .no-more { text-align: center; padding: 30rpx; font-size: 26rpx; color: #999; }
.modal-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 999; display: flex; align-items: flex-end; }
.modal-box { background: #fff; border-radius: 32rpx 32rpx 0 0; padding: 40rpx 30rpx; width: 100%; max-height: 75vh; overflow-y: auto; box-sizing: border-box; }
.modal-title { font-size: 34rpx; font-weight: 700; color: #333; display: block; text-align: center; margin-bottom: 30rpx; }
.detail-rows { display: flex; flex-direction: column; gap: 20rpx; margin-bottom: 30rpx; }
.detail-row { display: flex; gap: 20rpx; }
.dl { font-size: 26rpx; color: #999; flex-shrink: 0; width: 160rpx; }
.dv { font-size: 26rpx; color: #333; flex: 1; }
.modal-close-btn { width: 100%; background: #f5f5f5; color: #666; border-radius: 16rpx; font-size: 30rpx; height: 88rpx; line-height: 88rpx; border: none; }
.modal-close-btn::after { border: none; }
</style>
