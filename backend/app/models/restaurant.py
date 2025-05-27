from typing import List, Optional
from pydantic import BaseModel, HttpUrl, Field


class Category(BaseModel):
    alias: str
    title: str


class Location(BaseModel):
    address1: str
    address2: Optional[str] = None
    address3: Optional[str] = None
    city: str
    state: str
    zip_code: str = Field(..., alias="zip_code")
    country: str
    display_address: List[str]


class RestaurantOut(BaseModel):
    id: str
    name: str
    url: HttpUrl
    rating: float
    review_count: int
    price: Optional[str] = None
    location: Location
    phone: Optional[str] = None
    categories: List[Category]
    image_url: Optional[HttpUrl] = None
    rationale: Optional[str] = None

    @classmethod
    def from_yelp(cls, data: dict) -> "RestaurantOut":
        """
        Transform raw Yelp business JSON into our API schema.
        """
        return cls(
            id=data["id"],
            name=data["name"],
            url=data["url"],
            rating=data["rating"],
            review_count=data["review_count"],
            price=data.get("price"),
            location=Location(**data["location"]),
            phone=data.get("display_phone"),
            categories=[Category(**c) for c in data.get("categories", [])],
            image_url=data.get("image_url"),
        )
