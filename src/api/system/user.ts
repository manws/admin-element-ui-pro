import request from "@/utils/request";
import { isMockEnabled } from "@/mock";
import { mockGetUsers, mockSaveUser, mockDeleteUsers } from "@/mock/base";
import type { PlatformUser } from "@/types/api/monitor";

const USER_BASE_URL = "/api/v1/system/user";

/** 授权管理 - 用户档案 API */
const UserAPI = {
  /** 用户分页列表 */
  getUsers(params: any): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockGetUsers(params));
    return request({ url: `${USER_BASE_URL}/page`, method: "get", params });
  },
  /** 新增/更新用户 */
  saveUser(data: PlatformUser): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockSaveUser(data));
    return request({ url: `${USER_BASE_URL}`, method: "post", data });
  },
  /** 批量删除用户 */
  deleteUsers(ids: string): Promise<any> {
    if (isMockEnabled) return Promise.resolve(mockDeleteUsers(ids));
    return request({ url: `${USER_BASE_URL}/${ids}`, method: "delete" });
  },
};

export default UserAPI;
