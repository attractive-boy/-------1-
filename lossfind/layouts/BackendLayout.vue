<template>
  <div class="backend-layout">
    <!-- 顶部导航栏 -->
    <Navbar />

    <!-- 页面内容 -->
    <div class="content-container">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <!-- 底部 Tabbar -->
    <Sidebar />
  </div>
</template>

<script setup>
import Sidebar from '@/components/backend/Sidebar.vue'
import Navbar from '@/components/backend/Navbar.vue'
</script>

<style lang="scss" scoped>
.backend-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
  overflow: hidden;
}

.content-container {
  flex: 1;
  padding: 16px;
  padding-bottom: 72px; // 为底部 tabbar 留空间
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>