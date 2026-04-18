<template>
  <el-dialog
    v-model="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="!loading"
    :show-close="false"
    :width="880"
    class="xh-login-dialog"
    align-center
    destroy-on-close
    @closed="handleClosed"
  >
    <div class="xh-login">
      <!-- 左侧视觉区 -->
      <aside class="xh-login__visual">
        <!-- 背景粒子网格 -->
        <div class="xh-login__grid" aria-hidden="true" />
        <!-- 柔光斑点 -->
        <div class="xh-login__glow xh-login__glow--1" aria-hidden="true" />
        <div class="xh-login__glow xh-login__glow--2" aria-hidden="true" />

        <!-- 顶部品牌 -->
        <header class="xh-login__brand">
          <div class="xh-login__logo">
            <el-image :src="logo" class="xh-login__logo-img" />
          </div>
          <div>
            <div class="xh-login__brand-zh">宣海科技</div>
            <div class="xh-login__brand-en">MEDICAL STATISTICS PLATFORM</div>
          </div>
        </header>

        <!-- 心电图波形（精细、白色透明，更融入主色背景） -->
        <div class="xh-login__ecg" aria-hidden="true">
          <svg viewBox="0 0 400 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="xh-ecg-line" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
                <stop offset="50%" stop-color="#ffffff" stop-opacity="0.7" />
                <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="60" x2="400" y2="60" stroke="rgba(255,255,255,0.06)" stroke-dasharray="2 6" />
            <path
              class="xh-login__ecg-path"
              d="M 0 60 L 80 60 L 95 60 L 105 52 L 115 72 L 125 24 L 135 92 L 145 56 L 160 60 L 230 60 L 245 60 L 255 52 L 265 72 L 275 24 L 285 92 L 295 56 L 310 60 L 400 60"
              fill="none"
              stroke="url(#xh-ecg-line)"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <!-- 标语（主视觉） -->
        <div class="xh-login__slogan">
          <div class="xh-login__tag">
            <span class="xh-login__tag-dot" />
            Enterprise Ready
          </div>
          <h2 class="xh-login__title">
            严谨统计<br />
            <span class="xh-login__title-accent">精准医学</span>
          </h2>
          <p class="xh-login__subtitle">
            专业的临床试验与医学统计工具集，<br />为循证研究提供可靠的量化依据。
          </p>
        </div>

        <!-- 底部：统计数字 + 版权（同一区域，一行呈现） -->
        <footer class="xh-login__footer">
          <div class="xh-login__stats">
            <div class="xh-login__stat">
              <div class="xh-login__stat-num">6</div>
              <div class="xh-login__stat-label">样本量算法</div>
            </div>
            <div class="xh-login__stat-sep" aria-hidden="true" />
            <div class="xh-login__stat">
              <div class="xh-login__stat-num">5</div>
              <div class="xh-login__stat-label">随机化方案</div>
            </div>
            <div class="xh-login__stat-sep" aria-hidden="true" />
            <div class="xh-login__stat">
              <div class="xh-login__stat-num">∞</div>
              <div class="xh-login__stat-label">统计分析</div>
            </div>
          </div>
          <div class="xh-login__copyright">
            © 2021 – {{ new Date().getFullYear() }} 宣海科技
          </div>
        </footer>
      </aside>

      <!-- 右侧表单区 -->
      <section class="xh-login__form">
        <button class="xh-login__close" :disabled="loading" @click="visible = false" aria-label="关闭">
          <el-icon :size="18"><Close /></el-icon>
        </button>

        <div class="xh-login__form-header">
          <div class="xh-login__eyebrow">Welcome Back</div>
          <h3 class="xh-login__form-title">登录账户</h3>
          <p class="xh-login__form-desc">
            请使用管理员分配的账号进入系统，
            <br />继续您的数据分析工作。
          </p>
        </div>

        <el-form
          ref="loginFormRef"
          :model="loginFormData"
          :rules="loginRules"
          size="large"
          :validate-on-rule-change="false"
          class="xh-login__form-body"
          @keyup.enter="handleLoginSubmit"
        >
          <el-form-item prop="userCode">
            <template #label>
              <span class="xh-login__label">账号</span>
            </template>
            <el-input
              v-model.trim="loginFormData.userCode"
              placeholder="请输入您的账号"
              clearable
              class="xh-login__input"
            >
              <template #prefix>
                <el-icon class="xh-login__input-icon"><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-tooltip :visible="isCapsLock" content="大写锁定已开启" placement="right">
            <el-form-item prop="userPwd">
              <template #label>
                <span class="xh-login__label">密码</span>
              </template>
              <el-input
                v-model.trim="loginFormData.userPwd"
                placeholder="请输入密码"
                type="password"
                show-password
                class="xh-login__input"
                @keyup="checkCapsLock"
              >
                <template #prefix>
                  <el-icon class="xh-login__input-icon"><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-tooltip>

          <div class="xh-login__actions">
            <button
              type="button"
              class="xh-login__submit"
              :class="{ 'is-loading': loading }"
              :disabled="loading"
              @click="handleLoginSubmit"
            >
              <span class="xh-login__submit-inner">
                <span v-if="!loading">登 录</span>
                <span v-else class="xh-login__loading-dots">
                  <span /><span /><span />
                </span>
              </span>
              <span class="xh-login__submit-shimmer" aria-hidden="true" />
            </button>
          </div>
        </el-form>

        <div class="xh-login__footer-meta">
          <span class="xh-login__footer-line" />
          <span class="xh-login__footer-text">
            <el-icon :size="12"><Lock /></el-icon>
            SSL 加密 &nbsp;·&nbsp; 合规审计 &nbsp;·&nbsp; 7×24 运维保障
          </span>
          <span class="xh-login__footer-line" />
        </div>
      </section>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import type { FormInstance } from "element-plus";
