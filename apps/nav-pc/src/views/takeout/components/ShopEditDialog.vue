<template>
  <el-dialog
    :model-value="modelValue"
    :title="isEdit ? '编辑店铺' : '记一家店'"
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
      <el-form-item label="店名" prop="name">
        <el-input v-model="form.name" placeholder="例如：张记黄焖鸡（XX店）" />
      </el-form-item>

      <div class="form-row">
        <el-form-item label="平台">
          <el-select v-model="form.platform">
            <el-option
              v-for="opt in PLATFORM_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="整体印象分">
          <el-rate
            v-model="form.score"
            :texts="['踩大雷', '不行', '一般', '不错', '好吃!']"
            show-text
          />
        </el-form-item>
      </div>

      <el-form-item label="分类（可选）">
        <el-input v-model="form.category" placeholder="例如：快餐 / 奶茶 / 火锅" maxlength="30" />
      </el-form-item>

      <el-form-item label="标签">
        <div class="tag-select">
          <button
            v-for="opt in SHOP_TAG_OPTIONS"
            :key="opt.value"
            type="button"
            class="tag-option"
            :class="{ selected: selectedTags.includes(opt.value as ShopTag) }"
            @click="toggleTag(opt.value as ShopTag)"
          >
            {{ opt.label }}
          </button>
        </div>
      </el-form-item>

      <el-form-item label="备注（可选）">
        <el-input
          v-model="form.remark"
          type="textarea"
          :rows="2"
          maxlength="500"
          show-word-limit
          placeholder="招牌菜、避雷提示、起送价……随便记"
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
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import type {
  ShopTag,
  TakeawayPlatform,
  TakeawayShopVO
} from '@jg/api-types';
import { createShop, updateShop } from '@/services/takeawayService';
import {
  PLATFORM_OPTIONS,
  SHOP_TAG_OPTIONS
} from '@/constants/takeaway';

const props = defineProps<{
  modelValue: boolean;
  shop?: TakeawayShopVO | null;
}>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

const queryClient = useQueryClient();
const formRef = ref<FormInstance>();
const loading = ref(false);

const isEdit = computed(() => !!props.shop);

const form = reactive({
  name: '',
  platform: 'other' as TakeawayPlatform,
  category: '',
  score: 3,
  remark: ''
});
const selectedTags = ref<ShopTag[]>([]);

const rules: FormRules = {
  name: [
    { required: true, message: '店名不能为空', trigger: 'blur' },
    { max: 50, message: '店名不能超过 50 个字符', trigger: 'blur' }
  ]
};

function toggleTag(tag: ShopTag) {
  const index = selectedTags.value.indexOf(tag);
  if (index >= 0) {
    selectedTags.value.splice(index, 1);
  } else {
    selectedTags.value.push(tag);
  }
}

function handleOpen() {
  form.name = props.shop?.name ?? '';
  form.platform = props.shop?.platform ?? 'other';
  form.category = props.shop?.category ?? '';
  form.score = props.shop?.score ?? 3;
  form.remark = props.shop?.remark ?? '';
  selectedTags.value = props.shop ? [...props.shop.tags] : [];
}

const saveMutation = useMutation({
  mutationFn: () => {
    const data = {
      name: form.name.trim(),
      platform: form.platform,
      category: form.category.trim(),
      score: form.score,
      tags: [...selectedTags.value],
      remark: form.remark.trim()
    };
    return isEdit.value && props.shop
      ? updateShop(props.shop.id, data)
      : createShop(data);
  },
  onSuccess: () => {
    ElMessage.success(isEdit.value ? '更新成功' : '已记录');
    queryClient.invalidateQueries({ queryKey: ['shops'] });
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

.el-select {
  width: 100%;
}

.tag-select {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  .tag-option {
    padding: 6px 14px;
    border-radius: 10px;
    border: 1px solid var(--inner-border);
    background: transparent;
    color: var(--text-2);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--accent);
      color: var(--text-1);
    }

    &.selected {
      background: var(--accent);
      border-color: var(--accent);
      color: #fff;
    }
  }
}
</style>
