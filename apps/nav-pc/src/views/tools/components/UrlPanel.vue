<template>
  <div class="url-panel">
    <div class="panel-head">
      <span class="panel-title">🔗 URL 编解码</span>
    </div>

    <el-input
      v-model="raw"
      class="url-input"
      placeholder="输入 URL 或任意文本"
      clearable
      @keydown.enter="parse"
    />

    <div class="url-actions">
      <el-button type="primary" size="small" @click="encodeComponent">编码（组件）</el-button>
      <el-button size="small" @click="encodeWhole">编码（整条 URL）</el-button>
      <el-button size="small" @click="decode">解码</el-button>
      <el-button size="small" round @click="parse">解析</el-button>
      <el-button size="small" text type="danger" @click="clearAll">清空</el-button>
    </div>

    <template v-if="result">
      <div class="url-result">
        <div class="result-label">结果</div>
        <div class="result-text">{{ result }}</div>
        <el-button v-if="isHttpUrl(result)" size="small" text type="success" @click="openResult">跳转</el-button>
        <el-button size="small" text type="primary" @click="copyResult">复制</el-button>
      </div>
    </template>

    <template v-if="parsed">
      <div class="parsed-head">
        <span class="parsed-title">解析结果</span>
        <el-button size="small" text type="success" @click="openParsed">跳转打开</el-button>
      </div>
      <el-descriptions :column="2" size="small" border class="url-parts">
        <el-descriptions-item label="协议">{{ parsed.protocol }}</el-descriptions-item>
        <el-descriptions-item label="主机名">{{ parsed.hostname }}</el-descriptions-item>
        <el-descriptions-item label="端口">{{ parsed.port || '（默认）' }}</el-descriptions-item>
        <el-descriptions-item label="路径">{{ parsed.pathname }}</el-descriptions-item>
        <el-descriptions-item label="查询串" :span="2">{{ parsed.search || '（无）' }}</el-descriptions-item>
        <el-descriptions-item label="锚点" :span="2">{{ parsed.hash || '（无）' }}</el-descriptions-item>
      </el-descriptions>

      <el-table v-if="parsed.params.length" :data="parsed.params" size="small" class="param-table">
        <el-table-column prop="key" label="参数" min-width="120" show-overflow-tooltip />
        <el-table-column prop="value" label="值" min-width="180" show-overflow-tooltip />
      </el-table>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { copyText } from '@/utils/clipboard';

defineOptions({ name: 'UrlPanel' });

const raw = ref('');
const result = ref('');
const parsed = ref<{
  href: string;
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  params: { key: string; value: string }[];
} | null>(null);

/** 仅允许跳转 http/https 链接，防止 javascript: 之类伪协议 */
function isHttpUrl(text: string): boolean {
  return /^https?:\/\//i.test(text.trim());
}

function openUrl(text: string) {
  const url = text.trim();
  if (!isHttpUrl(url)) {
    return ElMessage.warning('不是 http/https 链接，无法跳转');
  }
  window.open(url, '_blank', 'noopener');
}

function openResult() {
  openUrl(result.value);
}

function openParsed() {
  if (parsed.value) openUrl(parsed.value.href);
}

function encodeComponent() {
  if (!raw.value) return ElMessage.warning('请先输入内容');
  // encodeURIComponent：组件级编码，/ & = 等也转义
  result.value = encodeURIComponent(raw.value);
}

function encodeWhole() {
  if (!raw.value) return ElMessage.warning('请先输入内容');
  // encodeURI：整条 URL 编码，保留 ://?&= 等结构字符
  result.value = encodeURI(raw.value);
}

function decode() {
  if (!raw.value) return ElMessage.warning('请先输入内容');
  try {
    result.value = decodeURIComponent(raw.value.replace(/\+/g, ' '));
  } catch {
    ElMessage.error('解码失败：含有不合法的百分号编码');
  }
}

function parse() {
  const text = raw.value.trim();
  if (!text) return ElMessage.warning('请先输入 URL');
  // 补协议头，方便粘贴 "www.example.com/a?b=1" 这类省写
  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : `https://${text}`;
  try {
    const url = new URL(candidate);
    parsed.value = {
      href: url.href,
      protocol: url.protocol.replace(':', ''),
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      params: [...url.searchParams.entries()].map(([key, value]) => ({ key, value }))
    };
  } catch {
    parsed.value = null;
    ElMessage.error('不是合法的 URL，无法解析');
  }
}

async function copyResult() {
  await copyText(result.value, '结果已复制');
}

function clearAll() {
  raw.value = '';
  result.value = '';
  parsed.value = null;
}
</script>

<style lang="scss" scoped>
.url-panel {
  display: flex;
  flex-direction: column;
  height: 100%;

  .url-input {
    margin: 10px 0;

    :deep(.el-input__wrapper) {
      border-radius: 10px;
    }
  }

  .url-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .url-result {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-top: 12px;
    padding: 10px 12px;
    border-radius: 10px;
    background: var(--inner-bg);
    border: 1px solid var(--inner-border);

    .result-label {
      flex-shrink: 0;
      font-size: 12px;
      color: var(--text-3);
      line-height: 22px;
    }

    .result-text {
      flex: 1;
      font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
      font-size: 13px;
      line-height: 22px;
      word-break: break-all;
      color: var(--text-1);
    }
  }

  .parsed-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 12px;

    .parsed-title {
      font-size: 12px;
      color: var(--text-3);
    }
  }

  .url-parts {
    margin-top: 6px;
  }

  .param-table {
    margin-top: 12px;
  }
}
</style>
