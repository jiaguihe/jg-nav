<template>
  <el-dialog
    :model-value="modelValue"
    :title="mode === 'login' ? '登录' : '注册'"
    width="440"
    @update:model-value="emit('update:modelValue', $event)"
    @closed="resetForm"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      @submit.prevent
    >
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="form.username"
          placeholder="3-10 位字母、数字或下划线"
        />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="至少 6 位，需包含字母和数字"
          show-password
          @keyup.enter="handleSubmit"
        />
      </el-form-item>
    </el-form>

    <div class="privacy-policy">
      <el-checkbox v-model="isAgreed" />
      <span class="policy">
        我已阅读并同意《
        <el-link type="primary" @click.stop.prevent="showPolicy">
          个人信息保护隐私政策
        </el-link>
        》
      </span>
    </div>

    <template #footer>
      <el-button text @click="toggleMode">
        {{ mode === 'login' ? '没有账号？立即注册' : '已有账号？返回登录' }}
      </el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        {{ mode === 'login' ? '登录' : '注册' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '@/stores/user';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

const userStore = useUserStore();
const formRef = ref<FormInstance>();
const loading = ref(false);
const mode = ref<'login' | 'register'>('login');
const isAgreed = ref(false);

const form = reactive({
  username: '',
  password: ''
});

const rules = computed<FormRules>(() => ({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_]{3,10}$/,
      message: '3-10 位字母、数字或下划线',
      trigger: 'blur'
    }
  ],
  password:
    mode.value === 'register'
      ? [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
            message: '密码必须包含字母和数字，并且长度至少为 6 位',
            trigger: 'blur'
          }
        ]
      : [{ required: true, message: '请输入密码', trigger: 'blur' }]
}));

const toggleMode = () => {
  mode.value = mode.value === 'login' ? 'register' : 'login';
  formRef.value?.clearValidate();
};

const resetForm = () => {
  formRef.value?.resetFields();
  mode.value = 'login';
  loading.value = false;
};

const showPolicy = () => {
  ElMessageBox.alert(
    '本服务仅收集你的用户名与密码（密码经 bcrypt 加密存储），不收集其他个人信息。数据仅用于提供网址收藏服务，不向第三方共享。你可以随时通过删除账号的方式注销数据。',
    '个人信息保护隐私政策',
    { confirmButtonText: '我已阅读' }
  ).then(() => (isAgreed.value = true));
};

const handleSubmit = () => {
  if (!isAgreed.value) {
    ElMessage.warning('请先阅读并勾选隐私政策');
    return;
  }
  formRef.value?.validate(async (valid) => {
    if (!valid) return;
    loading.value = true;
    try {
      if (mode.value === 'login') {
        await userStore.login({ ...form });
        ElMessage.success('登录成功');
        emit('update:modelValue', false);
      } else {
        const { register } = await import('@/services/userService');
        await register({ ...form });
        ElMessage.success('注册成功，自动登录中');
        await userStore.login({ ...form });
        emit('update:modelValue', false);
      }
    } finally {
      loading.value = false;
    }
  });
};
</script>

<script lang="ts">
export default { name: 'LoginDialog' };
</script>

<style lang="scss" scoped>
.privacy-policy {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  .policy {
    font-size: 14px;
    color: #606266;
    line-height: 32px;
  }
}
</style>
