import type { RouteRecordRaw } from "vue-router";
import { constantRoutes } from "@/router";

export interface AppMenuItem {
  title: string;
  path: string;
  parent: string;
}

function joinPath(parent: string, path: string) {
  if (!path) return parent || "/";
  if (path.startsWith("/")) return path;
  return `${parent}/${path}`.replace(/\/+/g, "/");
}

function walk(routes: RouteRecordRaw[], parentPath: string, parentTitle: string, bucket: AppMenuItem[]) {
  routes.forEach((route) => {
    if (route.meta?.hidden) return;
    const path = joinPath(parentPath, route.path);
    const rawTitle = typeof route.meta?.title === "string" ? route.meta.title : "";
    const title = rawTitle === "dashboard" ? "总览" : rawTitle;
    if (title) {
      bucket.push({ title, path, parent: parentTitle });
    }
    if (route.children?.length) {
      walk(route.children, path, title || parentTitle, bucket);
    }
  });
}

/** 当前项目里会显示在侧栏的菜单，供系统资源和资源授权使用。 */
export function listAppMenus(): AppMenuItem[] {
  const menus: AppMenuItem[] = [];
  walk(constantRoutes, "", "", menus);
  return menus.filter((item) => item.path !== "/login" && item.path !== "/redirect");
}
