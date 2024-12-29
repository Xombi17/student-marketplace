import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { getListing, createBid, sendMessage } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { Listing, Bid } from '../types';
import toast from 'react-hot-toast';

export default function ListingDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadListing();
  }, [id]);

  async function loadListing() {
    try {
      setLoading(true);
      const data = await getListing(id!);
      setListing(data);
    } catch (error) {
      console.error('Error loading listing:', error);
      toast.error('Failed to load listing');
    } finally {
      setLoading(false);
    }
  }

  async function handleBid(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !listing) return;

    try {
      const amount = parseFloat(bidAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid bid amount');
        return;
      }

      await createBid({
        listing_id: listing.id,
        bidder_id: user.id,
        amount,
      });

      toast.success('Bid placed successfully');
      setBidAmount('');
      loadListing();
    } catch (error) {
      console.error('Error placing bid:', error);
      toast.error('Failed to place bid');
    }
  }

  async function handleMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !listing) return;

    try {
      await sendMessage({
        listing_id: listing.id,
        sender_id: user.id,
        receiver_id: listing.seller_id,
        content: message,
      });

      toast.success('Message sent successfully');
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  }

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!listing) return <div className="text-center py-12">Listing not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {listing.images && listing.images.length > 0 ? (
              <img
                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/listings/${listing.images[0].url}`}
                alt={listing.title}
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{listing.title}</h1>
          <p className="text-gray-600 mb-4">{listing.description}</p>
          
          <div className="flex justify-between items-center mb-6">
            <span className="text-2xl font-bold text-indigo-600">${listing.price}</span>
            <span className="text-gray-500">
              Listed {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
            </span>
          </div>

          {user && user.id !== listing.seller_id && (
            <div className="space-y-6">
              <form onSubmit={handleBid} className="space-y-4">
                <div>
                  <label htmlFor="bid" className="block text-sm font-medium text-gray-700">
                    Place a Bid
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      id="bid"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Place Bid
                </button>
              </form>

              <form onSubmit={handleMessage} className="space-y-4">
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message Seller
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your message"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-white text-indigo-600 py-2 px-4 border border-indigo-600 rounded-md hover:bg-indigo-50 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Send Message
                </button>
              </form>
            </div>
          )}

          {listing.bids && listing.bids.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Bids</h2>
              <div className="space-y-4">
                {listing.bids.map((bid: Bid) => (
                  <div key={bid.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                    <span className="font-medium">${bid.amount}</span>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}