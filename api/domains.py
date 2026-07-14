from _data import list_domains
from _util import JSONHandler


class handler(JSONHandler):
    def handle_get(self, query: dict) -> None:
        self._send(200, {"status": "success", "results": list_domains()})
