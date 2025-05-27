export type Restaurant = {
  id: string;
  name: string;
  url: string;
  rating: number;
  review_count: number;
  location: { display_address: string[] };
  rationale?: string;
};
