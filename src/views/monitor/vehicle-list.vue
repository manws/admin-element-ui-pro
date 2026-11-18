<template>
  <div class="board-page vehicle-monitor">
    <section class="panel filter-panel">
      <el-form :model="query" inline>
        <el-form-item label="车牌号">
          <el-input v-model="query.plateNumber" clearable placeholder="请输入车牌号" />
        </el-form-item>
        <el-form-item label="车辆VIN">
          <el-input v-model="query.vin" clearable placeholder="请输入VIN" />
        </el-form-item>
        <el-form-item label="运营单位">
          <el-select v-model="query.company" clearable placeholder="全部" style="width: 200px">
            <el-option v-for="item in COMPANIES" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="车品牌">
          <el-select v-model="query.brand" clearable placeholder="全部" style="width: 140px">
            <el-option v-for="item in VEHICLE_BRANDS" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="在线状态">
          <el-select v-model="query.online" clearable placeholder="全部" style="width: 120px">
            <el-option label="在线" :value="true" />
            <el-option label="离线" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </section>

    <section class="card-grid">
      <article v-for="item in list" :key="item.id" class="panel vehicle-card">
        <header class="vehicle-head" :class="item.online ? 'is-online' : 'is-offline'">
          <h3>{{ item.plateNumber }}</h3>
          <p>{{ item.company }}</p>
        </header>
        <dl class="vehicle-fields">
          <div><dt>车辆类型</dt><dd>{{ item.category }}</dd></div>
          <div><dt>电压</dt><dd>{{ item.voltage }} V</dd></div>
          <div><dt>电流</dt><dd>{{ item.current }} A</dd></div>
          <div><dt>SOC</dt><dd>{{ item.soc }}%</dd></div>
          <div><dt>今日里程</dt><dd>{{ item.todayMileage }} km</dd></div>
          <div><dt>最高单体</dt><dd>{{ item.cellMaxVoltage }} V</dd></div>
          <div><dt>最低单体</dt><dd>{{ item.cellMinVoltage }} V</dd></div>
          <div><dt>最高温度</dt><dd>{{ item.cellMaxTemp }} ℃</dd></div>
          <div><dt>最低温度</dt><dd>{{ item.cellMinTemp }} ℃</dd></div>
        </dl>
        <footer>
          <el-button type="primary" link @click="openDetail(item.id)">详情</el-button>
          <el-button type="primary" link @click="openHistory(item.id)">历史</el-button>
        </footer>
      </article>
    </section>

    <el-empty v-if="!loading && list.length === 0" description="没有符合条件的车辆" />

    <div class="pager">
      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="load"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "MonitorVehicleList" });

import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import MonitorAPI from "@/api/monitor";
import { COMPANIES, VEHICLE_BRANDS } from "@/constants/monitor";
import type { Vehicle } from "@/types/api/monitor";

const router = useRouter();
const loading = ref(false);
const list = ref<Vehicle[]>([]);
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(12);
const query = reactive({
  plateNumber: "",
  vin: "",
  company: "",
  brand: "",
  online: "" as boolean | "",
});

async function load() {
  loading.value = true;
  try {
    const data = await MonitorAPI.getVehicles({
      ...query,
      online: query.online === "" ? undefined : query.online,
      monitorFlag: true,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    });
    list.value = data.list;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
}

function search() {
  pageNum.value = 1;
  load();
}

function reset() {
  query.plateNumber = "";
  query.vin = "";
  query.company = "";
  query.brand = "";
  query.online = "";
  search();
}

function openDetail(id: number) {
  router.push(`/monitor/vehicle-detail?id=${id}`);
}

function openHistory(id: number) {
  router.push(`/monitor/track?id=${id}`);
}

onMounted(load);
</script>

<style lang="scss" scoped>
.filter-panel {
  margin-bottom: 16px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.vehicle-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vehicle-head {
  padding: 12px 14px;

  h3 {
    margin: 0;
    font-size: 22px;
    line-height: 30px;
  }

  p {
    margin: 2px 0 0;
    font-size: 13px;
    line-height: 18px;
  }

  &.is-online {
    color: #5ee3bf;
    background: rgb(94 227 191 / 14%);
  }

  &.is-offline {
    color: #ff9e7a;
    background: rgb(255 158 122 / 14%);
  }
}

.vehicle-fields {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px 12px;
  margin: 0;

  div {
    min-width: 0;
  }

  dt {
    font-size: 12px;
    color: var(--shell-muted, #66758b);
  }

  dd {
    margin: 2px 0 0;
    font-size: 14px;
    color: var(--shell-text, #1b2b43);
  }
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
