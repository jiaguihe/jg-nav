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

    <!-- 常用：统一尺寸紧凑卡片，整卡可拖拽排序，点击就地展开面板 -->
    <div v-show="activeGroup === 'favorites'" class="fav-section">
      <div v-if="favorites.length === 0" class="fav-empty glass-panel fade-up">
        还没有常用工具，到各分组里点亮工具面板右上角的星标即可固定到这里
      </div>
      <template v-else>
        <div class="fav-grid">
          <div
            v-for="id in favorites"
            :key="id"
            class="fav-card glass-panel fade-up"
            :class="{
              'is-expanded': expandedId === id,
              'is-dragging': dragId === id,
              'is-drag-over': dragOverId === id
            }"
            draggable="true"
            @click="toggleExpand(id)"
            @dragstart="handleDragStart(id, $event)"
            @dragend="handleDragEnd"
            @dragover.prevent="handleDragOver(id)"
            @drop.prevent="handleDrop(id)"
          >
            <span class="fav-emoji">{{ toolOf(id).emoji }}</span>
            <span class="fav-name">{{ toolOf(id).label }}</span>
            <el-icon
              class="fav-remove"
              title="从常用移除"
              @click.stop="removeFavorite(id)"
            >
              <Close />
            </el-icon>
          </div>
        </div>

        <div v-if="expandedTool" class="tool-card glass-panel expand-card fade-up">
          <button class="collapse-btn" title="收起" @click="expandedId = ''">
            <el-icon><Close /></el-icon>
          </button>
          <KeepAlive>
            <component
              :is="expandedTool.component"
              :key="expandedTool.id"
              v-if="!expandedTool.requiresLogin || userStore.user"
            />
          </KeepAlive>
          <div v-if="expandedTool.requiresLogin && !userStore.user" class="login-tip">
            <el-link :underline="false" @click="openLogin">登录后使用{{ expandedTool.label }}</el-link>
          </div>
        </div>
      </template>
    </div>

    <!-- 其余分组：完整面板平铺（单实例，切分组不丢状态） -->
    <div v-show="activeGroup !== 'favorites'" class="tools-grid">
      <div
        v-for="(tool, index) in tools"
        :key="tool.id"
        v-show="activeGroup === tool.group"
        class="tool-card glass-panel fade-up"
        :class="{ 'span-2': tool.isWide }"
        :style="{ animationDelay: `${index * 60}ms` }"
      >
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

        <component :is="tool.component" v-if="!tool.requiresLogin || userStore.user" />
        <div v-else class="login-tip">
          <el-link :underline="false" @click="openLogin">登录后使用{{ tool.label }}</el-link>
        </div>
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
  Close
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
  emoji: string;
  group: Exclude<GroupKey, 'favorites'>;
  component: Component;
  /** 是否占满整行 */
  isWide: boolean;
  requiresLogin: boolean;
}

const tools: ToolMeta[] = [
  { id: 'todo', label: '待办清单', emoji: '📝', group: 'productivity', component: TodoPanel, isWide: false, requiresLogin: true },
  { id: 'note', label: '便签速记', emoji: '🗒️', group: 'productivity', component: NotePanel, isWide: false, requiresLogin: true },
  { id: 'memorial', label: '纪念日倒计时', emoji: '⏳', group: 'productivity', component: MemorialPanel, isWide: false, requiresLogin: true },
  { id: 'pomodoro', label: '番茄钟', emoji: '🍅', group: 'productivity', component: PomodoroPanel, isWide: false, requiresLogin: true },
  { id: 'json', label: 'JSON 工具', emoji: '🔧', group: 'dev', component: JsonPanel, isWide: true, requiresLogin: false },
  { id: 'timestamp', label: '时间戳转换', emoji: '⏱️', group: 'dev', component: TimestampPanel, isWide: false, requiresLogin: false },
  { id: 'url', label: 'URL 编解码', emoji: '🔗', group: 'dev', component: UrlPanel, isWide: false, requiresLogin: false },
  { id: 'translate', label: '翻译', emoji: '🌍', group: 'translate', component: TranslatePanel, isWide: true, requiresLogin: true },
  { id: 'image', label: '图片下载', emoji: '🖼️', group: 'image', component: ImageDownloadPanel, isWide: true, requiresLogin: false }
];

const PREF_KEY = 'jg-tools-preference';

interface ToolsPreference {
  favorites: string[];
  lastGroup: GroupKey;
  /** 常用栏内当前展开的工具 */
  expandedId: string;
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
    const expandedId = favorites.includes(saved.expandedId ?? '') ? (saved.expandedId as string) : '';
    return { favorites, lastGroup, expandedId };
  } catch {
    return { favorites: [], lastGroup: 'productivity', expandedId: '' };
  }
}

const initialPreference = loadPreference();
const favorites = ref<string[]>(initialPreference.favorites);
const activeGroup = ref<GroupKey>(initialPreference.lastGroup);
const expandedId = ref(initialPreference.expandedId);
const dragId = ref('');
const dragOverId = ref('');
const userStore = useUserStore();
const openLogin = inject<() => void>('openLogin', () => {});

watch([favorites, activeGroup, expandedId], () => {
  localStorage.setItem(
    PREF_KEY,
    JSON.stringify({
      favorites: favorites.value,
      lastGroup: activeGroup.value,
      expandedId: expandedId.value
    } satisfies ToolsPreference)
  );
});

const expandedTool = computed(() => tools.find(tool => tool.id === expandedId.value));

function toolOf(id: string): ToolMeta {
  return tools.find(tool => tool.id === id) ?? tools[0];
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

function removeFavorite(id: string) {
  favorites.value.splice(favorites.value.indexOf(id), 1);
  if (expandedId.value === id) {
    expandedId.value = '';
  }
  ElMessage.success(`已把「${toolOf(id).label}」移出常用`);
}

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? '' : id;
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

.fav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.fav-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 30px 13px 16px;
  border-radius: 14px;
  user-select: none;
  cursor: grab;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    transform: translateY(-2px);

    .fav-remove {
      opacity: 1;
    }
  }

  &:active {
    cursor: grabbing;
  }

  &.is-expanded {
    border-color: var(--el-color-primary);
  }
}

.fav-emoji {
  font-size: 22px;
  line-height: 1;
}

.fav-name {
  overflow: hidden;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-1);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.fav-remove {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 3px;
  border-radius: 6px;
  font-size: 12px;
  color: var(--text-3);
  cursor: pointer;
  opacity: 0;
  transition:
    opacity 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;

  &:hover {
    background: var(--hover-bg);
    color: var(--el-color-danger);
  }
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.tool-card {
  position: relative;
  // 右侧给星标留位
  padding: 16px 46px 16px 18px;
}

.span-2 {
  grid-column: 1 / -1;
}

.fav-btn,
.collapse-btn {
  position: absolute;
  top: 13px;
  right: 10px;
  z-index: 2;
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
}

.fav-btn.active {
  opacity: 1;
  color: var(--el-color-warning);

  &:hover {
    color: var(--el-color-warning);
  }
}

.collapse-btn {
  opacity: 0.6;
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
