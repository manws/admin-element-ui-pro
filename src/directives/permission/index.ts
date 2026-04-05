import type { Directive, DirectiveBinding } from "vue";

import { useUserStore } from "@/store";
import { ROLE_ROOT } from "@/constants";

/**
 * 按钮权限（当前 userInfo 暂无 roles/perms，用 as any 临时绕过）
 */
export const hasPerm: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const requiredPerms = binding.value;

    if (!requiredPerms || (typeof requiredPerms !== "string" && !Array.isArray(requiredPerms))) {
      throw new Error(
        "需要提供权限标识！例如：v-has-perm=\"'sys:user:create'\" 或 v-has-perm=\"['sys:user:create', 'sys:user:update']\""
      );
    }

    const userInfo = useUserStore().userInfo as any;
    const { roles = [], perms = [] } = userInfo;

    if (roles.includes(ROLE_ROOT) || requiredPerms.includes("*:*:*")) {
      return;
    }

    const hasAuth = Array.isArray(requiredPerms)
      ? requiredPerms.some((perm: string) => perms.includes(perm))
      : perms.includes(requiredPerms);

    if (!hasAuth && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  },
};

/**
 * 角色权限指令
 */
export const hasRole: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const requiredRoles = binding.value;

    if (!requiredRoles || (typeof requiredRoles !== "string" && !Array.isArray(requiredRoles))) {
      throw new Error(
        "需要提供角色标识！例如：v-has-role=\"'ADMIN'\" 或 v-has-role=\"['ADMIN', 'TEST']\""
      );
    }

    const userInfo = useUserStore().userInfo as any;
    const { roles = [] } = userInfo;

    const hasAuth = Array.isArray(requiredRoles)
      ? requiredRoles.some((role: string) => roles.includes(role))
      : roles.includes(requiredRoles);

    if (!hasAuth && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  },
};
