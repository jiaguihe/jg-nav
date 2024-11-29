<template>
  <div class="links">
    <div
      class="links-items"
      v-for="link in links"
      :key="link.id"
      @click="handleLink(link.url)"
    >
      <div
        v-show="link.url"
        class="close-button"
        @click.stop="removeLink(link.id)"
      >
        <el-icon><i-ep-Close /></el-icon>
      </div>
      <img
        v-if="link.url"
        :src="getImageSrc(link.url)"
        alt="加载中"
        width="60"
        height="60"
        class="links-img"
        @error="handleImgError"
      />
      <el-icon class="link-plus" v-else><i-ep-Plus /></el-icon>
      <div class="links-des">
        {{ link.description }}
      </div>
    </div>
  </div>
  <el-dialog v-model="dialogVisible" :before-close="handleClose" width="500">
    <template #header>
      <span class="linkdia-title">添加网址</span>
    </template>
    <el-form
      :model="form"
      :rules="rules"
      label-width="auto"
      style="max-width: 600px"
      require-asterisk-position="right"
      label-position="top"
      ref="formRef"
    >
      <el-form-item label="名称" prop="description">
        <el-input v-model="form.description" />
      </el-form-item>
      <el-form-item label="网址" prop="url">
        <el-input v-model="form.url" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button class="footer-login" type="primary" @click="handleAdd">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, reactive } from 'vue';
import { addLink, getAllLinks, removeLinks } from '@/services/linkServices';
import Cookies from 'js-cookie';
import { FormInstance } from 'element-plus';

interface link {
  description: string;
  id: number;
  url: string;
  userId: number;
}

const links = ref<link[]>([]);
const userId = ref<number>();
const dialogVisible = ref(false);
const form = reactive({
  url: '',
  description: '',
  userId: undefined
});
const formRef = ref<FormInstance>();

const rules = reactive({
  description: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
  url: [
    { required: true, message: '网址不能为空', trigger: 'blur' },
    { type: 'url', message: '请输入有效的网址', trigger: ['blur', 'change'] }
  ]
});

const getLinks = () => {
  const userInfoCookie = Cookies.get('userInfo');
  if (userInfoCookie) {
    try {
      const userinfo = JSON.parse(userInfoCookie);
      userId.value = userinfo.id;
      userId.value &&
        getAllLinks(+userId.value)
          .then((response: any) => {
            links.value = response.data;
            links.value.push({
              description: '添加网址',
              id: 0,
              url: '',
              userId: 0
            });
          })
          .catch((error) => {
            console.error('Failed to fetch links:', error);
          });
    } catch (error) {
      console.error('Failed to parse user info cookie:', error);
    }
  }
};

onBeforeMount(() => {
  getLinks();
});

const handleClose = () => {
  formRef.value?.resetFields();
  dialogVisible.value = false;
};

const handleLink = (link: string) => {
  if (link) {
    window.open(link, '_blank');
  } else {
    dialogVisible.value = true;
  }
};

const handleAdd = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      if (!/^http/.test(form.url) && /^www/.test(form.url)) {
        form.url = `http://${form.url}`;
      }
      userId.value &&
        addLink(+userId.value, form.url, form.description).then((res: any) => {
          if (res.code === 0) {
            ElMessage({
              message: '添加成功',
              type: 'success'
            });
            getLinks();
            handleClose();
          }
        });
    } else {
      ElMessage({
        message: '添加失败',
        type: 'error'
      });
    }
  });
};

const handleImgError = (event: Event) => {
  (event.target as HTMLImageElement).src = 'src/assets/default.png';
};

const getImageSrc = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    return `${parsedUrl.origin}/favicon.ico`;
  } catch (error) {
    return 'src/assets/default.png';
  }
};

// 移除链接的方法
const removeLink = (id: number) => {
  removeLinks(id).then((res: any) => {
    if (res.code === 0) {
      ElMessage({
        message: '删除成功',
        type: 'success'
      });
      getLinks();
    }
  });
};
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
}
.linkdia-title {
  font-weight: bold;
}
</style>
