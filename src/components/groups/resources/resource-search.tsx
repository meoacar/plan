'use client';

import { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import ResourceCard from './resource-card';

interface ResourceSearchProps {
  groupId: string;
  groupSlug: string;
  currentUserId: string;
  userRole?: string;
}

export default function ResourceSearch({ 
  groupId, 
  groupSlug, 
  currentUserId,
  userRole 
}: ResourceSearchProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    const searchResources = async () => {
      if (!debouncedQuery || debouncedQuery.trim().length === 0) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/groups/${groupId}/resources/search?q=${encodeURIComponent(debouncedQuery)}`
        );

        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Error searching resources:', error);
      } finally {
        setIsSearching(false);
      }
    };

    searchResources();
  }, [debouncedQuery, groupId]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Kaynaklarda ara..."
          className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
        {isSearching && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2">
            <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
          </div>
        )}
      </div>

      {/* Search Results */}
      {showResults && (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Arama Sonuçları
              <span className="ml-2 text-sm font-normal text-gray-600">
                ({results.length} sonuç)
              </span>
            </h3>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <p className="text-gray-600">
                &quot;{query}&quot; için sonuç bulunamadı.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  groupId={groupId}
                  groupSlug={groupSlug}
                  currentUserId={currentUserId}
                  userRole={userRole}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
