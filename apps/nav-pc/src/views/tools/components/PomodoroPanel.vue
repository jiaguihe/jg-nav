<template>
  <div class="pomodoro-panel">
    <div class="panel-head">
      <span class="panel-title">🍅 番茄钟</span>
      <span class="panel-badge">今日完成 {{ doneToday }}</span>
    </div>

    <div class="pomodoro-stage" :class="{ running: isRunning, resting: isResting }">
      <div class="pomodoro-time">{{ displayTime }}</div>
      <div class="pomodoro-state">
        {{ isResting ? '休息一下 ☕' : isRunning ? '专注中…' : '25 分钟专注' }}
      </div>
    </div>

    <div class="pomodoro-actions">
      <el-button v-if="!isRunning" type="primary" round @click="start">
        {{ remaining > 0 && remaining !== durationMs ? '继续' : '开始' }}
      </el-button>
      <el-button v-else round @click="pause">暂停</el-button>
      <el-button round @click="reset">重置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';

defineOptions({ name: 'PomodoroPanel' });

const FOCUS_MS = 25 * 60 * 1000;
const REST_MS = 5 * 60 * 1000;
const DONE_KEY = 'jg-nav-pomodoro';

const durationMs = ref(FOCUS_MS);
const remaining = ref(FOCUS_MS);
const isRunning = ref(false);
const isResting = ref(false);
const doneToday = ref(0);
let timer: number | undefined;

const displayTime = computed(() => {
  const totalSeconds = Math.ceil(remaining.value / 1000);
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const ss = String(totalSeconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
});

function loadDone() {
  const saved = JSON.parse(localStorage.getItem(DONE_KEY) ?? '{}');
  if (saved.date === new Date().toISOString().slice(0, 10)) {
    doneToday.value = saved.count;
  }
}

function markDone() {
  const today = new Date().toISOString().slice(0, 10);
  doneToday.value += 1;
  localStorage.setItem(DONE_KEY, JSON.stringify({ date: today, count: doneToday.value }));
}

function tick() {
  remaining.value -= 1000;
  if (remaining.value > 0) return;
  // 一段结束：专注→休息，休息→专注
  if (!isResting.value) {
    markDone();
    ElMessage.success('🍅 专注完成！休息 5 分钟');
    isResting.value = true;
    durationMs.value = REST_MS;
    remaining.value = REST_MS;
  } else {
    ElMessage.info('休息结束，开始新的专注吧');
    isResting.value = false;
    durationMs.value = FOCUS_MS;
    remaining.value = FOCUS_MS;
    isRunning.value = false;
  }
}

function start() {
  if (isRunning.value) return;
  isRunning.value = true;
  timer = window.setInterval(tick, 1000);
}

function pause() {
  isRunning.value = false;
  window.clearInterval(timer);
}

function reset() {
  pause();
  isResting.value = false;
  durationMs.value = FOCUS_MS;
  remaining.value = FOCUS_MS;
}

onMounted(loadDone);
onUnmounted(pause);
</script>

<style lang="scss" scoped>
.pomodoro-panel {
  display: flex;
  flex-direction: column;
  height: 100%;

  .pomodoro-stage {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    margin: 10px 0 14px;
    transition: border-color 0.3s ease;

    &.running {
      border-color: rgba(245, 108, 108, 0.55);
    }

    &.resting {
      border-color: rgba(103, 194, 58, 0.55);
    }

    .pomodoro-time {
      font-size: 52px;
      font-weight: 700;
      color: var(--text-1);
      font-variant-numeric: tabular-nums;
      letter-spacing: 2px;
    }

    .pomodoro-state {
      margin-top: 4px;
      font-size: 13px;
      color: var(--text-3);
    }
  }

  .pomodoro-actions {
    display: flex;
    justify-content: center;
    gap: 10px;
  }
}
</style>
