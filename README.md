# Fleet Dashboard · public demo

A fleet-analytics workspace rebuilt as a static demo: three dashboards (fuel, maintenance, accidents) and the data-management page that feeds them. The original ran inside a company's Feishu tenant with a NestJS/PostgreSQL backend; this copy runs the same React client against an in-browser backend and a synthetic dataset.

**All figures are synthetic.** Names of the employer, suppliers, workshops and vendors are withheld. File upload and sign-in are not available and say so.

- Case study: https://zijun.cloud/en/projects/fleet-dashboard
- Stack: React 19 · TypeScript · Vite · Tailwind CSS v4 · shadcn/ui · ECharts (original backend: NestJS · Drizzle · PostgreSQL · Feishu 妙搭)

```bash
npm install
npm run dev        # http://localhost:4200
npm run build      # static output in dist/
```

See `PROJECT.md` for the disclosure policy and architecture, `docs/case-study.md` for the write-up.
