<template>
  <div class="mobile-bottom-nav">
    <div class="bottom-nav-item" :class="{ active: activeMenu === '/' }" @click="navigateTo('/')">
      <el-icon><HomeFilled /></el-icon>
      <span>首页</span>
    </div>
    <div class="bottom-nav-item" :class="{ active: activeMenu.startsWith('/lost') }" @click="navigateTo('/lost')">
      <el-icon><Search /></el-icon>
      <span>失物</span>
    </div>
    <div class="bottom-nav-item" :class="{ active: activeMenu.startsWith('/found') }" @click="navigateTo('/found')">
      <el-icon><Collection /></el-icon>
      <span>招领</span>
    </div>
    <template v-if="isLoggedIn">
      <div class="bottom-nav-item" :class="{ active: activeMenu === '/notification' }" @click="navigateTo('/notification')">
        <el-icon><Bell /></el-icon>
        <span>通知</span>
      </div>
      <div class="bottom-nav-item" :class="{ active: activeMenu.startsWith('/profile') }" @click="navigateTo('/profile')">
        <el-icon><User /></el-icon>
        <span>我的</span>
      </div>
    </template>
    <div class="bottom-nav-item" v-else @click="navigateTo('/login')">
      <el-icon><User /></el-icon>
      <span>登录</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { HomeFilled, Search, Collection, Bell, User } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)
const isLoggedIn = computed(() => userStore.isLoggedIn)

const navigateTo = (path) => router.push(path)
</script>

<style lang="scss" scoped>
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid var(--warm-gray-200);
  display: flex;
  justify-content: space-around;
  padding: 8px 0 calc(12px + env(safe-area-inset-bottom));
  z-index: 100;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06);

  .bottom-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border-radius: var(--warm-radius-md);
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--warm-gray-400);
    font-size: 11px;
    font-weight: 500;
    flex: 1;

    &.active {
      color: var(--warm-primary);

      .el-icon {
        transform: translateY(-2px);
      }
    }

    .el-icon {
      font-size: 22px;
      transition: transform 0.2s ease;
    }
  }
}
</style>
