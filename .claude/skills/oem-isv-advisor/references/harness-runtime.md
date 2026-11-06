# Portable harness handling

Use this reference at entry when installation, file access, or tools differ
from an ordinary local skill session. Do not load the entire library eagerly.

- Resolve `references/...` relative to the skill that declares it, not the
  conversation working directory. Read this skill's own contract only to clarify
  a handoff, missing dependency, or ambiguous boundary; custom metadata is not
  executable policy. Use the catalog for routing, not other skills' contracts.
- Resolve a related skill through the current host's exposed skill catalog or
  approved installed files after invoking that skill. If it is unavailable, identify the missing advisor
  and offer a bounded handoff. Do not fetch/install a repository or scan unrelated
  projects automatically. A skill ID is not a universal slash-command syntax.
- Keep the partner goal, active primary, current mode, material supplied facts,
  evidence sources, unresolved questions, and exact approval scope in a concise
  session recap before a handoff or context reset. Do not invent lost history.
- Detect documentation, file inspection, execution, and MCP capability only
  from what this session exposes. No diagnostic org calls to discover tools.
  A configured connector or a known server URL is not proof of connectivity.
- Ask uses supplied facts and skill references; absent project/org access does
  not block guidance. Assess needs explicitly approved evidence plus an actual
  read capability; a supplied sanitized fixture can suffice. Act requires a
  bounded plan, explicit approval, and the actual execution capability. Never
  treat installation approval as approval for a domain action.
- Respect the host's prompts and enterprise controls. If this surface cannot
  perform an operation safely, provide a labeled proposed handoff, not a claim
  of completed work. Read the existing documentation/practitioner policies when
  applicable; this reference does not replace them.
- If two installed copies conflict, identify their paths and versions where
  visible and ask which approved source to use. Do not blend candidate guidance
  with approved guidance or claim a draft is released based on its version.

Isolation is enforced by the test launcher/host configuration, not these
instructions. Never claim a private folder alone prevents other sessions from
reading it. This file does not connect tools, alter permissions, or install skills.
