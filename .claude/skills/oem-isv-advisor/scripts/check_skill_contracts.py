"""Trusted, dependency-free reader for portable advisor skill contracts.

Candidate JSON is data, never executable code. This module is also distributed
as the partner library's standalone contract checker; keep the format versioned.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

VERSION = "1.0.0"
SEMVER = re.compile(r"(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-((?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?")
CAPABILITIES = ("solution-discovery", "packaging-distribution", "development-environment",
                "implementation-best-practices", "platform-constraints", "security-readiness", "operations-release")
ROLES = {"entry-router", "capability-preflight", "capability-router", "focused-router", "focused-advisor"}
MODES = {"ask", "assess", "act"}
KINDS = {"internal_skill", "external_skill", "execution_library", "tool", "documentation_provider", "service_workflow"}
TOP_FIELDS = {"schema_version", "id", "title", "role", "capability", "maintainer", "decision", "authority", "relationships", "dependencies", "evidence", "output", "maturity"}


def body_routing_targets(text: str, available: set[str]) -> set[str]:
    """Inspect explicit IDs in introduction/routing/workflow, not exclusions/examples."""
    body = text.split("---", 2)[-1]
    active = True
    selected = []
    for line in body.splitlines():
        if line.startswith("## "):
            heading = line[3:].strip().lower()
            active = heading in {"routing", "focused routing", "workflow", "decision workflow", "handoffs"}
        if active:
            selected.append(line)
    return set(re.findall(r"`\$?([a-z][a-z0-9-]+)`", "\n".join(selected))) & available


def _scalar(raw: str) -> str:
    raw = raw.strip()
    if raw.startswith('"'):
        value = json.loads(raw)
        if not isinstance(value, str):
            raise ValueError("Metadata values must be strings.")
        return value
    if raw.startswith("'") and raw.endswith("'"):
        return raw[1:-1].replace("''", "'")
    if not raw or raw.lower() in {"true", "false", "null", "~"} or raw[0] in "[{|>" or re.fullmatch(r"[0-9.]+", raw):
        raise ValueError("Quote metadata values as strings; nested metadata is not portable.")
    return raw.split(" #", 1)[0].strip()


def _unique_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    value = {}
    for key, child in pairs:
        if key in value:
            raise ValueError(f"Duplicate JSON contract field: {key}")
        value[key] = child
    return value


def header(text: str) -> dict[str, Any]:
    """Read contract pointers, not arbitrary YAML or provider-specific settings.

    Legacy/nested provider metadata is not interpreted as this contract. New
    contract declarations use a deliberately small block of scalar strings.
    """
    match = re.match(r"\A---\s*\n(.*?)\n---(?:\n|$)", text, re.S)
    if not match:
        raise ValueError("SKILL.md requires YAML frontmatter.")
    lines = match.group(1).splitlines()
    top = {}
    for line in lines:
        if line and not line[0].isspace() and ":" in line and not line.startswith("#"):
            key, raw = line.split(":", 1)
            if key in top:
                raise ValueError(f"Duplicate frontmatter field: {key}")
            top[key] = raw.strip()
    metadata = {}
    in_metadata = False
    for line in lines:
        if line == "metadata:":
            in_metadata = True
            continue
        if in_metadata and line.strip() and not line[0].isspace():
            in_metadata = False
        if in_metadata and re.match(r"^ +(?:version|contract-schema|role|primary-capability|contract):", line):
            key, raw = line.strip().split(":", 1)
            if key in metadata:
                raise ValueError(f"Duplicate contract metadata field: {key}")
            metadata[key] = _scalar(raw)
    declared = "contract-schema" in match.group(1) or metadata.get("contract") == "references/skill-contract.json"
    if declared:
        in_metadata = False
        indent = None
        seen = set()
        for line in lines:
            if line == "metadata:":
                in_metadata = True
                continue
            if not line.strip() or line.lstrip().startswith("#"):
                continue
            if not line[0].isspace():
                in_metadata = False
            if in_metadata:
                field = re.fullmatch(r"( +)([A-Za-z0-9_-]+):\s*(.*)", line)
                if not field:
                    raise ValueError("Contract metadata must be a flat mapping of string values.")
                if indent is None:
                    indent = len(field[1])
                if len(field[1]) != indent or field[2] in seen:
                    raise ValueError("Nested or duplicate metadata is not a portable string mapping.")
                seen.add(field[2])
                _scalar(field[3])
    return {"name": top.get("name", "").strip('"\''), "keys": set(top), "metadata": metadata, "declares_contract": declared}


def _local_file(skill: Path, relative: str) -> Path:
    if not isinstance(relative, str) or not relative or Path(relative).is_absolute() or ".." in Path(relative).parts:
        raise ValueError("Contract references must be relative paths inside this skill.")
    path = skill / relative
    if path.is_symlink() or not path.resolve().is_relative_to(skill.resolve()) or not path.is_file():
        raise ValueError(f"Missing or unsafe contract reference: {relative}")
    if path.stat().st_size > 512_000:
        raise ValueError(f"Contract/reference is too large: {relative}")
    return path


def inspect_contract(skill: Path, available: set[str] | None = None) -> dict[str, Any]:
    skill = Path(skill)
    findings = []

    def issue(kind: str, message: str, field: str, severity: str = "blocker") -> None:
        findings.append({"kind": kind, "severity": severity, "skill": skill.name, "field": field,
                         "message": message, "corrective_action": "Correct the named field in the skill contract and regenerate the catalog."})

    contract = None
    skill_version = None
    try:
        text = (skill / "SKILL.md").read_text(encoding="utf-8")
        if not text.startswith("---"):
            return {"skill": skill.name, "status": "legacy", "contract": None, "findings": [],
                    "note": "No declared metadata contract; legacy structure validation remains separate."}
        h = header(text)
        if not h["declares_contract"]:
            return {"skill": skill.name, "status": "legacy", "contract": None, "findings": [],
                    "note": "No declared contract. Existing manual testing remains available."}
        md = h["metadata"]
        if set(md) - {"version"} != {"contract-schema", "role", "primary-capability", "contract"}:
            raise ValueError("Contract metadata requires contract-schema, role, primary-capability, and contract string fields.")
        skill_version = md.get("version")
        if skill_version is None:
            issue("missing_skill_version", "No individual skill version is declared; add metadata.version when next updating this skill.", "metadata.version", "warning")
        elif not SEMVER.fullmatch(skill_version):
            raise ValueError("metadata.version must be a SemVer string such as 1.0.0 or 1.1.0-rc.1; it is not the contract schema version.")
        if md["contract-schema"] != VERSION:
            raise ValueError(f"Unsupported contract schema: {md['contract-schema']}")
        if md["contract"] not in text.split("---", 2)[-1]:
            issue("undiscoverable_contract", "The skill instructions must explicitly link to its contract.", "metadata.contract")
        path = _local_file(skill, md["contract"])
        contract = json.loads(path.read_text(encoding="utf-8"), object_pairs_hook=_unique_object)
        if not isinstance(contract, dict) or set(contract) != TOP_FIELDS:
            raise ValueError("Contract has missing or unsupported top-level fields.")
        if contract["schema_version"] != VERSION:
            raise ValueError("Header and contract schema versions must agree.")
        if contract["id"] != skill.name or h["name"] != skill.name:
            issue("skill_identity_mismatch", "Folder, name, and contract id must match.", "id")
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", str(contract["id"])) or len(str(contract["id"])) > 64:
            raise ValueError("Skill identity must be a portable lowercase hyphenated name of at most 64 characters.")
        if not isinstance(contract["title"], str) or not contract["title"].strip():
            raise ValueError("Contract title must be a nonempty string.")
        role, capability = contract["role"], contract["capability"]
        if role not in ROLES or capability not in (*CAPABILITIES, None):
            raise ValueError("Declare a recognized role and one existing primary capability (or null for foundations).")
        if (role in {"entry-router", "capability-preflight"}) != (capability is None):
            issue("invalid_capability_alignment", "Only entry/preflight foundations have no home capability.", "capability")
        if role == "capability-router" and capability != skill.name:
            issue("invalid_capability_alignment", "A capability router must own its matching capability.", "capability")
        if available is not None:
            prerequisites = {"oem-isv-advisor", "advisor-capability-preflight"}
            if capability:
                prerequisites.add(capability)
            for target in sorted(prerequisites - available):
                issue("missing_runtime_owner", f"Required advisor context {target} is absent; include its skill before testing.", "capability")
        if md["role"] != role or md["primary-capability"] != (capability or "foundation"):
            issue("header_contract_mismatch", "Header role/capability differs from the contract.", "metadata")
        owner = contract["maintainer"]
        if not isinstance(owner, dict) or set(owner) != {"status", "identity"} or owner["status"] not in {"assigned", "unassigned"}:
            raise ValueError("Maintainer requires assigned/unassigned status and identity.")
        if owner["status"] == "assigned" and (not isinstance(owner["identity"], str) or not owner["identity"].strip()):
            raise ValueError("An assigned maintainer needs an accountable identity.")
        if owner["identity"] is not None and not isinstance(owner["identity"], str):
            raise ValueError("Maintainer identity must be a string or null.")
        if owner["status"] == "unassigned":
            issue("unassigned_maintainer", "No maintainer identity is established; assign one during human review.", "maintainer", "warning")
        decision = contract["decision"]
        if not isinstance(decision, dict) or set(decision) != {"owns", "excludes"}:
            raise ValueError("Decision requires owns and excludes lists.")
        for key in ("owns", "excludes"):
            if not isinstance(decision[key], list) or not all(isinstance(v, str) and v.strip() for v in decision[key]):
                raise ValueError(f"Decision {key} must be a list of nonempty strings.")
        if not decision["owns"]:
            raise ValueError("At least one owned decision is required.")
        authority = contract["authority"]
        if not isinstance(authority, dict) or set(authority) != {"supported_modes", "act_behavior", "approval_policy", "operations"}:
            raise ValueError("Authority requires modes, Act behavior, approval policy, and operations.")
        modes = authority["supported_modes"]
        if not isinstance(modes, list) or not modes or not set(modes) <= MODES or len(modes) != len(set(modes)):
            raise ValueError("Declare distinct supported Ask/Assess/Act modes.")
        if authority["act_behavior"] not in {"approval-gated-orchestration", "delegate", "configuration-only", "not-supported"}:
            raise ValueError("Unrecognized Act behavior.")
        if authority["approval_policy"] != "explicit-scoped-approval-before-material-change":
            issue("unsafe_authority", "Metadata cannot grant execution or installation approval.", "authority.approval_policy")
        if ("act" in modes) != (authority["act_behavior"] in {"approval-gated-orchestration", "configuration-only"}):
            issue("mode_behavior_mismatch", "Act support must agree with the owned workflow; delegated actions are not locally owned Act.", "authority")
        if not isinstance(authority["operations"], list) or not authority["operations"]:
            raise ValueError("Declare mode-specific operations.")
        operation_ids = set()
        for op in authority["operations"]:
            if not isinstance(op, dict) or set(op) != {"id", "mode", "target", "execution", "requires_approval"}:
                raise ValueError("Operation requires id, mode, target, execution, and requires_approval.")
            if not isinstance(op["id"], str) or not op["id"] or op["id"] in operation_ids:
                raise ValueError("Operation identities must be nonempty and unique.")
            operation_ids.add(op["id"])
            if op["mode"] not in modes or op["execution"] not in {"advise", "inspect", "delegate", "configure"} or not isinstance(op["requires_approval"], bool):
                raise ValueError("Operation mode/execution/approval is invalid.")
            if op["target"] not in {"supplied-context", "approved-evidence", "approved-target", "session-configuration"}:
                raise ValueError("Operation target must be explicit and bounded.")
            if op["mode"] == "ask" and (op["execution"] != "advise" or op["target"] != "supplied-context"):
                issue("unsafe_authority", "Ask cannot authorize inspection or mutation.", "authority.operations")
            if op["mode"] == "assess" and op["execution"] not in {"advise", "inspect"}:
                issue("unsafe_authority", "Assess cannot configure or mutate.", "authority.operations")
            if op["mode"] != "ask" and not op["requires_approval"]:
                issue("unsafe_authority", "Evidence access and material changes require scoped approval.", "authority.operations")
        if {op["mode"] for op in authority["operations"]} != set(modes):
            issue("incomplete_mode_contract", "Every supported mode needs an explicit bounded operation.", "authority.operations")
        for collection in ("relationships", "dependencies"):
            if not isinstance(contract[collection], list):
                raise ValueError(f"{collection} must be a list.")
        for relation in contract["relationships"]:
            if not isinstance(relation, dict) or set(relation) != {"target", "kind", "when"}:
                raise ValueError("Relationship requires target, kind, and when.")
            if relation["kind"] not in {"routes_to", "consults", "returns_to"} or not isinstance(relation["when"], str) or not relation["when"].strip():
                raise ValueError("Every relationship needs a recognized type and consequential condition.")
            if not isinstance(relation["target"], str) or not relation["target"].strip():
                raise ValueError("Relationship targets must be skill identifiers.")
            if available is not None and relation["target"] not in available:
                issue("nonexistent_route", f"Declared {relation['kind']} target {relation['target']} is absent from the library.", "relationships", "review")
        for dep in contract["dependencies"]:
            if not isinstance(dep, dict) or set(dep) != {"id", "kind", "modes", "requirement", "when", "missing_behavior"}:
                raise ValueError("Dependency requires id, kind, modes, requirement, when, and missing_behavior.")
            if dep["kind"] not in KINDS or dep["requirement"] not in {"required", "conditional", "optional"} or not isinstance(dep["modes"], list) or not dep["modes"] or not set(dep["modes"]) <= MODES:
                raise ValueError("Dependency type, requirement, or modes are invalid.")
            if not all(isinstance(dep[k], str) and dep[k].strip() for k in ("id", "when", "missing_behavior")):
                raise ValueError("Every dependency needs an identity, applicability condition, and fallback.")
            if dep["kind"] == "internal_skill" and available is not None and dep["id"] not in available:
                issue("missing_internal_dependency", f"Internal dependency {dep['id']} is absent.", "dependencies", "blocker" if dep["requirement"] == "required" else "review")
            if "ask" in dep["modes"] and dep["requirement"] == "required":
                issue("unconditional_ask_prerequisite", "Ask dependencies must be conditional or optional; installation completeness is not permission to block bounded advice.", "dependencies")
        if available is not None:
            declared = {r["target"] for r in contract["relationships"]} | {d["id"] for d in contract["dependencies"] if d["kind"] == "internal_skill"}
            for target in sorted(body_routing_targets(text, available) - declared - {skill.name}):
                issue("undeclared_body_handoff", f"Routing/workflow names {target}, but the contract omits it.", "relationships", "review")
            for relation in contract["relationships"]:
                if relation["kind"] == "routes_to" and f"`{relation['target']}`" not in text.split("---", 2)[-1]:
                    issue("undocumented_handoff", f"Declared route to {relation['target']} needs an explicit backticked ID in the body.", "relationships", "review")
        evidence = contract["evidence"]
        if not isinstance(evidence, dict) or set(evidence) != {"policy_skill", "practitioner_knowledge", "source_refresh"} or evidence["policy_skill"] != "oem-isv-advisor":
            raise ValueError("Evidence must reference the shared policy and scoped optional evidence files.")
        for field in ("practitioner_knowledge", "source_refresh"):
            if evidence[field] is not None:
                _local_file(skill, evidence[field])
        output = contract["output"]
        if not isinstance(output, dict) or set(output) != {"contract", "extensions"} or output["contract"] != "advisor-readout-v1" or not isinstance(output["extensions"], list) or not all(isinstance(x, str) for x in output["extensions"]):
            raise ValueError("Output requires the shared advisor-readout-v1 contract and extension list.")
        maturity = contract["maturity"]
        if not isinstance(maturity, dict) or set(maturity) != {"declared_state", "decision_areas", "validation_is_external"} or maturity["validation_is_external"] is not True:
            raise ValueError("Declared maturity cannot replace external validation evidence.")
        if not isinstance(maturity["declared_state"], str) or not isinstance(maturity["decision_areas"], list):
            raise ValueError("Maturity needs declared state and decision areas.")
        for area in maturity["decision_areas"]:
            if not isinstance(area, dict) or set(area) != {"id", "state", "reference"} or area["state"] not in {"needs-validation", "reviewed-practitioner-knowledge"}:
                raise ValueError("Decision-area maturity requires scoped provenance, not a blanket validated flag.")
            if area["reference"] is not None:
                _local_file(skill, area["reference"])
    except (OSError, ValueError, TypeError, KeyError, RecursionError) as exc:
        issue("invalid_skill_contract", str(exc), "contract")
    status = "blocked" if any(f["severity"] == "blocker" for f in findings) else "review_required" if any(f["severity"] == "review" for f in findings) else "ready"
    return {"skill": skill.name, "skill_version": skill_version, "status": status, "contract": contract, "findings": findings}


def inspect_contracts(paths: list[Path], available_paths: list[Path] | None = None) -> dict[str, Any]:
    available = {p.name for p in (available_paths or paths) if (p / "SKILL.md").is_file()}
    reports = [inspect_contract(p, available) for p in paths]
    findings = [f for report in reports for f in report["findings"]]
    status = "blocked" if any(r["status"] == "blocked" for r in reports) else "review_required" if any(r["status"] == "review_required" for r in reports) else "legacy" if reports and all(r["status"] == "legacy" for r in reports) else "ready"
    return {"schema_version": VERSION, "status": status, "skills": reports, "findings": findings}


def inspect_library_contracts(root: Path) -> dict[str, Any]:
    """Read declarations and the generated index; never execute candidate code."""
    folder = root / "skills"
    paths = sorted(p for p in folder.iterdir() if (p / "SKILL.md").is_file()) if folder.is_dir() else []
    report = inspect_contracts(paths)
    if paths and all(r["status"] == "ready" for r in report["skills"]):
        try:
            path = _local_file(folder / "oem-isv-advisor", "references/capability-catalog.json")
            if generate_catalog(root) != json.loads(path.read_text()):
                raise ValueError("The catalog differs from the declared contracts; regenerate it before relying on routing.")
        except (ValueError, OSError) as exc:
            report["status"] = "blocked"
            report["findings"].append({"kind": "catalog_drift", "severity": "blocker", "field": "capability-catalog.json", "message": str(exc), "corrective_action": "Run the contract checker with --write-catalog and commit the generated index."})
    return {**report, "skills": [{"skill": r["skill"], "status": r["status"],
                                  "skill_version": r.get("skill_version"),
                                  "role": (r.get("contract") or {}).get("role"),
                                  "capability": (r.get("contract") or {}).get("capability"),
                                  "supported_modes": ((r.get("contract") or {}).get("authority") or {}).get("supported_modes", [])}
                                 for r in report["skills"]]}


def generate_catalog(root: Path) -> dict[str, Any]:
    paths = sorted(p for p in (root / "skills").iterdir() if (p / "SKILL.md").is_file())
    report = inspect_contracts(paths)
    if report["status"] != "ready" or any(r["status"] != "ready" for r in report["skills"]):
        raise ValueError("Cannot generate catalog until all contracts are structurally ready.")
    contracts = {r["skill"]: r["contract"] for r in report["skills"]}
    versions = {r["skill"]: r.get("skill_version") for r in report["skills"]}

    def entry(c: dict) -> dict:
        return {"id": c["id"], "version": versions[c["id"]], "role": c["role"], "modes": c["authority"]["supported_modes"],
                "maturity": c["maturity"]["declared_state"], "owns": " ".join(c["decision"]["owns"]),
                "delegates_execution_to": [d["id"] for d in c["dependencies"] if d["kind"] in {"execution_library", "external_skill", "tool", "service_workflow"}]}
    capabilities = []
    for number, name in enumerate(CAPABILITIES, 1):
        c = contracts.get(name)
        if not c or c["role"] != "capability-router":
            raise ValueError(f"Missing capability owner: {name}")
        capabilities.append({**entry(c), "number": number, "title": c["title"],
                             "supporting_capabilities": [r["target"] for r in c["relationships"] if r["kind"] == "consults" and r["target"] in CAPABILITIES],
                             "focused_skills": [entry(v) for v in contracts.values() if v["capability"] == name and v["id"] != name]})
    return {"schema_version": 1, "contract_schema_version": VERSION,
            "catalog_status": "complete-architecture-skeleton", "generated_from": "per-skill contracts; do not edit this index manually",
            "baseline": {"skill_count": len(paths), "capability_count": 7,
                         "content_state": "Declared ownership and maturity; validation is separately bound to tested commits and scenarios."},
            "foundation_skills": [entry(c) for c in contracts.values() if c["capability"] is None], "capabilities": capabilities}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", type=Path)
    parser.add_argument("--write-catalog", action="store_true")
    args = parser.parse_args()
    paths = sorted(p for p in (args.root / "skills").iterdir() if (p / "SKILL.md").is_file())
    report = inspect_contracts(paths)
    if args.write_catalog:
        catalog = generate_catalog(args.root)
        target = args.root / "skills/oem-isv-advisor/references/capability-catalog.json"
        target.write_text(json.dumps(catalog, indent=2) + "\n", encoding="utf-8")
    else:
        try:
            catalog = generate_catalog(args.root)
            actual = json.loads((args.root / "skills/oem-isv-advisor/references/capability-catalog.json").read_text())
            if catalog != actual:
                report["findings"].append({"severity": "blocker", "kind": "catalog_drift", "message": "Regenerate the catalog from the contracts."})
                report["status"] = "blocked"
        except ValueError as exc:
            report["findings"].append({"severity": "blocker", "kind": "catalog_generation", "message": str(exc)})
            report["status"] = "blocked"
    print(json.dumps(report, indent=2))
    return 1 if report["status"] in {"blocked", "review_required"} else 0


if __name__ == "__main__":
    raise SystemExit(main())
