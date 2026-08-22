<template>
  <div class="takeout-page">
    <template v-if="userStore.user">
      <div class="page-head fade-up">
        <div class="page-title">
          <h2>外卖记事本</h2>
          <div class="page-sub">
            共 {{ shops.length }} 家 · 点过 {{ totalOrders }} 次 · 累计 ¥{{ totalAmount.toFixed(0) }}
            <template v-if="badCount > 0">
              · 踩雷 {{ badCount }} 家
            </template>
          </div>
        </div>
        <div class="head-actions">
          <el-button @click="whatToEatVisible = true">
            <el-icon><MagicStick /></el-icon>
            今天吃什么
          </el-button>
          <el-button type="primary" @click="shopEditId = null; shopEditVisible = true">
            <el-icon><Plus /></el-icon>
            记一家店
          </el-button>
        </div>
      </div>

      <div class="filter-bar glass-panel fade-up">
        <el-input
          v-model="keyword"
          class="filter-search"
          placeholder="搜店名 / 分类 / 备注"
          clearable
          :prefix-icon="Search"
        />
        <el-select v-model="platformFilter" placeholder="平台" clearable class="filter-item">
          <el-option v-for="opt in PLATFORM_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
        <el-select v-model="tagFilter" placeholder="标签" clearable class="filter-item">
          <el-option v-for="opt in SHOP_TAG_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
        <el-select v-model="sortBy" class="filter-item sort">
          <el-option label="最近记录" value="recent" />
          <el-option label="评分最高" value="score" />
          <el-option label="点得最多" value="count" />
        </el-select>
      </div>

      <div v-if="filteredShops.length" class="shop-grid">
        <ShopCard
          v-for="(shop, index) in filteredShops"
          :key="shop.id"
          :shop="shop"
          :style="{ animationDelay: `${Math.min(index, 12) * 30}ms` }"
          @open="detailShopId = shop.id; detailVisible = true"
          @edit="shopEditId = shop.id; shopEditVisible = true"
          @remove="confirmRemoveShop(shop)"
        />
      </div>
      <el-empty
        v-else
        description="还没有店铺记录，点右上角「记一家店」把好吃和踩雷都记下来"
      />
    </template>

    <div v-else class="login-tip glass-panel">
      <el-link :underline="false" @click="openLogin">登录后开始记录你的外卖档案</el-link>
    </div>

    <ShopEditDialog v-model="shopEditVisible" :shop="editingShop" />
    <ShopDetailDrawer
      v-model="detailVisible"
      :shop="detailShop"
      @edit-shop="shopEditId = detailShopId; shopEditVisible = true"
    />
    <WhatToEatDialog
      v-model="whatToEatVisible"
      :shops="shops"
      @open-shop="(shop) => { detailShopId = shop.id; detailVisible = true; }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Plus, MagicStick } from '@element-plus/icons-vue';
import type { ShopTag, TakeawayPlatform, TakeawayShopVO } from '@jg/api-types';
import { fetchShops, removeShop } from '@/services/takeawayService';
import { PLATFORM_OPTIONS, SHOP_TAG_OPTIONS } from '@/constants/takeaway';
import { useUserStore } from '@/stores/user';
import ShopCard from './components/ShopCard.vue';
import ShopEditDialog from './components/ShopEditDialog.vue';
import ShopDetailDrawer from './components/ShopDetailDrawer.vue';
import WhatToEatDialog from './components/WhatToEatDialog.vue';

defineOptions({ name: 'TakeoutPage' });

const userStore = useUserStore();
const queryClient = useQueryClient();
const openLogin = inject<() => void>('openLogin', () => {});

const enabled = computed(() => !!userStore.user);
const { data: shopsData } = useQuery({
  queryKey: ['shops'],
  queryFn: fetchShops,
  enabled
});
const shops = computed(() => shopsData.value ?? []);

const totalOrders = computed(() => shops.value.reduce((sum, s) => sum + s.orderCount, 0));
const totalAmount = computed(() => shops.value.reduce((sum, s) => sum + s.totalAmount, 0));
const badCount = computed(() => shops.value.filter((s) => s.tags.includes('bad')).length);

/* ---------- 筛选与排序 ---------- */

const keyword = ref('');
const platformFilter = ref<TakeawayPlatform | ''>('');
const tagFilter = ref<ShopTag | ''>('');
const sortBy = ref<'recent' | 'score' | 'count'>('recent');

const filteredShops = computed(() => {
  let list = shops.value;
  const kw = keyword.value.trim().toLowerCase();
  if (kw) {
    list = list.filter((s) =>
      [s.name, s.category, s.remark].some((field) =>
        field.toLowerCase().includes(kw)
      )
    );
  }
  if (platformFilter.value) {
    list = list.filter((s) => s.platform === platformFilter.value);
  }
  if (tagFilter.value) {
    const tag = tagFilter.value;
    list = list.filter((s) => s.tags.includes(tag));
  }
  const sorted = [...list];
  if (sortBy.value === 'score') {
    sorted.sort((a, b) => b.score - a.score || b.orderCount - a.orderCount);
  } else if (sortBy.value === 'count') {
    sorted.sort((a, b) => b.orderCount - a.orderCount);
  } else {
    sorted.sort(
      (a, b) => (b.lastOrderedAt ?? b.updatedAt).localeCompare(a.lastOrderedAt ?? a.updatedAt)
    );
  }
  return sorted;
});

/* ---------- 弹窗编排（存 id 而非对象引用，列表缓存刷新后弹窗内数据保持同步） ---------- */

const shopEditId = ref<number | null>(null);
const detailShopId = ref<number | null>(null);
const shopEditVisible = ref(false);
const detailVisible = ref(false);
const whatToEatVisible = ref(false);

const editingShop = computed(
  () => shops.value.find((s) => s.id === shopEditId.value) ?? null
);
const detailShop = computed(
  () => shops.value.find((s) => s.id === detailShopId.value) ?? null
);

function confirmRemoveShop(shop: TakeawayShopVO) {
  ElMessageBox.confirm(
    `删除「${shop.name}」及其全部 ${shop.orderCount} 条点单记录？`,
    '提示',
    { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
  ).then(async () => {
    await removeShop(shop.id);
    ElMessage.success('已删除');
    if (detailShopId.value === shop.id) detailVisible.value = false;
    queryClient.invalidateQueries({ queryKey: ['shops'] });
  });
}
</script>

<style lang="scss" scoped>
.takeout-page {
  min-height: 100%;
}

.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 14px;

  .page-title {
    h2 {
      margin: 0;
      font-size: 22px;
      color: var(--text-1);
    }

    .page-sub {
      margin-top: 4px;
      font-size: 13px;
      color: var(--text-2);
    }
  }
}

.filter-bar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding: 12px 14px;
  margin-bottom: 16px;

  .filter-search {
    width: 240px;
  }

  .filter-item {
    width: 120px;
  }

  .filter-item.sort {
    width: 130px;
    margin-left: auto;
  }
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
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
