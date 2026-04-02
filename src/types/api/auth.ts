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
 * 用户信息
 */
export interface UserInfo {
  /** 用户ID */
  userId: number;
  /** 用户账号 */
  userCode: string;
  /** 用户名称 */
  userName: string;
  /** 手机号 */
  phone: string;
  /** 邮箱 */
  email: string;
  /** 头像 */
  avatar?: string;
}
