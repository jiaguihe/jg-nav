import { createRouter, createWebHistory } from 'vue-router';
const router = createRouter({
  history: createWebHistory(), // 这里指定基本URL
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/home/homePage.vue')
    }
  ]
});
export default router;
