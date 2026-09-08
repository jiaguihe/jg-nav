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

    <!-- 单一网格渲染全部工具：v-show + order 切换视图，面板实例不销毁，切分组不丢状态 -->
    <div class="tools-grid">
      <div
        v-for="tool in tools"
        :key="tool.id"
        v-show="visibleIds.has(tool.id)"
        class="tool-card glass-panel fade-up"
        :class="{
          'span-2': tool.isWide,
          'is-dragging': dragId === tool.id,
          'is-drag-over': dragOverId === tool.id
        }"
        :style="{
          order: orderOf(tool.id),
          animationDelay: `${orderOf(tool.id) * 60}ms`
        }"
        @dragover.prevent="handleDragOver(tool.id)"
        @drop.prevent="handleDrop(tool.id)"
      >
        <div class="fav-actions">
          <el-icon
            v-if="activeGroup === 'favorites'"
            class="drag-handle"
            draggable="true"
            title="拖动调整顺序"
            @dragstart="handleDragStart(tool.id, $event)"
            @dragend="handleDragEnd"
          >
            <Rank />
          </el-icon>
          <button
            class="fav-btn"
            :class="{ active: isFavorite(tool.id) }"
            :title="isFavorite(tool.id) ? '从常用移除' : '固定到常用'"
            @click="toggleFavorite(tool)"
          >
            <el-icon>
              <StarFilled v-if="isFavorite(tool.id)" />
              <Star v-else />
            </el-icon>
          </button>
        </div>

        <component :is="tool.component" v-if="!tool.requiresLogin || userStore.user" />
        <div v-else class="login-tip">
          <el-link :underline="false" @click="openLogin">登录后使用{{ tool.label }}</el-link>
        </div>
      </div>

      <div
        v-if="activeGroup === 'favorites' && favorites.length === 0"
        class="fav-empty glass-panel span-2 fade-up"
      >
        还没有常用工具，点击任意工具卡片右上角的星标即可固定到这里
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, watch } from 'vue';
import type { Component } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Clock,
  Cpu,
  ChatDotRound,
  Picture,
  Star,
  StarFilled,
  Rank
} from '@element-plus/icons-vue';
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
  { key: 'favorites', label: '常用', icon: Star },
  { key: 'productivity', label: '效率', icon: Clock },
  { key: 'dev', label: '开发', icon: Cpu },
  { key: 'translate', label: '翻译', icon: ChatDotRound },
  { key: 'image', label: '图片', icon: Picture }
] as const;

type GroupKey = (typeof groups)[number]['key'];

interface ToolMeta {
  id: string;
  label: string;
  group: Exclude<GroupKey, 'favorites'>;
  component: Component;
  /** 是否占满整行 */
  isWide: boolean;
  requiresLogin: boolean;
}

const tools: ToolMeta[] = [
  { id: 'todo', label: '待办清单', group: 'productivity', component: TodoPanel, isWide: false, requiresLogin: true },
  { id: 'note', label: '便签速记', group: 'productivity', component: NotePanel, isWide: false, requiresLogin: true },
  { id: 'memorial', label: '纪念日倒计时', group: 'productivity', component: MemorialPanel, isWide: false, requiresLogin: true },
  { id: 'pomodoro', label: '番茄钟', group: 'productivity', component: PomodoroPanel, isWide: false, requiresLogin: true },
  { id: 'json', label: 'JSON 工具', group: 'dev', component: JsonPanel, isWide: true, requiresLogin: false },
  { id: 'timestamp', label: '时间戳转换', group: 'dev', component: TimestampPanel, isWide: false, requiresLogin: false },
  { id: 'url', label: 'URL 编解码', group: 'dev', component: UrlPanel, isWide: false, requiresLogin: false },
  { id: 'translate', label: '翻译', group: 'translate', component: TranslatePanel, isWide: true, requiresLogin: true },
  { id: 'image', label: '图片下载', group: 'image', component: ImageDownloadPanel, isWide: true, requiresLogin: false }
];

const PREF_KEY = 'jg-tools-preference';

interface ToolsPreference {
  favorites: string[];
  lastGroup: GroupKey;
}

