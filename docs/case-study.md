# Fleet Dashboard — case study

An internal fleet-analytics tool for a utility company's transport team, built on Feishu 妙搭 (Vite/React client, NestJS/PostgreSQL server). This document describes the system; the employer, its suppliers and its figures are withheld. Bracketed `[TO FILL]` items are for the owner.

## Problem

The team reported fleet fuel, maintenance and accidents in three Power BI dashboards. The dashboards were not connected to any system: each month someone downloaded the fuel-card transaction file, the trip logbook, the workshop's four CSV exports and the accident register, cleaned them in Excel, and refreshed the reports by hand. Errors in a supplier file were found — if at all — when a chart looked wrong, and there was no record of which file had produced which number.

## What was built

One web app with two halves.

**Three dashboards** that reproduce the Power BI layouts on live data:

- *Fuel Consumption* — fleet composition pie, fuel cost by vehicle type, monthly petrol/diesel litres, monthly EV kWh, and nine cards: volume, cost and efficiency for petrol, diesel and electric. Filters: year, month, vehicle class, make & model.
- *Maintenance* — average availability and its monthly line against a fixed baseline, orders by depot and by vehicle type, top third-party workshops by invoiced cost, and cost stacked into labour / parts / third-party by order type and by vehicle type. Filters: year, quarter, month, vehicle type.
- *Accident* — in-scope accidents by category, and four small multiples comparing the selected year with the previous one month by month on a shared axis. Filters: category, year, quarter, month.

**Data Management**, where the monthly files go in:

- *Upload* — one card per source (fleet list, fuel card, logbook, EV electricity, workshop's five files, accident register, one-off history import), each with its own parser, file-type guard and result summary.
- *Manual Entry* — for two suppliers that send a dozen paper invoices a month instead of a file.
- *Reference Tables* — the fuel-product map (supplier + product name → Petrol/Diesel) with duplicate checking.
- *History* — every upload with rows read / added / updated / rejected and the parser's warnings, filterable by source, exportable.
- *About* — a system guide edited in place, plus a live snapshot of table row counts and last-upload times.

## Decisions

1. **Key everything, upsert everything.** Fuel transactions are keyed by supplier + document number, orders by order number, availability by month + vehicle type, trips by plate + time. Re-uploading a corrected file overwrites; it never duplicates. The one bug this surfaced — duplicate keys inside one large CSV tripping Postgres's "cannot affect row a second time" — was fixed by de-duplicating each batch before the upsert and turning the SQLSTATE into a 400 with a readable message.
2. **Reject, don't guess.** A fuel transaction whose product is not in the product map is rejected and counted in the upload result. A transaction whose plate is not in the fleet list still counts toward totals but is charted as *(Unmatched)*, so the gap is visible instead of silently absorbed.
3. **Efficiency only where both sides exist.** km/L divides logbook kilometres by litres, but the two sources do not always cover the same months. The numerator is truncated to the months the denominator has data for, and when that is fewer months than the fuel baseline the card says so (`· Jan–Aug only`). EV electricity arrives as one pooled figure per month, so EV efficiency is fleet-level by design.
4. **Rules in the query, not in the spreadsheet.** Cancelled orders, out-of-scope incidents (non-traffic, no determined liability) and inactive vehicles are excluded by the service layer. After each accident upload the server checks that the four category counts sum to the in-scope total and writes a warning to History if they do not.
5. **Match the charts the team knows.** Series colours are fixed per fuel and per vehicle type in one module; the four accident small multiples share an axis maximum; pies label inside above 5 % and outside below; cards abbreviate to K/M and show the exact value on hover with the font shrinking rather than wrapping. ECharts, not a chart-component library, because the layouts had to match Power BI's.
6. **Upload is a two-step contract.** The client uploads the file to platform storage and sends the server a download URL; the server streams, parses and upserts, then records the upload. Large files get a size check on the client and a 50 MB limit on the server with a message that tells the user to split by month.

## Architecture

```
Browser (React 19, Vite, Tailwind, shadcn/ui, ECharts)
  pages/FuelConsumption, Maintenance, Accident, DataManagement
  api/*  → axios instance from the platform toolkit
        ↓ /api/...
NestJS (modules: dashboard, maintenance, accident, fuel-transaction,
        fleet-vehicle, elogbook-trip, ev-monthly, fuel-product-map,
        upload-log, app-doc, export)
  parsers per file type (xlsx / csv) → dedup → upsert (Drizzle)
        ↓
PostgreSQL: fleet_vehicle, fuel_transaction, elogbook_trip, ev_monthly,
  maint_order, maint_manpower, maint_part, maint_third_party,
  availability_month, accident_record, fuel_product_map, upload_log, app_doc
```

The public demo replaces the toolkit with a shim and the NestJS server with an in-browser implementation of the same routes over a seeded dataset (`client/src/platform/`). Page code is unchanged apart from renames.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · shadcn/ui · ECharts · react-hook-form + zod · NestJS · Drizzle ORM · PostgreSQL · Feishu 妙搭

## Numbers

- Fleet size: `[TO FILL]`
- Files loaded per month: `[TO FILL]`
- Reports replaced: `[TO FILL]`
- Time saved per month: `[TO FILL]`
