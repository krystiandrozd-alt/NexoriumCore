# Multi-site B2B quote-to-order in one flow: Technical runbook

## Environment

| | |
|---|---|
| Base URL | `‹env:SF_DEMO_BASE_URL›` |
| Login | sf org open --url-only --target-org comms-demo |
| Browser | chromium, headless, 1440×900, en-US |
| Target org | `comms-demo` (allowed: comms-demo, comms-demo-backup) |
| Duration | 22 / 30 min · 3 × Scene · 8 × Step |

### Environment variables

- `SF_DEMO_AM_USERNAME`
- `SF_DEMO_BASE_URL`
- `SF_DEMO_OM_USERNAME`

### Not yet confirmed with the customer

- Delta metrics are placeholders until the customer confirms baseline figures in discovery.
- UI labels and locators are illustrative for a Communications Cloud demo org. They are marked verified: false; confirm them with the headless smoke test against your org.
- Permission set Demo_B2B_Sales is a demo-specific example; replace it with the permission sets your org uses.

## Demo data

| Variable | Value |
|---|---|
| `accountName` | Baltic Freight Group |
| `opportunityName` | Baltic Freight Group - SD-WAN 12 sites |
| `siteCount` | 12 |
| `uiConfigureButton` | Configure |
| `uiCreateOrderButton` | Create Order |
| `uiQuotesTab` | Quotes |
| `uiOrdersTab` | Orders |
| `uiQuantityField` | Quantity |

| Ref | sObject | Fields |
|---|---|---|
| `BalticFreight` | Account | Name: Baltic Freight Group, Industry: Transportation, BillingCity: Gdańsk, BillingCountry: Poland |
| `BalticFreightCio` | Contact | FirstName: Marta, LastName: Wiśniewska, Title: CIO, Email: marta.wisniewska@example.com, AccountId: @BalticFreight |
| `BalticFreightDeal` | Opportunity | Name: Baltic Freight Group - SD-WAN 12 sites, StageName: Proposal/Price Quote, CloseDate: 2027-03-31, AccountId: @BalticFreight |

| Persona | User | Permission sets |
|---|---|---|
| Ewa Nowak (B2B Account Manager) | `‹env:SF_DEMO_AM_USERNAME›` | Demo_B2B_Sales |
| Piotr Zieliński (Order Manager) | `‹env:SF_DEMO_OM_USERNAME›` | — |

## Pre-demo checklist

1. Prepare the org: run org-prep/prepare-org.sh against comms-demo and confirm that every verification passes.
2. Run the headless smoke test (node scripts/demo.mjs run <scenario>) and fix every failed step.
3. Keep the latest headless recording ready as plan B.
4. Use a clean browser profile; close other tabs, chats and notifications.
5. Log in once as each persona user and dismiss welcome pop-ups and guided tours.
6. Open the sales app used in the demo, so the navigation bar shows the right tabs.

## 1. The result first: a submitted multi-site order

| # | Step | Action | Element | Expected result | Plan B |
|---|---|---|---|---|---|
| 1 | Open recent opportunities | navigate ‹env:SF_DEMO_BASE_URL›/lightning/o/Opportunity/list?filterName=Recent | — | visible: role=link name="Baltic Freight Group - SD-WAN 12 sites" (unverified) | Open the opportunity from global search. |
| 2 | Show the deal and its order | click | role=link name="Baltic Freight Group - SD-WAN 12 sites" (unverified) | visible: role=link name="Orders" (unverified) | Show the screenshot of the submitted order from the last headless run. |

## 2. Configure and price a multi-site quote

| # | Step | Action | Element | Expected result | Plan B |
|---|---|---|---|---|---|
| 1 | Open the quote | click | role=link name="Quotes" (unverified) | visible: role=button name="Configure" (unverified) | Open the quote from the Recent Items list. |
| 2 | Start configuration | click | role=button name="Configure" (unverified) | — | Show the configured quote from the first scene and talk through the rules. |
| 3 | Set the number of sites | fill "12" | label="Quantity" (unverified) | — | Explain the multi-site pricing on the order from the first scene. |
| 4 | Show a catalog rule | — | — | — | Show the rule in the catalog's rule list instead. |

## 3. Convert the accepted quote to an order

| # | Step | Action | Element | Expected result | Plan B |
|---|---|---|---|---|---|
| 1 | Create the order | click | role=button name="Create Order" (unverified) | visible: role=link name="Orders" (unverified) | Open the order created for the first scene. |
| 2 | Show order decomposition | — | — | — | Show the decomposition screenshot from the last headless run. |