function loadPreference(): ToolsPreference {
  const validIds = new Set(tools.map(tool => tool.id));
  const validGroups = new Set<string>(groups.map(group => group.key));
  try {
    const saved = JSON.parse(localStorage.getItem(PREF_KEY) ?? '{}') as Partial<ToolsPreference>;
    const favorites = Array.isArray(saved.favorites)
      ? saved.favorites.filter(id => validIds.has(id))
      : [];
    const lastGroup = validGroups.has(saved.lastGroup ?? '')
      ? (saved.lastGroup as GroupKey)
      : favorites.length > 0
        ? 'favorites'
        : 'productivity';
    return { favorites, lastGroup };
  } catch {
    return { favorites: [], lastGroup: 'productivity' };
  }
}

const initialPreference = loadPreference();
const favorites = ref<string[]>(initialPreference.favorites);
const activeGroup = ref<GroupKey>(initialPreference.lastGroup);
const dragId = ref('');
const dragOverId = ref('');
const userStore = useUserStore();
const openLogin = inject<() => void>('openLogin', () => {});

watch([favorites, activeGroup], () => {
  localStorage.setItem(
    PREF_KEY,
    JSON.stringify({
      favorites: favorites.value,
      lastGroup: activeGroup.value
    } satisfies ToolsPreference)
  );
});

// 当前视图下工具的先后顺序：常用按收藏顺序（可拖拽调整），其余分组按注册顺序
const visibleOrder = computed(() =>
  activeGroup.value === 'favorites'
    ? favorites.value
    : tools.filter(tool => tool.group === activeGroup.value).map(tool => tool.id)
);
const visibleIds = computed(() => new Set(visibleOrder.value));

function orderOf(id: string): number {
  const index = visibleOrder.value.indexOf(id);
  return index === -1 ? 999 : index;
}

function isFavorite(id: string): boolean {
  return favorites.value.includes(id);
}

function toggleFavorite(tool: ToolMeta) {
  const index = favorites.value.indexOf(tool.id);
  if (index >= 0) {
    favorites.value.splice(index, 1);
    ElMessage.success(`已把「${tool.label}」移出常用`);
  } else {
    favorites.value.push(tool.id);
    ElMessage.success(`已把「${tool.label}」固定到常用`);
  }
}

function handleDragStart(id: string, event: DragEvent) {
  dragId.value = id;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', id);
  }
}

function handleDragOver(id: string) {
  if (dragId.value && id !== dragId.value) {
    dragOverId.value = id;
  }
}

function handleDrop(id: string) {
  const from = favorites.value.indexOf(dragId.value);
  const to = favorites.value.indexOf(id);
  if (from >= 0 && to >= 0 && from !== to) {
    const next = [...favorites.value];
    next.splice(to, 0, ...next.splice(from, 1));
    favorites.value = next;
  }
  clearDragState();
}

function handleDragEnd() {
  clearDragState();
}

function clearDragState() {
  dragId.value = '';
  dragOverId.value = '';
}
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
  position: relative;
  // 右侧给星标与拖拽手柄留位
  padding: 16px 66px 16px 18px;
}

.span-2 {
  grid-column: 1 / -1;
}

.fav-actions {
  position: absolute;
  top: 13px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 2;
}

.drag-handle {
  padding: 4px;
  border-radius: 6px;
  font-size: 16px;
  color: var(--text-3);
  cursor: grab;

  &:hover {
    background: var(--hover-bg);
    color: var(--text-1);
  }

  &:active {
    cursor: grabbing;
  }
}

.fav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  font-size: 16px;
  color: var(--text-3);
  cursor: pointer;
  opacity: 0.35;
  transition:
    opacity 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;

  &:hover {
    background: var(--hover-bg);
    color: var(--text-1);
    opacity: 1;
  }

  &.active {
    opacity: 1;
    color: var(--el-color-warning);

    &:hover {
      color: var(--el-color-warning);
    }
  }
}

.is-dragging {
  opacity: 0.45;
}

.is-drag-over {
  outline: 2px dashed var(--el-color-primary);
  outline-offset: -2px;
}

.login-tip {
  padding: 28px;
  text-align: center;

  .el-link {
    font-size: 15px;
    color: var(--text-1);
  }
}

.fav-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 42px 20px;
  color: var(--text-2);
  font-size: 15px;
}

@media (max-width: 960px) {
  .tools-grid {
    grid-template-columns: 1fr;
  }
}
</style>
