<template>
  <el-dialog
    :model-value="modelValue"
    title="添加网址"
    width="480"
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
      <el-form-item label="名称" prop="description">
        <el-input v-model="form.description" placeholder="例如：GitHub" />
      </el-form-item>
      <el-form-item label="网址" prop="url">
        <el-input v-model="form.url" placeholder="https://github.com" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleAdd">
        确认
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import type { CreateLinkDTO } from '@jg/api-types';
import { createLink } from '@/services/linkService';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

const queryClient = useQueryClient();
const formRef = ref<FormInstance>();
const loading = ref(false);

const form = reactive<CreateLinkDTO>({
  url: '',
  description: ''
});

const rules: FormRules = {
  description: [
    { required: true, message: '名称不能为空', trigger: 'blur' },
    { max: 30, message: '名称不能超过 30 个字符', trigger: 'blur' }
  ],
  url: [
    { required: true, message: '网址不能为空', trigger: 'blur' },
    { type: 'url', message: '请输入有效的网址', trigger: ['blur', 'change'] }
  ]
};

const addMutation = useMutation({
  mutationFn: (data: CreateLinkDTO) => createLink(data),
  onSuccess: () => {
    ElMessage.success('添加成功');
    queryClient.invalidateQueries({ queryKey: ['links'] });
    emit('update:modelValue', false);
  }
});

const resetForm = () => formRef.value?.resetFields();

const handleAdd = () => {
  formRef.value?.validate((valid) => {
    if (!valid) return;
    loading.value = true;
    // www 开头自动补协议，后端 IsUrl 校验要求完整 URL
    const data = { ...form };
    if (/^www\./.test(data.url)) {
      data.url = `https://${data.url}`;
    }
    addMutation.mutate(data);
    loading.value = false;
  });
};
</script>

<script lang="ts">
export default { name: 'LinkEditDialog' };
</script>

<style lang="scss" scoped></style>
