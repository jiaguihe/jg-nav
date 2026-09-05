<template>
  <div class="json-panel">
    <div class="panel-head">
      <span class="panel-title">🔧 JSON 工具</span>
      <el-select v-model="indent" size="small" class="indent-select">
        <el-option label="缩进 2 空格" :value="2" />
        <el-option label="缩进 4 空格" :value="4" />
      </el-select>
    </div>

    <div class="json-io">
      <div class="io-col">
        <div class="io-label">输入（JSON 字符串或 JS 对象字面量）</div>
        <el-input
          v-model="input"
          type="textarea"
          :rows="10"
          class="code-input"
          placeholder='{"name": "jg-nav", "tools": ["json", "url", "time"]}'
          @keydown.ctrl.enter="format"
        />
      </div>
      <div class="io-col">
        <div class="io-label">
          输出
          <span v-if="status" class="io-status" :class="status.type">{{ status.text }}</span>
        </div>
        <el-input v-model="output" type="textarea" :rows="10" class="code-input" readonly />
      </div>
    </div>

    <div class="json-actions">
      <el-button type="primary" size="small" @click="format">格式化</el-button>
      <el-button size="small" @click="minify">压缩</el-button>
      <el-button size="small" @click="fromJsObject">对象转 JSON</el-button>
      <el-button size="small" @click="escapeJson">转义</el-button>
      <el-button size="small" @click="unescapeJson">去转义</el-button>
      <el-button size="small" round @click="copyOutput">复制结果</el-button>
      <el-button size="small" text type="danger" @click="clearAll">清空</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { copyText } from '@/utils/clipboard';

defineOptions({ name: 'JsonPanel' });

const input = ref('');
const output = ref('');
const indent = ref(2);
const status = ref<{ type: 'ok' | 'error'; text: string } | null>(null);

/** 解析输入为对象；失败时给出带行列位置的提示 */
function parseInput(): unknown {
  try {
    status.value = { type: 'ok', text: 'JSON 合法' };
    return JSON.parse(input.value);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const pos = message.match(/position (\d+)/);
    let where = '';
    if (pos) {
      const index = Number(pos[1]);
      const before = input.value.slice(0, index);
      const line = before.split('\n').length;
      const column = index - before.lastIndexOf('\n');
      where = `（第 ${line} 行第 ${column} 列附近）`;
    }
    status.value = { type: 'error', text: `JSON 不合法：${message}${where}` };
    throw new Error(message);
  }
}

function format() {
  if (!input.value.trim()) return ElMessage.warning('请先输入 JSON');
  try {
    output.value = JSON.stringify(parseInput(), null, indent.value);
  } catch {
    ElMessage.error('JSON 不合法，无法格式化');
  }
}

function minify() {
  if (!input.value.trim()) return ElMessage.warning('请先输入 JSON');
  try {
    output.value = JSON.stringify(parseInput());
  } catch {
    ElMessage.error('JSON 不合法，无法压缩');
  }
}

/** JS 对象字面量（键可不带引号、可用单引号）→ 标准 JSON */
function fromJsObject() {
  if (!input.value.trim()) return ElMessage.warning('请先输入对象');
  try {
    // 输入来自用户本机剪贴板，与浏览器控制台求值等价，无额外风险面
    const value = new Function(`return (${input.value})`)();
    output.value = JSON.stringify(value, null, indent.value);
    status.value = { type: 'ok', text: '对象字面量已转为标准 JSON' };
  } catch {
    status.value = { type: 'error', text: '不是合法的对象字面量' };
    ElMessage.error('不是合法的 JS 对象字面量');
  }
}

/** 把整段文本转成带转义的 JSON 字符串（用于嵌入代码/接口示例） */
function escapeJson() {
  if (!input.value.trim()) return ElMessage.warning('请先输入内容');
  output.value = JSON.stringify(input.value);
  status.value = { type: 'ok', text: '已转义为 JSON 字符串' };
}

/** 把转义后的 JSON 字符串还原为原文 */
function unescapeJson() {
  if (!input.value.trim()) return ElMessage.warning('请先输入内容');
  try {
    const value = JSON.parse(input.value);
    if (typeof value !== 'string') {
      status.value = { type: 'error', text: '输入不是转义字符串，已按 JSON 解析' };
      output.value = JSON.stringify(value, null, indent.value);
      return;
    }
    output.value = value;
    status.value = { type: 'ok', text: '已还原' };
  } catch {
    status.value = { type: 'error', text: '去转义失败：不是合法的 JSON 字符串' };
    ElMessage.error('去转义失败：不是合法的 JSON 字符串');
  }
}

async function copyOutput() {
  await copyText(output.value, '结果已复制');
}

function clearAll() {
  input.value = '';
  output.value = '';
  status.value = null;
}
</script>

<style lang="scss" scoped>
.json-panel {
  display: flex;
  flex-direction: column;
  height: 100%;

  .indent-select {
    width: 120px;
  }

  .json-io {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin: 10px 0 12px;
  }

  .io-col {
    display: flex;
    flex-direction: column;

    .io-label {
      margin-bottom: 6px;
      font-size: 13px;
      color: var(--text-3);
      display: flex;
      align-items: center;
      gap: 8px;

      .io-status {
        font-size: 12px;

        &.ok {
          color: var(--el-color-success);
        }

        &.error {
          color: var(--el-color-danger);
        }
      }
    }

    :deep(.el-textarea__inner) {
      font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
      font-size: 13px;
      line-height: 1.6;
    }
  }

  .json-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}

@media (max-width: 960px) {
  .json-io {
    grid-template-columns: 1fr !important;
  }
}
</style>
