// src/api/neighborhoods.ts
import { API_BASE_URL } from './config';

// ===== Types =====
export interface Neighborhood {
  id: string;
  city: string;
  name: string;
  slug: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListNeighborhoodsParams {
  city?: string;
  q?: string;
  active?: boolean;
}

// ===== API =====

/**
 * GET /neighborhoods
 * Liste les quartiers (public, pas besoin de token)
 */
export async function listNeighborhoods(
  params?: ListNeighborhoodsParams
): Promise<Neighborhood[]> {
  const url = new URL(`${API_BASE_URL}/neighborhoods`);

  if (params?.city) url.searchParams.set('city', params.city);
  if (params?.q) url.searchParams.set('q', params.q);
  if (params?.active !== undefined)
    url.searchParams.set('active', String(params.active));

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erreur ${res.status}`);
  }
  return res.json();
}
