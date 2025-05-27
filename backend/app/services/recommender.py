from typing import Dict, List
from app.models.llm import RestaurantList

from openai import AsyncOpenAI, OpenAIError
from app.clients.yelp import YelpClient
from app.models.restaurant import RestaurantOut


class RecommenderService:
    """
    Uses OpenAI's Responses API (GPT-4.1 + web_search tool) to search 
    restaurants, merges them with any cached results, ranks, and returns.
    """

    def __init__(self,
                 yelp: YelpClient,
                 cache,
                 default_openai_client: AsyncOpenAI):
        self.yelp = yelp
        self.cache = cache
        self._default_client = default_openai_client

    async def _ask_agent(
        self,
        *,
        city: str,
        query: str,
        cuisines: list[str] | None = None,
        prices: list[str] | None = None,
        max_suggestions: int = 15,
        client: AsyncOpenAI,
    ) -> set[tuple[str, str]]:

        filters: list[str] = []
        if cuisines:
            filters.append(f"cuisine(s): {', '.join(cuisines)}")
        if prices:
            filters.append(f"price: {', '.join(prices)}")

        concierge = (
            f"You are a dining concierge for {city}. "
            f"Return **only** JSON that validates against the provided schema. "
            f"Include at most {max_suggestions} places with valid Yelp pages. "
            "For each place add a short `rationale` string explaining, in one sentence, "
            "why you are recommending it."
        )
        if filters:
            concierge += f" Required filters: {' and '.join(filters)}."

        try:
            resp = await client.responses.parse(
                model="gpt-4.1",
                instructions=concierge,
                input=query or "Any recommendation",
                tools=[{"type": "web_search"}],
                text_format=RestaurantList,
                temperature=0.3,
                parallel_tool_calls=True,
            )

            return {
                (r.name, str(r.yelp_url), r.rationale)
                for r in resp.output_parsed.restaurants
            }
        except (OpenAIError, ValueError, TypeError) as exc:
            print(
                "Failed running responses.parse: %s\n"
                "city=%s | query=%s | cuisines=%s | prices=%s",
                exc, city, query, cuisines, prices,
            )
            raise

    async def recommend(
        self,
        *,
        city: str,
        query: str,
        cuisines: list[str],
        prices: list[str],
        limit: int,
        openai_client: AsyncOpenAI | None = None,
    ) -> list[RestaurantOut]:
        client = openai_client or self._default_client
        cache_key = f"{city}:{query}"
        cached: List[RestaurantOut] = await self.cache.get(cache_key) or []

        # 1 — Agentic web search
        agent_candidates = await self._ask_agent(
            city=city,
            query=query,
            cuisines=cuisines,
            prices=prices,
            client=client
        )

        fresh: List[RestaurantOut] = []
        for name, yelp_url, rationale in agent_candidates:
            business_id = yelp_url.rstrip(
                "/").split("/")[-1]  # extract Yelp ID
            try:
                business = await self.yelp.get_business(business_id)
                rest = RestaurantOut.from_yelp(business)
                rest_dict = rest.dict()
                rest_dict["rationale"] = rationale
                fresh.append(RestaurantOut(**rest_dict))
            except Exception:
                continue

        # 3 — Merge with cache, dedupe by Yelp business id
        combined: Dict[str, RestaurantOut] = {r.id: r for r in cached}
        combined.update({r.id: r for r in fresh})

        # 4 — Rank: primary rating, secondary review_count
        ranked = sorted(
            combined.values(),
            key=lambda r: (r.rating, r.review_count),
            reverse=True
        )[:limit]

        await self.cache.set(cache_key, ranked, ttl=600)
        return ranked
