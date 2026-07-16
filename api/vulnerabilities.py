from api._data import get_vulnerabilities
from api._util import JSONHandler


class handler(JSONHandler):
    def handle_get(self, query: dict) -> None:
        domain = query.get("domain", "cybersonar.demo")
        result = get_vulnerabilities(domain)
        if result is None:
            self._send(404, {"status": "error", "message": f"Unknown domain: {domain}"})
            return
        self._send(200, {"status": "success", **result})
