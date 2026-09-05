<template>
  <div class="note-panel">
    <div class="panel-head">
      <span class="panel-title">🗒️ 便签速记</span>
      <el-button size="small" text type="primary" :icon="Plus" @click="handleAdd">
        新便签
      </el-button>
    </div>

    <div class="note-list app-scroll">
      <div
        v-for="note in notes"
        :key="note.id"
        class="note-item"
        :title="`更新于 ${note.updatedAt.slice(0, 10)}`"
        @click="editing = note"
      >
        <div class="note-content">{{ note.content }}</div>
        <div class="note-foot">
          <span class="note-date">{{ note.updatedAt.slice(5, 10) }}</span>
          <el-icon
            class="note-remove"
            @click.stop="confirmRemove(note)"
          >
            <Close />
          </el-icon>
        </div>
      </div>
      <div v-if="notes.length === 0" class="note-empty">
        随手记点什么：快递单号、临时想法…
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="editing ? '编辑便签' : '新便签'"
      width="440"
      @closed="draft = ''"
    >
      <el-input
        v-model="draft"
        type="textarea"
        :rows="6"
        maxlength="5000"
        show-word-limit
        placeholder="写点什么…"
      />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!draft.trim()" @click="handleSave">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Close } from '@element-plus/icons-vue';
import type { NoteVO } from '@jg/api-types';
import { fetchNotes, createNote, updateNote, removeNote } from '@/services/toolsService';
import { useUserStore } from '@/stores/user';

defineOptions({ name: 'NotePanel' });

const userStore = useUserStore();
const queryClient = useQueryClient();
const enabled = computed(() => !!userStore.user);

const { data } = useQuery({ queryKey: ['notes'], queryFn: fetchNotes, enabled });
const notes = computed(() => data.value ?? []);

const dialogVisible = ref(false);
const editing = ref<NoteVO | null>(null);
const draft = ref('');

// 打开编辑时把原文带进草稿
watch(dialogVisible, (visible) => {
  if (visible) draft.value = editing.value?.content ?? '';
});

function handleAdd() {
  editing.value = null;
  dialogVisible.value = true;
}

const saveMutation = useMutation({
  mutationFn: () => {
    const content = draft.value.trim();
    return editing.value
      ? updateNote(editing.value.id, { content })
      : createNote({ content });
  },
  onSuccess: () => {
    ElMessage.success('已保存');
    dialogVisible.value = false;
    queryClient.invalidateQueries({ queryKey: ['notes'] });
  }
});

const handleSave = () => saveMutation.mutate();

function confirmRemove(note: NoteVO) {
  ElMessageBox.confirm('删除这条便签？', '提示', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  }).then(async () => {
    await removeNote(note.id);
    queryClient.invalidateQueries({ queryKey: ['notes'] });
  });
}
</script>

<style lang="scss" scoped>
.note-panel {
  display: flex;
  flex-direction: column;
  height: 100%;

  .note-list {
    flex: 1;
    max-height: 320px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-right: 4px;

    .note-item {
      padding: 10px 12px;
      border-radius: 12px;
      background: var(--inner-bg);
      border: 1px solid var(--inner-border);
      cursor: pointer;
      transition: background 0.2s ease;

      &:hover {
        background: var(--hover-bg);
      }

      .note-content {
        font-size: 13px;
        color: var(--text-1);
        line-height: 1.6;
        white-space: pre-wrap;
        word-break: break-all;
        // 最多展示 4 行，完整内容点开编辑
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .note-foot {
        margin-top: 6px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .note-date {
          font-size: 11px;
          color: var(--text-3);
        }

        .note-remove {
          font-size: 12px;
          color: var(--text-3);
          opacity: 0;

          &:hover {
            color: var(--el-color-danger);
          }
        }
      }

      &:hover .note-remove {
        opacity: 1;
      }
    }

    .note-empty {
      padding: 26px 0;
      text-align: center;
      font-size: 13px;
      color: var(--text-3);
    }
  }
}
</style>
