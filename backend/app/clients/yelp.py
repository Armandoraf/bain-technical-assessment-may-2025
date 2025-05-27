import httpx
from functools import cached_property


class YelpClient:
    BASE = "https://api.yelp.com/v3/businesses"

    def __init__(self, api_key: str | None = None) -> None:
        self.api_key = api_key

    @cached_property
    def _client(self) -> httpx.AsyncClient:
        return httpx.AsyncClient(
            base_url=self.BASE,
            headers={"Authorization": f"Bearer {self.api_key}"},
            timeout=5.0,
        )

    async def search(self, *, term: str, location: str, limit: int = 10):
        resp = await self._client.get(
            "/search",
            params={"term": term, "location": location, "limit": limit},
        )
        resp.raise_for_status()
        return resp.json()["businesses"]

    async def get_business(self, business_id: str) -> dict:
        resp = await self._client.get(f"/{business_id}")
        resp.raise_for_status()
        return resp.json()
