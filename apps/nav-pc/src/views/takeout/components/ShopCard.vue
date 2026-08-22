<template>
  <div class="shop-card glass-card fade-up" @click="emit('open')">
    <div class="card-head">
      <div class="shop-name" :title="shop.name">{{ shop.name }}</div>
      <span
        class="platform-badge"
        :style="{ color: platformMeta.color, borderColor: platformMeta.color }"
      >
        {{ platformMeta.label }}
      </span>
    </div>

    <div class="shop-score">
      <el-rate :model-value="shop.score" disabled size="small" />
      <span class="score-num">{{ shop.score }}.0</span>
    </div>

    <div v-if="shop.tags.length" class="shop-tags">
      <span
        v-for="tag in shop.tags"
        :key="tag"
        class="tag-chip"
        :class="tag"
      >
        {{ tagMeta[tag].emoji }} {{ tagMeta[tag].label }}
      </span>
    </div>

    <div v-if="shop.category || shop.remark" class="shop-remark">
      <span v-if="shop.category" class="category">{{ shop.category }}</span>
      <span v-if="shop.remark" class="remark" :title="shop.remark">
        {{ shop.remark }}
      </span>
    </div>

    <div class="shop-stats">
      <span>{{ shop.orderCount }} 次</span>
      <span v-if="shop.totalAmount > 0">· ¥{{ shop.totalAmount.toFixed(0) }}</span>
      <span v-if="shop.lastOrderedAt">· 最近 {{ shop.lastOrderedAt.slice(5) }}</span>
    </div>

    <div class="card-actions" @click.stop>
      <el-icon class="action-icon" title="编辑店铺" @click="emit('edit')"><Edit /></el-icon>
      <el-icon class="action-icon danger" title="删除店铺" @click="emit('remove')"><Delete /></el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Edit, Delete } from '@element-plus/icons-vue';
import type { TakeawayShopVO } from '@jg/api-types';
import { PLATFORM_META, SHOP_TAG_META } from '@/constants/takeaway';

defineOptions({ name: 'ShopCard' });

const props = defineProps<{ shop: TakeawayShopVO }>();
const emit = defineEmits<{
  open: [];
  edit: [];
  remove: [];
}>();

const platformMeta = computed(() => PLATFORM_META[props.shop.platform]);
const tagMeta = SHOP_TAG_META;
</script>

<style lang="scss" scoped>
.shop-card {
  position: relative;
  padding: 16px 16px 14px;
  cursor: pointer;
  overflow: hidden;

  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    .shop-name {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-1);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .platform-badge {
      flex-shrink: 0;
      font-size: 11px;
      padding: 1px 7px;
      border: 1px solid;
      border-radius: 8px;
      line-height: 18px;
    }
  }

  .shop-score {
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 6px;

    .score-num {
      font-size: 12px;
      color: var(--text-3);
    }
  }

  .shop-tags {
    margin-top: 8px;
    display: flex;
    gap: 6px;
    flex-wrap: wrap;

    .tag-chip {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 9px;
      line-height: 16px;

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

  .shop-remark {
    margin-top: 8px;
    font-size: 13px;
    color: var(--text-2);
    display: flex;
    gap: 8px;
    align-items: baseline;

    .category {
      flex-shrink: 0;
      color: var(--text-3);

      &::after {
        content: '';
      }
    }

    .remark {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .shop-stats {
    margin-top: 10px;
    font-size: 12px;
    color: var(--text-3);
    display: flex;
    gap: 4px;
  }

  .card-actions {
    position: absolute;
    top: 10px;
    right: 12px;
    display: none;
    gap: 8px;
    font-size: 14px;
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
}
</style>
