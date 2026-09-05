<template>
  <div class="ts-panel">
    <div class="panel-head">
      <span class="panel-title">⏱️ 时间戳转换</span>
    </div>

    <div class="now-box">
      <div class="now-row" @click="copyText(String(nowMs), '毫秒时间戳已复制')">
        <span class="now-label">毫秒</span>
        <span class="now-value">{{ nowMs }}</span>
      </div>
      <div class="now-row" @click="copyText(String(nowSeconds), '秒级时间戳已复制')">
        <span class="now-label">秒级</span>
        <span class="now-value">{{ nowSeconds }}</span>
      </div>
      <div class="now-date">{{ nowText }}</div>
    </div>

    <div class="ts-convert">
      <div class="convert-row">
        <el-input
          v-model="tsInput"
          class="ts-input"
          placeholder="输入时间戳（10 位秒 / 13 位毫秒，自动识别）"
          clearable
          @keydown.enter="tsToDate"
        />
        <el-button type="primary" size="small" @click="tsToDate">转日期</el-button>
      </div>
      <div v-if="tsResult" class="convert-result">
        <div class="result-line main">{{ tsResult.local }}</div>
        <div class="result-line">
          {{ tsResult.weekday }} · {{ tsResult.relative }} · UTC {{ tsResult.utc }}
          <span class="unit-tip">（识别为{{ tsResult.unit }}）</span>
        </div>
      </div>

      <div class="convert-row">
        <el-date-picker
          v-model="dateValue"
          type="datetime"
          placeholder="选择日期时间"
          class="date-picker"
          format="YYYY-MM-DD HH:mm:ss"
        />
        <el-button type="primary" size="small" :disabled="!dateValue" @click="dateToTs">转时间戳</el-button>
      </div>
      <div v-if="dateResult" class="convert-result">
        <div class="result-line clickable" @click="copyText(dateResult.seconds, '秒级时间戳已复制')">
          秒级：{{ dateResult.seconds }}
        </div>
        <div class="result-line clickable" @click="copyText(dateResult.ms, '毫秒时间戳已复制')">
          毫秒：{{ dateResult.ms }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { copyText } from '@/utils/clipboard';

defineOptions({ name: 'TimestampPanel' });

dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const nowMs = ref(Date.now());
const nowSeconds = computed(() => Math.floor(nowMs.value / 1000));
const nowText = computed(() => dayjs(nowMs.value).format('YYYY-MM-DD HH:mm:ss dddd'));
let timer: number | undefined;

const tsInput = ref('');
const tsResult = ref<{
  local: string;
  utc: string;
  weekday: string;
  relative: string;
  unit: string;
} | null>(null);

const dateValue = ref<Date | null>(null);
const dateResult = ref<{ seconds: string; ms: string } | null>(null);

function tsToDate() {
  const text = tsInput.value.trim();
  if (!/^\d{10,13}$/.test(text)) {
    tsResult.value = null;
    return ElMessage.warning('请输入 10 位秒级或 13 位毫秒级时间戳');
  }
  // 10 位按秒、13 位按毫秒，其余位数按毫秒兜底
  const isSeconds = text.length === 10;
  const date = dayjs(isSeconds ? Number(text) * 1000 : Number(text));
  if (!date.isValid()) {
    tsResult.value = null;
    return ElMessage.error('时间戳超出可表示范围');
  }
  tsResult.value = {
    local: date.format('YYYY-MM-DD HH:mm:ss'),
    utc: date.utc().format('YYYY-MM-DD HH:mm:ss'),
    weekday: date.format('dddd'),
    relative: date.fromNow(),
    unit: isSeconds ? '秒' : '毫秒'
  };
}

function dateToTs() {
  if (!dateValue.value) return;
  const date = dayjs(dateValue.value);
  dateResult.value = {
    seconds: String(date.unix()),
    ms: String(date.valueOf())
  };
}

onMounted(() => {
  timer = window.setInterval(() => {
    nowMs.value = Date.now();
  }, 1000);
});

onUnmounted(() => window.clearInterval(timer));
</script>

<style lang="scss" scoped>
.ts-panel {
  display: flex;
  flex-direction: column;
  height: 100%;

  .now-box {
    margin: 10px 0 14px;
    padding: 12px 14px;
    border-radius: 12px;
    background: var(--inner-bg);
    border: 1px solid var(--inner-border);

    .now-row {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;

      & + .now-row {
        margin-top: 6px;
      }

      &:hover .now-value {
        color: var(--el-color-primary);
      }

      .now-label {
        flex-shrink: 0;
        font-size: 12px;
        color: var(--text-3);
      }

      .now-value {
        font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
        font-size: 15px;
        font-weight: 600;
        color: var(--text-1);
        font-variant-numeric: tabular-nums;
      }
    }

    .now-date {
      margin-top: 6px;
      font-size: 13px;
      color: var(--text-3);
    }
  }

  .ts-convert {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .convert-row {
      display: flex;
      gap: 8px;

      .ts-input {
        flex: 1;
      }

      .date-picker {
        flex: 1;
      }
    }

    .convert-result {
      padding: 8px 12px;
      border-radius: 10px;
      background: var(--inner-bg);
      border: 1px solid var(--inner-border);

      .result-line {
        font-size: 13px;
        color: var(--text-1);
        line-height: 1.8;

        &.main {
          font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
          font-weight: 600;
        }

        .unit-tip {
          font-size: 12px;
          color: var(--text-3);
        }

        &.clickable {
          cursor: pointer;

          &:hover {
            color: var(--el-color-primary);
          }
        }
      }
    }
  }
}
</style>
