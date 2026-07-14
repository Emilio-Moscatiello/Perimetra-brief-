from __future__ import annotations

import hashlib
import json
import random
from datetime import datetime, timedelta
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent
_SEED_PATH = _ROOT / "data" / "summary_seed.json"

with open(_SEED_PATH, "r", encoding="utf-8") as fh:
    _SEED = json.load(fh)["results"][0]

_DEMO_DOMAINS = [
    {
        "domain_name": "cybersonar.demo",
        "seed": 99,
        "label": "Critico",
        "base": _SEED,
    },
    {
        "domain_name": "northwind-retail.demo",
        "seed": 47,
        "label": "Attenzione",
        "base": None,
    },
    {
        "domain_name": "aurora-fintech.demo",
        "seed": 12,
        "label": "Solido",
        "base": None,
    },
]

SEVERITIES = ["critical", "high", "medium", "low", "info"]
LEAK_CATEGORIES = ["vip", "domain_stealer", "potential_stealer", "other_stealer", "general_leak"]
COMMON_PORTS = ["21", "22", "25", "53", "80", "443", "3306", "3389", "6667", "6697", "8080", "8800"]


def _rng(domain: str, salt: str = "") -> random.Random:
    return random.Random(f"{domain}::{salt}")


def _scaled_score(rng: random.Random, ceiling: int) -> int:
    return max(0, min(100, int(rng.gauss(ceiling, 12))))


def _synthesize_domain(entry: dict) -> dict:
    domain = entry["domain_name"]
    ceiling = entry["seed"]
    rng = _rng(domain, "summary")

    n_asset = max(8, int(rng.gauss(ceiling * 0.9, 15)))
    unique_ipv4 = max(1, int(n_asset * rng.uniform(0.25, 0.45)))
    unique_ipv6 = max(0, int(n_asset * rng.uniform(0.05, 0.25)))

    n_port = {}
    for port in rng.sample(COMMON_PORTS, k=rng.randint(3, 7)):
        weight = 1.6 if port in ("80", "443") else 1.0
        n_port[port] = {"n": max(1, int(rng.gauss(ceiling * 0.35 * weight, 8)))}

    n_cert_attivi = max(0, int(rng.gauss(20 - ceiling * 0.1, 5)))
    n_cert_scaduti = max(0, int(rng.gauss(ceiling * 0.15, 4)))

    total_vulns = {
        "critical": max(0, int(rng.gauss(ceiling * 0.03, 1.5))),
        "high": max(0, int(rng.gauss(ceiling * 0.18, 4))),
        "medium": max(0, int(rng.gauss(ceiling * 0.5, 8))),
        "low": max(0, int(rng.gauss(ceiling * 0.1, 3))),
        "info": max(0, int(rng.gauss(ceiling * 0.7, 10))),
    }
    active_vulns = {k: max(0, int(v * rng.uniform(0.05, 0.35))) for k, v in total_vulns.items()}
    passive_vulns = {k: max(0, total_vulns[k] - active_vulns[k]) for k in total_vulns}

    dataleak_total = {
        "vip": max(0, int(rng.gauss(ceiling * 0.02, 1))),
        "domain_stealer": max(0, int(rng.gauss(ceiling * 0.03, 1))),
        "potential_stealer": max(0, int(rng.gauss(ceiling * 7, 60))),
        "other_stealer": max(0, int(rng.gauss(ceiling * 0.15, 3))),
        "general_leak": max(0, int(rng.gauss(ceiling * 0.05, 2))),
    }
    dataleak_resolved = {k: max(0, int(v * rng.uniform(0.0, 0.6))) for k, v in dataleak_total.items()}
    dataleak_unresolved = {k: dataleak_total[k] - dataleak_resolved[k] for k in dataleak_total}

    spoofable = rng.random() < (ceiling / 100)
    dmarc_policy = rng.choice(["none", "quarantine", "reject"]) if ceiling > 30 else "reject"

    waf_count = max(0, int(rng.gauss(4 - ceiling * 0.02, 1.5)))
    cdn_count = 1 if rng.random() > (ceiling / 130) else 0

    now = datetime(2024, 3, 7, 18, 8, 41)
    created = now - timedelta(days=rng.randint(1, 40))

    report = {
        "idsummary": f"{hashlib.sha1(domain.encode()).hexdigest()[:8]}-{domain[:4]}-demo",
        "summary_text": _summary_it(domain, ceiling),
        "summary_text_en": _summary_en(domain, ceiling),
        "risk_score": str(ceiling),
        "creation_date": created.strftime("%Y-%m-%d %H:%M:%S"),
        "last_edit": (created + timedelta(hours=rng.randint(4, 30))).strftime("%Y-%m-%d %H:%M:%S"),
        "domain_name": domain,
        "servizi_esposti_score": _scaled_score(rng, ceiling),
        "dataleak_score": _scaled_score(rng, ceiling),
        "rapporto_leak_email_score": _scaled_score(rng, ceiling * 0.6),
        "spoofing_score": 50 if spoofable else 5,
        "open_ports_score": _scaled_score(rng, ceiling * 0.5),
        "blacklist_score": _scaled_score(rng, ceiling * 0.7),
        "vulnerability_score_active": _scaled_score(rng, ceiling * 0.6),
        "vulnerability_score_passive": _scaled_score(rng, ceiling),
        "certificate_score": _scaled_score(rng, 70 - ceiling * 0.2),
        "n_port": n_port,
        "n_cert_attivi": n_cert_attivi,
        "n_cert_scaduti": n_cert_scaduti,
        "n_asset": n_asset,
        "n_similar_domains": max(0, int(rng.gauss(ceiling * 0.15, 4))),
        "email_security": {
            "spoofable": "Spoofing possible." if spoofable else "Domain not spoofable.",
            "dmarc_policy": dmarc_policy,
            "blacklist_detections": max(0, int(rng.gauss(ceiling * 0.03, 1))),
            "blacklist_total_list": 60,
            "blacklist_detected_list": [],
        },
        "n_dataleak": {
            "total": dataleak_total,
            "resolved": dataleak_resolved,
            "unresolved": dataleak_unresolved,
            "enumeration": max(0, int(rng.gauss(ceiling * 0.05, 2))),
        },
        "n_vulns": {
            "total": total_vulns,
            "active": active_vulns,
            "passive": passive_vulns,
        },
        "waf": {
            "count": waf_count,
            "assets": [f"{domain[:3]}-waf-{i:02d}" for i in range(waf_count)],
        },
        "cdn": {
            "count": cdn_count,
            "assets": ([f"{domain[:3]}-cdn-01"] if cdn_count else []),
        },
        "unique_ipv4": unique_ipv4,
        "unique_ipv6": unique_ipv6,
        "label": entry["label"],
    }
    return report


