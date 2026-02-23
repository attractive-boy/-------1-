<template>
  <nav class="tabbar">
    <router-link
      v-for="item in tabs"
      :key="item.path"
      :to="item.path"
      class="tab-item"
      :class="{ 'is-active': isActive(item.path) }"
    >
      <el-icon class="tab-icon"><component :is="item.icon" /></el-icon>
      <span class="tab-label">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  HomeFilled,
  Folder,
  Search,
  Collection,
  User,
  UserFilled,
  DocumentChecked
} from '@element-plus/icons-vue'

const route = useRoute()

const tabs = [
  { path: '/back/dashboard', label: '首页',     icon: HomeFilled },
  { path: '/back/lost',      label: '失物',     icon: Search },
  { path: '/back/found',     label: '招领',     icon: Collection },
  { path: '/back/claim',     label: '认领',     icon: DocumentChecked },
  { path: '/back/category',  label: '分类',     icon: Folder },
  { path: '/back/user',      label: '用户',     icon: User },
  { path: '/back/profile',   label: '我的',     icon: UserFilled },
]

const isActive = (path) => {
  const current = route.meta.activeMenu || route.path
  return current === path || current.startsWith(path + '/')
}
</script>

<style lang="scss" scoped>
.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  display: flex;
  align-items: stretch;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom);

  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    text-decoration: none;
    color: #9ca3af;
    font-size: 12px;
    transition: color 0.2s;
    position: relative;

    .tab-icon {
      font-size: 20px;
      transition: transform 0.2s;
    }

    .tab-label {
      font-size: 11px;
      font-weight: 500;
      line-height: 1;
    }

    &.is-active {
      color: #4f46e5;

      .tab-icon {
        transform: translateY(-2px);
      }

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 20%;
        right: 20%;
        height: 2px;
        background: #4f46e5;
        border-radius: 0 0 2px 2px;
      }
    }

    &:active {
      background: #f3f4f6;
    }
  }
}

// 保留旧类以防其他地方引用（不渲染任何内容）
.sidebar-container {
  height: 100%; 
  min-height: 100vh;
  background: linear-gradient(180deg, #1c1c1c 0%, #2d2d2d 100%);
  display: flex;
  flex-direction: column;
  width: 220px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &.is-collapsed {
    width: 64px;
    
    .logo {
      padding: 0;
      justify-content: center;
      
      .logo-icon {
        margin: 0;
      }
    }

    :deep(.el-menu) {
      .el-sub-menu__title span,
      .el-menu-item span {
        opacity: 0;
        transition: opacity 0.2s;
      }
    }
  }
  
  .logo {
    height: 60px;
    flex-shrink: 0;
    line-height: 60px;
    text-align: center;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 16px;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    .logo-svg {
      height: 40px;
      width: auto;
      max-width: 180px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .logo-icon {
      font-size: 24px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .logo-text {
      color: #ffffff;
      font-size: 18px;
      font-weight: 600;
      white-space: nowrap;
      opacity: 1;
      transition: opacity 0.2s;
    }
  }

  .menu-wrapper {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }

  :deep(.sidebar-menu) {
    border: none;
    background: transparent;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    .el-menu-item, .el-sub-menu__title {
      height: 50px;
      line-height: 50px;
      color: rgba(255, 255, 255, 0.7);
      background: transparent;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      span {
        opacity: 1;
        transition: opacity 0.3s;
      }
      
      &:hover {
        background: rgba(255, 255, 255, 0.05) !important;
        color: #ffffff;
      }
    }

    .el-menu-item.is-active {
      background: #000000 !important;
      color: #ffffff !important;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 3px;
        height: 100%;
        background: #1890ff;
      }
    }

    .el-sub-menu {
      &.is-opened {
        > .el-sub-menu__title {
          color: #ffffff;
          background: rgba(0, 0, 0, 0.2) !important;
        }
      }

      .el-menu {
        background: rgba(0, 0, 0, 0.3);
        
        .el-menu-item {
          background: transparent;
          
          &:hover {
            background: rgba(255, 255, 255, 0.05) !important;
          }
          
          &.is-active {
            background: #000000 !important;
          }
        }
      }
    }

    // 折叠状态下的弹出菜单样式
    &.el-menu--collapse {
      .el-sub-menu {
        &.is-opened {
          > .el-sub-menu__title {
            background: transparent !important;
          }
        }
      }
    }
  }

  .el-icon {
    vertical-align: middle;
    margin-right: 5px;
    width: 24px;
    text-align: center;
    color: inherit;
  }

  span {
    vertical-align: middle;
  }
}
</style> 