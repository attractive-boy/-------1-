<template>
  <scroll-view class="page" scroll-y>
    <view class="form-card">
      <view class="form-item">
        <text class="form-label required">物品名称</text>
        <input v-model="form.title" class="form-input" placeholder="请输入物品名称" maxlength="50" />
      </view>

      <view class="form-item">
        <text class="form-label required">物品分类</text>
        <picker :range="categoryNames" @change="onCategoryChange">
          <view class="picker-view">
            <text :class="form.categoryId ? 'picker-selected' : 'picker-placeholder'">
              {{ form.categoryId ? getCategoryName(form.categoryId) : '请选择分类' }}
            </text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label required">拾取地点</text>
        <input v-model="form.foundPlace" class="form-input" placeholder="请输入拾取地点" maxlength="100" />
      </view>

      <view class="form-item">
        <text class="form-label required">拾取时间</text>
        <picker mode="date" :value="foundDate" @change="onFoundDateChange">
          <view class="picker-view">
            <text :class="foundDate ? 'picker-selected' : 'picker-placeholder'">
              {{ foundDate || '请选择日期' }}
            </text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">物品描述</text>
        <textarea v-model="form.description" class="form-textarea" placeholder="请详细描述物品特征（如颜色、品牌、规格等）" placeholder-style="color:#bbb" maxlength="500" />
      </view>

      <view class="form-item">
        <text class="form-label">物品图片</text>
        <view class="image-grid">
          <view v-for="(img, i) in imageList" :key="img.url" class="img-thumb-wrap">
            <image :src="img.url" class="img-thumb" mode="aspectFill" />
            <view class="img-delete" @click="removeImage(i)">✕</view>
          </view>
          <view class="img-add-btn" v-if="imageList.length < 5" @click="chooseImage">
            <text class="img-add-icon">＋</text>
            <text class="img-add-text">添加图片</text>
          </view>
        </view>
        <text class="form-hint">最多上传5张图片</text>
      </view>

      <view class="divider"></view>
      <text class="section-title">联系方式</text>

      <view class="form-item">
        <text class="form-label required">联系人</text>
        <input v-model="form.contactName" class="form-input" placeholder="请输入联系人姓名" maxlength="20" />
      </view>

      <view class="form-item">
        <text class="form-label required">联系电话</text>
        <input v-model="form.contactPhone" class="form-input" type="number" placeholder="请输入联系电话" maxlength="11" />
      </view>

      <view class="form-item">
        <text class="form-label">联系邮箱</text>
        <input v-model="form.contactEmail" class="form-input" type="email" placeholder="选填" maxlength="50" />
      </view>

      <view class="submit-area">
        <button class="btn-submit" :loading="submitting" @click="handleSubmit">发布招领信息</button>
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import userStore from '@/store/user.js'
import request, { BASE_URL } from '@/utils/request.js'

const form = ref({
  title: '', categoryId: '', foundPlace: '', foundTime: '',
  description: '', images: '', contactName: '', contactPhone: '', contactEmail: ''
})
const foundDate = ref('')
const imageList = ref([])  // [{url, serverPath}]
const categories = ref([])
const categoryNames = ref([])
const submitting = ref(false)

onLoad(() => {
  if (!userStore.isLoggedIn()) return uni.reLaunch({ url: '/pages/auth/login' })
  prefillContact()
  fetchCategories()
})

const prefillContact = () => {
  const info = userStore.getUserInfo()
  if (info) {
    form.value.contactName = info.name || info.username || ''
    form.value.contactPhone = info.phone || ''
    form.value.contactEmail = info.email || ''
  }
}

const fetchCategories = async () => {
  try {
    const res = await request.get('/category/list', {}, { showDefaultMsg: false })
    categories.value = res || []
    categoryNames.value = categories.value.map(c => c.name)
  } catch (e) {}
}

const onCategoryChange = (e) => {
  const idx = e.detail.value
  form.value.categoryId = categories.value[idx]?.id
}

const getCategoryName = (id) => categories.value.find(c => c.id === id)?.name || ''

const onFoundDateChange = (e) => {
  foundDate.value = e.detail.value
  form.value.foundTime = e.detail.value + ' 00:00:00'
}

const chooseImage = () => {
  uni.chooseImage({
    count: 5 - imageList.value.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      for (const path of res.tempFilePaths) {
        await uploadImage(path)
      }
    }
  })
}

