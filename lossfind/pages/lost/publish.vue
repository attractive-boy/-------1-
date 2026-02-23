<template>
  <scroll-view class="page" scroll-y>
    <view class="form-container">
      <!-- 物品标题 -->
      <view class="form-item">
        <text class="form-label required">物品标题</text>
        <input v-model="form.title" class="form-input" placeholder="请输入物品标题（2-50字）" placeholder-style="color:#bbb" maxlength="50" />
      </view>

      <!-- 物品分类 -->
      <view class="form-item">
        <text class="form-label required">物品分类</text>
        <picker :value="categoryIndex" :range="categoryLabels" @change="onCategoryChange">
          <view class="picker-row">
            <text :class="form.categoryId ? 'picker-text' : 'picker-placeholder'">
              {{ form.categoryId ? (categoryOptions.find(c => c.id === form.categoryId) || {}).name : '请选择物品分类' }}
            </text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>

      <!-- 丢失地点 -->
      <view class="form-item">
        <text class="form-label required">丢失地点</text>
        <input v-model="form.lostPlace" class="form-input" placeholder="请输入丢失地点" placeholder-style="color:#bbb" maxlength="100" />
      </view>

      <!-- 丢失时间 -->
      <view class="form-item">
        <text class="form-label required">丢失时间</text>
        <picker mode="dateTime" :value="form.lostTime" @change="onDateChange">
          <view class="picker-row">
            <text :class="form.lostTime ? 'picker-text' : 'picker-placeholder'">
              {{ form.lostTime || '请选择丢失时间' }}
            </text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>

      <!-- 物品描述 -->
      <view class="form-item">
        <text class="form-label required">物品描述</text>
        <textarea
          v-model="form.description"
          class="form-textarea"
          placeholder="请详细描述物品特征、丢失经过等（10-500字）"
          placeholder-style="color:#bbb"
          maxlength="500"
          :show-count="true"
        />
      </view>

      <!-- 物品图片 -->
      <view class="form-item">
        <text class="form-label">物品图片（最多5张）</text>
        <view class="image-upload-area">
          <view
            v-for="(img, i) in uploadedImages"
            :key="i"
            class="image-preview-item"
          >
            <image :src="img.url" class="preview-img" mode="aspectFill" />
            <view class="delete-btn" @click="removeImage(i)"><text>✕</text></view>
          </view>
          <view
            v-if="uploadedImages.length < 5"
            class="upload-btn"
            @click="chooseImage"
          >
            <text class="upload-icon">＋</text>
            <text class="upload-text">添加图片</text>
          </view>
        </view>
      </view>

      <!-- 分割线：联系方式 -->
      <view class="divider-section">
        <view class="divider"></view>
        <text class="divider-text">联系方式</text>
        <view class="divider"></view>
      </view>

      <view class="form-item">
        <text class="form-label required">联系人</text>
        <input v-model="form.contactName" class="form-input" placeholder="请输入联系人姓名" placeholder-style="color:#bbb" maxlength="20" />
      </view>

      <view class="form-item">
        <text class="form-label required">联系电话</text>
        <input v-model="form.contactPhone" class="form-input" placeholder="请输入联系电话" placeholder-style="color:#bbb" type="number" maxlength="15" />
      </view>

      <view class="form-item">
        <text class="form-label">联系邮箱</text>
        <input v-model="form.contactEmail" class="form-input" placeholder="请输入联系邮箱（选填）" placeholder-style="color:#bbb" maxlength="50" />
      </view>

      <view class="form-item">
        <text class="form-label">备注信息</text>
        <textarea v-model="form.contactNote" class="form-textarea" placeholder="其他联系方式或备注（选填）" placeholder-style="color:#bbb" maxlength="200" />
      </view>

      <!-- 提交按钮 -->
      <view class="form-actions">
        <button class="btn-reset" @click="resetForm">重置</button>
        <button class="btn-submit" :loading="submitting" @click="submitForm">发布</button>
      </view>

      <view style="height: 60rpx;"></view>
    </view>
  </scroll-view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import userStore from '@/store/user.js'
import request, { BASE_URL } from '@/utils/request.js'

const submitting = ref(false)
const categoryOptions = ref([])
const uploadedImages = ref([]) // [{url: displayUrl, path: serverPath}]

const categoryLabels = computed(() => categoryOptions.value.map(c => c.name))
const categoryIndex = computed(() => {
  const idx = categoryOptions.value.findIndex(c => c.id === form.categoryId)
  return idx >= 0 ? idx : 0
})

const form = reactive({
  title: '',
  categoryId: '',
  lostPlace: '',
  lostTime: '',
  description: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  contactNote: ''
})

onLoad(() => {
  if (!userStore.isLoggedIn()) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => uni.navigateTo({ url: '/pages/auth/login' }), 1500)
    return
  }
  fetchCategories()
  initContactInfo()
})

const fetchCategories = async () => {
  try {
    const res = await request.get('/category/list', {}, { showDefaultMsg: false })
    categoryOptions.value = res || []
    if (categoryOptions.value.length && !form.categoryId) {
      form.categoryId = categoryOptions.value[0].id
    }
  } catch (e) {}
}

const initContactInfo = () => {
  const info = userStore.getUserInfo()
  if (info) {
    form.contactName = info.name || info.username || ''
    form.contactPhone = info.phone || ''
    form.contactEmail = info.email || ''
  }
}

const onCategoryChange = (e) => {
  const idx = e.detail.value
  form.categoryId = categoryOptions.value[idx]?.id || ''
}

