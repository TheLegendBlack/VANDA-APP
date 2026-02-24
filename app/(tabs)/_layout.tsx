// app/(tabs)/_layout.tsx
import React, { useMemo } from 'react';
import { Tabs } from 'expo-router';
import VandaTabBar from '../../src/components/navigation/VandaTabBar';
import { useAuth } from '../../src/context/AuthContext';
import type { MeResponse } from '../../src/api/auth';

type Role = 'guest' | 'host' | 'supervisor' | 'admin' | null;

function normalizeRole(raw: string): string {
  // lower + retire accents (hôte -> hote)
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getPrimaryRole(user: MeResponse | null | undefined): Role {
  const roles = (user?.roles ?? []).map(normalizeRole);
  const set = new Set(roles);

  // priorité du + puissant au + faible
  if (set.has('admin')) return 'admin';
  if (set.has('supervisor') || set.has('superviseur')) return 'supervisor';
  if (set.has('host') || set.has('hote')) return 'host';
  if (set.has('guest') || set.has('invite') || set.has('invited')) return 'guest';

  return null;
}

// ⚠️ Ici on prépare la logique “dynamic tabs” par rôle.
function getTabSetForRole(role: Role) {
  // TODO: plus tard, role === 'host' ou 'supervisor' => autres tabs
  // Pour l’instant, guest par défaut
  return ['index', 'favorites', 'bookings', 'messages', 'profile'] as const;
}

export default function TabsLayout() {
  const { user } = useAuth(); // user devrait être MeResponse | null

  const role = useMemo(() => getPrimaryRole(user), [user]);
  const tabs = useMemo(() => getTabSetForRole(role), [role]);

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <VandaTabBar {...props} />}
    >
      {tabs.includes('index') && (
        <Tabs.Screen name="index" options={{ title: 'Rechercher' }} />
      )}

      {tabs.includes('favorites') && (
        <Tabs.Screen name="favorites" options={{ title: 'Favoris' }} />
      )}

      {tabs.includes('bookings') && (
        <Tabs.Screen name="bookings" options={{ title: 'Réservations' }} />
      )}

      {tabs.includes('messages') && (
        <Tabs.Screen name="messages" options={{ title: 'Messages' }} />
      )}

      {tabs.includes('profile') && (
        <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
      )}
    </Tabs>
  );
}
