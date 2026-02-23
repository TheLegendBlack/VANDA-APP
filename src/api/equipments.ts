// src/api/equipments.ts
import { API_BASE_URL } from './config';

// ===== Types =====
export interface Equipment {
  id: string;
  name: string;
  category: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListEquipmentsParams {
  category?: string;
  q?: string;
  active?: boolean;
}

// ===== API =====

/**
 * GET /equipments
 * Liste les équipements (public, pas besoin de token)
 */
export async function listEquipments(
  params?: ListEquipmentsParams
): Promise<Equipment[]> {
  const url = new URL(`${API_BASE_URL}/equipments`);

  if (params?.category) url.searchParams.set('category', params.category);
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
