<template>
  <div class="img-panel">
    <div class="panel-head">
      <span class="panel-title">🖼️ 图片下载</span>
    </div>

    <el-input
      v-model="imageUrl"
      class="img-url"
      placeholder="输入图片地址，如 https://example.com/a.jpg"
      clearable
      @keydown.enter="download"
    >
      <template #append>
        <el-button @click="openInNewTab">新窗口打开</el-button>
      </template>
    </el-input>

    <div class="img-preview">
      <img
        v-if="imageUrl.trim() && !previewError"
        :key="imageUrl"
        :src="imageUrl.trim()"
        referrerpolicy="no-referrer"
        alt="图片预览"
        @error="previewError = true"
      />
      <div v-else class="preview-empty">输入地址后这里显示预览</div>
      <div v-if="previewError" class="preview-failed">预览加载失败（地址无效或防盗链），仍可尝试下载</div>
    </div>

    <div class="img-actions">
      <el-input
        v-model="filename"
        class="img-name"
        placeholder="保存文件名（留空自动取 URL 名称）"
        clearable
      />
      <el-button type="primary" round :loading="downloading" @click="download">下载图片</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';

defineOptions({ name: 'ImageDownloadPanel' });

const imageUrl = ref('');
const filename = ref('');
const downloading = ref(false);
const previewError = ref(false);

// 地址变化时重置预览状态，避免上一次的失败提示残留
watch(imageUrl, () => {
  previewError.value = false;
});

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'image/avif': '.avif',
  'image/bmp': '.bmp',
  'image/x-icon': '.ico'
};

/** 从 URL 推导保存文件名，扩展名缺失时按响应类型补齐 */
function resolveName(contentType: string): string {
  let name = filename.value.trim();
  if (!name) {
    try {
      const pathname = new URL(imageUrl.value.trim(), window.location.href).pathname;
      name = decodeURIComponent(pathname.split('/').filter(Boolean).pop() ?? 'image');
    } catch {
      name = 'image';
    }
  }
  name = name.replace(/[\\/:*?"<>|]/g, '_');
  const hasExt = /\.[a-z0-9]{2,5}$/i.test(name);
  if (!hasExt) {
    const mime = contentType.split(';')[0].trim().toLowerCase();
    name += EXT_BY_MIME[mime] ?? '.png';
  }
  return name;
}

function triggerSave(href: string, name: string) {
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

async function download() {
  const url = imageUrl.value.trim();
  if (!url) {
    ElMessage.warning('请先输入图片地址');
    return;
  }
  downloading.value = true;
  try {
    // blob 方式：跨域图片在允许 CORS 时可真正保存（no-referrer 同时绕过部分防盗链）
    const response = await fetch(url, { referrerPolicy: 'no-referrer' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    if (!blob.type.startsWith('image/')) {
      ElMessage.warning('响应不是图片类型，请确认地址指向图片文件');
    }
    triggerSave(URL.createObjectURL(blob), resolveName(blob.type));
    ElMessage.success('已开始下载');
  } catch {
    // 跨域被拒等场景兜底：交给浏览器直接处理（同源生效，跨域可能仅打开图片）
    triggerSave(url, resolveName(''));
    ElMessage.info('已尝试直接下载；若只打开了图片，请在新页面右键另存为');
  } finally {
    downloading.value = false;
  }
}

function openInNewTab() {
  const url = imageUrl.value.trim();
  if (!url) return ElMessage.warning('请先输入图片地址');
  window.open(url, '_blank', 'noopener');
}
</script>

<style lang="scss" scoped>
.img-panel {
  display: flex;
  flex-direction: column;
  height: 100%;

  .img-url {
    margin: 10px 0;
  }

  .img-preview {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 140px;
    margin-bottom: 12px;
    padding: 8px;
    border-radius: 12px;
    background: var(--inner-bg);
    border: 1px solid var(--inner-border);
    overflow: hidden;

    img {
      max-width: 100%;
      max-height: 220px;
      object-fit: contain;
      border-radius: 8px;
    }

    .preview-empty,
    .preview-failed {
      font-size: 13px;
      color: var(--text-3);
    }

    .preview-failed {
      color: var(--el-color-warning);
    }
  }

  .img-actions {
    display: flex;
    gap: 10px;

    .img-name {
      flex: 1;
    }
  }
}
</style>
