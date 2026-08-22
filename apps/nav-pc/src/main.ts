import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import App from './App.vue';
import router from './router';
import { useAppStore } from './stores/app';
import '@/styles/index.scss';

const app = createApp(App);

app.use(createPinia());
// 首次实例化即把主题类名/背景偏好应用到 <html>，避免刷新闪烁
useAppStore();
app.use(VueQueryPlugin);
app.use(router);
app.use(ElementPlus, { locale: zhCn });

app.mount('#app');