import type { LoginRequest } from "@/types/api/auth";
import { useUserStore, usePermissionStore } from "@/store";
import logo from "@/assets/images/logo.png";
import md5Module from "js-md5";

const md5 = (md5Module as any).default || md5Module;

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: "update:modelValue", v: boolean): void; (e: "success"): void }>();

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const userStore = useUserStore();
const permissionStore = usePermissionStore();

const loginFormRef = ref<FormInstance>();
const loading = ref(false);
const isCapsLock = ref(false);

const loginFormData = ref({ userCode: "", userPwd: "" });

const loginRules = {
  userCode: [{ required: true, trigger: "blur", message: "请输入账号" }],
  userPwd: [
    { required: true, trigger: "blur", message: "请输入密码" },
    { min: 6, trigger: "blur", message: "密码长度至少 6 位" },
  ],
};

async function handleLoginSubmit() {
  const valid = await loginFormRef.value?.validate().then(() => true, () => false);
  if (!valid) return;
  loading.value = true;
  try {
    const loginOn = Math.floor(Date.now() / 1000);
    const sign = `userCode=${loginFormData.value.userCode}&&userPwd=${loginFormData.value.userPwd}&&loginOn=${loginOn}&&key=xhedc_jiangbo_wangshuang_123!@#`;
    const param: LoginRequest = {
      userCode: loginFormData.value.userCode,
      userPwd: loginFormData.value.userPwd,
      loginOn,
      sign: md5(sign),
    };
    await userStore.login(param);
    ElMessage.success("登录成功");
    try {
      await permissionStore.reloadDynamicRoutesOnce();
    } catch {
      // 本地模式下动态路由为空，忽略
    }
    visible.value = false;
    emit("success");
  } catch (error: any) {
    ElMessage.error(error?.message || "登录失败");
  } finally {
    loading.value = false;
  }
}

function checkCapsLock(event: KeyboardEvent) {
  if (event instanceof KeyboardEvent) {
    isCapsLock.value = event.getModifierState("CapsLock");
  }
}

function handleClosed() {
  loginFormRef.value?.resetFields();
  loginFormData.value = { userCode: "", userPwd: "" };
  isCapsLock.value = false;
}
</script>

