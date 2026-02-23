<template>
  <scroll-view class="page" scroll-y>
    <!-- 个人头像区 -->
    <view class="profile-header">
      <view class="avatar-wrap" @click="chooseAvatar">
        <image :src="avatarUrl" class="avatar-img" mode="aspectFill" />
        <view class="avatar-edit-badge">📷</view>
      </view>
      <text class="username-text">{{ userForm.username || '未登录' }}</text>
    </view>

    <!-- Tab 切换 -->
    <view class="tab-bar">
      <view :class="['tab-item', activeTab === 'basic' ? 'tab-active' : '']" @click="activeTab = 'basic'">基本信息</view>
      <view :class="['tab-item', activeTab === 'password' ? 'tab-active' : '']" @click="activeTab = 'password'">修改密码</view>
    </view>

    <!-- 基本信息 -->
    <view class="form-card" v-if="activeTab === 'basic'">
      <view class="form-item">
        <text class="form-label">用户名</text>
        <input :value="userForm.username" class="form-input form-input-disabled" disabled placeholder="用户名" />
      </view>
      <view class="form-item">
        <text class="form-label required">姓名</text>
        <input v-model="userForm.name" class="form-input" placeholder="请输入姓名" maxlength="20" />
      </view>
      <view class="form-item">
        <text class="form-label">性别</text>
        <view class="radio-group">
          <view class="radio-item" @click="userForm.sex = '男'">
            <view :class="['radio-dot', userForm.sex === '男' ? 'radio-dot-active' : '']"></view>
            <text class="radio-label">男</text>
          </view>
          <view class="radio-item" @click="userForm.sex = '女'">
            <view :class="['radio-dot', userForm.sex === '女' ? 'radio-dot-active' : '']"></view>
            <text class="radio-label">女</text>
          </view>
        </view>
      </view>
      <view class="form-item">
        <text class="form-label required">电子邮箱</text>
        <input v-model="userForm.email" class="form-input" type="email" placeholder="请输入邮箱" maxlength="50" />
      </view>
      <view class="form-item">
        <text class="form-label">手机号码</text>
        <input v-model="userForm.phone" class="form-input" type="number" placeholder="请输入手机号" maxlength="11" />
      </view>
      <button class="btn-submit" :loading="saving" @click="saveBasicInfo">保存修改</button>
    </view>

    <!-- 修改密码 -->
    <view class="form-card" v-if="activeTab === 'password'">
      <view class="form-item">
        <text class="form-label required">旧密码</text>
        <input v-model="pwdForm.oldPassword" class="form-input" :password="true" placeholder="请输入旧密码" maxlength="30" />
      </view>
      <view class="form-item">
        <text class="form-label required">新密码</text>
        <input v-model="pwdForm.newPassword" class="form-input" :password="true" placeholder="请输入新密码（至少6位）" maxlength="30" />
      </view>
      <view class="form-item">
        <text class="form-label required">确认新密码</text>
        <input v-model="pwdForm.confirmPassword" class="form-input" :password="true" placeholder="请再次输入新密码" maxlength="30" />
      </view>
      <button class="btn-submit" :loading="pwdSaving" @click="savePassword">修改密码</button>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-links">
      <text class="section-title">我的内容</text>
      <view class="link-grid">
        <view class="link-item" @click="goTo('/pages/lost/index?mine=1')">
          <text class="link-icon">📋</text>
          <text class="link-text">我的失物</text>
        </view>
        <view class="link-item" @click="goTo('/pages/found/index?mine=1')">
          <text class="link-icon">📦</text>
          <text class="link-text">我的招领</text>
        </view>
        <view class="link-item" @click="uni.navigateTo({ url: '/pages/claim/index' })">
          <text class="link-icon">📝</text>
          <text class="link-text">我的申请</text>
        </view>
        <view class="link-item" @click="uni.navigateTo({ url: '/pages/notification/index' })">
          <text class="link-icon">🔔</text>
          <text class="link-text">我的通知</text>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view style="padding: 30rpx 20rpx 20rpx;">
      <button class="btn-logout" @click="handleLogout">退出登录</button>
    </view>
    <view style="height: 60rpx;"></view>
  </scroll-view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import userStore from '@/store/user.js'
import request, { BASE_URL } from '@/utils/request.js'

const activeTab = ref('basic')
const saving = ref(false)
const pwdSaving = ref(false)

const userForm = reactive({ id: '', username: '', name: '', email: '', phone: '', sex: '男', avatar: '' })
const pwdForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })

const avatarUrl = computed(() => {
  if (!userForm.avatar) return 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  return userForm.avatar.startsWith('http') ? userForm.avatar : BASE_URL + userForm.avatar
})

onShow(() => { if (!userStore.isLoggedIn()) uni.reLaunch({ url: '/pages/auth/login' }); else loadUserInfo() })

const loadUserInfo = async () => {
  try {
    const res = await request.get('/user/current', null, { showDefaultMsg: false })
    if (res) {
      userStore.setUserInfo({ token: userStore.getToken(), ...res })
      Object.assign(userForm, { id: res.id || '', username: res.username || '', name: res.name || '', email: res.email || '', phone: res.phone || '', sex: res.sex || '男', avatar: res.avatar || '' })
    }
  } catch (e) {}
}

