from fastapi import FastAPI, HTTPException, Depends
from typing import List
from datetime import timedelta
from fastapi.middleware.cors import CORSMiddleware

from app.models.restaurant import Category, Location, RestaurantOut
from app.clients.yelp import YelpClient
from app.services.recommender import RecommenderService
from aiocache import SimpleMemoryCache
from app.dependencies.openai_client import get_openai_client

from openai import AsyncOpenAI
import os
from app.services.yelp_service import YelpService
from startup import warm_partner_list, PARTNER_CACHE_KEY


app = FastAPI(title="Restaurant Recommender API")

yelp = YelpClient(api_key=os.getenv("YELP_API_KEY"))
yelp_service = YelpService(yelp)

cache = SimpleMemoryCache()
default_openai = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

recommender = RecommenderService(yelp, cache, default_openai)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                   "http://localhost:3000", "http://192.168.97.3:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MOCK_RESTAURANTS: List[RestaurantOut] = [
    RestaurantOut(
        id="mock-1",
        name="Mock Bistro",
        url="https://example.com/mock-bistro",
        rating=4.5,
        review_count=120,
        price="$$",
        location=Location(
            address1="123 Mockingbird Ln",
            city="San Francisco",
            state="CA",
            zip_code="94103",
            country="US",
            display_address=[
                "123 Mockingbird Ln",
                "San Francisco, CA 94103",
            ],
        ),
        phone="415-555-1234",
        categories=[Category(alias="italian", title="Italian")],
        image_url="https://example.com/photo1.jpg",
    ),
    RestaurantOut(
        id="mock-2",
        name="Sample Sushi",
        url="https://example.com/sample-sushi",
        rating=4.0,
        review_count=80,
        price="$$$",
        location=Location(
            address1="456 Sample St",
            city="San Francisco",
            state="CA",
            zip_code="94104",
            country="US",
            display_address=[
                "456 Sample St",
                "San Francisco, CA 94104",
            ],
        ),
        phone="415-555-9876",
        categories=[Category(alias="sushi", title="Sushi Bars")],
        image_url="https://example.com/photo2.jpg",
    ),
]


@app.on_event("startup")
async def _warm_caches() -> None:
    await warm_partner_list(cache=cache, yelp_service=yelp_service)


@app.get("/restaurants/partner-approved", response_model=List[RestaurantOut])
async def get_partner_approved_restaurants():
    """
    Always return the pre-warmed, partner-approved list.
    Never hits Yelp at request time.
    """
    restaurants = await cache.get(PARTNER_CACHE_KEY)
    if restaurants is None:
        return MOCK_RESTAURANTS
    return restaurants


@app.get("/restaurants/near-you", response_model=List[RestaurantOut])
async def get_near_you_restaurants(
    city: str = "San Francisco",
    term: str = "restaurants",
    limit: int = 10,
):
    """
    Return the top Yelp matches near the supplied city.
    Results are cached for 1 h.
    """
    cache_key = f"near_you::{city.lower()}::{term.lower()}::{limit}"
    if (cached := await cache.get(cache_key)):
        return cached

    try:
        results = await yelp_service.search(term=term, location=city, limit=limit)
    except Exception as exc:
        raise HTTPException(
            status_code=502, detail=f"Yelp search failed: {exc}")

    await cache.set(cache_key, results, ttl=int(timedelta(hours=1).total_seconds()))
    return results


@app.get("/restaurants/recommended", response_model=List[RestaurantOut])
async def recommend_restaurants(
    query: str = "",
    city: str = "San Francisco",
    cuisines: str = "",
    prices: str = "",
    limit: int = 5,
    openai_client: AsyncOpenAI = Depends(get_openai_client),
):
    """
    Return AI-powered restaurant recommendations using the
    caller’s OpenAI key when supplied.
    """
    try:
        return await recommender.recommend(
            city=city,
            query=query,
            cuisines=cuisines.split(",") if cuisines else [],
            prices=prices.split(",") if prices else [],
            limit=limit,
            openai_client=openai_client,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502, detail=f"Recommender failed: {exc}")
