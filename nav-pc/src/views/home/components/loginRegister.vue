<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="updateVisible"
    :before-close="handleClose"
    width="600"
  >
    <template #header>
      <div class="custom-header">
        <span class="header-title">{{ title }}</span>
      </div>
    </template>
    <div class="form-area">
      <el-form
        ref="formRef"
        :model="form"
        label-width="auto"
        require-asterisk-position="right"
        class="form"
        :rules="rules"
      >
        <el-form-item label="用户名" prop="username">
          <el-input placeholder="请输入用户名" v-model="form.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            placeholder="请输入密码"
            type="password"
            v-model="form.password"
          />
        </el-form-item>
      </el-form>
      <el-divider direction="vertical" class="divider" />
      <div class="scan-code-img">
        <vue-qrcode
          :value="qrCode.qrCodeValue"
          :width="qrCode.qrCodeSize"
          :color="{
            dark: qrCode.qrCodeDarkColor,
            light: qrCode.qrCodeLightColor
          }"
          type="image/png"
        ></vue-qrcode>
        <div
          class="overlay"
          id="overlay"
          v-show="!isAgreed"
          @click="qrcodemsg()"
        >
          <div class="qrcodeTips">
            <p class="qrcodeTipsText">请先勾选</p>
            <p class="qrcodeTipsText">个人信息保护隐私政策</p>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">立即注册</el-button>
        <el-button class="footer-login" type="primary" @click="handleConfirm">
          登录
        </el-button>
      </div>
      <div class="privacy-policy">
        <el-popover
          :visible="showPop && !isAgreed"
          placement="left"
          trigger="hover"
          content="请阅读并勾选"
        >
          <template #reference>
            <el-checkbox
              v-model="isAgreed"
              :disabled="false"
              @click="showPop = false"
            />
          </template>
        </el-popover>
        <span class="policy">
          我已阅读并同意《
          <el-Link class="policy-link" @click.stop.prevent="showPrivacyPolicy">
            个人信息保护隐私政策
          </el-Link>
          》
        </span>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { login, register } from '@/services/userService';
import { FormInstance, FormRules } from 'element-plus';
import { reactive, ref } from 'vue';

interface RuleForm {
  username: string;
  password: string;
}

defineProps({
  title: { type: String, required: true },
  visible: { type: Boolean, required: true }
});
const isAgreed = ref(false);
const showPop = ref(false);
const form = reactive({
  username: '',
  password: ''
});
const rules = reactive<FormRules<RuleForm>>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    {
      min: 3,
      max: 10,
      message: '用户名长度应为 3 到 10 个字符',
      trigger: 'blur'
    },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: '用户名只能包含字母、数字或下划线',
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于 6 个字符', trigger: 'blur' },
    {
      pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
      message: '密码必须包含字母和数字，并且长度至少为 6 位',
      trigger: 'blur'
    }
  ]
});
const qrCode = reactive({
  qrCodeValue: 'http://localhost:4000/api',
  qrCodeSize: 150,
  qrCodeDarkColor: '#000',
  qrCodeLightColor: '#FFF'
});
const formRef = ref<FormInstance>();

const qrcodemsg = () => {};

const showPrivacyPolicy = () => {
  ElMessageBox.confirm(
    `
      欢迎您使用我们的服务。本隐私政策旨在帮助您了解我们如何收集、使用、保护您的个人信息。请您在使用本服务之前，认真阅读本隐私政策。

      1. 我们收集的信息
        - 我们收集您提供的信息，例如：姓名、电话号码、电子邮件地址等。
        - 我们通过Cookies和其他技术收集您使用服务时的自动信息，如IP地址、设备类型、浏览历史等。

      2. 我们如何使用信息
        - 我们使用您的个人信息来提供和改进我们的服务，处理您的订单，发送通知等。
        - 我们可能会将您的信息用于个性化广告推荐，分析用户行为，或根据您的需求提供定制化内容。

      3. 信息的共享与披露
        - 我们不会将您的个人信息出售给第三方，但可能会与合作伙伴共享信息以提供服务（例如支付处理、物流配送等）。
        - 如法律要求或有必要保护我们的合法权益，我们可能会披露您的信息。

      4. 信息的安全
        - 我们采取严格的安全措施来保护您的个人信息免遭未经授权的访问、泄露或修改。您的信息存储在安全的服务器中。

      5. 您的权利
        - 您有权访问、更正或删除您的个人信息。如果您希望行使这些权利，请联系我们的客服。

      6. Cookies的使用
        - 我们使用Cookies来提高您的用户体验，您可以通过浏览器设置管理您的Cookies。

      7. 未成年人的信息
        - 如果您未满18岁，请在父母或监护人指导下使用我们的服务，我们不会故意收集未成年人的个人信息。

      8. 隐私政策更新
        - 本隐私政策可能会定期更新，更新后的政策会在本页面公布，更新内容会明确注明生效日期。
    `,
    '个人信息保护隐私政策',
    {
      confirmButtonText: '我已阅读并同意',
      cancelButtonText: '取消'
    }
  )
    .then(() => {
      isAgreed.value = true;
    })
    .catch(() => {});
};

// 定义 Emits
const emit = defineEmits(['update:visible', 'update:cookie']);

// 关闭前的处理
const handleClose = (done: Function) => {
  console.log('Dialog is closing');
  done();
};

// 更新对话框可见性
const updateVisible = (newVisible: boolean) => {
  emit('update:visible', newVisible); // 通知父组件更新 visible 状态
};

// 注册按钮点击处理
const handleCancel = () => {
  formRef.value?.validate((valid) => {
    if (!isAgreed.value) {
      showPop.value = true;
    } else {
      if (valid) {
        register(form).then((res: any) => {
          if (res.code === 0) {
            ElMessage({
              message: res.message,
              type: 'success'
            });
          }
        });
      }
    }
  });
};

// 确认按钮点击处理
const handleConfirm = () => {
  formRef.value?.validate((valid) => {
    if (!isAgreed.value) {
      showPop.value = true;
    } else {
      if (valid) {
        login(form).then((res: any) => {
          if (res.code === 0) {
            ElMessage({
              message: '登录成功',
              type: 'success'
            });
            localStorage.setItem('token', res.data.token);
            emit('update:cookie');
            emit('update:visible', false); // 关闭对话框
          }
        });
      }
    }
  });
};
</script>

<style lang="scss" scoped>
.form-area {
  display: flex;
  width: 100%;
  align-items: center;
  .form {
    padding: 0 10px 0 20px;
    width: 63%;
  }
}
.divider {
  height: 150px;
}

.header-title {
  font-size: 20px;
  font-weight: bold;
}
.dialog-footer {
  display: flex;
  justify-content: center;
  width: 75%;
  .footer-login {
    padding: 0 29px;
  }
}
.privacy-policy {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  .policy {
    margin-left: 5px;
    font-size: 14px;
    color: #606266;
    line-height: 32px;
  }
}

.scan-code-img {
  position: relative;
  width: 150px;
  height: 150px;
  margin-left: 10px;
  .overlay {
    // display: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    color: #ddd;
    font-weight: bold;
    cursor: pointer;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 5px;
    z-index: 9999;
    .qrcodeTips {
      text-align: center;
    }
    .qrcodeTipsText {
      display: block;
      margin: 0;
    }
  }
}
</style>
