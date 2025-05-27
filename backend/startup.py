from typing import List

from app.models.restaurant import RestaurantOut
from app.services.yelp_service import YelpService
from aiocache import SimpleMemoryCache

PARTNER_CACHE_KEY = "partner_approved"


async def warm_partner_list(
    cache: SimpleMemoryCache,
    yelp_service: YelpService,
) -> None:
    raw = "sotto-san-francisco,che-fico-san-francisco,tartine-bakery-san-francisco"
    partner_ids = [i.strip() for i in raw.split(",") if i.strip()]

    restaurants: List[RestaurantOut] = await yelp_service.lookup_many(partner_ids)

    if not restaurants:
        raise RuntimeError("No valid partner restaurants resolved from Yelp")

    await cache.set(PARTNER_CACHE_KEY, restaurants, ttl=None)
