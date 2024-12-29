import { useState, useEffect } from 'react';
import { getListings } from '../lib/api';
import type { Listing } from '../types';
import ListingCard from '../components/ListingCard';
import SearchBar from '../components/SearchBar';
import CategoryCard from '../components/CategoryCard';
import FeaturedListings from '../components/FeaturedListings';
import { Book, Laptop, Wrench, Ticket } from 'lucide-react';

const categories = [
  { name: 'Books', icon: Book, color: 'bg-blue-500' },
  { name: 'Electronics', icon: Laptop, color: 'bg-purple-500' },
  { name: 'Services', icon: Wrench, color: 'bg-green-500' },
  { name: 'Tickets', icon: Ticket, color: 'bg-orange-500' },
];

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadListings();
  }, []);

  async function loadListings(category?: string) {
    try {
      setLoading(true);
      const data = await getListings(category);
      setListings(data);
      setSelectedCategory(category || null);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (query: string, category: string) => {
    loadListings(category);
  };

  const featuredListings = listings.filter(listing => 
    listing.images && listing.images.length > 0
  ).slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Your Campus Marketplace
            </h1>
            <p className="text-xl mb-8 text-indigo-100">
              Buy, sell, and trade with your fellow students
            </p>
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map(({ name, icon: Icon, color }) => (
              <CategoryCard
                key={name}
                title={name}
                Icon={Icon}
                color={color}
                count={listings.filter(l => l.category === name).length}
                onClick={() => loadListings(name)}
              />
            ))}
          </div>
        </div>

        {/* Featured Listings */}
        {featuredListings.length > 0 && (
          <div className="mb-16">
            <FeaturedListings listings={featuredListings} />
          </div>
        )}

        {/* All Listings */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory ? `${selectedCategory} Listings` : 'Recent Listings'}
            </h2>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
              {listings.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No listings found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}