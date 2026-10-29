<template>
  <div class="auth-panel-form">
    <h3 class="auth-panel-form__title" text-center>
      {{ verifyStep === 1 ? t("login.login") : "双因素认证" }}
    </h3>

    <!-- 第一步：账号密码 -->
    <el-form
      v-if="verifyStep === 1"
      ref="loginFormRef"
      :model="loginFormData"
      :rules="loginRules"
      size="large"
      :validate-on-rule-change="false"
    >
      <el-form-item prop="userCode">
        <el-input v-model.trim="loginFormData.userCode" :placeholder="t('login.username')">
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-tooltip :visible="isCapsLock" :content="t('login.capsLock')" placement="right">
        <el-form-item prop="userPwd">
          <el-input
            v-model.trim="loginFormData.userPwd"
            :placeholder="t('login.password')"
            type="password"
            show-password
            @keyup="checkCapsLock"
            @keyup.enter="handleLoginSubmit"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-tooltip>

      <el-form-item>
        <el-button :loading="loading" type="primary" class="w-full" @click="handleLoginSubmit">
          {{ t("login.login") }}
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 第二步：双因素验证 -->
    <div v-else class="verify-step">
      <el-alert type="info" :closable="false" show-icon class="mb-3" title="已开启双因素认证">
        <p class="m-0 text-xs">
          验证码已发送至 {{ maskedPhone }}（Mock 环境验证码：<b>123456</b>）
        </p>
      </el-alert>

      <el-input
        v-model.trim="verifyCode"
        size="large"
        maxlength="6"
        placeholder="请输入 6 位验证码"
        @keyup.enter="handleVerify"
      >
        <template #prefix>
          <el-icon><Key /></el-icon>
        </template>
      </el-input>

      <div class="flex gap-2 mt-4">
        <el-button class="flex-1" @click="backToStep1">返回</el-button>
        <el-button :loading="loading" type="primary" class="flex-1" @click="handleVerify">
          验证并登录
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance } from "element-plus";
import type { LoginRequest } from "@/types/api/auth";
import router from "@/router";
import { useUserStore } from "@/store";
import { md5 } from "js-md5";

const { t } = useI18n();
const userStore = useUserStore();
const route = useRoute();

const loginFormRef = ref<FormInstance>();
const loading = ref(false);
const isCapsLock = ref(false);

// 1 = 账号密码，2 = 双因素验证
const verifyStep = ref(1);
const verifyCode = ref("");
const verifyFailCount = ref(0);
const lockCountdown = ref(0);

const loginFormData = ref({
  userCode: "",
  userPwd: "",
});

const maskedPhone = computed(() => {
  const code = loginFormData.value.userCode || "13800138000";
  if (/^\d{11}$/.test(code)) {
    return code.slice(0, 3) + "****" + code.slice(7);
  }
  return "138****8000";
});

const loginRules = computed(() => {
  return {
    userCode: [
      { required: true, trigger: "blur", message: t("login.message.username.required") },
    ],
    userPwd: [
      { required: true, trigger: "blur", message: t("login.message.password.required") },
      { min: 6, message: t("login.message.password.min"), trigger: "blur" },
    ],
  };
});

/** 第一步：校验账号密码，进入双因素验证 */
async function handleLoginSubmit() {
  const valid = await loginFormRef.value?.validate().then(
    () => true,
    () => false,
  );
  if (!valid) return;

  // 模拟发送验证码（真实环境调用发送验证码接口）
  verifyFailCount.value = 0;
  verifyCode.value = "";
  verifyStep.value = 2;
  ElMessage.success("验证码已发送");
}

/** 第二步：校验验证码并登录 */
async function handleVerify() {
  if (lockCountdown.value > 0) {
    ElMessage.warning(`已锁定，请 ${lockCountdown.value} 秒后重试`);
    return;
  }
  if (verifyCode.value.length !== 6) {
    ElMessage.warning("请输入 6 位验证码");
    return;
  }
  // Mock 环境固定验证码 123456
  if (verifyCode.value !== "123456") {
    verifyFailCount.value += 1;
    if (verifyFailCount.value >= 3) {
      lockCountdown.value = 15;
      ElMessage.error("连续 3 次验证失败，账户已锁定 15 分钟");
      const timer = setInterval(() => {
        lockCountdown.value -= 1;
        if (lockCountdown.value <= 0) {
          clearInterval(timer);
          verifyFailCount.value = 0;
        }
      }, 1000);
    } else {
      ElMessage.error(`验证码错误，剩余 ${3 - verifyFailCount.value} 次机会`);
    }
    return;
  }

  loading.value = true;
  try {
    const loginOn = Math.floor(Date.now() / 1000);
    const signKey = import.meta.env.VITE_APP_SIGN_KEY ?? "";
    const sign = `userCode=${loginFormData.value.userCode}&&userPwd=${loginFormData.value.userPwd}&&loginOn=${loginOn}&&key=${signKey}`;

    const param: LoginRequest = {
      userCode: loginFormData.value.userCode,
      userPwd: loginFormData.value.userPwd,
      loginOn,
      sign: md5(sign),
    };

    await userStore.login(param);
    const redirectPath = (route.query.redirect as string) || "/";
    await router.push(decodeURIComponent(redirectPath));
  } catch (error: any) {
    ElMessage.error(error?.message || "登录失败");
  } finally {
    loading.value = false;
  }
}

function backToStep1() {
  verifyStep.value = 1;
  verifyCode.value = "";
  verifyFailCount.value = 0;
}

function checkCapsLock(event: KeyboardEvent) {
  if (event instanceof KeyboardEvent) {
    isCapsLock.value = event.getModifierState("CapsLock");
  }
}

const emit = defineEmits(["update:modelValue"]);
function toOtherForm(type: "register" | "resetPwd") {
  emit("update:modelValue", type);
}
</script>

<style lang="scss" scoped>
.auth-panel-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.auth-panel-form__title {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
}

.verify-step {
  .el-input {
    width: 100%;
  }
}
</style>
