import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { getUserListings, getUserBids } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { Listing, Bid } from '../types';
import ListingCard from '../components/ListingCard';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'bids'>('listings');

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function loadData() {
    try {
      setLoading(true);
      const [listingsData, bidsData] = await Promise.all([
        getUserListings(user!.id),
        getUserBids(user!.id),
      ]);
      setListings(listingsData);
      setBids(bidsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  if (!user) return <div className="text-center py-12">Please log in to view your dashboard</div>;
  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'listings'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          My Listings
        </button>
        <button
          onClick={() => setActiveTab('bids')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'bids'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          My Bids
        </button>
      </div>

      {activeTab === 'listings' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
          {listings.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              You haven't created any listings yet
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => (
            <div
              key={bid.id}
              className="bg-white rounded-lg shadow-md p-6 flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Bid on: {bid.listing?.title}
                </h3>
                <p className="text-indigo-600 font-medium">${bid.amount}</p>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  bid.status === 'accepted'
                    ? 'bg-green-100 text-green-800'
                    : bid.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {bid.status}
              </span>
            </div>
          ))}
          {bids.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              You haven't placed any bids yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}