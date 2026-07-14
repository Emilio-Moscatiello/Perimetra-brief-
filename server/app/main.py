import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "api"))

import _data
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Perimetra Security Report API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/domains")
def domains():
    return {"status": "success", "results": _data.list_domains()}


@app.get("/api/summary")
def summary(domain: str = Query("cybersonar.demo")):
    report = _data.get_summary(domain)
    if report is None:
        raise HTTPException(status_code=404, detail=f"Unknown domain: {domain}")
    return {"status": "success", "results": [report]}


@app.get("/api/history")
def history(domain: str = Query("cybersonar.demo"), days: int = Query(90, ge=7, le=365)):
    points = _data.get_history(domain, days=days)
    if points is None:
        raise HTTPException(status_code=404, detail=f"Unknown domain: {domain}")
    return {"status": "success", "domain_name": domain, "points": points}


@app.get("/api/vulnerabilities")
def vulnerabilities(domain: str = Query("cybersonar.demo")):
    result = _data.get_vulnerabilities(domain)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Unknown domain: {domain}")
    return {"status": "success", **result}


@app.get("/api/dataleaks")
def dataleaks(domain: str = Query("cybersonar.demo")):
    result = _data.get_dataleaks(domain)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Unknown domain: {domain}")
    return {"status": "success", **result}


@app.get("/api/similar")
def similar(domain: str = Query("cybersonar.demo")):
    result = _data.get_similar_domains(domain)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Unknown domain: {domain}")
    return {"status": "success", **result}


@app.get("/api/health")
def health():
    return {"status": "ok"}
