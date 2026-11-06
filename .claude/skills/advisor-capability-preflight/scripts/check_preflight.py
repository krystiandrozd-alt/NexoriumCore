#!/usr/bin/env python3
"""Evaluate advisor documentation readiness without probing external systems."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


HERE = Path(__file__).resolve().parent
DEFAULT_POLICY = HERE.parent / "references" / "documentation-policy.json"


def load_json(path: Path, default: dict | None = None) -> dict:
    if not path.exists():
        return {} if default is None else default
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"Expected a JSON object in {path}")
    return value


def evaluate(
    policy: dict,
    harness: str,
    tools: list[str],
    preferences: dict,
    runtime_candidates: list[dict] | None = None,
    project_scope: str | None = None,
) -> dict:
    mcp = policy["salesforce_docs_mcp"]
    patterns = [re.compile(pattern, re.IGNORECASE) for pattern in mcp["tool_name_patterns"]]
    matching_tools = sorted({tool for tool in tools if any(p.search(tool) for p in patterns)})
    mcp_status = "connected" if matching_tools else ("not_connected" if tools else "unavailable")
    declared_candidates = list(mcp.get("install_candidates", [])) + list(runtime_candidates or [])
    candidates = [
        candidate
        for candidate in declared_candidates
        if (candidate.get("source_status") == "maintainer-listed" or candidate.get("verified") is True)
        and harness in candidate.get("harnesses", [])
        and candidate.get("publisher")
        and candidate.get("source")
        and (candidate.get("url") or candidate.get("marketplace_identity"))
    ]
    preference_warnings = []
    if preferences and (
        preferences.get("harness", harness) != harness
        or preferences.get("policy_version", policy.get("policy_version")) != policy.get("policy_version")
        or (project_scope is not None and preferences.get("project_root") != project_scope)
    ):
        preference_warnings.append("Saved choices do not match the active harness, project, or policy; reconfirm rather than broadening consent.")
        preferences = {}
    docs_choice = preferences.get("approved_documentation_domains")
    mcp_choice = preferences.get("salesforce_docs_mcp_install")
    needs = []
    recommendations = []
    if mcp_status != "connected" and mcp_choice not in {"declined", "deferred"}:
        recommendations.append("offer_salesforce_docs_mcp" if candidates else "identify_verified_mcp_source")
    if mcp_status != "connected" and docs_choice not in {"approved", "declined"}:
        needs.append("documentation_domain_consent")

    if mcp_status == "connected":
        fallback = "salesforce_docs_mcp"
    elif docs_choice == "approved":
        fallback = "approved_official_web"
    else:
        fallback = "packaged_knowledge_only"

    return {
        "schema_version": 1,
        "harness": harness,
        "salesforce_docs_mcp": {
            "status": mcp_status,
            "requirement": mcp.get("requirement", "optional"),
            "matching_tools": matching_tools,
            "availability_basis": "exposed_tool_names_only_not_a_successful_fetch",
            "deferred_tool_handling": "Load a deferred documentation tool through the host when available; honor host prompts. A failed call falls back honestly.",
            "listed_install_candidates": candidates,
            # Legacy field name is retained for consumers; it is not live verification.
            "verified_install_candidates": candidates,
        },
        "approved_documentation_domains": docs_choice or "not_decided",
        "consent_required": needs,
        "recommended_actions": recommendations,
        "fallback": fallback,
        "ready": not needs,
        "advisory_ready": True,
        "preference_warnings": preference_warnings,
        "host_security_override": False,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--harness", required=True)
    parser.add_argument("--tool", action="append", default=[])
    parser.add_argument("--policy", type=Path, default=DEFAULT_POLICY)
    parser.add_argument("--preferences", type=Path)
    parser.add_argument("--project-root", type=Path, default=Path.cwd())
    parser.add_argument(
        "--install-candidate-json",
        action="append",
        default=[],
        help="Maintainer-listed installation metadata; never implies a live connection",
    )
    args = parser.parse_args()
    policy = load_json(args.policy)
    project = args.project_root.expanduser().resolve()
    preferences_path = args.preferences or project / ".advisor/capabilities.json"
    preferences = load_json(preferences_path)
    candidates = [json.loads(value) for value in args.install_candidate_json]
    print(
        json.dumps(
            evaluate(policy, args.harness, args.tool, preferences, candidates, str(project)),
            indent=2,
            sort_keys=True,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
