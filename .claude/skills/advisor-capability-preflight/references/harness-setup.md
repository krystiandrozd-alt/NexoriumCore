# Harness setup

Read only the section for the active harness.

## Codex

- Inspect exposed documentation tools. This library does not declare Docs MCP
  as a mandatory dependency in `agents/openai.yaml`.
- If Codex offers a missing-dependency installation prompt, show the identity
  and ask the customer before accepting it.
- Use the host's supported project-scoped configuration flow. Do not describe a
  CLI command as project-scoped without checking what that installed version writes.
- Store project-scoped MCP configuration in `.codex/config.toml` only in a
  trusted project. Do not edit user-global configuration without separate
  approval.
- Use native web search restricted to the policy's exact domains for web
  fallback. Do not use shell fetches to bypass the host network policy.

## Claude Code

- This plugin provides `.mcp.json`. Claude Code must ask the customer to approve
  the project-scoped `salesforce-docs` server before using it.
- The Salesforce-published direct command is:

  ```bash
  claude mcp add --scope project --transport http salesforce-docs https://salesforce-docs-76258744c9d7.herokuapp.com/api/mcp
  ```

- Restart Claude Code after adding the server.
- Add exact `WebFetch(domain:...)` entries to
  `.claude/settings.local.json` only after project-level approval.
- Do not use `--dangerously-skip-permissions`.

## Claude Code cloud sessions

Cloud sessions (Claude Code on the web and other remote containers) differ from
a local install:

- `claude mcp add` and settings on the customer's computer do not carry over.
  Two routes work: the customer adds `salesforce-docs` as a connector in their
  claude.ai connector settings and starts a new session (connectors are read
  when a session starts), or the server is committed to the `.mcp.json` of the
  repository the session opens. Committing changes that repository; get
  approval for that repository specifically.
- The container is temporary. `.advisor/capabilities.json` disappears with it
  unless committed. Keep choices in session context unless the customer names a
  repository and approves committing the record there.
- The environment's network policy governs outbound hosts. If it blocks a listed
  endpoint, the server stays unavailable; do not route around the policy.
- Use the host's fetch tool for web fallback when it is exposed. Tool exposure
  can change during a session. If no host fetch tool is exposed, ask before
  using another read-only fetch against approved sources, and never use one for
  a host outside the approved scope.

## Cursor and other harnesses

- Use the harness's native MCP and domain-permission flow.
- Require the same server identity and exact-domain review.
- If durable approval is unsupported, keep prompting at the host boundary or
  use MCP only. Do not claim that advisor consent changed host policy.

## Installation source provenance

A Salesforce Docs MCP installation candidate must include:

- stable server or marketplace identity;
- streamable HTTP URL or exact local command;
- publisher and source;
- authentication requirements;
- expected read-only documentation tools.

The maintainer-listed metadata references
`https://labs.agentforce.com/docs/salesforce-docs-mcp` (source review date in the
policy). This is not a claim of current endpoint health. Recheck that source
before changing the endpoint, transport, authentication statement, or expected
tools. The policy's `provenance_review.exact_urls` permits a read-only re-read
of that page for this purpose only; it confirms the listing, not the endpoint.
Report a listed candidate's `verification` value as given (`not_performed` for
maintainer-listed metadata). Salesforce Hosted MCP org/data servers are not
documentation MCP substitutes.
