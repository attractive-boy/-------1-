<template>
  <header class="warm-header">
    <div class="header-container">
      <div class="brand-section" @click="navigateTo('/')">
        <div class="logo-wrapper">
          <img src="@/assets/logo.svg" alt="Logo" class="logo" />
          <div class="logo-glow"></div>
        </div>
      </div>

      <!-- 主要功能导航 - 卡片式 -->
      <nav class="feature-nav">
        <div class="nav-card" :class="{ active: activeMenu === '/' }" @click="navigateTo('/')">
          <div class="nav-icon"><el-icon><HomeFilled /></el-icon></div>
          <span>首页</span>
        </div>
        <div class="nav-card lost-card" :class="{ active: activeMenu === '/lost' }" @click="navigateTo('/lost')">
          <div class="nav-icon"><el-icon><Search /></el-icon></div>
          <span>寻找失物</span>
        </div>
        <div class="nav-card found-card" :class="{ active: activeMenu === '/found' }" @click="navigateTo('/found')">
          <div class="nav-icon"><el-icon><Collection /></el-icon></div>
          <span>招领信息</span>
        </div>
      </nav>

      <!-- 用户区域 -->
      <div class="user-section">
        <div class="search-area" v-if="!isMobile">
          <div class="search-wrapper">
            <el-input
              v-model="searchQuery"
              placeholder="搜索你遗失的物品..."
              @keyup.enter="handleSearch"
              clearable
              class="warm-search"
            >
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </div>
        </div>

        <!-- 已登录用户 -->
        <div class="logged-user" v-if="isLoggedIn">
          <div class="user-welcome" v-if="!isMobile">
            <span class="welcome-text">欢迎回来</span>
            <span class="user-name">{{ username }}</span>
          </div>

          <div class="notification-bubble" @click="navigateTo('/notification')">
            <div class="bell-icon"><el-icon><Bell /></el-icon></div>
          </div>

          <el-dropdown @command="handleCommand" trigger="hover" class="user-dropdown">
            <div class="avatar-wrapper">
              <el-avatar :src="userAvatar" :size="40" class="user-avatar">
                {{ userInitial }}
              </el-avatar>
              <div class="online-dot"></div>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="warm-dropdown">
                <div class="dropdown-header">
                  <div class="user-info">
                    <strong>{{ username }}</strong>
                    <span class="role-tag">{{ isAdmin ? '管理员' : '普通用户' }}</span>
                  </div>
                </div>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>个人资料
                </el-dropdown-item>
                <el-dropdown-item command="myClaims">
                  <el-icon><Document /></el-icon>我的申请
                </el-dropdown-item>
                <el-dropdown-item command="myAudits">
                  <el-icon><Checked /></el-icon>待我审核
                </el-dropdown-item>
                <el-dropdown-item v-if="isAdmin" divided command="admin">
                  <el-icon><Setting /></el-icon>管理后台
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <!-- 未登录用户 -->
        <div class="guest-actions" v-else>
          <el-button @click="navigateTo('/login')" class="warm-btn login-btn">
            <el-icon><User /></el-icon>登录
          </el-button>
          <el-button type="primary" @click="navigateTo('/register')" class="warm-btn register-btn">
            加入我们
          </el-button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessageBox } from 'element-plus'
import {
  User, SwitchButton, Document, Checked,
  HomeFilled, Search, Collection, Setting, Bell
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const searchQuery = ref('')
const isMobile = ref(false)

const activeMenu = computed(() => route.path)
const isLoggedIn = computed(() => userStore.isLoggedIn)
const username = computed(() => userStore.userInfo?.username || '')
const userAvatar = computed(() => {
  if (!userStore.userInfo?.avatar) return ''
  const baseAPI = import.meta.env.VITE_BASE_API || '/api'
  return userStore.userInfo.avatar.startsWith('http')
    ? userStore.userInfo.avatar
    : baseAPI + userStore.userInfo.avatar
})
const userInitial = computed(() => username.value.charAt(0).toUpperCase())
const isAdmin = computed(() => userStore.userInfo?.roleCode === 'ADMIN')

const navigateTo = (path) => router.push(path)

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/lost', query: { search: searchQuery.value } })
  }
}

const handleCommand = (command) => {
  const map = {
    profile: '/profile',
    myClaims: '/claim',
    myAudits: '/claim/audit',
    admin: '/back',
  }
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗?', '温馨提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      userStore.logout()
      navigateTo('/login')
    }).catch(() => {})
  } else if (map[command]) {
    navigateTo(map[command])
  }
}

const checkScreenSize = () => { isMobile.value = window.innerWidth <= 768 }

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})
onUnmounted(() => window.removeEventListener('resize', checkScreenSize))
</script>

