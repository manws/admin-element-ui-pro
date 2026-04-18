import { Storage } from "./storage";
import { STORAGE_KEYS, ROLE_ROOT } from "@/constants";
import { useUserStoreHook } from "@/store/modules/user";
import { showTokenExpiredDialog } from "./auth-events";

// 负责本地凭证的读写
export const AuthStorage = {
  getAccessToken(): string {
    return Storage.get(STORAGE_KEYS.ACCESS_TOKEN, "");
  },

  setToken(accessToken: string): void {
    Storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  },

  clearAuth(): void {
    Storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
  },
};

/**
 * 权限判断（当前 userInfo 暂无 roles/perms 字段，临时跳过类型检查）
 */
export function hasPerm(value: string | string[], type: "button" | "role" = "button"): boolean {
  const userInfo = useUserStoreHook().userInfo as any;
  const { roles, perms } = userInfo;

  if (!roles || !perms) {
    return false;
  }

  // 超级管理员拥有所有权限
  if (type === "button" && roles.includes(ROLE_ROOT)) {
    return true;
  }

  const auths = type === "button" ? perms : roles;
  return typeof value === "string"
    ? auths.includes(value)
    : value.some((perm: string) => auths.includes(perm));
}

/**
 * Token 失效处理
 *
 * 旧行为：直接跳转到登录页
 * 新行为：触发全局 Token 失效提示弹框，由 Layout 层监听；用户确认后清 token 并回到首页，菜单自动刷新
 */
export async function redirectToLogin(
  message: string = "登录已过期，请重新登录",
): Promise<void> {
  showTokenExpiredDialog(message);
}
