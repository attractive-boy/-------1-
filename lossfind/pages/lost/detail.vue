<template>
  <scroll-view class="page" scroll-y>
    <view v-if="loading" style="text-align:center; padding: 100rpx;">
      <text style="color:#999;">加载中...</text>
    </view>

    <view v-else-if="!item.id" style="text-align:center; padding: 100rpx;">
      <text style="color:#999;">未找到该失物信息</text>
      <view style="margin-top: 30rpx;">
        <button class="btn-default" @click="goBack">返回列表</button>
      </view>
    </view>

    <block v-else>
      <!-- 图片轮播 -->
      <swiper v-if="images.length" class="image-swiper" indicator-dots autoplay circular>
        <swiper-item v-for="(img, i) in images" :key="i">
          <image :src="img" mode="aspectFill" class="swiper-img" @click="previewImage(i)" />
        </swiper-item>
      </swiper>
      <view v-else class="no-image-placeholder"><text>📦</text></view>

      <!-- 状态标签 -->
      <view class="status-bar">
        <view :class="['status-tag', 'status-' + item.status]">
          <text>{{ getStatusText(item.status) }}</text>
        </view>
      </view>

      <!-- 标题及基本信息 -->
      <view class="card">
        <text class="detail-title">{{ item.title }}</text>
        <view class="meta-list">
          <view class="meta-item">
            <text class="meta-label">丢失地点</text>
            <text class="meta-value">📍 {{ item.lostPlace || '未知地点' }}</text>
          </view>
          <view class="meta-item">
            <text class="meta-label">丢失时间</text>
            <text class="meta-value">🕐 {{ formatTime(item.lostTime) }}</text>
          </view>
          <view class="meta-item">
            <text class="meta-label">物品分类</text>
            <text class="meta-value">📁 {{ item.categoryName || '未分类' }}</text>
          </view>
          <view class="meta-item">
            <text class="meta-label">发布人</text>
            <text class="meta-value">👤 {{ item.username || '匿名' }}</text>
          </view>
          <view class="meta-item">
            <text class="meta-label">发布时间</text>
            <text class="meta-value">{{ formatDateTime(item.createTime) }}</text>
          </view>
        </view>
      </view>

      <!-- 物品描述 -->
      <view class="card">
        <text class="card-section-title">物品描述</text>
        <text class="desc-text">{{ item.description || '暂无描述' }}</text>
      </view>

      <!-- 联系方式 -->
      <view class="card" v-if="item.status === 0">
        <text class="card-section-title">联系方式</text>
        <view class="contact-list">
          <view class="contact-item">
            <text class="contact-label">联系人</text>
            <text class="contact-value">{{ item.contactName || '未提供' }}</text>
          </view>
          <view class="contact-item">
            <text class="contact-label">联系电话</text>
            <text class="contact-value">{{ item.contactPhone || '未提供' }}</text>
          </view>
          <view class="contact-item" v-if="item.contactEmail">
            <text class="contact-label">联系邮箱</text>
            <text class="contact-value">{{ item.contactEmail }}</text>
          </view>
          <view class="contact-item" v-if="item.contactNote">
            <text class="contact-label">备注</text>
            <text class="contact-value">{{ item.contactNote }}</text>
          </view>
        </view>
      </view>

      <!-- 认领申请区域 -->
      <view class="card" v-if="item.status === 0 && isLoggedIn && !isMyPost">
        <text class="card-section-title">认领申请</text>
        <view v-if="!showClaimForm">
          <button class="btn-claim" @click="showClaimForm = true">申请认领</button>
        </view>
        <view v-else>
          <textarea
            v-model="claimDesc"
            class="claim-textarea"
            placeholder="请说明您是该物品的主人，描述物品特征以便核实..."
            placeholder-style="color:#bbb"
            maxlength="300"
          />
          <view class="claim-actions">
            <button class="btn-cancel" @click="showClaimForm = false">取消</button>
            <button class="btn-submit-claim" :loading="claimLoading" @click="submitClaim">提交申请</button>
          </view>
        </view>
      </view>

      <!-- 管理操作（发布者或管理员） -->
      <view class="card" v-if="canManage">
        <text class="card-section-title">管理操作</text>
        <view class="manage-actions">
          <button class="btn-edit" @click="goEdit" v-if="item.status === 0">✏️ 编辑</button>
          <button class="btn-close-item" @click="handleClose" v-if="item.status === 0">🔒 关闭认领</button>
          <button class="btn-danger" @click="handleDelete">🗑 删除</button>
        </view>
      </view>

      <view style="height: 60rpx;"></view>
    </block>
  </scroll-view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import userStore from '@/store/user.js'
import request, { BASE_URL } from '@/utils/request.js'
import DateUtils from '@/utils/dateUtils.js'

const loading = ref(true)
const item = ref({})
const claimDesc = ref('')
const showClaimForm = ref(false)
const claimLoading = ref(false)

const isLoggedIn = computed(() => userStore.isLoggedIn())
const isMyPost = computed(() => {
  const info = userStore.getUserInfo()
  return info && item.value.userId === info.id
})
const canManage = computed(() => {
  const info = userStore.getUserInfo()
  return info && (info.roleCode === 'ADMIN' || item.value.userId === info.id)
})

const images = computed(() => {
  if (!item.value.images) return []
  return item.value.images.split(',').filter(Boolean).map(img =>
    img.startsWith('http') ? img : BASE_URL + img
  )
})

onLoad((options) => {
  if (options.id) fetchDetail(options.id)
})

const fetchDetail = async (id) => {
  loading.value = true
  try {
    const res = await request.get(`/lost-item/${id}`, {}, { showDefaultMsg: false })
    item.value = res || {}
  } catch (e) {
    item.value = {}
  } finally {
    loading.value = false
  }
}

