/**
 * 全局认证事件总线
 *
 * 用于跨组件通信：
 * - Token 失效时由请求拦截器触发事件，由 Layout 层监听并弹出提示框
 * - 未登录点击受限功能时触发"打开登录弹框"事件
 */
import { ref } from "vue";

/** Token 失效提示框显示状态 */
export const tokenExpiredDialogVisible = ref(false);

/** 登录弹框显示状态 */
export const loginDialogVisible = ref(false);

/** Token 失效后的提示文案 */
export const tokenExpiredMessage = ref("登录已过期，请重新登录");

/**
 * 触发"Token 失效"弹框
 */
export function showTokenExpiredDialog(message: string = "登录已过期，请重新登录") {
  tokenExpiredMessage.value = message;
  // 避免短时间内多次触发
  if (!tokenExpiredDialogVisible.value) {
    tokenExpiredDialogVisible.value = true;
  }
}

/**
 * 触发"打开登录弹框"
 */
export function showLoginDialog() {
  loginDialogVisible.value = true;
}
