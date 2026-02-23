<template>
  <view class="auth-container">
    <view class="auth-box">
      <view class="auth-header">
        <view class="logo-circle">
          <text class="logo-text">LF</text>
        </view>
        <text class="title">注册账号</text>
        <text class="subtitle">CAMPUS LOST &amp; FOUND</text>
      </view>

      <view class="form-wrap">
        <view class="input-row">
          <view class="input-group half">
            <input v-model="form.username" class="form-input" placeholder="用户名" placeholder-style="color:#bbb" />
          </view>
          <view class="input-group half">
            <input v-model="form.name" class="form-input" placeholder="真实姓名" placeholder-style="color:#bbb" />
          </view>
        </view>

        <view class="input-group">
          <input v-model="form.email" class="form-input" placeholder="邮箱地址" placeholder-style="color:#bbb" type="text" />
        </view>

        <view class="input-group">
          <input v-model="form.phone" class="form-input" placeholder="手机号码（选填）" placeholder-style="color:#bbb" type="number" />
        </view>

        <view class="input-group">
          <input v-model="form.password" class="form-input" placeholder="设置密码（至少6位）" placeholder-style="color:#bbb" :password="true" />
        </view>

        <view class="input-group">
          <input v-model="form.confirmPassword" class="form-input" placeholder="确认密码" placeholder-style="color:#bbb" :password="true" />
        </view>

        <!-- 用户协议 -->
        <view class="agreement-row">
          <checkbox-group @change="onAgreementChange">
            <label class="agreement-label">
              <checkbox value="1" :checked="agreed" color="#4A90D9" />
              <text class="agreement-text">我已阅读并同意《用户协议》</text>
            </label>
          </checkbox-group>
        </view>

        <button class="btn-submit" :loading="loading" @click="handleRegister">
          {{ loading ? '注册中...' : '立即注册' }}
        </button>

        <view class="auth-links">
          <text class="link-text" @click="goLogin">已有账号？立即登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import request from '@/utils/request.js'

const loading = ref(false)
const agreed = ref(false)

const form = reactive({
  username: '',
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  roleCode: 'USER'
})

const onAgreementChange = (e) => {
  agreed.value = e.detail.value.length > 0
}

const handleRegister = async () => {
  if (!form.username.trim()) return uni.showToast({ title: '请输入用户名', icon: 'none' })
  if (form.username.length < 3) return uni.showToast({ title: '用户名至少3个字符', icon: 'none' })
  if (!form.name.trim()) return uni.showToast({ title: '请输入真实姓名', icon: 'none' })
  if (!form.email.trim()) return uni.showToast({ title: '请输入邮箱地址', icon: 'none' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return uni.showToast({ title: '邮箱格式不正确', icon: 'none' })
  if (form.phone && !/^1[3-9]\d{9}$/.test(form.phone)) return uni.showToast({ title: '手机号格式不正确', icon: 'none' })
  if (!form.password.trim()) return uni.showToast({ title: '请输入密码', icon: 'none' })
  if (form.password.length < 6) return uni.showToast({ title: '密码至少6个字符', icon: 'none' })
  if (form.password !== form.confirmPassword) return uni.showToast({ title: '两次密码不一致', icon: 'none' })
  if (!agreed.value) return uni.showToast({ title: '请阅读并同意用户协议', icon: 'none' })

  loading.value = true
  try {
    const { confirmPassword, ...submitData } = form
    await request.post('/user/register', submitData, { showDefaultMsg: false })
    uni.showToast({ title: '注册成功！', icon: 'success', duration: 1500 })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (err) {
    uni.showToast({ title: err.message || '注册失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const goLogin = () => {
  uni.navigateBack()
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
  padding: 50rpx 40rpx;
  width: 100%;
  box-shadow: 0 20rpx 60rpx rgba(0,0,0,0.15);
}
.auth-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;
}
.logo-circle {
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #4A90D9, #357ABD);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}
.logo-text { color: #fff; font-size: 38rpx; font-weight: bold; }
.title { font-size: 36rpx; font-weight: 700; color: #333; margin-bottom: 6rpx; }
.subtitle { font-size: 20rpx; color: #4A90D9; letter-spacing: 2rpx; }
.form-wrap {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.input-row {
  display: flex;
  gap: 16rpx;
}
.input-group {
  background: #f5f7fa;
  border-radius: 14rpx;
  padding: 0 24rpx;
  height: 90rpx;
  display: flex;
  align-items: center;
  border: 2rpx solid #eee;
}
.input-group.half { flex: 1; }
.form-input { flex: 1; font-size: 26rpx; color: #333; background: transparent; }
.agreement-row {
  display: flex;
  align-items: center;
}
.agreement-label {
  display: flex;
  align-items: center;
  gap: 10rpx;
}
.agreement-text { font-size: 24rpx; color: #666; }
.btn-submit {
  background: linear-gradient(135deg, #4A90D9, #357ABD);
  color: #fff;
  border-radius: 14rpx;
  height: 96rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  margin-top: 6rpx;
}
.btn-submit::after { border: none; }
.auth-links { display: flex; justify-content: center; }
.link-text { font-size: 26rpx; color: #4A90D9; }
</style>
