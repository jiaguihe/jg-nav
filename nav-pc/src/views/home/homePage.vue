<template>
  <div class="home-wrapper">
    <div>
      <div class="home-time">
        <span>{{ nowDate.format('HH') }}</span>
        <span class="time-colon">:</span>
        <span>{{ nowDate.format('mm') }}</span>
      </div>
      <div class="home-date">
        {{ nowDate.locale('zh-cn').format('YYYY年MM月DD日 dddd') }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

const nowDate = ref(dayjs());
onMounted(() => {
  setInterval(() => {
    nowDate.value = dayjs();
  }, 60000);
});
</script>

<style lang="scss" scoped>
.home-wrapper {
  height: 100vh;
  width: 100vw;
  background-image: url('@/assets/backgroundImage/2.jpg');
  background-size: cover; /* 保证背景图填充整个容器 */
  background-position: center; /* 背景图居中 */
  filter: opacity(0.6); /* 设置透明度为 50% */
  .home-time {
    color: #ffffff;
    line-height: 70px;
    font-size: 70px;
    text-align: center;
    .time-colon {
      display: inline-block;
      line-height: 70px;
      vertical-align: 7px;
      margin-right: 4px;
    }
  }
  .home-date {
    color: #ffffff;
    font-size: 16px;
    text-align: center;
  }
}
</style>
