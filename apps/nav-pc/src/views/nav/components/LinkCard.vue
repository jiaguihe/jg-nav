<template>
  <div
    class="link-card glass-card"
    :class="{ dragging: isDragging, 'drag-over': isDragOver }"
    draggable="true"
    @dragstart="emit('dragstart', $event)"
    @dragend="emit('dragend')"
    @dragover.prevent="emit('dragover')"
    @dragleave="emit('dragleave')"
    @drop.prevent="emit('drop', $event)"
    @click="emit('open')"
  >
    <div class="pin-mark" v-if="link.pinned" title="已置顶">
      <el-icon><Top /></el-icon>
    </div>

    <div class="card-actions" @click.stop>
      <el-icon class="action-icon" title="置顶/取消" @click="emit('toggle-pin')"><Top /></el-icon>
      <el-icon class="action-icon" title="编辑" @click="emit('edit')"><Edit /></el-icon>
      <el-icon class="action-icon danger" title="删除" @click="emit('remove')"><Delete /></el-icon>
    </div>

    <img
      :src="faviconOf(link.url)"
      alt=""
      class="card-favicon"
      @error="onImgError"
    />
    <div class="card-name" :title="link.description">{{ link.description }}</div>
    <div v-if="link.clickCount > 0" class="card-meta" title="累计打开次数">
      {{ link.clickCount }} 次
    </div>
  </div>
</template>

<script setup lang="ts">
import { Top, Edit, Delete } from '@element-plus/icons-vue';
import type { LinkVO } from '@jg/api-types';
import defaultImg from '@/assets/default.png';

defineOptions({ name: 'LinkCard' });

defineProps<{
  link: LinkVO;
  isDragging?: boolean;
  isDragOver?: boolean;
}>();

const emit = defineEmits<{
  open: [];
  edit: [];
  remove: [];
  'toggle-pin': [];
  dragstart: [e: DragEvent];
  dragend: [];
  dragover: [];
  dragleave: [];
  drop: [e: DragEvent];
}>();

const faviconOf = (url: string) => {
  try {
    return `${new URL(url).origin}/favicon.ico`;
  } catch {
    return defaultImg;
  }
};

const onImgError = (e: Event) => {
  (e.target as HTMLImageElement).src = defaultImg;
};
</script>

<style lang="scss" scoped>
.link-card {
  position: relative;
  padding: 16px 10px 12px;
  text-align: center;
  cursor: pointer;
  user-select: none;

  &.dragging {
    opacity: 0.4;
    transform: scale(0.96);
  }

  &.drag-over {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent);
  }

  .pin-mark {
    position: absolute;
    top: 6px;
    left: 8px;
    color: #f7ba2a;
    font-size: 13px;
  }

  .card-actions {
    position: absolute;
    top: 6px;
    right: 8px;
    display: none;
    gap: 6px;
    font-size: 13px;
    color: var(--text-2);

    .action-icon {
      cursor: pointer;

      &:hover {
        color: var(--accent);
      }

      &.danger:hover {
        color: var(--el-color-danger);
      }
    }
  }

  &:hover .card-actions {
    display: flex;
  }

  .card-favicon {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    background: rgba(127, 127, 127, 0.12);
  }

  .card-name {
    margin-top: 8px;
    font-size: 13px;
    color: var(--text-1);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-meta {
    margin-top: 2px;
    font-size: 11px;
    color: var(--text-3);
  }
}
</style>
