<template>
  <el-drawer
    :model-value="modelValue"
    :title="shop?.name ?? '店铺详情'"
    size="480px"
    @update:model-value="emit('update:modelValue', $event)"
    @open="handleOpen"
  >
    <template v-if="shop">
      <div class="shop-summary">
        <div class="summary-row">
          <el-rate :model-value="shop.score" disabled />
          <span class="platform">{{ platformMeta.label }}</span>
          <span v-if="shop.category" class="category">{{ shop.category }}</span>
        </div>
        <div v-if="shop.tags.length" class="summary-tags">
          <span
            v-for="tag in shop.tags"
            :key="tag"
            class="tag-chip"
            :class="tag"
          >
            {{ tagMeta[tag].emoji }} {{ tagMeta[tag].label }}
          </span>
        </div>
        <div v-if="shop.remark" class="summary-remark">{{ shop.remark }}</div>
        <div class="summary-stats">
          <div class="stat">
            <div class="stat-num">{{ shop.orderCount }}</div>
            <div class="stat-label">点过次数</div>
          </div>
          <div class="stat">
            <div class="stat-num">¥{{ shop.totalAmount.toFixed(0) }}</div>
            <div class="stat-label">累计消费</div>
          </div>
          <div class="stat">
            <div class="stat-num">{{ avgScore }}</div>
            <div class="stat-label">历史均分</div>
          </div>
        </div>
        <div class="summary-actions">
          <el-button type="primary" @click="orderVisible = true">
            <el-icon><Plus /></el-icon>
            记一笔
          </el-button>
          <el-button @click="emit('edit-shop')">
            <el-icon><Edit /></el-icon>
            编辑店铺
          </el-button>
        </div>
      </div>

      <div class="history-title">点单历史（{{ orderList.length }}）</div>
      <el-empty v-if="orderList.length === 0" description="还没记过点单，点上方「记一笔」" :image-size="70" />
      <el-timeline v-else class="history-list">
        <el-timeline-item
          v-for="order in orderList"
          :key="order.id"
          :timestamp="order.orderedAt"
          :type="order.score >= 4 ? 'success' : order.score <= 2 ? 'danger' : 'primary'"
          placement="top"
        >
          <div class="order-item" @click="editingOrder = order; orderVisible = true">
            <div class="order-head">
              <el-rate :model-value="order.score" disabled size="small" />
              <span class="order-amount">¥{{ Number(order.amount).toFixed(2) }}</span>
            </div>
            <div v-if="order.items" class="order-items">{{ order.items }}</div>
            <div v-if="order.note" class="order-note">{{ order.note }}</div>
            <el-icon class="order-delete" title="删除这条" @click.stop="confirmRemoveOrder(order)">
              <Delete />
            </el-icon>
          </div>
        </el-timeline-item>
      </el-timeline>

      <OrderEditDialog
        v-model="orderVisible"
        :shop-id="shop.id"
        :order="editingOrder"
      />
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete } from '@element-plus/icons-vue';
import type { TakeawayOrderVO, TakeawayShopVO } from '@jg/api-types';
import { fetchOrders, removeOrder } from '@/services/takeawayService';
import { PLATFORM_META, SHOP_TAG_META } from '@/constants/takeaway';
import OrderEditDialog from './OrderEditDialog.vue';

const props = defineProps<{
  modelValue: boolean;
  shop?: TakeawayShopVO | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'edit-shop': [];
}>();

const platformMeta = computed(() =>
  props.shop ? PLATFORM_META[props.shop.platform] : PLATFORM_META.other
);
const tagMeta = SHOP_TAG_META;
const queryClient = useQueryClient();

const { data: orders } = useQuery({
  queryKey: computed(() => ['orders', props.shop?.id]),
  queryFn: () => fetchOrders(props.shop!.id),
  enabled: computed(() => props.modelValue && !!props.shop)
});

const orderList = computed(() => orders.value ?? []);
const avgScore = computed(() => {
  const list = orderList.value;
  if (!list.length) return '-';
  return (list.reduce((sum, o) => sum + o.score, 0) / list.length).toFixed(1);
});

const orderVisible = ref(false);
const editingOrder = ref<TakeawayOrderVO | null>(null);

function handleOpen() {
  editingOrder.value = null;
}

function confirmRemoveOrder(order: TakeawayOrderVO) {
  ElMessageBox.confirm('删除这条点单记录？', '提示', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  }).then(async () => {
    await removeOrder(order.id);
    ElMessage.success('已删除');
    queryClient.invalidateQueries({ queryKey: ['orders', props.shop?.id] });
    queryClient.invalidateQueries({ queryKey: ['shops'] });
  });
}
</script>

<style lang="scss" scoped>
.shop-summary {
  .summary-row {
    display: flex;
    align-items: center;
    gap: 10px;

    .platform,
    .category {
      font-size: 12px;
      color: var(--text-3);
    }
  }

  .summary-tags {
    margin-top: 10px;
    display: flex;
    gap: 6px;
    flex-wrap: wrap;

    .tag-chip {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 9px;

      &.good {
        background: rgba(103, 194, 58, 0.16);
        color: var(--el-color-success);
      }

      &.bad {
        background: rgba(245, 108, 108, 0.16);
        color: var(--el-color-danger);
      }

      &.wishlist {
        background: rgba(144, 147, 153, 0.18);
        color: var(--el-color-info);
      }

      &.reorder {
        background: rgba(230, 162, 60, 0.16);
        color: var(--el-color-warning);
      }
    }
  }

  .summary-remark {
    margin-top: 10px;
    font-size: 13px;
    color: var(--text-2);
    line-height: 1.6;
    white-space: pre-wrap;
  }

  .summary-stats {
    margin-top: 14px;
    display: flex;
    gap: 10px;

    .stat {
      flex: 1;
      text-align: center;
      padding: 12px 0;
      border-radius: 12px;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);

      .stat-num {
        font-size: 20px;
        font-weight: 600;
        color: var(--text-1);
      }

      .stat-label {
        margin-top: 2px;
        font-size: 12px;
        color: var(--text-3);
      }
    }
  }

  .summary-actions {
    margin-top: 14px;
    display: flex;
    gap: 10px;
  }
}

.history-title {
  margin: 22px 0 14px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-1);
}

.history-list {
  padding-left: 4px;

  .order-item {
    position: relative;
    cursor: pointer;

    .order-head {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .order-amount {
        font-size: 13px;
        color: var(--text-2);
        font-weight: 600;
      }
    }

    .order-items {
      margin-top: 4px;
      font-size: 13px;
      color: var(--text-1);
    }

    .order-note {
      margin-top: 2px;
      font-size: 12px;
      color: var(--text-3);
      line-height: 1.5;
    }

    .order-delete {
      position: absolute;
      top: 0;
      right: 0;
      font-size: 13px;
      color: var(--text-3);
      opacity: 0;
      transition: opacity 0.2s ease;
      cursor: pointer;

      &:hover {
        color: var(--el-color-danger);
      }
    }

    &:hover .order-delete {
      opacity: 1;
    }
  }
}
</style>
