from pydantic import BaseModel
from typing import List


class LLMRestaurant(BaseModel):
    name: str
    yelp_url: str
    rationale: str


class RestaurantList(BaseModel):
    restaurants: List[LLMRestaurant]
