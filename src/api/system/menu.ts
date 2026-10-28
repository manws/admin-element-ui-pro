import request from "@/utils/request";

const MENU_BASE_URL = "/api/v2/Menu";

const MenuAPI = {
  /** 获取当前用户的菜单路由列表（远程路由模式下使用） */
  getRoutes(projectDB?: string) {
    return request({
      url: `${MENU_BASE_URL}/list${projectDB ? "/" + projectDB : ""}`,
      method: "post",
    });
  },
};

export default MenuAPI;
