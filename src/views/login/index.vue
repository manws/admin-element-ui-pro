<template>
  <div class="auth-view">
    <div class="auth-view__toolbar">
      <el-tooltip :content="t('login.themeToggle')" placement="bottom">
        <div class="toolbar-item">
          <ThemeSwitch />
        </div>
      </el-tooltip>
      <el-tooltip :content="t('login.languageToggle')" placement="bottom">
        <div class="toolbar-item">
          <LangSelect size="text-20px" />
        </div>
      </el-tooltip>
    </div>

    <!-- 左侧：机场地勤视觉区 -->
    <section class="auth-visual">
      <h1 class="auth-visual__name">{{ t("login.brand.name") }}</h1>

      <div class="auth-visual__group">
        <p class="auth-visual__headline">{{ t("login.brand.headline") }}</p>
        <p class="auth-visual__desc">{{ t("login.brand.description") }}</p>
        <div class="auth-visual__photo">
          <img :src="sceneImage" :alt="t('login.brand.name')" />
        </div>
        <p class="auth-visual__caption">{{ t("login.brand.caption") }}</p>
      </div>

      <p class="auth-visual__footer">{{ t("login.brand.footer") }}</p>
    </section>

    <!-- 右侧：白色凭据登录区 -->
    <section class="auth-panel">
      <div class="auth-panel__inner">
        <transition name="fade-slide" mode="out-in">
          <component :is="formComponents[component]" v-model="component" class="auth-form" />
        </transition>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import sceneImage from "@/assets/images/login-scene.png";
import ThemeSwitch from "@/components/ThemeSwitch/index.vue";

type LayoutMap = "login" | "register" | "resetPwd";

const { t } = useI18n();
const component = ref<LayoutMap>("login");

const formComponents = {
  login: defineAsyncComponent(() => import("./components/Login.vue")),
  register: defineAsyncComponent(() => import("./components/Register.vue")),
  resetPwd: defineAsyncComponent(() => import("./components/ResetPwd.vue")),
};
</script>

<style lang="scss" scoped>
.auth-view {
  --brand-primary: #5ce1ff;
  --brand-primary-dark: #8af0ff;
  --brand-ink: #04202c;
  --brand-mint: #07111c;
  --brand-border: #2f6f90;
  --brand-text: #f4fbff;
  --brand-text-sub: #b7d4e6;
  --brand-surface: #16344e;

  position: relative;
  display: flex;
  flex-direction: row;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  color: var(--brand-text);
  background:
    radial-gradient(900px 520px at 78% 42%, rgb(92 225 255 / 16%), transparent 62%),
    #02060e;
}

.auth-view__toolbar {
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 10;
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  color: var(--brand-text);
  background-color: rgb(7 17 28 / 88%);
  border: 1px solid var(--brand-border);
  border-radius: 999px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 35%);

  .toolbar-item {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.375rem;
    cursor: pointer;
    border-radius: 8px;
    transition: background-color 0.3s ease;

    &:hover {
      color: var(--brand-ink);
      background-color: var(--brand-primary);
    }
  }
}

/* 左侧：机场地勤视觉区 */
.auth-visual {
  display: flex;
  flex: none;
  flex-direction: column;
  gap: 24px;
  align-items: flex-start;
  justify-content: flex-start;
  width: 56%;
  padding: 48px;
  overflow: hidden;
  background: var(--brand-mint);
}

.auth-visual__name {
  width: 100%;
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--brand-primary);
  text-align: left;
  letter-spacing: 0.18em;
}

.auth-visual__group {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: flex-start;
  width: 100%;
}

.auth-visual__headline {
  width: 100%;
  margin: 0;
  font-size: clamp(32px, 3vw, 44px);
  font-weight: 700;
  line-height: 1.15;
  color: var(--brand-text);
  text-align: left;
}

.auth-visual__desc,
.auth-visual__caption,
.auth-visual__footer {
  width: 100%;
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  line-height: normal;
  color: var(--brand-text-sub);
  text-align: left;
}

.auth-visual__photo {
  width: 100%;
  height: clamp(300px, 46vh, 560px);
  overflow: hidden;
  background: #0a1826;
  border: 1px solid rgb(92 225 255 / 35%);
  border-radius: 24px;
  box-shadow: 0 18px 40px rgb(0 0 0 / 35%);

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.auth-visual__footer {
  margin-top: auto;
}

/* 右侧：抬亮的操作台，和夜色背景分开 */
.auth-panel {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: clamp(32px, 6vw, 96px);
  overflow: hidden;
  background:
    linear-gradient(180deg, rgb(92 225 255 / 55%), rgb(92 225 255 / 0%)) 0 0 / 100% 3px no-repeat,
    var(--brand-surface);
  box-shadow: -24px 0 48px rgb(0 0 0 / 28%);
}

.auth-panel__inner {
  width: 100%;
  max-width: 512px;
}

/* 表单通用皮肤：账号密码 / 注册 / 找回密码 共用 */
.auth-form {
  width: 100%;

  :deep(h3) {
    margin: 0 0 24px;
    font-size: 24px;
    font-weight: 600;
    line-height: normal;
    color: var(--brand-text);
    text-align: left;
  }

  :deep(.el-form-item) {
    margin-bottom: 24px;
  }

  :deep(.el-form-item__error) {
    padding-top: 4px;
    font-size: 12px;
  }

  :deep(.el-input__wrapper) {
    height: 52px;
    padding: 0 16px;
    background-color: #071018;
    border: 1px solid #3d7ea3;
    border-radius: 11px;
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 4%);
    transition:
      border-color 0.18s ease,
      box-shadow 0.18s ease;

    &:hover {
      border-color: #7fe9ff;
    }

    &.is-focus {
      border-color: var(--brand-primary);
      box-shadow: 0 0 0 3px rgb(92 225 255 / 28%);
    }
  }

  :deep(.el-input__inner) {
    height: 50px;
    font-size: 14px;
    line-height: 50px;
    color: var(--brand-text);

    &::placeholder {
      color: var(--brand-text-sub);
    }
  }

  :deep(.el-input__prefix-inner),
  :deep(.el-input__suffix-inner) {
    color: var(--brand-text-sub);
  }

  :deep(.el-button) {
    width: 100%;
    height: 52px;
    padding: 0 60px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 2px;
    border: none;
    border-radius: 16px;
    transition:
      background-color 0.18s ease,
      transform 0.12s ease;

    &:active {
      transform: translateY(1px);
    }
  }

  :deep(.el-button--primary) {
    color: var(--brand-ink);
    background-color: var(--brand-primary);
    box-shadow: 0 10px 28px rgb(92 225 255 / 28%);

    &:hover,
    &:focus {
      color: var(--brand-ink);
      background-color: var(--brand-primary-dark);
    }
  }
}

/* 暗色开关下仍保持运营中心的深蓝，不再切回绿色 */
.dark .auth-view {
  .auth-view__toolbar {
    box-shadow: 0 6px 18px rgb(0 0 0 / 45%);
  }

  .auth-form :deep(.el-input__wrapper) {
    background-color: rgb(5 20 37 / 72%);

    &:hover {
      border-color: rgb(79 168 232 / 55%);
    }
  }
}

@media (width <= 960px) {
  .auth-view {
    flex-direction: column;
  }

  .auth-visual {
    display: none;
  }

  .auth-panel {
    width: 100%;
    padding: 72px clamp(20px, 5vw, 32px) 32px;
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-40px) scale(0.95);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
}
</style>
