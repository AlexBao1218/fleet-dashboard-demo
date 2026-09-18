# Fleet Dashboard Demo — 项目手册

两部分。第一部分给 Alex 看，讲这个东西在哪、怎么预览、怎么放进个人网站。
第二部分给 AI 看，讲架构、规则和不能碰的东西。改代码前两部分都读。

---

## Part 1 · 给 Alex

### 这是什么

在公司用飞书妙搭做的车队看板（Fuel Consumption / Maintenance / Accident 三块 Power BI 复刻 + Data Management 上传、手工录入、油品映射、上传历史、系统说明）的公开作品集版本。前端页面原样保留，飞书运行时和 NestJS 后端各用一个浏览器内的替身替掉，数据全部用固定种子生成。

### 在哪

| 位置 | 地址 |
|---|---|
| 本地 | `~/Desktop/fleet-dashboard-demo` |
| GitHub | https://github.com/AlexBao1218/fleet-dashboard-demo（public） |
| 线上 | https://dashboard-demo.zijun.cloud（Vercel `alexbaos-projects/fleet-dashboard-demo`，别名 fleet-dashboard-demo.vercel.app） |
| 原始导出包 | `~/Downloads/dashboard.zip`（含 AGENTS.md 里的内部设计说明和原 README，不要上传到任何地方） |

### 原导出包里的凭证

`.env` 只有三个日志配置项，没有 token；`package.json` 的 `postinstall` 会调飞书 CLI，本仓库已删。没有发现密钥，但 AGENTS.md 里写着公司名、部门名、维修厂缩写和油卡供应商，等同于内部资料，留在本机即可。

### 本地预览

```bash
cd ~/Desktop/fleet-dashboard-demo && npm run dev
```

打开 http://localhost:4200。四个页面：`/fuel-consumption`、`/maintenance`、`/accident`、`/data-management`（`?tab=upload|manual|reference|history|about`）。侧边栏底部 **Reset demo** 丢掉你在浏览器里的改动（手工录入、映射表、About 编辑），重新载入固定种子的数据——每次都是同一组，不是随机的。

生产构建检查：

```bash
cd ~/Desktop/fleet-dashboard-demo && npm run typecheck && npm run lint && npm run build
```

### 披露级别（你 2026-09-17 选的：合成数据 + 记录级遮蔽）

- 全部数字由 `client/src/platform/seed.ts` 用固定种子生成：40 辆车（Private Car 14 / Van 12 / Lorry 8 / Motorcycle 6）、2025-01 到 2026-08 的加油、行驶、EV 用电、维修工单、事故记录。量级、比例都是编的，和真实车队无关。
- 名字：程序叫 **Fleet Dashboard**，公司名不出现；油卡供应商 `Fuel Card Supplier A`，手工录入两家 `Supplier B / C`；维修厂 `Depot A / B`；第三方维修商 `Vendor 01–12`；车牌 `DEMO 101–142`；工单号 `YYYYMM-00001`；上传人 `Demo user`。
- 保留：车型四类、事故四类、月份轴、图表形状、油品映射表结构、上传历史表结构。
- 每块看板 "Data up to" 旁边有 **Synthetic data** 小标签（悬停有说明），侧边栏写着 "Public demo · synthetic data"，About 页第一段也说明数据是合成的。
- 灰条 `Redacted for public demo`（`components/Redacted.tsx`）用在真实系统里会是真名字的位置：上传人、第三方维修商（图上只留排名 #1–#15）。
- 原提示文字里的内部流程细节（账户数、上线时间线、内部文件名/sheet 名、维修数据起始年份）已删。

想换成"只留结构"，改 `client/src/lib/brand.ts` 和 `seed.ts` 即可，页面代码不用动。

### 不可用的功能

文件上传（七种）、飞书登录、平台文档存储。上传卡片选完文件点 Confirm 会显示 "File upload: Not available in the public demo"。其余全部可用：三页筛选器、手工录入增删、油品映射增改删（含重复校验）、EV 按月删除、上传历史、CSV 导出（导的是合成数据）、About 编辑（存浏览器）。

### 发布

仓库已 public（2026-09-17）。改完代码 `git push` 即可；线上要重新发布见下一节。

### 部署到 Vercel

已部署（2026-09-17）。重新发布：

```bash
cd ~/Desktop/fleet-dashboard-demo && vercel --prod --scope alexbaos-projects
```

域名 `dashboard-demo.zijun.cloud` 已绑定并验证（DNSPod CNAME → cname.vercel-dns.com，`_vercel` TXT）。

### 放进 zijun.cloud

1. `content/work/{en,zh}.json` 的 `cards` 加一张，slug `fleet-dashboard`，colour 用和 Fleet / Insurance 同组的蓝色。
2. 新建 `content/projects/fleet-dashboard/{en,zh}.json`，素材取 `docs/portfolio-summary.md` 和 `docs/case-study.md`。
3. `public/projects/fleet-dashboard/cover.png`：Fuel Consumption 页 1600×900 截图。
4. `meta.url` 填 demo 线上地址。

