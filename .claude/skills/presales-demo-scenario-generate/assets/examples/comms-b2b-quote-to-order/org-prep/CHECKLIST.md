# Org preparation: Multi-site B2B quote-to-order in one flow

Target org: `comms-demo` · allowed orgs: `comms-demo`, `comms-demo-backup`

## 1. Before you run the script

- [ ] Log the CLI in to the demo org: `sf org login web --alias comms-demo`
- [ ] Confirm that the org is not production. The script prints OrganizationType and IsSandbox and asks before it changes anything.
- [ ] Set the persona usernames: `SF_DEMO_AM_USERNAME`, `SF_DEMO_OM_USERNAME`

## 2. Manual steps

- [ ] Load the multi-site B2B offers into the product catalog (EPC). Use the omnistudio-epc-catalog-generate skill to author the catalog DataPacks.
- [ ] Create the accepted quote and the submitted order for the first scene, for example during a rehearsal run.
- [ ] Create permission set Demo_B2B_Sales with access to quotes and orders, or replace it in personas[].org.permissionSets.

## 3. Run

```bash
bash prepare-org.sh            # asks for confirmation
bash prepare-org.sh --yes      # non-interactive
```

## 4. What the script does

- Assigns permission sets: Demo_B2B_Sales → Ewa Nowak (B2B Account Manager)
- Imports demo records with `sf data import tree --plan data/plan.json`: Account (1), Contact (1), Opportunity (1)
- Verifies "Demo account exists": `SELECT Id FROM Account WHERE Name = 'Baltic Freight Group'` returns at least 1 row(s)
- Verifies "Demo opportunity exists": `SELECT Id FROM Opportunity WHERE Name = 'Baltic Freight Group - SD-WAN 12 sites'` returns at least 1 row(s)

## 5. Related sf skills

- Product catalog (EPC) data: `omnistudio-epc-catalog-generate`
- Larger data volumes and cleanup scripts: `platform-data-manage`
- Queries for checks and reports: `platform-soql-query`

## 6. After the org is ready

Run the headless smoke test and fix every failed step: `node scripts/demo.mjs run <scenario.json>`
