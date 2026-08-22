<template>
  <div v-if="weather" class="weather-widget" :title="weatherTooltip">
    <span class="weather-icon">{{ weather.emoji }}</span>
    <span class="weather-temp">{{ weather.temperature }}°</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

defineOptions({ name: 'WeatherWidget' });

interface WeatherInfo {
  emoji: string;
  description: string;
  temperature: number;
  humidity: number;
}

const CACHE_KEY = 'jg-nav-weather';
const CACHE_TTL = 30 * 60 * 1000;

// WMO weather code → 描述（open-meteo 标准编码，只取常用段）
const WMO_CODES: Record<number, { emoji: string; description: string }> = {
  0: { emoji: '☀️', description: '晴' },
  1: { emoji: '🌤️', description: '多云转晴' },
  2: { emoji: '⛅', description: '多云' },
  3: { emoji: '☁️', description: '阴' },
  45: { emoji: '🌫️', description: '雾' },
  48: { emoji: '🌫️', description: '雾凇' },
  51: { emoji: '🌦️', description: '小毛毛雨' },
  53: { emoji: '🌦️', description: '毛毛雨' },
  55: { emoji: '🌧️', description: '大毛毛雨' },
  61: { emoji: '🌧️', description: '小雨' },
  63: { emoji: '🌧️', description: '中雨' },
  65: { emoji: '⛈️', description: '大雨' },
  66: { emoji: '🌧️', description: '冻雨' },
  67: { emoji: '🌧️', description: '强冻雨' },
  71: { emoji: '🌨️', description: '小雪' },
  73: { emoji: '🌨️', description: '中雪' },
  75: { emoji: '❄️', description: '大雪' },
  77: { emoji: '🌨️', description: '雪粒' },
  80: { emoji: '🌦️', description: '阵雨' },
  81: { emoji: '🌧️', description: '强阵雨' },
  82: { emoji: '⛈️', description: '暴雨' },
  85: { emoji: '🌨️', description: '阵雪' },
  86: { emoji: '❄️', description: '强阵雪' },
  95: { emoji: '⛈️', description: '雷阵雨' },
  96: { emoji: '⛈️', description: '雷阵雨伴冰雹' },
  99: { emoji: '⛈️', description: '强雷雨伴冰雹' }
};

const weather = ref<WeatherInfo | null>(null);

const weatherTooltip = computed(() =>
  weather.value
    ? `${weather.value.description} · 湿度 ${weather.value.humidity}%`
    : ''
);

async function locate(): Promise<{ lat: number; lon: number }> {
  // 优先浏览器定位（需授权），超时或拒绝则回北京
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: 39.9, lon: 116.4 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve({ lat: 39.9, lon: 116.4 }),
      { timeout: 3000 }
    );
  });
}

async function load() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null');
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      weather.value = cached.info;
      return;
    }
    const { lat, lon } = await locate();
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        '&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto'
    );
    const data = await res.json();
    const code = WMO_CODES[data.current?.weather_code] ?? {
      emoji: '🌡️',
      description: '未知'
    };
    const info: WeatherInfo = {
      emoji: code.emoji,
      description: code.description,
      temperature: Math.round(data.current.temperature_2m),
      humidity: data.current.relative_humidity_2m
    };
    weather.value = info;
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), info }));
  } catch {
    // 天气是锦上添花，失败静默
  }
}

onMounted(load);
</script>

<style lang="scss" scoped>
.weather-widget {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 14px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  color: var(--text-1);
  font-size: 14px;
  cursor: default;
  white-space: nowrap;

  .weather-icon {
    font-size: 16px;
  }
}
</style>
