// src/screens/PropertyDetailsScreen.tsx
// 100% ISO conversion from VandaPropertyDetails.tsx (web) with full backend integration

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions,
  Animated, StatusBar, Image, Modal, NativeSyntheticEvent, NativeScrollEvent,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, Defs, LinearGradient as SvgLinearGradient, Stop, G, Line } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import {
  getPropertyById, PropertyDetail, PropertyPhoto, EquipmentInfo,
  getPropertyAvailability, AvailabilityDay, AvailabilityResponse,
} from '../api/properties';
import {
  getPropertyRatings, getPropertyReviews, PropertyReview, PropertyRatings,
} from '../api/reviews';
import { createBooking, RentalType } from '../api/booking';
import { createPayment, getPaymentById } from '../api/payments';
import { addFavorite, removeFavorite, checkFavorite } from '../api/favorites';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ===============================
// ICÔNES SVG
// ===============================
interface IconProps { size?: number; color?: string; }

const ArrowLeftIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Line x1="19" y1="12" x2="5" y2="12" /><Path d="M12 19l-7-7 7-7" />
  </Svg>
);

const Share2Icon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Circle cx="18" cy="5" r="3" /><Circle cx="6" cy="12" r="3" /><Circle cx="18" cy="19" r="3" />
    <Line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><Line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </Svg>
);

const HeartIcon: React.FC<IconProps & { filled?: boolean }> = ({ size = 20, color = '#fbbf24', filled = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth={2}>
    <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </Svg>
);

const ChevronLeftIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M15 18l-6-6 6-6" />
  </Svg>
);

const ChevronRightIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

const XIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Line x1="18" y1="6" x2="6" y2="18" /><Line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
);

const StarIcon: React.FC<IconProps & { filled?: boolean }> = ({ size = 20, color = '#fbbf24', filled = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth={2}>
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);

const UsersIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><Circle cx="9" cy="7" r="4" />
  </Svg>
);

const HomeIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><Path d="M9 22V12h6v10" />
  </Svg>
);

const BedIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M2 4v16" /><Path d="M2 8h18a2 2 0 012 2v10" /><Path d="M2 17h20" /><Path d="M6 8v9" />
  </Svg>
);

const BathIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M4 12h16a1 1 0 011 1v3a4 4 0 01-4 4H7a4 4 0 01-4-4v-3a1 1 0 011-1z" />
    <Path d="M6 12V5a2 2 0 012-2h3v2.25" /><Line x1="4" y1="20" x2="7" y2="20" /><Line x1="17" y1="20" x2="20" y2="20" />
  </Svg>
);

const AwardIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Circle cx="12" cy="8" r="6" /><Path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </Svg>
);

const CalendarIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Rect x="3" y="4" width="18" height="18" rx="2" />
    <Line x1="16" y1="2" x2="16" y2="6" /><Line x1="8" y1="2" x2="8" y2="6" /><Line x1="3" y1="10" x2="21" y2="10" />
  </Svg>
);

const ChevronDownIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M6 9l6 6 6-6" />
  </Svg>
);

const WifiIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M5 12.55a11 11 0 0114.08 0" /><Path d="M1.42 9a16 16 0 0121.16 0" />
    <Path d="M8.53 16.11a6 6 0 016.95 0" /><Circle cx="12" cy="20" r="1" fill={color} />
  </Svg>
);

const CarIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M14 16H9m10 0h3v-3.15a1 1 0 00-.84-.99L16 11l-2.7-3.6a1 1 0 00-.8-.4H5.24a2 2 0 00-1.8 1.1l-.8 1.63A6 6 0 002 12.42V16h2" />
    <Circle cx="6.5" cy="16.5" r="2.5" /><Circle cx="16.5" cy="16.5" r="2.5" />
  </Svg>
);

const WindIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M17.7 7.7a2.5 2.5 0 111.8 4.3H2" /><Path d="M9.6 4.6A2 2 0 1111 8H2" />
    <Path d="M12.6 19.4A2 2 0 1014 16H2" />
  </Svg>
);

const TvIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Rect x="2" y="7" width="20" height="15" rx="2" /><Path d="M17 2l-5 5-5-5" />
  </Svg>
);

const UtensilsIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" /><Path d="M7 2v20" />
    <Path d="M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
  </Svg>
);

const WavesIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    <Path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    <Path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
  </Svg>
);

const ShieldIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Svg>
);

const KeyIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </Svg>
);

const CheckCircleIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><Path d="M22 4L12 14.01l-3-3" />
  </Svg>
);

const MessageCircleIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
  </Svg>
);

const ClockIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Circle cx="12" cy="12" r="10" /><Path d="M12 6v6l4 2" />
  </Svg>
);

const GlobeIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Circle cx="12" cy="12" r="10" /><Line x1="2" y1="12" x2="22" y2="12" />
    <Path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </Svg>
);

const FlagIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <Line x1="4" y1="22" x2="4" y2="15" />
  </Svg>
);

const CheckIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 6L9 17l-5-5" />
  </Svg>
);

const PhoneIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </Svg>
);

// Icône générique pour équipements backend
const EquipmentGenericIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Rect x="3" y="3" width="18" height="18" rx="2" /><Path d="M9 9h6v6H9z" />
  </Svg>
);

// Map nom d'équipement → icône
const EQUIPMENT_ICON_MAP: Record<string, React.FC<IconProps>> = {
  'wifi': WifiIcon, 'internet': WifiIcon, 'wi-fi': WifiIcon,
  'parking': CarIcon, 'garage': CarIcon,
  'climatisation': WindIcon, 'clim': WindIcon, 'ventilateur': WindIcon,
  'tv': TvIcon, 'télévision': TvIcon, 'television': TvIcon,
  'cuisine': UtensilsIcon, 'kitchen': UtensilsIcon,
  'piscine': WavesIcon, 'pool': WavesIcon,
  'sécurité': ShieldIcon, 'security': ShieldIcon, 'gardien': ShieldIcon,
  'générateur': KeyIcon, 'generator': KeyIcon,
};

function getEquipmentIcon(name: string): React.FC<IconProps> {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(EQUIPMENT_ICON_MAP)) {
    if (lower.includes(key)) return icon;
  }
  return EquipmentGenericIcon;
}

// ===============================
// MOBILE MONEY ICONS
// ===============================
const MTNMoneyIcon: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Circle cx="24" cy="24" r="22" fill="#FFCC00" />
    <Path d="M12 28L18 16L24 28L30 16L36 28" stroke="#000" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="24" cy="34" r="3" fill="#000" />
  </Svg>
);

const AirtelMoneyIcon: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Circle cx="24" cy="24" r="22" fill="#FF0000" />
    <Path d="M16 32C16 32 20 16 24 16C28 16 32 32 32 32" stroke="#FFF" strokeWidth={3} fill="none" strokeLinecap="round" />
    <Circle cx="24" cy="20" r="4" fill="#FFF" />
  </Svg>
);

// ===============================
// KONGO PATTERN & PARTICULES
// ===============================
const KongoPattern: React.FC = () => {
  const patternSize = 80;
  const cols = Math.ceil(SCREEN_WIDTH / patternSize) + 1;
  const rows = Math.ceil(SCREEN_HEIGHT / patternSize) + 1;

  return (
    <View style={styles.patternContainer} pointerEvents="none">
      {Array.from({ length: rows }).map((_, row) => (
        <View key={row} style={styles.patternRow}>
          {Array.from({ length: cols }).map((_, col) => (
            <Svg key={col} width={patternSize} height={patternSize} viewBox="0 0 80 80">
              <G fill="none" stroke="#D4AF37" strokeWidth={1} opacity={0.08}>
                <Path d="M40 5L50 15 40 25 30 15z" />
                <Path d="M40 30L50 40 40 50 30 40z" />
                <Path d="M40 55L50 65 40 75 30 65z" />
                <Path d="M15 30L25 40 15 50 5 40z" />
                <Path d="M65 30L75 40 65 50 55 40z" />
              </G>
            </Svg>
          ))}
        </View>
      ))}
    </View>
  );
};

interface FloatingParticleProps {
  startX: number; startY: number; delay: number; duration: number;
}

const FloatingParticle: React.FC<FloatingParticleProps> = ({ startX, startY, delay, duration }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(translateY, { toValue: -30, duration: duration / 2, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: duration / 2, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(translateX, { toValue: 20, duration: duration / 2, useNativeDriver: true }),
            Animated.timing(translateX, { toValue: 0, duration: duration / 2, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.7, duration: duration / 2, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.3, duration: duration / 2, useNativeDriver: true }),
          ]),
        ])
      ),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        { left: startX, top: startY, opacity, transform: [{ translateY }, { translateX }] },
      ]}
    />
  );
};

// ===============================
// TYPES
// ===============================
type PaymentMethodId = 'mtn' | 'airtel' | null;
type PaymentStatusType = 'idle' | 'sending' | 'waiting' | 'verifying' | 'success' | 'error';
type ReportStep = 'reason' | 'subreason' | 'details' | 'info' | 'submitted';

type Props = {
  propertyId: string;
};

// ===============================
// REPORT REASONS DATA
// ===============================
const reportReasons = [
  { id: 'inexact', label: 'Elle est inexacte ou incorrecte', needsDetails: true, needsSubReason: false, needsInfo: false },
  { id: 'fake', label: "Ce n'est pas un véritable logement", needsDetails: false, needsSubReason: false, needsInfo: false },
  { id: 'scam', label: "C'est une arnaque", needsDetails: false, needsSubReason: 'scam' as const, needsInfo: false },
  { id: 'offensive', label: 'Le contenu est choquant', needsDetails: false, needsSubReason: 'offensive' as const, needsInfo: false },
  { id: 'illegal', label: "L'annonce comporte du contenu illégal", needsDetails: false, needsSubReason: false, needsInfo: true },
  { id: 'other', label: "Il s'agit d'autre chose", needsDetails: false, needsSubReason: 'other' as const, needsInfo: false },
];

const scamSubReasons = [
  { id: 'pay_outside', label: "L'hôte m'a demandé de payer en dehors de VANDA", example: 'Ex : espèces, virement ou transfert bancaire', needsDetails: false },
  { id: 'shared_contact', label: "L'hôte a partagé ses coordonnées", example: 'Ex : adresse e-mail ou numéro de téléphone personnels', needsDetails: false },
  { id: 'advertising', label: "L'hôte fait de la publicité pour d'autres services", example: "Ex : liens vers des sites autres que VANDA", needsDetails: false },
  { id: 'duplicate', label: "Il s'agit d'une annonce en double", example: "Ex : copie une partie ou l'intégralité d'une autre annonce", needsDetails: false },
  { id: 'misleading', label: 'Elle est trompeuse', example: "Ex : photos non conformes à la description ou provenant d'une banque d'images", needsDetails: false },
  { id: 'other_scam', label: "Il s'agit d'autre chose", example: '', needsDetails: true },
];

const offensiveSubReasons = [
  { id: 'discriminatory', label: 'Elle est discriminatoire', example: 'Ex : contenu raciste, homophobe ou sexiste', needsDetails: false },
  { id: 'inappropriate', label: 'Elle est inappropriée', example: 'Ex : contenu à caractère sexuel, violent ou obscène', needsDetails: false },
  { id: 'abusive', label: 'Elle est abusive ou hostile', example: 'Ex : intimidation, menaces, attaques verbales', needsDetails: false },
];

const otherSubReasons = [
  { id: 'broken_page', label: 'Certains éléments de cette page ne fonctionnent pas', needsDetails: false },
  { id: 'more_money', label: "L'hôte réclame plus d'argent", needsDetails: false },
  { id: 'not_clean_safe', label: "Le logement n'a pas l'air propre ou sûr", needsDetails: false },
  { id: 'duplicate_listing', label: "Il s'agit d'une annonce en double", needsDetails: false },
  { id: 'not_authorized', label: "Je ne crois pas que ce soit autorisé dans mon quartier", needsDetails: false },
  { id: 'neighborhood', label: 'Il dérange mon voisinage', needsDetails: false },
];

