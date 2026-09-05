<template>
  <div class="tools-page">
    <div class="sub-tabs glass-panel">
      <button
        v-for="group in groups"
        :key="group.key"
        class="sub-tab"
        :class="{ active: activeGroup === group.key }"
        @click="activeGroup = group.key"
      >
        <el-icon><component :is="group.icon" /></el-icon>
        {{ group.label }}
      </button>
    </div>

    <!-- 效率：个人工具，登录后可用 -->
    <div v-show="activeGroup === 'productivity'" class="tools-grid">
      <template v-if="userStore.user">
        <div class="tool-card glass-panel fade-up">
          <TodoPanel />
        </div>
        <div class="tool-card glass-panel fade-up" style="animation-delay: 60ms">
          <NotePanel />
        </div>
        <div class="tool-card glass-panel fade-up" style="animation-delay: 120ms">
          <MemorialPanel />
        </div>
        <div class="tool-card glass-panel fade-up" style="animation-delay: 180ms">
          <PomodoroPanel />
        </div>
      </template>
      <div v-else class="login-tip glass-panel span-2">
        <el-link :underline="false" @click="openLogin">登录后使用待办、便签、纪念日与番茄钟</el-link>
      </div>
    </div>

    <!-- 开发：转换类小工具，无需登录 -->
    <div v-show="activeGroup === 'dev'" class="tools-grid">
      <div class="tool-card glass-panel fade-up span-2">
        <JsonPanel />
      </div>
      <div class="tool-card glass-panel fade-up" style="animation-delay: 60ms">
        <TimestampPanel />
      </div>
      <div class="tool-card glass-panel fade-up" style="animation-delay: 120ms">
        <UrlPanel />
      </div>
    </div>

    <!-- 翻译：走后端代理，需登录 -->
    <div v-show="activeGroup === 'translate'" class="tools-grid">
      <template v-if="userStore.user">
        <div class="tool-card glass-panel fade-up span-2">
          <TranslatePanel />
        </div>
      </template>
      <div v-else class="login-tip glass-panel span-2">
        <el-link :underline="false" @click="openLogin">登录后使用百度翻译</el-link>
      </div>
    </div>

    <!-- 图片：无需登录 -->
    <div v-show="activeGroup === 'image'" class="tools-grid">
      <div class="tool-card glass-panel fade-up span-2">
        <ImageDownloadPanel />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue';
import { Clock, Cpu, ChatDotRound, Picture } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';
import TodoPanel from './components/TodoPanel.vue';
import NotePanel from './components/NotePanel.vue';
import MemorialPanel from './components/MemorialPanel.vue';
import PomodoroPanel from './components/PomodoroPanel.vue';
import TranslatePanel from './components/TranslatePanel.vue';
import JsonPanel from './components/JsonPanel.vue';
import TimestampPanel from './components/TimestampPanel.vue';
import UrlPanel from './components/UrlPanel.vue';
import ImageDownloadPanel from './components/ImageDownloadPanel.vue';

defineOptions({ name: 'ToolsPage' });

const groups = [
  { key: 'productivity', label: '效率', icon: Clock },
  { key: 'dev', label: '开发', icon: Cpu },
  { key: 'translate', label: '翻译', icon: ChatDotRound },
  { key: 'image', label: '图片', icon: Picture }
] as const;

const activeGroup = ref<(typeof groups)[number]['key']>('productivity');
const userStore = useUserStore();
const openLogin = inject<() => void>('openLogin', () => {});
</script>

<style lang="scss" scoped>
.tools-page {
  min-height: 100%;
}

.sub-tabs {
  display: inline-flex;
  gap: 4px;
  padding: 5px;
  margin-bottom: 14px;
  border-radius: 14px;

  .sub-tab {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 7px 16px;
    border: none;
    border-radius: 10px;
    background: transparent;
    font-size: 14px;
    color: var(--text-2);
    cursor: pointer;
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

.tools-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.tool-card {
  padding: 16px 18px;
}

.span-2 {
  grid-column: 1 / -1;
}

.login-tip {
  padding: 28px;
  text-align: center;

  .el-link {
    font-size: 16px;
    color: var(--text-1);
  }
}

@media (max-width: 960px) {
  .tools-grid {
    grid-template-columns: 1fr;
  }
}
</style>
