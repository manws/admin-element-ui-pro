import axios, {
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import qs from "qs";
import { ApiCodeEnum } from "@/enums/api";
import { usePermissionStoreHook } from "@/store/modules/permission";
import { AuthStorage, redirectToLogin } from "@/utils/auth";

// HTTP 请求实例
const http = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 50000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
});

// 请求拦截器
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = AuthStorage.getAccessToken();

    if (config.headers.Authorization === "no-auth") {
      delete config.headers.Authorization;
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { responseType } = response.config;

    // 二进制数据直接返回
    if (responseType === "blob" || responseType === "arraybuffer") {
      return response;
    }

    // 如果响应头中带了新 token，自动更新存储
    const newToken = response.headers["new-token"];
    if (newToken) {
      AuthStorage.setToken(newToken, AuthStorage.getRememberMe());
    }

    const { code, data, msg } = response.data;

    if (code === ApiCodeEnum.SUCCESS) {
      return data;
    }

    ElMessage.error(msg || "系统出错");
    return Promise.reject(new Error(msg || "系统出错"));
  },

  async (error) => {
    const { response } = error;

    if (!response) {
      ElMessage.error("网络连接失败");
      return Promise.reject(error);
    }

    const { code, msg } = response.data as ApiResponse;

    // Token 无效或过期：跳转登录
    if (
      code === ApiCodeEnum.ACCESS_TOKEN_INVALID ||
      code === ApiCodeEnum.REFRESH_TOKEN_INVALID
    ) {
      await redirectToLogin("登录已过期，请重新登录");
      return Promise.reject(new Error("Token Invalid"));
    }

    // 权限不足：刷新权限快照后提示
    if (code === ApiCodeEnum.PERMISSION_DENIED) {
      const permissionStore = usePermissionStoreHook();
      await permissionStore.reloadPermissionSnapshotOnce();
      ElMessage.error(msg || "权限不足");
      return Promise.reject(new Error(msg || "权限不足"));
    }

    ElMessage.error(msg || "请求失败");
    return Promise.reject(new Error(msg || "请求失败"));
  },
);

export default http;
