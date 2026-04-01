import { store } from "@/store";

import AuthAPI from "@/api/auth";
import type { LoginRequest, UserInfo } from "@/types/api/auth";

import { AuthStorage } from "@/utils/auth";
import { usePermissionStoreHook } from "@/store/modules/permission";
import { useTagsViewStore } from "@/store";

export const useUserStore = defineStore("user", () => {
  // 用户信息
  const userInfo = ref<UserInfo>(
    localStorage.getItem("User")
      ? JSON.parse(localStorage.getItem("User")!)
      : ({} as UserInfo),
  );

  /**
   * 登录
   */
  async function login(loginRequest: LoginRequest): Promise<UserInfo> {
    const response = await AuthAPI.login(loginRequest);
    const { code, message, result } = response.data;

    if (code === 200) {
      const user = result?.userInfo;
      if (user) {
        userInfo.value = user;
        localStorage.setItem("User", JSON.stringify(user));
        return user;
      }
      throw new Error("登录失败：未获取到用户信息");
    }
    throw new Error(message || "登录失败");
  }

  /**
   * 获取用户信息（从本地缓存读取）
   */
  function getUserInfo(): UserInfo {
    const cached = localStorage.getItem("User");
    if (cached) {
      const data = JSON.parse(cached);
      Object.assign(userInfo.value, data);
      return data;
    }
    return userInfo.value;
  }

  /**
   * 登出
   */
  async function logout(): Promise<void> {
    try {
      await AuthAPI.logout();
    } catch {
      // 登出接口失败不阻断流程
    }
    resetAllState();
  }

  /**
   * 重置所有系统状态
   */
  function resetAllState(): void {
    resetUserState();
    usePermissionStoreHook().resetRouter();
    useTagsViewStore().delAllViews();
  }

  /**
   * 重置用户状态
   */
  function resetUserState(): void {
    AuthStorage.clearAuth();
    userInfo.value = {} as UserInfo;
    localStorage.removeItem("User");
  }

  return {
    userInfo,
    isLoggedIn: () => !!AuthStorage.getAccessToken(),
    login,
    logout,
    getUserInfo,
    resetAllState,
    resetUserState,
  };
});

/**
 * 在组件外部使用 UserStore 的钩子函数
 */
export function useUserStoreHook() {
  return useUserStore(store);
}
