// src/api/favorites.ts
import { API_BASE_URL } from './config';
import * as SecureStore from 'expo-secure-store';

// ===== Types =====
export interface FavoriteCheckResponse {
  propertyId: string;
  isFavorite: boolean;
  favoritedAt: string | null;
}

export interface FavoriteToggleResponse {
  message: string;
  propertyId: string;
}

export interface FavoriteListItem {
  favoritedAt: string;
  property: any; // PropertySummary enrichi côté backend
}

export interface FavoriteListResponse {
  total: number;
  count: number;
  limit: number;
  offset: number;
  items: FavoriteListItem[];
}

// ===== Helpers =====
async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await SecureStore.getItemAsync('token');
  if (!token) throw new Error('Non authentifié');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

// ===== API =====

/**
 * POST /favorites/:propertyId
 * Ajoute un logement en favoris (idempotent)
 */
export async function addFavorite(
  propertyId: string
): Promise<FavoriteToggleResponse> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/favorites/${propertyId}`, {
    method: 'POST',
    headers,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erreur ${res.status}`);
  }
  return res.json();
}

/**
 * DELETE /favorites/:propertyId
 * Retire un logement des favoris (idempotent)
 */
export async function removeFavorite(
  propertyId: string
): Promise<FavoriteToggleResponse> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/favorites/${propertyId}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erreur ${res.status}`);
  }
  return res.json();
}

/**
 * GET /favorites
 * Liste mes favoris (paginé)
 */
export async function listFavorites(
  params?: { limit?: number; offset?: number }
): Promise<FavoriteListResponse> {
  const headers = await getAuthHeaders();
  const url = new URL(`${API_BASE_URL}/favorites`);
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
 * GET /favorites/:propertyId
 * Savoir si un logement est dans mes favoris
 */
export async function checkFavorite(
  propertyId: string
): Promise<FavoriteCheckResponse> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/favorites/${propertyId}`, {
    headers,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erreur ${res.status}`);
  }
  return res.json();
}
