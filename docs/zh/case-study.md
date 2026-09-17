# Fleet Dashboard — 案例

给公用事业公司运输团队做的内部车队分析工具，基于飞书妙搭（Vite/React 前端，NestJS/PostgreSQL 后端）。本文只讲系统，不讲公司、供应商和真实数字；`[TO FILL]` 留给作者填。

## 问题

团队用三份 Power BI 看板汇报车队油耗、维修和事故。看板没有接任何系统：每个月有人下载油卡交易文件、行驶日志、维修系统的四份 CSV 和事故登记表，在 Excel 里清洗，再手工刷新报表。供应商文件里的错误——如果发现的话——要等图看起来不对才发现，也没有记录哪个文件产生了哪个数字。

## 做了什么

一个 web 应用，两半。

**三块看板**，按 Power BI 版式复刻在实时数据上：

- *Fuel Consumption* — 车队构成饼图、按车型的油费、月度汽油/柴油升数、月度 EV 用电，以及九张数字卡：汽油、柴油、电各自的量、费用、效率。筛选：年、月、车型、品牌型号。
- *Maintenance* — 平均可用率及其月度折线（带固定基准线）、按维修厂和按车型的工单数、按发票金额排序的第三方维修商、按工单类型和按车型堆叠的人工/配件/第三方成本。筛选：年、季、月、车型。
- *Accident* — 范围内事故按四类分布，四张小图按月对比所选年与上一年，共用坐标轴。筛选：类别、年、季、月。

**Data Management**，月度文件从这里进来：

- *Upload* — 每种来源一张卡（车队主表、油卡、行驶日志、EV 用电、维修系统五份文件、事故登记表、一次性历史导入），各自的解析器、文件类型校验和结果摘要。
- *Manual Entry* — 两家供应商每月只有十几张纸质发票，逐笔录入。
- *Reference Tables* — 油品映射表（供应商 + 产品名 → 汽油/柴油），带重复校验。
- *History* — 每次上传的读取/新增/更新/拒绝行数和解析器警告，按来源筛选，可导出。
- *About* — 在线编辑的系统说明，加各表行数和最近上传时间的实时快照。

## 决策

1. **一切有键，一切 upsert。** 加油交易键是供应商 + 单据号，工单键是工单号，可用率键是月份 + 车型，行程键是车牌 + 时间。改错重传会覆盖，不会重复。这暴露的唯一一个 bug——一份大 CSV 内部有重复键，触发 Postgres 的"同一行不能被影响两次"——通过每批先去重再 upsert 修掉，并把 SQLSTATE 转成可读的 400。
2. **拒绝，不猜。** 产品不在映射表里的加油交易被拒绝并计入上传结果。车牌不在车队表里的交易仍计入合计，但在图上单列为 *(Unmatched)*，缺口看得见而不是被悄悄吸收。
3. **效率只在两边都有数据的地方算。** km/L 是行驶日志公里数除以升数，但两个来源并不总覆盖相同的月份。分子按分母有数据的月份截断；当这比燃油基准月份少时，卡片会标注（`· Jan–Aug only`）。EV 用电按月只有一个汇总数，所以 EV 效率按设计就是车队级的。
4. **规则在查询里，不在表格里。** 已取消工单、范围外事故（非交通、责任未定）和已停用车辆由服务层排除。每次事故上传后，服务端校验四类之和等于范围内总数，不等则在 History 写警告。
5. **图要和团队熟悉的一样。** 燃料和车型的系列颜色固定在一个模块里；四张事故小图共用坐标轴上限；饼图 5% 以上标在扇区内、以下标在外；数字卡缩写成 K/M，悬停显示精确值，字号缩小而不换行。用 ECharts 而不是图表组件库，因为版式必须对齐 Power BI。
6. **上传是两步契约。** 前端把文件传到平台存储，把下载地址交给服务端；服务端流式下载、解析、upsert，再记录上传。大文件在前端做大小检查，服务端 50 MB 上限，提示用户按月拆分。

## 架构

```
浏览器（React 19、Vite、Tailwind、shadcn/ui、ECharts）
  pages/FuelConsumption、Maintenance、Accident、DataManagement
  api/*  → 平台工具包的 axios 实例
        ↓ /api/...
NestJS（模块：dashboard、maintenance、accident、fuel-transaction、
        fleet-vehicle、elogbook-trip、ev-monthly、fuel-product-map、
        upload-log、app-doc、export）
  按文件类型的解析器（xlsx / csv）→ 去重 → upsert（Drizzle）
        ↓
PostgreSQL：fleet_vehicle、fuel_transaction、elogbook_trip、ev_monthly、
  maint_order、maint_manpower、maint_part、maint_third_party、
  availability_month、accident_record、fuel_product_map、upload_log、app_doc
```

公开 demo 用一个替身替掉平台工具包，用浏览器内实现的同一组路由加固定种子数据替掉 NestJS（`client/src/platform/`）。页面代码除改名外未动。

## 技术栈

React 19 · TypeScript · Vite · Tailwind CSS v4 · shadcn/ui · ECharts · react-hook-form + zod · NestJS · Drizzle ORM · PostgreSQL · 飞书妙搭

## 数字

- 车队规模：`[TO FILL]`
- 每月导入文件数：`[TO FILL]`
- 替代的报表数：`[TO FILL]`
- 每月节省时间：`[TO FILL]`
