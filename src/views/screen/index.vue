<template>
<main id="viewport" aria-label="机场车辆安全监控大屏">
<p class="sr-only">此页面为设计还原演示，使用设计稿中的示例数据，未连接实时数据服务。</p>
<div id="stage" ref="stageRef"><div id="el-472-1501" class="node surface-node" data-name="安全监控大屏 · 布局优化"><header class="topbar" aria-label="首都机场车辆监控平台顶部栏">
<div class="brand">
<img class="logo" src="/screen/assets/svg/472_23-20261117_234516026.svg" alt="平台安全标识" width="32" height="32">
<h1 class="platform-title" title="进入菜单" @click="openMenu">首都机场（飞行区）电动车辆安全运行监控管理平台</h1>
<div class="monitor-status"><span class="status-dot" aria-hidden="true"></span><span class="status-label">365×24 实时监控中</span></div>
</div>
<div class="tools">
<span class="online-rule">在线判定：最近 60 秒有上报</span>
<time class="timestamp">{{ clockText }}</time>
<div class="current-user"><span class="avatar" aria-hidden="true">管</span><span class="username">采购人超级管理员</span></div>
</div>
</header>
<div id="el-472-1503" class="node surface-node" data-name="六类当日告警数 · 示意数据"><div id="el-472-1524" class="node surface-node" data-name="当日告警-热失控前兆"><span id="el-472-1561" class="node text-node" data-name="标签">当日热失控前兆告警</span>
<div id="el-491-1" class="node surface-node" data-name="告警数量与当日占比"><span id="el-472-1562" class="node text-node" data-name="数值">6</span>
<span id="el-491-2" class="node text-node" data-name="六类告警占比">占比 26.1%</span></div>
<div id="el-491-3" class="node surface-node" data-name="六类告警占比条"><div id="el-491-4" class="node surface-node" data-name="热失控前兆占比26.1%"></div>
<div id="el-491-5" class="node surface-node" data-name="其他告警占比"></div></div></div>
<div id="el-476-1" class="node surface-node" data-name="当日告警-绝缘电阻过低"><span id="el-476-2" class="node text-node" data-name="标签">当日绝缘电阻过低告警</span>
<div id="el-491-6" class="node surface-node" data-name="告警数量与当日占比"><span id="el-476-3" class="node text-node" data-name="数值">5</span>
<span id="el-491-7" class="node text-node" data-name="六类告警占比">占比 21.7%</span></div>
<div id="el-491-8" class="node surface-node" data-name="六类告警占比条"><div id="el-491-9" class="node surface-node" data-name="绝缘电阻过低占比21.7%"></div>
<div id="el-491-10" class="node surface-node" data-name="其他告警占比"></div></div></div>
<div id="el-476-4" class="node surface-node" data-name="当日告警-温度传感器失效"><span id="el-476-5" class="node text-node" data-name="标签">当日温度传感器失效告警</span>
<div id="el-491-11" class="node surface-node" data-name="告警数量与当日占比"><span id="el-476-6" class="node text-node" data-name="数值">4</span>
<span id="el-491-12" class="node text-node" data-name="六类告警占比">占比 17.4%</span></div>
<div id="el-491-13" class="node surface-node" data-name="六类告警占比条"><div id="el-491-14" class="node surface-node" data-name="温度传感器失效占比17.4%"></div>
<div id="el-491-15" class="node surface-node" data-name="其他告警占比"></div></div></div>
<div id="el-476-7" class="node surface-node" data-name="当日告警-电机控制器过温"><span id="el-476-8" class="node text-node" data-name="标签">当日电机控制器过温告警</span>
<div id="el-491-16" class="node surface-node" data-name="告警数量与当日占比"><span id="el-476-9" class="node text-node" data-name="数值">3</span>
<span id="el-491-17" class="node text-node" data-name="六类告警占比">占比 13.0%</span></div>
<div id="el-491-18" class="node surface-node" data-name="六类告警占比条"><div id="el-491-19" class="node surface-node" data-name="电机控制器过温占比13.0%"></div>
<div id="el-491-20" class="node surface-node" data-name="其他告警占比"></div></div></div>
<div id="el-476-10" class="node surface-node" data-name="当日单体电压过低告警"><span id="el-476-11" class="node text-node" data-name="标签">当日单体电压过低告警</span>
<div id="el-491-21" class="node surface-node" data-name="告警数量与当日占比"><span id="el-476-12" class="node text-node" data-name="数值">3</span>
<span id="el-491-22" class="node text-node" data-name="六类告警占比">占比 13.0%</span></div>
<div id="el-491-23" class="node surface-node" data-name="六类告警占比条"><div id="el-491-24" class="node surface-node" data-name="单体电压过低占比13.0%"></div>
<div id="el-491-25" class="node surface-node" data-name="其他告警占比"></div></div></div>
<div id="el-476-13" class="node surface-node" data-name="当日电池包温升异常告警"><span id="el-476-14" class="node text-node" data-name="标签">当日电池包温升异常告警</span>
<div id="el-491-26" class="node surface-node" data-name="告警数量与当日占比"><span id="el-476-15" class="node text-node" data-name="数值">2</span>
<span id="el-491-27" class="node text-node" data-name="六类告警占比">占比 8.7%</span></div>
<div id="el-491-28" class="node surface-node" data-name="六类告警占比条"><div id="el-491-29" class="node surface-node" data-name="电池包温升异常占比8.7%"></div>
<div id="el-491-30" class="node surface-node" data-name="其他告警占比"></div></div></div>
<div id="el-476-183" class="node surface-node" data-name="天气卡片"><div id="el-476-184" class="node surface-node" data-name="天气主信息"><div id="el-476-185" class="node surface-node" data-name="天气与温度"><span id="el-476-186" class="node text-node" data-name="天气">晴</span>
<span id="el-476-187" class="node text-node" data-name="温度">18°C</span></div>
<span id="el-476-188" class="node text-node" data-name="空气质量">空气质量 良 · AQI 62</span></div>
<div id="el-476-189" class="node surface-node" data-name="分隔线"></div>
<div id="el-476-190" class="node surface-node" data-name="气象明细"><div id="el-476-191" class="node surface-node" data-name="明细左列"><span id="el-476-193" class="node text-node" data-name="湿度">湿度 46%</span>
<span id="el-476-194" class="node text-node" data-name="气压">气压 1013 hPa</span></div>
<div id="el-476-192" class="node surface-node" data-name="明细右列"><span id="el-476-195" class="node text-node" data-name="风力">西北风 3 级</span>
<span id="el-476-196" class="node text-node" data-name="能见度">能见度 8.5 km</span></div></div></div></div>
<div id="el-472-1504" class="node surface-node" data-name="车辆概况 · 实时监控 · 风险告警"><div id="el-476-139" class="node surface-node" data-name="车辆与电池概况"><div id="el-472-1512" class="node surface-node" data-name="01 全部单位在线分布"><div id="el-472-1526" class="node surface-node" data-name="面板标题"><span id="el-472-1566" class="node text-node" data-name="序号">01</span>
<span id="el-472-1567" class="node text-node" data-name="标题">全部单位在线分布</span>
<span id="el-472-1568" class="node text-node" data-name="英文">1,626 辆</span></div>
<div id="el-476-22" class="node surface-node" data-name="全部在线单位饼图 · 细分示意数据"><img id="el-476-23" class="node surface-node vector-resource" data-name="Vector" src="/screen/assets/svg/476_23-20261117_231023348.svg" alt="" draggable="false">
<img id="el-476-24" class="node surface-node vector-resource" data-name="Vector" src="/screen/assets/svg/476_24-20261117_231023434.svg" alt="" draggable="false">
<img id="el-476-25" class="node surface-node vector-resource" data-name="Vector" src="/screen/assets/svg/476_25-20261117_231023545.svg" alt="" draggable="false">
<img id="el-476-26" class="node surface-node vector-resource" data-name="Vector" src="/screen/assets/svg/476_26-20261117_231023658.svg" alt="" draggable="false">
<img id="el-476-27" class="node surface-node vector-resource" data-name="Vector" src="/screen/assets/svg/476_27-20261117_231023747.svg" alt="" draggable="false">
<img id="el-476-28" class="node surface-node vector-resource" data-name="Vector" src="/screen/assets/svg/476_28-20261117_231024014.svg" alt="" draggable="false">
<img id="el-476-29" class="node surface-node vector-resource" data-name="Vector" src="/screen/assets/svg/476_29-20261117_231024102.svg" alt="" draggable="false">
<img id="el-476-30" class="node surface-node vector-resource" data-name="Vector" src="/screen/assets/svg/476_30-20261117_231024194.svg" alt="" draggable="false">
<img id="el-476-31" class="node surface-node vector-resource" data-name="Vector" src="/screen/assets/svg/476_31-20261117_231024283.svg" alt="" draggable="false">
<img id="el-476-32" class="node surface-node vector-resource" data-name="Vector" src="/screen/assets/svg/476_32-20261117_231024378.svg" alt="" draggable="false">
<div id="el-476-143" class="node surface-node" data-name="环形中心"></div>
<div id="el-476-144" class="node surface-node" data-name="在线总数"><span id="el-476-145" class="node text-node" data-name="总数">1,626</span>
<span id="el-476-146" class="node text-node" data-name="说明">在线车辆 · 辆</span></div></div>
<div id="el-476-40" class="node surface-node" data-name="全部单位颜色图例"><div id="el-476-151" class="node surface-node" data-name="地服公司"><div id="el-476-152" class="node surface-node" data-name="色点"></div>
<span id="el-476-55" class="node text-node" data-name="地服公司图例">地服公司</span></div>
<div id="el-476-153" class="node surface-node" data-name="航空货运"><div id="el-476-154" class="node surface-node" data-name="色点"></div>
<span id="el-476-56" class="node text-node" data-name="航空货运图例">航空货运</span></div>
<div id="el-476-155" class="node surface-node" data-name="机务工程"><div id="el-476-156" class="node surface-node" data-name="色点"></div>
<span id="el-476-57" class="node text-node" data-name="机务工程图例">机务工程</span></div>
<div id="el-476-157" class="node surface-node" data-name="特种车辆"><div id="el-476-158" class="node surface-node" data-name="色点"></div>
<span id="el-476-58" class="node text-node" data-name="特种车辆图例">特种车辆</span></div>
<div id="el-476-159" class="node surface-node" data-name="空管中心"><div id="el-476-160" class="node surface-node" data-name="色点"></div>
<span id="el-476-59" class="node text-node" data-name="空管中心图例">空管中心</span></div>
<div id="el-476-161" class="node surface-node" data-name="安保部"><div id="el-476-162" class="node surface-node" data-name="色点"></div>
<span id="el-476-60" class="node text-node" data-name="安保部图例">安保部</span></div>
<div id="el-476-163" class="node surface-node" data-name="物流公司"><div id="el-476-164" class="node surface-node" data-name="色点"></div>
<span id="el-476-61" class="node text-node" data-name="物流公司图例">物流公司</span></div>
<div id="el-476-165" class="node surface-node" data-name="旅客服务"><div id="el-476-166" class="node surface-node" data-name="色点"></div>
<span id="el-476-62" class="node text-node" data-name="旅客服务图例">旅客服务</span></div>
<div id="el-476-167" class="node surface-node" data-name="基建部"><div id="el-476-168" class="node surface-node" data-name="色点"></div>
<span id="el-476-63" class="node text-node" data-name="基建部图例">基建部</span></div>
<div id="el-476-169" class="node surface-node" data-name="能源公司"><div id="el-476-170" class="node surface-node" data-name="色点"></div>
<span id="el-476-64" class="node text-node" data-name="能源公司图例">能源公司</span></div></div></div>
<div id="el-472-1517" class="node surface-node" data-name="06 电池评估 · 评级车辆数"><div id="el-472-1546" class="node surface-node" data-name="面板标题"><span id="el-472-1628" class="node text-node" data-name="序号">02</span>
<span id="el-472-1629" class="node text-node" data-name="标题">电池评估</span>
<span id="el-472-1630" class="node text-node" data-name="英文">全量 1,936 辆</span></div>
<span id="el-476-96" class="node text-node" data-name="柱状图计数单位">车辆数（辆）</span>
<div id="el-476-97" class="node surface-node" data-name="S A B C车辆数柱状图"><div id="el-476-98" class="node surface-node" data-name="S评级车辆柱"><span id="el-476-99" class="node text-node" data-name="S车辆数">1,264</span>
<div id="el-476-100" class="node surface-node" data-name="S评级1264辆"></div>
<span id="el-476-101" class="node text-node" data-name="S评级">S</span></div>
<div id="el-476-102" class="node surface-node" data-name="A评级车辆柱"><span id="el-476-103" class="node text-node" data-name="A车辆数">516</span>
<div id="el-476-104" class="node surface-node" data-name="A评级516辆"></div>
<span id="el-476-105" class="node text-node" data-name="A评级">A</span></div>
<div id="el-476-106" class="node surface-node" data-name="B评级车辆柱"><span id="el-476-107" class="node text-node" data-name="B车辆数">132</span>
<div id="el-476-108" class="node surface-node" data-name="B评级132辆"></div>
<span id="el-476-109" class="node text-node" data-name="B评级">B</span></div>
<div id="el-476-110" class="node surface-node" data-name="C评级车辆柱"><span id="el-476-111" class="node text-node" data-name="C车辆数">24</span>
<div id="el-476-112" class="node surface-node" data-name="C评级24辆"></div>
<span id="el-476-113" class="node text-node" data-name="C评级">C</span></div></div></div></div>
<div id="el-476-140" class="node surface-node" data-name="实时地图与运行里程"><div id="el-472-1513" class="node surface-node" data-name="02 机场车辆实时位置"><div id="el-472-1529" class="node surface-node" data-name="面板标题"><span id="el-472-1575" class="node text-node" data-name="序号">03</span>
<span id="el-472-1576" class="node text-node" data-name="标题">机场车辆实时位置</span>
<span id="el-472-1577" class="node text-node" data-name="英文">GPS LIVE MAP</span>
<div id="el-472-1578" class="node surface-node" data-name="图例"><div id="el-472-1680" class="node surface-node" data-name="在线"><div id="el-472-1737" class="node surface-node" data-name="点"></div>
<span id="el-472-1738" class="node text-node" data-name="文字">在线</span></div>
<div id="el-472-1681" class="node surface-node" data-name="充电"><div id="el-472-1739" class="node surface-node" data-name="点"></div>
<span id="el-472-1740" class="node text-node" data-name="文字">充电</span></div>
<div id="el-472-1682" class="node surface-node" data-name="告警"><div id="el-472-1741" class="node surface-node" data-name="点"></div>
<span id="el-472-1742" class="node text-node" data-name="文字">告警</span></div>
<div id="el-472-1683" class="node surface-node" data-name="离线"><div id="el-472-1743" class="node surface-node" data-name="点"></div>
<span id="el-472-1744" class="node text-node" data-name="文字">离线</span></div></div></div>
<div id="el-472-1530" class="node surface-node" data-name="地图画布"><img id="el-472-1579" class="node surface-node vector-resource" data-name="飞行区底图与车辆点位" src="/screen/assets/svg/472_1579-20261117_231023189.svg" alt="机场飞行区示意地图与在线、充电、告警车辆点位" draggable="false">
<div id="el-472-1580" class="node surface-node" data-name="新告警弹窗"><div id="el-472-1697" class="node surface-node" data-name="弹窗标题行"><span id="el-472-1838" class="node text-node" data-name="标题">新告警 · 严重</span>
<span id="el-472-1839" class="node text-node" data-name="时间">13:00:42</span></div>
<span id="el-472-1698" class="node text-node" data-name="告警内容">电池热失控前兆</span>
<span id="el-472-1699" class="node text-node" data-name="车牌与方式">京A·D0412  ·  平台弹窗 + 短信</span></div>
<div id="el-472-1581" class="node surface-node" data-name="电动车提示滚动条"><div id="el-472-1700" class="node surface-node" data-name="标签"><span id="el-472-1840" class="node text-node" data-name="标签文字">电动车提示</span></div>
<span id="el-472-1701" class="node text-node" data-name="提示内容">（待定）能见度良好，西北风 3 级，请注意低温下的续航衰减与充电安全 ……</span></div></div></div>
<div id="el-472-1516" class="node surface-node" data-name="05 里程排行"><div id="el-472-1544" class="node surface-node" data-name="面板标题"><span id="el-472-1622" class="node text-node" data-name="序号">04</span>
<span id="el-472-1623" class="node text-node" data-name="标题">单车里程 Top5</span>
<span id="el-472-1624" class="node text-node" data-name="英文">MILEAGE RANK</span>
<span id="el-472-1625" class="node text-node" data-name="单位">单位：万 km</span></div>
<div id="el-472-1545" class="node surface-node" data-name="单车里程Top5"><div id="el-476-71" class="node surface-node" data-name="单车里程第1名"><span id="el-476-72" class="node text-node" data-name="第1名车牌">01  京A·D0412</span>
<div id="el-476-73" class="node surface-node" data-name="里程比例轨道"><div id="el-476-74" class="node surface-node" data-name="21.9万公里"></div></div>
<span id="el-476-75" class="node text-node" data-name="里程数">21.9</span></div>
<div id="el-476-76" class="node surface-node" data-name="单车里程第2名"><span id="el-476-77" class="node text-node" data-name="第2名车牌">02  京A·D1078</span>
<div id="el-476-78" class="node surface-node" data-name="里程比例轨道"><div id="el-476-79" class="node surface-node" data-name="20.4万公里"></div></div>
<span id="el-476-80" class="node text-node" data-name="里程数">20.4</span></div>
<div id="el-476-81" class="node surface-node" data-name="单车里程第3名"><span id="el-476-82" class="node text-node" data-name="第3名车牌">03  京A·D0835</span>
<div id="el-476-83" class="node surface-node" data-name="里程比例轨道"><div id="el-476-84" class="node surface-node" data-name="19.8万公里"></div></div>
<span id="el-476-85" class="node text-node" data-name="里程数">19.8</span></div>
<div id="el-476-86" class="node surface-node" data-name="单车里程第4名"><span id="el-476-87" class="node text-node" data-name="第4名车牌">04  京A·D1520</span>
<div id="el-476-88" class="node surface-node" data-name="里程比例轨道"><div id="el-476-89" class="node surface-node" data-name="18.7万公里"></div></div>
<span id="el-476-90" class="node text-node" data-name="里程数">18.7</span></div>
<div id="el-476-91" class="node surface-node" data-name="单车里程第5名"><span id="el-476-92" class="node text-node" data-name="第5名车牌">05  京A·D0269</span>
<div id="el-476-93" class="node surface-node" data-name="里程比例轨道"><div id="el-476-94" class="node surface-node" data-name="17.6万公里"></div></div>
<span id="el-476-95" class="node text-node" data-name="里程数">17.6</span></div></div></div></div>
<div id="el-476-141" class="node surface-node" data-name="风险明细与告警分析"><div id="el-476-42" class="node surface-node" data-name="04 最近告警 · 5条"><div id="el-476-43" class="node surface-node" data-name="面板标题"><span id="el-476-46" class="node text-node" data-name="序号">05</span>
<span id="el-476-47" class="node text-node" data-name="标题">最近告警</span>
<span id="el-476-48" class="node text-node" data-name="英文">最新 5 条</span></div>
<div id="el-476-114" class="node surface-node" data-name="最近告警1"><div id="el-476-129" class="node surface-node" data-name="告警内容与时间行"><span id="el-476-115" class="node text-node" data-name="告警内容与时间">电池热失控前兆</span>
<span id="el-476-130" class="node text-node" data-name="发生时间">13:00:42</span></div>
<span id="el-476-116" class="node text-node" data-name="告警车辆">京A·D0412  ·  地服公司  ·  比亚迪 牵引车</span></div>
<div id="el-476-117" class="node surface-node" data-name="最近告警2"><div id="el-476-131" class="node surface-node" data-name="告警内容与时间行"><span id="el-476-118" class="node text-node" data-name="告警内容与时间">绝缘电阻过低</span>
<span id="el-476-132" class="node text-node" data-name="发生时间">12:58:17</span></div>
<span id="el-476-119" class="node text-node" data-name="告警车辆">京A·D0875  ·  机务工程  ·  宇通 客梯车</span></div>
<div id="el-476-120" class="node surface-node" data-name="最近告警3"><div id="el-476-133" class="node surface-node" data-name="告警内容与时间行"><span id="el-476-121" class="node text-node" data-name="告警内容与时间">温度传感器失效</span>
<span id="el-476-134" class="node text-node" data-name="发生时间">12:54:03</span></div>
<span id="el-476-122" class="node text-node" data-name="告警车辆">京A·D1342  ·  航空货运  ·  特斯拉 摆渡车</span></div>
<div id="el-476-123" class="node surface-node" data-name="最近告警4"><div id="el-476-135" class="node surface-node" data-name="告警内容与时间行"><span id="el-476-124" class="node text-node" data-name="告警内容与时间">电机控制器过温</span>
<span id="el-476-136" class="node text-node" data-name="发生时间">12:49:36</span></div>
<span id="el-476-125" class="node text-node" data-name="告警车辆">京A·D0639  ·  特种车辆  ·  五菱 除冰车</span></div>
<div id="el-476-126" class="node surface-node" data-name="最近告警5"><div id="el-476-137" class="node surface-node" data-name="告警内容与时间行"><span id="el-476-127" class="node text-node" data-name="告警内容与时间">单体电压过低</span>
<span id="el-476-138" class="node text-node" data-name="发生时间">12:47:10</span></div>
<span id="el-476-128" class="node text-node" data-name="告警车辆">京A·D1121  ·  地服公司  ·  比亚迪 行李车</span></div></div>
<div id="el-472-1514" class="node surface-node" data-name="03 告警统计"><div id="el-472-1531" class="node surface-node" data-name="面板标题"><span id="el-472-1582" class="node text-node" data-name="序号">06</span>
<span id="el-472-1583" class="node text-node" data-name="标题">告警统计</span>
<span id="el-472-1584" class="node text-node" data-name="英文">当日 23 条 · 示意</span></div>
<div id="el-476-142" class="node surface-node" data-name="告警分布与对应类型"><div id="el-476-33" class="node surface-node" data-name="告警统计饼图 · 示意数据"><img id="el-476-34" class="node surface-node vector-resource" data-name="Vector" src="/screen/assets/svg/476_34-20261117_231024463.svg" alt="" draggable="false">
<img id="el-476-35" class="node surface-node vector-resource" data-name="Vector" src="/screen/assets/svg/476_35-20261117_231024548.svg" alt="" draggable="false">
<img id="el-476-36" class="node surface-node vector-resource" data-name="Vector" src="/screen/assets/svg/476_36-20261117_231024637.svg" alt="" draggable="false">
<img id="el-476-37" class="node surface-node vector-resource" data-name="Vector" src="/screen/assets/svg/476_37-20261117_231024728.svg" alt="" draggable="false">
<img id="el-476-38" class="node surface-node vector-resource" data-name="Vector" src="/screen/assets/svg/476_38-20261117_231024812.svg" alt="" draggable="false">
<img id="el-476-39" class="node surface-node vector-resource" data-name="Vector" src="/screen/assets/svg/476_39-20261117_231024896.svg" alt="" draggable="false">
<div id="el-476-147" class="node surface-node" data-name="环形中心"></div>
<div id="el-476-148" class="node surface-node" data-name="告警总数"><span id="el-476-149" class="node text-node" data-name="总数">23</span>
<span id="el-476-150" class="node text-node" data-name="说明">当日告警 · 条</span></div></div>
<div id="el-476-41" class="node surface-node" data-name="六类告警颜色图例"><div id="el-476-171" class="node surface-node" data-name="热失控前兆"><div id="el-476-172" class="node surface-node" data-name="色块"></div>
<span id="el-476-65" class="node text-node" data-name="热失控前兆图例">热失控前兆</span></div>
<div id="el-476-173" class="node surface-node" data-name="绝缘电阻过低"><div id="el-476-174" class="node surface-node" data-name="色块"></div>
<span id="el-476-66" class="node text-node" data-name="绝缘电阻过低图例">绝缘电阻过低</span></div>
<div id="el-476-175" class="node surface-node" data-name="温度传感器失效"><div id="el-476-176" class="node surface-node" data-name="色块"></div>
<span id="el-476-67" class="node text-node" data-name="温度传感器失效图例">温度传感器失效</span></div>
<div id="el-476-177" class="node surface-node" data-name="电机控制器过温"><div id="el-476-178" class="node surface-node" data-name="色块"></div>
<span id="el-476-68" class="node text-node" data-name="电机控制器过温图例">电机控制器过温</span></div>
<div id="el-476-179" class="node surface-node" data-name="单体电压过低"><div id="el-476-180" class="node surface-node" data-name="色块"></div>
<span id="el-476-69" class="node text-node" data-name="单体电压过低图例">单体电压过低</span></div>
<div id="el-476-181" class="node surface-node" data-name="电池包温升异常"><div id="el-476-182" class="node surface-node" data-name="色块"></div>
<span id="el-476-70" class="node text-node" data-name="电池包温升异常图例">电池包温升异常</span></div></div></div></div></div></div></div></div>
</main>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const stageRef = ref<HTMLElement>();
const clockText = ref("");

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function refreshClock() {
  const now = new Date();
  clockText.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}  ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function fitStage() {
  const stage = stageRef.value;
  if (!stage) return;
  const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  stage.style.transform = `scale(${scale})`;
  stage.style.left = `${(window.innerWidth - 1920 * scale) / 2}px`;
  stage.style.top = `${(window.innerHeight - 1080 * scale) / 2}px`;
}

