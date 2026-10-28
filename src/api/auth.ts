import request from "@/utils/request";
import type { LoginRequest } from "@/types/api/auth";
import { HttpResponse } from "@/types";
import { isMockEnabled } from "@/mock";
import { mockLogin, mockLogout } from "@/mock/auth";

const AUTH_BASE_URL = "/api/v2/User";

const AuthAPI = {
  /** 登录接口 */
  login(data: LoginRequest): Promise<HttpResponse> {
    if (isMockEnabled) {
      return mockLogin(data);
    }
    return request({
      url: `${AUTH_BASE_URL}/login/pc`,
      method: "post",
      data,
    });
  },

  /** 退出登录接口 */
  logout() {
    if (isMockEnabled) {
      return mockLogout();
    }
    return request({
      url: `${AUTH_BASE_URL}/logout`,
      method: "post",
    });
  },

  /** 修改密码 */
  changePwd(data: { oldPwd: string; newPwd: string }) {
    return request({
      url: `${AUTH_BASE_URL}/changePwd`,
      method: "post",
      data,
    });
  },
};

export default AuthAPI;
