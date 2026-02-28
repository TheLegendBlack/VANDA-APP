// src/api/properties.ts
import { API_BASE_URL } from './config';
import * as SecureStore from 'expo-secure-store';

// ===== Types =====

export interface PropertyPhoto {
  id: string;
  isCover: boolean;
  caption: string | null;
  altText: string | null;
  focusX: number | null;
  focusY: number | null;
  sortOrder: number;
  fileId?: string;
  mimeType?: string;
  url: string | null;
}

export interface NeighborhoodInfo {
  id: string;
  name: string;
  slug: string;
  city: string;
}

export interface HostInfo {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  experience?: string | null;
  responseRate?: number | null;
  responseTime?: string | null;
  languages?: string[] | null;
  about?: string | null;
  listings?: Array<{
    id: string;
    title: string;
    image?: string | null;
    rating?: number | null;
    reviewsCount?: number;
  }> | null;
}

export interface PropertyRating {
  avg: number | null;
  count: number;
}

export interface EquipmentInfo {
  id: string;
  name: string;
  category: string;
  available?: boolean;
}

// DTO retourné par /properties/search et /properties/home
export interface PropertyCardDto {
  id: string;
  title: string;
  city: string;
  neighborhood: NeighborhoodInfo | null;
  country: string;
  pricePerNight: number | null;
  pricePerMonth: number | null;
  rentalMode: 'short_term' | 'long_term' | 'both';
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  active: boolean;
  createdAt: string;
  host: HostInfo | null;
  rating: PropertyRating;
  bookingsCount: number;
  heroPhoto: PropertyPhoto | null;
  photos: PropertyPhoto[];
  qualityScore?: number;
  isFavorite?: boolean;
  equipments?: EquipmentInfo[];
  featured?: {
    slotId: string;
    type: 'ORGANIC' | 'PAID';
    priority: number;
    startsAt: string | null;
    endsAt: string | null;
  };

  // ✅ flags donnés par /properties/search pour gérer l'UX both (surtout arrivée seule)
  availability?: {
    shortOk: boolean;
    longOk: boolean;
  };
}

// DTO retourné par GET /properties (liste simple)
export interface PropertySummary {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  rentalMode: string;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  pricePerNight: number | null;
  pricePerMonth: number | null;
  address: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  active: boolean;
  createdAt: string;
  host: { firstName: string; lastName: string };
  neighborhood: NeighborhoodInfo | null;
  photos: PropertyPhoto[];
  isFavorite?: boolean;
}

// DTO retourné par GET /properties/:id
export interface PropertyDetail {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  rentalMode: string;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  pricePerNight: number | null;
  pricePerMonth: number | null;
  address: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  active: boolean;
  createdAt: string;
  houseRules: string | null;
  accessInstructions: string | null;
  hostId: string;
  host: HostInfo;
  neighborhood: NeighborhoodInfo | null;
  photos: PropertyPhoto[];
  equipments: EquipmentInfo[];
  isFavorite?: boolean;
  favoritedAt?: string | null;
}

// Availability
export interface AvailabilityDay {
  date: string;
  available: boolean;
  reason: 'booked' | 'blocked' | null;
  priceOverride: number | null;
}

export interface AvailabilityResponse {
  propertyId: string;
  from: string;
  to: string;
  days: AvailabilityDay[];
}

// Search params
export interface SearchPropertiesParams {
  q?: string;
  city?: string;
  neighborhoodId?: string;
  rentalType?: 'short_term' | 'long_term' | 'both';
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  // Option B (both): 2 fourchettes distinctes
  minNightPrice?: number;
  maxNightPrice?: number;
  minMonthPrice?: number;
  maxMonthPrice?: number;
  checkInDate?: string;   // 'YYYY-MM-DD'
  checkOutDate?: string;  // 'YYYY-MM-DD'
  guests?: number;
  bedrooms?: number;
  bathrooms?: number;
  equipmentIds?: string[];
  includeEquipments?: boolean;
  sort?: 'recommended' | 'price_asc' | 'price_desc' | 'recent' | 'rating';
  limit?: number;
  offset?: number;
}

export interface SearchPropertiesResponse {
  total: number;
  count: number;
  sort: string;
  limit: number;
  offset: number;
  items: PropertyCardDto[];
}

// Home sections
export interface HomeSection {
  key: string;
  title: string;
  city: string;
  items: PropertyCardDto[];
}

export interface HomeResponse {
  sections: HomeSection[];
}

// ===== Helpers =====

async function optionalAuthHeaders(): Promise<Record<string, string>> {
  const token = await SecureStore.getItemAsync('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

// ===== API =====

/**
 * GET /properties
 * Liste tous les biens actifs (public)
 */
export async function listProperties(): Promise<PropertySummary[]> {
  const headers = await optionalAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/properties`, { headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erreur ${res.status}`);
  }
  return res.json();
}

/**
 * GET /properties/search
 * Recherche avec filtres + tri + pagination
 */
