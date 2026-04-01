/**
 * 认证相关类型定义
 */

/**
 * 登录请求参数
 */
export interface LoginRequest {
  /** 用户账号 */
  userCode: string;
  /** 用户密码 */
  userPwd: string;
  /** 登录时间戳（秒） */
  loginOn: number;
  /** 签名 */
  sign: string;
}

/**
 * 登录响应 - 用户信息
 */
export interface UserInfo {
  userId?: string;
  userCode?: string;
  userName?: string;
  nickname?: string;
  avatar?: string;
  phone?: string;
  email?: string;
  roles?: string[];
  perms?: string[];
  [key: string]: any;
}
