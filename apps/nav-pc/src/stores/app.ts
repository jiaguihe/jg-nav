import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

export type ThemeMode = 'light' | 'dark';
export type BgMode = 'daily' | 'fixed' | 'gradient';

const STORAGE_KEY = 'jg-nav-appearance';

/** 外观偏好版本号：升级时对老配置做一次性迁移 */
const APPEARANCE_VERSION = 2;

interface Appearance {
  version: number;
  theme: ThemeMode;
  bgMode: BgMode;
  bgIndex: number;
  gradientIndex: number;
  engine: string;
}

const DEFAULTS: Appearance = {
  version: APPEARANCE_VERSION,
  theme: 'light',
  bgMode: 'daily',
  bgIndex: 0,
  gradientIndex: 0,
  engine: 'bing'
};

function loadAppearance(): Appearance {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    const merged = { ...DEFAULTS, ...saved };
    // v2：整体改明亮色系，把 v1 时代保存的深色默认一次性切到浅色；
    // 之后手动切回深色会被正常保存，不再重置
    if (saved.version !== APPEARANCE_VERSION) {
      merged.theme = 'light';
      merged.version = APPEARANCE_VERSION;
    }
    return merged;
  } catch {
    return { ...DEFAULTS };
  }
}

/** 预设渐变背景（gradient 模式用），按主题取对应色组 */
export const LIGHT_GRADIENTS = [
  'linear-gradient(135deg, #dbeeff 0%, #9fd0f5 45%, #e6f8e2 100%)',
  'linear-gradient(135deg, #fdeef6 0%, #f7c7dd 50%, #fff4de 100%)',
  'linear-gradient(135deg, #e6f9ee 0%, #aee6c8 50%, #f2ffdf 100%)',
  'linear-gradient(135deg, #fff6df 0%, #ffe2a3 50%, #ffeed6 100%)',
  'linear-gradient(135deg, #ecf0ff 0%, #c6d3ff 50%, #f1e9ff 100%)'
];

export const DARK_GRADIENTS = [
  'linear-gradient(135deg, #1f3143 0%, #3a5a75 45%, #7ea8be 100%)',
  'linear-gradient(135deg, #2b1f3d 0%, #5c3a6e 50%, #c98bb9 100%)',
  'linear-gradient(135deg, #123428 0%, #2e6e4e 50%, #a3d9b5 100%)',
  'linear-gradient(135deg, #3d1f2b 0%, #8a4a5e 50%, #e8b4c8 100%)',
  'linear-gradient(135deg, #1a1f3d 0%, #3d4a8a 50%, #9bb0e8 100%)'
];

export const useAppStore = defineStore('app', () => {
  const initial = loadAppearance();
  const theme = ref<ThemeMode>(initial.theme);
  const bgMode = ref<BgMode>(initial.bgMode);
  const bgIndex = ref(initial.bgIndex);
  const gradientIndex = ref(initial.gradientIndex);
  const engine = ref(initial.engine);

  /** daily 模式按"年内第几天"在 7 张图里轮换，每天不重样 */
  const dailyIndex = computed(() => {
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) /
        86400000
    );
    return dayOfYear % 7;
  });

  /** 当前主题下可选的渐变组 */
  const gradients = computed(() =>
    theme.value === 'dark' ? DARK_GRADIENTS : LIGHT_GRADIENTS
  );

  const currentGradient = computed(
    () =>
      gradients.value[gradientIndex.value % gradients.value.length]
  );

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
  }

  // 主题/偏好变化即同步到 <html> 类名与 localStorage
  watch(
    [theme, bgMode, bgIndex, gradientIndex, engine],
    () => {
      document.documentElement.classList.toggle('dark', theme.value === 'dark');
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: APPEARANCE_VERSION,
          theme: theme.value,
          bgMode: bgMode.value,
          bgIndex: bgIndex.value,
          gradientIndex: gradientIndex.value,
          engine: engine.value
        } satisfies Appearance)
      );
    },
    { immediate: true }
  );

  return {
    theme,
    bgMode,
    bgIndex,
    gradientIndex,
    engine,
    dailyIndex,
    gradients,
    currentGradient,
    toggleTheme
  };
});
