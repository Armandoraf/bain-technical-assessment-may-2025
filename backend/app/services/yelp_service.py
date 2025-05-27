from typing import Sequence, List
import asyncio

from app.clients.yelp import YelpClient
from app.models.restaurant import RestaurantOut


class YelpService:
    """
    Thin convenience wrapper around `YelpClient` that:
      • converts Yelp JSON → `RestaurantOut`
      • fans-out parallel look-ups safely
    """

    def __init__(self, yelp: YelpClient):
        self.yelp = yelp

    async def search(
        self,
        *,
        term: str,
        location: str,
        limit: int = 10,
    ) -> List[RestaurantOut]:
        businesses = await self.yelp.search(term=term, location=location, limit=limit)
        return [RestaurantOut.from_yelp(b) for b in businesses]

    async def lookup_many(self, business_ids: Sequence[str]) -> List[RestaurantOut]:
        async def _one(business_id: str):
            try:
                return RestaurantOut.from_yelp(await self.yelp.get_business(business_id))
            except Exception:
                return None

        results = await asyncio.gather(*(_one(business_id) for business_id in business_ids))
        return [r for r in results if r is not None]