const uploadImage = (path) => {
  return new Promise((resolve) => {
    uni.showLoading({ title: '上传中...' })
    uni.uploadFile({
      url: BASE_URL + '/file/upload/img',
      filePath: path,
      name: 'file',
      header: { token: userStore.getToken() },
      success: (uploadRes) => {
        try {
          const data = JSON.parse(uploadRes.data)
          if (data.code === 200) {
            imageList.value.push({ url: BASE_URL + data.data, serverPath: data.data })
          } else {
            uni.showToast({ title: '图片上传失败', icon: 'none' })
          }
        } catch (e) { uni.showToast({ title: '图片上传失败', icon: 'none' }) }
      },
      fail: () => uni.showToast({ title: '图片上传失败', icon: 'none' }),
      complete: () => { uni.hideLoading(); resolve() }
    })
  })
}

const removeImage = (index) => { imageList.value.splice(index, 1) }

const handleSubmit = async () => {
  const { title, categoryId, foundPlace, foundTime, contactName, contactPhone } = form.value
  if (!title.trim()) return uni.showToast({ title: '请输入物品名称', icon: 'none' })
  if (!categoryId) return uni.showToast({ title: '请选择物品分类', icon: 'none' })
  if (!foundPlace.trim()) return uni.showToast({ title: '请输入拾取地点', icon: 'none' })
  if (!foundTime) return uni.showToast({ title: '请选择拾取时间', icon: 'none' })
  if (!contactName.trim()) return uni.showToast({ title: '请输入联系人', icon: 'none' })
  if (!contactPhone.trim()) return uni.showToast({ title: '请输入联系电话', icon: 'none' })

  form.value.images = imageList.value.map(i => i.serverPath).join(',')
  submitting.value = true
  try {
    await request.post('/found-item', form.value, { successMsg: '发布成功！' })
    setTimeout(() => { uni.switchTab({ url: '/pages/found/index' }) }, 1500)
  } catch (e) {
    uni.showToast({ title: e.message || '发布失败', icon: 'none' })
  } finally { submitting.value = false }
}
</script>

<style scoped>
.page { background: #F5F7FA; min-height: 100vh; }
.form-card { background: #fff; margin: 20rpx; border-radius: 16rpx; padding: 30rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06); }
.form-item { margin-bottom: 30rpx; }
.form-label { font-size: 28rpx; font-weight: 600; color: #333; display: block; margin-bottom: 12rpx; }
.form-label.required::before { content: '*'; color: #F56C6C; margin-right: 4rpx; }
.form-input { width: 100%; height: 88rpx; background: #f5f7fa; border-radius: 12rpx; padding: 0 24rpx; font-size: 28rpx; color: #333; box-sizing: border-box; }
.form-textarea { width: 100%; height: 180rpx; background: #f5f7fa; border-radius: 12rpx; padding: 20rpx 24rpx; font-size: 28rpx; color: #333; box-sizing: border-box; }
.picker-view { display: flex; align-items: center; justify-content: space-between; height: 88rpx; background: #f5f7fa; border-radius: 12rpx; padding: 0 24rpx; }
.picker-placeholder { font-size: 28rpx; color: #bbb; }
.picker-selected { font-size: 28rpx; color: #333; }
.picker-arrow { font-size: 36rpx; color: #bbb; }
.image-grid { display: flex; flex-wrap: wrap; gap: 16rpx; }
.img-thumb-wrap { position: relative; width: 180rpx; height: 180rpx; }
.img-thumb { width: 180rpx; height: 180rpx; border-radius: 12rpx; }
.img-delete { position: absolute; top: -16rpx; right: -16rpx; width: 44rpx; height: 44rpx; background: #F56C6C; border-radius: 50%; color: #fff; font-size: 22rpx; display: flex; align-items: center; justify-content: center; line-height: 44rpx; text-align: center; }
.img-add-btn { width: 180rpx; height: 180rpx; background: #f5f7fa; border-radius: 12rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2rpx dashed #ddd; }
.img-add-icon { font-size: 48rpx; color: #bbb; }
.img-add-text { font-size: 24rpx; color: #bbb; margin-top: 8rpx; }
.form-hint { font-size: 24rpx; color: #999; margin-top: 12rpx; display: block; }
.divider { height: 1rpx; background: #f0f0f0; margin: 30rpx 0 20rpx; }
.section-title { font-size: 30rpx; font-weight: 700; color: #333; display: block; margin-bottom: 24rpx; }
.submit-area { margin-top: 40rpx; }
.btn-submit { width: 100%; background: linear-gradient(135deg, #4A90D9, #357ABD); color: #fff; border-radius: 16rpx; font-size: 32rpx; font-weight: 600; height: 96rpx; line-height: 96rpx; border: none; }
.btn-submit::after { border: none; }
</style>
