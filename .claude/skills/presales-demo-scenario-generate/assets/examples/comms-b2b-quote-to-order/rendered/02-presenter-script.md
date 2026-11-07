# Multi-site B2B quote-to-order in one flow: Presenter script

**Duration:** 30 min · **Audience:** Director of B2B Sales, Head of Order Management, Enterprise Architect

> **Not yet confirmed with the customer**
>
> - Delta metrics are placeholders until the customer confirms baseline figures in discovery.
> - UI labels and locators are illustrative for a Communications Cloud demo org. They are marked verified: false; confirm them with the headless smoke test against your org.
> - Permission set Demo_B2B_Sales is a demo-specific example; replace it with the permission sets your org uses.

## Opening

Your team told us that multi-site deals take too long to quote and that orders come back for rework. In the next 30 minutes we follow one deal for Baltic Freight Group from configuration to a submitted order, in one system.

**Where we will end:** We start with the result: the Baltic Freight Group deal for 12 sites, already converted to an order, with every order line traceable to the catalog offer it came from.

## 1. The result first: a submitted multi-site order (0–4 min)

- **Persona:** Ewa Nowak, B2B Account Manager
- **Objective:** Show the end result before any configuration.

> **Set the scene:** Before we build anything, here is where we will end: the Baltic Freight Group deal, already an order.

**1. Show the deal and its order**

This is the Baltic Freight Group opportunity. It already has an accepted quote and a submitted order. Each order line came from the quote, and each quote line came from the catalog.

**Wow moment:** Every order line links back to the quote line and the catalog offer it came from.

> **Land the value:** Sales and fulfilment look at the same deal, so nothing is re-keyed or lost between them.

**Discovery questions**

- Where does a multi-site deal wait longest today: quoting, approval or order entry?

## 2. Configure and price a multi-site quote (4–14 min)

- **Persona:** Ewa Nowak, B2B Account Manager
- **Objective:** Prove that a multi-site offer is configured from the catalog, with its rules enforced.

> **Set the scene:** Ewa now builds the same quote from scratch, the way she would on a normal Tuesday.

**1. Open the quote**

From the opportunity, Ewa opens the quote she started this morning.

**2. Start configuration**

She opens the configurator. Everything you see here comes from the product catalog, not from a spreadsheet.

**3. Set the number of sites**

Baltic Freight Group has 12 sites. Ewa sets that once, and the configuration applies to every site.

**4. Show a catalog rule**

Watch what happens when she picks an add-on that is not allowed with this access type. The catalog stops it here, not at provisioning.

**Wow moment:** The catalog blocks an invalid combination before the quote is priced.

> **Land the value:** Quotes are right the first time, so approvals and orders do not bounce back.

**Discovery questions**

- Which offer rules does your team check by hand today?
- Who approves discounts above list price, and how?

**Objections and answers**

- *Our catalog is too complex to model.* We model the top multi-site offers first and add the rest in waves; the catalog workshop in the next steps sets the scope.

## 3. Convert the accepted quote to an order (14–22 min)

- **Persona:** Piotr Zieliński, Order Manager
- **Objective:** Show the hand-off from sales to fulfilment without re-keying.

> **Set the scene:** The customer accepts the quote. Piotr, the order manager, takes it from here.

**1. Create the order**

One click turns the accepted quote into an order.

**2. Show order decomposition**

This is what fulfilment sees: each commercial line broken down into the technical lines that downstream systems need.

**Wow moment:** The order is decomposed into fulfilment lines automatically.

> **Land the value:** Fulfilment receives exactly what was sold, so activation and billing start without rework.

**Discovery questions**

- How many orders come back for correction each month?

## Closing

We followed one multi-site deal from configuration to a submitted order, with the catalog enforcing the rules and every order line traceable.

**Next steps**

- Agree baseline figures for quote-to-order lead time and order rework.
- Workshop on catalog rules for your top three multi-site offers.
- Technical deep dive on order decomposition and the fulfilment integration.
