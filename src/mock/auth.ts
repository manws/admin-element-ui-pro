/**
 * 认证相关 Mock
 */

import type { HttpResponse } from "@/types/api/common";
import type { LoginRequest, UserInfo } from "@/types/api/auth";
import { AuthStorage } from "@/utils/auth";
import { MOCK_USERNAME, MOCK_PASSWORD, mockDelay } from "./index";

/** Mock 用户信息 */
const mockUserInfo: UserInfo = {
  userId: 1,
  userCode: MOCK_USERNAME,
  userName: "管理员",
  nickname: "管理员",
  phone: "13800138000",
  email: "admin@example.com",
  avatar: "",
  roles: ["ROOT"],
  perms: ["*:*:*"],
};

/**
 * Mock 登录
 *
 * @description
 * 账号与密码均为 123456 时登录成功，写入 Mock Token 并返回用户信息；
 * 否则返回错误结构，由上层 store 抛出错误提示。
 */
export async function mockLogin(data: LoginRequest): Promise<HttpResponse> {
  await mockDelay();

  if (data.userCode === MOCK_USERNAME && data.userPwd === MOCK_PASSWORD) {
    // 写入 Token，守卫据此判断已登录
    AuthStorage.setToken(`mock-token-${Date.now()}`);

    return {
      data: {
        code: 200,
        message: "登录成功",
        result: { userInfo: mockUserInfo },
      },
      status: 200,
      message: "登录成功",
    };
  }

  return {
    data: {
      code: 401,
      message: "用户名或密码错误（Mock 环境账号密码均为 123456）",
      result: null,
    },
    status: 200,
    message: "用户名或密码错误",
  };
}

/** Mock 退出登录 */
export async function mockLogout(): Promise<HttpResponse> {
  await mockDelay(100);
  return {
    data: { code: 200, message: "退出成功", result: null },
    status: 200,
    message: "退出成功",
  };
}
