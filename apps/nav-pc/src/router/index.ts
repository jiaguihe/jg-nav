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

const PAGE_TITLES: Record<string, string> = {
  nav: '导航',
  takeout: '外卖',
  tools: '工具'
};

router.afterEach((to) => {
  const page = PAGE_TITLES[String(to.name)] ?? '';
  document.title = page ? `JG 导航 · ${page}` : 'JG 导航';
});

export default router;
