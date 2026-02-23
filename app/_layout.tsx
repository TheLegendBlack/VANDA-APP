// app/_layout.tsx

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { COLORS } from '../src/constants/colors';

const RootContent: React.FC = () => {
  const { initializing } = useAuth();

  if (initializing) {
    // Écran de chargement le temps de lire SecureStore + /users/me
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.gold.DEFAULT} />
      </View>
    );
  }

  // Ton Stack habituel d'expo-router
  return <Stack screenOptions={{ headerShown: false }} />;
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AuthProvider>
          <RootContent />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background.start,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

