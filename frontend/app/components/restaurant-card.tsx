import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from './ui/card';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import type { Restaurant } from '~/lib/types';

type Props = { restaurant: Restaurant };

export function RestaurantCard({ restaurant }: Props) {
  return (
    <Link to={restaurant.url} target="_blank" rel="noopener noreferrer">
      <Card className="relative group h-full flex flex-col hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg group-hover:text-primary transition-colors">
            {restaurant.name}
          </CardTitle>
          <CardDescription className="text-sm">
            {restaurant.location.display_address.join(', ')}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow flex items-end pb-4">
          <p className="text-sm text-muted-foreground">
            {restaurant.rating} ★ ({restaurant.review_count} reviews)
          </p>
        </CardContent>

        <CardFooter className="justify-end pt-0">
          <span className="rounded-full p-2 border border-border group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <ChevronRight size={18} />
          </span>
        </CardFooter>

        {restaurant.rationale && (
          <div
            className="
              absolute inset-0
              bg-black/90 text-white
              opacity-0 group-hover:opacity-100
              transition-opacity duration-200
              flex items-center justify-center
              p-4 text-sm text-center
              z-10
            "
          >
            {restaurant.rationale}
          </div>
        )}
      </Card>
    </Link>
  );
}
