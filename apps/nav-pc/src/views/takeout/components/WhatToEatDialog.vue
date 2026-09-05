<template>
  <el-dialog
    :model-value="modelValue"
    title="今天吃什么？"
    width="420"
    @update:model-value="emit('update:modelValue', $event)"
    @closed="rolling = false"
  >
    <div class="what-to-eat">
      <template v-if="candidates.length === 0">
        <el-empty description="还没有高分店铺（4 星以上或打了好吃/回购标签）" :image-size="80" />
      </template>
      <template v-else>
        <div class="roll-stage" :class="{ rolling }">
          <div class="roll-name">{{ displayed?.name ?? ' Ready？' }}</div>
          <div v-if="result" class="roll-meta">
            <el-rate :model-value="result.score" disabled size="small" />
            <span v-if="result.category" class="roll-category">{{ result.category }}</span>
            <span class="roll-platform">{{ platformLabel(result) }}</span>
          </div>
        </div>
        <div class="roll-actions">
          <el-button v-if="result" @click="emit('open-shop', result)">看记录</el-button>
          <el-button type="primary" :loading="rolling" @click="roll">
            {{ result ? '再抽一次' : '开始随机' }}
          </el-button>
        </div>
      </template>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import type { TakeawayShopVO } from '@jg/api-types';
import { PLATFORM_META } from '@/constants/takeaway';

const props = defineProps<{
  modelValue: boolean;
  shops: TakeawayShopVO[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'open-shop': [shop: TakeawayShopVO];
}>();

// 候选池：4 星以上，或带"好吃/回购"标签
const candidates = computed(() =>
  props.shops.filter(
    (s) => s.score >= 4 || s.tags.includes('good') || s.tags.includes('reorder')
  )
);

const displayed = ref<TakeawayShopVO | null>(null);
const result = ref<TakeawayShopVO | null>(null);
const rolling = ref(false);
let timer: number | undefined;

function roll() {
  if (rolling.value || candidates.value.length === 0) return;
  rolling.value = true;
  result.value = null;

  // 先匀速快滚，再逐段减速，最终停在随机一家
  const total = candidates.value.length;
  const finalIndex = Math.floor(Math.random() * total);
  let step = 0;
  const stopAt = total * 2 + finalIndex;
  let delay = 70;

  const tick = () => {
    displayed.value = candidates.value[step % total];
    step += 1;
    if (step >= stopAt) {
      rolling.value = false;
      result.value = displayed.value;
      return;
    }
    if (step > stopAt - 6) delay += 90;
    timer = window.setTimeout(tick, delay);
  };
  tick();
}

const platformLabel = (shop: TakeawayShopVO) =>
  PLATFORM_META[shop.platform]?.label ?? '其他';

onUnmounted(() => window.clearTimeout(timer));
</script>

<style lang="scss" scoped>
.what-to-eat {
  .roll-stage {
    min-height: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 16px;
    border-radius: 16px;
    background: var(--inner-bg);
    border: 1px solid var(--inner-border);

    .roll-name {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-1);
    }

    .roll-meta {
      display: flex;
      align-items: center;
      gap: 10px;

      .roll-category,
      .roll-platform {
        font-size: 12px;
        color: var(--text-3);
      }
    }

    &.rolling .roll-name {
      animation: shake 0.15s ease-in-out infinite;
    }
  }

  .roll-actions {
    margin-top: 16px;
    display: flex;
    justify-content: center;
    gap: 10px;
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-3px);
  }
  75% {
    transform: translateX(3px);
  }
}
</style>
