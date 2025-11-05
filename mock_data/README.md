# Mock Airtable Backfill Utilities

`fill_airtable.py` helps you seed deterministic placeholder values into your
Airtable base without modifying existing data. It inspects each record,
generates mock values for empty fields only, and can optionally write the
results back through the Airtable Data API.

## Prerequisites

- Python 3.9+
- Environment variables (already used by the backend):
  - `AIRTABLE_PAT`
  - `AIRTABLE_BASE_ID`
  - `AIRTABLE_TABLE_ID`
  - `AIRTABLE_API_URL` (optional, defaults to `https://api.airtable.com`)

No third-party packages are required — the script relies exclusively on the
standard library to avoid local dependency issues.

### Automatic `.env` loading

The script reads environment variables from `.env` files in this order:

1. `mock_data/.env`
2. `backend/.env`
3. Repository root `.env` (if present)

Values loaded earlier take priority, so you can override specific keys in
`mock_data/.env` while falling back to the backend configuration for the rest.

### Choosing fields

The list of columns the script touches is controlled by the
`TARGET_FIELD_LABELS` array inside `fill_airtable.py`. Update the list to add or
remove fields. During execution the script verifies that each label maps to an
actual Airtable column and reports any that are missing — no updates are sent if
a column cannot be resolved.

## Typical Workflow

1. **Preview the changes (dry run)**  
   ```bash
   python3 mock_data/fill_airtable.py --max-records 10 --verbose
   ```

   This prints a summary of the empty fields the generator would populate. It
   never sends updates unless you add `--apply`.

2. **Apply the mock data**  
   ```bash
   python3 mock_data/fill_airtable.py --apply
   ```
   The script batches updates (10 records per request) and waits 0.5 seconds
   between batches by default to respect rate limits.

3. **Target a specific record (optional)**  
   ```bash
   python3 mock_data/fill_airtable.py --record-id recXXXX --verbose --apply
   ```

## Safety Guarantees

- Existing non-empty cells are never overwritten.
- Timeline fields (contact, consultation, flagging, application, planting) are
  generated in chronological order.
- Single-select options respect the choices configured in Airtable when they are
  discoverable via the Metadata API.

## Script Options

Run `python3 mock_data/fill_airtable.py --help` for the full argument list.

Key flags:

- `--view` – limit reads to a specific view (defaults to the “All status and property notes” view used in the app).
- `--max-records` – cap how many records are inspected.
- `--apply` – switch from dry run to actually writing values back.
- `--batch-wait` – adjust the pause between batches if the base is large.
- `--verbose` – log the generated fields per record for manual inspection.

## Extending the Generator

Field-specific value helpers live in the `FIELD_VALUE_PROVIDERS` map inside
`fill_airtable.py`. To adjust behaviour:

1. Add the Airtable column label to `TARGET_FIELD_LABELS`.
2. Update or extend `FIELD_VALUE_PROVIDERS` to return the desired placeholder.
3. Run a dry run (`--verbose`) to confirm the generated values look right.

Utility helpers such as `choose_property`, `choose_attachment_set`, and
`build_date_schedule` can be reused to keep data consistent across fields.