// ===============================
// COMPOSANT PRINCIPAL
// ===============================
const PropertyDetailsScreen: React.FC<Props> = ({ propertyId }) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { token, user } = useAuth();

  // --- Backend data
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [availability, setAvailability] = useState<Record<string, AvailabilityDay>>({});
  const [reviews, setReviews] = useState<PropertyReview[]>([]);
  const [ratings, setRatings] = useState<PropertyRatings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- UI states
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImageIndex, setViewerImageIndex] = useState(0);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [showHostModal, setShowHostModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);

  // --- Calendar & booking
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [guestsCount, setGuestsCount] = useState(2);
  const [paymentOption, setPaymentOption] = useState<'now' | 'later'>('now');

  // --- Report
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportStep, setReportStep] = useState<ReportStep>('reason');
  const [selectedReportReason, setSelectedReportReason] = useState<string | null>(null);
  const [selectedSubReason, setSelectedSubReason] = useState<string | null>(null);
  const [reportDescription, setReportDescription] = useState('');

  // --- Payment
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodId>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusType>('idle');

  // --- Additional modals
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [showPriceDetailModal, setShowPriceDetailModal] = useState(false);
  const [showDeferredPaymentModal, setShowDeferredPaymentModal] = useState(false);

  // --- Price display alternation
  const [priceDisplayMode, setPriceDisplayMode] = useState<'night' | 'month'>('night');

  // --- Backend booking & payment
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingTotal, setBookingTotal] = useState<number | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // --- Reviews pagination
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);
  const [allReviewsLoaded, setAllReviewsLoaded] = useState(false);

  const carouselRef = useRef<ScrollView>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Particules
  const particles = useMemo(() => Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    startX: Math.random() * SCREEN_WIDTH,
    startY: Math.random() * SCREEN_HEIGHT,
    delay: Math.random() * 5000,
    duration: 5000 + Math.random() * 10000,
  })), []);

  // ===============================
  // DERIVED DATA
  // ===============================
  const images = useMemo(() => {
    if (!property?.photos?.length) return [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    ];
    return property.photos
      .sort((a: PropertyPhoto, b: PropertyPhoto) => a.sortOrder - b.sortOrder)
      .map((p: PropertyPhoto) => p.url)
      .filter(Boolean) as string[];
  }, [property?.photos]);

  const locationType = useMemo((): 'short' | 'long' | 'both' => {
    if (!property) return 'short';
    if (property.rentalMode === 'both') return 'both';
    if (property.rentalMode === 'long_term') return 'long';
    return 'short';
  }, [property?.rentalMode]);

  const pricePerNight = property?.pricePerNight ?? 0;
  const pricePerMonth = property?.pricePerMonth ?? 0;
  const currency = 'FCFA';

  // ===============================
  // EFFECTS
  // ===============================

  // Price alternation for "both" mode
  useEffect(() => {
    if (locationType === 'both') {
      const interval = setInterval(() => {
        setPriceDisplayMode(prev => prev === 'night' ? 'month' : 'night');
      }, 3000);
      return () => clearInterval(interval);
    } else if (locationType === 'long') {
      setPriceDisplayMode('month');
    } else {
      setPriceDisplayMode('night');
    }
  }, [locationType]);

  // Pre-fill phone from user profile
  useEffect(() => {
    if (user?.phoneNumber && !phoneNumber) {
      const digits = user.phoneNumber.replace(/[^\d]/g, '');
      setPhoneNumber(digits.slice(-9));
    }
  }, [user]);

  // Load all backend data
  useEffect(() => {
    let isMounted = true;

    async function loadAll() {
      try {
        setLoading(true);
        setError(null);

        const data = await getPropertyById(propertyId);
        if (!isMounted) return;
        setProperty(data);

        // Check favorite
        if (token) {
          try {
            const fav = await checkFavorite(propertyId);
            if (isMounted) setIsFavorite(fav.isFavorite);
          } catch {}
        }

        // Availability (60 days)
        const today = new Date();
        const from = today.toISOString().slice(0, 10);
        const toDate = new Date();
        toDate.setDate(today.getDate() + 60);
        const to = toDate.toISOString().slice(0, 10);

        const avail = await getPropertyAvailability(propertyId, from, to);
        if (!isMounted) return;
        const map: Record<string, AvailabilityDay> = {};
        for (const d of avail.days) map[d.date] = d;
        setAvailability(map);

        // Ratings
        const r = await getPropertyRatings(propertyId);
        if (!isMounted) return;
        setRatings(r);

        // Reviews
        const resp = await getPropertyReviews(propertyId, { limit: 10, offset: 0 });
        if (!isMounted) return;
        setReviews(resp.items);
        setAllReviewsLoaded(resp.items.length >= resp.total);
      } catch (e: any) {
        console.error(e);
        if (isMounted) setError(e?.message || 'Impossible de charger les détails du bien.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAll();
    return () => { isMounted = false; };
  }, [propertyId]);

  // Cleanup polling
  useEffect(() => () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  // ===============================
  // CAROUSEL
  // ===============================
  const handleCarouselScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== currentImageIndex && index >= 0 && index < images.length) {
      setCurrentImageIndex(index);
    }
  };

  const openImageViewer = (index: number) => {
    setViewerImageIndex(index);
    setShowImageViewer(true);
  };

  // ===============================
  // PRICE / DATES
  // ===============================
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const diff = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const calculateTotalPrice = () => {
    const nights = calculateNights();
    const basePrice = nights * pricePerNight;
    const serviceFee = Math.round(basePrice * 0.12);
    return basePrice + serviceFee;
  };

  const finalTotal = bookingTotal ?? calculateTotalPrice();

  const isBooking30DaysAhead = () => {
    if (!checkInDate) return false;
    const today = new Date();
    const diff = checkInDate.getTime() - today.getTime();
    return diff >= 30 * 24 * 60 * 60 * 1000;
  };

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const formatLongDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 1) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks === 1) return 'Il y a 1 semaine';
    if (diffWeeks < 5) return `Il y a ${diffWeeks} semaines`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return 'Il y a 1 mois';
    if (diffMonths < 12) return `Il y a ${diffMonths} mois`;
    const diffYears = Math.floor(diffDays / 365);
    if (diffYears === 1) return 'Il y a 1 an';
    return `Il y a ${diffYears} ans`;
  };

  // ===============================
  // CALENDAR
  // ===============================
  const generateCalendarDays = (month: Date): (Date | null)[] => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const days: (Date | null)[] = [];

    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;
    for (let i = 0; i < startDay; i++) days.push(null);

    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, monthIndex, d));
    }
    return days;
  };

  const isDateInPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateUnavailable = (date: Date) => {
    const key = date.toISOString().split('T')[0];
    const day = availability[key];
    return day ? !day.available : false;
  };

  const isDateSelected = (date: Date): 'start' | 'end' | false => {
    if (checkInDate && date.toDateString() === checkInDate.toDateString()) return 'start';
    if (checkOutDate && date.toDateString() === checkOutDate.toDateString()) return 'end';
    return false;
  };

  const isDateInRange = (date: Date) => {
    if (!checkInDate || !checkOutDate) return false;
    return date > checkInDate && date < checkOutDate;
  };

  const handleDateSelect = (date: Date) => {
    if (!checkInDate || (checkInDate && checkOutDate)) {
      setCheckInDate(date);
      setCheckOutDate(null);
    } else if (date > checkInDate) {
      setCheckOutDate(date);
    } else {
      setCheckInDate(date);
      setCheckOutDate(null);
    }
  };

  const resetDates = () => {
    setCheckInDate(null);
    setCheckOutDate(null);
  };

  // ===============================
  // CANCELLATION
  // ===============================
  const isFreeCancellationAvailable = () => {
    if (!checkInDate) return false;
    const today = new Date();
    const diffDays = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 7;
  };

  const getFreeCancellationDate = () => {
    if (!checkInDate) return null;
    const date = new Date(checkInDate);
    date.setDate(date.getDate() - 7);
    return date;
  };

  const getPaymentDeadlineDate = () => {
    if (!checkInDate) return null;
    const date = new Date(checkInDate);
    date.setDate(date.getDate() - 14);
    return date;
  };

  // ===============================
  // REPORT
  // ===============================
  const getSubReasons = () => {
    if (selectedReportReason === 'scam') return scamSubReasons;
    if (selectedReportReason === 'offensive') return offensiveSubReasons;
    if (selectedReportReason === 'other') return otherSubReasons;
    return [];
  };

  const handleReportReasonSelect = (reasonId: string) => {
    setSelectedReportReason(reasonId);
    const reason = reportReasons.find(r => r.id === reasonId);
    if (reason) {
      if (reason.needsSubReason) setReportStep('subreason');
      else if (reason.needsDetails) setReportStep('details');
      else if (reason.needsInfo) setReportStep('info');
      else setReportStep('submitted');
    }
  };

  const handleSubReasonSelect = (subReasonId: string) => {
    setSelectedSubReason(subReasonId);
    const subReasons = getSubReasons();
    const subReason = subReasons.find((s: any) => s.id === subReasonId);
    if (subReason && 'needsDetails' in subReason && subReason.needsDetails) {
      setReportStep('details');
    } else {
      setReportStep('submitted');
    }
  };

  const handleReportBack = () => {
    if (reportStep === 'subreason') {
      setReportStep('reason');
      setSelectedReportReason(null);
    } else if (reportStep === 'details' || reportStep === 'info') {
      const reason = reportReasons.find(r => r.id === selectedReportReason);
      if (reason?.needsSubReason) {
        setReportStep('subreason');
        setSelectedSubReason(null);
      } else {
        setReportStep('reason');
        setSelectedReportReason(null);
      }
    }
  };

  const resetReport = () => {
    setReportStep('reason');
    setSelectedReportReason(null);
    setSelectedSubReason(null);
    setReportDescription('');
  };

  // ===============================
  // FAVORITE
  // ===============================
  const handleFavorite = async () => {
    const newVal = !isFavorite;
    setIsFavorite(newVal);
    try {
      if (newVal) await addFavorite(propertyId);
      else await removeFavorite(propertyId);
    } catch {
      setIsFavorite(!newVal);
    }
  };

  // ===============================
  // LOAD MORE REVIEWS
  // ===============================
  const loadMoreReviews = async () => {
    if (loadingMoreReviews || allReviewsLoaded) return;
    try {
      setLoadingMoreReviews(true);
      const resp = await getPropertyReviews(propertyId, { limit: 10, offset: reviews.length });
      setReviews(prev => [...prev, ...resp.items]);
      if (reviews.length + resp.items.length >= resp.total) {
        setAllReviewsLoaded(true);
      }
    } catch (e) {
      console.error('Erreur chargement reviews:', e);
    } finally {
      setLoadingMoreReviews(false);
    }
  };

  // ===============================
  // BOOKING + PAYMENT
  // ===============================
  const normalizeMsisdn = (raw: string) => {
    let digits = raw.replace(/[^\d]/g, '');
    if (digits.startsWith('00')) digits = digits.slice(2);
    if (digits.startsWith('242')) return digits;
    return `242${digits}`;
  };

  const determineRentalType = (): RentalType => {
    if (!property) return 'short_term';
    if (property.rentalMode === 'long_term') return 'long_term';
    if (property.rentalMode === 'short_term') return 'short_term';
    const nights = calculateNights();
    return nights >= 24 ? 'long_term' : 'short_term';
  };

  const startPaymentPolling = (id: string, tok: string) => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    const start = Date.now();
    const timeoutMs = 2 * 60 * 1000;

    pollTimerRef.current = setInterval(async () => {
      if (Date.now() - start > timeoutMs) {
        if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; }
        setPaymentStatus('error');
        setSubmittingPayment(false);
        return;
      }
      try {
        const p = await getPaymentById(tok, id);
        if (p.status === 'success') {
          if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; }
          setPaymentStatus('success');
          setSubmittingPayment(false);
        } else if (p.status === 'failed') {
          if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; }
          setPaymentStatus('error');
          setSubmittingPayment(false);
        }
      } catch {}
    }, 5000);
  };

  const handleReservePress = () => {
    if (checkInDate && checkOutDate) {
      setShowBookingModal(true);
    } else {
      setShowCalendarModal(true);
    }
  };

  const handleBookingConfirm = async () => {
    if (!checkInDate || !checkOutDate) return;
    if (!token) {
      Alert.alert('Connexion requise', 'Vous devez être connecté pour réserver.');
      router.push('/(auth)/login');
      return;
    }
    if (!property) return;

    try {
      setBookingLoading(true);
      setBookingError(null);
      setBookingId(null);
      setBookingTotal(null);

      const booking = await createBooking(token, {
        propertyId: property.id,
        checkInDate: checkInDate.toISOString().split('T')[0],
        checkOutDate: checkOutDate.toISOString().split('T')[0],
        guestsCount,
        rentalType: determineRentalType(),
        specialRequests: null,
      });

      setBookingId(booking.id);
      if (typeof booking.totalAmount === 'number') {
        setBookingTotal(booking.totalAmount);
      }

      setShowBookingModal(false);
      setTimeout(() => {
        if (paymentOption === 'now') {
          setPaymentStatus('idle');
          setSelectedPaymentMethod(null);
          setShowPaymentModal(true);
        } else {
          setShowDeferredPaymentModal(true);
        }
      }, 300);
    } catch (e: any) {
      setBookingError(e?.message || 'Impossible de créer la réservation.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePay = async () => {
    if (!bookingId || !selectedPaymentMethod || !token) return;
    if (phoneNumber.replace(/[^\d]/g, '').length < 8) return;

    try {
      setSubmittingPayment(true);
      setPaymentStatus('sending');

      const provider = selectedPaymentMethod === 'mtn' ? 'mtn_momo' : 'airtel_momo';
      const msisdn = normalizeMsisdn(phoneNumber);

      const payment = await createPayment(token, {
        bookingId,
        payerMsisdn: msisdn,
        provider,
        reason: `Réservation ${bookingId} - ${property?.title}`,
      });

      setPaymentId(payment.id);
      setPaymentStatus('waiting');
      startPaymentPolling(payment.id, token);
    } catch (e: any) {
      setSubmittingPayment(false);
      setPaymentStatus('error');
      setBookingError(e?.message || "Impossible d'initier le paiement.");
    }
  };

  const closePaymentModal = () => {
    if (submittingPayment && (paymentStatus === 'sending' || paymentStatus === 'waiting' || paymentStatus === 'verifying')) return;
    if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; }
    setShowPaymentModal(false);
    setPaymentStatus('idle');
    setSubmittingPayment(false);
  };

  // ===============================
  // RENDER: LOADING / ERROR
  // ===============================
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#78350f', '#92400e', '#78350f', '#7f1d1d', '#78350f']} locations={[0, 0.25, 0.5, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
        <ActivityIndicator size="large" color="#fbbf24" />
        <Text style={styles.loadingText}>Chargement du bien...</Text>
      </View>
    );
  }

  if (error && !property) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#78350f', '#92400e', '#78350f']} style={StyleSheet.absoluteFillObject} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
          <LinearGradient colors={['#facc15', '#f59e0b']} style={styles.retryBtnGradient}>
            <Text style={styles.retryBtnText}>Retour</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  if (!property) return null;

  const nights = calculateNights();
  const subtotal = nights * pricePerNight;
  const serviceFee = Math.round(subtotal * 0.12);
  const totalPrice = subtotal + serviceFee;

  // ===============================
  // RENDER PRINCIPAL
  // ===============================
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#78350f', '#92400e', '#78350f', '#7f1d1d', '#78350f']}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <KongoPattern />
      <View style={styles.particlesContainer}>
        {particles.map(p => <FloatingParticle key={p.id} {...p} />)}
      </View>

      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={{ paddingBottom: 100 + (insets.bottom || 16) }}
        showsVerticalScrollIndicator={false}
      >
        {/* CAROUSEL D'IMAGES */}
        <View style={styles.carouselContainer}>
          <ScrollView
            ref={carouselRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleCarouselScroll}
            scrollEventThrottle={16}
          >
            {images.map((image, index) => (
              <TouchableOpacity key={index} activeOpacity={0.95} onPress={() => openImageViewer(index)}>
                <Image source={{ uri: image }} style={styles.carouselImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent']} style={styles.carouselTopGradient} pointerEvents="none" />

          <View style={[styles.carouselHeader, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8} onPress={() => router.back()}>
              <ArrowLeftIcon size={18} color="#fbbf24" />
            </TouchableOpacity>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
                <Share2Icon size={16} color="#fbbf24" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8} onPress={handleFavorite}>
                <HeartIcon size={16} color="#fbbf24" filled={isFavorite} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.carouselIndicator}>
            <Text style={styles.carouselIndicatorText}>{currentImageIndex + 1}/{images.length}</Text>
          </View>
        </View>

        {/* CONTENU */}
        <View style={styles.content}>
          {/* Titre */}
          <Text style={styles.title}>{property.title}</Text>

          {/* Type et localisation */}
          <Text style={styles.subtitle}>
            {property.propertyType ?? 'Logement entier'} · {property.neighborhood?.name ? `${property.neighborhood.name}, ` : ''}{property.city}
          </Text>

          {/* Capacité */}
          <View style={styles.capacityRow}>
            <View style={styles.capacityItem}>
              <UsersIcon size={14} color="rgba(252, 211, 77, 0.7)" />
              <Text style={styles.capacityText}>{property.maxGuests} voyageurs</Text>
            </View>
            <Text style={styles.capacityDot}>·</Text>
            <View style={styles.capacityItem}>
              <HomeIcon size={14} color="rgba(252, 211, 77, 0.7)" />
              <Text style={styles.capacityText}>{property.bedrooms} chambre{property.bedrooms > 1 ? 's' : ''}</Text>
            </View>
            <Text style={styles.capacityDot}>·</Text>
            <View style={styles.capacityItem}>
              <BedIcon size={14} color="rgba(252, 211, 77, 0.7)" />
              <Text style={styles.capacityText}>{property.beds} lit{property.beds > 1 ? 's' : ''}</Text>
            </View>
            <Text style={styles.capacityDot}>·</Text>
            <View style={styles.capacityItem}>
              <BathIcon size={14} color="rgba(252, 211, 77, 0.7)" />
              <Text style={styles.capacityText}>{property.bathrooms} sdb</Text>
            </View>
          </View>

          {/* Note et avis */}
          {ratings && ratings.count > 0 && (
            <View style={styles.ratingRow}>
              <StarIcon size={18} color="#facc15" filled />
              <Text style={styles.ratingValue}>{ratings.averages.overall?.toFixed(1) ?? 'N/A'}</Text>
              <Text style={styles.ratingDot}>·</Text>
              <TouchableOpacity onPress={() => setShowReviewsModal(true)}>
                <Text style={styles.reviewsLink}>{ratings.count} commentaires</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.separator} />

          {/* HIGHLIGHTS */}
          <View style={styles.highlightsSection}>
            <View style={styles.highlightItem}>
              <View style={styles.highlightIconBox}><AwardIcon size={20} color="#fbbf24" /></View>
              <View style={styles.highlightContent}>
                <Text style={styles.highlightTitle}>Hôte expérimenté</Text>
                <Text style={styles.highlightDescription}>
                  {property.host.firstName} a {ratings?.count ?? 0} commentaire{(ratings?.count ?? 0) > 1 ? 's' : ''} pour ses logements.
                </Text>
              </View>
            </View>
            <View style={styles.highlightItem}>
              <View style={styles.highlightIconBox}><CalendarIcon size={20} color="#fbbf24" /></View>
              <View style={styles.highlightContent}>
                <Text style={styles.highlightTitle}>Annulation gratuite pendant 48h</Text>
                <Text style={styles.highlightDescription}>Annulation gratuite après la réservation.</Text>
              </View>
            </View>
          </View>

          <View style={styles.separator} />

          {/* DESCRIPTION */}
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionText} numberOfLines={6}>{property.description}</Text>
            {property.description && property.description.length > 200 && (
              <TouchableOpacity style={styles.readMoreButton} onPress={() => setShowDescriptionModal(true)} activeOpacity={0.8}>
                <Text style={styles.readMoreText}>Lire la suite</Text>
                <ChevronDownIcon size={16} color="#fbbf24" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.separator} />

          {/* HÔTE */}
          <TouchableOpacity style={styles.hostSection} onPress={() => setShowHostModal(true)} activeOpacity={0.9}>
            <View style={styles.hostInfo}>
              <View style={styles.hostAvatarContainer}>
                {property.host.avatarUrl ? (
                  <Image source={{ uri: property.host.avatarUrl }} style={styles.hostAvatar} />
                ) : (
                  <View style={[styles.hostAvatar, styles.hostAvatarFallback]}>
                    <Text style={styles.hostAvatarInitials}>{property.host.firstName?.[0]}{property.host.lastName?.[0]}</Text>
                  </View>
                )}
                <View style={styles.hostVerifiedBadge}>
                  <LinearGradient colors={['#facc15', '#f59e0b']} style={styles.hostVerifiedBadgeGradient}>
                    <CheckCircleIcon size={14} color="#78350f" />
                  </LinearGradient>
                </View>
              </View>
              <View style={styles.hostDetails}>
                <Text style={styles.hostName}>Hôte : {property.host.firstName} {property.host.lastName}</Text>
                <Text style={styles.hostExperience}>
                  {property.host.experience ? `${property.host.experience} d'expérience en tant qu'hôte` : 'Hôte sur VANDA'}
                </Text>
              </View>
            </View>
            <ChevronRightIcon size={20} color="#fbbf24" />
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* ÉQUIPEMENTS */}
          <View style={styles.amenitiesSection}>
            <Text style={styles.sectionTitle}>Ce que propose ce logement</Text>
            <View style={styles.amenitiesList}>
              {(property.equipments || []).slice(0, 6).map((eq: EquipmentInfo) => {
                const IconComp = getEquipmentIcon(eq.name);
                const isAvailable = eq.available !== false;
                return (
                  <View key={eq.id} style={styles.amenityItem}>
                    <IconComp size={24} color={isAvailable ? '#fbbf24' : '#78350f'} />
                    <Text style={[styles.amenityName, !isAvailable && styles.amenityNameDisabled]}>{eq.name}</Text>
                  </View>
                );
              })}
            </View>
            {(property.equipments || []).length > 6 && (
              <TouchableOpacity style={styles.showAllAmenitiesBtn} onPress={() => setShowAmenitiesModal(true)} activeOpacity={0.8}>
                <Text style={styles.showAllAmenitiesBtnText}>Afficher les {property.equipments.length} équipements</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.separator} />

          {/* COMMENTAIRES */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <StarIcon size={20} color="#facc15" filled />
              <Text style={styles.reviewsRating}>{ratings?.averages.overall?.toFixed(1) ?? 'N/A'}</Text>
              <Text style={styles.reviewsDot}>·</Text>
              <Text style={styles.reviewsCountText}>{ratings?.count ?? 0} commentaires</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewsCarousel} contentContainerStyle={styles.reviewsCarouselContent}>
              {reviews.map((review) => (
                <TouchableOpacity key={review.id} style={styles.reviewCard} onPress={() => setShowReviewsModal(true)} activeOpacity={0.9}>
                  <View style={styles.reviewCardHeader}>
                    {review.reviewer?.avatarUrl ? (
                      <Image source={{ uri: review.reviewer.avatarUrl }} style={styles.reviewAvatar} />
                    ) : (
                      <View style={[styles.reviewAvatar, styles.reviewAvatarFallback]}>
                        <Text style={styles.reviewAvatarInitials}>{review.reviewer?.firstName?.[0]}{review.reviewer?.lastName?.[0]}</Text>
                      </View>
                    )}
                    <View style={styles.reviewAuthorInfo}>
                      <Text style={styles.reviewAuthor}>{review.reviewer?.firstName ?? 'Invité'}</Text>
                      <Text style={styles.reviewMemberSince}>
                        {new Date(review.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.reviewStars}>
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} size={14} color={i < (review.overallRating ?? 0) ? '#facc15' : '#78350f'} filled={i < (review.overallRating ?? 0)} />
                    ))}
                    <Text style={styles.reviewDate}>· {formatRelativeDate(review.createdAt)}</Text>
                  </View>
                  <Text style={styles.reviewComment} numberOfLines={5}>{review.comment}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {(ratings?.count ?? 0) > 0 && (
              <TouchableOpacity style={styles.showAllReviewsBtn} onPress={() => setShowReviewsModal(true)} activeOpacity={0.8}>
                <Text style={styles.showAllReviewsBtnText}>Afficher les {ratings?.count} commentaires</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.separator} />

          {/* RÈGLEMENT INTÉRIEUR */}
          <View style={styles.rulesSection}>
            <Text style={styles.sectionTitle}>Règlement intérieur</Text>
            <View style={styles.rulesList}>
              {/* Check-in/Check-out if structured */}
              {property.houseRules && typeof property.houseRules === 'object' && !Array.isArray(property.houseRules) && (property.houseRules as any).checkIn && (
                <View style={styles.ruleItem}>
                  <ClockIcon size={18} color="#f59e0b" />
                  <Text style={styles.ruleText}>Arrivée à partir de {(property.houseRules as any).checkIn}</Text>
                </View>
              )}
              {property.houseRules && typeof property.houseRules === 'object' && !Array.isArray(property.houseRules) && (property.houseRules as any).checkOut && (
                <View style={styles.ruleItem}>
                  <ClockIcon size={18} color="#f59e0b" />
                  <Text style={styles.ruleText}>Départ avant {(property.houseRules as any).checkOut}</Text>
                </View>
              )}
              <View style={styles.ruleItem}>
                <UsersIcon size={18} color="#f59e0b" />
                <Text style={styles.ruleText}>{property.maxGuests} voyageurs maximum</Text>
              </View>
              {/* Structured rules: smoking, pets, parties */}
              {property.houseRules && typeof property.houseRules === 'object' && !Array.isArray(property.houseRules) && (property.houseRules as any).smoking === false && (
                <View style={styles.ruleItem}>
                  <XIcon size={18} color="#ef4444" />
                  <Text style={styles.ruleText}>Non fumeur</Text>
                </View>
              )}
              {property.houseRules && typeof property.houseRules === 'object' && !Array.isArray(property.houseRules) && (property.houseRules as any).pets === false && (
                <View style={styles.ruleItem}>
                  <XIcon size={18} color="#ef4444" />
                  <Text style={styles.ruleText}>Animaux non autorisés</Text>
                </View>
              )}
              {property.houseRules && typeof property.houseRules === 'object' && !Array.isArray(property.houseRules) && (property.houseRules as any).parties === false && (
                <View style={styles.ruleItem}>
                  <XIcon size={18} color="#ef4444" />
                  <Text style={styles.ruleText}>Fêtes interdites</Text>
                </View>
              )}
              {/* Fallback: string or array houseRules from backend */}
              {property.houseRules && typeof property.houseRules === 'string' && (
                <View style={styles.ruleItem}>
                  <CheckCircleIcon size={18} color="#f59e0b" />
                  <Text style={styles.ruleText}>{property.houseRules}</Text>
                </View>
              )}
              {Array.isArray(property.houseRules) && (property.houseRules as string[]).map((rule: string, i: number) => (
                <View key={i} style={styles.ruleItem}>
                  <CheckCircleIcon size={18} color="#f59e0b" />
                  <Text style={styles.ruleText}>{rule}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.separator} />

          {/* DISPONIBILITÉS */}
          <TouchableOpacity style={styles.availabilitySection} onPress={() => setShowCalendarModal(true)} activeOpacity={0.7}>
            <View style={styles.availabilityContent}>
              <Text style={styles.sectionTitle}>Disponibilités</Text>
              {checkInDate && checkOutDate ? (
                <Text style={styles.availabilityText}>
                  {formatShortDate(checkInDate)} - {formatShortDate(checkOutDate)} · {nights} nuit{nights > 1 ? 's' : ''}
                </Text>
              ) : (
                <Text style={styles.availabilityText}>Ajoutez vos dates de voyage pour connaître le prix exact</Text>
              )}
            </View>
            <ChevronRightIcon size={24} color="#fbbf24" />
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* CONDITIONS D'ANNULATION */}
          <View style={styles.cancellationSection}>
            <Text style={styles.sectionTitle}>Conditions d'annulation</Text>
            <Text style={styles.cancellationText}>
              {!checkInDate || !checkOutDate
                ? "Ajoutez vos dates de voyage pour connaître les conditions d'annulation de ce séjour."
                : isFreeCancellationAvailable()
                  ? `Annulation gratuite avant le ${formatLongDate(getFreeCancellationDate()!)}. Si vous annulez avant l'arrivée prévue le ${formatLongDate(checkInDate)}, vous aurez droit à un remboursement partiel.`
                  : `Si vous annulez avant l'arrivée prévue le ${formatLongDate(checkInDate)}, vous aurez droit à un remboursement partiel. Passé ce délai, cette réservation n'est pas remboursable.`
              }
            </Text>
            <TouchableOpacity
              style={[styles.learnMoreBtn, (!checkInDate || !checkOutDate) && styles.learnMoreBtnDisabled]}
              onPress={() => checkInDate && checkOutDate && setShowCancellationModal(true)}
              disabled={!checkInDate || !checkOutDate}
            >
              <Text style={[styles.learnMoreBtnText, (!checkInDate || !checkOutDate) && styles.learnMoreBtnTextDisabled]}>En savoir plus</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.separator} />

          {/* SIGNALER */}
          <TouchableOpacity style={styles.reportButton} onPress={() => { resetReport(); setShowReportModal(true); }} activeOpacity={0.7}>
            <FlagIcon size={16} color="rgba(245, 158, 11, 0.7)" />
            <Text style={styles.reportButtonText}>Signaler cette annonce</Text>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* BARRE DE RÉSERVATION FIXE */}
      <View style={[styles.bookingBar, { paddingBottom: insets.bottom || 16 }]}>
        <View style={styles.bookingBarContent}>
          <View style={styles.bookingBarLeft}>
            {checkInDate && checkOutDate ? (
              <>
                <TouchableOpacity onPress={() => setShowPriceDetailModal(true)} activeOpacity={0.7}>
                  <Text style={styles.bookingPriceWithDates}>
                    <Text style={[styles.bookingPriceBold, styles.bookingPriceUnderline]}>{formatPrice(finalTotal)} {currency}</Text>
                  </Text>
                </TouchableOpacity>
                <Text style={styles.bookingDatesInfo}>
                  Pour {nights} nuit{nights > 1 ? 's' : ''} · {formatShortDate(checkInDate)}-{formatShortDate(checkOutDate)}
                </Text>
                {isFreeCancellationAvailable() && (
                  <View style={styles.bookingFreeCancellation}>
                    <CheckCircleIcon size={14} color="#fbbf24" />
                    <Text style={styles.bookingFreeCancellationText}>Annulation gratuite</Text>
                  </View>
                )}
              </>
            ) : (
              <>
                <Text style={styles.bookingPrice}>
                  <Text style={styles.bookingPriceBold}>
                    {priceDisplayMode === 'night' || locationType === 'short'
                      ? formatPrice(pricePerNight)
                      : formatPrice(pricePerMonth)
                    } {currency}
                  </Text>
                  <Text style={styles.bookingPriceUnit}>
                    {' / '}{priceDisplayMode === 'night' || locationType === 'short' ? 'nuit' : 'mois'}
                  </Text>
                </Text>
                {ratings && ratings.count > 0 && (
                  <View style={styles.bookingRatingRow}>
                    <StarIcon size={14} color="#facc15" filled />
                    <Text style={styles.bookingRatingText}>{ratings.averages.overall?.toFixed(1)}</Text>
                  </View>
                )}
              </>
            )}
          </View>
          <TouchableOpacity style={styles.bookingButton} activeOpacity={0.9} onPress={handleReservePress}>
            <LinearGradient
              colors={['#facc15', '#f59e0b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.bookingButtonGradient, !(checkInDate && checkOutDate) && styles.bookingButtonSmall]}
            >
              {checkInDate && checkOutDate ? (
                <Text style={styles.bookingButtonText}>Réserver</Text>
              ) : (
                <Text style={styles.bookingButtonTextSmall}>Vérifier la{'\n'}disponibilité</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* ======= MODAL CALENDRIER ======= */}
      <Modal visible={showCalendarModal} animationType="slide" transparent onRequestClose={() => setShowCalendarModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowCalendarModal(false)} />
          <View style={styles.calendarSheet}>
            <LinearGradient colors={['#78350f', '#7f1d1d', '#78350f']} style={styles.calendarSheetGradient}>
              <View style={styles.bottomSheetHandle}><View style={styles.bottomSheetHandleBar} /></View>
              <TouchableOpacity style={styles.bottomSheetCloseBtn} onPress={() => setShowCalendarModal(false)}>
                <XIcon size={24} color="#fbbf24" />
              </TouchableOpacity>

              <View style={styles.calendarHeader}>
                <Text style={styles.calendarTitle}>
                  {checkInDate && checkOutDate ? `${nights} nuit${nights > 1 ? 's' : ''}` : checkInDate ? 'Sélectionnez la date de départ' : "Sélectionnez la date d'arrivée"}
                </Text>
                <Text style={styles.calendarSubtitle}>
                  {checkInDate && checkOutDate ? `${formatPrice(totalPrice)} FCFA au total` : 'Ajoutez vos dates pour le prix exact'}
                </Text>
              </View>

              <ScrollView style={styles.calendarContent} showsVerticalScrollIndicator={false}>
                <View style={styles.dateButtons}>
                  <View style={[styles.dateButton, checkInDate && styles.dateButtonActive]}>
                    <Text style={[styles.dateButtonLabel, checkInDate && styles.dateButtonLabelActive]}>ARRIVÉE</Text>
                    <Text style={[styles.dateButtonValue, checkInDate && styles.dateButtonValueActive]}>
                      {checkInDate ? formatShortDate(checkInDate) : '-- --- ----'}
                    </Text>
                  </View>
                  <Text style={styles.dateArrow}>→</Text>
                  <View style={[styles.dateButton, checkOutDate && styles.dateButtonActiveEnd]}>
                    <Text style={[styles.dateButtonLabel, checkOutDate && styles.dateButtonLabelActive]}>DÉPART</Text>
                    <Text style={[styles.dateButtonValue, checkOutDate && styles.dateButtonValueActive]}>
                      {checkOutDate ? formatShortDate(checkOutDate) : '-- --- ----'}
                    </Text>
                  </View>
                </View>

                <View style={styles.monthNav}>
                  <TouchableOpacity style={styles.monthNavBtn} onPress={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}>
                    <ChevronLeftIcon size={18} color="#fbbf24" />
                  </TouchableOpacity>
                  <Text style={styles.monthNavText}>{calendarMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</Text>
                  <TouchableOpacity style={styles.monthNavBtn} onPress={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}>
                    <ChevronRightIcon size={18} color="#fbbf24" />
                  </TouchableOpacity>
                </View>

                <View style={styles.weekDays}>
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                    <Text key={day} style={styles.weekDay}>{day}</Text>
                  ))}
                </View>

                <View style={styles.calendarGrid}>
                  {generateCalendarDays(calendarMonth).map((date, index) => {
                    if (!date) return <View key={`empty-${index}`} style={styles.calendarDayEmpty} />;
                    const isPast = isDateInPast(date);
                    const isUnavail = isDateUnavailable(date);
                    const selected = isDateSelected(date);
                    const inRange = isDateInRange(date);
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isDisabled = isPast || isUnavail;

                    return (
                      <TouchableOpacity
                        key={date.toISOString()}
                        style={[
                          styles.calendarDay,
                          selected === 'start' && styles.calendarDayStart,
                          selected === 'end' && styles.calendarDayEnd,
                          inRange && styles.calendarDayInRange,
                          isToday && !selected && styles.calendarDayToday,
                        ]}
                        onPress={() => !isDisabled && handleDateSelect(date)}
                        disabled={isDisabled}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.calendarDayText,
                          isPast && styles.calendarDayTextPast,
                          isUnavail && styles.calendarDayTextUnavailable,
                          (selected === 'start' || selected === 'end') && styles.calendarDayTextSelected,
                          inRange && styles.calendarDayTextInRange,
                        ]}>
                          {date.getDate()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.calendarLegend}>
                  <View style={styles.legendItem}><View style={[styles.legendDot, styles.legendDotStart]} /><Text style={styles.legendText}>Arrivée</Text></View>
                  <View style={styles.legendItem}><View style={[styles.legendDot, styles.legendDotEnd]} /><Text style={styles.legendText}>Départ</Text></View>
                  {checkInDate && checkOutDate && (
                    <View style={styles.legendItem}><View style={[styles.legendDot, styles.legendDotRange]} /><Text style={styles.legendText}>Séjour</Text></View>
                  )}
                </View>
              </ScrollView>

              <View style={styles.calendarFooter}>
                <TouchableOpacity style={styles.calendarResetBtn} onPress={resetDates}>
                  <Text style={styles.calendarResetBtnText}>Réinitialiser</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calendarValidateBtn, !(checkInDate && checkOutDate) && styles.calendarValidateBtnDisabled]}
                  onPress={() => checkInDate && checkOutDate && setShowCalendarModal(false)}
                  disabled={!checkInDate || !checkOutDate}
                >
                  <LinearGradient colors={checkInDate && checkOutDate ? ['#facc15', '#f59e0b'] : ['#78350f', '#78350f']} style={styles.calendarValidateBtnGradient}>
                    <Text style={[styles.calendarValidateBtnText, !(checkInDate && checkOutDate) && styles.calendarValidateBtnTextDisabled]}>Valider</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* ======= MODAL RÉSERVATION ======= */}
      <Modal visible={showBookingModal} animationType="slide" transparent onRequestClose={() => setShowBookingModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowBookingModal(false)} />
          <View style={styles.bookingSheet}>
            <LinearGradient colors={['#78350f', '#7f1d1d', '#78350f']} style={styles.bookingSheetGradient}>
              <KongoPattern />
              <View style={styles.bottomSheetHandle}><View style={styles.bottomSheetHandleBar} /></View>
              <TouchableOpacity style={styles.bottomSheetCloseBtn} onPress={() => setShowBookingModal(false)}>
                <XIcon size={24} color="#fbbf24" />
              </TouchableOpacity>

              <ScrollView style={styles.bookingSheetScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.bookingSheetContent}>
                  <Text style={styles.bookingSheetTitle}>Vérifiez et continuez</Text>

                  <View style={styles.bookingSummaryCard}>
                    <Image source={{ uri: images[0] }} style={styles.bookingSummaryImage} />
                    <View style={styles.bookingSummaryInfo}>
                      <Text style={styles.bookingSummaryTitle} numberOfLines={2}>{property.title}</Text>
                      {ratings && ratings.count > 0 && (
                        <View style={styles.bookingSummaryRating}>
                          <StarIcon size={14} color="#facc15" filled />
                          <Text style={styles.bookingSummaryRatingText}>{ratings.averages.overall?.toFixed(1)}</Text>
                          <Text style={styles.bookingSummaryReviews}>({ratings.count})</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {bookingError && (
                    <View style={styles.errorBox}>
                      <Text style={styles.errorBoxText}>{bookingError}</Text>
                    </View>
                  )}

                  {/* Dates */}
                  <View style={styles.bookingSectionItem}>
                    <View style={styles.bookingSectionRow}>
                      <View>
                        <Text style={styles.bookingSectionTitle}>Dates</Text>
                        <Text style={styles.bookingSectionValue}>
                          {checkInDate && checkOutDate ? `${formatLongDate(checkInDate)} - ${formatLongDate(checkOutDate)}` : 'Aucune date'}
                        </Text>
                      </View>
                      <TouchableOpacity style={styles.bookingModifyBtn} onPress={() => { setShowBookingModal(false); setTimeout(() => setShowCalendarModal(true), 300); }}>
                        <Text style={styles.bookingModifyBtnText}>Modifier</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Voyageurs */}
                  <View style={styles.bookingSectionItem}>
                    <View style={styles.bookingSectionRow}>
                      <View>
                        <Text style={styles.bookingSectionTitle}>Voyageurs</Text>
                        <Text style={styles.bookingSectionValue}>{guestsCount} {guestsCount > 1 ? 'adultes' : 'adulte'}</Text>
                      </View>
                      <View style={styles.guestsCounter}>
                        <TouchableOpacity style={[styles.guestsBtn, guestsCount <= 1 && styles.guestsBtnDisabled]} onPress={() => setGuestsCount(Math.max(1, guestsCount - 1))} disabled={guestsCount <= 1}>
                          <Text style={[styles.guestsBtnText, guestsCount <= 1 && styles.guestsBtnTextDisabled]}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.guestsValue}>{guestsCount}</Text>
                        <TouchableOpacity style={[styles.guestsBtn, guestsCount >= property.maxGuests && styles.guestsBtnDisabled]} onPress={() => setGuestsCount(Math.min(property.maxGuests, guestsCount + 1))} disabled={guestsCount >= property.maxGuests}>
                          <Text style={[styles.guestsBtnText, guestsCount >= property.maxGuests && styles.guestsBtnTextDisabled]}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* Prix */}
                  <View style={styles.priceDetailBox}>
                    <View style={styles.priceDetailRow}>
                      <Text style={styles.priceDetailLabel}>{nights} nuit{nights > 1 ? 's' : ''} x {formatPrice(pricePerNight)} FCFA</Text>
                      <Text style={styles.priceDetailValue}>{formatPrice(subtotal)} FCFA</Text>
                    </View>
                    <View style={styles.priceDetailRow}>
                      <Text style={styles.priceDetailLabel}>Frais de service (12%)</Text>
                      <Text style={styles.priceDetailValue}>{formatPrice(serviceFee)} FCFA</Text>
                    </View>
                    <View style={styles.priceDetailDivider} />
                    <View style={styles.priceDetailRow}>
                      <Text style={styles.priceDetailTotal}>Total</Text>
                      <Text style={styles.priceDetailTotalValue}>{formatPrice(totalPrice)} FCFA</Text>
                    </View>
                  </View>

                  {/* Options paiement si 30j */}
                  {isBooking30DaysAhead() && (
                    <View style={styles.paymentOptions}>
                      <Text style={styles.paymentOptionsTitle}>Choisissez quand vous souhaitez payer</Text>
                      <TouchableOpacity style={[styles.paymentOption, paymentOption === 'now' && styles.paymentOptionActive]} onPress={() => setPaymentOption('now')}>
                        <View style={styles.paymentOptionContent}>
                          <Text style={styles.paymentOptionText}>Payer {formatPrice(totalPrice)} FCFA maintenant</Text>
                        </View>
                        <View style={[styles.paymentRadio, paymentOption === 'now' && styles.paymentRadioActive]}>
                          {paymentOption === 'now' && <View style={styles.paymentRadioDot} />}
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.paymentOption, paymentOption === 'later' && styles.paymentOptionActive]} onPress={() => setPaymentOption('later')}>
                        <View style={styles.paymentOptionContent}>
                          <Text style={styles.paymentOptionText}>Réserver maintenant, payer plus tard</Text>
                          <Text style={styles.paymentOptionSubtext}>Paiement requis 14 jours avant l'arrivée</Text>
                        </View>
                        <View style={[styles.paymentRadio, paymentOption === 'later' && styles.paymentRadioActive]}>
                          {paymentOption === 'later' && <View style={styles.paymentRadioDot} />}
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </ScrollView>

              <View style={styles.bookingSheetFooter}>
                <TouchableOpacity style={[styles.bookingConfirmBtn, bookingLoading && { opacity: 0.6 }]} activeOpacity={0.9} onPress={handleBookingConfirm} disabled={bookingLoading}>
                  <LinearGradient colors={['#facc15', '#f59e0b']} style={styles.bookingConfirmBtnGradient}>
                    <Text style={styles.bookingConfirmBtnText}>
                      {bookingLoading ? 'Création...' : paymentOption === 'now' ? 'Continuer vers le paiement' : 'Confirmer la réservation'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* ======= MODAL VIEWER D'IMAGES ======= */}
      <Modal visible={showImageViewer} animationType="slide" presentationStyle="fullScreen">
        <View style={styles.viewerContainer}>
          <View style={[styles.viewerHeader, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity style={styles.viewerHeaderBtn} onPress={() => setShowImageViewer(false)}>
              <ArrowLeftIcon size={20} color="#333" />
            </TouchableOpacity>
            <View style={styles.viewerHeaderRight}>
              <TouchableOpacity style={styles.viewerHeaderBtn}><Share2Icon size={18} color="#333" /></TouchableOpacity>
              <TouchableOpacity style={styles.viewerHeaderBtn} onPress={handleFavorite}>
                <HeartIcon size={18} color={isFavorite ? '#facc15' : '#333'} filled={isFavorite} />
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView style={styles.viewerScroll} contentContainerStyle={styles.viewerScrollContent} showsVerticalScrollIndicator={false}>
            {(() => {
              const elements: React.ReactNode[] = [];
              let idx = 0;
              let blockCount = 0;
              while (idx < images.length) {
                const isBlockA = blockCount % 2 === 0;
                if (isBlockA) {
                  const img1 = images[idx]; const img2 = images[idx + 1]; const img3 = images[idx + 2];
                  if (!img2 && !img3) {
                    elements.push(<View key={`s-${idx}`} style={styles.viewerImageSingle}><Image source={{ uri: img1 }} style={styles.viewerImageFull} /></View>);
                    idx += 1;
                  } else if (!img3) {
                    elements.push(<View key={`p-${idx}`} style={styles.viewerRow}><View style={styles.viewerHalf}><Image source={{ uri: img1 }} style={styles.viewerImageFull} /></View><View style={styles.viewerHalf}><Image source={{ uri: img2 }} style={styles.viewerImageFull} /></View></View>);
                    idx += 2;
                  } else {
                    elements.push(
                      <View key={`bA-${idx}`} style={styles.viewerBlockA}>
                        <View style={styles.viewerBlockALeft}><View style={styles.viewerBlockATopImg}><Image source={{ uri: img1 }} style={styles.viewerImageFull} /></View><View style={styles.viewerBlockABottomImg}><Image source={{ uri: img2 }} style={styles.viewerImageFull} /></View></View>
                        <View style={styles.viewerBlockARight}><Image source={{ uri: img3 }} style={styles.viewerImageFull} /></View>
                      </View>
                    );
                    idx += 3;
                  }
                } else {
                  const img1 = images[idx]; const img2 = images[idx + 1]; const img3 = images[idx + 2];
                  if (img1) { elements.push(<View key={`w-${idx}`} style={styles.viewerImageWide}><Image source={{ uri: img1 }} style={styles.viewerImageFull} /></View>); idx += 1; }
                  if (img2) {
                    elements.push(
                      <View key={`pB-${idx}`} style={styles.viewerRowSmall}>
                        <View style={styles.viewerHalf}><Image source={{ uri: img2 }} style={styles.viewerImageFull} /></View>
                        {img3 && <View style={styles.viewerHalf}><Image source={{ uri: img3 }} style={styles.viewerImageFull} /></View>}
                      </View>
                    );
                    idx += img3 ? 2 : 1;
                  }
                }
                blockCount++;
              }
              return elements;
            })()}
          </ScrollView>
        </View>
      </Modal>

      {/* ======= MODAL DESCRIPTION ======= */}
      <Modal visible={showDescriptionModal} animationType="slide" transparent onRequestClose={() => setShowDescriptionModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowDescriptionModal(false)} />
          <View style={styles.bottomSheet}>
            <LinearGradient colors={['#78350f', '#7f1d1d', '#451a03']} style={styles.bottomSheetGradient}>
              <View style={styles.bottomSheetHandle}><View style={styles.bottomSheetHandleBar} /></View>
              <TouchableOpacity style={styles.bottomSheetCloseBtn} onPress={() => setShowDescriptionModal(false)}>
                <XIcon size={24} color="#fbbf24" />
              </TouchableOpacity>
              <View style={styles.bottomSheetHeader}><Text style={styles.bottomSheetTitle}>À propos de ce logement</Text></View>
              <ScrollView style={styles.bottomSheetScroll} contentContainerStyle={styles.bottomSheetScrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.bottomSheetDescription}>{property.description}</Text>
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* ======= MODAL COMMENTAIRES ======= */}
      <Modal visible={showReviewsModal} animationType="slide" presentationStyle="fullScreen">
        <View style={styles.fullScreenModal}>
          <LinearGradient colors={['#78350f', '#92400e', '#78350f', '#7f1d1d', '#78350f']} locations={[0, 0.25, 0.5, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
          <KongoPattern />
          <View style={[styles.modalHeader, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity style={styles.modalHeaderBtn} onPress={() => setShowReviewsModal(false)}><ArrowLeftIcon size={20} color="#fbbf24" /></TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Commentaires</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.reviewsModalHeader}>
              <StarIcon size={24} color="#facc15" filled />
              <Text style={styles.reviewsModalRating}>{ratings?.averages.overall?.toFixed(1) ?? 'N/A'}</Text>
              <Text style={styles.reviewsModalDot}>·</Text>
              <Text style={styles.reviewsModalCount}>{ratings?.count ?? 0} commentaires</Text>
            </View>
            {reviews.map((review) => (
              <View key={review.id} style={styles.reviewModalCard}>
                <View style={styles.reviewCardHeader}>
                  {review.reviewer?.avatarUrl ? (
                    <Image source={{ uri: review.reviewer.avatarUrl }} style={styles.reviewModalAvatar} />
                  ) : (
                    <View style={[styles.reviewModalAvatar, styles.reviewAvatarFallback]}>
                      <Text style={styles.reviewAvatarInitials}>{review.reviewer?.firstName?.[0]}{review.reviewer?.lastName?.[0]}</Text>
                    </View>
                  )}
                  <View style={styles.reviewAuthorInfo}>
                    <Text style={styles.reviewModalAuthor}>{review.reviewer ? `${review.reviewer.firstName} ${review.reviewer.lastName}` : 'Invité'}</Text>
                    <Text style={styles.reviewModalMemberSince}>{new Date(review.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</Text>
                  </View>
                </View>
                <View style={styles.reviewStars}>
                  {[...Array(5)].map((_, i) => <StarIcon key={i} size={14} color={i < (review.overallRating ?? 0) ? '#facc15' : '#78350f'} filled={i < (review.overallRating ?? 0)} />)}
                  <Text style={styles.reviewDate}>· {formatRelativeDate(review.createdAt)}</Text>
                </View>
                <Text style={styles.reviewModalComment}>{review.comment}</Text>
              </View>
            ))}
            {!allReviewsLoaded && (ratings?.count ?? 0) > reviews.length && (
              <TouchableOpacity
                style={[styles.showAllReviewsBtn, loadingMoreReviews && { opacity: 0.6 }]}
                onPress={loadMoreReviews}
                disabled={loadingMoreReviews}
                activeOpacity={0.8}
              >
                {loadingMoreReviews ? (
                  <ActivityIndicator size="small" color="#fbbf24" />
                ) : (
                  <Text style={styles.showAllReviewsBtnText}>
                    Charger plus de commentaires ({reviews.length}/{ratings?.count})
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* ======= MODAL ÉQUIPEMENTS ======= */}
      <Modal visible={showAmenitiesModal} animationType="slide" presentationStyle="fullScreen">
        <View style={styles.fullScreenModal}>
          <LinearGradient colors={['#78350f', '#92400e', '#78350f', '#7f1d1d', '#78350f']} locations={[0, 0.25, 0.5, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
          <KongoPattern />
          <View style={[styles.modalHeader, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity style={styles.modalHeaderBtn} onPress={() => setShowAmenitiesModal(false)}><ArrowLeftIcon size={20} color="#fbbf24" /></TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Équipements</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.amenitiesModalSubtitle}>Ce logement propose {property.equipments?.length ?? 0} équipements</Text>
            {(property.equipments || []).map((eq: EquipmentInfo) => {
              const IconComp = getEquipmentIcon(eq.name);
              const isAvailable = eq.available !== false;
              return (
                <View key={eq.id} style={styles.amenityModalItem}>
                  <View style={styles.amenityModalIconBox}><IconComp size={24} color={isAvailable ? '#fbbf24' : '#78350f'} /></View>
                  <Text style={[styles.amenityModalName, !isAvailable && styles.amenityModalNameDisabled]}>{eq.name}</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </Modal>

      {/* ======= MODAL HÔTE ======= */}
      <Modal visible={showHostModal} animationType="slide" transparent onRequestClose={() => setShowHostModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowHostModal(false)} />
          <View style={styles.hostModalSheet}>
            <LinearGradient colors={['#78350f', '#7f1d1d', '#78350f']} style={styles.hostModalGradient}>
              <KongoPattern />
              <View style={styles.hostModalHeader}>
                <View style={{ width: 40 }} />
                <View style={styles.bottomSheetHandleBar} />
                <TouchableOpacity style={styles.hostModalCloseBtn} onPress={() => setShowHostModal(false)}>
                  <XIcon size={20} color="#fbbf24" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.hostModalScroll} contentContainerStyle={styles.hostModalScrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.hostProfileCard}>
                  <View style={styles.hostProfileLeft}>
                    <View style={styles.hostProfileAvatarContainer}>
                      {property.host.avatarUrl ? (
                        <Image source={{ uri: property.host.avatarUrl }} style={styles.hostProfileAvatar} />
                      ) : (
                        <View style={[styles.hostProfileAvatar, styles.hostAvatarFallback]}>
                          <Text style={[styles.hostAvatarInitials, { fontSize: 28 }]}>{property.host.firstName?.[0]}{property.host.lastName?.[0]}</Text>
                        </View>
                      )}
                      <View style={styles.hostProfileVerifiedBadge}>
                        <LinearGradient colors={['#facc15', '#f59e0b']} style={styles.hostVerifiedBadgeGradient}>
                          <CheckCircleIcon size={16} color="#78350f" />
                        </LinearGradient>
                      </View>
                    </View>
                    <Text style={styles.hostProfileName}>{property.host.firstName}</Text>
                    <Text style={styles.hostProfileRole}>Hôte</Text>
                  </View>
                  <View style={styles.hostProfileStats}>
                    <View style={styles.hostStatItem}>
                      <Text style={styles.hostStatValue}>{ratings?.count ?? 0}</Text>
                      <Text style={styles.hostStatLabel}>Commentaires</Text>
                    </View>
                    <View style={styles.hostStatDivider} />
                    <View style={styles.hostStatItem}>
                      <View style={styles.hostStatValueRow}>
                        <Text style={styles.hostStatValue}>{ratings?.averages.overall?.toFixed(1) ?? '-'}</Text>
                        <StarIcon size={14} color="#facc15" filled />
                      </View>
                      <Text style={styles.hostStatLabel}>Note</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.hostInfoSection}>
                  <View style={styles.hostInfoItem}>
                    <ClockIcon size={20} color="#fbbf24" />
                    <View style={styles.hostInfoContent}>
                      <Text style={styles.hostInfoTitle}>Taux de réponse : {property.host.responseRate ?? 98}%</Text>
                      <Text style={styles.hostInfoSubtitle}>Répond généralement en {property.host.responseTime ?? "moins d'une heure"}</Text>
                    </View>
                  </View>
                  <View style={styles.hostInfoItem}>
                    <GlobeIcon size={20} color="#fbbf24" />
                    <View style={styles.hostInfoContent}>
                      <Text style={styles.hostInfoTitle}>Langues</Text>
                      <Text style={styles.hostInfoSubtitle}>{Array.isArray(property.host.languages) ? property.host.languages.join(', ') : 'Français, Lingala'}</Text>
                    </View>
                  </View>
                </View>

                {/* À propos */}
                {property.host.about ? (
                  <View style={styles.hostAboutSection}>
                    <Text style={styles.hostAboutTitle}>À propos de {property.host.firstName}</Text>
                    <Text style={styles.hostAboutText}>{property.host.about}</Text>
                  </View>
                ) : null}

                {/* Annonces de l'hôte */}
                {Array.isArray(property.host.listings) && property.host.listings.length > 0 && (
                  <View style={styles.hostListingsSection}>
                    <Text style={styles.hostListingsTitle}>Annonces publiées par {property.host.firstName}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hostListingsScroll}>
                      {property.host.listings.map((listing: any) => (
                        <TouchableOpacity key={listing.id} style={styles.hostListingCard} activeOpacity={0.9}>
                          {listing.image ? <Image source={{ uri: listing.image }} style={styles.hostListingImage} /> : <View style={[styles.hostListingImage, { backgroundColor: 'rgba(120,53,15,0.5)' }]} />}
                          <Text style={styles.hostListingTitle} numberOfLines={2}>{listing.title}</Text>
                          <View style={styles.hostListingRating}>
                            <StarIcon size={12} color="#facc15" filled />
                            <Text style={styles.hostListingRatingText}>{listing.rating?.toFixed(2) ?? '-'}</Text>
                            <Text style={styles.hostListingReviews}>· {listing.reviewsCount ?? 0} avis</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <TouchableOpacity style={styles.contactHostBtn} activeOpacity={0.9}>
                  <MessageCircleIcon size={20} color="#78350f" />
                  <Text style={styles.contactHostBtnText}>Contacter l'hôte</Text>
                </TouchableOpacity>
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* ======= MODAL SIGNALEMENT ======= */}
      <Modal visible={showReportModal} animationType="slide" transparent onRequestClose={() => { resetReport(); setShowReportModal(false); }}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => { resetReport(); setShowReportModal(false); }} />
          <View style={styles.reportSheetFull}>
            <LinearGradient colors={['#78350f', '#7f1d1d', '#78350f']} style={styles.reportSheetGradient}>
              <KongoPattern />
              <View style={styles.bottomSheetHandle}><View style={styles.bottomSheetHandleBar} /></View>
              {(reportStep === 'subreason' || reportStep === 'details' || reportStep === 'info') ? (
                <TouchableOpacity style={styles.bottomSheetBackBtn} onPress={handleReportBack}><ArrowLeftIcon size={24} color="#fbbf24" /></TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.bottomSheetCloseBtn} onPress={() => { resetReport(); setShowReportModal(false); }}><XIcon size={24} color="#fbbf24" /></TouchableOpacity>
              )}

              <ScrollView style={styles.reportScrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.reportContent}>
                  {reportStep === 'submitted' && (
                    <View style={styles.reportSubmitted}>
                      <View style={styles.reportSuccessIcon}><CheckIcon size={40} color="#22c55e" /></View>
                      <Text style={styles.reportSubmittedTitle}>Merci pour votre signalement</Text>
                      <Text style={styles.reportSubmittedText}>Nous avons bien reçu votre signalement et nous allons l'examiner dans les plus brefs délais.</Text>
                      <TouchableOpacity style={styles.reportCloseBtn} onPress={() => { resetReport(); setShowReportModal(false); }} activeOpacity={0.9}>
                        <LinearGradient colors={['#facc15', '#f59e0b']} style={styles.reportCloseBtnGradient}><Text style={styles.reportCloseBtnText}>Fermer</Text></LinearGradient>
                      </TouchableOpacity>
                    </View>
                  )}
                  {reportStep === 'reason' && (
                    <>
                      <Text style={styles.reportTitle}>Pourquoi signalez-vous cette annonce ?</Text>
                      <Text style={styles.reportSubtitle}>Ces informations ne seront pas communiquées à l'hôte.</Text>
                      <View style={styles.reportReasons}>
                        {reportReasons.map((reason, index) => (
                          <TouchableOpacity key={reason.id} style={[styles.reportReasonItem, index < reportReasons.length - 1 && styles.reportReasonBorder]} onPress={() => handleReportReasonSelect(reason.id)}>
                            <Text style={styles.reportReasonText}>{reason.label}</Text>
                            <ChevronRightIcon size={20} color="#92400e" />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </>
                  )}
                  {reportStep === 'subreason' && (
                    <>
                      <Text style={styles.reportTitle}>
                        {selectedReportReason === 'scam' ? "Pourquoi pensez-vous qu'il s'agit d'une arnaque ?" : selectedReportReason === 'offensive' ? "Pourquoi la trouvez-vous offensante ?" : "Pourquoi signalez-vous cette annonce ?"}
                      </Text>
                      <View style={styles.reportReasons}>
                        {getSubReasons().map((subReason: any, index: number) => (
                          <TouchableOpacity key={subReason.id} style={[styles.reportReasonItem, index < getSubReasons().length - 1 && styles.reportReasonBorder]} onPress={() => handleSubReasonSelect(subReason.id)}>
                            <View style={styles.reportSubReasonContent}>
                              <Text style={styles.reportReasonText}>{subReason.label}</Text>
                              {subReason.example ? <Text style={styles.reportSubReasonExample}>{subReason.example}</Text> : null}
                            </View>
                            <View style={[styles.reportRadio, selectedSubReason === subReason.id && styles.reportRadioActive]}>
                              {selectedSubReason === subReason.id && <View style={styles.reportRadioDot} />}
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </>
                  )}
                  {reportStep === 'details' && (
                    <>
                      <Text style={styles.reportTitle}>Décrivez le problème</Text>
                      <Text style={styles.reportSubtitle}>Donnez-nous plus de détails pour nous aider à comprendre le problème.</Text>
                      <TextInput style={styles.reportTextarea} placeholder="Décrivez le problème en détail..." placeholderTextColor="rgba(245, 158, 11, 0.5)" multiline numberOfLines={6} textAlignVertical="top" value={reportDescription} onChangeText={setReportDescription} />
                      <TouchableOpacity style={[styles.reportSubmitBtn, !reportDescription.trim() && styles.reportSubmitBtnDisabled]} onPress={() => reportDescription.trim() && setReportStep('submitted')} disabled={!reportDescription.trim()} activeOpacity={0.9}>
                        <LinearGradient colors={reportDescription.trim() ? ['#facc15', '#f59e0b'] : ['#78350f', '#78350f']} style={styles.reportSubmitBtnGradient}>
                          <Text style={[styles.reportSubmitBtnText, !reportDescription.trim() && styles.reportSubmitBtnTextDisabled]}>Envoyer le signalement</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </>
                  )}
                  {reportStep === 'info' && (
                    <>
                      <Text style={styles.reportTitle}>Contenu illégal</Text>
                      <Text style={styles.reportInfoText}>Si vous pensez que cette annonce contient du contenu illégal, nous vous encourageons à le signaler aux autorités compétentes de votre pays.</Text>
                      <Text style={styles.reportInfoText}>VANDA examine tous les signalements et prend les mesures appropriées conformément à nos conditions d'utilisation.</Text>
                      <TouchableOpacity style={styles.reportSubmitBtn} onPress={() => setReportStep('submitted')} activeOpacity={0.9}>
                        <LinearGradient colors={['#facc15', '#f59e0b']} style={styles.reportSubmitBtnGradient}><Text style={styles.reportSubmitBtnText}>J'ai compris</Text></LinearGradient>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* ======= MODAL PAIEMENT MOBILE MONEY ======= */}
      <Modal visible={showPaymentModal} animationType="slide" transparent onRequestClose={closePaymentModal}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => paymentStatus === 'idle' && closePaymentModal()} />
          <View style={styles.paymentSheet}>
            <LinearGradient colors={['#78350f', '#7f1d1d', '#78350f']} style={styles.paymentSheetGradient}>
              <KongoPattern />
              <View style={styles.bottomSheetHandle}><View style={styles.bottomSheetHandleBar} /></View>
              {paymentStatus === 'idle' && (
                <TouchableOpacity style={styles.bottomSheetCloseBtn} onPress={closePaymentModal}><XIcon size={24} color="#fbbf24" /></TouchableOpacity>
              )}

              <ScrollView style={styles.paymentContent} showsVerticalScrollIndicator={false}>
                {(paymentStatus === 'sending' || paymentStatus === 'waiting' || paymentStatus === 'verifying') && (
                  <View style={styles.paymentProcessing}>
                    <ActivityIndicator size="large" color="#fbbf24" />
                    <Text style={styles.paymentProcessingTitle}>
                      {paymentStatus === 'sending' && 'Envoi de la demande...'}
                      {paymentStatus === 'waiting' && 'En attente de validation...'}
                      {paymentStatus === 'verifying' && 'Vérification du paiement...'}
                    </Text>
                    <Text style={styles.paymentProcessingText}>
                      {paymentStatus === 'sending' && 'Connexion au service Mobile Money'}
                      {paymentStatus === 'waiting' && 'Veuillez confirmer sur votre téléphone'}
                      {paymentStatus === 'verifying' && 'Confirmation en cours...'}
                    </Text>
                    {paymentStatus === 'waiting' && <Text style={styles.paymentProcessingHint}>📱 Tapez votre code PIN sur votre téléphone</Text>}
                  </View>
                )}

                {paymentStatus === 'success' && (
                  <View style={styles.paymentSuccess}>
                    <View style={styles.paymentSuccessIcon}><CheckIcon size={56} color="#ffffff" /></View>
                    <Text style={styles.paymentSuccessTitle}>Paiement réussi !</Text>
                    <Text style={styles.paymentSuccessText}>Votre réservation est confirmée</Text>
                    <View style={styles.paymentReceipt}>
                      <View style={styles.paymentReceiptRow}><Text style={styles.paymentReceiptLabel}>Montant payé</Text><Text style={styles.paymentReceiptValue}>{formatPrice(finalTotal)} FCFA</Text></View>
                      <View style={styles.paymentReceiptRow}><Text style={styles.paymentReceiptLabel}>Opérateur</Text><Text style={styles.paymentReceiptValue}>{selectedPaymentMethod === 'mtn' ? 'MTN Mobile Money' : 'Airtel Money'}</Text></View>
                      <View style={styles.paymentReceiptRow}><Text style={styles.paymentReceiptLabel}>Numéro</Text><Text style={styles.paymentReceiptValue}>+242 {phoneNumber}</Text></View>
                    </View>
                    <TouchableOpacity style={styles.paymentDoneBtn} onPress={closePaymentModal} activeOpacity={0.9}>
                      <LinearGradient colors={['#facc15', '#f59e0b']} style={styles.paymentDoneBtnGradient}><Text style={styles.paymentDoneBtnText}>Voir ma réservation</Text></LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}

                {paymentStatus === 'error' && (
                  <View style={styles.paymentError}>
                    <View style={styles.paymentErrorIcon}><XIcon size={56} color="#ffffff" /></View>
                    <Text style={styles.paymentErrorTitle}>Échec du paiement</Text>
                    <Text style={styles.paymentErrorText}>{bookingError || 'Une erreur est survenue. Veuillez réessayer.'}</Text>
                    <TouchableOpacity style={styles.paymentRetryBtn} onPress={() => { setPaymentStatus('idle'); setBookingError(null); }} activeOpacity={0.9}>
                      <LinearGradient colors={['#facc15', '#f59e0b']} style={styles.paymentRetryBtnGradient}><Text style={styles.paymentRetryBtnText}>Réessayer</Text></LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.paymentCancelBtn} onPress={closePaymentModal}>
                      <Text style={styles.paymentCancelBtnText}>Annuler</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {paymentStatus === 'idle' && (
                  <View>
                    <Text style={styles.paymentTitle}>Paiement Mobile Money</Text>
                    <View style={styles.paymentSummary}>
                      <Text style={styles.paymentSummaryLabel}>Récapitulatif</Text>
                      <View style={styles.paymentSummaryRow}><Text style={styles.paymentSummaryText}>{nights} nuits</Text><Text style={styles.paymentSummaryText}>{formatPrice(subtotal)} FCFA</Text></View>
                      <View style={styles.paymentSummaryRow}><Text style={styles.paymentSummaryText}>Frais de service</Text><Text style={styles.paymentSummaryText}>{formatPrice(serviceFee)} FCFA</Text></View>
                      <View style={styles.paymentSummaryDivider} />
                      <View style={styles.paymentSummaryRow}><Text style={styles.paymentSummaryTotal}>Total</Text><Text style={styles.paymentSummaryTotalValue}>{formatPrice(finalTotal)} FCFA</Text></View>
                    </View>

                    <Text style={styles.paymentMethodLabel}>Choisissez votre opérateur</Text>
                    <View style={styles.paymentMethods}>
                      <TouchableOpacity style={[styles.paymentMethodCard, selectedPaymentMethod === 'mtn' && styles.paymentMethodCardActive]} onPress={() => setSelectedPaymentMethod('mtn')}>
                        <MTNMoneyIcon size={48} />
                        <Text style={styles.paymentMethodName}>MTN Mobile Money</Text>
                        {selectedPaymentMethod === 'mtn' && <View style={[styles.paymentMethodCheck, { backgroundColor: '#ffcc00' }]}><CheckIcon size={14} color="#000" /></View>}
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.paymentMethodCard, selectedPaymentMethod === 'airtel' && styles.paymentMethodCardActive]} onPress={() => setSelectedPaymentMethod('airtel')}>
                        <AirtelMoneyIcon size={48} />
                        <Text style={styles.paymentMethodName}>Airtel Money</Text>
                        {selectedPaymentMethod === 'airtel' && <View style={[styles.paymentMethodCheck, { backgroundColor: '#ff0000' }]}><CheckIcon size={14} color="#fff" /></View>}
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.paymentPhoneLabel}>Numéro de téléphone</Text>
                    <View style={styles.paymentPhoneInput}>
                      <Text style={styles.paymentPhonePrefix}>+242</Text>
                      <TextInput
                        style={styles.paymentPhoneField}
                        placeholder={selectedPaymentMethod === 'mtn' ? '06 XXX XX XX' : '05 XXX XX XX'}
                        placeholderTextColor="rgba(245, 158, 11, 0.5)"
                        value={phoneNumber}
                        onChangeText={(text) => setPhoneNumber(text.replace(/\D/g, '').slice(0, 9))}
                        keyboardType="phone-pad"
                      />
                    </View>
                  </View>
                )}
              </ScrollView>

              {paymentStatus === 'idle' && (
                <View style={styles.paymentFooter}>
                  <TouchableOpacity
                    style={[styles.paymentPayBtn, (!selectedPaymentMethod || phoneNumber.length < 9) && styles.paymentPayBtnDisabled]}
                    onPress={handlePay}
                    disabled={!selectedPaymentMethod || phoneNumber.length < 9 || submittingPayment}
                    activeOpacity={0.9}
                  >
                    <LinearGradient colors={(selectedPaymentMethod && phoneNumber.length >= 9) ? ['#facc15', '#f59e0b'] : ['#78350f', '#78350f']} style={styles.paymentPayBtnGradient}>
                      <Text style={[styles.paymentPayBtnText, (!selectedPaymentMethod || phoneNumber.length < 9) && styles.paymentPayBtnTextDisabled]}>Payer {formatPrice(finalTotal)} FCFA</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* ======= MODAL CONDITIONS D'ANNULATION ======= */}
      <Modal visible={showCancellationModal} animationType="slide" transparent onRequestClose={() => setShowCancellationModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowCancellationModal(false)} />
          <View style={styles.cancellationSheet}>
            <LinearGradient colors={['#78350f', '#7f1d1d', '#78350f']} style={styles.cancellationSheetGradient}>
              <KongoPattern />
              <View style={styles.bottomSheetHandle}><View style={styles.bottomSheetHandleBar} /></View>
              <TouchableOpacity style={styles.bottomSheetCloseBtn} onPress={() => setShowCancellationModal(false)}><XIcon size={24} color="#fbbf24" /></TouchableOpacity>
              <ScrollView style={styles.cancellationContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.cancellationModalTitle}>Conditions d'annulation</Text>
                {isFreeCancellationAvailable() && checkInDate && (
                  <View style={styles.cancellationFreeBox}>
                    <View style={styles.cancellationFreeHeader}><CheckCircleIcon size={20} color="#22c55e" /><Text style={styles.cancellationFreeTitle}>Annulation gratuite</Text></View>
                    <Text style={styles.cancellationFreeText}>Annulez avant le {formatLongDate(getFreeCancellationDate()!)} pour recevoir un remboursement intégral.</Text>
                  </View>
                )}
                <View style={styles.cancellationTimeline}>
                  <View style={styles.cancellationTimelineItem}><View style={styles.cancellationTimelineDot} /><View style={styles.cancellationTimelineContent}><Text style={styles.cancellationTimelineTitle}>Annulation gratuite pendant 48h</Text><Text style={styles.cancellationTimelineText}>Après la réservation, vous avez 48h pour annuler et recevoir un remboursement intégral.</Text></View></View>
                  <View style={styles.cancellationTimelineLine} />
                  <View style={styles.cancellationTimelineItem}><View style={styles.cancellationTimelineDot} /><View style={styles.cancellationTimelineContent}><Text style={styles.cancellationTimelineTitle}>Jusqu'à 7 jours avant l'arrivée</Text><Text style={styles.cancellationTimelineText}>Remboursement partiel : 50% du montant total sera remboursé.</Text></View></View>
                  <View style={styles.cancellationTimelineLine} />
                  <View style={styles.cancellationTimelineItem}><View style={[styles.cancellationTimelineDot, styles.cancellationTimelineDotRed]} /><View style={styles.cancellationTimelineContent}><Text style={styles.cancellationTimelineTitle}>Moins de 7 jours avant l'arrivée</Text><Text style={styles.cancellationTimelineText}>Aucun remboursement possible.</Text></View></View>
                </View>
                <TouchableOpacity style={styles.cancellationCloseBtn} onPress={() => setShowCancellationModal(false)} activeOpacity={0.9}>
                  <LinearGradient colors={['#facc15', '#f59e0b']} style={styles.cancellationCloseBtnGradient}><Text style={styles.cancellationCloseBtnText}>J'ai compris</Text></LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* ======= MODAL DÉTAIL DU PRIX ======= */}
      <Modal visible={showPriceDetailModal} animationType="slide" transparent onRequestClose={() => setShowPriceDetailModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowPriceDetailModal(false)} />
          <View style={styles.priceDetailSheet}>
            <LinearGradient colors={['#78350f', '#7f1d1d', '#78350f']} style={styles.priceDetailSheetGradient}>
              <KongoPattern />
              <View style={styles.bottomSheetHandle}><View style={styles.bottomSheetHandleBar} /></View>
              <TouchableOpacity style={styles.bottomSheetCloseBtn} onPress={() => setShowPriceDetailModal(false)}><XIcon size={24} color="#fbbf24" /></TouchableOpacity>
              <View style={styles.priceDetailSheetContent}>
                <Text style={styles.priceDetailSheetTitle}>Détail du prix</Text>
                <View style={styles.priceDetailRow}><Text style={styles.priceDetailLabel}>{nights} nuit{nights > 1 ? 's' : ''} x {formatPrice(pricePerNight)} FCFA</Text><Text style={styles.priceDetailValue}>{formatPrice(subtotal)} FCFA</Text></View>
                <View style={styles.priceDetailRow}><Text style={styles.priceDetailLabel}>Frais de service</Text><Text style={styles.priceDetailValue}>{formatPrice(serviceFee)} FCFA</Text></View>
                <View style={styles.priceDetailDivider} />
                <View style={styles.priceDetailRow}><Text style={styles.priceDetailTotalLabel}>Total</Text><Text style={styles.priceDetailTotalValue2}>{formatPrice(finalTotal)} FCFA</Text></View>
                <View style={styles.priceDetailDivider} />
                <View style={styles.priceDetailDates}><Text style={styles.priceDetailDatesTitle}>Dates</Text><Text style={styles.priceDetailDatesValue}>{checkInDate && checkOutDate ? `${formatLongDate(checkInDate)} - ${formatLongDate(checkOutDate)}` : 'Aucune date sélectionnée'}</Text></View>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* ======= MODAL PAIEMENT DIFFÉRÉ ======= */}
      <Modal visible={showDeferredPaymentModal} animationType="slide" transparent onRequestClose={() => setShowDeferredPaymentModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowDeferredPaymentModal(false)} />
          <View style={styles.deferredSheet}>
            <LinearGradient colors={['#78350f', '#7f1d1d', '#78350f']} style={styles.deferredSheetGradient}>
              <KongoPattern />
              <View style={styles.bottomSheetHandle}><View style={styles.bottomSheetHandleBar} /></View>
              <TouchableOpacity style={styles.bottomSheetCloseBtn} onPress={() => setShowDeferredPaymentModal(false)}><XIcon size={24} color="#fbbf24" /></TouchableOpacity>
              <View style={styles.deferredContent}>
                <View style={styles.deferredSuccessIcon}><CheckIcon size={40} color="#22c55e" /></View>
                <Text style={styles.deferredTitle}>Réservation confirmée !</Text>
                <Text style={styles.deferredText}>Votre réservation a bien été enregistrée. Vous avez choisi de payer plus tard.</Text>
                <View style={styles.deferredDeadlineBox}>
                  <View style={styles.deferredDeadlineHeader}>
                    <View style={styles.deferredDeadlineIcon}><CalendarIcon size={20} color="#fbbf24" /></View>
                    <View><Text style={styles.deferredDeadlineLabel}>Date limite de paiement</Text><Text style={styles.deferredDeadlineDate}>{getPaymentDeadlineDate() ? formatLongDate(getPaymentDeadlineDate()!) : '—'}</Text></View>
                  </View>
                  <Text style={styles.deferredDeadlineInfo}>Vous devez effectuer le paiement de <Text style={styles.deferredDeadlineAmount}>{formatPrice(finalTotal)} FCFA</Text> avant cette date pour confirmer définitivement votre séjour.</Text>
                </View>
                <View style={styles.deferredReminderBox}><Text style={styles.deferredReminderText}>💡 Un rappel vous sera envoyé quelques jours avant la date limite.</Text></View>
                <TouchableOpacity style={styles.deferredCloseBtn} onPress={() => setShowDeferredPaymentModal(false)} activeOpacity={0.9}>
                  <LinearGradient colors={['#facc15', '#f59e0b']} style={styles.deferredCloseBtnGradient}><Text style={styles.deferredCloseBtnText}>Compris</Text></LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#78350f' },
  
  // Pattern & Particules
  patternContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  patternRow: { flexDirection: 'row' },
  particlesContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  particle: { position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: '#fbbf24' },

  // Main scroll
  mainScroll: { flex: 1 },

  // Carousel
  carouselContainer: { position: 'relative', height: SCREEN_HEIGHT * 0.55, minHeight: 400 },
  carouselImage: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.55, minHeight: 400, resizeMode: 'cover' },
  carouselTopGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
  carouselHeader: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 },
  headerBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(120, 53, 15, 0.8)', borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.5)', alignItems: 'center', justifyContent: 'center' },
  headerRight: { flexDirection: 'row', gap: 8 },
  carouselIndicator: { position: 'absolute', bottom: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  carouselIndicatorText: { color: '#ffffff', fontSize: 12, fontWeight: '500' },

  // Content
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#fcd34d', marginBottom: 8 },
  subtitle: { fontSize: 15, color: 'rgba(252, 211, 77, 0.8)', marginBottom: 12 },
  capacityRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4, marginBottom: 16 },
  capacityItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  capacityText: { fontSize: 13, color: 'rgba(252, 211, 77, 0.7)' },
  capacityDot: { color: '#92400e', fontSize: 13 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(180, 83, 9, 0.3)' },
  ratingValue: { color: '#ffffff', fontSize: 16, fontWeight: '600', marginLeft: 4 },
  ratingDot: { color: '#92400e', marginHorizontal: 8 },
  reviewsLink: { color: '#fcd34d', textDecorationLine: 'underline', fontSize: 14 },
  separator: { height: 1, backgroundColor: 'rgba(180, 83, 9, 0.3)', marginVertical: 24 },

  // Highlights
  highlightsSection: { gap: 20, marginBottom: 8 },
  highlightItem: { flexDirection: 'row', alignItems: 'flex-start' },
  highlightIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(120, 53, 15, 0.5)', borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.3)', alignItems: 'center', justifyContent: 'center' },
  highlightContent: { marginLeft: 16, flex: 1 },
  highlightTitle: { color: '#ffffff', fontSize: 15, fontWeight: '600', marginBottom: 2 },
  highlightDescription: { color: 'rgba(252, 211, 77, 0.7)', fontSize: 13, lineHeight: 18 },

  // Description
  descriptionSection: { marginBottom: 8 },
  descriptionText: { color: 'rgba(252, 211, 77, 0.8)', fontSize: 15, lineHeight: 22 },
  readMoreButton: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  readMoreText: { color: '#fbbf24', fontSize: 15, fontWeight: '600', textDecorationLine: 'underline', marginRight: 4 },

  // Placeholder
  placeholder: { padding: 24, backgroundColor: 'rgba(120, 53, 15, 0.3)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.3)' },
  placeholderText: { color: '#92400e', fontSize: 14, textAlign: 'center', lineHeight: 24 },

  // Booking bar
  bookingBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(69, 26, 3, 0.98)', borderTopWidth: 1, borderTopColor: 'rgba(180, 83, 9, 0.3)', paddingTop: 12, paddingHorizontal: 16 },
  bookingBarContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bookingPrice: { fontSize: 16 },
  bookingPriceBold: { color: '#ffffff', fontWeight: '700' },
  bookingPriceUnit: { color: '#fcd34d' },
  bookingDates: { color: '#fbbf24', textDecorationLine: 'underline', fontSize: 13, marginTop: 2 },
  bookingButton: { borderRadius: 12, overflow: 'hidden' },
  bookingButtonGradient: { paddingVertical: 14, paddingHorizontal: 24 },
  bookingButtonText: { color: '#78350f', fontSize: 16, fontWeight: '700' },

  // Image Viewer
  viewerContainer: { flex: 1, backgroundColor: '#ffffff' },
  viewerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  viewerHeaderBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  viewerHeaderRight: { flexDirection: 'row', gap: 16 },
  viewerScroll: { flex: 1 },
  viewerScrollContent: { paddingBottom: 40 },
  viewerImageFull: { width: '100%', height: '100%', resizeMode: 'cover' },
  viewerImageSingle: { padding: 2, height: 210 },
  viewerImageWide: { padding: 2, height: 210 },
  viewerRow: { flexDirection: 'row', height: 180 },
  viewerRowSmall: { flexDirection: 'row', height: 160 },
  viewerHalf: { flex: 1, padding: 2 },
  viewerBlockA: { flexDirection: 'row', height: 220 },
  viewerBlockALeft: { flex: 1 },
  viewerBlockATopImg: { flex: 1, padding: 2 },
  viewerBlockABottomImg: { flex: 1, padding: 2 },
  viewerBlockARight: { flex: 1, padding: 2 },

  // Modal Description (Bottom Sheet)
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)' },
  bottomSheet: { maxHeight: SCREEN_HEIGHT * 0.85, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  bottomSheetGradient: { flex: 1, minHeight: 300 },
  bottomSheetHandle: { alignItems: 'center', paddingVertical: 16 },
  bottomSheetHandleBar: { width: 48, height: 6, borderRadius: 3, backgroundColor: 'rgba(146, 64, 14, 0.5)' },
  bottomSheetCloseBtn: { position: 'absolute', top: 16, right: 16, zIndex: 10 },
  bottomSheetHeader: { paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(180, 83, 9, 0.3)' },
  bottomSheetTitle: { fontSize: 20, fontWeight: '700', color: '#fcd34d' },
  bottomSheetScroll: { flex: 1 },
  bottomSheetScrollContent: { padding: 16, paddingBottom: 40 },
  bottomSheetDescription: { color: 'rgba(252, 211, 77, 0.9)', fontSize: 15, lineHeight: 24 },

  // Section Hôte
  hostSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  hostInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  hostAvatarContainer: { position: 'relative' },
  hostAvatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: 'rgba(245, 158, 11, 0.5)' },
  hostVerifiedBadge: { position: 'absolute', bottom: -4, right: -4, width: 24, height: 24, borderRadius: 12, overflow: 'hidden' },
  hostVerifiedBadgeGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hostDetails: { marginLeft: 16, flex: 1 },
  hostName: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  hostExperience: { color: 'rgba(251, 191, 36, 0.7)', fontSize: 13, marginTop: 2 },

  // Section Équipements
  sectionTitle: { color: '#ffffff', fontSize: 20, fontWeight: '700', marginBottom: 16 },
  amenitiesSection: { marginBottom: 8 },
  amenitiesList: { gap: 16 },
  amenityItem: { flexDirection: 'row', alignItems: 'center' },
  amenityName: { color: 'rgba(252, 211, 77, 0.9)', fontSize: 15, marginLeft: 16 },
  amenityNameDisabled: { color: '#92400e', textDecorationLine: 'line-through' },
  showAllAmenitiesBtn: { marginTop: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.5)', alignItems: 'center' },
  showAllAmenitiesBtnText: { color: '#fbbf24', fontSize: 15, fontWeight: '600' },

  // Modal Équipements (Full Screen)
  fullScreenModal: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(180, 83, 9, 0.3)' },
  modalHeaderBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(120, 53, 15, 0.5)', borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.3)', alignItems: 'center', justifyContent: 'center' },
  modalHeaderTitle: { color: '#fcd34d', fontSize: 20, fontWeight: '700' },
  modalScroll: { flex: 1 },
  modalScrollContent: { padding: 16, paddingBottom: 40 },
  amenitiesModalSubtitle: { color: 'rgba(252, 211, 77, 0.7)', fontSize: 14, marginBottom: 24 },
  amenityModalItem: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(120, 53, 15, 0.3)', borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.3)', borderRadius: 12, marginBottom: 12 },
  amenityModalIconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(120, 53, 15, 0.5)', borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.3)', alignItems: 'center', justifyContent: 'center' },
  amenityModalName: { color: 'rgba(252, 211, 77, 0.9)', fontSize: 16, marginLeft: 16, flex: 1 },
  amenityModalNameDisabled: { color: '#92400e', textDecorationLine: 'line-through' },
  amenityUnavailable: { color: '#92400e', fontSize: 12 },

  // Modal Hôte
  hostModalSheet: { height: SCREEN_HEIGHT * 0.92, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  hostModalGradient: { flex: 1 },
  hostModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  hostModalCloseBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(120, 53, 15, 0.5)', borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.3)', alignItems: 'center', justifyContent: 'center' },
  hostModalScroll: { flex: 1 },
  hostModalScrollContent: { padding: 16, paddingBottom: 40 },
  
  // Carte profil hôte
  hostProfileCard: { backgroundColor: 'rgba(120, 53, 15, 0.3)', borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.3)', borderRadius: 16, padding: 20, flexDirection: 'row', marginBottom: 24 },
  hostProfileLeft: { alignItems: 'center', marginRight: 24 },
  hostProfileAvatarContainer: { position: 'relative', marginBottom: 8 },
  hostProfileAvatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 2, borderColor: 'rgba(245, 158, 11, 0.5)' },
  hostProfileVerifiedBadge: { position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, borderRadius: 14, overflow: 'hidden' },
  hostProfileName: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  hostProfileRole: { color: 'rgba(251, 191, 36, 0.7)', fontSize: 13 },
  hostProfileStats: { flex: 1, justifyContent: 'center' },
  hostStatItem: { paddingVertical: 8 },
  hostStatValue: { color: '#ffffff', fontSize: 20, fontWeight: '700' },
  hostStatValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hostStatLabel: { color: 'rgba(251, 191, 36, 0.7)', fontSize: 11 },
  hostStatDivider: { height: 1, backgroundColor: 'rgba(180, 83, 9, 0.3)', marginVertical: 4 },

  // Infos hôte
  hostInfoSection: { marginBottom: 24 },
  hostInfoItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  hostInfoContent: { marginLeft: 16, flex: 1 },
  hostInfoTitle: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  hostInfoSubtitle: { color: 'rgba(251, 191, 36, 0.7)', fontSize: 13, marginTop: 2 },

  // À propos hôte
  hostAboutSection: { marginBottom: 24 },
  hostAboutTitle: { color: '#ffffff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  hostAboutText: { color: 'rgba(252, 211, 77, 0.8)', fontSize: 15, lineHeight: 22 },

  // Annonces hôte
  hostListingsSection: { marginBottom: 24 },
  hostListingsTitle: { color: '#ffffff', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  hostListingsScroll: { marginHorizontal: -16, paddingHorizontal: 16 },
  hostListingCard: { width: 176, marginRight: 16 },
  hostListingImage: { width: 176, height: 128, borderRadius: 12, marginBottom: 8 },
  hostListingTitle: { color: '#ffffff', fontSize: 14, fontWeight: '600', height: 40, marginBottom: 4 },
  hostListingRating: { flexDirection: 'row', alignItems: 'center' },
  hostListingRatingText: { color: '#fbbf24', fontSize: 13, marginLeft: 4 },
  hostListingReviews: { color: 'rgba(251, 191, 36, 0.7)', fontSize: 13, marginLeft: 4 },

  // Bouton contacter
  contactHostBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#facc15', paddingVertical: 16, borderRadius: 12, gap: 8 },
  contactHostBtnText: { color: '#78350f', fontSize: 16, fontWeight: '700' },

  // Section Commentaires
  reviewsSection: { marginBottom: 8 },
  reviewsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  reviewsRating: { color: '#ffffff', fontSize: 20, fontWeight: '700', marginLeft: 8 },
  reviewsDot: { color: '#92400e', marginHorizontal: 8, fontSize: 20 },
  reviewsCount: { color: '#ffffff', fontSize: 20, fontWeight: '700' },
  reviewsCarousel: { marginHorizontal: -16 },
  reviewsCarouselContent: { paddingHorizontal: 16 },
  reviewCard: { width: 288, backgroundColor: 'rgba(120, 53, 15, 0.3)', borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.3)', borderRadius: 16, padding: 16, marginRight: 16 },
  reviewCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  reviewAvatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.3)' },
  reviewAuthorInfo: { marginLeft: 12 },
  reviewAuthor: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  reviewMemberSince: { color: 'rgba(245, 158, 11, 0.6)', fontSize: 12, marginTop: 2 },
  reviewStars: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewDate: { color: 'rgba(245, 158, 11, 0.6)', fontSize: 12, marginLeft: 8 },
  reviewComment: { color: 'rgba(252, 211, 77, 0.8)', fontSize: 14, lineHeight: 20 },
  showAllReviewsBtn: { marginTop: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.5)', alignItems: 'center' },
  showAllReviewsBtnText: { color: '#fbbf24', fontSize: 15, fontWeight: '600' },

  // Modal Commentaires
  reviewsModalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  reviewsModalRating: { color: '#ffffff', fontSize: 24, fontWeight: '700', marginLeft: 8 },
  reviewsModalDot: { color: '#92400e', marginHorizontal: 12, fontSize: 24 },
  reviewsModalCount: { color: 'rgba(252, 211, 77, 0.7)', fontSize: 16 },
  reviewModalCard: { backgroundColor: 'rgba(120, 53, 15, 0.3)', borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.3)', borderRadius: 16, padding: 16, marginBottom: 16 },
  reviewModalAvatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.3)' },
  reviewModalAuthor: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  reviewModalMemberSince: { color: 'rgba(245, 158, 11, 0.6)', fontSize: 13, marginTop: 2 },
  reviewModalComment: { color: 'rgba(252, 211, 77, 0.9)', fontSize: 15, lineHeight: 22 },

  // Section Règles
  rulesSection: { marginBottom: 8 },
  rulesList: { gap: 12 },
  ruleItem: { flexDirection: 'row', alignItems: 'center' },
  ruleText: { color: 'rgba(252, 211, 77, 0.8)', fontSize: 15, marginLeft: 12 },

  // Section Annulation
  cancellationSection: { marginBottom: 8 },
  cancellationText: { color: 'rgba(252, 211, 77, 0.8)', fontSize: 15, lineHeight: 22 },
  learnMoreBtn: { marginTop: 12 },
  learnMoreBtnText: { color: '#fbbf24', fontSize: 15, fontWeight: '600', textDecorationLine: 'underline' },

  // Booking Bar améliorée
  bookingBarLeft: { flex: 1, marginRight: 16 },
  bookingPriceWithDates: { fontSize: 16 },
  bookingDatesInfo: { color: 'rgba(252, 211, 77, 0.8)', fontSize: 13, marginTop: 2 },
  bookingRatingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  bookingRatingText: { color: '#fbbf24', fontSize: 14, marginLeft: 4 },
  bookingButtonSmall: { paddingVertical: 10, paddingHorizontal: 16 },
  bookingButtonTextSmall: { color: '#78350f', fontSize: 11, fontWeight: '700', textAlign: 'center', lineHeight: 14 },

  // Modal Calendrier
  calendarSheet: { maxHeight: SCREEN_HEIGHT * 0.85, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  calendarSheetGradient: { flex: 1 },
  calendarHeader: { paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(180, 83, 9, 0.3)' },
  calendarTitle: { color: '#fcd34d', fontSize: 20, fontWeight: '700' },
  calendarSubtitle: { color: 'rgba(252, 211, 77, 0.7)', fontSize: 14, marginTop: 4 },
  calendarContent: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  dateButtons: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dateButton: { flex: 1, backgroundColor: 'rgba(120, 53, 15, 0.3)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
  dateButtonActive: { backgroundColor: '#facc15' },
  dateButtonActiveEnd: { backgroundColor: '#f59e0b' },
  dateButtonLabel: { color: 'rgba(251, 191, 36, 0.7)', fontSize: 10, fontWeight: '500', letterSpacing: 1 },
  dateButtonLabelActive: { color: 'rgba(120, 53, 15, 0.7)' },
  dateButtonValue: { color: '#fbbf24', fontSize: 14, fontWeight: '500', marginTop: 2 },
  dateButtonValueActive: { color: '#78350f' },
  dateArrow: { color: '#92400e', marginHorizontal: 8 },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  monthNavBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(120, 53, 15, 0.5)', alignItems: 'center', justifyContent: 'center' },
  monthNavText: { color: '#ffffff', fontSize: 16, fontWeight: '600', textTransform: 'capitalize' },
  weekDays: { flexDirection: 'row', marginBottom: 8 },
  weekDay: { flex: 1, textAlign: 'center', color: '#f59e0b', fontSize: 12, fontWeight: '500' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarDayEmpty: { width: (SCREEN_WIDTH - 32) / 7, height: 36 },
  calendarDay: { width: (SCREEN_WIDTH - 32) / 7, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  calendarDayStart: { backgroundColor: '#facc15' },
  calendarDayEnd: { backgroundColor: '#f59e0b' },
  calendarDayInRange: { backgroundColor: 'rgba(180, 83, 9, 0.5)' },
  calendarDayToday: { backgroundColor: 'rgba(120, 53, 15, 0.5)', borderWidth: 1, borderColor: '#f59e0b' },
  calendarDayText: { color: '#fcd34d', fontSize: 14, fontWeight: '500' },
  calendarDayTextPast: { color: '#78350f' },
  calendarDayTextSelected: { color: '#78350f', fontWeight: '700' },
  calendarDayTextInRange: { color: '#fcd34d' },
  calendarLegend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 16, marginBottom: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 12, height: 12, borderRadius: 4 },
  legendDotStart: { backgroundColor: '#facc15' },
  legendDotEnd: { backgroundColor: '#f59e0b' },
  legendDotRange: { backgroundColor: 'rgba(180, 83, 9, 0.5)' },
  legendText: { color: '#fbbf24', fontSize: 12 },
  calendarFooter: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 16, borderTopWidth: 1, borderTopColor: 'rgba(180, 83, 9, 0.3)' },
  calendarResetBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: 'rgba(120, 53, 15, 0.3)', borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.5)', alignItems: 'center' },
  calendarResetBtnText: { color: '#fbbf24', fontSize: 14, fontWeight: '600' },
  calendarValidateBtn: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  calendarValidateBtnDisabled: { opacity: 0.5 },
  calendarValidateBtnGradient: { paddingVertical: 12, alignItems: 'center' },
  calendarValidateBtnText: { color: '#78350f', fontSize: 14, fontWeight: '700' },
  calendarValidateBtnTextDisabled: { color: '#92400e' },

  // Modal Réservation
  bookingSheet: { height: SCREEN_HEIGHT * 0.92, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  bookingSheetGradient: { flex: 1 },
  bookingSheetScroll: { flex: 1 },
  bookingSheetContent: { padding: 16, paddingBottom: 120 },
  bookingSheetTitle: { color: '#ffffff', fontSize: 24, fontWeight: '700', marginBottom: 24 },
  bookingSummaryCard: { flexDirection: 'row', backgroundColor: 'rgba(120, 53, 15, 0.3)', borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.3)', borderRadius: 16, padding: 16, marginBottom: 24 },
  bookingSummaryImage: { width: 96, height: 80, borderRadius: 12 },
  bookingSummaryInfo: { flex: 1, marginLeft: 16 },
  bookingSummaryTitle: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  bookingSummaryRating: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  bookingSummaryRatingText: { color: '#fcd34d', fontSize: 14, marginLeft: 4 },
  bookingSummaryReviews: { color: 'rgba(245, 158, 11, 0.6)', fontSize: 14, marginLeft: 4 },
  bookingSection: { borderBottomWidth: 1, borderBottomColor: 'rgba(180, 83, 9, 0.3)', paddingBottom: 16, marginBottom: 16 },
  bookingSectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bookingSectionTitle: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  bookingSectionValue: { color: 'rgba(252, 211, 77, 0.8)', fontSize: 14, marginTop: 4 },
  bookingModifyBtn: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: 'rgba(120, 53, 15, 0.3)', borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.5)', borderRadius: 8 },
  bookingModifyBtnText: { color: '#fbbf24', fontSize: 14, fontWeight: '500' },
  guestsCounter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  guestsBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#92400e', alignItems: 'center', justifyContent: 'center' },
  guestsBtnDisabled: { borderColor: '#78350f' },
  guestsBtnText: { color: '#fbbf24', fontSize: 18, fontWeight: '500' },
  guestsBtnTextDisabled: { color: '#78350f' },
  guestsValue: { color: '#ffffff', fontSize: 16, fontWeight: '600', width: 24, textAlign: 'center' },
  priceDetailBox: { backgroundColor: 'rgba(120, 53, 15, 0.3)', borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.3)', borderRadius: 16, padding: 16, marginBottom: 24 },
  priceDetailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceDetailLabel: { color: 'rgba(252, 211, 77, 0.8)', fontSize: 14 },
  priceDetailValue: { color: '#ffffff', fontSize: 14, fontWeight: '500' },
  priceDetailDivider: { height: 1, backgroundColor: 'rgba(180, 83, 9, 0.3)', marginVertical: 8 },
  priceDetailTotal: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  priceDetailTotalValue: { color: '#fbbf24', fontSize: 18, fontWeight: '700' },
  paymentOptions: { marginBottom: 24 },
  paymentOptionsTitle: { color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 16 },
  paymentOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.3)', borderRadius: 12, marginBottom: 12 },
  paymentOptionActive: { borderColor: '#f59e0b', backgroundColor: 'rgba(120, 53, 15, 0.3)' },
  paymentOptionContent: { flex: 1 },
  paymentOptionText: { color: '#ffffff', fontSize: 15, fontWeight: '500' },
  paymentOptionSubtext: { color: 'rgba(252, 211, 77, 0.7)', fontSize: 13, marginTop: 4 },
  paymentRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#92400e', alignItems: 'center', justifyContent: 'center' },
  paymentRadioActive: { borderColor: '#f59e0b' },
  paymentRadioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#f59e0b' },
  bookingSheetFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: 'rgba(69, 26, 3, 0.98)', borderTopWidth: 1, borderTopColor: 'rgba(180, 83, 9, 0.3)' },
  bookingConfirmBtn: { borderRadius: 12, overflow: 'hidden' },
  bookingConfirmBtnGradient: { paddingVertical: 16, alignItems: 'center' },
  bookingConfirmBtnText: { color: '#78350f', fontSize: 16, fontWeight: '700' },

  // Bouton Signaler
  reportButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  reportButtonText: { color: 'rgba(245, 158, 11, 0.7)', fontSize: 14, marginLeft: 8, textDecorationLine: 'underline' },

  // Modal Signalement
  reportSheet: { maxHeight: SCREEN_HEIGHT * 0.75, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  reportSheetGradient: { flex: 1 },
  reportContent: { padding: 16, paddingTop: 0 },
  reportTitle: { color: '#ffffff', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  reportSubtitle: { color: 'rgba(252, 211, 77, 0.7)', fontSize: 14, marginBottom: 24 },
  reportReasons: {},
  reportReasonItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  reportReasonBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(180, 83, 9, 0.3)' },
  reportReasonText: { color: '#ffffff', fontSize: 16, flex: 1 },
  reportRadio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(146, 64, 14, 0.5)', alignItems: 'center', justifyContent: 'center', marginLeft: 16 },
  reportRadioActive: { borderColor: '#f59e0b', backgroundColor: '#f59e0b' },
  reportRadioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  reportSubmitBtn: { marginTop: 24, borderRadius: 16, overflow: 'hidden' },
  reportSubmitBtnDisabled: { opacity: 0.5 },
  reportSubmitBtnGradient: { paddingVertical: 16, alignItems: 'center' },
  reportSubmitBtnText: { color: '#78350f', fontSize: 16, fontWeight: '700' },
  reportSubmitBtnTextDisabled: { color: '#92400e' },
  reportSubmitted: { alignItems: 'center', paddingVertical: 48 },
  reportSuccessIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(34, 197, 94, 0.2)', borderWidth: 2, borderColor: '#22c55e', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  reportSubmittedTitle: { color: '#ffffff', fontSize: 22, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  reportSubmittedText: { color: 'rgba(252, 211, 77, 0.8)', fontSize: 15, textAlign: 'center', marginBottom: 32, paddingHorizontal: 16 },
  reportCloseBtn: { width: '100%', borderRadius: 16, overflow: 'hidden' },
  reportCloseBtnGradient: { paddingVertical: 16, alignItems: 'center' },
  reportCloseBtnText: { color: '#78350f', fontSize: 16, fontWeight: '700' },

  // Modal Paiement
  paymentSheet: { height: SCREEN_HEIGHT * 0.85, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  paymentSheetGradient: { flex: 1 },
  paymentContent: { flex: 1, padding: 16, paddingTop: 0 },
  paymentForm: {},
  paymentTitle: { color: '#ffffff', fontSize: 22, fontWeight: '700', marginBottom: 24 },
  paymentSummary: { backgroundColor: 'rgba(120, 53, 15, 0.3)', borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.3)', borderRadius: 16, padding: 16, marginBottom: 24 },
  paymentSummaryLabel: { color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  paymentSummaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  paymentSummaryText: { color: 'rgba(252, 211, 77, 0.8)', fontSize: 14 },
  paymentSummaryDivider: { height: 1, backgroundColor: 'rgba(180, 83, 9, 0.3)', marginVertical: 12 },
  paymentSummaryTotal: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  paymentSummaryTotalValue: { color: '#fbbf24', fontSize: 18, fontWeight: '700' },
  paymentMethodLabel: { color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 16 },
  paymentMethods: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  paymentMethodCard: { flex: 1, backgroundColor: 'rgba(120, 53, 15, 0.3)', borderWidth: 2, borderColor: 'transparent', borderRadius: 16, padding: 16, alignItems: 'center' },
  paymentMethodCardActive: { borderColor: '#f59e0b', backgroundColor: 'rgba(120, 53, 15, 0.5)' },
  paymentMethodIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  paymentMethodIconText: { fontSize: 12, fontWeight: '700', color: '#000' },
  paymentMethodName: { color: '#ffffff', fontSize: 12, fontWeight: '500', textAlign: 'center' },
  paymentMethodCheck: { position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: 12, backgroundColor: '#ffcc00', alignItems: 'center', justifyContent: 'center' },
  paymentPhoneLabel: { color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  paymentPhoneInput: { flexDirection: 'row', borderWidth: 2, borderColor: 'rgba(180, 83, 9, 0.3)', borderRadius: 16, overflow: 'hidden' },
  paymentPhonePrefix: { paddingVertical: 16, paddingHorizontal: 16, backgroundColor: 'rgba(120, 53, 15, 0.5)', color: '#fcd34d', fontSize: 16, fontWeight: '500' },
  paymentPhoneField: { flex: 1, paddingVertical: 16, paddingHorizontal: 16, backgroundColor: 'rgba(120, 53, 15, 0.3)', color: '#ffffff', fontSize: 18 },
  paymentFooter: { padding: 16, backgroundColor: 'rgba(69, 26, 3, 0.98)', borderTopWidth: 1, borderTopColor: 'rgba(180, 83, 9, 0.3)' },
  paymentPayBtn: { borderRadius: 16, overflow: 'hidden' },
  paymentPayBtnDisabled: { opacity: 0.6 },
  paymentPayBtnGradient: { paddingVertical: 16, alignItems: 'center' },
  paymentPayBtnText: { color: '#78350f', fontSize: 18, fontWeight: '700' },
  paymentPayBtnTextDisabled: { color: '#92400e' },
  paymentProcessing: { alignItems: 'center', paddingVertical: 80 },
  paymentProcessingTitle: { color: '#ffffff', fontSize: 20, fontWeight: '700', marginTop: 24 },
  paymentProcessingText: { color: 'rgba(252, 211, 77, 0.7)', fontSize: 14, marginTop: 8 },
  paymentProcessingHint: { color: '#fbbf24', fontSize: 14, marginTop: 16, textAlign: 'center', fontWeight: '500' },
  paymentSuccess: { alignItems: 'center', paddingVertical: 48 },
  paymentSuccessIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  paymentSuccessTitle: { color: '#ffffff', fontSize: 24, fontWeight: '700', marginBottom: 8 },
  paymentSuccessText: { color: 'rgba(252, 211, 77, 0.7)', fontSize: 16, marginBottom: 24 },
  paymentReceipt: { width: '100%', backgroundColor: 'rgba(120, 53, 15, 0.3)', borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.3)', borderRadius: 16, padding: 16, marginBottom: 24 },
  paymentReceiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  paymentReceiptLabel: { color: 'rgba(252, 211, 77, 0.7)', fontSize: 14 },
  paymentReceiptValue: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  paymentDoneBtn: { width: '100%', borderRadius: 16, overflow: 'hidden' },
  paymentDoneBtnGradient: { paddingVertical: 16, alignItems: 'center' },
  paymentDoneBtnText: { color: '#78350f', fontSize: 18, fontWeight: '700' },
  paymentError: { alignItems: 'center', paddingVertical: 48 },
  paymentErrorIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  paymentErrorTitle: { color: '#ffffff', fontSize: 24, fontWeight: '700', marginBottom: 8 },
  paymentErrorText: { color: 'rgba(252, 211, 77, 0.7)', fontSize: 15, textAlign: 'center', marginBottom: 24, paddingHorizontal: 16 },
  paymentRetryBtn: { width: '100%', borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  paymentRetryBtnGradient: { paddingVertical: 16, alignItems: 'center' },
  paymentRetryBtnText: { color: '#78350f', fontSize: 18, fontWeight: '700' },
  paymentCancelBtn: { width: '100%', paddingVertical: 16, backgroundColor: 'rgba(120, 53, 15, 0.5)', borderRadius: 16, alignItems: 'center' },
  paymentCancelBtnText: { color: '#fcd34d', fontSize: 16, fontWeight: '500' },

  // Barre réservation - ajouts
  bookingPriceUnderline: { textDecorationLine: 'underline' },
  bookingFreeCancellation: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  bookingFreeCancellationText: { color: 'rgba(251, 191, 36, 0.8)', fontSize: 12, marginLeft: 4 },

  // Section Disponibilités
  availabilitySection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  availabilityContent: { flex: 1, paddingRight: 16 },
  availabilityText: { color: 'rgba(245, 158, 11, 0.7)', fontSize: 14, marginTop: 4 },

  // Bouton En savoir plus désactivé
  learnMoreBtnDisabled: { opacity: 0.5 },
  learnMoreBtnTextDisabled: { color: 'rgba(245, 158, 11, 0.5)' },

  // Calendrier - date indisponible
  calendarDayTextUnavailable: { color: '#78350f', textDecorationLine: 'line-through' },

  // Modal signalement complet
  reportSheetFull: { height: SCREEN_HEIGHT * 0.92, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  reportScrollContent: { flex: 1 },
  bottomSheetBackBtn: { position: 'absolute', top: 16, left: 16, zIndex: 10 },
  reportSubReasonContent: { flex: 1, paddingRight: 16 },
  reportSubReasonExample: { color: 'rgba(252, 211, 77, 0.6)', fontSize: 13, marginTop: 4 },
  reportTextarea: { backgroundColor: 'rgba(120, 53, 15, 0.3)', borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.3)', borderRadius: 16, padding: 16, color: '#ffffff', fontSize: 15, minHeight: 150, marginBottom: 24 },
  reportInfoText: { color: 'rgba(252, 211, 77, 0.8)', fontSize: 15, lineHeight: 22, marginBottom: 16 },

  // Modal conditions d'annulation
  cancellationSheet: { maxHeight: SCREEN_HEIGHT * 0.8, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  cancellationSheetGradient: { flex: 1 },
  cancellationContent: { flex: 1, padding: 16, paddingTop: 0 },
  cancellationTitle: { color: '#ffffff', fontSize: 22, fontWeight: '700', marginBottom: 24 },
  cancellationFreeBox: { backgroundColor: 'rgba(34, 197, 94, 0.15)', borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.3)', borderRadius: 16, padding: 16, marginBottom: 24 },
  cancellationFreeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cancellationFreeTitle: { color: '#22c55e', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  cancellationFreeText: { color: 'rgba(252, 211, 77, 0.8)', fontSize: 14, lineHeight: 20 },
  cancellationTimeline: { marginBottom: 24 },
  cancellationTimelineItem: { flexDirection: 'row', alignItems: 'flex-start' },
  cancellationTimelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#fbbf24', marginTop: 4, marginRight: 12 },
  cancellationTimelineDotRed: { backgroundColor: '#ef4444' },
  cancellationTimelineContent: { flex: 1 },
  cancellationTimelineTitle: { color: '#ffffff', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  cancellationTimelineText: { color: 'rgba(252, 211, 77, 0.7)', fontSize: 14, lineHeight: 20 },
  cancellationTimelineLine: { width: 2, height: 24, backgroundColor: 'rgba(180, 83, 9, 0.3)', marginLeft: 5, marginVertical: 8 },
  cancellationCloseBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  cancellationCloseBtnGradient: { paddingVertical: 16, alignItems: 'center' },
  cancellationCloseBtnText: { color: '#78350f', fontSize: 16, fontWeight: '700' },

  // Modal détail du prix
  priceDetailSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  priceDetailSheetGradient: { paddingBottom: 32 },
  priceDetailSheetContent: { padding: 16, paddingTop: 0 },
  priceDetailSheetTitle: { color: '#ffffff', fontSize: 22, fontWeight: '700', marginBottom: 24 },

  // Modal paiement différé
  deferredSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  deferredSheetGradient: { paddingBottom: 32 },
  deferredContent: { padding: 16, paddingTop: 0, alignItems: 'center' },
  deferredSuccessIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(34, 197, 94, 0.2)', borderWidth: 2, borderColor: '#22c55e', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  deferredTitle: { color: '#ffffff', fontSize: 24, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  deferredText: { color: 'rgba(252, 211, 77, 0.8)', fontSize: 15, textAlign: 'center', marginBottom: 24 },
  deferredDeadlineBox: { width: '100%', backgroundColor: 'rgba(120, 53, 15, 0.3)', borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.3)', borderRadius: 16, padding: 16, marginBottom: 16 },
  deferredDeadlineHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  deferredDeadlineIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(146, 64, 14, 0.3)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  deferredDeadlineLabel: { color: 'rgba(252, 211, 77, 0.7)', fontSize: 13 },
  deferredDeadlineDate: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  deferredDeadlineInfo: { color: 'rgba(252, 211, 77, 0.6)', fontSize: 13, lineHeight: 18 },
  deferredDeadlineAmount: { color: '#fbbf24', fontWeight: '600' },
  deferredReminderBox: { width: '100%', backgroundColor: 'rgba(120, 53, 15, 0.2)', borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.2)', borderRadius: 12, padding: 12, marginBottom: 24 },
  deferredReminderText: { color: 'rgba(252, 211, 77, 0.7)', fontSize: 13, textAlign: 'center' },
  deferredCloseBtn: { width: '100%', borderRadius: 16, overflow: 'hidden' },
  deferredCloseBtnGradient: { paddingVertical: 16, alignItems: 'center' },
  deferredCloseBtnText: { color: '#78350f', fontSize: 18, fontWeight: '700' },

  // Backend integration styles
  loadingContainer: { flex: 1, backgroundColor: '#78350f', alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 16, color: 'rgba(252,211,77,0.8)', fontSize: 16 },
  errorText: { color: '#fecaca', fontSize: 16, textAlign: 'center', marginBottom: 24, paddingHorizontal: 32 },
  retryBtn: { borderRadius: 16, overflow: 'hidden' },
  retryBtnGradient: { paddingVertical: 14, paddingHorizontal: 32, alignItems: 'center' },
  retryBtnText: { color: '#78350f', fontSize: 16, fontWeight: '700' },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 12, borderWidth: 1, borderColor: '#ef4444', padding: 12, marginBottom: 16 },
  errorBoxText: { color: '#fecaca', fontSize: 14 },
  hostAvatarFallback: { backgroundColor: 'rgba(120, 53, 15, 0.5)', alignItems: 'center', justifyContent: 'center' },
  hostAvatarInitials: { color: '#fbbf24', fontSize: 18, fontWeight: '700' },
  reviewAvatarFallback: { backgroundColor: 'rgba(120, 53, 15, 0.5)', alignItems: 'center', justifyContent: 'center' },
  reviewAvatarInitials: { color: '#fbbf24', fontSize: 14, fontWeight: '700' },
  reviewsCountText: { color: '#ffffff', fontSize: 20, fontWeight: '700' },
  bookingSectionItem: { borderBottomWidth: 1, borderBottomColor: 'rgba(180, 83, 9, 0.3)', paddingBottom: 16, marginBottom: 16 },
  cancellationModalTitle: { color: '#ffffff', fontSize: 22, fontWeight: '700', marginBottom: 24 },
  priceDetailTotalLabel: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  priceDetailTotalValue2: { color: '#fbbf24', fontSize: 20, fontWeight: '700' },
  priceDetailDates: { marginTop: 8 },
  priceDetailDatesTitle: { color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  priceDetailDatesValue: { color: 'rgba(252, 211, 77, 0.8)', fontSize: 14 },
});

export default PropertyDetailsScreen;