const chooseAvatar = () => {
  uni.chooseImage({ count: 1, sizeType: ['compressed'], sourceType: ['album', 'camera'],
    success: (res) => {
      uni.showLoading({ title: '上传中...' })
      uni.uploadFile({ url: BASE_URL + '/file/upload/img', filePath: res.tempFilePaths[0], name: 'file',
        header: { token: userStore.getToken() },
        success: (uploadRes) => {
          try {
            const data = JSON.parse(uploadRes.data)
            if (data.code === 200) { userForm.avatar = data.data; saveBasicInfo() }
            else uni.showToast({ title: '头像上传失败', icon: 'none' })
          } catch (e) { uni.showToast({ title: '头像上传失败', icon: 'none' }) }
        },
        fail: () => uni.showToast({ title: '头像上传失败', icon: 'none' }),
        complete: () => uni.hideLoading()
      })
    }
  })
}

const saveBasicInfo = async () => {
  if (!userForm.name.trim()) return uni.showToast({ title: '请输入姓名', icon: 'none' })
  if (!userForm.email.trim()) return uni.showToast({ title: '请输入邮箱', icon: 'none' })
  saving.value = true
  try {
    const res = await request.put('/user/update', { id: userForm.id, name: userForm.name, sex: userForm.sex, email: userForm.email, phone: userForm.phone, avatar: userForm.avatar }, { successMsg: '保存成功' })
    if (res) userStore.setUserInfo({ token: userStore.getToken(), ...res })
  } catch (e) {
    uni.showToast({ title: e.message || '保存失败', icon: 'none' })
  } finally { saving.value = false }
}

const savePassword = async () => {
  const { oldPassword, newPassword, confirmPassword } = pwdForm
  if (!oldPassword) return uni.showToast({ title: '请输入旧密码', icon: 'none' })
  if (!newPassword || newPassword.length < 6) return uni.showToast({ title: '新密码至少6位', icon: 'none' })
  if (newPassword !== confirmPassword) return uni.showToast({ title: '两次密码不一致', icon: 'none' })
  pwdSaving.value = true
  try {
    await request.put('/user/password', { oldPassword, newPassword }, { successMsg: '密码修改成功，请重新登录' })
    setTimeout(() => { userStore.clearUserInfo(); uni.reLaunch({ url: '/pages/auth/login' }) }, 1500)
  } catch (e) {
    uni.showToast({ title: e.message || '修改失败', icon: 'none' })
  } finally { pwdSaving.value = false }
}

const goTo = (url) => uni.navigateTo({ url })

const handleLogout = () => {
  uni.showModal({ title: '提示', content: '确定退出登录吗？',
    success: (res) => {
      if (res.confirm) { userStore.clearUserInfo(); uni.reLaunch({ url: '/pages/auth/login' }) }
    }
  })
}
</script>

<style scoped>
.page { background: #F5F7FA; min-height: 100vh; }
.profile-header { background: linear-gradient(135deg, #4A90D9, #357ABD); padding: 60rpx 30rpx 50rpx; display: flex; flex-direction: column; align-items: center; }
.avatar-wrap { position: relative; margin-bottom: 20rpx; }
.avatar-img { width: 160rpx; height: 160rpx; border-radius: 50%; border: 4rpx solid rgba(255,255,255,0.8); }
.avatar-edit-badge { position: absolute; bottom: 0; right: 0; width: 48rpx; height: 48rpx; background: #fff; border-radius: 50%; font-size: 28rpx; line-height: 48rpx; text-align: center; }
.username-text { font-size: 32rpx; font-weight: 700; color: #fff; }
.tab-bar { display: flex; background: #fff; border-bottom: 1rpx solid #f0f0f0; }
.tab-item { flex: 1; text-align: center; padding: 28rpx 0; font-size: 28rpx; color: #666; border-bottom: 4rpx solid transparent; }
.tab-active { color: #4A90D9; border-bottom-color: #4A90D9; font-weight: 600; }
.form-card { background: #fff; margin: 20rpx; border-radius: 16rpx; padding: 30rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06); }
.form-item { margin-bottom: 30rpx; }
.form-label { font-size: 28rpx; font-weight: 600; color: #333; display: block; margin-bottom: 12rpx; }
.form-label.required::before { content: '*'; color: #F56C6C; margin-right: 4rpx; }
.form-input { width: 100%; height: 88rpx; background: #f5f7fa; border-radius: 12rpx; padding: 0 24rpx; font-size: 28rpx; color: #333; box-sizing: border-box; }
.form-input-disabled { color: #999; background: #efefef; }
.radio-group { display: flex; gap: 40rpx; height: 88rpx; align-items: center; }
.radio-item { display: flex; align-items: center; gap: 12rpx; }
.radio-dot { width: 36rpx; height: 36rpx; border-radius: 50%; border: 3rpx solid #ddd; }
.radio-dot-active { border-color: #4A90D9; background: #4A90D9; }
.radio-label { font-size: 28rpx; color: #333; }
.btn-submit { width: 100%; background: linear-gradient(135deg, #4A90D9, #357ABD); color: #fff; border-radius: 16rpx; font-size: 30rpx; font-weight: 600; height: 90rpx; line-height: 90rpx; border: none; margin-top: 10rpx; }
.btn-submit::after { border: none; }
.quick-links { background: #fff; margin: 20rpx; border-radius: 16rpx; padding: 30rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06); }
.section-title { font-size: 30rpx; font-weight: 700; color: #333; display: block; margin-bottom: 24rpx; }
.link-grid { display: flex; gap: 20rpx; }
.link-item { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 24rpx 0; background: #f5f7fa; border-radius: 16rpx; }
.link-icon { font-size: 48rpx; margin-bottom: 10rpx; }
.link-text { font-size: 24rpx; color: #555; }
.btn-logout { width: 100%; background: #fff; color: #F56C6C; border: 1rpx solid #FBC4C4; border-radius: 16rpx; font-size: 30rpx; height: 90rpx; line-height: 90rpx; }
.btn-logout::after { border: none; }
</style>
