<template>
  <div class="clock-widget">
    <div class="clock-time">
      <span>{{ now.format('HH') }}</span>
      <span class="time-colon" :class="{ blink: colonHidden }">:</span>
      <span>{{ now.format('mm') }}</span>
    </div>
    <div class="clock-date">
      {{ now.locale('zh-cn').format('YYYY年MM月DD日 dddd') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

defineOptions({ name: 'ClockWidget' });

const now = ref(dayjs());
const colonHidden = ref(false);
let timer: number | undefined;

onMounted(() => {
  // 每秒走字（冒号呼吸闪烁），时钟更有"活着"的感觉
  timer = window.setInterval(() => {
    now.value = dayjs();
    colonHidden.value = now.value.second() % 2 === 1;
  }, 1000);
});

onUnmounted(() => window.clearInterval(timer));
</script>

<style lang="scss" scoped>
.clock-widget {
  text-align: center;
  color: var(--text-1);

  .clock-time {
    font-size: 76px;
    font-weight: 600;
    line-height: 1.15;
    letter-spacing: 4px;
    font-variant-numeric: tabular-nums;

    .time-colon {
      display: inline-block;
      transition: opacity 0.4s ease;

      &.blink {
        opacity: 0.25;
      }
    }
  }

  .clock-date {
    margin-top: 6px;
    font-size: 16px;
    color: var(--text-2);
    letter-spacing: 2px;
  }
}
</style>
