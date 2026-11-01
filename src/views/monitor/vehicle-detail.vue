<template>
  <div class="detail-page">
    <el-card shadow="never">
      <div class="detail-head">
        <div>
          <p class="detail-title">
            {{ detail?.plateNumber }}
            <span class="status-text">
              <i class="status-dot" :class="detail?.online ? 'is-online' : 'is-offline'" />
              {{ detail?.online ? "在线" : "离线" }}
            </span>
            <span v-if="detail?.alarmFlag" class="status-text is-alarm">告警</span>
            <span v-if="detail?.charging" class="status-text is-charging">充电中</span>
          </p>
          <p class="detail-sub">
            {{ detail?.selfNumber }} · {{ detail?.make }} / {{ detail?.brand }} {{ detail?.model }} · {{ detail?.company }}
          </p>
        </div>
        <el-button type="primary" @click="gotoTrack">历史轨迹回放</el-button>
      </div>

      <el-tabs v-model="activeTab">
        <!-- 基础信息 -->
        <el-tab-pane label="基础信息" name="base">
          <el-descriptions :column="3" border>
            <el-descriptions-item label="车辆类型">{{ detail?.vehicleType }}</el-descriptions-item>
            <el-descriptions-item label="车辆分类">{{ detail?.category }}</el-descriptions-item>
            <el-descriptions-item label="品牌">{{ detail?.make }}</el-descriptions-item>
            <el-descriptions-item label="车品牌">{{ detail?.brand }}</el-descriptions-item>
            <el-descriptions-item label="型号">{{ detail?.model }}</el-descriptions-item>
            <el-descriptions-item label="电池型号">{{ detail?.batteryModel }}</el-descriptions-item>
            <el-descriptions-item label="电池容量">{{ detail?.batteryCapacity }} kWh</el-descriptions-item>
            <el-descriptions-item label="自编号">{{ detail?.selfNumber }}</el-descriptions-item>
            <el-descriptions-item label="车牌号">{{ detail?.plateNumber }}</el-descriptions-item>
            <el-descriptions-item label="VIN 码">{{ detail?.vin }}</el-descriptions-item>
            <el-descriptions-item label="运营公司">{{ detail?.company }}</el-descriptions-item>
            <el-descriptions-item label="接入时间">{{ detail?.accessTime }}</el-descriptions-item>
            <el-descriptions-item label="出厂时间">{{ detail?.factoryTime }}</el-descriptions-item>
            <el-descriptions-item label="是否监控">{{ detail?.monitorFlag ? "是" : "否" }}</el-descriptions-item>
            <el-descriptions-item label="是否可用">{{ detail?.available ? "是" : "否" }}</el-descriptions-item>
            <el-descriptions-item label="安全评分">{{ detail?.safetyScore }} 分</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 电池曲线 -->
        <el-tab-pane label="电池曲线" name="battery">
          <ECharts :options="batteryCurveOption" height="420px" />
        </el-tab-pane>

        <!-- 极值曲线 -->
        <el-tab-pane label="极值曲线" name="extreme">
          <ECharts :options="extremeCurveOption" height="420px" />
        </el-tab-pane>

        <!-- 整车状态 -->
        <el-tab-pane label="整车状态" name="status">
          <el-descriptions :column="4" border>
            <el-descriptions-item label="行驶速度">{{ detail?.speed }} km/h</el-descriptions-item>
            <el-descriptions-item label="当前 SOC">{{ detail?.soc }}%</el-descriptions-item>
            <el-descriptions-item label="整车功率">{{ detail?.power }} kW</el-descriptions-item>
            <el-descriptions-item label="SOC">{{ detail?.soc }}%</el-descriptions-item>
            <el-descriptions-item label="总电压">{{ detail?.voltage }} V</el-descriptions-item>
            <el-descriptions-item label="总电流">{{ detail?.current }} A</el-descriptions-item>
            <el-descriptions-item label="车辆状态">{{ detail?.vehicleStatus }}</el-descriptions-item>
            <el-descriptions-item label="充电状态">{{ detail?.charging ? "充电中" : "未充电" }}</el-descriptions-item>
            <el-descriptions-item label="运行模式">{{ detail?.runningMode }}</el-descriptions-item>
            <el-descriptions-item label="累计里程">{{ detail?.totalMileage.toLocaleString() }} km</el-descriptions-item>
            <el-descriptions-item label="今日里程">{{ detail?.todayMileage }} km</el-descriptions-item>
            <el-descriptions-item label="档位">{{ detail?.gear }}</el-descriptions-item>
            <el-descriptions-item label="绝缘电阻">{{ detail?.insulationResistance }} kΩ</el-descriptions-item>
            <el-descriptions-item label="上报间隔">{{ detail?.reportInterval }} s</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 极值信息 + 驱动电机 -->
        <el-tab-pane label="极值信息" name="extremum">
          <el-descriptions :column="4" border class="mb-4">
            <el-descriptions-item label="单体最高电压">{{ detail?.cellMaxVoltage }} V</el-descriptions-item>
            <el-descriptions-item label="单体最低电压">{{ detail?.cellMinVoltage }} V</el-descriptions-item>
            <el-descriptions-item label="单体最高温度">{{ detail?.cellMaxTemp }} ℃</el-descriptions-item>
            <el-descriptions-item label="单体最低温度">{{ detail?.cellMinTemp }} ℃</el-descriptions-item>
          </el-descriptions>

          <p class="font-semibold mb-2">驱动电机信息</p>
          <el-table :data="detail?.motorList" border>
            <el-table-column prop="index" label="电机序号" width="90" />
            <el-table-column prop="status" label="电机状态" width="110" />
            <el-table-column prop="controllerCurrent" label="控制器电流(A)" />
            <el-table-column prop="controllerVoltage" label="控制器电压(V)" />
            <el-table-column prop="speed" label="转速(rpm)" />
            <el-table-column prop="torque" label="转矩(N·m)" />
            <el-table-column prop="temperature" label="温度(℃)" />
          </el-table>
        </el-tab-pane>

        <!-- 告警信息 -->
        <el-tab-pane label="告警信息" name="alarm">
          <el-table :data="detail?.alarmList" border>
            <el-table-column prop="faultTime" label="告警时间" width="180" />
            <el-table-column label="告警等级" width="100">
              <template #default="{ row }">
                <span :class="{ 'is-alarm': row.level === 1 }">{{ ALARM_LEVEL_MAP[row.level]?.label }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="告警内容" />
          </el-table>
        </el-tab-pane>

        <!-- 定位数据 -->
        <el-tab-pane label="在线信息" name="online">
          <el-descriptions :column="3" border>
            <el-descriptions-item label="在线状态">{{ detail?.online ? "在线" : "离线" }}</el-descriptions-item>
            <el-descriptions-item label="最近在线时间">{{ detail?.lastOnlineTime }}</el-descriptions-item>
            <el-descriptions-item label="上报间隔">{{ detail?.reportInterval }} s</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="定位数据" name="location">
          <el-descriptions :column="2" border class="mb-4">
            <el-descriptions-item label="车辆定位">{{ detail?.position }}</el-descriptions-item>
            <el-descriptions-item label="经纬度">{{ detail?.lng }} , {{ detail?.lat }}</el-descriptions-item>
          </el-descriptions>
          <ECharts :options="locationOption" height="320px" />
        </el-tab-pane>

        <el-tab-pane label="电池单体" name="cells">
          <el-table :data="detail?.cells">
            <el-table-column prop="index" label="单体序号" width="100" />
            <el-table-column prop="voltage" label="电压(V)" />
            <el-table-column prop="temperature" label="温度(℃)" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "MonitorVehicleDetail" });

