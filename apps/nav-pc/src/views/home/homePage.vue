<template>
  <div class="home-wrapper">
    <div class="home-head">
      <div class="head-time">
        <div class="home-time">
          <span>{{ now.format('HH') }}</span>
          <span class="time-colon">:</span>
          <span>{{ now.format('mm') }}</span>
        </div>
        <div class="home-date">
          {{ now.locale('zh-cn').format('YYYY年MM月DD日 dddd') }}
        </div>
      </div>
      <el-link
        v-if="!userStore.user"
        class="head-login"
        :underline="false"
        @click="loginVisible = true"
      >
        登录
      </el-link>
      <el-dropdown v-else class="head-login">
        <span class="el-dropdown-link">
          {{ userStore.user.username }}
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <ShowLinks @open-login="loginVisible = true" />

    <LoginDialog v-model="loginVisible" />

    <div class="home-bottom">
      <a
        href="https://beian.mps.gov.cn/#/query/webSearch?code=11010502056569"
        rel="noreferrer"
        target="_blank"
      >
        <img src="@/assets/police-logo.png" width="20" alt="公安备案" />
        京公网安备11010502056569号
      </a>
      <a href="https://beian.miit.gov.cn/" target="_blank">
        赣ICP备2025054513号
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ArrowDown } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { useUserStore } from '@/stores/user';
import ShowLinks from './components/showLinks.vue';
import LoginDialog from './components/loginDialog.vue';

const userStore = useUserStore();
const loginVisible = ref(false);
const now = ref(dayjs());

onMounted(async () => {
  // 恢复会话（httpOnly Cookie），失败静默
  userStore.restore();
  // 时钟：按秒对齐下一分钟，组件卸载自动清理（useIntervalFn）
  const timer = setInterval(() => {
    now.value = dayjs();
  }, 60000);
  onUnmounted(() => clearInterval(timer));
});

const handleLogout = async () => {
  await userStore.logout();
};
</script>

<script lang="ts">
export default { name: 'HomePage' };
</script>

<style lang="scss" scoped>
.home-wrapper {
  height: 100vh;
  width: 100vw;
  background-image: url('@/assets/backgroundImage/2.jpg');
  background-size: cover;
  background-position: center;
  overflow: hidden;

  .home-head {
    margin-top: 40px;

    .head-login {
      color: #ffffff;
      position: absolute;
      top: 0;
      right: 20px;
      margin-top: 20px;

      .el-dropdown-link {
        color: #ffffff;
        display: flex;
        align-items: center;
        gap: 4px;
        outline: none;
      }
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

  .home-bottom {
    padding: 15px 0;
    color: #ffffff;
    font-size: 14px;
    position: fixed;
    width: 100%;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;

    a {
      display: flex;
      align-items: center;
      gap: 5px;
      line-height: 20px;
      text-decoration: none;
      color: #ffffff;
    }
  }
}
</style>
