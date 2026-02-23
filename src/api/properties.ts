// src/api/properties.ts
import { API_BASE_URL } from './config';

export type PropertySummary = {
  id: string;
  title: string;
  city: string;
  country?: string | null;
  propertyType: string;
  rentalType: 'short_term' | 'long_term';
  maxGuests: number;
  pricePerNight?: number | null;
  pricePerMonth?: number | null;
  host?:
    | {
        firstName: string;
        lastName: string;
      }
    | null;
};

export type PropertyDetail = PropertySummary & {
  description?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  // ✅ on élargit un peu pour supporter string[] côté front
  houseRules?: string | string[] | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  images?: string[] | null;
};

// ---------- LIST & DETAIL ----------

export async function listProperties(): Promise<PropertySummary[]> {
  const res = await fetch(`${API_BASE_URL}/properties`);

  if (!res.ok) {
    throw new Error('Impossible de charger les biens.');
  }

  return res.json();
}

export async function getPropertyById(id: string): Promise<PropertyDetail> {
  const res = await fetch(`${API_BASE_URL}/properties/${id}`);

  if (!res.ok) {
    throw new Error('Impossible de charger ce bien.');
  }

  return res.json();
}

// ---------- AVAILABILITY ----------

export type PropertyAvailabilityDay = {
  date: string; // "YYYY-MM-DD"
  available: boolean;
  reason: 'booked' | 'blocked' | null;
  priceOverride: number | null;
};

export type PropertyAvailabilityResponse = {
  propertyId: string;
  from: string;
  to: string;
  days: PropertyAvailabilityDay[];
};

export type PropertyAvailabilityRange = {
  from: string; // "YYYY-MM-DD"
  to: string;   // "YYYY-MM-DD"
};

/**
 * GET /properties/:id/availability
 *
 * On autorise deux formes d’appel :
 *   1) getPropertyAvailability(id, from?, to?)
 *   2) getPropertyAvailability(id, { from, to })
 */

// Overload 1 : forme historique (from, to en paramètres)
export async function getPropertyAvailability(
  id: string,
  from?: string,
  to?: string
): Promise<PropertyAvailabilityResponse>;

// Overload 2 : forme objet { from, to }
export async function getPropertyAvailability(
  id: string,
  range: PropertyAvailabilityRange
): Promise<PropertyAvailabilityResponse>;

// Implémentation unique pour les deux formes
export async function getPropertyAvailability(
  id: string,
  arg2?: string | PropertyAvailabilityRange,
  arg3?: string
): Promise<PropertyAvailabilityResponse> {
  let from: string | undefined;
  let to: string | undefined;

  if (typeof arg2 === 'object' && arg2 !== null) {
    // cas: getPropertyAvailability(id, { from, to })
    from = arg2.from;
    to = arg2.to;
  } else {
    // cas historique: getPropertyAvailability(id, from?, to?)
    from = arg2;
    to = arg3;
  }

  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);

  const query = params.toString();
  const url = query
    ? `${API_BASE_URL}/properties/${id}/availability?${query}`
    : `${API_BASE_URL}/properties/${id}/availability`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('Impossible de charger les disponibilités.');
  }

  return res.json();
}