def _summary_it(domain: str, ceiling: int) -> str:
    if ceiling >= 75:
        tone = "critica"
        action = "E' richiesta un'azione immediata."
    elif ceiling >= 40:
        tone = "moderata, con alcuni punti di attenzione"
        action = "Si raccomanda una revisione nelle prossime settimane."
    else:
        tone = "sotto controllo"
        action = "Nessuna azione urgente richiesta, mantenere il monitoraggio."
    return (
        f"Il dominio \"{domain}\" presenta una situazione di sicurezza {tone}, "
        f"con un punteggio di rischio di {ceiling} su 100. {action}"
    )


def _summary_en(domain: str, ceiling: int) -> str:
    if ceiling >= 75:
        tone = "critical"
        action = "Immediate action is required."
    elif ceiling >= 40:
        tone = "moderate, with some points of attention"
        action = "A review in the coming weeks is recommended."
    else:
        tone = "under control"
        action = "No urgent action required, keep monitoring."
    return (
        f"The domain \"{domain}\" currently has a {tone} security posture, "
        f"with a risk score of {ceiling} out of 100. {action}"
    )


def _build_reports() -> dict[str, dict]:
    reports = {}
    for entry in _DEMO_DOMAINS:
        if entry["base"] is not None:
            r = dict(entry["base"])
            r["label"] = entry["label"]
            reports[entry["domain_name"]] = r
        else:
            reports[entry["domain_name"]] = _synthesize_domain(entry)
    return reports


_REPORTS = _build_reports()


def list_domains() -> list[dict]:
    out = []
    for entry in _DEMO_DOMAINS:
        r = _REPORTS[entry["domain_name"]]
        out.append({
            "domain_name": r["domain_name"],
            "risk_score": int(r["risk_score"]),
            "label": r.get("label", ""),
            "last_edit": r["last_edit"],
        })
    return out


def get_summary(domain: str) -> dict | None:
    return _REPORTS.get(domain)


