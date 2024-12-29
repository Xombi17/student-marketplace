import { supabase } from './supabase';
import type { Listing, Profile, Bid, Message } from '../types';

export async function getListings(category?: string) {
  const query = supabase
    .from('listings')
    .select(`
      *,
      seller:profiles(*),
      images(*),
      bids(*)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (category) {
    query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Listing[];
}

export async function getListing(id: string) {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      seller:profiles(*),
      images(*),
      bids(*, bidder:profiles(*))
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Listing;
}

export async function createListing(listing: Partial<Listing>, images: File[]) {
  const { data: listingData, error: listingError } = await supabase
    .from('listings')
    .insert([listing])
    .select()
    .single();

  if (listingError) throw listingError;

  const imageUploads = images.map(async (image) => {
    const fileName = `${listingData.id}/${Math.random().toString(36).slice(2)}`;
    const { error: uploadError, data } = await supabase.storage
      .from('listings')
      .upload(fileName, image);

    if (uploadError) throw uploadError;

    const { data: imageData, error: imageError } = await supabase
      .from('images')
      .insert([{
        listing_id: listingData.id,
        url: data.path
      }]);

    if (imageError) throw imageError;
    return imageData;
  });

  await Promise.all(imageUploads);
  return listingData;
}

export async function createBid(bid: Partial<Bid>) {
  const { data, error } = await supabase
    .from('bids')
    .insert([bid])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMessages(listingId: string, userId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles(*),
      receiver:profiles(*)
    `)
    .eq('listing_id', listingId)
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Message[];
}

export async function sendMessage(message: Partial<Message>) {
  const { data, error } = await supabase
    .from('messages')
    .insert([message])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserListings(userId: string) {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      images(*),
      bids(*)
    `)
    .eq('seller_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Listing[];
}

export async function getUserBids(userId: string) {
  const { data, error } = await supabase
    .from('bids')
    .select(`
      *,
      listing:listings(*)
    `)
    .eq('bidder_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Bid[];
}