<template>
  <div class="login-form">
    <!-- 第一步：账号密码 -->
    <template v-if="verifyStep === 1">
      <div class="login-form__heading">
        <h2 class="login-form__title">{{ t("login.login") }}</h2>
        <p class="login-form__subtitle">{{ t("login.subtitle") }}</p>
      </div>

      <el-form
        ref="loginFormRef"
        class="login-form__body"
        :model="loginFormData"
        :rules="loginRules"
        size="large"
        :validate-on-rule-change="false"
      >
        <div class="field-group">
          <label class="field-label" for="login-user-code">{{ t("login.account") }}</label>
          <el-form-item class="field-control" prop="userCode">
            <el-input
              id="login-user-code"
              v-model.trim="loginFormData.userCode"
              :placeholder="t('login.accountPlaceholder')"
              autocomplete="username"
              @keyup.enter="handleLoginSubmit"
            />
          </el-form-item>
        </div>

        <div class="field-group">
          <label class="field-label" for="login-user-pwd">{{ t("login.password") }}</label>
          <el-tooltip :visible="isCapsLock" :content="t('login.capsLock')" placement="right">
            <el-form-item class="field-control" prop="userPwd">
              <el-input
                id="login-user-pwd"
                v-model.trim="loginFormData.userPwd"
                :placeholder="t('login.passwordPlaceholder')"
                type="password"
                show-password
                autocomplete="current-password"
                @keyup="checkCapsLock"
                @keyup.enter="handleLoginSubmit"
              />
            </el-form-item>
          </el-tooltip>
        </div>

        <el-button :loading="loading" type="primary" @click="handleLoginSubmit">
          {{ t("login.login") }}
        </el-button>

        <p class="login-form__help">{{ t("login.help") }}</p>
      </el-form>
    </template>

    <!-- 第二步：双因素验证 -->
    <template v-else>
      <div class="login-form__heading">
        <h2 class="login-form__title">{{ t("login.twoFactor") }}</h2>
        <p class="login-form__subtitle">
          验证码已发送至 {{ maskedPhone }}（Mock 环境验证码：<b>123456</b>）
        </p>
      </div>

      <div class="login-form__body">
        <div class="field-group">
          <label class="field-label" for="login-verify-code">{{ t("login.verifyCode") }}</label>
          <el-input
            id="login-verify-code"
            v-model.trim="verifyCode"
            maxlength="6"
            :placeholder="t('login.verifyCodePlaceholder')"
            autocomplete="one-time-code"
            @keyup.enter="handleVerify"
          />
        </div>

        <div class="login-form__actions">
          <el-button class="login-form__ghost" @click="backToStep1">
            {{ t("login.back") }}
          </el-button>
          <el-button :loading="loading" type="primary" @click="handleVerify">
            {{ t("login.verifyAndLogin") }}
          </el-button>
        </div>
      </div>
    </template>
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
    userCode: [{ required: true, trigger: "blur", message: t("login.message.username.required") }],
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
.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: flex-start;
  width: 100%;
}

.login-form__heading {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  width: 100%;
}

.login-form__title {
  width: 100%;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  line-height: normal;
  color: var(--brand-text);
  text-align: left;
}

.login-form__subtitle {
  width: 100%;
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  line-height: normal;
  color: var(--brand-text-sub);
  text-align: left;

  b {
    font-weight: 600;
    color: var(--brand-text);
  }
}

.login-form__body {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: flex-start;
  width: 100%;
}

.login-form__help {
  width: 100%;
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  line-height: normal;
  color: var(--brand-text-sub);
  text-align: center;
}

.login-form__actions {
  display: flex;
  gap: 16px;
  align-items: center;
  width: 100%;
}

.login-form__actions .login-form__ghost {
  color: var(--brand-text);
  background-color: var(--brand-mint);

  &:hover,
  &:focus {
    color: var(--brand-text);
    background-color: var(--brand-border);
  }
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  width: 100%;
}

.field-label {
  width: 100%;
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  line-height: normal;
  color: var(--brand-text);
  text-align: left;
}

/* 标签与输入框已由 .field-group 的 gap 控制间距 */
.field-control {
  width: 100%;
  margin-bottom: 0;
}
</style>
