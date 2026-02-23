// src/api/payments.ts

import { API_BASE_URL } from './config';

/**
 * Statuts possibles côté backend.
 * Dans ton code tu utilises surtout "pending" | "success" | "failed",
 * mais on laisse ouvert à d'autres valeurs éventuelles.
 */
export type PaymentStatus =
  | 'pending'
  | 'success'
  | 'failed'
  | 'expired'
  | 'cancelled';

/**
 * Shape d’un paiement tel que renvoyé par ton backend.
 * (Adapté à ton modèle Prisma / routes payments.js)
 */
export type Payment = {
  id: string;
  bookingId: string;
  provider: string;        // ex: "mtn_momo", "airtel_momo"
  amount: number;          // en XAF
  currency: string;        // "XAF"
  externalId: string;      // Idempotency key / reference app
  payerMsisdn: string;     // numéro formaté
  reason: string | null;   // "Booking xxx" etc.
  status: PaymentStatus;   // "pending" | "success" | "failed"...
  providerRef: string | null; // Référence MTN / Airtel (X-Reference-Id)
  createdAt: string;
  updatedAt: string;
};

/**
 * Payload attendu par POST /payments
 * (voir routes/payments.js)
 */
export type CreatePaymentPayload = {
  bookingId: string;
  payerMsisdn: string;         // juste les chiffres côté front, le back nettoie aussi
  provider?: string;           // "mtn_momo" | "airtel_momo" ...
  reason?: string | null;
};

/* =========================
   Helper de réponse JSON
========================= */

async function handleJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: any = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = {};
    }
  }

  if (!res.ok) {
    const message =
      data?.error ||
      data?.message ||
      `Erreur serveur (${res.status})`;

    const err = new Error(message) as Error & {
      status?: number;
      details?: any;
    };
    err.status = res.status;
    err.details = data;
    throw err;
  }

  return data as T;
}

/* =========================
   POST /payments
   -> createPayment
========================= */

export async function createPayment(
  token: string,
  payload: CreatePaymentPayload
): Promise<Payment> {
  const res = await fetch(`${API_BASE_URL}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 🔐 JWT de ton AuthContext
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  // Ton backend répond: { message: 'Paiement MTN initié.', data: payment }
  const json = await handleJsonResponse<{ message: string; data: Payment }>(res);
  return json.data;
}

/* =========================
   GET /payments/:id
   -> getPaymentById
========================= */

export async function getPaymentById(
  token: string,
  id: string
): Promise<Payment> {
  const res = await fetch(`${API_BASE_URL}/payments/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleJsonResponse<Payment>(res);
}
