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
      <el-link
        v-if="!userInfo.username"
        class="head-login"
        :underline="false"
        @click="handleClick"
      >
        登录
      </el-link>
      <el-link v-else class="head-login" :underline="false">
        <el-dropdown>
          <span class="el-dropdown-link">
            {{ userInfo.username }}
            <el-icon><i-ep-ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleLogOut">
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-link>
    </div>
    <LoginRegister
      title="登录"
      :visible="dialogVisible"
      @update:visible="dialogVisible = $event"
      @update:cookie="checkUserInfoCookie"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { getAllUser } from '@/services/userService';
import LoginRegister from './components/loginRegister.vue';
import Cookies from 'js-cookie';

const nowDate = ref(dayjs());
const dialogVisible = ref(false);
const isRegister = ref(false);
const userInfo = reactive({
  id: '',
  username: ''
});

onMounted(() => {
  setInterval(() => {
    nowDate.value = dayjs();
  }, 60000);
  const userInfoCookie = Cookies.get('userInfo');
  checkUserInfoCookie();
});

const handleClick = () => {
  getAllUser();
  dialogVisible.value = true;
};

const checkUserInfoCookie = () => {
  const userInfoCookie = Cookies.get('userInfo');
  if (userInfoCookie) {
    try {
      const userinfo = JSON.parse(userInfoCookie);
      userInfo.id = userinfo.id;
      userInfo.username = userinfo.username;
    } catch (error) {
      console.error('Failed to parse user info cookie:', error);
    }
  } else {
    userInfo.id = '';
    userInfo.username = '';
  }
};

const handleLogOut = () => {
  Cookies.remove('userInfo');
  localStorage.removeItem('token');
  checkUserInfoCookie();
};
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
      .el-tooltip__trigger:focus-visible {
        outline: unset;
      }
      .el-dropdown-link {
        color: #ffffff;
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
}
</style>
