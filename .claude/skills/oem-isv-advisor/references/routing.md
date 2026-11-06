# Advisor routing

| Partner decision | Primary capability | Cross-cutting checks |
|---|---|---|
| Validate an idea, user, or product fit | Solution Discovery | Platform Constraints; Security & Readiness |
| Choose package, distribution, listing, version, or migration strategy | Packaging & Distribution | Platform Constraints; Security & Readiness; Operations & Release |
| Choose an org, environment, provisioning path, or developer setup | Development Environment | Platform Constraints; Operations & Release |
| Choose Apex, API, MCP, Agentforce, sub-agent, or implementation patterns | Implementation Best Practices | Platform Constraints; Security & Readiness |
| Evaluate limits, unsupported metadata, scale, or runtime boundaries | Platform Constraints | Packaging & Distribution; Security & Readiness |
| Prepare for security review or evaluate secure implementation | Security & Readiness | Platform Constraints; Packaging & Distribution |
| Test, release, upgrade, monitor, or operate a product | Operations & Release | Packaging & Distribution; Security & Readiness |

Select one primary decision owner. Do not combine every capability into one
undifferentiated prompt.

Read `capability-catalog.json` when routing requires a focused skill, authority
mode, maturity boundary, execution dependency, or stable skill identifier.
The primary capability owns the partner-facing synthesis and must include the
material findings returned by supporting capabilities.
