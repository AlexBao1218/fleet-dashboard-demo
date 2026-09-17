# Portfolio card: Fleet Dashboard

Material for the project card and page on the personal website. The company is not named; the public demo uses a synthetic dataset and states what is unavailable.

---

## English

### Blurb (about 130 words)

A fleet-analytics workspace for a utility company's transport team, replacing three Power BI reports that were rebuilt by hand every month from supplier spreadsheets. Fuel Consumption, Maintenance and Accident dashboards reproduce the reports' layouts on live data; a Data Management page loads each monthly export through its own parser, upserts by key so corrections overwrite instead of duplicating, records every upload with rows read/added/updated/rejected and the parser's warnings, and keeps a fuel-product map so an unmapped product is rejected rather than guessed. Efficiency figures divide logbook kilometres by litres only over months where both exist, and say so on the card. Built on Feishu 妙搭 with React, TypeScript, ECharts, NestJS and PostgreSQL; the public demo runs the same client on a synthetic fleet with an in-browser backend.

### Tech tags

React 19 · TypeScript · Vite · Tailwind CSS · shadcn/ui · ECharts · NestJS · PostgreSQL · Drizzle · Feishu 妙搭

### Highlights

- Four supplier exports, one workshop export and a manual-entry form feed one schema; every row is keyed and upserted, every upload is logged with counts and warnings, so a bad month traces back to a file.
- Power BI layouts reproduced with ECharts to the pixel — fixed series colours per fuel and vehicle type, shared axes across small multiples, K/M-abbreviated cards with exact values on hover — so the team kept the charts it knew.
- Honest numbers: efficiency numerators are truncated to the months the denominator covers and the card labels the gap; fuel on unknown plates is shown as *(Unmatched)*; cancelled orders and out-of-scope incidents are excluded by rule, not by hand.

---

## 中文

### 简介（约 150 字）

给公用事业公司运输团队做的车队分析工作台，替代每月从供应商表格手工重做的三份 Power BI 报表。Fuel Consumption、Maintenance、Accident 三块看板按原报表版式复刻在实时数据上；Data Management 页把每份月度导出交给各自的解析器，按键 upsert（改错重传会覆盖不会重复），每次上传记录读取/新增/更新/拒绝行数和解析器警告，油品映射表保证未映射的产品被拒绝而不是被猜测。效率指标只在分子分母都有数据的月份上相除，并在卡片上注明覆盖范围。基于飞书妙搭，用 React、TypeScript、ECharts、NestJS、PostgreSQL 实现；公开 demo 用同一套前端跑在合成车队和浏览器内后端上。

### 技术标签

React 19 · TypeScript · Vite · Tailwind CSS · shadcn/ui · ECharts · NestJS · PostgreSQL · Drizzle · 飞书妙搭

### 亮点

- 四种供应商导出、一套维修系统导出和一个手工录入表单进同一套 schema；每行有键、每次 upsert、每次上传留痕（行数 + 警告），某个月出问题能追到具体文件。
- 用 ECharts 逐像素复刻 Power BI 版式——燃料/车型固定配色、四张小图共用坐标轴、K/M 缩写数字卡悬停显示精确值——团队继续用熟悉的图。
- 数字诚实：效率分子按分母有数据的月份截断并在卡片标注；车牌对不上车队表的油费单列 *(Unmatched)*；已取消工单和范围外事故按规则排除，不靠人手。
