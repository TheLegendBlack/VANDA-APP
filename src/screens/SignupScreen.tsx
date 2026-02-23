// src/screens/SignupScreen.tsx

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
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

import { Background } from '../components/common/Background';
import { VandaLogo } from '../components/icons/VandaLogo';
import { AdinkraHome, AdinkraProfile } from '../components/icons/AdinkraIcons';
import { ShimmerEffect } from '../components/effects/ShimmerEffect';
import { COLORS } from '../constants/colors';
import { SPACING, FONT_SIZES } from '../constants/styles';
import { registerApi, loginApi, fetchMe } from '../api/auth';

const AUTH_TOKEN_KEY = 'vanda_auth_token';

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

type SignupFormData = {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

const SignupScreen: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!acceptTerms) {
      return;
    }

    // petite validation de base
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.password) {
      setError('Merci de remplir tous les champs obligatoires.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // 1) Appel API inscription
      await registerApi({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phone,
        password: formData.password,
      });

      // 2) Auto-login pour récupérer un token
      const loginRes = await loginApi(formData.phone, formData.password);

      // 3) Stockage sécurisé du token
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, loginRes.token);

      // 4) (optionnel) Précharger le profil
      try {
        const me = await fetchMe(loginRes.token);
        console.log('Nouvel utilisateur inscrit :', me.firstName, me.lastName);
      } catch (e) {
        console.warn("Impossible de charger le profil après l'inscription", e);
      }

      // 5) Redirection vers les tabs
      router.replace('/(tabs)');
    } catch (e: any) {
      console.error('Signup error', e);
      setError(e?.message ?? "Impossible de créer le compte.");
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled =
    loading ||
    !acceptTerms ||
    !formData.firstName ||
    !formData.lastName ||
    !formData.phone ||
    !formData.password ||
    !formData.confirmPassword;

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
            <Text style={styles.pageTitle}>Créer un compte</Text>
            <Text style={styles.subtitle}>
              Rejoignez VANDA et découvrez l&apos;Afrique
            </Text>

            {/* Message d'erreur éventuel */}
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Formulaire */}
            <View style={styles.form}>
              {/* Prénom */}
              <View style={styles.inputGroup}>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#9ca3af"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Prénom"
                    placeholderTextColor="#9ca3af"
                    value={formData.firstName}
                    onChangeText={(text) =>
                      setFormData({ ...formData, firstName: text })
                    }
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Nom */}
              <View style={styles.inputGroup}>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#9ca3af"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Nom"
                    placeholderTextColor="#9ca3af"
                    value={formData.lastName}
                    onChangeText={(text) =>
                      setFormData({ ...formData, lastName: text })
                    }
                    style={styles.input}
                  />
                </View>
              </View>

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
                    value={formData.phone}
                    onChangeText={(text) =>
                      setFormData({ ...formData, phone: text })
                    }
                    keyboardType="phone-pad"
                    style={styles.input}
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
                    value={formData.password}
                    onChangeText={(text) =>
                      setFormData({ ...formData, password: text })
                    }
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

              {/* Confirmer mot de passe */}
              <View style={styles.inputGroup}>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#9ca3af"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Confirmer le mot de passe"
                    placeholderTextColor="#9ca3af"
                    value={formData.confirmPassword}
                    onChangeText={(text) =>
                      setFormData({ ...formData, confirmPassword: text })
                    }
                    secureTextEntry={!showConfirmPassword}
                    style={styles.input}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? 'eye-off-outline' : 'eye-outline'
                      }
                      size={20}
                      color={COLORS.text.amber.DEFAULT}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Accepter les conditions */}
              <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => setAcceptTerms(!acceptTerms)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    acceptTerms && styles.checkboxChecked,
                  ]}
                >
                  {acceptTerms && (
                    <Ionicons name="checkmark" size={16} color="#78350f" />
                  )}
                </View>
                <Text style={styles.termsText}>
                  J&apos;accepte les{' '}
                  <Text style={styles.termsLink}>
                    conditions d&apos;utilisation
                  </Text>
                  {' '}et la{' '}
                  <Text style={styles.termsLink}>
                    politique de confidentialité
                  </Text>
                </Text>
              </TouchableOpacity>

              {/* Bouton d'inscription */}
              <TouchableOpacity
                onPress={handleSignup}
                disabled={isButtonDisabled}
                activeOpacity={0.8}
                style={[
                  styles.signupButtonContainer,
                  isButtonDisabled && styles.signupButtonDisabled,
                ]}
              >
                <LinearGradient
                  colors={
                    !isButtonDisabled
                      ? ['#eab308', '#f59e0b', '#fb923c']
                      : ['#9ca3af', '#9ca3af', '#9ca3af']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.signupButton}
                >
                  {loading ? (
                    <ActivityIndicator color="#78350f" />
                  ) : (
                    <Text style={styles.signupButtonText}>
                      Créer mon compte
                    </Text>
                  )}
                  {!isButtonDisabled && !loading && <ShimmerEffect />}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Séparateur */}
            <View style={styles.separator}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>ou</Text>
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

            {/* Lien vers connexion */}
            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginLinkText}>
                Vous avez déjà un compte ?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={styles.loginLink}>Se connecter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Background>
  );
};

export default SignupScreen;

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
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.amber.DEFAULT,
    textAlign: 'center',
    marginBottom: SPACING.xl,
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#f59e0b',
    borderColor: '#fbbf24',
  },
  termsText: {
    color: COLORS.text.amber.DEFAULT,
    fontSize: FONT_SIZES.sm,
    flex: 1,
    lineHeight: 20,
  },
  termsLink: {
    color: COLORS.text.amber.DEFAULT,
    fontWeight: '600',
  },
  signupButtonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: SPACING.md,
  },
  signupButtonDisabled: {
    opacity: 0.5,
  },
  signupButton: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupButtonText: {
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
  separatorText: {
    color: COLORS.text.amber.DEFAULT,
    fontSize: FONT_SIZES.sm,
    paddingHorizontal: SPACING.lg,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
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
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLinkText: {
    color: COLORS.text.amber.DEFAULT,
    fontSize: FONT_SIZES.md,
  },
  loginLink: {
    color: COLORS.text.amber.DEFAULT,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
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