<style lang="scss" scoped>
/* ==========================================================================
   宣海科技 · 登录弹框
   设计定调：深邃蓝 (#4558d0) 主色 + 冷金点缀 + 医学科技精密感
   ========================================================================== */

.xh-login-dialog {
  :deep(.el-dialog) {
    padding: 0;
    margin: 0;
    overflow: hidden;
    border-radius: 20px;
    background: transparent;
    box-shadow:
      0 40px 90px -10px rgba(30, 41, 97, 0.35),
      0 20px 40px -20px rgba(30, 41, 97, 0.2);
  }
  /* 彻底消除顶部 header 区域（包括 Element Plus 可能残留的占位、border、padding） */
  :deep(.el-dialog__header) {
    display: none !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
    height: 0 !important;
    min-height: 0 !important;
  }
  :deep(.el-dialog__headerbtn) { display: none !important; }
  :deep(.el-dialog__body) {
    padding: 0 !important;
    border: none !important;
  }
  :deep(.el-dialog__footer) { display: none !important; }
}

.xh-login {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  min-height: 580px;
  border-radius: 20px;
  overflow: hidden;
  /* 底色用左侧深蓝，避免圆角处露出白色缝隙 */
  background: #1e2961;
  font-family: "SF Pro Text", -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
}

@media (max-width: 768px) {
  .xh-login {
    grid-template-columns: 1fr;
    min-height: 0;
  }
  .xh-login__visual {
    min-height: 240px;
    padding: 28px !important;
  }
  .xh-login__footer,
  .xh-login__ecg { display: none; }
}

/* ==========================================================================
   左侧视觉区 · 主色深蓝 + 冷金
   ========================================================================== */
.xh-login__visual {
  position: relative;
  padding: 44px 46px 36px;
  color: #fff;
  background:
    radial-gradient(ellipse at 15% 8%, rgba(155, 170, 250, 0.28), transparent 55%),
    radial-gradient(ellipse at 95% 95%, rgba(201, 168, 105, 0.1), transparent 55%),
    linear-gradient(160deg, #1e2961 0%, #2e3d9e 55%, #4558d0 100%);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;
}

/* 粒子网格背景 */
.xh-login__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 32px 32px;
  mask-image: radial-gradient(ellipse at center, black 25%, transparent 80%);
  pointer-events: none;
}

/* 柔光斑点 */
.xh-login__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  pointer-events: none;
  opacity: 0.55;
}
.xh-login__glow--1 {
  top: -90px; right: -90px;
  width: 280px; height: 280px;
  background: radial-gradient(circle, rgba(236, 217, 165, 0.45), transparent);
  animation: xhGlow 9s ease-in-out infinite;
}
.xh-login__glow--2 {
  bottom: -70px; left: -70px;
  width: 260px; height: 260px;
  background: radial-gradient(circle, rgba(107, 130, 240, 0.7), transparent);
  animation: xhGlow 11s ease-in-out infinite reverse;
}
@keyframes xhGlow {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.15); opacity: 0.75; }
}

