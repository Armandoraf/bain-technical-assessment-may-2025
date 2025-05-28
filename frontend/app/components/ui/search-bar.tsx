import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { MultiSelect } from './multi-select';
import { ChevronRight, DollarSign, Globe, Loader2, Salad } from 'lucide-react';
import { Badge } from './badge';
import { useSearchStatus } from '~/contexts/search-status-context';

export function SearchBar() {
  const { loadingRecommendations } = useSearchStatus();

  const [searchTerm, setSearchTerm] = useState('');
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [prices, setPrices] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [cityOptions, setCityOptions] = useState(
    ['San Francisco', 'New York', 'Chicago', 'Tokyo'].map(c => ({
      label: c,
      value: c
    }))
  );

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const buildSearchParams = (
    term: string,
    cs: string[],
    ps: string[],
    ns: string[]
  ) => {
    const params = new URLSearchParams();

    if (term.trim()) {
      params.set('query', term.trim());
    }

    if (cs.length) {
      params.set('cuisines', cs.join(','));
    }

    if (ps.length) {
      params.set('prices', ps.join(','));
    }

    if (ns.length) {
      params.set('city', ns.join(','));
    }

    return params.toString();
  };

  const navigateToSearch = (
    term: string,
    cs: string[],
    ps: string[],
    ns: string[]
  ) => {
    navigate({ pathname: '/', search: buildSearchParams(term, cs, ps, ns) });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (!value.trim() && value.length > 0) return;
    setSearchTerm(value);
  };

  const handleSubmit = () => {
    if (!searchTerm.trim()) return;
    navigateToSearch(searchTerm, cuisines, prices, cities);
  };

  const EXAMPLE_QUERIES = [
    'I need a quiet, high-end spot for a client lunch with a fintech CEO',
    'What are some vibrant downtown restaurants that can host a team dinner with strong vegetarian options?',
    'Best private-room sushi venues for a big group of 18 consultants next Tuesday',
    'I need a lakefront restaurant for a post-project celebration tonight'
  ];

  const hasQueryParam = Boolean(searchParams.get('query'));

  const handleBubbleClick = (term: string) => {
    setSearchTerm(term);
    navigateToSearch(term, cuisines, prices, cities);
  };

  // Geolocation: auto-detect city on first mount
  useEffect(() => {
    if (searchParams.get('city') || cities.length) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          if (!res.ok) return;
          const data = await res.json();
          const cityName =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.municipality;
          if (!cityName) return;

          setCities([cityName]);
          setCityOptions(prev =>
            prev.find(o => o.value === cityName)
              ? prev
              : [...prev, { label: cityName, value: cityName }]
          );
          navigate({
            pathname: '/',
            search: buildSearchParams(searchTerm, cuisines, prices, [cityName])
          });
        } catch (err) {
          console.debug(err);
        }
      },
      () => {},
      { maximumAge: 60_000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="relative group flex border border-gray-300 py-3 rounded flex-col md:w-3/5 lg:w-1/2 xl:w-2/5 focus-within:border-black transition-colors duration-300 ease-in-out">
        <textarea
          className="px-4 h-16 bg-transparent outline-none text-sm placeholder-gray-400 resize-none"
          placeholder="Ask for a recommendation..."
          value={searchTerm}
          onChange={handleSearchChange}
        />

        <div className="px-2 flex justify-between items-center">
          <div className="flex gap-x-4">
            <MultiSelect
              disabled={loadingRecommendations}
              placeholder={<Salad className="h-4 w-4" />}
              value={cuisines}
              onChange={setCuisines}
              options={[
                'Italian',
                'Japanese',
                'Indian',
                'French',
                'Mexican'
              ].map(c => ({ label: c, value: c.toLowerCase() }))}
            />
            <MultiSelect
              disabled={loadingRecommendations}
              placeholder={<DollarSign className="h-4 w-4" />}
              value={prices}
              onChange={setPrices}
              options={['$', '$$', '$$$', '$$$$'].map(p => ({
                label: p,
                value: p
              }))}
            />
            <MultiSelect
              disabled={loadingRecommendations}
              placeholder={<Globe className="h-4 w-4" />}
              value={cities}
              onChange={setCities}
              options={cityOptions}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!searchTerm.trim() || loadingRecommendations}
            className={`${
              searchTerm.trim() && !loadingRecommendations
                ? 'bg-slate-700 text-white cursor-pointer'
                : 'cursor-default text-gray-400'
            } transition-colors duration-300 rounded-full h-6 w-6 flex items-center justify-center`}
          >
            {loadingRecommendations ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <ChevronRight />
            )}
          </button>
        </div>
      </div>

      {!hasQueryParam && (
        <div className="mt-2 md:w-3/5 lg:w-1/2 xl:w-2/5 flex justify-center flex-wrap gap-2">
          {EXAMPLE_QUERIES.map(q => (
            <Badge
              key={q}
              variant="outline"
              className="cursor-pointer select-none hover:bg-muted hover:text-accent-foreground"
              onClick={() => handleBubbleClick(q)}
            >
              {q}
            </Badge>
          ))}
        </div>
      )}
    </>
  );
}
