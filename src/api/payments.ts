// src/api/payments.ts

import { API_BASE_URL } from './config';

export type PaymentStatus =
  | 'pending'
  | 'success'
  | 'failed'
  | 'expired'
  | 'cancelled';

export type Payment = {
  id: string;
  bookingId: string;
  provider: string;
  amount: number;
  currency: string;
  externalId: string;
  payerMsisdn: string;
  reason: string | null;
  status: PaymentStatus;
  providerRef: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatePaymentPayload = {
  bookingId: string;
  payerMsisdn: string;
  provider?: string;
  reason?: string | null;
};

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

export async function createPayment(
  token: string,
  payload: CreatePaymentPayload
): Promise<Payment> {
  const res = await fetch(`${API_BASE_URL}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await handleJsonResponse<{ message: string; data: Payment }>(res);
  return json.data;
}

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
