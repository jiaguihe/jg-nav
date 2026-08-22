<template>
  <el-dialog
    :model-value="modelValue"
    :title="isEdit ? '修改这笔记录' : '记一笔点单'"
    width="520"
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
      <div class="form-row">
        <el-form-item label="点单日期" prop="orderedAt">
          <el-date-picker
            v-model="form.orderedAt"
            type="date"
            value-format="YYYY-MM-DD"
            :clearable="false"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="实付（元）">
          <el-input-number
            v-model="form.amount"
            :min="0"
            :max="9999"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
      </div>

      <el-form-item label="这次吃了什么">
        <el-input v-model="form.items" placeholder="例如：黄焖鸡大份 + 米饭 + 可乐" maxlength="500" />
      </el-form-item>

      <el-form-item label="这次评分" prop="score">
        <el-rate
          v-model="form.score"
          :texts="['踩大雷', '不行', '一般', '不错', '好吃!']"
          show-text
        />
      </el-form-item>

      <el-form-item label="一句话点评">
        <el-input
          v-model="form.note"
          type="textarea"
          :rows="2"
          maxlength="500"
          show-word-limit
          placeholder="这次的感受：分量？味道？送得快不快？"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        保存
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import dayjs from 'dayjs';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import type { TakeawayOrderVO } from '@jg/api-types';
import { createOrder, updateOrder } from '@/services/takeawayService';

const props = defineProps<{
  modelValue: boolean;
  shopId: number;
  /** 传入则为编辑模式 */
  order?: TakeawayOrderVO | null;
}>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

const queryClient = useQueryClient();
const formRef = ref<FormInstance>();
const loading = ref(false);

const isEdit = computed(() => !!props.order);

const form = reactive({
  orderedAt: dayjs().format('YYYY-MM-DD'),
  items: '',
  amount: 0,
  score: 4,
  note: ''
});

const rules: FormRules = {
  orderedAt: [{ required: true, message: '请选择日期', trigger: 'change' }],
  score: [{ required: true, message: '打个分吧', trigger: 'change' }]
};

function handleOpen() {
  form.orderedAt = props.order?.orderedAt ?? dayjs().format('YYYY-MM-DD');
  form.items = props.order?.items ?? '';
  form.amount = props.order ? Number(props.order.amount) : 0;
  form.score = props.order?.score ?? 4;
  form.note = props.order?.note ?? '';
}

const saveMutation = useMutation({
  mutationFn: () => {
    const data = {
      orderedAt: form.orderedAt,
      items: form.items.trim(),
      amount: form.amount,
      score: form.score,
      note: form.note.trim()
    };
    return isEdit.value && props.order
      ? updateOrder(props.order.id, data)
      : createOrder({ shopId: props.shopId, ...data });
  },
  onSuccess: () => {
    ElMessage.success(isEdit.value ? '更新成功' : '记好了');
    queryClient.invalidateQueries({ queryKey: ['shops'] });
    queryClient.invalidateQueries({ queryKey: ['orders', props.shopId] });
    emit('update:modelValue', false);
  }
});

const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (!valid) return;
    loading.value = true;
    saveMutation.mutate(undefined, {
      onSettled: () => (loading.value = false)
    });
  });
};
</script>

<style lang="scss" scoped>
.form-row {
  display: flex;
  gap: 16px;

  .el-form-item {
    flex: 1;
  }
}
</style>
