<template>
  <div class="memorial-panel">
    <div class="panel-head">
      <span class="panel-title">⏳ 纪念日倒计时</span>
      <el-button size="small" text type="primary" :icon="Plus" @click="dialogVisible = true">
        添加
      </el-button>
    </div>

    <div class="memorial-list app-scroll">
      <div
        v-for="item in memorials"
        :key="item.id"
        class="memorial-item"
        :class="{ near: daysUntil(item) <= 7 }"
      >
        <div class="memorial-info">
          <div class="memorial-name">
            {{ item.name }}
            <span v-if="item.repeatYearly" class="repeat-mark" title="每年重复">🔁</span>
          </div>
          <div class="memorial-date">{{ displayDate(item) }}</div>
        </div>
        <div class="memorial-days">
          <template v-if="daysUntil(item) === 0">今天</template>
          <template v-else>
            <span class="days-num">{{ daysUntil(item) }}</span>
            <span class="days-unit">天</span>
          </template>
        </div>
        <el-icon class="memorial-remove" @click.stop="confirmRemove(item)">
          <Close />
        </el-icon>
      </div>
      <div v-if="memorials.length === 0" class="memorial-empty">
        添加假期、生日、纪念日，看看还剩几天
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="添加纪念日" width="420" @closed="resetForm">
      <el-form label-position="top" @submit.prevent>
        <el-form-item label="名称" required>
          <el-input v-model="form.name" placeholder="例如：国庆假期" maxlength="50" />
        </el-form-item>
        <el-form-item label="日期" required>
          <el-date-picker
            v-model="form.targetDate"
            type="date"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="form.repeatYearly">每年重复（生日 / 周年）</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!form.name.trim() || !form.targetDate" @click="handleAdd">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Close } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import type { MemorialVO } from '@jg/api-types';
import { fetchMemorials, createMemorial, removeMemorial } from '@/services/toolsService';
import { useUserStore } from '@/stores/user';

defineOptions({ name: 'MemorialPanel' });

const userStore = useUserStore();
const queryClient = useQueryClient();
const enabled = computed(() => !!userStore.user);

const { data } = useQuery({ queryKey: ['memorials'], queryFn: fetchMemorials, enabled });
const memorials = computed(() => data.value ?? []);

const dialogVisible = ref(false);
const form = reactive({ name: '', targetDate: '', repeatYearly: false });

const resetForm = () => {
  form.name = '';
  form.targetDate = '';
  form.repeatYearly = false;
};

/** 每年重复的自动滚到下一个周期 */
function daysUntil(item: MemorialVO): number {
  const today = dayjs().startOf('day');
  let target = dayjs(item.targetDate);
  if (item.repeatYearly) {
    target = target.year(today.year());
    if (target.isBefore(today)) target = target.add(1, 'year');
  }
  return target.diff(today, 'day');
}

function displayDate(item: MemorialVO): string {
  const base = dayjs(item.targetDate);
  return item.repeatYearly
    ? `${base.format('MM月DD日')} · 每年`
    : base.format('YYYY年MM月DD日');
}

const addMutation = useMutation({
  mutationFn: () =>
    createMemorial({
      name: form.name.trim(),
      targetDate: form.targetDate,
      repeatYearly: form.repeatYearly
    }),
  onSuccess: () => {
    ElMessage.success('已添加');
    dialogVisible.value = false;
    queryClient.invalidateQueries({ queryKey: ['memorials'] });
  }
});

const handleAdd = () => addMutation.mutate();

function confirmRemove(item: MemorialVO) {
  ElMessageBox.confirm(`删除「${item.name}」？`, '提示', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  }).then(async () => {
    await removeMemorial(item.id);
    queryClient.invalidateQueries({ queryKey: ['memorials'] });
  });
}
</script>

<style lang="scss" scoped>
.memorial-panel {
  display: flex;
  flex-direction: column;
  height: 100%;

  .memorial-list {
    flex: 1;
    max-height: 320px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-right: 4px;

    .memorial-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 12px;
      background: var(--inner-bg);
      border: 1px solid var(--inner-border);
      position: relative;
      transition: background 0.2s ease;

      &:hover {
        background: var(--hover-bg);

        .memorial-remove {
          opacity: 1;
        }
      }

      // 一周内到期的高亮提醒
      &.near {
        border-color: rgba(230, 162, 60, 0.6);
      }

      .memorial-info {
        flex: 1;
        min-width: 0;

        .memorial-name {
          font-size: 14px;
          color: var(--text-1);
          display: flex;
          align-items: center;
          gap: 5px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .memorial-date {
          margin-top: 2px;
          font-size: 12px;
          color: var(--text-3);
        }
      }

      .memorial-days {
        display: flex;
        align-items: baseline;
        gap: 2px;
        color: var(--accent);
        font-size: 13px;

        .days-num {
          font-size: 24px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .days-unit {
          color: var(--text-3);
        }
      }

      .memorial-remove {
        position: absolute;
        top: 6px;
        right: 8px;
        font-size: 12px;
        color: var(--text-3);
        opacity: 0;
        cursor: pointer;

        &:hover {
          color: var(--el-color-danger);
        }
      }
    }

    .memorial-empty {
      padding: 26px 0;
      text-align: center;
      font-size: 13px;
      color: var(--text-3);
    }
  }
}
</style>
