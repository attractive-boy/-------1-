/**
 * UniApp 请求封装（替代 axios）
 * 使用 uni.request 实现统一的网络请求
 */

const BASE_URL = 'http://localhost:1235/api'

/**
 * 核心请求函数
 * @param {string} url - 请求路径
 * @param {string} method - 请求方法
 * @param {object} data - 请求数据
 * @param {object} options - 额外配置
 */
function http(url, method, data, options = {}) {
  const {
    showDefaultMsg = true,
    successMsg = '',
    errorMsg = '',
    onSuccess = null,
    onError = null,
    header = {}
  } = options

  const token = uni.getStorageSync('token')
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...header
  }
  if (token) {
    defaultHeaders['token'] = token
  }

  uni.showLoading({ title: '加载中...', mask: true })

  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + url,
      method: method.toUpperCase(),
      data,
      header: defaultHeaders,
      success(res) {
        uni.hideLoading()
        const result = res.data
        if (result.code === '200' || result.code === 200) {
          if (successMsg) {
            uni.showToast({ title: successMsg, icon: 'success', duration: 2000 })
          } else if (showDefaultMsg && method.toLowerCase() !== 'get') {
            uni.showToast({ title: '操作成功', icon: 'success', duration: 1500 })
          }
          if (typeof onSuccess === 'function') {
            onSuccess(result.data)
          }
          resolve(result.data)
        } else {
          let msg = result.msg || '请求失败'
          if (result.code === '401' || result.code === 401) {
            msg = '登录已过期，请重新登录'
            uni.getStorageSync('token') && uni.removeStorageSync('token')
            uni.getStorageSync('userInfo') && uni.removeStorageSync('userInfo')
            setTimeout(() => {
              uni.reLaunch({ url: '/pages/auth/login' })
            }, 1500)
          }
          if (showDefaultMsg || errorMsg) {
            uni.showToast({ title: errorMsg || msg, icon: 'none', duration: 2500 })
          }
          if (typeof onError === 'function') {
            onError(result)
          }
          reject({ code: result.code, message: msg, data: result.data })
        }
      },
      fail(err) {
        uni.hideLoading()
        const msg = errorMsg || '网络连接失败，请检查网络'
        if (showDefaultMsg) {
          uni.showToast({ title: msg, icon: 'none', duration: 2500 })
        }
        if (typeof onError === 'function') {
          onError(err)
        }
        reject({ message: msg, originalError: err })
      }
    })
  })
}

const request = {
  get(url, params = {}, options = {}) {
    // 将 params 拼接到 url
    const query = Object.keys(params || {})
      .filter(k => params[k] !== '' && params[k] !== null && params[k] !== undefined)
      .map(k => `${k}=${encodeURIComponent(params[k])}`)
      .join('&')
    const fullUrl = query ? `${url}?${query}` : url
    return http(fullUrl, 'GET', {}, options)
  },

  post(url, data = {}, options = {}) {
    return http(url, 'POST', data, options)
  },

  put(url, data = {}, options = {}) {
    return http(url, 'PUT', data, options)
  },

  delete(url, options = {}) {
    return http(url, 'DELETE', {}, options)
  }
}

export { BASE_URL }
export default request