/* 品牌头 */
.xh-login__brand {
  position: relative;
  z-index: 2;
  display: flex;
  gap: 12px;
  align-items: center;
}
.xh-login__logo {
  width: 44px; height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.xh-login__logo-img {
  width: 26px; height: 26px;
}
.xh-login__brand-zh {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 1.8px;
  color: #fff;
}
.xh-login__brand-en {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 2.5px;
  color: #ecd9a5;
  margin-top: 3px;
  opacity: 0.92;
}

/* 心电图波形（更细、更克制） */
.xh-login__ecg {
  position: absolute;
  top: 42%;
  left: -5%;
  right: -5%;
  transform: translateY(-50%);
  height: 140px;
  opacity: 0.45;
  pointer-events: none;
  z-index: 1;
}
.xh-login__ecg svg {
  width: 100%;
  height: 100%;
}
.xh-login__ecg-path {
  stroke-dasharray: 800;
  stroke-dashoffset: 800;
  animation: xhEcgDraw 3.5s ease-out 0.6s forwards;
}
@keyframes xhEcgDraw {
  to { stroke-dashoffset: 0; }
}

/* 标语（主视觉） */
.xh-login__slogan {
  position: relative;
  z-index: 2;
  margin-top: auto;
  margin-bottom: 8px;
}
.xh-login__tag {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 5px 14px;
  margin-bottom: 20px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  color: #ecd9a5;
  background: rgba(236, 217, 165, 0.1);
  border: 1px solid rgba(236, 217, 165, 0.3);
  border-radius: 999px;
  backdrop-filter: blur(6px);
}
.xh-login__tag-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #ecd9a5;
  box-shadow: 0 0 10px rgba(236, 217, 165, 0.9);
  animation: xhPulse 2s ease-in-out infinite;
}
@keyframes xhPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.xh-login__title {
  font-size: 36px;
  font-weight: 800;
  line-height: 1.18;
  color: #fff;
  margin: 0 0 16px;
  letter-spacing: 3px;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
}
.xh-login__title-accent {
  background: linear-gradient(90deg, #ecd9a5 0%, #d4b87a 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.xh-login__subtitle {
  font-size: 13px;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.72);
  margin: 0;
  letter-spacing: 0.4px;
}

/* 底部：数字矩阵 + 版权 */
.xh-login__footer {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.xh-login__stats {
  display: flex;
  align-items: center;
  gap: 18px;
}
.xh-login__stat {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.xh-login__stat-num {
  font-family: "SF Mono", "JetBrains Mono", "Menlo", monospace;
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
  color: #ecd9a5;
  letter-spacing: -0.5px;
}
.xh-login__stat-label {
  font-size: 10px;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.55);
}
.xh-login__stat-sep {
  width: 1px;
  height: 26px;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(255, 255, 255, 0.18),
    transparent
  );
}
.xh-login__copyright {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.38);
  letter-spacing: 1px;
}

/* ==========================================================================
   右侧表单区
   ========================================================================== */
.xh-login__form {
  position: relative;
  padding: 56px 56px 40px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  background: #fff;
}

/* 唯一的关闭按钮 */
.xh-login__close {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 34px;
  height: 34px;
  border: none;
  background: transparent;
  border-radius: 50%;
  color: #9aa4b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;

  &:hover:not(:disabled) {
    background: rgba(69, 88, 208, 0.08);
    color: #4558d0;
    transform: rotate(90deg);
  }
  &:disabled { opacity: 0.3; cursor: not-allowed; }
}

.xh-login__form-header {
  margin-top: 0;
}
.xh-login__eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 3px;
  color: #4558d0;
  margin-bottom: 14px;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 10px;

  &::before {
    content: "";
    width: 22px;
    height: 2px;
    background: linear-gradient(90deg, #4558d0, rgba(107, 130, 240, 0.2));
    border-radius: 2px;
  }
}
.xh-login__form-title {
  font-size: 30px;
  font-weight: 800;
  line-height: 1.2;
  color: #1e2961;
  margin: 0 0 12px;
  letter-spacing: 1.5px;
}
.xh-login__form-desc {
  font-size: 13px;
  line-height: 1.75;
  color: #8a94a6;
  margin: 0;
  letter-spacing: 0.2px;
}

.xh-login__form-body {
  display: flex;
  flex-direction: column;
  gap: 2px;

  :deep(.el-form-item) {
    margin-bottom: 14px;
  }
  :deep(.el-form-item__label) {
    padding-bottom: 6px;
    line-height: 1.4;
  }
}

.xh-login__label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #1e2961;
  text-transform: uppercase;
  opacity: 0.75;
}

