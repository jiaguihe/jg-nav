<template>
  <div class="tools-page">
    <div class="tools-grid">
      <!-- 个人工具：登录后可用 -->
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
        <div class="tool-card glass-panel fade-up span-2" style="animation-delay: 240ms">
          <TranslatePanel />
        </div>
      </template>
      <div v-else class="login-tip glass-panel span-2">
        <el-link :underline="false" @click="openLogin">
          登录后使用待办、便签、纪念日、番茄钟与翻译
        </el-link>
      </div>

      <!-- 实用小工具：无需登录 -->
      <div class="tool-card glass-panel fade-up span-2" style="animation-delay: 300ms">
        <JsonPanel />
      </div>
      <div class="tool-card glass-panel fade-up" style="animation-delay: 360ms">
        <TimestampPanel />
      </div>
      <div class="tool-card glass-panel fade-up" style="animation-delay: 420ms">
        <UrlPanel />
      </div>
      <div class="tool-card glass-panel fade-up span-2" style="animation-delay: 480ms">
        <ImageDownloadPanel />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
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

const userStore = useUserStore();
const openLogin = inject<() => void>('openLogin', () => {});
</script>

<style lang="scss" scoped>
.tools-page {
  min-height: 100%;
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
