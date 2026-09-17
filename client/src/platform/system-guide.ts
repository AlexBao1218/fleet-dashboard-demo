/**
 * The "About" tab of the original app rendered a system guide kept in the
 * database and edited in place by the fleet team. That document is the
 * employer's; this one is written for the demo and describes how the system
 * works, not what the fleet did.
 */
export const SYSTEM_GUIDE_MARKDOWN = `# Fleet Dashboard — system guide

This is the public demo of an internal fleet-analytics tool. The three dashboards (Fuel Consumption, Maintenance, Accident) replace a set of Power BI reports that were rebuilt from monthly spreadsheets by hand; the Data Management page is where those spreadsheets are loaded, checked and reconciled.

All figures in this demo are synthetic. Editing this page saves to your browser only.

## Data flow

1. Each month the fleet team exports files from four systems: the fleet master list, the fuel-card supplier's transaction file, the trip logbook, and the workshop's maintenance export (orders, manpower, parts, third-party invoices, availability).
2. Every file goes through **Upload** with a dedicated parser. Rows are keyed (transaction key, order number, plate + month) and upserted, so re-uploading a corrected file overwrites instead of duplicating.
3. Each upload writes a row to **History** with rows read / added / updated / rejected and the parser's warnings, so a bad month can be traced back to a file.
4. Fuel product names are mapped to Petrol / Diesel in **Reference Tables**; a transaction whose product is not mapped is rejected and reported, never guessed.
5. The dashboards query the aggregated tables directly; nothing is precomputed, so a re-upload is reflected immediately.

## Fuel Consumption

- **Vehicles Type Distribution** counts active vehicles from the fleet list; it ignores the filters.
- **Total HKD by Vehicle Type** joins fuel transactions to the fleet list by plate; transactions whose plate is not in the fleet list fall into *(Unmatched)* so the gap is visible.
- **Fuel Consumption (L)** and **Electricity Consumption (kWh)** always show the full year so a month filter narrows the cards without hiding the trend.
- Efficiency cards divide logbook net kilometres by litres (or kWh). The numerator only counts months where the denominator has data; when that is fewer months than the fuel baseline, the card says so (for example \`· Jan–Aug only\`).
- Electricity arrives as one pooled figure per month rather than per vehicle, so EV efficiency is fleet-level.

## Maintenance

- Cancelled orders are excluded everywhere.
- Availability is read from the workshop's monthly availability sheet, not derived from orders: fleet quantity × days in month, minus unavailable days, per vehicle type. *Total* is used when no vehicle type is selected.
- Cost is split into labour (paid hours × hourly rate), parts and third-party invoices; the two stacked bars group the same orders by order type and by vehicle type.
- The third-party chart shows the top 15 vendors by invoiced cost in the selected period.

## Accident

- Only records marked *in scope* are counted: traffic accidents with a determined liable party. Non-traffic incidents are uploaded but excluded.
- The four categories are mutually exclusive. After each upload the server checks that the four category counts add up to the in-scope total and writes a warning to History if they do not.
- The bar panel compares the selected year with the previous year month by month, on a shared axis across the four small charts.

## Manual entry

Two suppliers send a dozen paper invoices a month instead of a file. They are keyed in one at a time; the transaction key is supplier + document number, so a re-entered invoice updates the earlier row.

## Not in this demo

File upload, sign-in and the platform's document storage are not available. Everything else — filters, manual entry, reference tables, history, export, this page — works against the synthetic dataset in your browser. Use **Reset data** in the sidebar to start over.
`
