<template>
  <el-dialog
    :model-value="modelValue"
    :title="isEdit ? '编辑网址' : '添加网址'"
    width="480"
    @update:model-value="emit('update:modelValue', $event)"
    @open="handleOpen"
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
      <el-form-item label="分组">
        <el-select v-model="form.groupId" placeholder="未分组" clearable>
          <el-option
            v-for="group in groups"
            :key="group.id"
            :label="group.name"
            :value="group.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        确认
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import type {
  CreateLinkDTO,
  LinkGroupVO,
  LinkVO,
  UpdateLinkDTO
} from '@jg/api-types';
import { createLink, updateLink } from '@/services/linkService';

const props = defineProps<{
  modelValue: boolean;
  /** 传入则为编辑模式，否则为新增 */
  link?: LinkVO | null;
  groups: LinkGroupVO[];
}>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

const queryClient = useQueryClient();
const formRef = ref<FormInstance>();
const loading = ref(false);

const isEdit = computed(() => !!props.link);

const form = reactive<CreateLinkDTO>({
  url: '',
  description: '',
  groupId: null
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

const handleOpen = () => {
  form.url = props.link?.url ?? '';
  form.description = props.link?.description ?? '';
  form.groupId = props.link?.groupId ?? null;
};

const saveMutation = useMutation({
  mutationFn: async () => {
    const data = { ...form };
    if (/^www\./.test(data.url)) {
      data.url = `https://${data.url}`;
    }
    if (isEdit.value && props.link) {
      return updateLink(props.link.id, data as UpdateLinkDTO);
    }
    return createLink(data);
  },
  onSuccess: () => {
    ElMessage.success(isEdit.value ? '更新成功' : '添加成功');
    queryClient.invalidateQueries({ queryKey: ['links'] });
    emit('update:modelValue', false);
  }
});

const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (!valid) return;
    loading.value = true;
    saveMutation.mutate(undefined, { onSettled: () => (loading.value = false) });
  });
};
</script>

<style lang="scss" scoped>
.el-select {
  width: 100%;
}
</style>