<style lang="scss" scoped>
.warm-header {
  background: var(--glass-background);
  backdrop-filter: var(--glass-backdrop);
  -webkit-backdrop-filter: var(--glass-backdrop);
  border-bottom: 1px solid var(--glass-border);
  box-shadow: var(--warm-shadow-soft);
  position: sticky;
  top: 0;
  z-index: 100;

  .header-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    gap: 32px;

    .brand-section {
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      flex-shrink: 0;

      &:hover { transform: translateY(-2px); }

      .logo-wrapper {
        position: relative;

        .logo {
          border-radius: var(--warm-radius-md);
          object-fit: contain;
          height: 40px;
          width: auto;
        }

        .logo-glow {
          position: absolute;
          inset: -4px;
          border-radius: var(--warm-radius-lg);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        &:hover .logo-glow { opacity: 0.2; }
      }
    }

    .feature-nav {
      display: flex;
      gap: 8px;
      flex: 1;

      .nav-card {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 18px;
        border-radius: var(--warm-radius-lg);
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
        color: var(--warm-gray-600);
        background: var(--warm-gray-50);

        &:hover {
          transform: translateY(-2px);
          box-shadow: var(--warm-shadow-medium);
        }

        &.active {
          background: var(--warm-primary);
          color: white;
          box-shadow: var(--warm-shadow-glow);
        }

        &.lost-card:not(.active) {
          background: rgba(255, 107, 157, 0.1);
          &:hover { background: rgba(255, 107, 157, 0.2); }
        }

        &.found-card:not(.active) {
          background: rgba(78, 205, 196, 0.1);
          &:hover { background: rgba(78, 205, 196, 0.2); }
        }

        .nav-icon { font-size: 18px; }
      }
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: 16px;

      .search-area .search-wrapper {
        width: 280px;

        .warm-search :deep(.el-input__wrapper) {
          border-radius: var(--warm-radius-lg);
          border: 2px solid var(--warm-gray-200);
          box-shadow: none;
          background: var(--warm-gray-50);

          &:hover { border-color: var(--warm-primary-light); }
          &.is-focus {
            border-color: var(--warm-primary);
            background: white;
            box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
          }
        }
      }

      .logged-user {
        display: flex;
        align-items: center;
        gap: 12px;

        .user-welcome {
          display: flex;
          flex-direction: column;
          align-items: flex-end;

          .welcome-text { font-size: 12px; color: var(--warm-gray-500); }
          .user-name { font-weight: 600; color: var(--warm-gray-700); }
        }

        .notification-bubble {
          cursor: pointer;

          .bell-icon {
            width: 40px;
            height: 40px;
            border-radius: var(--warm-radius-md);
            background: var(--warm-gray-50);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;

            &:hover {
              background: var(--warm-primary-light);
              color: white;
              transform: translateY(-1px);
            }

            .el-icon { font-size: 18px; }
          }
        }

        .user-dropdown .avatar-wrapper {
          position: relative;
          cursor: pointer;

          .user-avatar {
            border: 3px solid var(--warm-gray-200);
            transition: all 0.3s ease;

            &:hover {
              border-color: var(--warm-primary);
              transform: translateY(-2px);
              box-shadow: var(--warm-shadow-medium);
            }
          }

          .online-dot {
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 10px;
            height: 10px;
            background: var(--warm-green);
            border: 2px solid white;
            border-radius: 50%;
            animation: pulse 2s infinite;
          }
        }
      }

      .guest-actions {
        display: flex;
        gap: 12px;

        .warm-btn {
          border-radius: var(--warm-radius-lg);
          font-weight: 500;
          padding: 10px 20px;
          transition: all 0.3s ease;

          &.login-btn {
            border: 2px solid var(--warm-gray-300);
            color: var(--warm-gray-600);
            background: transparent;

            &:hover {
              border-color: var(--warm-primary);
              color: var(--warm-primary);
              transform: translateY(-1px);
            }
          }

          &.register-btn {
            background: var(--warm-primary);
            border: none;

            &:hover {
              transform: translateY(-2px);
              box-shadow: var(--warm-shadow-glow);
            }
          }
        }
      }
    }
  }
}

:deep(.warm-dropdown) {
  border-radius: var(--warm-radius-lg);
  border: 1px solid var(--warm-gray-200);
  box-shadow: var(--warm-shadow-strong);

  .dropdown-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--warm-gray-200);
    background: var(--warm-gray-50);

    .user-info {
      strong { display: block; color: var(--warm-gray-800); margin-bottom: 4px; }

      .role-tag {
        font-size: 12px;
        color: var(--warm-gray-500);
        background: var(--warm-gray-200);
        padding: 2px 8px;
        border-radius: var(--warm-radius-sm);
      }
    }
  }

  .el-dropdown-menu__item {
    padding: 12px 20px;
    border-radius: var(--warm-radius-sm);
    margin: 4px 8px;

    &:hover {
      background: rgba(74, 144, 226, 0.1);
      color: var(--warm-primary);
    }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}

@media (max-width: 768px) {
  .warm-header .header-container {
    padding: 12px 16px;
    gap: 16px;

    .feature-nav { display: none; }
    .user-section .search-area { display: none; }
  }
}

@media (max-width: 480px) {
  .warm-header .header-container .guest-actions {
    gap: 8px;

    .warm-btn { padding: 8px 14px; font-size: 14px; }
  }
}
</style>
