<template>
  <div class="links">
    <template v-if="userStore.user">
      <div
        v-for="link in links"
        :key="link.id"
        class="links-items"
        @click="openLink(link.url)"
      >
        <div class="close-button" @click.stop="confirmRemove(link.id)">
          <el-icon><Close /></el-icon>
        </div>
        <img
          :src="faviconOf(link.url)"
          alt=""
          width="60"
          height="60"
          class="links-img"
          @error="onImgError"
        />
        <div class="links-des">{{ link.description }}</div>
      </div>

      <div class="links-items" @click="addVisible = true">
        <el-icon class="link-plus"><Plus /></el-icon>
        <div class="links-des">添加网址</div>
      </div>
    </template>

    <div v-else class="links-empty">
      <el-link :underline="false" @click="emit('open-login')">
        登录后管理你的网址收藏
      </el-link>
    </div>
  </div>

  <LinkEditDialog v-model="addVisible" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Close, Plus } from '@element-plus/icons-vue';
import { fetchLinks, removeLink } from '@/services/linkService';
import { useUserStore } from '@/stores/user';
import LinkEditDialog from './linkEditDialog.vue';
import defaultImg from '@/assets/default.png';

const emit = defineEmits<{ 'open-login': [] }>();
const userStore = useUserStore();
const queryClient = useQueryClient();
const addVisible = ref(false);

// 登录后自动拉取收藏，增删后自动刷新（TanStack Query 管理缓存与失效）
const enabled = computed(() => !!userStore.user);
const userId = computed(() => userStore.user?.id ?? 0);
const { data: links } = useQuery({
  queryKey: ['links', userId],
  queryFn: fetchLinks,
  enabled
});

const removeMutation = useMutation({
  mutationFn: removeLink,
  onSuccess: () => {
    ElMessage.success('删除成功');
    queryClient.invalidateQueries({ queryKey: ['links'] });
  }
});

const confirmRemove = (id: number) => {
  ElMessageBox.confirm('确定删除该收藏吗？', '提示', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  }).then(() => removeMutation.mutate(id));
};

const openLink = (url: string) => window.open(url, '_blank');

const faviconOf = (url: string) => {
  try {
    return `${new URL(url).origin}/favicon.ico`;
  } catch {
    return defaultImg;
  }
};

const onImgError = (e: Event) => {
  (e.target as HTMLImageElement).src = defaultImg;
};
</script>

<script lang="ts">
export default { name: 'ShowLinks' };
</script>

<style lang="scss" scoped>
.links {
  display: flex;
  margin-top: 20vh;
  gap: 20px;
  flex-wrap: wrap;
  padding: 0 20vw;

  .links-items {
    cursor: pointer;
    padding: 5px;
    border-radius: 5px;
    position: relative;

    &:hover {
      background-color: #92c2f3;

      .close-button {
        display: block;
      }
    }

    .close-button {
      position: absolute;
      top: 0;
      right: 0;
      border-radius: 3px;
      cursor: pointer;
      z-index: 10;
      display: none;
      background-color: #fff;

      &:hover {
        color: #409eff;
      }
    }

    .links-img {
      display: block;
    }

    .links-des {
      display: block;
      text-align: center;
      font-size: 14px;
      color: #fff;
    }

    .link-plus {
      width: 60px;
      height: 60px;
      background-color: #f3f3f3;
      border-radius: 5px;
    }
  }

  .links-empty {
    width: 100%;
    text-align: center;

    .el-link {
      color: #fff;
      font-size: 16px;
    }
  }
}
</style>
