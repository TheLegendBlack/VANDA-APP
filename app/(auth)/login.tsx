// app/(auth)/login.tsx

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

import LoginScreen from '../../src/screens/LoginScreen';

const AUTH_TOKEN_KEY = 'vanda_auth_token';

export default function LoginRoute() {
  const router = useRouter();
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkToken = async () => {
      try {
        const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
        if (token && isMounted) {
          // Si un token existe déjà, on part directement sur les tabs
          router.replace('/(tabs)');
          return;
        }
      } catch (e) {
        console.warn('Erreur lors de la lecture du token', e);
      } finally {
        if (isMounted) {
          setCheckingToken(false);
        }
      }
    };

    checkToken();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (checkingToken) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return <LoginScreen />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000', // ou tes couleurs
    alignItems: 'center',
    justifyContent: 'center',
  },
});

