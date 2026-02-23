// src/api/booking.ts
import { API_BASE_URL } from './config';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed';

export type RentalType = 'short_term' | 'long_term';

export type Booking = {
  id: string;
  propertyId: string;
  guestId: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  rentalType: RentalType;
  totalAmount: number;
  status: BookingStatus;
  specialRequests?: string | null;
  createdAt: string;
  updatedAt: string;
  paymentStatus?: string | null;
  holdExpiresAt?: string | null;
};

export type BookingProperty = {
  id: string;
  title: string;
  address: string | null;
  city: string | null;
  accessInstructions?: string | null;
};

export type BookingWithProperty = Booking & {
  property: BookingProperty | null;
  phase?: 'in_progress' | 'upcoming' | null;
};

export type CreateBookingPayload = {
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  rentalType?: RentalType;
  specialRequests?: string | null;
};

export async function createBooking(
  token: string,
  payload: CreateBookingPayload
): Promise<Booking> {
  const res = await fetch(`${API_BASE_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // pas de JSON exploitable
  }

  if (!res.ok) {
    const message =
      data?.error ??
      (res.status === 409
        ? 'Ce créneau est déjà réservé.'
        : 'Impossible d\'enregistrer la réservation.');
    throw new Error(message);
  }

  return data.booking as Booking;
}

/**
 * Réservations du locataire connecté (guest)
 * GET /bookings
 */
export async function listMyBookings(
  token: string
): Promise<BookingWithProperty[]> {
  const res = await fetch(`${API_BASE_URL}/bookings`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Impossible de charger vos réservations.');
  }

  return res.json();
}
