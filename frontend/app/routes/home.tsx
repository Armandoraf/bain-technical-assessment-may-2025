import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { RestaurantCard } from '~/components/restaurant-card';
import { Skeleton } from '~/components/ui/skeleton';
import type { Restaurant } from '~/lib/types';
import { useSearchStatus } from '~/contexts/search-status-context';
import { apiFetch } from '~/lib/api-fetch';

export default function Home() {
  const { search } = useLocation();

  const { setLoadingRecommendations, loadingRecommendations } =
    useSearchStatus();

  const [partnerApproved, setPartnerApproved] = useState<Restaurant[]>([]);
  const [nearYou, setNearYou] = useState<Restaurant[]>([]);
  const [recommended, setRecommended] = useState<Restaurant[]>([]);

  const [loadingPartner, setLoadingPartner] = useState(false);
  const [loadingNear, setLoadingNear] = useState(false);

  const params = new URLSearchParams(search);
  const query = params.get('query') ?? '';
  const cuisines = params.get('cuisines');
  const prices = params.get('prices');
  const city = params.get('city') ?? 'San Francisco';

  function buildRecQuerieS() {
    const p = new URLSearchParams();
    p.set('query', query);
    if (city) p.set('city', city);
    if (cuisines) p.set('cuisines', cuisines);
    if (prices) p.set('prices', prices);
    return p.toString();
  }

  useEffect(() => {
    async function loadData() {
      setLoadingPartner(true);
      const partnerApprovedResponse = await apiFetch(
        `/restaurants/partner-approved`
      );
      setPartnerApproved(
        partnerApprovedResponse.ok ? await partnerApprovedResponse.json() : []
      );
      setLoadingPartner(false);

      setLoadingNear(true);
      const nearRes = await apiFetch(
        `/restaurants/near-you${
          city ? `?city=${encodeURIComponent(city)}` : ''
        }`
      );
      setNearYou(nearRes.ok ? await nearRes.json() : []);
      setLoadingNear(false);

      if (!query) {
        setRecommended([]);
        setLoadingRecommendations(false);
        return;
      }
      setLoadingRecommendations(true);
      const recRes = await apiFetch(
        `/restaurants/recommended?${buildRecQuerieS()}`
      );
      setRecommended(recRes.ok ? await recRes.json() : []);
      setLoadingRecommendations(false);
    }

    loadData();
  }, [search]);

  const skeletons = Array.from({ length: 4 }).map((_, i) => (
    <Skeleton key={i} className="h-48 w-full rounded-xl" />
  ));

  return (
    <div className="w-full mt-8 p-8 space-y-10">
      {query && (
        <section>
          <div className="mb-4">
            <h2 className="text-xl mb-1">Munch.’s recommendations</h2>
            <span className="text-xs text-slate-600">
              {loadingRecommendations
                ? 'Loading tasty ideas...'
                : `Brainstormed ${recommended.length} ideas`}
            </span>
          </div>
          {loadingRecommendations ? (
            <>
              <div className="grid sm:grid-cols-1 md:grid-cols-4 gap-6">
                {skeletons}
              </div>
            </>
          ) : (
            <div className="grid sm:grid-cols-1 md:grid-cols-4 gap-6">
              {recommended.map(r => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </div>
          )}
        </section>
      )}

      <section>
        <div className="mb-1 gap-2">
          <h2 className="text-xl">Recently Bain-Approved</h2>
          <span className="text-xs text-slate-600">
            Rated ≥ 4.5 ★ by Bain partners in the last 60 days
          </span>
        </div>
        {loadingPartner && partnerApproved.length === 0 ? (
          <div className="grid sm:grid-cols-1 md:grid-cols-4 gap-6">
            {skeletons}
          </div>
        ) : (
          <div className="grid sm:grid-cols-1 md:grid-cols-4 gap-6">
            {partnerApproved.map(r => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl mb-3">Near you in {city}</h2>
        {loadingNear && nearYou.length === 0 ? (
          <div className="grid sm:grid-cols-1 md:grid-cols-4 gap-6">
            {skeletons}
          </div>
        ) : (
          <div className="grid sm:grid-cols-1 md:grid-cols-4 gap-6">
            {nearYou.map(r => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
