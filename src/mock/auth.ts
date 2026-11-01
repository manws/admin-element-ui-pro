/**
 * 认证相关 Mock
 */

import type { HttpResponse } from "@/types/api/common";
import type { LoginRequest, UserInfo } from "@/types/api/auth";
import { AuthStorage } from "@/utils/auth";
import { MOCK_USERNAME, MOCK_PASSWORD, mockDelay } from "./index";

/** 演示账号。密码均为 123456。123456 为采购人超级管理员。 */
const MOCK_ACCOUNTS: UserInfo[] = [
  {
    userId: 1,
    userCode: MOCK_USERNAME,
    userName: "管理员",
    nickname: "管理员",
    phone: "13800138000",
    email: "admin@cia.com.cn",
    avatar: "",
    roles: ["ROOT"],
    perms: ["*:*:*"],
    roleName: "超级管理员",
    dataScope: "",
  },
  {
    userId: 2,
    userCode: "safety",
    userName: "安全监管员",
    nickname: "安全监管员",
    phone: "13800138001",
    email: "safety@cia.com.cn",
    avatar: "",
    roles: ["SAFETY"],
    perms: ["monitor:*:*", "base:*:*", "report:*:*"],
    roleName: "安全监管员",
    dataScope: "",
  },
  {
    userId: 3,
    userCode: "dispatch",
    userName: "运营调度员",
    nickname: "运营调度员",
    phone: "13800138002",
    email: "dispatch@ghd.com",
    avatar: "",
    roles: ["DISPATCH"],
    perms: ["monitor:*:*"],
    roleName: "运营调度员",
    dataScope: "首都机场地服公司",
  },
];

/**
 * Mock 登录
 *
 * @description
 * 账号与密码均为 123456 时登录成功，写入 Mock Token 并返回用户信息；
 * 否则返回错误结构，由上层 store 抛出错误提示。
 */
export async function mockLogin(data: LoginRequest): Promise<HttpResponse> {
  await mockDelay();

  const account = MOCK_ACCOUNTS.find((item) => item.userCode === data.userCode);
  if (account && data.userPwd === MOCK_PASSWORD) {
    AuthStorage.setToken(`mock-token-${Date.now()}`);

    return {
      data: {
        code: 200,
        message: "登录成功",
        result: { userInfo: account },
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
