from api._data import get_history
from api._util import JSONHandler


class handler(JSONHandler):
    def handle_get(self, query: dict) -> None:
        domain = query.get("domain", "cybersonar.demo")
        days = int(query.get("days", "90"))
        days = max(7, min(365, days))
        points = get_history(domain, days=days)
        if points is None:
            self._send(404, {"status": "error", "message": f"Unknown domain: {domain}"})
            return
        self._send(200, {"status": "success", "domain_name": domain, "points": points})
