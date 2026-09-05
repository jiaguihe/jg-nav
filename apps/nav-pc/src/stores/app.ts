import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'jg-nav-appearance';

/** 外观偏好版本号：升级时对老配置做一次性迁移 */
const APPEARANCE_VERSION = 3;

interface Appearance {
  version: number;
  theme: ThemeMode;
  engine: string;
}

const DEFAULTS: Appearance = {
  version: APPEARANCE_VERSION,
  theme: 'light',
  engine: 'bing'
};

function loadAppearance(): Appearance {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    const merged = { ...DEFAULTS, ...saved };
    // v3：移除背景图体系，只保留主题与搜索引擎；v1/v2 的深色默认一次性切浅色
    if (saved.version !== APPEARANCE_VERSION) {
      merged.theme = 'light';
    }
    return {
      version: APPEARANCE_VERSION,
      theme: merged.theme === 'dark' ? 'dark' : 'light',
      engine: merged.engine || DEFAULTS.engine
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export const useAppStore = defineStore('app', () => {
  const initial = loadAppearance();
  const theme = ref<ThemeMode>(initial.theme);
  const engine = ref(initial.engine);

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
  }

  // 主题/偏好变化即同步到 <html> 类名与 localStorage
  watch(
    [theme, engine],
    () => {
      document.documentElement.classList.toggle('dark', theme.value === 'dark');
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: APPEARANCE_VERSION,
          theme: theme.value,
          engine: engine.value
        } satisfies Appearance)
      );
    },
    { immediate: true }
  );

  return {
    theme,
    engine,
    toggleTheme
  };
});
