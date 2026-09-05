<template>
  <div class="translate-panel">
    <div class="panel-head">
      <span class="panel-title">🌍 翻译</span>
      <span class="panel-badge">百度翻译 · 停止输入自动翻译</span>
    </div>

    <div class="lang-row">
      <el-select v-model="from" size="small" class="lang-select">
        <el-option v-for="lang in LANGUAGES" :key="lang.code" :label="lang.label" :value="lang.code" />
      </el-select>
      <el-button size="small" circle @click="swapLanguages" :disabled="from === 'auto'">⇄</el-button>
      <el-select v-model="to" size="small" class="lang-select">
        <el-option v-for="lang in LANGUAGES" :key="lang.code" :label="lang.label" :value="lang.code" />
      </el-select>
    </div>

    <div class="translate-io">
      <div class="io-col">
        <el-input
          v-model="text"
          type="textarea"
          :rows="6"
          placeholder="输入要翻译的文本，停止输入 1 秒后自动翻译"
          maxlength="4000"
          show-word-limit
          @keydown.ctrl.enter="doTranslate()"
        />
      </div>
      <div class="io-col">
        <div v-if="results.length" class="result-box">
          <div v-for="(item, index) in results" :key="index" class="result-item">
            <div class="result-src">{{ item.src }}</div>
            <div class="result-dst">{{ item.dst }}</div>
          </div>
        </div>
        <div v-else class="result-empty">{{ loading ? '翻译中…' : '结果显示在这里' }}</div>
      </div>
    </div>

    <div class="translate-actions">
      <el-button type="primary" round :loading="loading" @click="doTranslate()">翻 译</el-button>
      <el-button round :disabled="!hasResult" @click="copyResult">复制结果</el-button>
      <el-button text type="danger" @click="clearAll">清空</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { translateText } from '@/services/toolsService';
import { copyText } from '@/utils/clipboard';

defineOptions({ name: 'TranslatePanel' });

// 与后端 TranslateDto 的语言白名单保持一致
const LANGUAGES = [
  { code: 'auto', label: '自动检测' },
  { code: 'zh', label: '中文' },
  { code: 'cht', label: '中文繁体' },
  { code: 'yue', label: '粤语' },
  { code: 'en', label: '英语' },
  { code: 'jp', label: '日语' },
  { code: 'kor', label: '韩语' },
  { code: 'fra', label: '法语' },
  { code: 'de', label: '德语' },
  { code: 'es', label: '西班牙语' },
  { code: 'it', label: '意大利语' },
  { code: 'ru', label: '俄语' },
  { code: 'th', label: '泰语' },
  { code: 'ara', label: '阿拉伯语' },
  { code: 'pt', label: '葡萄牙语' }
] as const;

const from = ref('auto');
const to = ref('zh');
const text = ref('');
const loading = ref(false);
const results = ref<{ src: string; dst: string }[]>([]);

const hasResult = computed(() => results.value.length > 0);

/** 停止输入 1s 后自动翻译：覆盖打字、改语言、交换方向三种场景 */
const AUTO_DELAY_MS = 1000;
let debounceTimer: number | undefined;
/** 最近一次已发起翻译的组合键，避免自动翻译重复请求相同内容 */
let lastTranslateKey = '';

function translateKey() {
  return `${from.value}>${to.value}:${text.value.trim()}`;
}

watch([text, from, to], () => {
  window.clearTimeout(debounceTimer);
  if (!text.value.trim()) {
    results.value = [];
    lastTranslateKey = '';
    return;
  }
  debounceTimer = window.setTimeout(() => {
    void doTranslate(true);
  }, AUTO_DELAY_MS);
});

onUnmounted(() => window.clearTimeout(debounceTimer));

function swapLanguages() {
  if (from.value === 'auto') return;
  [from.value, to.value] = [to.value, from.value];
  // 已有译文时把译文换成新原文，方便回译核对；text 变化会触发自动回译
  if (results.value.length) {
    const translated = results.value.map((item) => item.dst).join('\n');
    if (translated) text.value = translated;
    results.value = [];
  }
}

async function doTranslate(isAuto = false) {
  const content = text.value.trim();
  // 自动翻译静默跳过，不打扰输入；手动翻译给出明确提示
  if (!content) {
    if (!isAuto) ElMessage.warning('请输入要翻译的文本');
    return;
  }
  if (from.value === to.value) {
    if (!isAuto) ElMessage.warning('源语言和目标语言相同');
    return;
  }
  const key = translateKey();
  if (key === lastTranslateKey) return;

  lastTranslateKey = key;
  loading.value = true;
  try {
    const result = await translateText({ text: content, from: from.value, to: to.value });
    results.value = result.items;
    if (!results.value.length) ElMessage.info('翻译结果为空');
  } catch {
    // 失败后重置键，下次输入变化能自动重试；错误提示由 request 拦截器统一弹出
    lastTranslateKey = '';
  } finally {
    loading.value = false;
  }
}

async function copyResult() {
  const joined = results.value.map((item) => item.dst).join('\n');
  await copyText(joined, '翻译结果已复制');
}

function clearAll() {
  text.value = '';
  results.value = [];
}
</script>

<style lang="scss" scoped>
.translate-panel {
  display: flex;
  flex-direction: column;
  height: 100%;

  .lang-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 10px 0;

    .lang-select {
      flex: 1;
    }
  }

  .translate-io {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 12px;

    .io-col {
      min-height: 120px;
    }

    .result-box {
      height: 100%;
      max-height: 140px;
      overflow-y: auto;
      padding: 8px 12px;
      border-radius: 10px;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);

      .result-item + .result-item {
        margin-top: 8px;
      }

      .result-src {
        font-size: 12px;
        color: var(--text-3);
      }

      .result-dst {
        font-size: 14px;
        color: var(--text-1);
        line-height: 1.6;
      }
    }

    .result-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      font-size: 13px;
      color: var(--text-3);
      border-radius: 10px;
      background: var(--glass-bg);
      border: 1px dashed var(--glass-border);
    }
  }

  .translate-actions {
    display: flex;
    gap: 10px;
  }
}

@media (max-width: 960px) {
  .translate-io {
    grid-template-columns: 1fr !important;
  }
}
</style>
