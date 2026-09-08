<template>
  <div class="pomodoro-panel">
    <div class="panel-head">
      <span class="panel-title">🍅 番茄钟</span>
      <div class="pomodoro-config">
        <el-select v-model="focusMinutes" size="small" class="config-select" :disabled="isRunning">
          <el-option v-for="m in FOCUS_OPTIONS" :key="m" :label="`专注 ${m} 分`" :value="m" />
        </el-select>
        <el-select v-model="restMinutes" size="small" class="config-select" :disabled="isRunning">
          <el-option v-for="m in REST_OPTIONS" :key="m" :label="`休息 ${m} 分`" :value="m" />
        </el-select>
      </div>
    </div>

    <div class="pomodoro-stage" :class="{ running: isRunning, resting: isResting }">
      <svg class="progress-ring" viewBox="0 0 180 180">
        <circle class="ring-bg" cx="90" cy="90" r="80" />
        <circle
          class="ring-fg"
          cx="90"
          cy="90"
          r="80"
          :stroke-dasharray="RING_LENGTH"
          :stroke-dashoffset="ringOffset"
        />
      </svg>
      <div class="stage-center">
        <div class="pomodoro-time">{{ displayTime }}</div>
        <div class="pomodoro-state">
          {{ isResting ? '休息一下 ☕' : isRunning ? '专注中…' : '准备开始专注' }}
        </div>
        <div class="pomodoro-count">今日完成 {{ doneToday }} 🍅</div>
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';

defineOptions({ name: 'PomodoroPanel' });

const FOCUS_OPTIONS = [15, 25, 45, 60];
const REST_OPTIONS = [5, 10];
const DONE_KEY = 'jg-nav-pomodoro';
const RING_LENGTH = 2 * Math.PI * 80;

const focusMinutes = ref(25);
const restMinutes = ref(5);
const durationMs = ref(25 * 60 * 1000);
const remaining = ref(25 * 60 * 1000);
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

/** 剩余时间占比驱动的环形进度：满环随倒计时消退 */
const ringOffset = computed(
  () => RING_LENGTH * (1 - remaining.value / durationMs.value)
);

// 未运行时调整时长直接生效，暂停中的旧阶段按新时长重来
watch([focusMinutes, restMinutes], () => {
  if (!isRunning.value) {
    isResting.value = false;
    durationMs.value = focusMinutes.value * 60 * 1000;
    remaining.value = durationMs.value;
  }
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

/** 阶段结束的双音提示；浏览器要求用户先交互过才允许出声，失败静默 */
let audioCtx: AudioContext | undefined;

function playChime() {
  try {
    audioCtx ??= new AudioContext();
    if (audioCtx.state === 'suspended') void audioCtx.resume();
    const startAt = audioCtx.currentTime;
    [880, 1174.66].forEach((freq, index) => {
      const at = startAt + index * 0.18;
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.16, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.3);
      osc.connect(gain).connect(audioCtx!.destination);
      osc.start(at);
      osc.stop(at + 0.32);
    });
  } catch {
    /* 无音频权限时静默 */
  }
}

function tick() {
  remaining.value -= 1000;
  if (remaining.value > 0) return;
  // 一段结束：专注→休息，休息→专注
  playChime();
  if (!isResting.value) {
    markDone();
    ElMessage.success(`🍅 专注完成！休息 ${restMinutes.value} 分钟`);
    isResting.value = true;
    durationMs.value = restMinutes.value * 60 * 1000;
    remaining.value = durationMs.value;
  } else {
    ElMessage.info('休息结束，开始新的专注吧');
    isResting.value = false;
    durationMs.value = focusMinutes.value * 60 * 1000;
    remaining.value = durationMs.value;
    isRunning.value = false;
    window.clearInterval(timer);
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
  durationMs.value = focusMinutes.value * 60 * 1000;
  remaining.value = durationMs.value;
}

onMounted(loadDone);
onUnmounted(pause);
</script>

<style lang="scss" scoped>
.pomodoro-panel {
  display: flex;
  flex-direction: column;
  height: 100%;

  .pomodoro-config {
    display: flex;
    gap: 6px;

    .config-select {
      width: 96px;
    }
  }

  .pomodoro-stage {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    background: var(--inner-bg);
    border: 1px solid var(--inner-border);
    margin: 10px 0 14px;
    padding: 18px 0;
    transition: border-color 0.3s ease;

    &.running {
      border-color: rgba(245, 108, 108, 0.55);
    }

    &.resting {
      border-color: rgba(103, 194, 58, 0.55);
    }

    .progress-ring {
      position: absolute;
      width: 172px;
      height: 172px;
      transform: rotate(-90deg);

      circle {
        fill: none;
        stroke-width: 8;
      }

      .ring-bg {
        stroke: var(--inner-border);
      }

      .ring-fg {
        stroke: var(--el-color-danger);
        stroke-linecap: round;
        transition: stroke-dashoffset 0.9s linear;
      }
    }

    &.resting .ring-fg {
      stroke: var(--el-color-success);
    }

    .stage-center {
      display: flex;
      flex-direction: column;
      align-items: center;

      .pomodoro-time {
        font-size: 44px;
        font-weight: 700;
        color: var(--text-1);
        font-variant-numeric: tabular-nums;
        letter-spacing: 2px;
        line-height: 1.1;
      }

      .pomodoro-state {
        margin-top: 2px;
        font-size: 13px;
        color: var(--text-3);
      }

      .pomodoro-count {
        margin-top: 8px;
        font-size: 12px;
        color: var(--text-3);
        padding: 2px 10px;
        border-radius: 999px;
        background: var(--hover-bg);
      }
    }
  }

  .pomodoro-actions {
    display: flex;
    justify-content: center;
    gap: 10px;
  }
}

@media (max-width: 960px) {
  .pomodoro-config {
    flex-direction: column;
  }
}
</style>
