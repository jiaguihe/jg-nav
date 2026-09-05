import { ElMessage } from 'element-plus';

/**
 * 复制文本到剪贴板：优先 Clipboard API，http 环境回退 execCommand
 */
export async function copyText(text: string, tip = '已复制'): Promise<void> {
  if (!text) {
    ElMessage.warning('没有可复制的内容');
    return;
  }
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    ElMessage.success(tip);
  } catch {
    ElMessage.error('复制失败，请手动复制');
  }
}
