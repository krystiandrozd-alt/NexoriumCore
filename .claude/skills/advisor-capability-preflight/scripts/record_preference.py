#!/usr/bin/env python3
"""Record explicit advisor capability choices; never store credentials."""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse


HERE = Path(__file__).resolve().parent
DEFAULT_POLICY = HERE.parent / "references" / "documentation-policy.json"
RECORD_SCHEMA_VERSION = 2
HOST_PATTERN = re.compile(r"[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+")


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


def policy_scope(path: Path) -> dict | None:
    """Return the policy's exact documentation scope, or None when it is unreadable."""
    try:
        docs = json.loads(path.read_text(encoding="utf-8"))["approved_documentation"]
        hosts = sorted({str(host).lower() for host in docs["exact_hosts"]})
        prefixes = sorted({str(prefix) for prefix in docs.get("url_prefixes", [])})
    except (OSError, ValueError, KeyError, TypeError):
        return None
    return {"exact_hosts": hosts, "url_prefixes": prefixes}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--harness", required=True)
    parser.add_argument("--documentation-domains", choices=("approved", "declined"), required=True)
    parser.add_argument("--mcp-install", choices=("approved", "declined", "deferred"), required=True)
    parser.add_argument("--policy-version", required=True)
    parser.add_argument("--project-root", type=Path, default=Path.cwd())
    parser.add_argument(
        "--policy",
        type=Path,
        default=DEFAULT_POLICY,
        help="Policy used to record the default scope when no explicit scope is given",
    )
    parser.add_argument(
        "--approved-host",
        action="append",
        default=[],
        help="Exact documentation host the customer approved; repeat per host",
    )
    parser.add_argument(
        "--approved-url-prefix",
        action="append",
        default=[],
        help="https URL prefix ending in '/' that the customer approved; repeat per prefix",
    )
    args = parser.parse_args()

    explicit = bool(args.approved_host or args.approved_url_prefix)
    if explicit and args.documentation_domains != "approved":
        parser.error("--approved-host and --approved-url-prefix require --documentation-domains approved")

    payload = {
        "schema_version": RECORD_SCHEMA_VERSION,
        "harness": args.harness,
        "policy_version": args.policy_version,
        "project_root": str(args.project_root.expanduser().resolve()),
        "approved_documentation_domains": args.documentation_domains,
        "salesforce_docs_mcp_install": args.mcp_install,
        "recorded_at": datetime.now(timezone.utc).isoformat(),
        "contains_credentials": False,
    }
    if args.documentation_domains == "approved":
        if explicit:
            hosts = sorted({host.strip().lower() for host in args.approved_host})
            prefixes = sorted({prefix.strip() for prefix in args.approved_url_prefix})
            invalid = [host for host in hosts if not HOST_PATTERN.fullmatch(host)]
            invalid += [prefix for prefix in prefixes if not is_https_prefix(prefix)]
            if invalid:
                parser.error("Invalid approved documentation source(s): " + ", ".join(invalid))
            scope = {"source": "explicit", "exact_hosts": hosts, "url_prefixes": prefixes}
        else:
            default = policy_scope(args.policy)
            if default is None:
                parser.error(
                    "Cannot read the documentation policy to record its scope; "
                    "pass --approved-host/--approved-url-prefix explicitly"
                )
            scope = {"source": "policy_default", **default}
        payload["approved_documentation_scope"] = scope

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(args.output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
