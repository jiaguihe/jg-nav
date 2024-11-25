<template>
  <div class="home-wrapper">
    <div class="home-head">
      <div class="head-time">
        <div class="home-time">
          <span>{{ nowDate.format('HH') }}</span>
          <span class="time-colon">:</span>
          <span>{{ nowDate.format('mm') }}</span>
        </div>
        <div class="home-date">
          {{ nowDate.locale('zh-cn').format('YYYY年MM月DD日 dddd') }}
        </div>
      </div>
      <el-link class="head-login" :underline="false" @click="handleClick">
        登录
      </el-link>
    </div>
    <LoginRegister
      :title="isRegister ? '注册' : '登录'"
      :visible="dialogVisible"
      @update:visible="dialogVisible = $event"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { getAllUser } from '@/services/userService';
import LoginRegister from './components/loginRegister.vue';

const nowDate = ref(dayjs());
const dialogVisible = ref(false);
const isRegister = ref(false);

const handleClick = () => {
  getAllUser();
  dialogVisible.value = true;
};

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
  overflow: hidden;
  .home-head {
    margin-top: 40px;
    .head-login {
      color: #ffffff;
      position: absolute;
      top: 0;
      right: 20px;
      margin-top: 20px;
    }
  }
  .head-time {
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
}
</style>
