import type { RouteRecordRaw } from "vue-router";
import NProgress from "@/plugins/nprogress";
import router from "@/router";
import { usePermissionStore, useUserStore } from "@/store";

/**
 * 判断路由链中是否存在 requiresAuth 要求
 */
function routeRequiresAuth(to: { matched: { meta?: Record<string, any> }[]; meta?: Record<string, any> }): boolean {
  if (to.meta?.requiresAuth) return true;
  return to.matched.some((m) => m.meta?.requiresAuth);
}

/**
 * 路由权限守卫
 *
 * 策略：
 * - 未登录用户可以直接访问首页及大部分页面（游客模式）
 * - 只有带 meta.requiresAuth 的路由才强制要求登录
 * - 已登录但 token 失效时由响应拦截器统一处理（弹框）
 */
export function setupPermissionGuard() {
  router.beforeEach(async (to, _from, next) => {
    NProgress.start();

    try {
      const userStore = useUserStore();
      const permissionStore = usePermissionStore();
      const isLoggedIn = userStore.isLoggedIn();

      // 已登录访问登录页 -> 跳首页
      if (isLoggedIn && to.path === "/login") {
        next({ path: "/" });
        return;
      }

      // 访问需登录页面时检查登录态
      if (!isLoggedIn && routeRequiresAuth(to)) {
        // 未登录访问受限页面：弹框提示并阻止导航（UI 层应引导至登录弹框）
        ElMessage.warning("请先登录后访问该页面");
        NProgress.done();
        next(false);
        return;
      }

      // 首次访问时生成动态路由（登录与否都要生成，未登录时仅展示未受限的菜单项）
      if (!permissionStore.isRouteGenerated) {
        if (isLoggedIn && !userStore.userInfo?.userId) {
          userStore.getUserInfo();
        }
        const dynamicRoutes = await permissionStore.generateRoutes();
        dynamicRoutes.forEach((route: RouteRecordRaw) => {
          router.addRoute(route);
        });
        next({ ...to, replace: true });
        return;
      }

      // 路由 404 检查
      if (to.matched.length === 0) {
        next("/404");
        return;
      }

      // 动态标题
      const title = (to.params.title as string) || (to.query.title as string);
      if (title) {
        to.meta.title = title;
      }

      next();
    } catch (error) {
      console.error("Route guard error:", error);
      next();
      NProgress.done();
    }
  });

  router.afterEach(() => {
    NProgress.done();
  });
}