.xh-login__input {
  :deep(.el-input__wrapper) {
    padding: 10px 14px;
    background: #f6f8fc;
    border-radius: 10px;
    box-shadow: 0 0 0 1px transparent inset;
    transition: all 0.25s ease;

    &:hover {
      background: #f0f4fa;
      box-shadow: 0 0 0 1px rgba(69, 88, 208, 0.25) inset;
    }
    &.is-focus {
      background: #fff;
      box-shadow:
        0 0 0 1px #4558d0 inset,
        0 8px 20px rgba(69, 88, 208, 0.1);
    }
  }
  :deep(.el-input__inner) {
    font-size: 14px;
    color: #1e2961;
    height: 30px;
    font-family: inherit;
    &::placeholder { color: #b8c0d0; }
  }
  &__icon { color: #9aa4b8; }
}

.xh-login__actions { margin-top: 14px; }

/* 登录按钮 */
.xh-login__submit {
  position: relative;
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #4558d0 0%, #6b82f0 100%);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 4px;
  cursor: pointer;
  overflow: hidden;
  box-shadow:
    0 10px 24px -6px rgba(69, 88, 208, 0.45),
    0 0 0 1px rgba(255, 255, 255, 0.12) inset;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow:
      0 16px 32px -8px rgba(69, 88, 208, 0.55),
      0 0 0 1px rgba(255, 255, 255, 0.22) inset;
    filter: brightness(1.06);
  }
  &:active:not(:disabled) { transform: translateY(0); }
  &:disabled { cursor: not-allowed; opacity: 0.75; }

  &-inner {
    position: relative;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  &-shimmer {
    position: absolute;
    top: 0; left: -100%;
    width: 60%; height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.28) 50%,
      transparent 100%
    );
    animation: xhShimmer 3.5s ease-in-out infinite;
    pointer-events: none;
  }
}
@keyframes xhShimmer {
  0% { left: -100%; }
  55%, 100% { left: 100%; }
}

/* 加载态 */
.xh-login__loading-dots {
  display: inline-flex;
  gap: 6px;
  span {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #fff;
    animation: xhBounce 1.2s ease-in-out infinite;
    &:nth-child(2) { animation-delay: 0.15s; }
    &:nth-child(3) { animation-delay: 0.3s; }
  }
}
@keyframes xhBounce {
  0%, 100% { transform: translateY(0); opacity: 0.4; }
  50% { transform: translateY(-6px); opacity: 1; }
}

/* 底部保障承诺（极简一行） */
.xh-login__footer-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: auto;
  padding-top: 12px;
}
.xh-login__footer-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e6eaf2, transparent);
}
.xh-login__footer-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #9aa4b8;
  letter-spacing: 0.8px;
  white-space: nowrap;

  .el-icon { color: #4558d0; opacity: 0.8; }
}

/* 暗色主题适配 */
:global(.dark) .xh-login { background: #12151f; }
:global(.dark) .xh-login__form { background: #12151f; }
:global(.dark) .xh-login__form-title { color: #f0f5ff; }
:global(.dark) .xh-login__form-desc,
:global(.dark) .xh-login__footer-text { color: #a0b0c8; }
:global(.dark) .xh-login__footer-line {
  background: linear-gradient(90deg, transparent, #2a3048, transparent);
}
:global(.dark) .xh-login__input :deep(.el-input__wrapper) {
  background: #1a1f2e;
  &:hover { background: #202538; }
  &.is-focus { background: #20263a; }
}
:global(.dark) .xh-login__input :deep(.el-input__inner) { color: #f0f5ff; }
:global(.dark) .xh-login__label { color: #c9d2e6; }
</style>

<!-- 非 scoped 样式：覆盖全局 _element-plus.scss 中 .el-dialog .el-dialog__header { border-bottom } -->
<style lang="scss">
/* Element Plus 将 class 加到 .el-dialog 上，所以选择器是 .el-dialog.xh-login-dialog */
.el-dialog.xh-login-dialog {
  padding: 0 !important;
  overflow: hidden !important;
  border-radius: 20px !important;
  background: transparent !important;

  .el-dialog__header {
    display: none !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
    border-bottom: none !important;
    height: 0 !important;
    min-height: 0 !important;
    overflow: hidden !important;
    line-height: 0 !important;
  }
  .el-dialog__headerbtn {
    display: none !important;
  }
  .el-dialog__body {
    padding: 0 !important;
    border: none !important;
  }
  .el-dialog__footer {
    display: none !important;
    border: none !important;
  }
}
</style>
