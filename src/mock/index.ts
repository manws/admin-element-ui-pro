/**
 * 前端 Mock 模块
 *
 * @description
 * 在无后端环境下用于本地联调。通过环境变量 VITE_APP_MOCK 控制开关，
 * 默认账号 / 密码均为 123456。接入真实后端时，将 .env 中的
 * VITE_APP_MOCK 置为 false（或删除）即可彻底关闭，不影响真实请求流程。
 */

/** 是否开启 Mock */
export const isMockEnabled = import.meta.env.VITE_APP_MOCK === "true";

/** Mock 登录账号 */
export const MOCK_USERNAME = "123456";
/** Mock 登录密码 */
export const MOCK_PASSWORD = "123456";

/** 模拟网络延迟 */
export function mockDelay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
