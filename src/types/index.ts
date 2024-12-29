export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  student_id: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  status: 'pending' | 'active' | 'sold' | 'rejected';
  seller_id: string;
  created_at: string;
  seller?: Profile;
  images?: Image[];
  bids?: Bid[];
}

export interface Image {
  id: string;
  listing_id: string;
  url: string;
  created_at: string;
}

export interface Bid {
  id: string;
  listing_id: string;
  bidder_id: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  bidder?: Profile;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  listing_id: string;
  content: string;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
}