// src/screens/LoginScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Ellipse, Circle, Rect } from 'react-native-svg';
import { useRouter } from 'expo-router';

import { Background } from '../components/common/Background';
import { VandaLogo } from '../components/icons/VandaLogo';
import { AdinkraHome, AdinkraProfile } from '../components/icons/AdinkraIcons';
import { ShimmerEffect } from '../components/effects/ShimmerEffect';
import { COLORS } from '../constants/colors';
import { SPACING, FONT_SIZES } from '../constants/styles';
import { useAuth } from '../context/AuthContext';

// Icône Facebook
const FacebookIcon: React.FC<{ size?: number; color: string }> = ({
  size = 24,
  color,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </Svg>
);

// Icône Apple
const AppleIcon: React.FC<{ size?: number; color: string }> = ({
  size = 24,
  color,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </Svg>
);

// Illustration Baobab (sans <animate>, non supporté par react-native-svg)
const BaobabIllustration: React.FC = () => (
  <View style={styles.illustrationContainer}>
    <LinearGradient
      colors={['#fb923c', '#f59e0b', '#fb923c']}
      style={styles.illustrationGradient}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 400 200"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Soleil */}
        <Circle cx="200" cy="40" r="40" fill="#fef08a" opacity={0.9} />
        <Circle cx="200" cy="40" r="40" fill="#fde047" opacity={0.3} />

        {/* Montagnes */}
        <Path
          d="M0,200 L0,120 L100,60 L200,140 L300,80 L400,160 L400,200 Z"
          fill="rgba(139, 69, 19, 0.3)"
        />
        <Path
          d="M0,200 L0,150 L80,100 L160,160 L240,120 L320,170 L400,140 L400,200 Z"
          fill="rgba(160, 82, 45, 0.5)"
        />

        {/* Baobab central */}
        <Path
          d="M140,200 L140,160 Q140,150 150,148 L200,148 Q210,150 210,160 L210,200 Z"
          fill="#6B4423"
        />
        <Ellipse cx="180" cy="150" rx="24" ry="16" fill="#8B5A3C" />

        {/* Couronne du baobab */}
        <Ellipse cx="180" cy="100" rx="140" ry="70" fill="#2D5016" opacity={0.9} />
        <Ellipse cx="120" cy="110" rx="80" ry="50" fill="#3A6B1F" opacity={0.8} />
        <Ellipse cx="240" cy="110" rx="80" ry="50" fill="#3A6B1F" opacity={0.8} />
        <Ellipse cx="180" cy="80" rx="100" ry="40" fill="#4A7C2F" opacity={0.9} />

        {/* Huttes gauche */}
        <Path d="M20,200 L20,160 L60,120 L100,160 L100,200 Z" fill="#8B4513" />
        <Circle cx="60" cy="130" r="36" fill="#D2691E" />
        <Rect x="44" y="180" width={32} height={20} fill="#654321" />

        {/* Huttes droite */}
        <Path d="M300,200 L300,160 L340,120 L380,160 L380,200 Z" fill="#8B4513" />
        <Circle cx="340" cy="130" r="36" fill="#D2691E" />
        <Rect x="324" y="180" width={32} height={20} fill="#654321" />
      </Svg>
    </LinearGradient>
  </View>
);

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const { login, authLoading } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!phoneNumber || !password) {
      setError('Veuillez saisir votre numéro de téléphone et votre mot de passe.');
      return;
    }

    setError(null);
    try {
      await login(phoneNumber, password);
      // Une fois connecté, on redirige vers les tabs
      router.replace('/(tabs)');
    } catch (e: any) {
      console.error('Login error', e);
      setError(e?.message ?? "Impossible de se connecter.");
    }
  };

  const isButtonDisabled = authLoading || !phoneNumber || !password;

  return (
    <Background showParticles={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header avec logo */}
          <View style={styles.header}>
            <VandaLogo size={80} />
            <Text style={styles.title}>KONGOBNB</Text>
          </View>

          {/* Contenu principal */}
          <View style={styles.content}>
            <Text style={styles.pageTitle}>Se connecter</Text>

            {/* Message d'erreur éventuel */}
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Illustration du baobab */}
            <BaobabIllustration />

            {/* Formulaire */}
            <View style={styles.form}>
              {/* Numéro de téléphone */}
              <View style={styles.inputGroup}>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color="#9ca3af"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Numéro de téléphone"
                    placeholderTextColor="#9ca3af"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    style={styles.input}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Mot de passe */}
              <View style={styles.inputGroup}>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#9ca3af"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Mot de passe"
                    placeholderTextColor="#9ca3af"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={COLORS.text.amber.DEFAULT}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Mot de passe oublié */}
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>
                  Mot de passe oublié ?
                </Text>
              </TouchableOpacity>

              {/* Se souvenir */}
              <TouchableOpacity
                style={styles.rememberContainer}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberMe && styles.checkboxChecked,
                  ]}
                >
                  {rememberMe && (
                    <Ionicons name="checkmark" size={16} color="#78350f" />
                  )}
                </View>
                <Text style={styles.rememberText}>
                  Se souvenir de mon compte ? S&apos;inscrire
                </Text>
              </TouchableOpacity>

              {/* Bouton de connexion */}
              <TouchableOpacity
                onPress={handleLogin}
                activeOpacity={0.8}
                style={[
                  styles.loginButtonContainer,
                  isButtonDisabled && { opacity: 0.6 },
                ]}
                disabled={isButtonDisabled}
              >
                <LinearGradient
                  colors={['#eab308', '#f59e0b', '#fb923c']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginButton}
                >
                  {authLoading ? (
                    <ActivityIndicator color="#78350f" />
                  ) : (
                    <Text style={styles.loginButtonText}>Se connecter</Text>
                  )}
                  <ShimmerEffect />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Séparateur */}
            <View style={styles.separator}>
              <View style={styles.separatorLine} />
            </View>

            {/* Connexion sociale */}
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <AdinkraHome size={24} color={COLORS.text.amber.DEFAULT} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton}>
                <AppleIcon size={24} color={COLORS.text.amber.DEFAULT} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton}>
                <FacebookIcon size={24} color={COLORS.text.amber.DEFAULT} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton}>
                <AdinkraProfile size={24} color={COLORS.text.amber.DEFAULT} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Background>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text.amber.light,
    marginTop: SPACING.md,
  },
  content: {
    paddingHorizontal: SPACING.xl,
  },
  pageTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  illustrationContainer: {
    height: 192,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
    borderWidth: 4,
    borderColor: 'rgba(217, 119, 6, 0.3)',
  },
  illustrationGradient: {
    flex: 1,
  },
  form: {
    marginBottom: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(217, 119, 6, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  inputIcon: {
    marginRight: SPACING.md,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: '#1f2937',
  },
  eyeIcon: {
    padding: SPACING.xs,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
  },
  forgotPasswordText: {
    color: COLORS.text.amber.DEFAULT,
    fontSize: FONT_SIZES.sm,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(217, 119, 6, 0.3)',
    backgroundColor: 'rgba(127, 29, 29, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  checkboxChecked: {
    backgroundColor: '#f59e0b',
    borderColor: '#fbbf24',
  },
  rememberText: {
    color: COLORS.text.amber.DEFAULT,
    fontSize: FONT_SIZES.sm,
    flex: 1,
  },
  loginButtonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: SPACING.md,
  },
  loginButton: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#78350f',
    zIndex: 10,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border.amber,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(120, 53, 15, 0.5)',
    borderWidth: 2,
    borderColor: 'rgba(217, 119, 6, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#ef4444',
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  errorText: {
    color: '#fecaca',
    fontSize: FONT_SIZES.sm,
  },
});


