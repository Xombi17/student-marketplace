import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Listing } from '../types';
import ListingCard from './ListingCard';

interface FeaturedListingsProps {
  listings: Listing[];
}

export default function FeaturedListings({ listings }: FeaturedListingsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((current) => 
      current + 3 >= listings.length ? 0 : current + 3
    );
  };

  const prev = () => {
    setCurrentIndex((current) => 
      current - 3 < 0 ? Math.max(listings.length - 3, 0) : current - 3
    );
  };

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Featured Items</h2>
        <div className="flex gap-2">
          <button
            onClick={prev}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {listings.slice(currentIndex, currentIndex + 3).map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}