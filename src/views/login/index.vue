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
  --brand-primary: #087f5b;
  --brand-primary-dark: #066045;
  --brand-mint: #eaf6f0;
  --brand-border: #d3e8dd;
  --brand-text: #174d3a;
  --brand-text-sub: #426454;
  --brand-surface: #fff;

  position: relative;
  display: flex;
  flex-direction: row;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  color: var(--brand-text);
  background-color: var(--brand-surface);
}

.auth-view__toolbar {
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 10;
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background-color: var(--brand-surface);
  border: 1px solid var(--brand-border);
  border-radius: 999px;
  box-shadow: 0 6px 18px rgb(8 127 91 / 8%);

  .toolbar-item {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.375rem;
    cursor: pointer;
    border-radius: 8px;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: var(--brand-mint);
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
  font-size: 24px;
  font-weight: 600;
  line-height: normal;
  color: var(--brand-text);
  text-align: left;
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
  font-size: clamp(24px, 2vw, 32px);
  font-weight: 600;
  line-height: normal;
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
  background: var(--brand-border);
  border-radius: 24px;

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

/* 右侧：白色凭据登录区 */
.auth-panel {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: clamp(32px, 6vw, 96px);
  overflow: hidden;
  background: var(--brand-surface);
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
    background-color: var(--brand-surface);
    border: 1px solid var(--brand-border);
    border-radius: 11px;
    box-shadow: none;
    transition:
      border-color 0.18s ease,
      box-shadow 0.18s ease;

    &:hover {
      border-color: #a9d3c0;
    }

    &.is-focus {
      border-color: var(--brand-primary);
      box-shadow: 0 0 0 3px rgb(8 127 91 / 12%);
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
    background-color: var(--brand-primary);

    &:hover,
    &:focus {
      background-color: var(--brand-primary-dark);
    }
  }
}

/* 应用内暗黑主题 */
.dark .auth-view {
  --brand-mint: #10231b;
  --brand-border: #2c4038;
  --brand-text: #e7f3ee;
  --brand-text-sub: #9fb9ac;
  --brand-surface: #141b18;

  .auth-view__toolbar {
    box-shadow: 0 6px 18px rgb(0 0 0 / 45%);
  }

  .auth-form :deep(.el-input__wrapper) {
    background-color: #1b241f;

    &:hover {
      border-color: #3d564b;
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
