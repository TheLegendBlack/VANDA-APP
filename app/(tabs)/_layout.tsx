// app/(tabs)/_layout.tsx

import React from 'react';
import { Tabs } from 'expo-router';
import { BottomTabBar } from '../../src/components/navigation/BottomTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Rechercher',
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Réserver',
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoris',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
        }}
      />
    </Tabs>
  );
}