case study 里有 `[TO FILL]`（真实车队规模、每月文件数、替代的 Power BI 报表数、节省的时间），发布前填掉或删掉。

---

## Part 2 · For AI agents

Read this before touching any file. The rules under "Disclosure policy" were set by the owner and are not negotiable.

### Purpose

Public portfolio demo of an internal fleet-analytics app the owner built on Feishu 妙搭 (Vite/React client + NestJS/Postgres server). The demo shows the system — dashboards, data-management workflow, engineering decisions — not the employer's data.

### Disclosure policy (hard rules)

1. **No company name, real or fictional.** `PROGRAM_NAME` = "Fleet Dashboard" (`client/src/lib/brand.ts`). Never invent a stand-in company, supplier, workshop or person. Placeholders are letters and numbers.
2. **Synthetic, not derived.** Every figure comes from `client/src/platform/seed.ts` with a fixed seed. Never copy a number, ratio, axis maximum or row count from the original export, screenshots or docs into code, seed or prose. `[TO FILL]` in the case study is for the owner.
3. **Withheld names:** employer, its department and programme names, the fuel-card issuer and the two manual-entry suppliers, both depots, third-party workshops, worker names, real plates, real order numbers, the workshop system's name, the maintenance export file names. All were renamed in `shared/*` and the pages (`fuel_card`, `maint`, `Supplier B/C`, `Depot A/B`, `Vendor NN`).
4. **May show:** vehicle classes, accident categories, order types, fuel product names of the generic kind (`Unleaded 95`), month labels, chart shapes, table structures, workflow copy.
5. **Platform-only features say so.** File upload and sign-in throw `NOT_AVAILABLE`; do not add a client-side parser or a fake storage layer. The About document is demo copy written for this repo, not the original.
6. Run the leak scan below before every commit.

### Architecture

Vite + React 19 + TypeScript + Tailwind v4 + shadcn/ui + ECharts. Static SPA, no server.

```
client/src/
  platform/index.tsx      shim for @lark-apaas/client-toolkit: logger, demo user, getDataloom
                          (uploadFile throws), UniversalLink, AppContainer, ErrorRender,
                          NotFoundRender, axiosForBackend → backend.ts, antd-style <Table>
  platform/backend.ts     every /api route with the original services' aggregation rules
  platform/seed.ts        the synthetic dataset (fleet, fuel, trips, EV, maintenance,
                          availability, accidents, product map, upload logs, app doc)
  platform/system-guide.ts  markdown shown on the About tab
  platform/store.ts       localStorage persistence (key fleet-dashboard-demo:store), resetDemoData()
  lib/brand.ts            PROGRAM_NAME, SUPPLIERS, DEPOTS, NOT_AVAILABLE, CASE_STUDY_URL
  components/Layout.tsx   sidebar: branding, nav, Reset demo
  components/Redacted.tsx grey bar for withheld record-level values (uploader, vendor names)
  components/SyntheticBadge.tsx  "Synthetic data" chip beside each dashboard's cutoff
  pages/                  original page code; edits limited to renames, the ThirdParty chart
                          (data-driven axis, ranked grey bars for vendors), the Synthetic chip,
                          scrubbed hint copy and the maintenance year list
  api/                    original client API layer, untouched except renames
shared/                   original shared types, renamed
docs/                     case study EN/ZH, portfolio blurb
```

Vite and tsconfig alias `@lark-apaas/client-toolkit*` to the shim, so page code still imports the original names.

### Commands

```bash
npm run dev        # http://localhost:4200
npm run typecheck  # tsc, must be clean
npm run lint       # eslint, 0 errors (6 warnings inherited from the original pages)
npm run build      # vite build → dist/
```

Leak scan (must print nothing). The word list — employer, department, fuel-card issuer, the two manual-entry suppliers, both depot codes, the workshop system's name, the platform CDN host — lives outside the repo in the owner's notes; run it as:

```bash
grep -rniwf ~/path/to/leak-words.txt client shared docs dist README.md PROJECT.md
```

Platform names — Feishu, 妙搭, `@lark-apaas/*` — are fine; they describe the stack, not the employer.

### Conventions

- Keep page code diff-minimal against the original; demo behaviour lives in `platform/` and `lib/brand.ts`.
- Aggregations in `backend.ts` mirror the original NestJS services one-to-one (month-filter semantics, `(Unmatched)` class, efficiency numerator truncated to denominator months, cancelled orders excluded, in-scope accidents only). Change them only if the original changed.
- Seed data is deterministic; bump `STORE_VERSION` when the seed shape changes so stale localStorage is discarded.
- Errors thrown from the backend are `BackendError` (axios-shaped) so the pages' existing `isAxiosError` handling works.

### Verification before claiming done

1. typecheck, lint, build all clean.
2. Leak scan empty (source and `dist/`).
3. Browser pass at 1600×900 and 375px: three dashboards with each filter changed once; Data Management — upload refusal on one card, manual entry add + delete, product map new (duplicate rejected) + edit + delete, history filter, about renders; fresh-load console clean.
