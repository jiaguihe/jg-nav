<template>
  <div class="bg-picker">
    <el-radio-group v-model="mode" size="small">
      <el-radio-button value="daily">每日轮换</el-radio-button>
      <el-radio-button value="fixed">固定图片</el-radio-button>
      <el-radio-button value="gradient">渐变色</el-radio-button>
    </el-radio-group>

    <div v-if="mode === 'daily'" class="mode-tip">
      每天自动换一张，今天是第 {{ appStore.dailyIndex + 1 }} 张
    </div>

    <div v-else-if="mode === 'fixed'" class="thumb-grid">
      <img
        v-for="(img, i) in bgImages"
        :key="i"
        :src="img"
        :class="{ active: appStore.bgIndex === i }"
        alt=""
        @click="appStore.bgIndex = i"
      />
    </div>

    <div v-else class="gradient-grid">
      <div
        v-for="(g, i) in GRADIENTS"
        :key="i"
        :style="{ backgroundImage: g }"
        :class="{ active: appStore.gradientIndex === i }"
        @click="appStore.gradientIndex = i"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAppStore, GRADIENTS } from '@/stores/app';
import { bgImages } from '@/constants/backgrounds';

defineOptions({ name: 'BackgroundPicker' });

const appStore = useAppStore();
const mode = ref(appStore.bgMode);

watch(mode, (value) => (appStore.bgMode = value));
watch(
  () => appStore.bgMode,
  (value) => (mode.value = value)
);
</script>

<style lang="scss" scoped>
.bg-picker {
  width: 264px;

  .mode-tip {
    margin-top: 10px;
    font-size: 12px;
    color: var(--text-3);
  }

  .thumb-grid {
    margin-top: 10px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;

    img {
      width: 100%;
      height: 52px;
      object-fit: cover;
      border-radius: 8px;
      cursor: pointer;
      border: 2px solid transparent;
      transition: border-color 0.2s ease;

      &:hover {
        border-color: var(--text-3);
      }

      &.active {
        border-color: var(--accent);
      }
    }
  }

  .gradient-grid {
    margin-top: 10px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;

    div {
      height: 52px;
      border-radius: 8px;
      cursor: pointer;
      border: 2px solid transparent;
      transition: border-color 0.2s ease;

      &:hover {
        border-color: var(--text-3);
      }

      &.active {
        border-color: var(--accent);
      }
    }
  }
}
</style>
