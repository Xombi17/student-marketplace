import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import type { Listing } from '../types';

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const mainImage = listing.images?.[0]?.url;
  
  return (
    <Link to={`/listings/${listing.id}`} className="group">
      <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="aspect-w-4 aspect-h-3 relative">
          {mainImage ? (
            <img
              src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/listings/${mainImage}`}
              alt={listing.title}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              listing.category === 'Books' ? 'bg-blue-100 text-blue-800' :
              listing.category === 'Electronics' ? 'bg-purple-100 text-purple-800' :
              listing.category === 'Services' ? 'bg-green-100 text-green-800' :
              'bg-orange-100 text-orange-800'
            }`}>
              {listing.category}
            </span>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{listing.title}</h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{listing.description}</p>
          
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-indigo-600">${listing.price}</span>
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}