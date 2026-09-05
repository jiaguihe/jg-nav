<template>
  <!-- 常驻占位：接口返回前预留一行高度，避免下方内容先升后降的跳动 -->
  <div class="hitokoto-wrap">
    <div v-if="sentence" class="hitokoto" title="点击换一句" @click="load">
      <span class="hitokoto-text">「{{ sentence.hitokoto }}」</span>
      <span class="hitokoto-from">—— {{ sentence.from_who || sentence.from || '一言' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

defineOptions({ name: 'HitokotoWidget' });

interface Hitokoto {
  hitokoto: string;
  from: string;
  from_who: string;
}

const sentence = ref<Hitokoto | null>(null);

async function load() {
  try {
    // c=i/d/k/e：诗词、文学、哲学类句子，自用导航站的味道
    const res = await fetch('https://v1.hitokoto.cn/?c=i&c=d&c=k&c=e&max_length=30');
    sentence.value = await res.json();
  } catch {
    // 一言失败静默，不占位
  }
}

onMounted(load);
</script>

<style lang="scss" scoped>
.hitokoto-wrap {
  // 固定一行文字的高度（14px × 1.5 行高），加载前后布局稳定
  min-height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hitokoto {
  text-align: center;
  cursor: pointer;
  color: var(--text-2);
  transition: color 0.2s ease;

  &:hover {
    color: var(--text-1);
  }

  .hitokoto-text {
    font-size: 14px;
    letter-spacing: 1px;
  }

  .hitokoto-from {
    margin-left: 8px;
    font-size: 12px;
    color: var(--text-3);
  }
}
</style>
