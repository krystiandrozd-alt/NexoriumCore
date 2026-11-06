# Deliver the Salesforce hosted MCP to each engagement layer

The partner can reuse eligible Apex logic and one HXL widget composition across
supported channels. Each channel still needs its own connection, user identity,
permissions, supported server choice, and rendering check. Refresh product
availability and Setup steps before giving a customer instructions.

Use [the partner journey](partner-journey.md) to define the first client's
pilot and acceptance condition. Record connection, discovery, direct tool
invocation, model selection, business result, and optional rendering separately
for each client. Diagnose the failing layer before changing working backing
logic. Return actual results or missing evidence to the advisor for the next
iteration; a successful connection alone does not complete the pilot.

The Slack sources below are on domains outside the Salesforce documentation
preflight allowlist. Use them for current Slack eligibility and Setup claims
only when those exact official Slack sources are approved for this project;
otherwise route to `slack-implementation-advisor` and mark unverified details
unknown. Approval for Salesforce documentation does not approve Slack domains.

## Slackbot

1. For a development environment, check eligibility for the [Slack Developer Program](https://api.slack.com/developer-program)
   and a [developer sandbox](https://docs.slack.dev/tools/developer-sandboxes/). Slack currently says developer sandboxes include
   Slackbot AI at the enterprise tier. Salesforce partners can also assess a
   [partner sandbox](https://docs.slack.dev/tools/partner-sandboxes/), a
   special developer sandbox with a separate request path. Coordinate current
   eligibility with `slack-implementation-advisor`. Verify the sandbox,
   Salesforce org, and Slackbot access actually available to this partner.
2. Follow Slack's [Connect Salesforce and Slack](https://slack.com/help/articles/30754346665747-Connect-Salesforce-and-Slack)
   process: request the org connection in Slack, obtain Salesforce admin
   approval, activate it, and map the relevant user accounts.
3. Follow [Connect Slackbot to Salesforce with MCP](https://slack.com/help/articles/52462858006675-Connect-Slackbot-to-Salesforce-with-MCP):
   select the available Salesforce standard or customer-configured custom
   server, inspect its tools, connect it, and scope workspace/member/tool
   access. This is Slack's documented connection path; do not replace it with
   the Claude/ChatGPT External Client App steps without current evidence.
4. Test a read and, if intended, an approved action in Slackbot as a mapped
   user. Check the returned data and HXL rendering if used. Verify the
   standard servers actually selectable in that Slack environment; the
   Salesforce-wide catalog does not establish Slackbot availability.

## Claude and ChatGPT

1. Enable the selected [standard server](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/servers-reference.html)
   or configure the customer-owned [custom server](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/custom-servers.html)
   in the target Salesforce org. Use Headless 360 (Beta) only when its broad
   Discover/Describe/Dispatch capability fits the job; check a narrower server
   first. A custom server can curate packaged Apex tools and standard tools.
2. Create an [External Client App](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/create-external-client-app.html)
   for Salesforce hosted MCP OAuth, with the client-specific callback and
   required scopes. Salesforce says Connected Apps are unsupported here. Its
   current guide also says Setup cannot create an ECA directly in a scratch
   org; check the documented Dev Hub/package route for scratch testing.
3. Configure each client with the server URL and ECA consumer key using the
   current [connection overview](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/client-connection-overview.html).
   [Claude](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/claude.html)
   uses its custom connector and OAuth client ID. [ChatGPT](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/chatgpt.html)
   uses its app/developer-mode flow, a callback URL, OAuth client ID, and—per
   Salesforce's current guide—a client secret. Never collect or record secrets
   in the advisor's evidence ledger.
4. Test the connection, tool discovery, a permitted read, and the intended
   action in each client. Salesforce recommends first testing raw MCP behavior
   in Postman to separate server/auth issues from model tool selection. Check
   HXL rendering independently in Claude and ChatGPT when used.

## Customer handoff

Give the customer the package version and installed action names, the chosen
standard/custom server and tool list, setup owner, required org/client
permissions, per-channel connection instructions, and a small validation
scenario. For HXL on MCP channels, include the customer-owned
`McpServerDefinition` resource-wiring step from `sfdx-assessment.md`. Describe
which assets are reused across channels and which connections remain to be
configured. Do not state that installation automatically activates a server or
connects Slackbot, Claude, or ChatGPT.