export async function searchProperties(
  params?: SearchPropertiesParams
): Promise<SearchPropertiesResponse> {
  const headers = await optionalAuthHeaders();
  const url = new URL(`${API_BASE_URL}/properties/search`);

  if (params?.q) url.searchParams.set('q', params.q);
  if (params?.city) url.searchParams.set('city', params.city);
  if (params?.neighborhoodId)
    url.searchParams.set('neighborhoodId', params.neighborhoodId);
  if (params?.rentalType)
    url.searchParams.set('rentalType', params.rentalType);
  if (params?.propertyType)
    url.searchParams.set('propertyType', params.propertyType);
  if (params?.minPrice !== undefined)
    url.searchParams.set('minPrice', String(params.minPrice));
  if (params?.maxPrice !== undefined)
    url.searchParams.set('maxPrice', String(params.maxPrice));
  // Option B (both): ranges séparées nuit/mois
  if (params?.minNightPrice !== undefined)
    url.searchParams.set('minNightPrice', String(params.minNightPrice));
  if (params?.maxNightPrice !== undefined)
    url.searchParams.set('maxNightPrice', String(params.maxNightPrice));
  if (params?.minMonthPrice !== undefined)
    url.searchParams.set('minMonthPrice', String(params.minMonthPrice));
  if (params?.maxMonthPrice !== undefined)
    url.searchParams.set('maxMonthPrice', String(params.maxMonthPrice));
  if (params?.checkInDate) url.searchParams.set('checkInDate', params.checkInDate);
  if (params?.checkOutDate) url.searchParams.set('checkOutDate', params.checkOutDate);  
  if (params?.guests) url.searchParams.set('guests', String(params.guests));
  if (params?.bedrooms)
    url.searchParams.set('bedrooms', String(params.bedrooms));
  if (params?.bathrooms)
    url.searchParams.set('bathrooms', String(params.bathrooms));
  if (params?.equipmentIds && params.equipmentIds.length > 0)
    url.searchParams.set('equipmentIds', params.equipmentIds.join(','));
  if (params?.includeEquipments)
    url.searchParams.set('includeEquipments', 'true');
  if (params?.sort) url.searchParams.set('sort', params.sort);
  if (params?.limit) url.searchParams.set('limit', String(params.limit));
  if (params?.offset) url.searchParams.set('offset', String(params.offset));

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erreur ${res.status}`);
  }
  return res.json();
}

/**
 * GET /properties/home
 * Sections par ville pour la page d'accueil
 */
export async function getHomeProperties(params?: {
  limitPerCity?: number;
  type?: 'PAID' | 'ORGANIC';
}): Promise<HomeResponse> {
  const headers = await optionalAuthHeaders();
  const url = new URL(`${API_BASE_URL}/properties/home`);
  if (params?.limitPerCity)
    url.searchParams.set('limitPerCity', String(params.limitPerCity));
  if (params?.type) url.searchParams.set('type', params.type);

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erreur ${res.status}`);
  }
  return res.json();
}

/**
 * GET /properties/featured
 * Biens mis en avant
 */
export async function getFeaturedProperties(params?: {
  type?: 'PAID' | 'ORGANIC';
  limit?: number;
}): Promise<any[]> {
  const headers = await optionalAuthHeaders();
  const url = new URL(`${API_BASE_URL}/properties/featured`);
  if (params?.type) url.searchParams.set('type', params.type);
  if (params?.limit) url.searchParams.set('limit', String(params.limit));

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erreur ${res.status}`);
  }
  return res.json();
}

/**
 * GET /properties/:id
 * Détail d'un bien
 */
export function getPropertyById(id: string): Promise<PropertyDetail>;
export function getPropertyById(opts: {
  id: string;
}): Promise<PropertyDetail>;
export async function getPropertyById(
  idOrOpts: string | { id: string }
): Promise<PropertyDetail> {
  const id = typeof idOrOpts === 'string' ? idOrOpts : idOrOpts.id;
  const headers = await optionalAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/properties/${id}`, { headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erreur ${res.status}`);
  }
  return res.json();
}

/**
 * GET /properties/:id/availability
 * Disponibilité jour par jour
 */
export function getPropertyAvailability(
  id: string,
  from?: string,
  to?: string
): Promise<AvailabilityResponse>;
export function getPropertyAvailability(opts: {
  id: string;
  from?: string;
  to?: string;
}): Promise<AvailabilityResponse>;
export async function getPropertyAvailability(
  idOrOpts: string | { id: string; from?: string; to?: string },
  fromParam?: string,
  toParam?: string
): Promise<AvailabilityResponse> {
  let id: string;
  let from: string | undefined;
  let to: string | undefined;

  if (typeof idOrOpts === 'string') {
    id = idOrOpts;
    from = fromParam;
    to = toParam;
  } else {
    id = idOrOpts.id;
    from = idOrOpts.from;
    to = idOrOpts.to;
  }

  const url = new URL(`${API_BASE_URL}/properties/${id}/availability`);
  if (from) url.searchParams.set('from', from);
  if (to) url.searchParams.set('to', to);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erreur ${res.status}`);
  }
  return res.json();
}
