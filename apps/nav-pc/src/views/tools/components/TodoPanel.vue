<template>
  <div class="todo-panel">
    <div class="panel-head">
      <span class="panel-title">📝 待办清单</span>
      <span class="panel-badge">{{ activeCount }} 项待办</span>
    </div>

    <div class="todo-input">
      <el-input
        v-model="newTodo"
        placeholder="记一笔今天要做的…（回车添加）"
        maxlength="200"
        clearable
        @keydown.enter="handleAdd"
      >
        <template #append>
          <el-button :icon="Plus" @click="handleAdd" />
        </template>
      </el-input>
    </div>

    <div class="todo-list app-scroll">
      <TransitionGroup name="list">
        <div v-for="todo in todos" :key="todo.id" class="todo-item">
          <el-checkbox
            :model-value="todo.done"
            @change="handleToggle(todo)"
          />
          <span class="todo-content" :class="{ done: todo.done }">
            {{ todo.content }}
          </span>
          <el-icon class="todo-remove" @click="handleRemove(todo)"><Close /></el-icon>
        </div>
      </TransitionGroup>
      <div v-if="todos.length === 0" class="todo-empty">
        今天没有待办，喝口水休息一下 ☕
      </div>
    </div>

    <div v-if="doneCount > 0" class="todo-footer">
      已完成 {{ doneCount }} 项
      <el-link type="primary" :underline="false" @click="handleClearDone">
        清除已完成
      </el-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { ElMessage } from 'element-plus';
import { Plus, Close } from '@element-plus/icons-vue';
import type { TodoVO } from '@jg/api-types';
import {
  fetchTodos,
  createTodo,
  updateTodo,
  removeTodo
} from '@/services/toolsService';
import { useUserStore } from '@/stores/user';

defineOptions({ name: 'TodoPanel' });

const userStore = useUserStore();
const queryClient = useQueryClient();
const enabled = computed(() => !!userStore.user);

const { data } = useQuery({ queryKey: ['todos'], queryFn: fetchTodos, enabled });
const todos = computed(() => data.value ?? []);

const newTodo = ref('');
const activeCount = computed(() => todos.value.filter((t) => !t.done).length);
const doneCount = computed(() => todos.value.filter((t) => t.done).length);

const invalidate = () => queryClient.invalidateQueries({ queryKey: ['todos'] });

const addMutation = useMutation({
  mutationFn: () => createTodo({ content: newTodo.value.trim() }),
  onSuccess: () => {
    newTodo.value = '';
    invalidate();
  }
});

function handleAdd() {
  const content = newTodo.value.trim();
  if (!content) return;
  addMutation.mutate();
}

function handleToggle(todo: TodoVO) {
  updateTodo(todo.id, { done: !todo.done }).then(invalidate);
}

function handleRemove(todo: TodoVO) {
  removeTodo(todo.id).then(invalidate);
}

async function handleClearDone() {
  await Promise.all(
    todos.value.filter((t) => t.done).map((t) => removeTodo(t.id))
  );
  ElMessage.success('已清除');
  invalidate();
}
</script>

<style lang="scss" scoped>
.todo-panel {
  display: flex;
  flex-direction: column;
  height: 100%;

  .todo-input {
    margin: 10px 0;
  }

  .todo-list {
    flex: 1;
    max-height: 320px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-right: 4px;

    .todo-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 10px;
      border-radius: 10px;
      transition: background 0.2s ease;

      &:hover {
        background: var(--hover-bg);

        .todo-remove {
          opacity: 1;
        }
      }

      .todo-content {
        flex: 1;
        font-size: 14px;
        color: var(--text-1);
        word-break: break-all;

        &.done {
          color: var(--text-3);
          text-decoration: line-through;
        }
      }

      .todo-remove {
        font-size: 13px;
        color: var(--text-3);
        cursor: pointer;
        opacity: 0;

        &:hover {
          color: var(--el-color-danger);
        }
      }
    }

    .todo-empty {
      padding: 26px 0;
      text-align: center;
      font-size: 13px;
      color: var(--text-3);
    }
  }

  .todo-footer {
    padding-top: 8px;
    border-top: 1px solid var(--glass-border);
    font-size: 12px;
    color: var(--text-3);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
</style>
