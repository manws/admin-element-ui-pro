<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessageBox } from "element-plus";
import { useUserStore } from "@/store";
import { useClock } from "../composables/useClock";

const router = useRouter();
const userStore = useUserStore();
const { time, date } = useClock();
const soundOn = ref(true);
const isFull = ref(false);

const userName = computed(() => userStore.userInfo.userName || "管理员");
const userRole = computed(() => userStore.userInfo.roleName || "");

function toggleFull() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
}

const onFs = () => {
  isFull.value = !!document.fullscreenElement;
};

onMounted(() => document.addEventListener("fullscreenchange", onFs));
onBeforeUnmount(() => document.removeEventListener("fullscreenchange", onFs));

function signOut() {
  ElMessageBox.confirm("确定注销并退出系统吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
    lockScroll: false,
  })
    .then(() => {
      userStore.logout().then(() => {
        router.push("/login?redirect=/screen");
      });
    })
    .catch(() => undefined);
}
</script>

<template>
  <header class="head">
    <div class="side">
      <el-tooltip content="进入菜单" placement="bottom">
        <button type="button" class="logo" @click="router.push('/monitor/map')">
          <i class="ri-shield-check-line" />
        </button>
      </el-tooltip>
      <div class="pill">
        <span class="stat">
          <span class="dot" />
          <span class="tone-ok">实时监控中</span>
        </span>
        <span class="sep" />
        <span class="stat"><span class="label">在线车辆</span><span class="num val">1,626</span></span>
        <span class="sep" />
        <span class="stat"><span class="label">在册车辆</span><span class="num val">1,936</span></span>
        <span class="sep" />
        <el-tooltip content="在线判定：最近 60 秒有上报" placement="bottom">
          <span class="stat"><span class="label">上报</span><span class="num val">60s</span></span>
        </el-tooltip>
      </div>
    </div>

    <div class="title">
      <span class="eyebrow">Airside Safety Center</span>
      <h1 title="首都机场（飞行区）电动车辆安全运行监控管理平台">首都机场车辆监控</h1>
    </div>

    <div class="side is-end">
      <div class="pill clock-pill">
        <span class="num clock-time">{{ time }}</span>
        <span class="clock-date">{{ date }}</span>
      </div>
      <div class="hbtn is-static">
        <i :class="soundOn ? 'ri-volume-up-line tone-icon' : 'ri-volume-mute-line tone-dim'" />
        <el-switch v-model="soundOn" size="small" />
      </div>
      <el-tooltip :content="isFull ? '退出全屏' : '全屏'" placement="bottom">
        <button type="button" class="hbtn is-icon" @click="toggleFull">
          <i :class="isFull ? 'ri-fullscreen-exit-line' : 'ri-fullscreen-line'" />
        </button>
      </el-tooltip>
      <div class="pill user-pill">
        <i class="ri-user-3-line tone-icon" />
        <span class="user-name">{{ userName }}</span>
        <span v-if="userRole" class="user-role">{{ userRole }}</span>
      </div>
      <el-tooltip content="退出登录" placement="bottom">
        <button type="button" class="hbtn is-icon" @click="signOut">
          <i class="ri-logout-box-r-line" />
        </button>
      </el-tooltip>
    </div>
  </header>
</template>

<style scoped>
.head {
  position: relative;
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px 6px;
  border-bottom: 1px solid rgba(90, 196, 255, 0.16);
}

.side {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 600px;
  min-width: 0;
}

.side.is-end {
  justify-content: flex-end;
  gap: 10px;
}

.logo {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  font-size: 18px;
  color: #f2fbff;
  border-radius: 11px;
  background: linear-gradient(135deg, #7ce8ff 0%, #196bad 100%);
  box-shadow: inset 0 0 0 1px rgba(124, 232, 255, 0.45), 0 0 14px rgba(58, 180, 255, 0.45);
  cursor: pointer;
  transition: transform 0.25s var(--ease), box-shadow 0.25s var(--ease);
}

.logo:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 18px rgba(58, 212, 255, 0.75);
}

.stat {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.pill {
  height: 38px;
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 0 14px;
  font-size: 13px;
  border-radius: 2px;
  color: #c5e6f5;
  background: rgba(6, 28, 52, 0.72);
  border: 1px solid rgba(90, 196, 255, 0.35);
  box-shadow: inset 0 0 12px rgba(40, 140, 220, 0.12);
}

.clock-pill {
  gap: 12px;
}

.user-pill {
  gap: 10px;
}

.sep {
  width: 1px;
  height: 14px;
  background: var(--c-line);
}

.dot {
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2ee59a;
  box-shadow: 0 0 8px rgba(46, 229, 154, 0.8);
}

.dot::after {
  content: "";
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: currentColor;
  color: rgba(46, 229, 154, 0.45);
  animation: blink-soft 1.8s var(--ease) infinite;
}

.title {
  position: absolute;
  left: 50%;
  top: 6px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  pointer-events: none;
}

.eyebrow {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: #7ee7ff;
}

.eyebrow::before,
.eyebrow::after {
  content: "";
  display: inline-block;
  width: 36px;
  height: 1px;
  margin: 0 10px 3px;
  background: linear-gradient(90deg, transparent, #3ad4ff);
  vertical-align: middle;
}

.eyebrow::after {
  background: linear-gradient(90deg, #3ad4ff, transparent);
}

.title h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: 0.28em;
  padding-left: 0.28em;
  color: #f4fbff;
  text-shadow: 0 0 18px rgba(80, 200, 255, 0.65);
}

.hbtn {
  height: 38px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  font-size: 13px;
  color: #c5e6f5;
  border-radius: 2px;
  background: rgba(6, 28, 52, 0.72);
  border: 1px solid rgba(90, 196, 255, 0.35);
  box-shadow: inset 0 0 12px rgba(40, 140, 220, 0.12);
  cursor: pointer;
  transition: background 0.25s var(--ease), color 0.25s, border-color 0.25s;
}

.hbtn:hover {
  background: rgba(20, 70, 110, 0.8);
  color: #e7f6ff;
  border-color: #7ee7ff;
}

.hbtn:active {
  transform: scale(0.97);
}

.hbtn.is-static {
  cursor: default;
}

.hbtn.is-static:active {
  transform: none;
}

.hbtn.is-icon {
  padding: 0;
  width: 38px;
  justify-content: center;
}

.val {
  font-size: 16px;
  color: #e7f6ff;
}

.tone-ok {
  color: #2ee59a;
  font-weight: 500;
}

.tone-icon {
  color: #3ad4ff;
}

.tone-dim {
  color: #7eb4cc;
}

.clock-time {
  font-size: 24px;
  line-height: 1;
  color: #e7f6ff;
  letter-spacing: 0.025em;
}

.clock-date {
  font-size: 12px;
  color: #7eb4cc;
  white-space: nowrap;
}

.user-name {
  max-width: 96px;
  overflow: hidden;
  color: #e7f6ff;
  font-weight: 500;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.user-role {
  max-width: 72px;
  overflow: hidden;
  font-size: 12px;
  color: #7eb4cc;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
