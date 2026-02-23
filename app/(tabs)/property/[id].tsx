// app/(tabs)/property/[id].tsx
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import PropertyDetailsScreen from '../../../src/screens/PropertyDetailsScreen';

export default function PropertyDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) return null;

  return <PropertyDetailsScreen propertyId={id} />;
}