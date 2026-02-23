/**
 * 用户状态管理（UniApp 版，替代 Pinia）
 * 使用 uni.setStorageSync / uni.getStorageSync 持久化
 */
import request from '@/utils/request.js'

const userStore = {
  // ---------- 获取状态 ----------
  getToken() {
    return uni.getStorageSync('token') || ''
  },

  getUserInfo() {
    const info = uni.getStorageSync('userInfo')
    if (info) {
      try {
        return typeof info === 'string' ? JSON.parse(info) : info
      } catch {
        return null
      }
    }
    return null
  },

  isLoggedIn() {
    return !!this.getToken()
  },

  isAdmin() {
    const info = this.getUserInfo()
    return info?.roleCode === 'ADMIN'
  },

  isUser() {
    const info = this.getUserInfo()
    return info?.roleCode === 'USER'
  },

  // ---------- 设置状态 ----------
  setUserInfo(data) {
    if (!data) return
    const userInfo = data.userInfo || data
    const token = data.token || ''
    uni.setStorageSync('userInfo', JSON.stringify(userInfo))
    uni.setStorageSync('token', token)
    uni.setStorageSync('role', userInfo.roleCode || '')
  },

  updateUserInfo(data) {
    if (!data) return
    uni.setStorageSync('userInfo', JSON.stringify(data))
  },

  // ---------- 清除状态 ----------
  clearUserInfo() {
    uni.removeStorageSync('userInfo')
    uni.removeStorageSync('token')
    uni.removeStorageSync('role')
  },

  // ---------- 登录 ----------
  async login(loginForm) {
    const res = await request.post('/user/login', loginForm)
    this.setUserInfo(res)
    return res
  },

  // ---------- 退出 ----------
  logout() {
    this.clearUserInfo()
  }
}

export default userStore
