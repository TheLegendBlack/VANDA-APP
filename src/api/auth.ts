// src/api/auth.ts
import { API_BASE_URL } from './config';

export type LoginResponse = {
  message: string;
  token: string;
};

export type MeResponse = {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string | null;
  verified: boolean;
  mtnPayoutMsisdn: string | null;
  airtelPayoutMsisdn: string | null;
  roles: string[];
  documents: unknown[];
};

// ✅ ce que renvoie ton backend sur /auth/register
export type RegisterResponse = {
  message: string;
  user: {
    id: number;
    phoneNumber: string;
  };
};

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
};

export async function registerApi(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // pas de JSON
  }

  if (!res.ok) {
    const msg =
      data?.error ??
      (res.status === 409
        ? 'Numéro déjà enregistré.'
        : 'Impossible de créer le compte.');
    throw new Error(msg);
  }

  return data as RegisterResponse;
}

export async function loginApi(
  phoneNumber: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phoneNumber, password }),
  });

  if (!res.ok) {
    let msg = 'Impossible de se connecter.';
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  return res.json();
}

export async function fetchMe(token: string): Promise<MeResponse> {
  const res = await fetch(`${API_BASE_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Impossible de récupérer le profil utilisateur.');
  }

  return res.json();
}
