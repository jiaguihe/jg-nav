<template>
  <div class="link-grid">
    <template v-if="userStore.user">
      <div class="grid-toolbar">
        <div class="group-tabs" @contextmenu.prevent>
          <button
            class="group-tab"
            :class="{ active: activeGroup === 'all' }"
            @click="activeGroup = 'all'"
          >
            全部
          </button>
          <button
            v-for="group in groupList"
            :key="group.id"
            class="group-tab"
            :class="{ active: activeGroup === group.id }"
            title="右键管理分组"
            @click="activeGroup = group.id"
            @contextmenu.prevent="openGroupMenu(group)"
          >
            {{ group.name }}
            <span class="group-count">{{ countOf(group.id) }}</span>
          </button>
          <button
            v-if="groupList.length === 0"
            class="group-tab disabled"
            disabled
            title="右键区域不可用"
          >
            未分组 {{ countOf(null) }}
          </button>
          <button class="group-tab add" title="新建分组" @click="handleAddGroup">＋</button>
        </div>

        <div class="grid-ops">
          <el-tooltip
            :content="sortMode === 'manual' ? '常用优先（按打开次数）' : '恢复手动排序'"
            placement="bottom"
          >
            <button class="op-btn" :class="{ active: sortMode === 'smart' }" @click="toggleSortMode">
              <el-icon><Histogram /></el-icon>
              {{ sortMode === 'manual' ? '手动' : '常用' }}
            </button>
          </el-tooltip>
          <button class="op-btn primary" @click="editingLink = null; editVisible = true">
            <el-icon><Plus /></el-icon>
            添加网址
          </button>
        </div>
      </div>

      <div class="grid-body">
        <LinkCard
          v-for="(link, index) in displayLinks"
          :key="link.id"
          :link="link"
          :is-dragging="draggingId === link.id"
          :is-drag-over="dragOverId === link.id && draggingId !== link.id"
          :style="{ animationDelay: `${Math.min(index, 12) * 30}ms` }"
          class="fade-up"
          @open="handleOpenLink(link)"
          @edit="handleEdit(link)"
          @remove="confirmRemove(link)"
          @toggle-pin="handleTogglePin(link)"
          @dragstart="handleDragStart(link, $event)"
          @dragend="draggingId = null; dragOverId = null"
          @dragover="dragOverId = link.id"
          @dragleave="dragOverId === link.id && (dragOverId = null)"
          @drop="handleDrop(link)"
        />
        <div
          v-if="displayLinks.length === 0"
          class="empty-tip"
        >
          这里还没有网址，点右上角「添加网址」开始收藏
        </div>
      </div>
    </template>

    <div v-else class="login-tip glass-panel">
      <el-link :underline="false" @click="openLogin">登录后管理你的网址收藏</el-link>
    </div>

    <LinkEditDialog
      v-model="editVisible"
      :link="editingLink"
      :groups="groupList"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Histogram, Plus } from '@element-plus/icons-vue';
import type { LinkGroupVO, LinkVO } from '@jg/api-types';
import {
  fetchLinks,
  fetchLinkGroups,
  createLinkGroup,
  updateLinkGroup,
  removeLinkGroup,
  removeLink,
  updateLink,
  reorderLinks,
  clickLink
} from '@/services/linkService';
import { useUserStore } from '@/stores/user';
import LinkCard from './LinkCard.vue';
import LinkEditDialog from './LinkEditDialog.vue';

defineOptions({ name: 'LinkGrid' });

const userStore = useUserStore();
const queryClient = useQueryClient();
const openLogin = inject<() => void>('openLogin', () => {});

const enabled = computed(() => !!userStore.user);

const { data: links } = useQuery({
  queryKey: ['links'],
  queryFn: fetchLinks,
  enabled
});

const { data: groups } = useQuery({
  queryKey: ['link-groups'],
  queryFn: fetchLinkGroups,
  enabled
});

const groupList = computed(() => groups.value ?? []);

/* ---------- 展示与排序 ---------- */

const activeGroup = ref<'all' | number>('all');
const sortMode = ref<'manual' | 'smart'>('manual');

const countOf = (groupId: number | null) =>
  (links.value ?? []).filter((l) => l.groupId === groupId).length;

const displayLinks = computed(() => {
  let list = links.value ?? [];
  if (activeGroup.value !== 'all') {
    list = list.filter((l) => l.groupId === activeGroup.value);
  }
  if (sortMode.value === 'smart') {
    // 常用优先：置顶不动，其余按打开次数 + 最近打开排
    const pinned = list.filter((l) => l.pinned);
    const rest = [...list.filter((l) => !l.pinned)].sort((a, b) => {
      if (b.clickCount !== a.clickCount) return b.clickCount - a.clickCount;
      return (b.lastClickAt ?? '').localeCompare(a.lastClickAt ?? '');
    });
    return [...pinned, ...rest];
  }
  return list;
});

const toggleSortMode = () => {
  sortMode.value = sortMode.value === 'manual' ? 'smart' : 'manual';
};

/* ---------- 拖拽排序（仅手动模式） ---------- */

const draggingId = ref<number | null>(null);
const dragOverId = ref<number | null>(null);

