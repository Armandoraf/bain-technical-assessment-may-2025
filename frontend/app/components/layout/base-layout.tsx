import { Link } from 'react-router';
import { SearchBar } from '../ui/search-bar';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Key } from 'lucide-react';
import { useState } from 'react';
import { SearchStatusProvider } from '~/contexts/search-status-context';

export default function BaseLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [apiKey, setApiKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('openai-api-key') ?? '';
    }
    return '';
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('openai-api-key', apiKey);
    }
  }

  return (
    <div className="flex flex-col w-screen outline px-8 py-6 md:gap-y-12 min-h-screen">
      <div className="flex items-center justify-between">
        <Link to="/">
          <h1 className="text-xl font-light text-slate-700 underline underline-offset-4">
            Munch.
          </h1>
        </Link>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <Key className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80">
            <form onSubmit={handleSubmit} className="flex flex-col gap-y-3">
              <div>
                <h3 className="text-sm font-medium mb-1">
                  Enter your OpenAI API key
                </h3>
                <p className="text-xs text-muted-foreground">
                  Your key is stored locally and never leaves your browser.
                </p>
              </div>
              <Input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-..."
              />
              <Button type="submit" className="w-full">
                Save
              </Button>
            </form>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col md:items-center gap-y-8 mt-8">
        <h2 className="md:text-lg font-light">
          Partner-worthy restaurant recommendations.
        </h2>
        <SearchStatusProvider>
          <SearchBar />
          {children}
        </SearchStatusProvider>
      </div>
    </div>
  );
}