function openMenu() {
  router.push("/dashboard");
}

let timer = 0;

onMounted(() => {
  refreshClock();
  timer = window.setInterval(refreshClock, 1000);
  fitStage();
  window.addEventListener("resize", fitStage, { passive: true });
  document.fonts?.ready.then(fitStage);
});

onUnmounted(() => {
  window.clearInterval(timer);
  window.removeEventListener("resize", fitStage);
});
</script>

<style>

@font-face{font-family:"Monitor SC";src:url("/screen/assets/monitor-400.woff2") format("woff2");font-weight:100 600;font-display:swap}
@font-face{font-family:"Monitor SC";src:url("/screen/assets/monitor-700.woff2") format("woff2");font-weight:700 900;font-display:swap}
:root{--bg:#06101f;--text:#c1d9ed;--accent:#f28b94;--warning:#e6a16c;--canvas-width:1920;--canvas-height:1080}
#viewport,#viewport *{box-sizing:border-box;margin:0;padding:0}
#viewport{position:fixed;inset:0;z-index:20;overflow:hidden;background:var(--bg);color:var(--text);font-family:"Monitor SC",Arial,sans-serif}#stage{position:absolute;width:1920px;height:1080px;transform-origin:0 0;isolation:isolate}
.node{margin:0;padding:0;min-width:0}.text-node{display:block;overflow:hidden;cursor:text;font-synthesis:weight}.vector-resource{display:block;object-fit:fill;user-select:none}
.text-node::selection{color:#fff;background:#355b79}.surface-node{border:0}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}

#el-472-1561{position:absolute;width:190.6665px;height:20px;left:16px;top:12px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:14px;font-weight:400;line-height:20px;text-align:left;white-space:pre-wrap;color:#c0d0df}
#el-472-1562{position:absolute;width:22px;height:44px;left:0px;top:0px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:36px;font-weight:600;line-height:44px;text-align:left;white-space:pre-wrap;color:#f28b94}
#el-491-2{position:absolute;width:62px;height:18px;left:128.6665px;top:26px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:12px;font-weight:400;line-height:18px;text-align:left;white-space:pre-wrap;color:#a9bed2}
#el-491-1{position:absolute;width:190.6665px;height:44px;left:16px;top:38px;border-radius:0px;overflow:hidden}
#el-491-4{position:absolute;width:49.7393px;height:4px;left:0px;top:0px;background:linear-gradient(#f28b94,#f28b94);border-radius:0px;overflow:hidden}
#el-491-5{position:absolute;width:140.9277px;height:4px;left:49.7393px;top:0px;border-radius:0px;overflow:hidden}
#el-491-3{position:absolute;width:190.6665px;height:4px;left:16px;top:88px;background:linear-gradient(#263d51,#263d51);border-radius:2px;overflow:hidden}
#el-472-1524{position:absolute;width:222.6665px;height:104px;left:0px;top:0px;background:linear-gradient(#182b3e,#182b3e);border-radius:4px;overflow:hidden;box-shadow:inset 0 0 0 1px #60404f}
#el-476-2{position:absolute;width:190.6665px;height:20px;left:16px;top:12px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:14px;font-weight:400;line-height:20px;text-align:left;white-space:pre-wrap;color:#c0d0df}
#el-476-3{position:absolute;width:22px;height:44px;left:0px;top:0px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:36px;font-weight:600;line-height:44px;text-align:left;white-space:pre-wrap;color:#f28b94}
#el-491-7{position:absolute;width:62px;height:18px;left:128.667px;top:26px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:12px;font-weight:400;line-height:18px;text-align:left;white-space:pre-wrap;color:#a9bed2}
#el-491-6{position:absolute;width:190.6665px;height:44px;left:16px;top:38px;border-radius:0px;overflow:hidden}
#el-491-9{position:absolute;width:41.4492px;height:4px;left:0px;top:0px;background:linear-gradient(#f28b94,#f28b94);border-radius:0px;overflow:hidden}
#el-491-10{position:absolute;width:149.2173px;height:4px;left:41.4492px;top:0px;border-radius:0px;overflow:hidden}
#el-491-8{position:absolute;width:190.6665px;height:4px;left:16px;top:88px;background:linear-gradient(#263d51,#263d51);border-radius:2px;overflow:hidden}
#el-476-1{position:absolute;width:222.6665px;height:104px;left:234.6665px;top:0px;background:linear-gradient(#182b3e,#182b3e);border-radius:4px;overflow:hidden;box-shadow:inset 0 0 0 1px #4b3948}
#el-476-5{position:absolute;width:190.6665px;height:20px;left:16px;top:12px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:14px;font-weight:400;line-height:20px;text-align:left;white-space:pre-wrap;color:#c0d0df}
#el-476-6{position:absolute;width:24px;height:44px;left:0px;top:0px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:36px;font-weight:600;line-height:44px;text-align:left;white-space:pre-wrap;color:#f28b94}
#el-491-12{position:absolute;width:62px;height:18px;left:128.6665px;top:26px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:12px;font-weight:400;line-height:18px;text-align:left;white-space:pre-wrap;color:#a9bed2}
#el-491-11{position:absolute;width:190.6665px;height:44px;left:16px;top:38px;border-radius:0px;overflow:hidden}
#el-491-14{position:absolute;width:33.1592px;height:4px;left:0px;top:0px;background:linear-gradient(#f28b94,#f28b94);border-radius:0px;overflow:hidden}
#el-491-15{position:absolute;width:157.5073px;height:4px;left:33.1592px;top:0px;border-radius:0px;overflow:hidden}
#el-491-13{position:absolute;width:190.6665px;height:4px;left:16px;top:88px;background:linear-gradient(#263d51,#263d51);border-radius:2px;overflow:hidden}
#el-476-4{position:absolute;width:222.6665px;height:104px;left:469.3335px;top:0px;background:linear-gradient(#182b3e,#182b3e);border-radius:4px;overflow:hidden;box-shadow:inset 0 0 0 1px #4b3948}
#el-476-8{position:absolute;width:190.667px;height:20px;left:16px;top:12px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:14px;font-weight:400;line-height:20px;text-align:left;white-space:pre-wrap;color:#c0d0df}
#el-476-9{position:absolute;width:23px;height:44px;left:0px;top:0px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:36px;font-weight:600;line-height:44px;text-align:left;white-space:pre-wrap;color:#f28b94}
#el-491-17{position:absolute;width:62px;height:18px;left:128.667px;top:26px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:12px;font-weight:400;line-height:18px;text-align:left;white-space:pre-wrap;color:#a9bed2}
#el-491-16{position:absolute;width:190.667px;height:44px;left:16px;top:38px;border-radius:0px;overflow:hidden}
#el-491-19{position:absolute;width:24.8691px;height:4px;left:0px;top:0px;background:linear-gradient(#f28b94,#f28b94);border-radius:0px;overflow:hidden}
#el-491-20{position:absolute;width:165.7969px;height:4px;left:24.8691px;top:0px;border-radius:0px;overflow:hidden}
#el-491-18{position:absolute;width:190.667px;height:4px;left:16px;top:88px;background:linear-gradient(#263d51,#263d51);border-radius:2px;overflow:hidden}
#el-476-7{position:absolute;width:222.667px;height:104px;left:704px;top:0px;background:linear-gradient(#182b3e,#182b3e);border-radius:4px;overflow:hidden;box-shadow:inset 0 0 0 1px #4b3948}
#el-476-11{position:absolute;width:190.667px;height:20px;left:16px;top:12px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:14px;font-weight:400;line-height:20px;text-align:left;white-space:pre-wrap;color:#c0d0df}
#el-476-12{position:absolute;width:23px;height:44px;left:0px;top:0px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:36px;font-weight:600;line-height:44px;text-align:left;white-space:pre-wrap;color:#e6a16c}
#el-491-22{position:absolute;width:62px;height:18px;left:128.666px;top:26px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:12px;font-weight:400;line-height:18px;text-align:left;white-space:pre-wrap;color:#a9bed2}
#el-491-21{position:absolute;width:190.667px;height:44px;left:16px;top:38px;border-radius:0px;overflow:hidden}
#el-491-24{position:absolute;width:24.8691px;height:4px;left:0px;top:0px;background:linear-gradient(#e6a16c,#e6a16c);border-radius:0px;overflow:hidden}
#el-491-25{position:absolute;width:165.7969px;height:4px;left:24.8691px;top:0px;border-radius:0px;overflow:hidden}
#el-491-23{position:absolute;width:190.667px;height:4px;left:16px;top:88px;background:linear-gradient(#263d51,#263d51);border-radius:2px;overflow:hidden}
#el-476-10{position:absolute;width:222.667px;height:104px;left:938.667px;top:0px;background:linear-gradient(#182b3e,#182b3e);border-radius:4px;overflow:hidden;box-shadow:inset 0 0 0 1px #514336}
#el-476-14{position:absolute;width:190.667px;height:20px;left:16px;top:12px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:14px;font-weight:400;line-height:20px;text-align:left;white-space:pre-wrap;color:#c0d0df}
#el-476-15{position:absolute;width:22px;height:44px;left:0px;top:0px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:36px;font-weight:600;line-height:44px;text-align:left;white-space:pre-wrap;color:#e6a16c}
#el-491-27{position:absolute;width:55px;height:18px;left:135.667px;top:26px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:12px;font-weight:400;line-height:18px;text-align:left;white-space:pre-wrap;color:#a9bed2}
#el-491-26{position:absolute;width:190.667px;height:44px;left:16px;top:38px;border-radius:0px;overflow:hidden}
#el-491-29{position:absolute;width:16.5801px;height:4px;left:0px;top:0px;background:linear-gradient(#e6a16c,#e6a16c);border-radius:0px;overflow:hidden}
#el-491-30{position:absolute;width:174.0869px;height:4px;left:16.5801px;top:0px;border-radius:0px;overflow:hidden}
#el-491-28{position:absolute;width:190.667px;height:4px;left:16px;top:88px;background:linear-gradient(#263d51,#263d51);border-radius:2px;overflow:hidden}
#el-476-13{position:absolute;width:222.667px;height:104px;left:1173.333px;top:0px;background:linear-gradient(#182b3e,#182b3e);border-radius:4px;overflow:hidden;box-shadow:inset 0 0 0 1px #514336}
#el-476-186{position:absolute;width:28px;height:41px;left:0px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:28px;font-weight:700;line-height:40.6px;text-align:left;white-space:pre-wrap;color:#e6f4ff}
#el-476-187{position:absolute;width:64px;height:36px;left:38px;top:2.5px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:30px;font-weight:600;line-height:36px;text-align:left;white-space:pre-wrap;color:#e6f4ff}
#el-476-185{position:absolute;width:102px;height:41px;left:0px;top:0px;border-radius:0px;overflow:hidden}
#el-476-188{position:absolute;width:126px;height:19px;left:0px;top:47px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:13px;font-weight:400;line-height:18.85px;text-align:left;white-space:pre-wrap;color:#33d999}
#el-476-184{position:absolute;width:126px;height:66px;left:24px;top:19px;border-radius:0px;overflow:hidden}
#el-476-189{position:absolute;width:1px;height:48px;left:170px;top:28px;background:linear-gradient(#315779,#315779);border-radius:0px;overflow:hidden}
#el-476-193{position:absolute;width:60px;height:20px;left:0px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:14px;font-weight:400;line-height:20.3px;text-align:left;white-space:pre-wrap;color:#a9bed2}
#el-476-194{position:absolute;width:90px;height:20px;left:0px;top:28px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:14px;font-weight:400;line-height:20.3px;text-align:left;white-space:pre-wrap;color:#a9bed2}
#el-476-191{position:absolute;width:114.5px;height:48px;left:0px;top:0px;border-radius:0px;overflow:hidden}
#el-476-195{position:absolute;width:71px;height:20px;left:0px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:14px;font-weight:400;line-height:20.3px;text-align:left;white-space:pre-wrap;color:#a9bed2}
#el-476-196{position:absolute;width:89px;height:20px;left:0px;top:28px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:14px;font-weight:400;line-height:20.3px;text-align:left;white-space:pre-wrap;color:#a9bed2}
#el-476-192{position:absolute;width:114.5px;height:48px;left:134.5px;top:0px;border-radius:0px;overflow:hidden}
#el-476-190{position:absolute;width:249px;height:48px;left:191px;top:28px;border-radius:0px;overflow:hidden}
#el-476-183{position:absolute;width:464px;height:104px;left:1408px;top:0px;background:linear-gradient(#102b46,#102b46);border-radius:2px;overflow:hidden;box-shadow:inset 0 0 0 1px #315779}
#el-472-1503{position:absolute;width:1872px;height:104px;left:24px;top:104px;border-radius:0px;overflow:hidden}
#el-472-1566{position:absolute;width:15px;height:16px;left:0px;top:5px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:13px;font-weight:600;line-height:15.6px;text-align:left;white-space:pre-wrap;color:#5bbcef}
#el-472-1567{position:absolute;width:144px;height:26px;left:23px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:18px;font-weight:600;line-height:26.1px;text-align:left;white-space:pre-wrap;color:#d8eefb}
#el-472-1568{position:absolute;width:201px;height:17px;left:175px;top:4.5px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:14px;font-weight:500;line-height:16.8px;text-align:right;white-space:pre-wrap;color:#a9bed2}
#el-472-1526{position:absolute;width:376px;height:26px;left:20px;top:20px;border-radius:0px;overflow:hidden}
#el-476-23{position:absolute;width:121.4199px;height:172.9805px;left:124px;top:2.583px;left:123px;top:1.5832px;width:123.42px;height:174.98px}
#el-476-24{position:absolute;width:154.3799px;height:121.4199px;left:79.5469px;top:124px;left:78.5468px;top:123px;width:156.38px;height:123.42px}
#el-476-25{position:absolute;width:121.1709px;height:112.9893px;left:2.8291px;top:124px;left:1.8291px;top:123.0001px;width:123.171px;height:114.989px}
#el-476-26{position:absolute;width:121.418px;height:96.2871px;left:2.582px;top:35.4502px;left:1.582px;top:34.4502px;width:123.418px;height:98.287px}
#el-476-27{position:absolute;width:83.0742px;height:102.3516px;left:40.9258px;top:21.6484px;left:39.9259px;top:20.6482px;width:85.074px;height:104.352px}
#el-476-28{position:absolute;width:65.3198px;height:111.5605px;left:58.6802px;top:12.4395px;left:57.6801px;top:11.4392px;width:67.32px;height:113.561px}
#el-476-29{position:absolute;width:47.9209px;height:116.999px;left:76.0791px;top:7.001px;left:75.0791px;top:6.001px;width:49.921px;height:118.999px}
#el-476-30{position:absolute;width:32.4399px;height:119.8213px;left:91.5601px;top:4.1787px;left:90.56px;top:3.1789px;width:34.44px;height:121.821px}
#el-476-31{position:absolute;width:19.6201px;height:121.126px;left:104.3799px;top:2.874px;left:103.3799px;top:1.874px;width:21.62px;height:123.126px}
#el-476-32{position:absolute;width:8.4409px;height:121.417px;left:115.5591px;top:2.583px;left:114.559px;top:1.583px;width:10.441px;height:123.417px}
#el-476-143{position:absolute;width:132px;height:132px;left:58px;top:58px;background:linear-gradient(#0b1b2f,#0b1b2f);border-radius:50%}
#el-476-145{position:absolute;width:73px;height:36px;left:29.5px;top:4.5px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:30px;font-weight:600;line-height:36px;text-align:left;white-space:pre-wrap;color:#e6f4ff}
#el-476-146{position:absolute;width:78px;height:17px;left:27px;top:42.5px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:12px;font-weight:400;line-height:17.4px;text-align:left;white-space:pre-wrap;color:#a9bed2}
#el-476-144{position:absolute;width:132px;height:64px;left:58px;top:92px;border-radius:0px;overflow:hidden}
#el-476-22{position:absolute;width:248px;height:248px;left:84px;top:58px;border-radius:0px;overflow:hidden}
#el-476-152{position:absolute;width:8px;height:8px;left:0px;top:6px;background:linear-gradient(#2fd6ff,#2fd6ff);border-radius:50%}
#el-476-55{position:absolute;width:56px;height:20px;left:16px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:14px;font-weight:500;line-height:20px;text-align:left;white-space:pre-wrap;color:#c8d8e6}
#el-476-151{position:absolute;width:116px;height:20px;left:0px;top:0px;border-radius:0px;overflow:hidden}
#el-476-154{position:absolute;width:8px;height:8px;left:0px;top:6px;background:linear-gradient(#3a8dff,#3a8dff);border-radius:50%}
#el-476-56{position:absolute;width:56px;height:20px;left:16px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:14px;font-weight:500;line-height:20px;text-align:left;white-space:pre-wrap;color:#c8d8e6}
#el-476-153{position:absolute;width:116px;height:20px;left:124px;top:0px;border-radius:0px;overflow:hidden}
#el-476-156{position:absolute;width:8px;height:8px;left:0px;top:6px;background:linear-gradient(#5ce1c8,#5ce1c8);border-radius:50%}
#el-476-57{position:absolute;width:56px;height:20px;left:16px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:14px;font-weight:500;line-height:20px;text-align:left;white-space:pre-wrap;color:#c8d8e6}
#el-476-155{position:absolute;width:116px;height:20px;left:248px;top:0px;border-radius:0px;overflow:hidden}
#el-476-158{position:absolute;width:8px;height:8px;left:0px;top:6px;background:linear-gradient(#8ab4ff,#8ab4ff);border-radius:50%}
#el-476-58{position:absolute;width:56px;height:20px;left:16px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:14px;font-weight:500;line-height:20px;text-align:left;white-space:pre-wrap;color:#c8d8e6}
#el-476-157{position:absolute;width:116px;height:20px;left:0px;top:30px;border-radius:0px;overflow:hidden}
#el-476-160{position:absolute;width:8px;height:8px;left:0px;top:6px;background:linear-gradient(#1fa9c9,#1fa9c9);border-radius:50%}
#el-476-59{position:absolute;width:56px;height:20px;left:16px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:14px;font-weight:500;line-height:20px;text-align:left;white-space:pre-wrap;color:#c8d8e6}
#el-476-159{position:absolute;width:116px;height:20px;left:124px;top:30px;border-radius:0px;overflow:hidden}
#el-476-162{position:absolute;width:8px;height:8px;left:0px;top:6px;background:linear-gradient(#6c7cff,#6c7cff);border-radius:50%}
#el-476-60{position:absolute;width:42px;height:20px;left:16px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:14px;font-weight:500;line-height:20px;text-align:left;white-space:pre-wrap;color:#c8d8e6}
#el-476-161{position:absolute;width:116px;height:20px;left:248px;top:30px;border-radius:0px;overflow:hidden}
#el-476-164{position:absolute;width:8px;height:8px;left:0px;top:6px;background:linear-gradient(#a7e8ff,#a7e8ff);border-radius:50%}
#el-476-61{position:absolute;width:56px;height:20px;left:16px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:14px;font-weight:500;line-height:20px;text-align:left;white-space:pre-wrap;color:#c8d8e6}
#el-476-163{position:absolute;width:116px;height:20px;left:0px;top:60px;border-radius:0px;overflow:hidden}
#el-476-166{position:absolute;width:8px;height:8px;left:0px;top:6px;background:linear-gradient(#4e6fb8,#4e6fb8);border-radius:50%}
#el-476-62{position:absolute;width:56px;height:20px;left:16px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:14px;font-weight:500;line-height:20px;text-align:left;white-space:pre-wrap;color:#c8d8e6}
#el-476-165{position:absolute;width:116px;height:20px;left:124px;top:60px;border-radius:0px;overflow:hidden}
#el-476-168{position:absolute;width:8px;height:8px;left:0px;top:6px;background:linear-gradient(#2e9c8f,#2e9c8f);border-radius:50%}
#el-476-63{position:absolute;width:42px;height:20px;left:16px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:14px;font-weight:500;line-height:20px;text-align:left;white-space:pre-wrap;color:#c8d8e6}
#el-476-167{position:absolute;width:116px;height:20px;left:248px;top:60px;border-radius:0px;overflow:hidden}
#el-476-170{position:absolute;width:8px;height:8px;left:0px;top:6px;background:linear-gradient(#7d93b2,#7d93b2);border-radius:50%}
#el-476-64{position:absolute;width:56px;height:20px;left:16px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:14px;font-weight:500;line-height:20px;text-align:left;white-space:pre-wrap;color:#c8d8e6}
#el-476-169{position:absolute;width:116px;height:20px;left:0px;top:90px;border-radius:0px;overflow:hidden}
#el-476-40{position:absolute;width:376px;height:110px;left:20px;top:318px;border-radius:0px;overflow:hidden}
#el-472-1512{position:absolute;width:416px;height:440px;left:0px;top:0px;background:linear-gradient(180deg,#0f243d 0%,#071326 100%);border-radius:2px;overflow:hidden;box-shadow:inset 0 0 0 1px #315779}
#el-472-1628{position:absolute;width:17px;height:16px;left:0px;top:5px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:13px;font-weight:600;line-height:15.6px;text-align:left;white-space:pre-wrap;color:#5bbcef}
#el-472-1629{position:absolute;width:72px;height:26px;left:25px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:18px;font-weight:600;line-height:26.1px;text-align:left;white-space:pre-wrap;color:#d8eefb}
#el-472-1630{position:absolute;width:271px;height:15px;left:105px;top:5.5px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:12px;font-weight:500;line-height:14.4px;text-align:right;white-space:pre-wrap;color:#a9bed2}
#el-472-1546{position:absolute;width:376px;height:26px;left:20px;top:20px;border-radius:0px;overflow:hidden}
#el-476-96{position:absolute;width:376px;height:19px;left:20px;top:58px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:13px;font-weight:400;line-height:18.85px;text-align:left;white-space:pre-wrap;color:#a9bed2}
#el-476-99{position:absolute;width:73px;height:22px;left:0px;top:25px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:18px;font-weight:600;line-height:21.6px;text-align:center;white-space:pre-wrap;color:#d8eefb}
#el-476-100{position:absolute;width:48px;height:190px;left:12.5px;top:53px;background:linear-gradient(#2fd6a8,#2fd6a8);border-radius:2px}
#el-476-101{position:absolute;width:73px;height:18px;left:0px;top:249px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:15px;font-weight:600;line-height:18px;text-align:center;white-space:pre-wrap;color:#2fd6a8}
#el-476-98{position:absolute;width:73px;height:267px;left:12px;top:0px;border-radius:0px;overflow:hidden}
#el-476-103{position:absolute;width:73px;height:22px;left:0px;top:137.4404px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:18px;font-weight:600;line-height:21.6px;text-align:center;white-space:pre-wrap;color:#d8eefb}
#el-476-104{position:absolute;width:48px;height:77.5596px;left:12.5px;top:165.4404px;background:linear-gradient(#2fb8ff,#2fb8ff);border-radius:2px}
#el-476-105{position:absolute;width:73px;height:18px;left:0px;top:249px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:15px;font-weight:600;line-height:18px;text-align:center;white-space:pre-wrap;color:#2fb8ff}
#el-476-102{position:absolute;width:73px;height:267px;left:105px;top:0px;border-radius:0px;overflow:hidden}
#el-476-107{position:absolute;width:73px;height:22px;left:0px;top:195.1602px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:18px;font-weight:600;line-height:21.6px;text-align:center;white-space:pre-wrap;color:#d8eefb}
#el-476-108{position:absolute;width:48px;height:19.8398px;left:12.5px;top:223.1602px;background:linear-gradient(#ffb45c,#ffb45c);border-radius:2px}
#el-476-109{position:absolute;width:73px;height:18px;left:0px;top:249px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:15px;font-weight:600;line-height:18px;text-align:center;white-space:pre-wrap;color:#ffb45c}
#el-476-106{position:absolute;width:73px;height:267px;left:198px;top:0px;border-radius:0px;overflow:hidden}
#el-476-111{position:absolute;width:73px;height:22px;left:0px;top:211px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:18px;font-weight:600;line-height:21.6px;text-align:center;white-space:pre-wrap;color:#d8eefb}
#el-476-112{position:absolute;width:48px;height:4px;left:12.5px;top:239px;background:linear-gradient(#ff6b7a,#ff6b7a);border-radius:1px}
#el-476-113{position:absolute;width:73px;height:18px;left:0px;top:249px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:15px;font-weight:600;line-height:18px;text-align:center;white-space:pre-wrap;color:#c89487}
#el-476-110{position:absolute;width:73px;height:267px;left:291px;top:0px;border-radius:0px;overflow:hidden}
#el-476-97{position:absolute;width:376px;height:267px;left:20px;top:89px;border-radius:0px;overflow:hidden}
#el-472-1517{position:absolute;width:416px;height:376px;left:0px;top:456px;background:linear-gradient(180deg,#0f243d 0%,#071326 100%);border-radius:2px;overflow:hidden;box-shadow:inset 0 0 0 1px #315779}
#el-476-139{position:absolute;width:416px;height:832px;left:0px;top:0px;border-radius:0px;overflow:hidden}
#el-472-1575{position:absolute;width:17px;height:16px;left:0px;top:5px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:13px;font-weight:600;line-height:15.6px;text-align:left;white-space:pre-wrap;color:#5bbcef}
#el-472-1576{position:absolute;width:144px;height:26px;left:25px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:18px;font-weight:600;line-height:26.1px;text-align:left;white-space:pre-wrap;color:#d8eefb}
#el-472-1577{position:absolute;width:88px;height:13px;left:177px;top:6.5px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:11px;font-weight:500;line-height:13.2px;text-align:left;white-space:pre-wrap;color:#a9bed2}
#el-472-1737{position:absolute;width:8px;height:8px;left:0px;top:5.5px;background:linear-gradient(#7bc67e,#7bc67e);border-radius:50%}
#el-472-1738{position:absolute;width:26px;height:19px;left:14px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:13px;font-weight:400;line-height:18.85px;text-align:left;white-space:pre-wrap;color:#88a6bd}
#el-472-1680{position:absolute;width:40px;height:19px;left:447px;top:0px;border-radius:0px;overflow:hidden}
#el-472-1739{position:absolute;width:8px;height:8px;left:0px;top:5.5px;background:linear-gradient(#6ac3f5,#6ac3f5);border-radius:50%}
#el-472-1740{position:absolute;width:26px;height:19px;left:14px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:13px;font-weight:400;line-height:18.85px;text-align:left;white-space:pre-wrap;color:#88a6bd}
#el-472-1681{position:absolute;width:40px;height:19px;left:503px;top:0px;border-radius:0px;overflow:hidden}
#el-472-1741{position:absolute;width:8px;height:8px;left:0px;top:5.5px;background:linear-gradient(#f28b94,#f28b94);border-radius:50%}
#el-472-1742{position:absolute;width:26px;height:19px;left:14px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:13px;font-weight:400;line-height:18.85px;text-align:left;white-space:pre-wrap;color:#88a6bd}
#el-472-1682{position:absolute;width:40px;height:19px;left:559px;top:0px;border-radius:0px;overflow:hidden}
#el-472-1743{position:absolute;width:8px;height:8px;left:0px;top:5.5px;background:linear-gradient(#67849a,#67849a);border-radius:50%}
#el-472-1744{position:absolute;width:26px;height:19px;left:14px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:13px;font-weight:400;line-height:18.85px;text-align:left;white-space:pre-wrap;color:#88a6bd}
#el-472-1683{position:absolute;width:40px;height:19px;left:615px;top:0px;border-radius:0px;overflow:hidden}
#el-472-1578{position:absolute;width:655px;height:19px;left:273px;top:3.5px;border-radius:0px;overflow:hidden}
#el-472-1529{position:absolute;width:928px;height:26px;left:16px;top:16px;border-radius:0px;overflow:hidden}
#el-472-1579{position:absolute;width:928px;height:461.0332px;left:0px;top:0px}
#el-472-1838{position:absolute;width:91px;height:20px;left:0px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:14px;font-weight:700;line-height:20.3px;text-align:left;white-space:pre-wrap;color:#f28b94}
#el-472-1839{position:absolute;width:51px;height:15px;left:213px;top:2.5px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:12px;font-weight:500;line-height:14.4px;text-align:left;white-space:pre-wrap;color:#88a6bd}
#el-472-1697{position:absolute;width:264px;height:20px;left:14px;top:14px;border-radius:0px;overflow:hidden}
#el-472-1698{position:absolute;width:112px;height:23px;left:14px;top:42px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:16px;font-weight:600;line-height:23.2px;text-align:left;white-space:pre-wrap;color:#d8eefb}
#el-472-1699{position:absolute;width:188px;height:19px;left:14px;top:73px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:13px;font-weight:400;line-height:18.85px;text-align:left;white-space:pre-wrap;color:#a9bed2}
#el-472-1580{position:absolute;width:292px;height:106px;left:620px;top:16px;background:linear-gradient(#132536,#132536);border-radius:2px;overflow:hidden;box-shadow:inset 0 0 0 1px #f28b94;box-shadow:inset 0 0 0 1px #f28b94,0px 6px 20px 0px rgba(242,140,148,0.3)}
#el-472-1840{position:absolute;width:60px;height:17px;left:8px;top:2px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:12px;font-weight:600;line-height:17.4px;text-align:left;white-space:pre-wrap;color:#b4e5ff}
#el-472-1700{position:absolute;width:76px;height:21px;left:10px;top:9.5px;background:linear-gradient(#235174,#235174);border-radius:6px;overflow:hidden}
#el-472-1701{position:absolute;width:782px;height:20px;left:98px;top:10px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:14px;font-weight:400;line-height:20.3px;text-align:left;white-space:pre-wrap;color:#a9bed2}
#el-472-1581{position:absolute;width:896px;height:40px;left:16px;top:402px;background:linear-gradient(#0b1b31,#0b1b31);border-radius:10px;overflow:hidden;box-shadow:inset 0 0 0 1px #315779}
#el-472-1530{position:absolute;width:928px;height:458px;left:16px;top:54px;background:linear-gradient(#071326,#071326);border-radius:2px;overflow:hidden}
#el-472-1513{position:absolute;width:960px;height:528px;left:0px;top:0px;background:linear-gradient(180deg,#0f243d 0%,#071326 100%);border-radius:2px;overflow:hidden;box-shadow:inset 0 0 0 1px #315779}
#el-472-1622{position:absolute;width:18px;height:16px;left:0px;top:5px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:13px;font-weight:600;line-height:15.6px;text-align:left;white-space:pre-wrap;color:#5bbcef}
#el-472-1623{position:absolute;width:119px;height:26px;left:26px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:18px;font-weight:600;line-height:26.1px;text-align:left;white-space:pre-wrap;color:#d8eefb}
#el-472-1624{position:absolute;width:684px;height:13px;left:153px;top:6.5px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:11px;font-weight:500;line-height:13.2px;text-align:left;white-space:pre-wrap;color:#a9bed2}
#el-472-1625{position:absolute;width:75px;height:19px;left:845px;top:3.5px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:13px;font-weight:400;line-height:18.85px;text-align:left;white-space:pre-wrap;color:#a9bed2}
#el-472-1544{position:absolute;width:920px;height:26px;left:20px;top:20px;border-radius:0px;overflow:hidden}
#el-476-72{position:absolute;width:160px;height:23px;left:0px;top:6.2998px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:16px;font-weight:500;line-height:23.2px;text-align:left;white-space:pre-wrap;color:#d8eefb}
#el-476-74{position:absolute;width:591.68px;height:12px;left:0px;top:0px;background:linear-gradient(#87bbd2,#87bbd2);border-radius:2px}
#el-476-73{position:absolute;width:664px;height:12px;left:172px;top:11.7998px;background:linear-gradient(#1d3b56,#1d3b56);border-radius:2px;overflow:hidden}
#el-476-75{position:absolute;width:72px;height:21px;left:848px;top:7.2998px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:17px;font-weight:600;line-height:20.4px;text-align:right;white-space:pre-wrap;color:#d8eefb}
#el-476-71{position:absolute;width:920px;height:35.5996px;left:0px;top:0px;border-radius:0px;overflow:hidden}
#el-476-77{position:absolute;width:160px;height:23px;left:0px;top:6.3008px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:16px;font-weight:500;line-height:23.2px;text-align:left;white-space:pre-wrap;color:#d8eefb}
#el-476-79{position:absolute;width:550.59px;height:12px;left:0px;top:0px;background:linear-gradient(#87bbd2,#87bbd2);border-radius:2px}
#el-476-78{position:absolute;width:664px;height:12px;left:172px;top:11.8008px;background:linear-gradient(#1d3b56,#1d3b56);border-radius:2px;overflow:hidden}
#el-476-80{position:absolute;width:72px;height:21px;left:848px;top:7.3008px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:17px;font-weight:600;line-height:20.4px;text-align:right;white-space:pre-wrap;color:#d8eefb}
#el-476-76{position:absolute;width:920px;height:35.5996px;left:0px;top:43.5996px;border-radius:0px;overflow:hidden}
#el-476-82{position:absolute;width:160px;height:23px;left:0px;top:6.2998px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:16px;font-weight:500;line-height:23.2px;text-align:left;white-space:pre-wrap;color:#d8eefb}
#el-476-84{position:absolute;width:534.16px;height:12px;left:0px;top:0px;background:linear-gradient(#87bbd2,#87bbd2);border-radius:2px}
#el-476-83{position:absolute;width:664px;height:12px;left:172px;top:11.7998px;background:linear-gradient(#1d3b56,#1d3b56);border-radius:2px;overflow:hidden}
#el-476-85{position:absolute;width:72px;height:21px;left:848px;top:7.2998px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:17px;font-weight:600;line-height:20.4px;text-align:right;white-space:pre-wrap;color:#d8eefb}
#el-476-81{position:absolute;width:920px;height:35.5996px;left:0px;top:87.2002px;border-radius:0px;overflow:hidden}
#el-476-87{position:absolute;width:160px;height:23px;left:0px;top:6.2998px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:16px;font-weight:500;line-height:23.2px;text-align:left;white-space:pre-wrap;color:#d8eefb}
#el-476-89{position:absolute;width:504.57px;height:12px;left:0px;top:0px;background:linear-gradient(#87bbd2,#87bbd2);border-radius:2px}
#el-476-88{position:absolute;width:664px;height:12px;left:172px;top:11.7998px;background:linear-gradient(#1d3b56,#1d3b56);border-radius:2px;overflow:hidden}
#el-476-90{position:absolute;width:72px;height:21px;left:848px;top:7.2998px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:17px;font-weight:600;line-height:20.4px;text-align:right;white-space:pre-wrap;color:#d8eefb}
#el-476-86{position:absolute;width:920px;height:35.5996px;left:0px;top:130.7998px;border-radius:0px;overflow:hidden}
#el-476-92{position:absolute;width:160px;height:23px;left:0px;top:6.2998px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:16px;font-weight:500;line-height:23.2px;text-align:left;white-space:pre-wrap;color:#d8eefb}
#el-476-94{position:absolute;width:474.99px;height:12px;left:0px;top:0px;background:linear-gradient(#87bbd2,#87bbd2);border-radius:2px}
#el-476-93{position:absolute;width:664px;height:12px;left:172px;top:11.7998px;background:linear-gradient(#1d3b56,#1d3b56);border-radius:2px;overflow:hidden}
#el-476-95{position:absolute;width:72px;height:21px;left:848px;top:7.2998px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:17px;font-weight:600;line-height:20.4px;text-align:right;white-space:pre-wrap;color:#d8eefb}
#el-476-91{position:absolute;width:920px;height:35.5996px;left:0px;top:174.4004px;border-radius:0px;overflow:hidden}
#el-472-1545{position:absolute;width:920px;height:210px;left:20px;top:58px;border-radius:0px;overflow:hidden}
#el-472-1516{position:absolute;width:960px;height:288px;left:0px;top:544px;background:linear-gradient(180deg,#0f243d 0%,#071326 100%);border-radius:2px;overflow:hidden;box-shadow:inset 0 0 0 1px #315779}
#el-476-140{position:absolute;width:960px;height:832px;left:432px;top:0px;border-radius:0px;overflow:hidden}
#el-476-46{position:absolute;width:17px;height:16px;left:0px;top:5px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:13px;font-weight:600;line-height:15.6px;text-align:left;white-space:pre-wrap;color:#5bbcef}
#el-476-47{position:absolute;width:72px;height:26px;left:25px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:18px;font-weight:600;line-height:26.1px;text-align:left;white-space:pre-wrap;color:#d8eefb}
#el-476-48{position:absolute;width:319px;height:15px;left:105px;top:5.5px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:12px;font-weight:500;line-height:14.4px;text-align:right;white-space:pre-wrap;color:#a9bed2}
#el-476-43{position:absolute;width:424px;height:26px;left:20px;top:20px;border-radius:0px;overflow:hidden}
#el-476-115{position:absolute;width:334px;height:23px;left:0px;top:0.5px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:16px;font-weight:500;line-height:23.2px;text-align:left;white-space:pre-wrap;color:#ff6b7a}
#el-476-130{position:absolute;width:54px;height:16px;left:346px;top:4px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:13px;font-weight:400;line-height:15.6px;text-align:left;white-space:pre-wrap;color:#a9bed2}
#el-476-129{position:absolute;width:400px;height:24px;left:12px;top:7.4004px;border-radius:0px;overflow:hidden}
#el-476-116{position:absolute;width:400px;height:20px;left:12px;top:37.4004px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:13px;font-weight:400;line-height:20px;text-align:left;white-space:pre-wrap;color:#a9bed2}
#el-476-114{position:absolute;width:424px;height:64.7998px;left:20px;top:56px;background:linear-gradient(#142d46,#142d46);border-radius:2px;overflow:hidden}
#el-476-118{position:absolute;width:338px;height:23px;left:0px;top:0.5px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:16px;font-weight:500;line-height:23.2px;text-align:left;white-space:pre-wrap;color:#ffa05c}
#el-476-132{position:absolute;width:50px;height:16px;left:350px;top:4px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:13px;font-weight:400;line-height:15.6px;text-align:left;white-space:pre-wrap;color:#a9bed2}
#el-476-131{position:absolute;width:400px;height:24px;left:12px;top:7.4004px;border-radius:0px;overflow:hidden}
#el-476-119{position:absolute;width:400px;height:20px;left:12px;top:37.4004px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:13px;font-weight:400;line-height:20px;text-align:left;white-space:pre-wrap;color:#a9bed2}
#el-476-117{position:absolute;width:424px;height:64.7998px;left:20px;top:130.7998px;background:linear-gradient(#142d46,#142d46);border-radius:2px;overflow:hidden}
#el-476-121{position:absolute;width:334px;height:23px;left:0px;top:0.5px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:16px;font-weight:500;line-height:23.2px;text-align:left;white-space:pre-wrap;color:#ffd166}
#el-476-134{position:absolute;width:54px;height:16px;left:346px;top:4px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:13px;font-weight:400;line-height:15.6px;text-align:left;white-space:pre-wrap;color:#a9bed2}
#el-476-133{position:absolute;width:400px;height:24px;left:12px;top:7.4004px;border-radius:0px;overflow:hidden}
#el-476-122{position:absolute;width:400px;height:20px;left:12px;top:37.4004px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:13px;font-weight:400;line-height:20px;text-align:left;white-space:pre-wrap;color:#a9bed2}
#el-476-120{position:absolute;width:424px;height:64.7998px;left:20px;top:205.5996px;background:linear-gradient(#142d46,#142d46);border-radius:2px;overflow:hidden}
#el-476-124{position:absolute;width:334px;height:23px;left:0px;top:0.5px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:16px;font-weight:500;line-height:23.2px;text-align:left;white-space:pre-wrap;color:#2fd6ff}
#el-476-136{position:absolute;width:54px;height:16px;left:346px;top:4px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:13px;font-weight:400;line-height:15.6px;text-align:left;white-space:pre-wrap;color:#a9bed2}
#el-476-135{position:absolute;width:400px;height:24px;left:12px;top:7.3994px;border-radius:0px;overflow:hidden}
#el-476-125{position:absolute;width:400px;height:20px;left:12px;top:37.3994px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:13px;font-weight:400;line-height:20px;text-align:left;white-space:pre-wrap;color:#a9bed2}
#el-476-123{position:absolute;width:424px;height:64.7998px;left:20px;top:280.4004px;background:linear-gradient(#142d46,#142d46);border-radius:2px;overflow:hidden}
#el-476-127{position:absolute;width:338px;height:23px;left:0px;top:0.5px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:16px;font-weight:500;line-height:23.2px;text-align:left;white-space:pre-wrap;color:#3a8dff}
#el-476-138{position:absolute;width:50px;height:16px;left:350px;top:4px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:13px;font-weight:400;line-height:15.6px;text-align:left;white-space:pre-wrap;color:#a9bed2}
#el-476-137{position:absolute;width:400px;height:24px;left:12px;top:7.3994px;border-radius:0px;overflow:hidden}
#el-476-128{position:absolute;width:400px;height:20px;left:12px;top:37.3994px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:13px;font-weight:400;line-height:20px;text-align:left;white-space:pre-wrap;color:#a9bed2}
#el-476-126{position:absolute;width:424px;height:64.7998px;left:20px;top:355.2002px;background:linear-gradient(#142d46,#142d46);border-radius:2px;overflow:hidden}
#el-476-42{position:absolute;width:464px;height:440px;left:0px;top:0px;background:linear-gradient(180deg,#0f243d 0%,#071326 100%);border-radius:2px;overflow:hidden;box-shadow:inset 0 0 0 1px #315779}
#el-472-1582{position:absolute;width:17px;height:16px;left:0px;top:5px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:13px;font-weight:600;line-height:15.6px;text-align:left;white-space:pre-wrap;color:#5bbcef}
#el-472-1583{position:absolute;width:72px;height:26px;left:25px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:18px;font-weight:600;line-height:26.1px;text-align:left;white-space:pre-wrap;color:#d8eefb}
#el-472-1584{position:absolute;width:319px;height:15px;left:105px;top:5.5px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:12px;font-weight:500;line-height:14.4px;text-align:right;white-space:pre-wrap;color:#a9bed2}
#el-472-1531{position:absolute;width:424px;height:26px;left:20px;top:20px;border-radius:0px;overflow:hidden}
#el-476-34{position:absolute;width:109.666px;height:117.1514px;left:112px;top:2.333px;left:111px;top:1.3332px;width:111.666px;height:119.151px}
#el-476-35{position:absolute;width:109.4102px;height:108.6465px;left:112px;top:112px;left:111.0001px;top:111.0002px;width:111.41px;height:110.646px}
#el-476-36{position:absolute;width:104.5283px;height:109.667px;left:22.4062px;top:112px;left:21.4064px;top:111px;width:106.528px;height:111.667px}
#el-476-37{position:absolute;width:109.668px;height:85.5576px;left:2.332px;top:89.6875px;left:1.332px;top:88.6873px;width:111.668px;height:87.558px}
#el-476-38{position:absolute;width:107.374px;height:93.7012px;left:4.626px;top:18.2988px;left:3.626px;top:17.2989px;width:109.374px;height:95.701px}
#el-476-39{position:absolute;width:56.9805px;height:109.667px;left:55.0195px;top:2.333px;left:54.0198px;top:1.333px;width:58.98px;height:111.667px}
#el-476-147{position:absolute;width:116px;height:116px;left:54px;top:54px;background:linear-gradient(#0b1b2f,#0b1b2f);border-radius:50%}
#el-476-149{position:absolute;width:37px;height:36px;left:39.5px;top:2.5px;font-family:"Inter","Monitor SC",Arial,sans-serif;font-size:30px;font-weight:600;line-height:36px;text-align:left;white-space:pre-wrap;color:#e6f4ff}
#el-476-150{position:absolute;width:78px;height:17px;left:19px;top:40.5px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:12px;font-weight:400;line-height:17.4px;text-align:left;white-space:pre-wrap;color:#a9bed2}
#el-476-148{position:absolute;width:116px;height:60px;left:54px;top:82px;border-radius:0px;overflow:hidden}
#el-476-33{position:absolute;width:224px;height:224px;left:0px;top:35px;border-radius:0px;overflow:hidden}
#el-476-172{position:absolute;width:10px;height:10px;left:0px;top:6px;background:linear-gradient(#ff6b7a,#ff6b7a);border-radius:2px;overflow:hidden}
#el-476-65{position:absolute;width:168px;height:22px;left:20px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:14px;font-weight:500;line-height:22px;text-align:left;white-space:pre-wrap;color:#c8d8e6}
#el-476-171{position:absolute;width:188px;height:22px;left:0px;top:0px;border-radius:0px;overflow:hidden}
#el-476-174{position:absolute;width:10px;height:10px;left:0px;top:6px;background:linear-gradient(#ffa05c,#ffa05c);border-radius:2px;overflow:hidden}
#el-476-66{position:absolute;width:168px;height:22px;left:20px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:14px;font-weight:500;line-height:22px;text-align:left;white-space:pre-wrap;color:#c8d8e6}
#el-476-173{position:absolute;width:188px;height:22px;left:0px;top:36px;border-radius:0px;overflow:hidden}
#el-476-176{position:absolute;width:10px;height:10px;left:0px;top:6px;background:linear-gradient(#ffd166,#ffd166);border-radius:2px;overflow:hidden}
#el-476-67{position:absolute;width:168px;height:22px;left:20px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:14px;font-weight:500;line-height:22px;text-align:left;white-space:pre-wrap;color:#c8d8e6}
#el-476-175{position:absolute;width:188px;height:22px;left:0px;top:72px;border-radius:0px;overflow:hidden}
#el-476-178{position:absolute;width:10px;height:10px;left:0px;top:6px;background:linear-gradient(#2fd6ff,#2fd6ff);border-radius:2px;overflow:hidden}
#el-476-68{position:absolute;width:168px;height:22px;left:20px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:14px;font-weight:500;line-height:22px;text-align:left;white-space:pre-wrap;color:#c8d8e6}
#el-476-177{position:absolute;width:188px;height:22px;left:0px;top:108px;border-radius:0px;overflow:hidden}
#el-476-180{position:absolute;width:10px;height:10px;left:0px;top:6px;background:linear-gradient(#3a8dff,#3a8dff);border-radius:2px;overflow:hidden}
#el-476-69{position:absolute;width:168px;height:22px;left:20px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:14px;font-weight:500;line-height:22px;text-align:left;white-space:pre-wrap;color:#c8d8e6}
#el-476-179{position:absolute;width:188px;height:22px;left:0px;top:144px;border-radius:0px;overflow:hidden}
#el-476-182{position:absolute;width:10px;height:10px;left:0px;top:6px;background:linear-gradient(#8c7cff,#8c7cff);border-radius:2px;overflow:hidden}
#el-476-70{position:absolute;width:168px;height:22px;left:20px;top:0px;font-family:"Monitor SC","Monitor SC",Arial,sans-serif;font-size:14px;font-weight:500;line-height:22px;text-align:left;white-space:pre-wrap;color:#c8d8e6}
#el-476-181{position:absolute;width:188px;height:22px;left:0px;top:180px;border-radius:0px;overflow:hidden}
#el-476-41{position:absolute;width:188px;height:202px;left:236px;top:46px;border-radius:0px;overflow:hidden}
#el-476-142{position:absolute;width:424px;height:294px;left:20px;top:62px;border-radius:0px;overflow:hidden}
#el-472-1514{position:absolute;width:464px;height:376px;left:0px;top:456px;background:linear-gradient(180deg,#0f243d 0%,#071326 100%);border-radius:2px;overflow:hidden;box-shadow:inset 0 0 0 1px #315779}
#el-476-141{position:absolute;width:464px;height:832px;left:1408px;top:0px;border-radius:0px;overflow:hidden}
#el-472-1504{position:absolute;width:1872px;height:832px;left:24px;top:224px;border-radius:0px;overflow:hidden}
#el-472-1501{position:absolute;width:1920px;height:1080px;left:0;top:0;background:linear-gradient(180deg,#142e4d 0%,#071326 55%,#060f1f 100%);border-radius:0px;overflow:hidden}
@font-face{font-family:"Monitor Topbar";src:url("/screen/assets/topbar-400.woff2") format("woff2");font-weight:400 600;font-display:swap}
@font-face{font-family:"Monitor Topbar";src:url("/screen/assets/topbar-700.woff2") format("woff2");font-weight:700;font-display:swap}
#viewport .topbar{position:absolute;left:24px;top:24px;display:flex;align-items:center;justify-content:space-between;width:1872px;height:64px;padding:0 24px;border-radius:0;background:linear-gradient(180deg,#173659 0%,#0a1a30 100%);box-shadow:inset 0 0 0 1px #315779;overflow:hidden;color:#d8eefb;font-family:"Monitor Topbar","Monitor SC",sans-serif}
#viewport .brand{display:flex;align-items:center;gap:14px;width:709px;height:32px;flex:none}
#viewport .logo{display:block;width:32px;height:32px;flex:none}
#viewport .platform-title{margin:0;width:506px;height:32px;line-height:32px;font-size:22px;font-weight:700;white-space:nowrap;flex:none;cursor:pointer;color:#d8eefb}
#viewport .platform-title:hover{color:#fff}
#viewport .monitor-status{display:flex;align-items:center;gap:6px;width:143px;height:25px;padding:4px 10px;border-radius:0;background:#102b46;box-shadow:inset 0 0 0 1px #315779;flex:none}
#viewport .status-dot{width:8px;height:8px;background:#7bc67e;border-radius:50%;flex:none}
#viewport .status-label{font-size:12px;font-weight:500;line-height:17px;color:#5bbcef;white-space:nowrap}
#viewport .tools{display:flex;align-items:center;gap:20px;width:500px;height:32px;flex:none}
#viewport .online-rule{width:151px;height:17px;font-size:12px;font-weight:400;line-height:17px;color:#a9bed2;white-space:nowrap;flex:none}
#viewport .timestamp{display:block;width:163px;height:19px;font-family:Inter,Arial,"Monitor Topbar",sans-serif;font-size:16px;font-weight:500;line-height:19px;white-space:pre;flex:none}
#viewport .current-user{display:flex;align-items:center;gap:10px;width:146px;height:32px;flex:none}
#viewport .avatar{display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:0;background:#173659;box-shadow:inset 0 0 0 1px #315779;color:#d8eefb;font-size:14px;font-weight:500;line-height:20px;flex:none}
#viewport .username{width:104px;height:19px;line-height:19px;font-size:13px;white-space:nowrap;font-weight:400;flex:none;overflow:hidden}

</style>