const reorderMutation = useMutation({
  mutationFn: reorderLinks,
  onSuccess: () =>
    queryClient.invalidateQueries({ queryKey: ['links'] })
});

function handleDragStart(link: LinkVO, e: DragEvent) {
  if (sortMode.value !== 'manual') {
    ElMessage.info('常用优先模式下不可拖拽，切回手动排序再试');
    e.preventDefault();
    return;
  }
  draggingId.value = link.id;
  e.dataTransfer?.setData('text/plain', String(link.id));
}

function handleDrop(target: LinkVO) {
  const sourceId = draggingId.value;
  draggingId.value = null;
  dragOverId.value = null;
  if (!sourceId || sourceId === target.id) return;

  const list = [...displayLinks.value];
  const from = list.findIndex((l) => l.id === sourceId);
  const to = list.findIndex((l) => l.id === target.id);
  if (from < 0 || to < 0) return;
  const [moved] = list.splice(from, 1);
  list.splice(to, 0, moved);

  reorderMutation.mutate({
    items: list.map((l, i) => ({ id: l.id, sort: i }))
  });
}

/* ---------- 卡片操作 ---------- */

const editVisible = ref(false);
const editingLink = ref<LinkVO | null>(null);

function handleEdit(link: LinkVO) {
  editingLink.value = link;
  editVisible.value = true;
}

const pinMutation = useMutation({
  mutationFn: (link: LinkVO) => updateLink(link.id, { pinned: !link.pinned }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['links'] })
});

function handleTogglePin(link: LinkVO) {
  pinMutation.mutate(link);
}

function handleOpenLink(link: LinkVO) {
  // 打开即打卡，静默不阻塞新窗口
  clickLink(link.id).catch(() => {});
  window.open(link.url, '_blank');
}

function confirmRemove(link: LinkVO) {
  ElMessageBox.confirm(`确定删除「${link.description}」吗？`, '提示', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  }).then(async () => {
    await removeLink(link.id);
    ElMessage.success('删除成功');
    queryClient.invalidateQueries({ queryKey: ['links'] });
  });
}

/* ---------- 分组管理 ---------- */

function handleAddGroup() {
  ElMessageBox.prompt('分组名称', '新建分组', {
    confirmButtonText: '创建',
    cancelButtonText: '取消',
    inputPattern: /^.{1,20}$/,
    inputErrorMessage: '名称为 1-20 个字符'
  }).then(async ({ value }) => {
    await createLinkGroup({ name: value.trim() });
    ElMessage.success('分组已创建');
    queryClient.invalidateQueries({ queryKey: ['link-groups'] });
  });
}

function openGroupMenu(group: LinkGroupVO) {
  ElMessageBox.confirm(`${group.name}：重命名或删除该分组？删除后组内网址移回未分组。`, '管理分组', {
    confirmButtonText: '重命名',
    cancelButtonText: '删除分组',
    distinguishCancelAndClose: true
  })
    .then(() => {
      ElMessageBox.prompt('分组名称', '重命名分组', {
        confirmButtonText: '保存',
        cancelButtonText: '取消',
        inputValue: group.name,
        inputPattern: /^.{1,20}$/,
        inputErrorMessage: '名称为 1-20 个字符'
      }).then(async ({ value }) => {
        await updateLinkGroup(group.id, { name: value.trim() });
        queryClient.invalidateQueries({ queryKey: ['link-groups'] });
      });
    })
    .catch(async (action) => {
      if (action === 'cancel') {
        await removeLinkGroup(group.id);
        ElMessage.success('分组已删除');
        if (activeGroup.value === group.id) activeGroup.value = 'all';
        queryClient.invalidateQueries({ queryKey: ['link-groups'] });
        queryClient.invalidateQueries({ queryKey: ['links'] });
      }
    });
}
</script>

<style lang="scss" scoped>
.link-grid {
  padding-bottom: 10px;
}

.grid-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.group-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;

  .group-tab {
    display: flex;
    align-items: center;
    gap: 5px;
    height: 32px;
    padding: 0 14px;
    border-radius: 10px;
    border: 1px solid var(--inner-border);
    background: var(--inner-bg);
    color: var(--text-2);
    font-size: 13px;
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
      border-color: var(--accent);
    }

    &.disabled {
      opacity: 0.6;
      cursor: default;
    }

    .group-count {
      font-size: 11px;
      color: var(--text-3);
    }
  }
}

.grid-ops {
  display: flex;
  gap: 8px;

  .op-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    height: 32px;
    padding: 0 14px;
    border-radius: 10px;
    border: 1px solid var(--inner-border);
    background: var(--inner-bg);
    color: var(--text-2);
    font-size: 13px;
    cursor: pointer;
    transition:
      background 0.2s ease,
      color 0.2s ease;

    &:hover {
      background: var(--hover-bg);
      color: var(--text-1);
    }

    &.primary {
      background: var(--accent);
      border-color: transparent;
      color: #fff;

      &:hover {
        opacity: 0.9;
      }
    }
  }
}

.grid-body {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(108px, 1fr));
  gap: 14px;

  .empty-tip {
    grid-column: 1 / -1;
    padding: 40px 0;
    text-align: center;
    color: var(--text-3);
    font-size: 14px;
  }
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
</style>