const submitClaim = async () => {
  if (!claimDesc.value.trim()) return uni.showToast({ title: '请填写申请说明', icon: 'none' })
  claimLoading.value = true
  try {
    await request.post('/claim/apply', {
      itemId: item.value.id,
      itemType: 1,
      description: claimDesc.value
    }, { showDefaultMsg: false })
    uni.showToast({ title: '申请提交成功，请等待审核', icon: 'success', duration: 2000 })
    showClaimForm.value = false
    claimDesc.value = ''
  } catch (e) {
    uni.showToast({ title: e.message || '申请失败', icon: 'none' })
  } finally {
    claimLoading.value = false
  }
}

const handleDelete = () => {
  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复，确定要删除吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request.delete(`/lost-item/${item.value.id}`, { successMsg: '删除成功' })
          uni.navigateBack()
        } catch (e) {}
      }
    }
  })
}

const handleClose = () => {
  uni.showModal({
    title: '确认关闭',
    content: '确定关闭该失物认领吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request.put(`/lost-item/${item.value.id}/status`, { status: 2 }, { successMsg: '已关闭' })
          item.value.status = 2
        } catch (e) {}
      }
    }
  })
}

const previewImage = (index) => {
  uni.previewImage({ current: index, urls: images.value })
}

const goBack = () => uni.navigateBack()
const goEdit = () => uni.navigateTo({ url: `/pages/lost/edit?id=${item.value.id}` })

const getStatusText = (s) => ({ 0: '待认领', 1: '已认领', 2: '已关闭' }[s] ?? '')
const formatTime = (d) => d ? DateUtils.format(d, 'YYYY-MM-DD HH:mm') : ''
const formatDateTime = (d) => d ? DateUtils.formatDateTime(d) : ''
</script>

<style scoped>
.page { background: #F5F7FA; min-height: 100vh; }
.image-swiper { width: 100%; height: 480rpx; }
.swiper-img { width: 100%; height: 100%; }
.no-image-placeholder { width: 100%; height: 360rpx; background: #eee; display: flex; align-items: center; justify-content: center; font-size: 80rpx; }

.status-bar { padding: 20rpx 30rpx 0; }
.status-tag { display: inline-block; padding: 8rpx 24rpx; border-radius: 40rpx; }
.status-tag text { font-size: 26rpx; font-weight: 600; }
.status-0 { background: #ECF5FF; } .status-0 text { color: #409EFF; }
.status-1 { background: #F0F9EB; } .status-1 text { color: #67C23A; }
.status-2 { background: #F4F4F5; } .status-2 text { color: #909399; }

.card { background: #fff; margin: 20rpx; border-radius: 16rpx; padding: 30rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06); }
.detail-title { font-size: 36rpx; font-weight: 700; color: #333; display: block; margin-bottom: 24rpx; }
.meta-list { display: flex; flex-direction: column; gap: 16rpx; }
.meta-item { display: flex; justify-content: space-between; }
.meta-label { font-size: 26rpx; color: #999; flex-shrink: 0; }
.meta-value { font-size: 26rpx; color: #333; flex: 1; text-align: right; }

.card-section-title { font-size: 30rpx; font-weight: 700; color: #333; display: block; margin-bottom: 20rpx; }
.desc-text { font-size: 28rpx; color: #555; line-height: 1.8; }

.contact-list { display: flex; flex-direction: column; gap: 16rpx; }
.contact-item { display: flex; justify-content: space-between; padding: 12rpx 0; border-bottom: 1rpx solid #f0f0f0; }
.contact-item:last-child { border-bottom: none; }
.contact-label { font-size: 26rpx; color: #999; flex-shrink: 0; width: 160rpx; }
.contact-value { font-size: 26rpx; color: #333; flex: 1; text-align: right; }

.claim-textarea {
  width: 100%; height: 160rpx; background: #f5f7fa; border-radius: 12rpx;
  padding: 20rpx; font-size: 26rpx; color: #333; box-sizing: border-box;
}
.claim-actions { display: flex; gap: 20rpx; margin-top: 20rpx; }
.btn-cancel {
  flex: 1; background: #f0f0f0; color: #666; border-radius: 12rpx; font-size: 28rpx;
  height: 88rpx; line-height: 88rpx; border: none;
}
.btn-cancel::after { border: none; }
.btn-claim, .btn-submit-claim {
  flex: 1; background: #4A90D9; color: #fff; border-radius: 12rpx; font-size: 28rpx;
  font-weight: 600; height: 88rpx; line-height: 88rpx; border: none; width: 100%;
}
.btn-claim::after, .btn-submit-claim::after { border: none; }

.manage-actions { display: flex; gap: 20rpx; flex-wrap: wrap; }
.btn-edit {
  background: #E6A23C; color: #fff; border-radius: 12rpx; font-size: 28rpx;
  height: 80rpx; line-height: 80rpx; border: none; padding: 0 30rpx;
}
.btn-edit::after { border: none; }
.btn-close-item {
  background: #909399; color: #fff; border-radius: 12rpx; font-size: 28rpx;
  height: 80rpx; line-height: 80rpx; border: none; padding: 0 30rpx;
}
.btn-close-item::after { border: none; }
.btn-danger {
  background: #F56C6C; color: #fff; border-radius: 12rpx; font-size: 28rpx;
  height: 80rpx; line-height: 80rpx; border: none; padding: 0 30rpx;
}
.btn-danger::after { border: none; }
.btn-default {
  background: #f0f0f0; color: #666; border-radius: 12rpx; font-size: 28rpx;
  height: 80rpx; line-height: 80rpx; border: none;
}
.btn-default::after { border: none; }
</style>
