import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'nav',
      component: () => import('@/views/nav/navPage.vue')
    },
    {
      path: '/takeout',
      name: 'takeout',
      component: () => import('@/views/takeout/takeoutPage.vue')
    },
    {
      path: '/tools',
      name: 'tools',
      component: () => import('@/views/tools/toolsPage.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
});

export default router;
