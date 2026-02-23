// src/api/reviews.ts
import { API_BASE_URL } from './config';

export type PropertyReview = {
  id: string;
  overallRating: number | null;
  cleanlinessRating: number | null;
  communicationRating: number | null;
  locationRating: number | null;
  accuracyRating: number | null;
  valueRating: number | null;
  comment: string | null;
  createdAt: string;
  reviewer:
    | {
        id: string;
        firstName: string | null;
        lastName: string | null;
        avatarUrl: string | null;
      }
    | null;
};

export type PropertyReviewsResult = {
  total: number;
  count: number;
  items: PropertyReview[];
};

export type PropertyRatings = {
  count: number;
  averages: {
    overall: number | null;
    cleanliness: number | null;
    communication: number | null;
    location: number | null;
    accuracy: number | null;
    value: number | null;
  };
};

export type ReviewsQuery = {
  limit?: number;
  offset?: number;
};

/**
 * GET /reviews/properties/:propertyId/reviews
 *
 * Formes supportées :
 *   - getPropertyReviews(id)
 *   - getPropertyReviews(id, 10)
 *   - getPropertyReviews(id, 10, 20)
 *   - getPropertyReviews(id, { limit: 10, offset: 20 })
 */

// Overload 1 : aucun paramètre → backend applique ses valeurs par défaut
export async function getPropertyReviews(
  propertyId: string
): Promise<PropertyReviewsResult>;

// Overload 2 : limit, offset (comme avant)
export async function getPropertyReviews(
  propertyId: string,
  limit: number,
  offset?: number
): Promise<PropertyReviewsResult>;

// Overload 3 : objet { limit, offset }
export async function getPropertyReviews(
  propertyId: string,
  params: ReviewsQuery
): Promise<PropertyReviewsResult>;

// Implémentation
export async function getPropertyReviews(
  propertyId: string,
  arg2?: number | ReviewsQuery,
  arg3?: number
): Promise<PropertyReviewsResult> {
  let limit: number | undefined;
  let offset: number | undefined;

  if (arg2 === undefined) {
    // getPropertyReviews(id)
    limit = undefined;
    offset = undefined;
  } else if (typeof arg2 === 'number') {
    // getPropertyReviews(id, limit, offset?)
    limit = arg2;
    offset = arg3;
  } else {
    // getPropertyReviews(id, { limit, offset })
    limit = arg2.limit;
    offset = arg2.offset;
  }

  const params = new URLSearchParams();
  if (limit != null) params.set('limit', String(limit));
  if (offset != null) params.set('offset', String(offset));

  const query = params.toString();
  const url = query
    ? `${API_BASE_URL}/reviews/properties/${propertyId}/reviews?${query}`
    : `${API_BASE_URL}/reviews/properties/${propertyId}/reviews`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('Impossible de charger les avis.');
  }

  return res.json();
}

/**
 * GET /reviews/properties/:propertyId/ratings
 */
export async function getPropertyRatings(
  propertyId: string
): Promise<PropertyRatings> {
  const res = await fetch(
    `${API_BASE_URL}/reviews/properties/${propertyId}/ratings`
  );

  if (!res.ok) {
    throw new Error('Impossible de charger les notes de ce bien.');
  }

  return res.json();
}

