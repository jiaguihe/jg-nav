<template>
  <div class="bg-root">
    <Transition name="bg-fade" mode="out-in">
      <div
        v-if="appStore.bgMode !== 'gradient'"
        :key="`img-${imageIndex}`"
        class="bg-image"
        :style="{ backgroundImage: `url(${bgImages[imageIndex]})` }"
      />
      <div
        v-else
        :key="`grad-${appStore.gradientIndex}`"
        class="bg-image"
        :style="{ backgroundImage: appStore.currentGradient }"
      />
    </Transition>
    <div class="bg-mask" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '@/stores/app';
import { bgImages } from '@/constants/backgrounds';

defineOptions({ name: 'BackgroundLayer' });

const appStore = useAppStore();
const imageIndex = computed(() =>
  appStore.bgMode === 'fixed' ? appStore.bgIndex % bgImages.length : appStore.dailyIndex
);
</script>

<style lang="scss" scoped>
.bg-root {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.bg-image {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  // 微妙的缩放呼吸感，避免大图完全静态
  transform: scale(1.02);
}

// 轻遮罩压住高亮区域，保证玻璃卡片与文字可读
.bg-mask {
  position: absolute;
  inset: 0;
  background: rgba(8, 10, 16, 0.18);

  html.dark & {
    background: rgba(8, 10, 16, 0.32);
  }
}
</style>
