import axios, {
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import qs from "qs";
import { ApiCodeEnum } from "@/enums/api";
import { AuthStorage, redirectToLogin } from "@/utils/auth";

/** Token 在请求头中的字段名（与后端约定） */
const TOKEN_HEADER = "sn-score-token";

// HTTP 请求实例
const http = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 5 * 60 * 1000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
});

// 请求拦截器
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = AuthStorage.getAccessToken();
    if (token) {
      config.headers[TOKEN_HEADER] = token;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse) => {
    const { responseType } = response.config;

    // 二进制数据（文件下载）：返回 { data, fileName }
    if (responseType === "blob" || responseType === "arraybuffer") {
      let fileName = Date.now() + ".xlsx";
      if (response.headers["content-disposition"]) {
        const splitArr = decodeURI(
          response.headers["content-disposition"],
        ).split("UTF-8");
        if (splitArr.length >= 2) {
          fileName = splitArr[1].replace("''", "");
        }
      }
      return { data: response.data, fileName } as any;
    }

    // 如果响应头中带了新 token，自动续期
    if (response.status === 200 && response.headers[TOKEN_HEADER]) {
      AuthStorage.setToken(response.headers[TOKEN_HEADER]);
    }

    const { code, message } = response.data;

    // Token 失效
    if (code === ApiCodeEnum.TOKEN_INVALID) {
      redirectToLogin("登录已过期，请重新登录");
      return Promise.reject(new Error(message || "Token Invalid"));
    }

    // 业务成功
    if (code === ApiCodeEnum.SUCCESS) {
      return { data: response.data, status: response.status, message } as any;
    }

    // 其他业务错误（不弹窗，由调用方处理）
    return { data: response.data, status: response.status, message } as any;
  },

  (error) => {
    if (!error.response) {
      ElMessage.error("网络连接失败");
    }
    return Promise.reject(error);
  },
);

export default http;
