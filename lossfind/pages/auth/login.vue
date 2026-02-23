<template>
  <view class="auth-container">
    <view class="auth-box">
      <!-- 头部 Logo -->
      <view class="auth-header">
        <view class="logo-circle">
          <text class="logo-text">LF</text>
        </view>
        <text class="title">校园失物招领</text>
        <text class="subtitle">CAMPUS LOST &amp; FOUND</text>
        <text class="welcome">让每一份遗失都能重新找到归宿</text>
      </view>

      <!-- 登录表单 -->
      <view class="form-wrap">
        <view class="input-group">
          <text class="input-icon">👤</text>
          <input
            v-model="form.username"
            class="form-input"
            placeholder="请输入用户名"
            placeholder-style="color:#bbb"
            confirm-type="next"
          />
        </view>
        <view class="input-group">
          <text class="input-icon">🔒</text>
          <input
            v-model="form.password"
            class="form-input"
            placeholder="请输入密码"
            placeholder-style="color:#bbb"
            :password="true"
            confirm-type="done"
            @confirm="handleLogin"
          />
        </view>

        <button class="btn-submit" :loading="loading" @click="handleLogin">
          {{ loading ? '登录中...' : '登 录' }}
        </button>

        <view class="auth-links">
          <text class="link-text" @click="goRegister">还没有账号？立即注册</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import userStore from '@/store/user.js'
import request from '@/utils/request.js'

const loading = ref(false)
const form = reactive({
  username: '',
  password: ''
})

onLoad(() => {
  // 如果已登录则跳转首页
  if (userStore.isLoggedIn()) {
    uni.switchTab({ url: '/pages/index/index' })
  }
})

const handleLogin = async () => {
  if (!form.username.trim()) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }
  if (!form.password.trim()) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }
  if (form.password.length < 6) {
    uni.showToast({ title: '密码至少6个字符', icon: 'none' })
    return
  }

  loading.value = true
  try {
    const res = await request.post('/user/login', { username: form.username, password: form.password }, { showDefaultMsg: false })
    userStore.setUserInfo(res)
    uni.showToast({ title: '登录成功', icon: 'success', duration: 1500 })
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 1500)
  } catch (err) {
    uni.showToast({ title: err.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const goRegister = () => {
  uni.navigateTo({ url: '/pages/auth/register' })
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 30rpx;
}
.auth-box {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  width: 100%;
  box-shadow: 0 20rpx 60rpx rgba(0,0,0,0.15);
}
.auth-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 50rpx;
}
.logo-circle {
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #4A90D9, #357ABD);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}
.logo-text {
  color: #fff;
  font-size: 44rpx;
  font-weight: bold;
}
.title {
  font-size: 40rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 8rpx;
}
.subtitle {
  font-size: 22rpx;
  color: #4A90D9;
  letter-spacing: 2rpx;
  margin-bottom: 12rpx;
}
.welcome {
  font-size: 24rpx;
  color: #999;
}
.form-wrap {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
.input-group {
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border-radius: 14rpx;
  padding: 0 24rpx;
  height: 96rpx;
  border: 2rpx solid #eee;
}
.input-group:focus-within {
  border-color: #4A90D9;
}
.input-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}
.form-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  background: transparent;
}
.btn-submit {
  background: linear-gradient(135deg, #4A90D9, #357ABD);
  color: #fff;
  border-radius: 14rpx;
  height: 96rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  margin-top: 10rpx;
}
.btn-submit::after { border: none; }
.auth-links {
  display: flex;
  justify-content: center;
  margin-top: 10rpx;
}
.link-text {
  font-size: 26rpx;
  color: #4A90D9;
}
</style>
