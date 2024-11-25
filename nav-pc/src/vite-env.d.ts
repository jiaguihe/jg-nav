/// <reference types="vite/client" />
declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  const vueComponent: DefineComponent<{}, {}, any>;

  export default vueComponent;
}

declare const __BASE_URL__: string;
declare const ElMessageBox: SFCWithInstall<
  import('./src/message-box.type').IElMessageBox
>;
declare const ElMessage: import('element-plus/es/utils').SFCInstallWithContext<
  import('./src/message').Message
>;