def get_history(domain: str, days: int = 90) -> list[dict] | None:
    report = _REPORTS.get(domain)
    if report is None:
        return None
    rng = _rng(domain, "history")
    end_score = int(report["risk_score"])
    start_score = max(5, min(95, end_score + rng.randint(-25, 15)))
    points = []
    end_date = datetime.strptime(report["last_edit"], "%Y-%m-%d %H:%M:%S")
    for i in range(days):
        t = i / (days - 1)
        drift = start_score + (end_score - start_score) * t
        noise = rng.gauss(0, 2.5)
        score = max(0, min(100, round(drift + noise)))
        date = end_date - timedelta(days=(days - 1 - i))
        points.append({"date": date.strftime("%Y-%m-%d"), "risk_score": int(score)})
    points[-1]["risk_score"] = end_score
    return points


def get_vulnerabilities(domain: str) -> dict | None:
    report = _REPORTS.get(domain)
    if report is None:
        return None
    rng = _rng(domain, "vulns-detail")
    titles = {
        "critical": ["Remote Code Execution in exposed admin panel", "Unauthenticated SQL Injection", "Default credentials on management interface"],
        "high": ["Outdated TLS configuration (TLS 1.0/1.1 enabled)", "Directory listing exposed", "Known CVE in outdated CMS plugin", "Broken access control on API endpoint"],
        "medium": ["Missing security headers (CSP, HSTS)", "Verbose error messages leaking stack traces", "Weak password policy", "Cookie without Secure/HttpOnly flag"],
        "low": ["Server banner disclosure", "Deprecated cipher suite supported"],
        "info": ["Open port with expected service", "TLS certificate transparency log entry", "robots.txt discloses internal paths"],
    }
    rows = []
    counts = report["n_vulns"]["total"]
    active_counts = report["n_vulns"]["active"]
    idx = 0
    for sev in SEVERITIES:
        count = counts.get(sev, 0)
        active_for_sev = active_counts.get(sev, 0)
        pool = titles[sev]
        for i in range(count):
            idx += 1
            is_active = i < active_for_sev
            rows.append({
                "id": f"VULN-{domain[:3].upper()}-{idx:04d}",
                "severity": sev,
                "status": "active" if is_active else "passive",
                "title": rng.choice(pool),
                "asset": f"asset-{rng.randint(1, max(1, report['n_asset']))}.{domain}",
                "detected_at": (datetime.strptime(report["last_edit"], "%Y-%m-%d %H:%M:%S") - timedelta(days=rng.randint(0, 60))).strftime("%Y-%m-%d"),
            })
    rng.shuffle(rows)
    return {"domain_name": domain, "total": len(rows), "items": rows}


def get_dataleaks(domain: str) -> dict | None:
    report = _REPORTS.get(domain)
    if report is None:
        return None
    rng = _rng(domain, "leaks-detail")
    sources = ["Telegram stealer log", "Dark web marketplace dump", "Public paste site", "Credential stuffing list", "Breach compilation (COMB-style)"]
    rows = []
    idx = 0
    for cat in LEAK_CATEGORIES:
        total = report["n_dataleak"]["total"].get(cat, 0)
        resolved = report["n_dataleak"]["resolved"].get(cat, 0)
        sample_count = min(total, 25)
        for i in range(sample_count):
            idx += 1
            rows.append({
                "id": f"LEAK-{domain[:3].upper()}-{idx:04d}",
                "category": cat,
                "status": "resolved" if i < resolved else "unresolved",
                "source": rng.choice(sources),
                "identifier": f"user{rng.randint(100,999)}@{domain}",
                "detected_at": (datetime.strptime(report["last_edit"], "%Y-%m-%d %H:%M:%S") - timedelta(days=rng.randint(0, 120))).strftime("%Y-%m-%d"),
            })
    rng.shuffle(rows)
    return {"domain_name": domain, "totals": report["n_dataleak"], "items": rows}


def get_similar_domains(domain: str) -> dict | None:
    report = _REPORTS.get(domain)
    if report is None:
        return None
    rng = _rng(domain, "similar")
    n = report.get("n_similar_domains", 0)
    tlds = [".com", ".net", ".info", ".biz", ".xyz", ".co"]
    base = domain.split(".")[0]
    variants = ["secure-", "my-", "", "login-", "-support", "-verify", "1", "-online"]
    rows = []
    seen = set()
    attempts = 0
    while len(rows) < n and attempts < n * 8 + 20:
        attempts += 1
        v = rng.choice(variants)
        name = f"{v}{base}{rng.choice(variants)}".strip("-") + rng.choice(tlds)
        if name in seen or name == domain:
            continue
        seen.add(name)
        rows.append({
            "domain": name,
            "similarity": round(rng.uniform(0.72, 0.98), 2),
            "registered": rng.random() > 0.3,
            "risk": rng.choice(["typosquatting", "phishing kit detected", "parked", "unknown"]),
        })
    return {"domain_name": domain, "total": n, "items": rows}
