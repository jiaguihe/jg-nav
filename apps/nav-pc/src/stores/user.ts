import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { UserVO } from '@jg/api-types';
import { fetchMe, login as loginApi, logout as logoutApi } from '@/services/userService';

export const useUserStore = defineStore('user', () => {
  const user = ref<UserVO | null>(null);
  /** 初始化完成标记：避免刷新时闪烁 */
  const initialized = ref(false);

  /** 应用启动时恢复会话（httpOnly Cookie 有效则拿到用户） */
  async function restore() {
    try {
      user.value = await fetchMe();
    } catch {
      user.value = null;
    } finally {
      initialized.value = true;
    }
  }

  async function login(params: { username: string; password: string }) {
    user.value = await loginApi(params);
  }

  async function logout() {
    await logoutApi();
    user.value = null;
  }

  return { user, initialized, restore, login, logout };
});