import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import MonitorAPI from "@/api/monitor";
import { ALARM_LEVEL_MAP } from "@/constants/monitor";
import type { VehicleDetail } from "@/types/api/monitor";

const route = useRoute();
const router = useRouter();

const detail = ref<VehicleDetail>();
const activeTab = ref("base");

const batteryCurveOption = computed(() => {
  const d = detail.value;
  if (!d) return {};
  return {
    tooltip: { trigger: "axis" },
    legend: { data: ["电流(A)", "电压(V)", "SOC(%)"] },
    grid: { left: 60, right: 60, top: 40, bottom: 40 },
    xAxis: { type: "category", data: d.batteryCurve.map((p) => p.time.slice(11, 16)) },
    yAxis: [
      { type: "value", name: "电流/电压" },
      { type: "value", name: "SOC(%)", max: 100 },
    ],
    series: [
      { name: "电流(A)", type: "line", symbol: "none", data: d.batteryCurve.map((p) => p.current), lineStyle: { color: "#4E83ED" } },
      { name: "电压(V)", type: "line", symbol: "none", data: d.batteryCurve.map((p) => p.voltage), lineStyle: { color: "#568DFF" } },
      { name: "SOC(%)", type: "line", symbol: "none", yAxisIndex: 1, data: d.batteryCurve.map((p) => p.soc), lineStyle: { color: "#2563EB" } },
    ],
  };
});

