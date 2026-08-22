<template>
  <div class="tools-page">
    <template v-if="userStore.user">
      <div class="tools-grid">
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
      </div>
    </template>

    <div v-else class="login-tip glass-panel">
      <el-link :underline="false" @click="openLogin">登录后使用待办、便签、纪念日与番茄钟</el-link>
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

.login-tip {
  margin-top: 8vh;
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
