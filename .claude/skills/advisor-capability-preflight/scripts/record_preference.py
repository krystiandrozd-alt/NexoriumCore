#!/usr/bin/env python3
"""Record explicit advisor capability choices; never store credentials."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--harness", required=True)
    parser.add_argument("--documentation-domains", choices=("approved", "declined"), required=True)
    parser.add_argument("--mcp-install", choices=("approved", "declined", "deferred"), required=True)
    parser.add_argument("--policy-version", required=True)
    parser.add_argument("--project-root", type=Path, default=Path.cwd())
    args = parser.parse_args()

    payload = {
        "schema_version": 1,
        "harness": args.harness,
        "policy_version": args.policy_version,
        "project_root": str(args.project_root.expanduser().resolve()),
        "approved_documentation_domains": args.documentation_domains,
        "salesforce_docs_mcp_install": args.mcp_install,
        "recorded_at": datetime.now(timezone.utc).isoformat(),
        "contains_credentials": False,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(args.output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
