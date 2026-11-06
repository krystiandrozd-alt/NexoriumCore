#!/usr/bin/env python3
"""Evaluate advisor documentation readiness without probing external systems."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from urllib.parse import urlparse


HERE = Path(__file__).resolve().parent
DEFAULT_POLICY = HERE.parent / "references" / "documentation-policy.json"
OUTPUT_SCHEMA_VERSION = 2
HOST_PATTERN = re.compile(r"[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+")
DEFERRED_TOOL_HANDLING = (
    "Load a deferred documentation tool through the host when available; honor host prompts. "
    "A failed call falls back honestly."
)


def load_json(path: Path, default: dict | None = None) -> dict:
    if not path.exists():
        return {} if default is None else default
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"Expected a JSON object in {path}")
    return value


def assess_policy(policy: dict) -> str:
    """Return ok, missing, or invalid for an already loaded policy object."""
    if not policy:
        return "missing"
    mcp = policy.get("salesforce_docs_mcp")
    docs = policy.get("approved_documentation")
    if not isinstance(mcp, dict) or not isinstance(mcp.get("tool_name_patterns"), list):
        return "invalid"
    if not isinstance(docs, dict) or not isinstance(docs.get("exact_hosts"), list):
        return "invalid"
    try:
        for pattern in mcp["tool_name_patterns"]:
            re.compile(pattern)
    except (re.error, TypeError):
        return "invalid"
    return "ok"


def load_policy(path: Path) -> tuple[dict, str]:
    """Load the policy without raising; an unreadable policy degrades the result."""
    if not path.exists():
        return {}, "missing"
    try:
        policy = load_json(path)
    except (OSError, ValueError):
        return {}, "invalid"
    return policy, assess_policy(policy)


def is_https_prefix(value: str) -> bool:
    parsed = urlparse(value)
    try:
        port = parsed.port
    except ValueError:
        return False
    return (
        parsed.scheme == "https"
        and HOST_PATTERN.fullmatch(parsed.hostname or "") is not None
        and port is None
        and parsed.username is None
        and not parsed.query
        and not parsed.fragment
        and value.endswith("/")
    )


def _recorded_list(recorded: dict, key: str, warnings: list[str]) -> list:
    value = recorded.get(key, [])
    if isinstance(value, list):
        return value
    warnings.append(f"Ignored approved_documentation_scope.{key}: expected a list.")
    return []


def approved_scope(policy: dict, preferences: dict) -> tuple[dict, list[str]]:
    """Resolve exactly what the customer approved; never widen it silently."""
    docs = policy["approved_documentation"]
    policy_hosts = sorted({str(host).lower() for host in docs.get("exact_hosts", [])})
    policy_prefixes = sorted({str(prefix) for prefix in docs.get("url_prefixes", [])})
    recorded = preferences.get("approved_documentation_scope")
    if not isinstance(recorded, dict):
        # A record without an explicit scope approved the policy's exact list.
        return {
            "source": "policy_default",
            "exact_hosts": policy_hosts,
            "url_prefixes": policy_prefixes,
            "outside_policy": [],
        }, []
    warnings: list[str] = []
    hosts: set[str] = set()
    prefixes: set[str] = set()
    for raw in _recorded_list(recorded, "exact_hosts", warnings):
        host = str(raw).strip().lower()
        if HOST_PATTERN.fullmatch(host):
            hosts.add(host)
        else:
            warnings.append(f"Ignored an invalid approved host: {raw!r}.")
    for raw in _recorded_list(recorded, "url_prefixes", warnings):
        prefix = str(raw).strip()
        if is_https_prefix(prefix):
            prefixes.add(prefix)
        else:
            warnings.append(f"Ignored an invalid approved URL prefix: {raw!r}.")
    outside = sorted(
        {host for host in hosts if host not in policy_hosts}
        | {
            prefix
            for prefix in prefixes
            if not any(prefix.startswith(allowed) for allowed in policy_prefixes)
            and urlparse(prefix).hostname not in policy_hosts
        }
    )
    if outside:
        warnings.append(
            "The customer approved documentation sources outside the policy: "
            + ", ".join(outside)
            + ". Label them customer-approved, not policy-approved."
        )
    return {
        "source": str(recorded.get("source") or "customer_recorded"),
        "exact_hosts": sorted(hosts),
        "url_prefixes": sorted(prefixes),
        "outside_policy": outside,
    }, warnings


def listed_candidate(candidate: dict) -> dict:
    """Copy a listed candidate and state plainly whether anyone verified it."""
    listed = dict(candidate)
    listed["verification"] = (
        "declared_by_runtime_catalog" if candidate.get("verified") is True else "not_performed"
    )
    return listed


def degraded_result(state: str, harness: str, preferences: dict, warnings: list[str]) -> dict:
    """Fail closed when the policy is missing or invalid; advice may continue."""
    warnings = list(warnings)
    if preferences:
        warnings.append(
            "Saved choices cannot be applied without a readable documentation policy; "
            "reconfirm after the policy is restored."
        )
    return {
        "schema_version": OUTPUT_SCHEMA_VERSION,
        "harness": harness,
        "policy_status": state,
        "policy_version": None,
        "salesforce_docs_mcp": {
            "status": "unknown",
            "requirement": "unknown",
            "matching_tools": [],
            "availability_basis": "documentation_policy_unreadable_no_tool_patterns",
            "deferred_tool_handling": DEFERRED_TOOL_HANDLING,
            "listed_install_candidates": [],
            "provenance_review_urls": [],
        },
        "approved_documentation_domains": "not_decided",
        "approved_documentation_scope": None,
        "consent_required": [],
        "recommended_actions": ["restore_documentation_policy"],
        "fallback": "packaged_knowledge_only",
        "ready": False,
        "advisory_ready": True,
        "preference_warnings": warnings,
        "host_security_override": False,
    }


def evaluate(
    policy: dict,
    harness: str,
    tools: list[str],
    preferences: dict,
    runtime_candidates: list[dict] | None = None,
    project_scope: str | None = None,
    load_warnings: list[str] | None = None,
    policy_status: str | None = None,
) -> dict:
    state = policy_status or assess_policy(policy)
    preference_warnings = list(load_warnings or [])
    if state != "ok":
        return degraded_result(state, harness, preferences, preference_warnings)

    mcp = policy["salesforce_docs_mcp"]
    patterns = [re.compile(pattern, re.IGNORECASE) for pattern in mcp["tool_name_patterns"]]
    matching_tools = sorted({tool for tool in tools if any(p.search(tool) for p in patterns)})
    mcp_status = "connected" if matching_tools else ("not_connected" if tools else "unavailable")
    declared_candidates = list(mcp.get("install_candidates", [])) + list(runtime_candidates or [])
    candidates = [
        listed_candidate(candidate)
        for candidate in declared_candidates
        if (candidate.get("source_status") == "maintainer-listed" or candidate.get("verified") is True)
        and harness in candidate.get("harnesses", [])
        and candidate.get("publisher")
        and candidate.get("source")
        and (candidate.get("url") or candidate.get("marketplace_identity"))
    ]
    provenance = mcp.get("provenance_review") if isinstance(mcp.get("provenance_review"), dict) else {}
    provenance_urls = [url for url in provenance.get("exact_urls", []) if isinstance(url, str)]

    if preferences and (
        preferences.get("harness", harness) != harness
        or preferences.get("policy_version", policy.get("policy_version")) != policy.get("policy_version")
        or (project_scope is not None and preferences.get("project_root") != project_scope)
    ):
        preference_warnings.append("Saved choices do not match the active harness, project, or policy; reconfirm rather than broadening consent.")
        preferences = {}
    docs_choice = preferences.get("approved_documentation_domains")
    mcp_choice = preferences.get("salesforce_docs_mcp_install")
    scope = None
    if docs_choice == "approved":
        scope, scope_warnings = approved_scope(policy, preferences)
        preference_warnings.extend(scope_warnings)
        if not scope["exact_hosts"] and not scope["url_prefixes"]:
            preference_warnings.append("The recorded approval names no usable documentation source; reconfirm the scope.")
            docs_choice = None
            scope = None
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
        "schema_version": OUTPUT_SCHEMA_VERSION,
        "harness": harness,
        "policy_status": "ok",
        "policy_version": policy.get("policy_version"),
        "salesforce_docs_mcp": {
            "status": mcp_status,
            "requirement": mcp.get("requirement", "optional"),
            "matching_tools": matching_tools,
            "availability_basis": "exposed_tool_names_only_not_a_successful_fetch",
            "deferred_tool_handling": DEFERRED_TOOL_HANDLING,
            "listed_install_candidates": candidates,
            "provenance_review_urls": provenance_urls,
        },
        "approved_documentation_domains": docs_choice or "not_decided",
        "approved_documentation_scope": scope,
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
    policy, status = load_policy(args.policy)
    project = args.project_root.expanduser().resolve()
    preferences_path = args.preferences or project / ".advisor/capabilities.json"
    warnings: list[str] = []
    try:
        preferences = load_json(preferences_path)
    except (OSError, ValueError):
        preferences = {}
        warnings.append(f"Saved choices at {preferences_path} are unreadable; reconfirm instead of reusing them.")
    candidates = []
    for value in args.install_candidate_json:
        try:
            candidate = json.loads(value)
        except ValueError:
            parser.error("--install-candidate-json must be a JSON object")
        if not isinstance(candidate, dict):
            parser.error("--install-candidate-json must be a JSON object")
        candidates.append(candidate)
    print(
        json.dumps(
            evaluate(policy, args.harness, args.tool, preferences, candidates, str(project), warnings, status),
            indent=2,
            sort_keys=True,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
