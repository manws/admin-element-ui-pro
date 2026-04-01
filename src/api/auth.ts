import request from "@/utils/request";
import type { LoginRequest } from "@/types/api/auth";

const AUTH_BASE_URL = "/api/v2/User";

const AuthAPI = {
  /** 登录接口 */
  login(data: LoginRequest) {
    return request({
      url: `${AUTH_BASE_URL}/login/pc`,
      method: "post",
      data,
    });
  },

  /** 退出登录接口 */
  logout() {
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
