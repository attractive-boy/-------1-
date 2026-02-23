<template>
  <div class="campus-lost-found">
    <!-- 顶部导航栏 -->
    <FrontendNavbar />

    <!-- 主内容区域 -->
    <main class="main-content">
      <keep-alive>
        <router-view v-slot="{ Component }">
          <transition name="page-transition" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </keep-alive>
    </main>

    <!-- 浮动发布快捷入口（登录后显示，桌面端） -->
    <div class="floating-features" v-if="isLoggedIn && !isMobile">
      <div class="feature-card publish-lost" @click="router.push('/lost/publish')">
        <div class="card-icon"><el-icon><Plus /></el-icon></div>
        <div class="card-text">
          <span class="title">丢失了？</span>
          <span class="subtitle">发布失物信息</span>
        </div>
      </div>
      <div class="feature-card publish-found" @click="router.push('/found/publish')">
        <div class="card-icon"><el-icon><Upload /></el-icon></div>
        <div class="card-text">
          <span class="title">捡到了？</span>
          <span class="subtitle">发布招领信息</span>
        </div>
      </div>
    </div>

    <!-- 移动端底部 Tabbar -->
    <FrontendTabbar v-if="isMobile" />

    <!-- 页脚（桌面端） -->
    <footer class="warm-footer" v-if="!isMobile">
      <div class="footer-content">
        <p>&copy; {{ new Date().getFullYear() }} 校园失物招领系统 · 传递温暖，连接心灵</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { Plus, Upload } from '@element-plus/icons-vue'
import FrontendNavbar from '@/components/frontend/Navbar.vue'
import FrontendTabbar from '@/components/frontend/Tabbar.vue'

const router = useRouter()
const userStore = useUserStore()

const isMobile = ref(false)
const isLoggedIn = computed(() => userStore.isLoggedIn)

const checkScreenSize = () => { isMobile.value = window.innerWidth <= 768 }

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})
onUnmounted(() => window.removeEventListener('resize', checkScreenSize))
</script>

<style lang="scss" scoped>
* {
  font-family: "Source Han Sans", "Noto Sans CJK SC", "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.campus-lost-found {
  min-height: 100vh;
  background: var(--warm-bg);
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 24px;
}

.floating-features {
  position: fixed;
  right: 24px;
  bottom: 120px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 50;

  .feature-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: white;
    border-radius: var(--warm-radius-xl);
    box-shadow: var(--warm-shadow-strong);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover { transform: translateX(-8px) translateY(-2px); }

    &.publish-lost { background: var(--warm-pink); color: white; }
    &.publish-found { background: var(--warm-green); color: white; }

    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--warm-radius-md);
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;

      .el-icon { font-size: 24px; }
    }

    .card-text {
      display: flex;
      flex-direction: column;

      .title { font-weight: 700; font-size: 16px; }
      .subtitle { font-size: 12px; opacity: 0.8; }
    }
  }
}

.warm-footer {
  background: var(--warm-gray-800);
  color: white;
  margin-top: auto;

  .footer-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 32px 24px;
    text-align: center;

    p { color: var(--warm-gray-400); font-size: 14px; margin: 0; line-height: 1.6; }
  }
}

.page-transition-enter-active,
.page-transition-leave-active {
  transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1);
}

.page-transition-enter-from { opacity: 0; transform: translateY(24px); }
.page-transition-leave-to  { opacity: 0; transform: translateY(-24px); }

@media (max-width: 768px) {
  .main-content {
    padding: 16px;
    padding-bottom: 80px;
  }
}
</style>
