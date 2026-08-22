<template>
  <div class="search-bar">
    <el-dropdown trigger="click" @command="handleEngineChange">
      <div class="engine-chip" :title="`当前：${currentEngine.name}（Tab 切换）`">
        <img :src="currentEngine.icon" alt="" @error="onIconError" />
        <span class="engine-name">{{ currentEngine.name }}</span>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="engine in engines"
            :key="engine.key"
            :command="engine.key"
          >
            <img class="engine-menu-icon" :src="engine.icon" alt="" />
            {{ engine.name }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <input
      ref="inputRef"
      v-model="keyword"
      class="search-input"
      type="text"
      :placeholder="`在 ${currentEngine.name} 搜索，按 / 聚焦`"
      @keydown.enter="handleSearch"
      @keydown.tab.prevent="switchEngine(1)"
    />
    <el-icon class="search-btn" @click="handleSearch"><Search /></el-icon>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { useAppStore } from '@/stores/app';

defineOptions({ name: 'SearchBar' });

interface Engine {
  key: string;
  name: string;
  url: string;
  icon: string;
}

const engines: Engine[] = [
  { key: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=', icon: 'https://www.bing.com/favicon.ico' },
  { key: 'baidu', name: '百度', url: 'https://www.baidu.com/s?wd=', icon: 'https://www.baidu.com/favicon.ico' },
  { key: 'google', name: 'Google', url: 'https://www.google.com/search?q=', icon: 'https://www.google.com/favicon.ico' },
  { key: 'github', name: 'GitHub', url: 'https://github.com/search?q=', icon: 'https://github.com/favicon.ico' },
  { key: 'bilibili', name: 'B站', url: 'https://search.bilibili.com/all?keyword=', icon: 'https://www.bilibili.com/favicon.ico' },
  { key: 'mdn', name: 'MDN', url: 'https://developer.mozilla.org/zh-CN/search?q=', icon: 'https://developer.mozilla.org/favicon.ico' }
];

const appStore = useAppStore();
const inputRef = ref<HTMLInputElement>();
const keyword = ref('');

const currentEngine = computed(
  () => engines.find((e) => e.key === appStore.engine) ?? engines[0]
);

function handleEngineChange(key: string | number | object) {
  appStore.engine = String(key);
  inputRef.value?.focus();
}

/** Tab 正向循环切引擎 */
function switchEngine(step: number) {
  const index = engines.findIndex((e) => e.key === currentEngine.value.key);
  const next = engines[(index + step + engines.length) % engines.length];
  appStore.engine = next.key;
}

function handleSearch() {
  const q = keyword.value.trim();
  if (!q) return;
  window.open(currentEngine.value.url + encodeURIComponent(q), '_blank');
}

function onIconError(e: Event) {
  (e.target as HTMLImageElement).style.display = 'none';
}

function onGlobalKeydown(e: KeyboardEvent) {
  // 全局 "/" 聚焦搜索；已在输入类控件内则不打扰
  if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
  const target = e.target as HTMLElement;
  if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) {
    return;
  }
  e.preventDefault();
  inputRef.value?.focus();
}

onMounted(() => window.addEventListener('keydown', onGlobalKeydown));
onUnmounted(() => window.removeEventListener('keydown', onGlobalKeydown));
</script>

<style lang="scss" scoped>
// 下拉面板会被 teleport 到 body，引擎图标样式必须用顶层选择器（不能嵌套在 .search-bar 内）
.engine-menu-icon {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  margin-right: 8px;
  object-fit: contain;
}

.search-bar {
  display: flex;
  align-items: center;
  width: min(460px, 36vw);
  height: 40px;
  padding: 0 10px;
  gap: 8px;
  border-radius: 20px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  transition: box-shadow 0.2s ease;

  &:focus-within {
    box-shadow: 0 0 0 2px var(--accent);
  }

  .engine-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 14px;
    cursor: pointer;
    color: var(--text-2);
    outline: none;
    flex-shrink: 0;

    &:hover {
      background: var(--hover-bg);
    }

    img {
      width: 16px;
      height: 16px;
      border-radius: 3px;
      object-fit: contain;
    }

    .engine-name {
      font-size: 13px;
      white-space: nowrap;
    }
  }

  .search-input {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    font-size: 14px;
    color: var(--text-1);

    &::placeholder {
      color: var(--text-3);
    }
  }

  .search-btn {
    cursor: pointer;
    color: var(--text-2);
    flex-shrink: 0;

    &:hover {
      color: var(--accent);
    }
  }
}
</style>