const extremeCurveOption = computed(() => {
  const d = detail.value;
  if (!d) return {};
  return {
    tooltip: { trigger: "axis" },
    legend: { data: ["最高电压(V)", "最低电压(V)", "最高温度(℃)", "最低温度(℃)"] },
    grid: { left: 60, right: 60, top: 40, bottom: 40 },
    xAxis: { type: "category", data: d.extremeCurve.map((p) => p.time.slice(11, 16)) },
    yAxis: [{ type: "value", name: "电压(V)" }, { type: "value", name: "温度(℃)" }],
    series: [
      { name: "最高电压(V)", type: "line", symbol: "none", data: d.extremeCurve.map((p) => p.maxVoltage), lineStyle: { color: "#2563EB" } },
      { name: "最低电压(V)", type: "line", symbol: "none", data: d.extremeCurve.map((p) => p.minVoltage), lineStyle: { color: "#6EA4FF" } },
      { name: "最高温度(℃)", type: "line", symbol: "none", yAxisIndex: 1, data: d.extremeCurve.map((p) => p.maxTemp), lineStyle: { color: "#4E83ED" } },
      { name: "最低温度(℃)", type: "line", symbol: "none", yAxisIndex: 1, data: d.extremeCurve.map((p) => p.minTemp), lineStyle: { color: "#568DFF" } },
    ],
  };
});

const locationOption = computed(() => {
  const d = detail.value;
  if (!d) return {};
  return {
    tooltip: { trigger: "item" },
    grid: { left: 50, right: 20, top: 20, bottom: 40 },
    xAxis: { type: "value", name: "经度", scale: true },
    yAxis: { type: "value", name: "纬度", scale: true },
    series: [
      {
        type: "scatter",
        symbolSize: 20,
        data: [{ value: [d.lng, d.lat], name: d.plateNumber }],
        itemStyle: { color: "#4E83ED" },
      },
    ],
  };
});

function gotoTrack() {
  if (detail.value) {
    router.push(`/monitor/track?id=${detail.value.id}`);
  }
}

onMounted(async () => {
  const id = Number(route.query.id) || 1;
  detail.value = await MonitorAPI.getVehicleDetail(id);
});
</script>

<style lang="scss" scoped>
.detail-page {
  padding: 24px;
}

.detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.detail-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #1b2b43;
}

.detail-sub {
  margin: 8px 0 0;
  font-size: 13px;
  color: #66758b;
}

.status-text {
  margin-left: 12px;
  font-size: 13px;
  font-weight: 400;
  color: #66758b;
}

.status-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 8px;
  border-radius: 50%;

  &.is-online {
    background: #79bd85;
  }

  &.is-offline {
    background: #7e8b9f;
  }
}

.is-alarm {
  color: #e3828b;
}

.is-charging {
  color: #6ea4ff;
}
</style>