const onDateChange = (e) => {
  form.lostTime = e.detail.value
}

const chooseImage = () => {
  const remaining = 5 - uploadedImages.value.length
  uni.chooseImage({
    count: remaining,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      for (const tempPath of res.tempFilePaths) {
        await uploadImage(tempPath)
      }
    }
  })
}

const uploadImage = (tempPath) => {
  return new Promise((resolve) => {
    const token = uni.getStorageSync('token') || ''
    uni.uploadFile({
      url: `${BASE_URL}/file/upload/img`,
      filePath: tempPath,
      name: 'file',
      header: { token },
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          if (data.code === '200' || data.code === 200) {
            uploadedImages.value.push({
              url: BASE_URL + data.data,
              path: data.data
            })
          } else {
            uni.showToast({ title: '图片上传失败', icon: 'none' })
          }
        } catch (e) {
          uni.showToast({ title: '上传失败', icon: 'none' })
        }
        resolve()
      },
      fail: () => {
        uni.showToast({ title: '图片上传失败', icon: 'none' })
        resolve()
      }
    })
  })
}

const removeImage = (index) => {
  uploadedImages.value.splice(index, 1)
}

const resetForm = () => {
  Object.assign(form, {
    title: '', categoryId: categoryOptions.value[0]?.id || '',
    lostPlace: '', lostTime: '', description: '',
    contactName: '', contactPhone: '', contactEmail: '', contactNote: ''
  })
  uploadedImages.value = []
}

const submitForm = async () => {
  if (!form.title.trim() || form.title.length < 2) return uni.showToast({ title: '请输入物品标题（至少2字）', icon: 'none' })
  if (!form.categoryId) return uni.showToast({ title: '请选择物品分类', icon: 'none' })
  if (!form.lostPlace.trim()) return uni.showToast({ title: '请输入丢失地点', icon: 'none' })
  if (!form.lostTime) return uni.showToast({ title: '请选择丢失时间', icon: 'none' })
  if (!form.description.trim() || form.description.length < 10) return uni.showToast({ title: '请输入物品描述（至少10字）', icon: 'none' })
  if (!form.contactName.trim()) return uni.showToast({ title: '请输入联系人', icon: 'none' })
  if (!form.contactPhone.trim()) return uni.showToast({ title: '请输入联系电话', icon: 'none' })

  const info = userStore.getUserInfo()
  submitting.value = true
  try {
    const images = uploadedImages.value.map(i => i.path).join(',')
    await request.post('/lost-item', {
      ...form,
      lostTime: form.lostTime + ':00',
      images,
      userId: info?.id,
      status: 0
    }, { showDefaultMsg: false })
    uni.showToast({ title: '发布成功！', icon: 'success', duration: 2000 })
    setTimeout(() => uni.switchTab({ url: '/pages/lost/index' }), 2000)
  } catch (e) {
    uni.showToast({ title: e.message || '发布失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.page { background: #F5F7FA; min-height: 100vh; }
.form-container { padding: 20rpx; }
.form-item { background: #fff; border-radius: 16rpx; padding: 24rpx 30rpx; margin-bottom: 20rpx; }
.form-label { display: block; font-size: 26rpx; color: #666; margin-bottom: 16rpx; }
.form-label.required::before { content: '* '; color: #F56C6C; }
.form-input { background: #f5f7fa; border-radius: 12rpx; padding: 20rpx 24rpx; font-size: 28rpx; color: #333; width: 100%; box-sizing: border-box; }
.form-textarea { background: #f5f7fa; border-radius: 12rpx; padding: 20rpx 24rpx; font-size: 28rpx; color: #333; width: 100%; min-height: 160rpx; box-sizing: border-box; }
.picker-row { display: flex; justify-content: space-between; align-items: center; background: #f5f7fa; border-radius: 12rpx; padding: 20rpx 24rpx; }
.picker-text { font-size: 28rpx; color: #333; }
.picker-placeholder { font-size: 28rpx; color: #bbb; }
.picker-arrow { font-size: 32rpx; color: #bbb; }

.image-upload-area { display: flex; flex-wrap: wrap; gap: 16rpx; }
.image-preview-item { position: relative; width: 180rpx; height: 180rpx; }
.preview-img { width: 100%; height: 100%; border-radius: 12rpx; }
.delete-btn { position: absolute; top: -10rpx; right: -10rpx; width: 40rpx; height: 40rpx; background: #F56C6C; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.delete-btn text { color: #fff; font-size: 20rpx; }
.upload-btn { width: 180rpx; height: 180rpx; background: #f5f7fa; border-radius: 12rpx; border: 2rpx dashed #ddd; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8rpx; }
.upload-icon { font-size: 48rpx; color: #4A90D9; }
.upload-text { font-size: 22rpx; color: #999; }

.divider-section { display: flex; align-items: center; gap: 16rpx; margin: 10rpx 0; }
.divider { flex: 1; height: 1rpx; background: #eee; }
.divider-text { font-size: 24rpx; color: #999; white-space: nowrap; }

.form-actions { display: flex; gap: 20rpx; padding: 20rpx 0; }
.btn-reset {
  flex: 1; background: #f0f0f0; color: #666; border-radius: 12rpx; font-size: 28rpx;
  height: 100rpx; line-height: 100rpx; border: none;
}
.btn-reset::after { border: none; }
.btn-submit {
  flex: 2; background: #4A90D9; color: #fff; border-radius: 12rpx; font-size: 30rpx;
  font-weight: 600; height: 100rpx; line-height: 100rpx; border: none;
}
.btn-submit::after { border: none; }
</style>
