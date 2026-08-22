<template>
  <div class="main-layout">
    <BackgroundLayer />

    <header class="top-bar glass-panel">
      <RouterLink to="/" class="brand">
        <span class="brand-mark">JG</span>
        <span class="brand-dot">·</span>
        <span class="brand-name">Nav</span>
      </RouterLink>

      <nav class="nav-tabs">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.to"
          :to="tab.to"
          class="nav-tab"
          :class="{ active: route.path === tab.to }"
        >
          <el-icon><component :is="tab.icon" /></el-icon>
          {{ tab.label }}
        </RouterLink>
      </nav>

      <SearchBar class="top-search" />

      <div class="top-actions">
        <WeatherWidget />

        <el-tooltip :content="appStore.theme === 'dark' ? '切换浅色' : '切换深色'" placement="bottom">
          <button class="icon-btn" @click="appStore.toggleTheme()">
            <el-icon><Sunny v-if="appStore.theme === 'dark'" /><Moon v-else /></el-icon>
          </button>
        </el-tooltip>

        <el-popover trigger="click" width="280" placement="bottom-end">
          <template #reference>
            <el-tooltip content="背景设置" placement="bottom">
              <button class="icon-btn">
                <el-icon><Picture /></el-icon>
              </button>
            </el-tooltip>
          </template>
          <BackgroundPicker />
        </el-popover>

        <el-dropdown v-if="userStore.user">
          <button class="icon-btn user-btn">
            <span class="username">{{ userStore.user.username }}</span>
            <el-icon><ArrowDown /></el-icon>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <button v-else class="login-btn" @click="loginVisible = true">
          登录
        </button>
      </div>
    </header>

    <main class="page-content app-scroll">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <footer class="site-footer">
      <a
        href="https://beian.mps.gov.cn/#/query/webSearch?code=11010502056569"
        rel="noreferrer"
        target="_blank"
      >
        <img src="@/assets/police-logo.png" width="16" alt="公安备案" />
        京公网安备11010502056569号
      </a>
      <a href="https://beian.miit.gov.cn/" target="_blank">赣ICP备2025054513号</a>
    </footer>

    <LoginDialog v-model="loginVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref, provide, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  Sunny,
  Moon,
  Picture,
  ArrowDown,
  Compass,
  Food,
  Suitcase
} from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';
import { useAppStore } from '@/stores/app';
import BackgroundLayer from '@/components/BackgroundLayer.vue';
import BackgroundPicker from '@/components/BackgroundPicker.vue';
import SearchBar from '@/components/SearchBar.vue';
import WeatherWidget from '@/components/WeatherWidget.vue';
import LoginDialog from '@/components/LoginDialog.vue';

defineOptions({ name: 'MainLayout' });

const tabs = [
  { to: '/', label: '导航', icon: Compass },
  { to: '/takeout', label: '外卖', icon: Food },
  { to: '/tools', label: '工具', icon: Suitcase }
];

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const appStore = useAppStore();
const loginVisible = ref(false);

// 子页面（收藏区/外卖/工具）也能唤起登录弹窗
provide('openLogin', () => (loginVisible.value = true));

// 刷新/整页重载后恢复 httpOnly Cookie 会话（失败静默，展示未登录态）
onMounted(() => userStore.restore());

const handleLogout = async () => {
  await userStore.logout();
  ElMessage.success('已退出登录');
  router.push('/');
};
</script>

<style lang="scss" scoped>
.main-layout {
  position: relative;
  z-index: 1;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-bar {
  margin: 14px 18px 0;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;

  .brand {
    display: flex;
    align-items: baseline;
    text-decoration: none;
    color: var(--text-1);
    flex-shrink: 0;

    .brand-mark {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 1px;
    }

    .brand-dot {
      margin: 0 2px;
      color: var(--accent);
      font-weight: 700;
    }

    .brand-name {
      font-size: 15px;
      color: var(--text-2);
    }
  }

  .nav-tabs {
    display: flex;
    gap: 4px;
    flex-shrink: 0;

    .nav-tab {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 7px 14px;
      border-radius: 12px;
      text-decoration: none;
      font-size: 14px;
      color: var(--text-2);
      transition:
        background 0.2s ease,
        color 0.2s ease;

      &:hover {
        background: var(--hover-bg);
        color: var(--text-1);
      }

      &.active {
        background: var(--hover-bg);
        color: var(--text-1);
        font-weight: 600;
      }
    }
  }

  .top-search {
    margin-left: auto;
  }

  .top-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    height: 32px;
    min-width: 32px;
    padding: 0 6px;
    border-radius: 10px;
    border: 1px solid var(--glass-border);
    background: transparent;
    color: var(--text-2);
    cursor: pointer;
    font-size: 15px;
    transition:
      background 0.2s ease,
      color 0.2s ease;

    &:hover {
      background: var(--hover-bg);
      color: var(--text-1);
    }
  }

  .user-btn {
    .username {
      font-size: 13px;
      max-width: 90px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .login-btn {
    height: 32px;
    padding: 0 16px;
    border-radius: 10px;
    border: none;
    background: var(--accent);
    color: #fff;
    font-size: 13px;
    cursor: pointer;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.88;
    }
  }
}

.page-content {
  flex: 1;
  margin: 14px 18px 46px;
}

.site-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 34px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  font-size: 12px;
  color: var(--text-3);

  a {
    display: flex;
    align-items: center;
    gap: 4px;
    text-decoration: none;
    color: var(--text-3);

    &:hover {
      color: var(--text-2);
    }
  }
}

// 窄屏：顶栏搜索收缩，保底可用
@media (max-width: 960px) {
  .top-bar .top-search {
    display: none;
  }
}
</style>
