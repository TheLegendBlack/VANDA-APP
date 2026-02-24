// src/screens/SearchScreen.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  StatusBar,
  Image,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Path,
  Circle,
  Rect,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  G,
  Line,
  Ellipse,
} from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

// Backend API
import {
  getHomeProperties,
  searchProperties,
  PropertyCardDto,
  SearchPropertiesParams,
} from '../api/properties';
import { listNeighborhoods, Neighborhood } from '../api/neighborhoods';
import { listEquipments, Equipment } from '../api/equipments';
import { addFavorite, removeFavorite } from '../api/favorites';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH_NORMAL = (SCREEN_WIDTH - 32 - 12) / 2.1;
const CARD_WIDTH_RECENT = (SCREEN_WIDTH - 32 - 24) / 3.15;

interface IconProps {
  size?: number;
  color?: string;
}

// ===============================
// ICÔNES (communes)
/// ===============================
const HeartIcon: React.FC<IconProps & { filled?: boolean }> = ({ size = 20, color = '#fbbf24', filled = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'rgba(0,0,0,0.4)'} stroke={color} strokeWidth={2}>
    <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </Svg>
);

const StarIcon: React.FC<IconProps & { filled?: boolean }> = ({ size = 20, color = '#fbbf24', filled = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth={2}>
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);

const ChevronRightIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}><Path d="M9 18l6-6-6-6" /></Svg>
);

const ChevronLeftIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}><Path d="M15 18l-6-6 6-6" /></Svg>
);

const XIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Line x1="18" y1="6" x2="6" y2="18" /><Line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
);

const ArrowLeftIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Line x1="19" y1="12" x2="5" y2="12" /><Path d="M12 19l-7-7 7-7" />
  </Svg>
);

const SlidersIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Line x1="4" y1="21" x2="4" y2="14" /><Line x1="4" y1="10" x2="4" y2="3" />
    <Line x1="12" y1="21" x2="12" y2="12" /><Line x1="12" y1="8" x2="12" y2="3" />
    <Line x1="20" y1="21" x2="20" y2="16" /><Line x1="20" y1="12" x2="20" y2="3" />
    <Line x1="1" y1="14" x2="7" y2="14" /><Line x1="9" y1="8" x2="15" y2="8" /><Line x1="17" y1="16" x2="23" y2="16" />
  </Svg>
);

const MapPinIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><Circle cx="12" cy="10" r="3" />
  </Svg>
);

const HomeIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><Path d="M9 22V12h6v10" />
  </Svg>
);

const UsersIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><Circle cx="9" cy="7" r="4" />
  </Svg>
);

const CalendarIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Rect x="3" y="4" width="18" height="18" rx="2" />
    <Line x1="16" y1="2" x2="16" y2="6" />
    <Line x1="8" y1="2" x2="8" y2="6" />
    <Line x1="3" y1="10" x2="21" y2="10" />
  </Svg>
);

const MinusIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}><Line x1="5" y1="12" x2="19" y2="12" /></Svg>
);

const PlusIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}><Line x1="12" y1="5" x2="12" y2="19" /><Line x1="5" y1="12" x2="19" y2="12" /></Svg>
);

const CheckIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}><Path d="M20 6L9 17l-5-5" /></Svg>
);

// ===============================
// ICÔNES ÉQUIPEMENTS “RICH” (de ta version A)
// ===============================
const WifiIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M5 12.55a11 11 0 0114 0" /><Path d="M1.42 9a16 16 0 0121.16 0" /><Path d="M8.53 16.11a6 6 0 016.95 0" /><Circle cx="12" cy="20" r="1" fill={color} />
  </Svg>
);

const TvIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Rect x="2" y="7" width="20" height="15" rx="2" /><Path d="M17 2l-5 5-5-5" />
  </Svg>
);

const WindIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2" />
  </Svg>
);

const CarIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M5 17h14v-5H5v5zM5 12l2-5h10l2 5" /><Circle cx="7.5" cy="17" r="1.5" fill={color} /><Circle cx="16.5" cy="17" r="1.5" fill={color} />
  </Svg>
);

const WavesIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M2 6c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /><Path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /><Path d="M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
  </Svg>
);

const ShieldIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Svg>
);

const UtensilsIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
  </Svg>
);

const WashingMachineIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Rect x="3" y="2" width="18" height="20" rx="2" /><Circle cx="12" cy="13" r="5" /><Circle cx="12" cy="13" r="2" /><Circle cx="7" cy="6" r="1" fill={color} />
  </Svg>
);

const GeneratorIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Rect x="2" y="8" width="20" height="12" rx="2" /><Path d="M6 8V6a2 2 0 012-2h8a2 2 0 012 2v2" /><Path d="M12 12v4M10 14h4" />
  </Svg>
);

const WaterIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M12 2C12 2 5 9 5 14a7 7 0 0014 0c0-5-7-12-7-12z" />
  </Svg>
);

const CourtyardIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Rect x="3" y="3" width="18" height="18" rx="1" /><Rect x="7" y="10" width="10" height="8" /><Path d="M7 10L12 6l5 4" />
  </Svg>
);

const TerraceIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M3 12h18M5 12v8M19 12v8M8 12v8M16 12v8M4 9l8-5 8 5" />
  </Svg>
);

const JacuzziIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Ellipse cx="12" cy="16" rx="9" ry="4" />
    <Path d="M7 10c0-1 .5-2 1.5-2s1.5 1 1.5 2M11 8c0-1 .5-2 1.5-2s1.5 1 1.5 2M15 10c0-1 .5-2 1.5-2s1.5 1 1.5 2" />
  </Svg>
);

const BarbecueIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Ellipse cx="12" cy="10" rx="8" ry="3" /><Path d="M4 10v2c0 1.7 3.6 3 8 3s8-1.3 8-3v-2" />
    <Line x1="8" y1="15" x2="6" y2="21" /><Line x1="16" y1="15" x2="18" y2="21" />
  </Svg>
);

const BilliardIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Rect x="2" y="6" width="20" height="12" rx="1" />
    <Circle cx="8" cy="12" r="2" /><Circle cx="14" cy="10" r="2" /><Circle cx="16" cy="14" r="2" />
  </Svg>
);

const PianoIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Rect x="2" y="6" width="20" height="12" rx="1" />
    <Line x1="6" y1="6" x2="6" y2="18" /><Line x1="10" y1="6" x2="10" y2="18" />
    <Line x1="14" y1="6" x2="14" y2="18" /><Line x1="18" y1="6" x2="18" y2="18" />
  </Svg>
);

const FitnessIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M6 7v10M18 7v10M3 8v8M21 8v8M6 12h12" />
  </Svg>
);

const LakeAccessIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M2 18c1.5-1 3-1.5 4.5-1.5s3 .5 4.5 1.5c1.5 1 3 1.5 4.5 1.5s3-.5 4.5-1.5" />
    <Circle cx="12" cy="7" r="3" /><Path d="M12 10v4" />
  </Svg>
);

const BeachAccessIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M5 20h14" /><Path d="M12 4v10" /><Path d="M12 4c-2 2-3 4-3 6s1 4 3 6" /><Path d="M12 4c2 2 3 4 3 6s-1 4-3 6" />
    <Circle cx="18" cy="6" r="2" />
  </Svg>
);

// fallback générique si aucun match
const GenericAmenityIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M20 7h-9M14 17H5" />
    <Circle cx="17" cy="17" r="3" />
    <Circle cx="7" cy="7" r="3" />
  </Svg>
);

// ===============================
// Décor
// ===============================
const FloatingParticle: React.FC<{ delay: number; duration: number; startX: number; startY: number }> = ({
  delay,
  duration,
  startX,
  startY,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, { toValue: -30, duration: duration / 2, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: 20, duration: duration / 2, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.7, duration: duration / 2, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, { toValue: 0, duration: duration / 2, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: 0, duration: duration / 2, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.3, duration: duration / 2, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: startX,
          top: startY,
          transform: [{ translateY }, { translateX }],
          opacity,
        },
      ]}
    />
  );
};

const KongoPattern: React.FC = () => (
  <View style={styles.patternContainer}>
    {Array.from({ length: Math.ceil(SCREEN_HEIGHT / 80) + 1 }).map((_, row) =>
      Array.from({ length: Math.ceil(SCREEN_WIDTH / 80) + 1 }).map((_, col) => (
        <Svg key={`${row}-${col}`} width={80} height={80} viewBox="0 0 80 80" style={{ position: 'absolute', left: col * 80, top: row * 80 }}>
          <G fill="none" stroke="#D4AF37" strokeWidth={1} opacity={0.05}>
            <Path d="M40 5L50 15 40 25 30 15z" />
            <Path d="M40 30L50 40 40 50 30 40z" />
            <Path d="M40 55L50 65 40 75 30 65z" />
            <Path d="M15 30L25 40 15 50 5 40z" />
            <Path d="M65 30L75 40 65 50 55 40z" />
          </G>
        </Svg>
      ))
    )}
  </View>
);

const SearchIconGradient: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth={2}>
    <Defs>
      <SvgLinearGradient id="searchGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FDE047" />
        <Stop offset="100%" stopColor="#F59E0B" />
      </SvgLinearGradient>
    </Defs>
    <Circle cx="12" cy="12" r="8" stroke="url(#searchGold)" />
    <Path
      d="M12 8C12 8 15 10 15 12C15 14 12 16 12 16C12 16 9 14 9 12C9 10 12 8 12 8Z M12 10.5 A1.5 1.5 0 0 0 12 13.5 A1.5 1.5 0 0 0 12 10.5Z"
      stroke="url(#searchGold)"
      fill="url(#searchGold)"
      fillRule="evenodd"
    />
  </Svg>
);

const AdinkraSearchIcon: React.FC<{ size?: number; color?: string; active?: boolean }> = ({
  size = 24,
  color = '#fbbf24',
  active = false,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Circle cx="12" cy="12" r="8" />
    <Path d="M12 8C12 8 15 10 15 12C15 14 12 16 12 16C12 16 9 14 9 12C9 10 12 8 12 8Z" fill={active ? color : 'none'} />
    <Circle cx="12" cy="12" r="2" fill={active ? color : 'none'} />
  </Svg>
);

// ===============================
// Données UI
// ===============================
type TabId = 'rechercher' | 'favoris' | 'reservations' | 'messages' | 'profil';
type LocationType = 'short' | 'long' | 'both' | '';
type CalendarMode = 'arrival' | 'departure' | null;

interface UiProperty {
  id: string;
  title: string;
  location: string;
  image: string;
  images: string[];
  price: number;
  priceUnit: 'nuit' | 'mois';
  secondaryPrice?: number;
  secondaryPriceUnit?: 'nuit' | 'mois';
  rating: number | null;
  reviewsCount: number;
  beds: number;
  bedrooms: number;
  bathrooms: number;
  isFavorite: boolean;
  isGuestFavorite?: boolean;
  raw: PropertyCardDto;
}

interface Section {
  id: string;
  title: string;
  subtitle?: string;
  properties: UiProperty[];
  isConditional?: boolean;
}

const cities = ['Brazzaville', 'Pointe-Noire', 'Dolisie', 'Nkayi', 'Ouesso', 'Oyo', 'Impfondo', 'Sibiti', 'Madingou', 'Owando'];

const propertyTypes = [
  { value: 'apartment', label: 'Appartement' },
  { value: 'house', label: 'Maison' },
  { value: 'villa', label: 'Villa' },
  { value: 'studio', label: 'Studio' },
  { value: 'room', label: 'Chambre' },
  { value: 'event_hall', label: 'Salle' },
  { value: 'office', label: 'Bureau' },
];

const locationTypes = [
  { value: 'short' as const, label: 'Courte durée' },
  { value: 'long' as const, label: 'Longue durée' },
  { value: 'both' as const, label: 'Les deux' },
];

const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const destinationImages: Record<string, string> = {
  Brazzaville: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
  'Pointe-Noire': 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
  Dolisie: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
  Nkayi: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
  Ouesso: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
  Oyo: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400',
};

// ===============================
// Mapping équipements backend -> icônes (conserve tes icônes A)
// ===============================
function norm(s: string) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function pickAmenityIcon(eq: { name?: string; category?: string }) {
  const n = norm(eq.name || '');
  const c = norm(eq.category || '');

  const hay = `${n} ${c}`;

  if (hay.includes('wifi') || hay.includes('wi fi') || hay.includes('internet')) return WifiIcon;
  if (hay.includes('tv') || hay.includes('television') || hay.includes('tele')) return TvIcon;
  if (hay.includes('clim') || hay.includes('air condition') || hay.includes('climatiseur')) return WindIcon;
  if (hay.includes('parking') || hay.includes('garage')) return CarIcon;
  if (hay.includes('piscine') || hay.includes('pool')) return WavesIcon;
  if (hay.includes('securite') || hay.includes('security') || hay.includes('gardien')) return ShieldIcon;
  if (hay.includes('cuisine') || hay.includes('kitchen')) return UtensilsIcon;
  if (hay.includes('lave') || hay.includes('washing') || hay.includes('machine')) return WashingMachineIcon;
  if (hay.includes('groupe') || hay.includes('generateur') || hay.includes('generator')) return GeneratorIcon;
  if (hay.includes('eau') || hay.includes('water')) return WaterIcon;
  if (hay.includes('cour') || hay.includes('yard') || hay.includes('patio')) return CourtyardIcon;
  if (hay.includes('terrasse') || hay.includes('balcon') || hay.includes('balcony')) return TerraceIcon;
  if (hay.includes('jacuzzi') || hay.includes('spa')) return JacuzziIcon;
  if (hay.includes('barbecue') || hay.includes('bbq')) return BarbecueIcon;
  if (hay.includes('billard') || hay.includes('billiard')) return BilliardIcon;
  if (hay.includes('piano')) return PianoIcon;
  if (hay.includes('fitness') || hay.includes('gym') || hay.includes('salle de sport')) return FitnessIcon;
  if (hay.includes('lac') || hay.includes('lake')) return LakeAccessIcon;
  if (hay.includes('plage') || hay.includes('beach') || hay.includes('mer') || hay.includes('ocean')) return BeachAccessIcon;

  return GenericAmenityIcon;
}

// ===============================
// Mapping PropertyCardDto -> UiProperty
// ===============================
function mapCardToUi(p: PropertyCardDto): UiProperty {
  const urls = (p.photos || []).map((ph) => ph.url).filter(Boolean) as string[];
  const hero = p.heroPhoto?.url || urls[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800';
  const images = urls.length ? [hero, ...urls.filter((u) => u !== hero)].slice(0, 5) : [hero];

  const hasNight = typeof p.pricePerNight === 'number' && p.pricePerNight > 0;
  const hasMonth = typeof p.pricePerMonth === 'number' && p.pricePerMonth > 0;

  // principal = nuit si dispo sinon mois
  const price = hasNight ? p.pricePerNight! : (hasMonth ? p.pricePerMonth! : 0);
  const priceUnit: 'nuit' | 'mois' = hasNight ? 'nuit' : 'mois';

  const secondaryPrice = hasNight && hasMonth ? (priceUnit === 'nuit' ? p.pricePerMonth! : p.pricePerNight!) : undefined;
  const secondaryPriceUnit = hasNight && hasMonth ? (priceUnit === 'nuit' ? 'mois' : 'nuit') : undefined;

  return {
    id: p.id,
    title: p.title,
    location: p.neighborhood?.name ? `${p.neighborhood.name}, ${p.city}` : p.city,
    image: hero,
    images,
    price,
    priceUnit,
    secondaryPrice,
    secondaryPriceUnit,
    rating: p.rating?.avg ?? null,
    reviewsCount: p.rating?.count ?? 0,
    beds: p.beds,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    isFavorite: !!p.isFavorite,
    isGuestFavorite: (p.qualityScore ?? 0) > 5,
    raw: p,
  };
}

// ===============================
// Composant principal
// ===============================
const SearchScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  // UI / data
  const [sections, setSections] = useState<Section[]>([]);
  const [loadingHome, setLoadingHome] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showSecondaryPrice, setShowSecondaryPrice] = useState(false);

  // modal search
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchCity, setSearchCity] = useState('');
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [searchNeighborhoodId, setSearchNeighborhoodId] = useState('');
  const [searchPropertyTypes, setSearchPropertyTypes] = useState<string[]>([]);
  const [searchLocationType, setSearchLocationType] = useState<LocationType>('');
  const [searchGuests, setSearchGuests] = useState(0);
  const [searchBedrooms, setSearchBedrooms] = useState(0);
  const [searchBeds, setSearchBeds] = useState(0);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [equipmentsLoaded, setEquipmentsLoaded] = useState(false);
  const [searchAmenities, setSearchAmenities] = useState<string[]>([]);
  const [priceMinNight, setPriceMinNight] = useState(5000);
  const [priceMaxNight, setPriceMaxNight] = useState(500000);
  const [priceMinMonth, setPriceMinMonth] = useState(20000);
  const [priceMaxMonth, setPriceMaxMonth] = useState(5000000);

  // calendrier (conservé comme la maquette – visuel complet)
  const [showCalendar, setShowCalendar] = useState<CalendarMode>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [searchArrivalDate, setSearchArrivalDate] = useState<Date | null>(null);
  const [searchDepartureDate, setSearchDepartureDate] = useState<Date | null>(null);

  // voir tout
  const [showAllSection, setShowAllSection] = useState<Section | null>(null);
  const [carouselIndexes, setCarouselIndexes] = useState<{ [key: string]: number }>({});
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTotal, setSearchTotal] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setShowSecondaryPrice((prev) => !prev), 7000);
    return () => clearInterval(interval);
  }, []);

  const particles = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        startX: Math.random() * SCREEN_WIDTH,
        startY: Math.random() * SCREEN_HEIGHT,
        delay: Math.random() * 5000,
        duration: 5000 + Math.random() * 10000,
      })),
    []
  );

  const formatPrice = (price: number) => price.toLocaleString('fr-FR');

  const getDisplayPrice = (property: UiProperty) => {
    if (property.secondaryPrice && showSecondaryPrice) {
      return { price: property.secondaryPrice, unit: property.secondaryPriceUnit! };
    }
    return { price: property.price, unit: property.priceUnit };
  };

  const getPropertyImages = (property: UiProperty) => property.images?.length ? property.images : [property.image];

  const getCarouselIndex = (propertyId: string) => carouselIndexes[propertyId] || 0;

  // ===== Data loaders
  const loadHome = async () => {
    setLoadingHome(true);
    try {
      const data = await getHomeProperties({ limitPerCity: 6 });

      const mappedSections: Section[] = (data.sections || []).map((s) => ({
        id: s.key,
        title: s.title || 'Logements',
        subtitle: s.city,
        properties: (s.items || []).map(mapCardToUi),
      }));

      // init favoris (depuis isFavorite si token présent)
      const fav = new Set<string>();
      mappedSections.forEach((sec) => sec.properties.forEach((p) => p.isFavorite && fav.add(p.id)));
      setFavorites(fav);

      // NB: “Consultés récemment” (maquette A) : on le remettra via AsyncStorage plus tard
      // sans perdre la section. Pour l’instant on garde le reste 1:1 avec backend.
      setSections(mappedSections);
    } catch (e) {
      console.error('Erreur chargement home:', e);
      setSections([]);
    } finally {
      setLoadingHome(false);
    }
  };

  useEffect(() => {
    loadHome();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHome();
    setRefreshing(false);
  };

  // Charger quartiers quand ville change
  useEffect(() => {
    if (!searchCity) {
      setNeighborhoods([]);
      setSearchNeighborhoodId('');
      return;
    }
    listNeighborhoods({ city: searchCity })
      .then(setNeighborhoods)
      .catch(() => setNeighborhoods([]));
  }, [searchCity]);

  // Charger équipements au premier besoin
  useEffect(() => {
    if (showSearchModal && !equipmentsLoaded) {
      listEquipments()
        .then((items) => {
          setEquipments(items);
          setEquipmentsLoaded(true);
        })
        .catch(() => {});
    }
  }, [showSearchModal, equipmentsLoaded]);

  // ===== Favoris
  const toggleFavorite = async (id: string) => {
    if (!user) {
      // tu peux router vers login si tu veux
      return;
    }

    const wasFav = favorites.has(id);
    setFavorites((prev) => {
      const next = new Set(prev);
      wasFav ? next.delete(id) : next.add(id);
      return next;
    });

    try {
      if (wasFav) await removeFavorite(id);
      else await addFavorite(id);
    } catch (e) {
      // revert
      setFavorites((prev) => {
        const next = new Set(prev);
        wasFav ? next.add(id) : next.delete(id);
        return next;
      });
    }
  };

  // ===== Navigation
  const navigateToProperty = (id: string) => {
    router.push(`/(tabs)/property/${id}`);
  };

  // ===== Filtres UI
  const handleCitySelect = (city: string) => {
    setSearchCity((prev) => (prev === city ? '' : city));
    setSearchNeighborhoodId('');
  };

  const handlePropertyTypeToggle = (type: string) => {
    setSearchPropertyTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  const toggleAmenity = (id: string) => {
    setSearchAmenities((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  };

  const resetFilters = () => {
    setSearchCity('');
    setSearchNeighborhoodId('');
    setSearchPropertyTypes([]);
    setSearchLocationType('');
    setSearchGuests(0);
    setSearchBedrooms(0);
    setSearchBeds(0);
    setSearchAmenities([]);
    setPriceMinNight(5000);
    setPriceMaxNight(500000);
    setPriceMinMonth(20000);
    setPriceMaxMonth(5000000);
    setSearchArrivalDate(null);
    setSearchDepartureDate(null);
    setShowCalendar(null);
  };

  // ===== Calendrier (visuel maquette conservé)
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    const d = new Date(year, month, 1).getDay();
    return d === 0 ? 6 : d - 1;
  };
  const formatDate = (date: Date) => `${date.getDate()} ${monthNames[date.getMonth()].substring(0, 3)}`;

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    if (showCalendar === 'departure' && searchArrivalDate && date <= searchArrivalDate) return true;
    return false;
  };

  const goToPreviousMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  const goToNextMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    if (showCalendar === 'arrival') {
      setSearchArrivalDate(selectedDate);
      if (searchDepartureDate && selectedDate >= searchDepartureDate) setSearchDepartureDate(null);
      setShowCalendar('departure');
    } else if (showCalendar === 'departure') {
      setSearchDepartureDate(selectedDate);
      setShowCalendar(null);
    }
  };

  const resetDates = () => {
    setSearchArrivalDate(null);
    setSearchDepartureDate(null);
  };

  const calculateNights = () => {
    if (!searchArrivalDate || !searchDepartureDate) return 0;
    const diffTime = Math.abs(searchDepartureDate.getTime() - searchArrivalDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatPeriodShort = () => {
    if (!searchArrivalDate) return null;
    const arrDay = searchArrivalDate.getDate();
    const arrMonth = searchArrivalDate.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');
    if (searchDepartureDate) {
      const depDay = searchDepartureDate.getDate();
      const depMonth = searchDepartureDate.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');
      if (searchArrivalDate.getMonth() === searchDepartureDate.getMonth()) return `${arrDay}-${depDay} ${depMonth}`;
      return `${arrDay} ${arrMonth} - ${depDay} ${depMonth}`;
    }
    return `Dès le ${arrDay} ${arrMonth}`;
  };

  const formatTotalPrice = (property: UiProperty) => {
    const nights = calculateNights();
    if (nights > 0 && property.priceUnit === 'nuit') {
      const total = property.price * nights;
      return { total: formatPrice(total), label: `pour ${nights} nuit${nights > 1 ? 's' : ''}` };
    } else if (nights >= 30 && property.priceUnit === 'mois') {
      const months = Math.ceil(nights / 30);
      const total = property.price * months;
      return { total: formatPrice(total), label: `pour ${months} mois (${nights} jours)` };
    } else if (nights > 0 && property.secondaryPrice && property.secondaryPriceUnit === 'nuit') {
      const total = property.secondaryPrice * nights;
      return { total: formatPrice(total), label: `pour ${nights} nuit${nights > 1 ? 's' : ''}` };
    }
    return null;
  };

  const buildFilterTitle = () => {
    const parts: string[] = [];
    parts.push(searchCity || 'Toutes les villes');
    if (searchPropertyTypes.length === 1) {
      const typeLabel = propertyTypes.find((t) => t.value === searchPropertyTypes[0])?.label;
      if (typeLabel) parts.push(typeLabel === 'Appartement' ? 'Appart.' : typeLabel);
    } else if (searchPropertyTypes.length > 1) {
      parts.push(`${searchPropertyTypes.length} types`);
    }
    if (searchLocationType) {
      if (searchLocationType === 'short') parts.push('Courte durée');
      else if (searchLocationType === 'long') parts.push('Longue durée');
      else if (searchLocationType === 'both') parts.push('Toute durée');
    }
    return parts.join(' · ');
  };

  const buildFilterDetails = () => {
    const parts: string[] = [];
    if (searchArrivalDate) parts.push(formatPeriodShort() || '');
    else parts.push('Dates flexibles');
    parts.push(`${searchGuests} voy.`);
    if (searchBedrooms > 1) parts.push(`${searchBedrooms} ch.`);
    return parts.join(' · ');
  };

  const performSearch = async () => {
    setShowSearchModal(false);
    setSearchLoading(true);

    const params: SearchPropertiesParams = {
      limit: 50,
      offset: 0,
      sort: 'recommended',
    };

    if (searchCity) params.city = searchCity;
    if (searchNeighborhoodId) params.neighborhoodId = searchNeighborhoodId;

    if (searchPropertyTypes.length === 1) params.propertyType = searchPropertyTypes[0];

    if (searchLocationType === 'short') params.rentalType = 'short_term';
    if (searchLocationType === 'long') params.rentalType = 'long_term';
    // both => pas de filtre

    if (searchGuests > 0) params.guests = searchGuests;
    if (searchBedrooms > 0) params.bedrooms = searchBedrooms;
    if (searchAmenities.length > 0) params.equipmentIds = searchAmenities;

    // prix
    if (searchLocationType === 'short' || searchLocationType === 'both' || searchLocationType === '') {
      if (priceMinNight > 5000) params.minPrice = priceMinNight;
      if (priceMaxNight < 500000) params.maxPrice = priceMaxNight;
    }
    if (searchLocationType === 'long') {
      if (priceMinMonth > 20000) params.minPrice = priceMinMonth;
      if (priceMaxMonth < 5000000) params.maxPrice = priceMaxMonth;
    }

    try {
      const data = await searchProperties(params);
      const mapped: UiProperty[] = (data.items || []).map(mapCardToUi);

      // sync favoris depuis résultats
      const fav = new Set(favorites);
      mapped.forEach((p) => (p.isFavorite ? fav.add(p.id) : fav.delete(p.id)));
      setFavorites(fav);

      setSearchTotal(data.total || mapped.length);

      const searchSection: Section = {
        id: 'search-results',
        title: 'Résultats de recherche',
        subtitle: buildFilterTitle(),
        properties: mapped,
        isConditional: true,
      };
      setShowAllSection(searchSection);
    } catch (e) {
      console.error('Erreur recherche:', e);
      setSearchTotal(0);
      setShowAllSection({
        id: 'search-results',
        title: 'Résultats de recherche',
        subtitle: buildFilterTitle(),
        properties: [],
        isConditional: true,
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const renderPropertyCard = (property: UiProperty, isRecent: boolean) => {
    const displayPrice = getDisplayPrice(property);
    const cardWidth = isRecent ? CARD_WIDTH_RECENT : CARD_WIDTH_NORMAL;
    const imageHeight = isRecent ? cardWidth : 144;
    const isFav = favorites.has(property.id);

    return (
      <TouchableOpacity key={property.id} style={[styles.propertyCard, { width: cardWidth }]} activeOpacity={0.9} onPress={() => navigateToProperty(property.id)}>
        <View style={[styles.imageContainer, { height: imageHeight }]}>
          <Image source={{ uri: property.image }} style={styles.propertyImage} />
          <LinearGradient colors={['transparent', 'transparent', 'rgba(0,0,0,0.4)']} style={styles.imageOverlay} />
          {property.isGuestFavorite && (
            <View style={styles.guestFavoriteBadge}>
              <Text style={styles.guestFavoriteBadgeText}>Coup de cœur</Text>
            </View>
          )}
          <TouchableOpacity style={styles.favoriteButton} onPress={() => toggleFavorite(property.id)} activeOpacity={0.8}>
            <HeartIcon size={20} color={isFav ? '#fbbf24' : '#ffffff'} filled={isFav} />
          </TouchableOpacity>
        </View>
        <View style={styles.propertyInfo}>
          {isRecent ? (
            <>
              <Text style={styles.propertyTitle} numberOfLines={2}>
                {property.title.includes('·') ? property.title.split('·')[1]?.trim() : property.title}
              </Text>
              <Text style={styles.propertyLocation}>{property.location}</Text>
              <View style={styles.propertyMeta}>
                <Text style={styles.propertyMetaText}>
                  {property.beds} lit{property.beds > 1 ? 's' : ''}
                </Text>
                <Text style={styles.propertyMetaDot}>·</Text>
                <StarIcon size={10} color="#fbbf24" filled />
                <Text style={styles.propertyRating}>{property.rating ? property.rating.toFixed(1) : 'Nouveau'}</Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.propertyTitle} numberOfLines={2}>{property.title}</Text>
              <Text style={styles.propertyLocation}>{property.location}</Text>
              <View style={styles.propertyMeta}>
                <Text style={styles.propertyPrice}>{formatPrice(displayPrice.price)} FCFA/{displayPrice.unit}</Text>
                <Text style={styles.propertyMetaDot}>·</Text>
                <StarIcon size={10} color="#fbbf24" filled />
                <Text style={styles.propertyRating}>{property.rating ? property.rating.toFixed(1) : 'Nouveau'}</Text>
              </View>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient colors={['#78350f', '#92400e', '#78350f', '#7f1d1d', '#78350f']} locations={[0, 0.25, 0.5, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      <KongoPattern />
      <View style={styles.particlesContainer}>
        {particles.map((p) => <FloatingParticle key={p.id} {...p} />)}
      </View>

      <View style={[styles.content, { paddingTop: insets.top }]}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.searchBar} onPress={() => setShowSearchModal(true)} activeOpacity={0.8}>
            <LinearGradient colors={['rgba(120, 53, 15, 0.8)', 'rgba(127, 29, 29, 0.8)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.searchBarGradient}>
              <SearchIconGradient size={28} />
              <View style={styles.searchBarText}>
                <Text style={styles.searchBarTitle}>Rechercher un logement</Text>
                <Text style={styles.searchBarSubtitle}>Destination · Dates · Voyageurs</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* SECTIONS */}
        {loadingHome ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fbbf24" />
            <Text style={styles.loadingText}>Chargement des logements...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fbbf24" colors={['#fbbf24']} />
            }
          >
            {sections.map((section) => (
              <View key={section.id} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    {section.subtitle && <Text style={styles.sectionSubtitle}> · {section.subtitle}</Text>}
                  </View>
                  <TouchableOpacity style={styles.seeAllButton} activeOpacity={0.7} onPress={() => setShowAllSection(section)}>
                    <Text style={styles.seeAllText}>Voir tout</Text>
                    <ChevronRightIcon size={16} color="#fbbf24" />
                  </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.propertiesList}>
                  {section.properties.map((p) => renderPropertyCard(p, section.id === 'recent'))}
                </ScrollView>
              </View>
            ))}

            {/* DESTINATIONS POPULAIRES */}
            <View style={styles.destinationsSection}>
              <Text style={styles.destinationsTitle}>Destinations populaires</Text>
              <View style={styles.destinationsGrid}>
                {Object.entries(destinationImages).map(([name, image]) => (
                  <TouchableOpacity
                    key={name}
                    style={styles.destinationCard}
                    activeOpacity={0.9}
                    onPress={() => {
                      setSearchCity(name);
                      setShowSearchModal(true);
                    }}
                  >
                    <Image source={{ uri: image }} style={styles.destinationImage} />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.destinationOverlay} />
                    <View style={styles.destinationInfo}>
                      <Text style={styles.destinationName}>{name}</Text>
                      <Text style={styles.destinationCount}>
                        {sections.find((s) => s.subtitle === name)?.properties.length || 0} logements
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      {/* ===============================
          MODAL RECHERCHE
      =============================== */}
      <Modal visible={showSearchModal} animationType="slide" presentationStyle="fullScreen">
        <View style={styles.modalContainer}>
          <LinearGradient colors={['#78350f', '#92400e', '#78350f']} style={StyleSheet.absoluteFillObject} />
          <KongoPattern />

          {/* Header Modal */}
          <View style={[styles.modalHeader, { paddingTop: insets.top + 16 }]}>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowSearchModal(false)}>
              <XIcon size={20} color="#fbbf24" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Rechercher</Text>
            <TouchableOpacity onPress={resetFilters}>
              <Text style={styles.modalClearBtn}>Effacer</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} contentContainerStyle={[styles.modalScrollContent, { paddingBottom: 120 }]}>
            {/* VILLE */}
            <View style={styles.filterSection}>
              <View style={styles.filterLabelRow}>
                <MapPinIcon size={14} color="#fcd34d" />
                <Text style={styles.filterLabel}>VILLE</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
                {cities.map((city) => (
                  <TouchableOpacity
                    key={city}
                    style={[styles.chip, searchCity === city && styles.chipActive]}
                    onPress={() => handleCitySelect(city)}
                  >
                    <Text style={[styles.chipText, searchCity === city && styles.chipTextActive]}>{city}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* QUARTIER (backend) */}
            {searchCity && neighborhoods.length > 0 && (
              <View style={styles.filterSection}>
                <View style={styles.filterLabelRow}>
                  <MapPinIcon size={14} color="#fcd34d" />
                  <Text style={styles.filterLabel}>QUARTIER</Text>
                  {searchNeighborhoodId ? (
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>1</Text>
                    </View>
                  ) : null}
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
                  {neighborhoods.map((n) => (
                    <TouchableOpacity
                      key={n.id}
                      style={[styles.chip, searchNeighborhoodId === n.id && styles.chipActive]}
                      onPress={() => setSearchNeighborhoodId((prev) => (prev === n.id ? '' : n.id))}
                    >
                      <Text style={[styles.chipText, searchNeighborhoodId === n.id && styles.chipTextActive]}>{n.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* TYPE DE LOGEMENT */}
            <View style={styles.filterSection}>
              <View style={styles.filterLabelRow}>
                <HomeIcon size={14} color="#fcd34d" />
                <Text style={styles.filterLabel}>TYPE DE LOGEMENT</Text>
                {searchPropertyTypes.length > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{searchPropertyTypes.length}</Text>
                  </View>
                )}
              </View>
              <View style={styles.chipsWrap}>
                {propertyTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[styles.chip, searchPropertyTypes.includes(type.value) && styles.chipActive]}
                    onPress={() => handlePropertyTypeToggle(type.value)}
                  >
                    <Text style={[styles.chipText, searchPropertyTypes.includes(type.value) && styles.chipTextActive]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* TYPE DE LOCATION */}
            <View style={styles.filterSection}>
              <View style={styles.filterLabelRow}>
                <HomeIcon size={14} color="#fcd34d" />
                <Text style={styles.filterLabel}>TYPE DE LOCATION</Text>
              </View>
              <View style={styles.locationTypeRow}>
                {locationTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[styles.locationTypeBtn, searchLocationType === type.value && styles.locationTypeBtnActive]}
                    onPress={() => setSearchLocationType((prev) => (prev === type.value ? '' : type.value))}
                  >
                    <Text style={[styles.locationTypeBtnText, searchLocationType === type.value && styles.locationTypeBtnTextActive]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* FOURCHETTE DE PRIX */}
            {searchLocationType && (
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>FOURCHETTE DE PRIX</Text>

                {(searchLocationType === 'short' || searchLocationType === 'both') && (
                  <View style={styles.priceBlock}>
                    <Text style={styles.priceBlockTitle}>Prix par nuit</Text>
                    <View style={styles.priceInputsRow}>
                      <View style={styles.priceInputBox}>
                        <Text style={styles.priceInputLabel}>Min</Text>
                        <Text style={styles.priceInputValue}>{formatPrice(priceMinNight)} FCFA</Text>
                      </View>
                      <View style={styles.priceInputBox}>
                        <Text style={styles.priceInputLabel}>Max</Text>
                        <Text style={styles.priceInputValue}>{formatPrice(priceMaxNight)} FCFA</Text>
                      </View>
                    </View>
                  </View>
                )}

                {(searchLocationType === 'long' || searchLocationType === 'both') && (
                  <View style={[styles.priceBlock, searchLocationType === 'both' && { marginTop: 16 }]}>
                    <Text style={styles.priceBlockTitle}>Prix par mois</Text>
                    <View style={styles.priceInputsRow}>
                      <View style={styles.priceInputBox}>
                        <Text style={styles.priceInputLabel}>Min</Text>
                        <Text style={styles.priceInputValue}>{formatPrice(priceMinMonth)} FCFA</Text>
                      </View>
                      <View style={styles.priceInputBox}>
                        <Text style={styles.priceInputLabel}>Max</Text>
                        <Text style={styles.priceInputValue}>{formatPrice(priceMaxMonth)} FCFA</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* DATES - CALENDRIER (maquette) */}
            <View style={[styles.filterSection, !searchLocationType && { opacity: 0.5 }]}>
              <View style={styles.filterLabelRow}>
                <CalendarIcon size={14} color="#fcd34d" />
                <Text style={styles.filterLabel}>DATES</Text>
                {!searchLocationType && <Text style={styles.filterHint}>(sélectionnez un type)</Text>}
              </View>

              <View style={styles.dateButtonsRow}>
                <TouchableOpacity
                  style={[styles.dateButton, searchArrivalDate && styles.dateButtonActive, showCalendar === 'arrival' && styles.dateButtonFocused]}
                  onPress={() => {
                    if (!searchLocationType) return;
                    if (showCalendar === 'arrival') setShowCalendar(null);
                    else {
                      setShowCalendar('arrival');
                      setCalendarMonth(searchArrivalDate || new Date());
                    }
                  }}
                  disabled={!searchLocationType}
                >
                  <Text style={styles.dateButtonLabel}>Arrivée{searchLocationType === 'short' ? ' *' : ''}</Text>
                  <Text style={[styles.dateButtonValue, searchArrivalDate && styles.dateButtonValueActive]}>
                    {searchArrivalDate ? formatDate(searchArrivalDate) : 'Sélectionner'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dateButton, searchDepartureDate && styles.dateButtonActive, showCalendar === 'departure' && styles.dateButtonFocused]}
                  onPress={() => {
                    if (!searchLocationType) return;
                    if (showCalendar === 'departure') setShowCalendar(null);
                    else {
                      setShowCalendar('departure');
                      setCalendarMonth(searchDepartureDate || searchArrivalDate || new Date());
                    }
                  }}
                  disabled={!searchLocationType}
                >
                  <Text style={styles.dateButtonLabel}>Départ{searchLocationType === 'short' ? ' *' : ' (opt.)'}</Text>
                  <Text style={[styles.dateButtonValue, searchDepartureDate && styles.dateButtonValueActive]}>
                    {searchDepartureDate ? formatDate(searchDepartureDate) : 'Sélectionner'}
                  </Text>
                </TouchableOpacity>
              </View>

              {showCalendar && (
                <View style={styles.calendarContainer}>
                  <View style={styles.calendarIndicator}>
                    <TouchableOpacity style={[styles.calendarIndicatorBtn, showCalendar === 'arrival' && styles.calendarIndicatorBtnActive]} onPress={() => setShowCalendar('arrival')}>
                      <Text style={styles.calendarIndicatorLabel}>Arrivée *</Text>
                      <Text style={styles.calendarIndicatorValue}>{searchArrivalDate ? formatDate(searchArrivalDate) : '-- ---'}</Text>
                    </TouchableOpacity>
                    <Text style={styles.calendarArrow}>→</Text>
                    <TouchableOpacity style={[styles.calendarIndicatorBtn, showCalendar === 'departure' && styles.calendarIndicatorBtnActive]} onPress={() => setShowCalendar('departure')}>
                      <Text style={styles.calendarIndicatorLabel}>Départ {searchLocationType === 'short' ? '*' : '(opt.)'}</Text>
                      <Text style={styles.calendarIndicatorValue}>{searchDepartureDate ? formatDate(searchDepartureDate) : '-- ---'}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.calendarNav}>
                    <TouchableOpacity style={styles.calendarNavBtn} onPress={goToPreviousMonth}>
                      <ChevronLeftIcon size={18} color="#fbbf24" />
                    </TouchableOpacity>
                    <Text style={styles.calendarNavTitle}>
                      {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                    </Text>
                    <TouchableOpacity style={styles.calendarNavBtn} onPress={goToNextMonth}>
                      <ChevronRightIcon size={18} color="#fbbf24" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.calendarWeekDays}>
                    {dayNames.map((d) => <Text key={d} style={styles.calendarWeekDay}>{d}</Text>)}
                  </View>

                  <View style={styles.calendarDaysGrid}>
                    {Array.from({ length: getFirstDayOfMonth(calendarMonth.getFullYear(), calendarMonth.getMonth()) }).map((_, i) => (
                      <View key={`e-${i}`} style={styles.calendarDayEmpty} />
                    ))}

                    {Array.from({ length: getDaysInMonth(calendarMonth.getFullYear(), calendarMonth.getMonth()) }).map((_, i) => {
                      const day = i + 1;
                      const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                      const disabled = isDateDisabled(date);
                      const isArrival = searchArrivalDate && date.toDateString() === searchArrivalDate.toDateString();
                      const isDeparture = searchDepartureDate && date.toDateString() === searchDepartureDate.toDateString();
                      const isInRange = searchArrivalDate && searchDepartureDate && date > searchArrivalDate && date < searchDepartureDate;
                      const isToday = date.toDateString() === new Date().toDateString();

                      return (
                        <TouchableOpacity
                          key={day}
                          style={[
                            styles.calendarDay,
                            isArrival && styles.calendarDayArrival,
                            isDeparture && styles.calendarDayDeparture,
                            isInRange && styles.calendarDayInRange,
                            isToday && !isArrival && !isDeparture && styles.calendarDayToday,
                            disabled && styles.calendarDayDisabled,
                          ]}
                          onPress={() => !disabled && handleDateSelect(day)}
                          disabled={disabled}
                        >
                          <Text
                            style={[
                              styles.calendarDayText,
                              (isArrival || isDeparture) && styles.calendarDayTextHighlight,
                              disabled && styles.calendarDayTextDisabled,
                            ]}
                          >
                            {day}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={styles.calendarLegend}>
                    <View style={styles.calendarLegendItem}>
                      <View style={[styles.calendarLegendDot, { backgroundColor: '#facc15' }]} />
                      <Text style={styles.calendarLegendText}>Arrivée</Text>
                    </View>
                    <View style={styles.calendarLegendItem}>
                      <View style={[styles.calendarLegendDot, { backgroundColor: '#f97316' }]} />
                      <Text style={styles.calendarLegendText}>Départ</Text>
                    </View>
                    {searchArrivalDate && searchDepartureDate && (
                      <View style={styles.calendarLegendItem}>
                        <View style={[styles.calendarLegendDot, { backgroundColor: 'rgba(180, 83, 9, 0.5)' }]} />
                        <Text style={styles.calendarLegendText}>Séjour</Text>
                      </View>
                    )}
                  </View>

                  {searchLocationType === 'short' && searchArrivalDate && !searchDepartureDate && (
                    <View style={styles.calendarError}>
                      <Text style={styles.calendarErrorText}>La date de départ est obligatoire pour une location courte durée</Text>
                    </View>
                  )}

                  <View style={styles.calendarActions}>
                    <TouchableOpacity style={styles.calendarActionBtnSecondary} onPress={resetDates}>
                      <Text style={styles.calendarActionBtnSecondaryText}>Réinitialiser</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.calendarActionBtnPrimary,
                        (!searchArrivalDate || (searchLocationType === 'short' && !searchDepartureDate)) && styles.calendarActionBtnDisabled,
                      ]}
                      onPress={() => setShowCalendar(null)}
                      disabled={!searchArrivalDate || (searchLocationType === 'short' && !searchDepartureDate)}
                    >
                      <Text style={styles.calendarActionBtnPrimaryText}>Valider</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* COMPTEURS */}
            <View style={styles.countersRow}>
              <View style={styles.counterBox}>
                <View style={styles.filterLabelRow}>
                  <UsersIcon size={14} color="#fcd34d" />
                  <Text style={styles.filterLabel}>VOYAGEURS</Text>
                </View>
                <View style={styles.counterControls}>
                  <TouchableOpacity style={styles.counterBtn} onPress={() => setSearchGuests(Math.max(0, searchGuests - 1))}>
                    <MinusIcon size={18} color="#fbbf24" />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{searchGuests === 0 ? '∞' : searchGuests}</Text>
                  <TouchableOpacity style={styles.counterBtn} onPress={() => setSearchGuests(Math.min(20, searchGuests + 1))}>
                    <PlusIcon size={18} color="#fbbf24" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.counterBox}>
                <View style={styles.filterLabelRow}>
                  <HomeIcon size={14} color="#fcd34d" />
                  <Text style={styles.filterLabel}>CHAMBRES</Text>
                </View>
                <View style={styles.counterControls}>
                  <TouchableOpacity style={styles.counterBtn} onPress={() => setSearchBedrooms(Math.max(0, searchBedrooms - 1))}>
                    <MinusIcon size={18} color="#fbbf24" />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{searchBedrooms === 0 ? '∞' : searchBedrooms}</Text>
                  <TouchableOpacity style={styles.counterBtn} onPress={() => setSearchBedrooms(Math.min(10, searchBedrooms + 1))}>
                    <PlusIcon size={18} color="#fbbf24" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={[styles.countersRow, { marginTop: 12 }]}>
              <View style={styles.counterBox}>
                <View style={styles.filterLabelRow}>
                  <HomeIcon size={14} color="#fcd34d" />
                  <Text style={styles.filterLabel}>LITS</Text>
                </View>
                <View style={styles.counterControls}>
                  <TouchableOpacity style={styles.counterBtn} onPress={() => setSearchBeds(Math.max(0, searchBeds - 1))}>
                    <MinusIcon size={18} color="#fbbf24" />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{searchBeds === 0 ? '∞' : searchBeds}</Text>
                  <TouchableOpacity style={styles.counterBtn} onPress={() => setSearchBeds(Math.min(20, searchBeds + 1))}>
                    <PlusIcon size={18} color="#fbbf24" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={[styles.counterBox, { opacity: 0 }]} />
            </View>

            {/* ÉQUIPEMENTS (backend) avec icônes A */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>ÉQUIPEMENTS SOUHAITÉS</Text>
              {!equipmentsLoaded ? (
                <ActivityIndicator size="small" color="#fbbf24" style={{ marginTop: 8 }} />
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.amenitiesContainer}>
                  {Array.from({ length: Math.ceil(equipments.length / 4) }).map((_, colIndex) => (
                    <View key={colIndex} style={styles.amenityColumn}>
                      {equipments.slice(colIndex * 4, colIndex * 4 + 4).map((eq) => {
                        const Icon = pickAmenityIcon({ name: eq.name, category: (eq as any).category });
                        const isSelected = searchAmenities.includes(eq.id);

                        return (
                          <TouchableOpacity
                            key={eq.id}
                            style={[styles.amenityItem, isSelected && styles.amenityItemActive]}
                            onPress={() => toggleAmenity(eq.id)}
                          >
                            <Icon size={18} color={isSelected ? '#fbbf24' : '#fcd34d'} />
                            <Text style={[styles.amenityLabel, isSelected && styles.amenityLabelActive]}>{eq.name}</Text>
                            {isSelected && <CheckIcon size={14} color="#fbbf24" />}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </ScrollView>

          {/* Footer Modal */}
          <View style={[styles.modalFooter, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity style={styles.searchButton} onPress={performSearch} activeOpacity={0.9}>
              <LinearGradient colors={['#facc15', '#f59e0b']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.searchButtonGradient}>
                <AdinkraSearchIcon size={24} color="#78350f" active />
                <Text style={styles.searchButtonText}>Rechercher</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ===============================
          MODAL VOIR TOUT
      =============================== */}
      <Modal visible={showAllSection !== null} animationType="slide" presentationStyle="fullScreen">
        {showAllSection && (
          <View style={styles.voirToutContainer}>
            <LinearGradient colors={['#78350f', '#92400e', '#78350f']} style={StyleSheet.absoluteFillObject} />
            <KongoPattern />

            <View style={[styles.voirToutHeader, { paddingTop: insets.top + 8 }]}>
              <TouchableOpacity
                style={styles.voirToutBackBtn}
                onPress={() => {
                  setShowAllSection(null);
                  if (showAllSection?.id === 'search-results') resetFilters();
                }}
              >
                <ArrowLeftIcon size={20} color="#fcd34d" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.voirToutSearchBar} onPress={() => setShowSearchModal(true)} activeOpacity={0.8}>
                <View style={styles.voirToutSearchBarContent}>
                  <Text style={styles.voirToutSearchTitle} numberOfLines={1}>
                    {showAllSection.id === 'search-results' ? buildFilterTitle() : (showAllSection.subtitle || showAllSection.title)}
                  </Text>
                  <Text style={styles.voirToutSearchSubtitle} numberOfLines={1}>
                    {showAllSection.id === 'search-results' ? buildFilterDetails() : 'Dates · Voyageurs'}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.voirToutFilterBtn} onPress={() => setShowSearchModal(true)}>
                <SlidersIcon size={18} color="#fcd34d" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.voirToutScroll}
              contentContainerStyle={[styles.voirToutScrollContent, { paddingBottom: 120 + insets.bottom }]}
              showsVerticalScrollIndicator={false}
            >
              {searchLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#fbbf24" />
                  <Text style={styles.loadingText}>Recherche en cours...</Text>
                </View>
              ) : showAllSection.properties.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateEmoji}>🏠</Text>
                  <Text style={styles.emptyStateTitle}>Aucun logement trouvé</Text>
                  <Text style={styles.emptyStateText}>Essayez de modifier vos filtres pour trouver plus de logements</Text>
                  <TouchableOpacity style={styles.emptyStateButton} onPress={() => { resetFilters(); setShowAllSection(null); }}>
                    <Text style={styles.emptyStateButtonText}>Réinitialiser les filtres</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {showAllSection.properties.map((property) => {
                    const displayPrice = getDisplayPrice(property);
                    const isMixedPrice = !!property.secondaryPrice;
                    const images = getPropertyImages(property);
                    const currentIndex = getCarouselIndex(property.id);
                    const totalPrice = formatTotalPrice(property);
                    const nights = calculateNights();
                    const isFav = favorites.has(property.id);

                    return (
                      <TouchableOpacity key={property.id} style={styles.voirToutCard} activeOpacity={0.95} onPress={() => navigateToProperty(property.id)}>
                        <View style={styles.voirToutImageContainer}>
                          <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={(e) => {
                              const newIndex = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 32));
                              if (newIndex !== currentIndex) {
                                setCarouselIndexes((prev) => ({ ...prev, [property.id]: newIndex }));
                              }
                            }}
                          >
                            {images.map((img, i) => (
                              <Image key={i} source={{ uri: img }} style={styles.voirToutImage} />
                            ))}
                          </ScrollView>

                          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.3)']} style={styles.voirToutImageOverlay} />

                          {property.isGuestFavorite ? (
                            <View style={styles.voirToutBadgeCoup}>
                              <Text style={styles.voirToutBadgeCoupText}>🏆 Coup de cœur voyageurs</Text>
                            </View>
                          ) : null}

                          <TouchableOpacity style={styles.voirToutFavoriteBtn} onPress={() => toggleFavorite(property.id)}>
                            <HeartIcon size={26} color={isFav ? '#fbbf24' : '#ffffff'} filled={isFav} />
                          </TouchableOpacity>

                          <View style={styles.voirToutDots}>
                            {images.map((_, i) => (
                              <View key={i} style={[styles.voirToutDot, i === currentIndex && styles.voirToutDotActive]} />
                            ))}
                          </View>
                        </View>

                        <View style={styles.voirToutInfo}>
                          <View style={styles.voirToutInfoHeader}>
                            <Text style={styles.voirToutTitle} numberOfLines={1}>{property.title}</Text>
                            <View style={styles.voirToutRating}>
                              <StarIcon size={14} color="#fbbf24" filled />
                              <Text style={styles.voirToutRatingText}>
                                {property.rating ? property.rating.toFixed(1) : 'Nouveau'}
                              </Text>
                              <Text style={styles.voirToutReviews}>({property.reviewsCount})</Text>
                            </View>
                          </View>

                          <Text style={styles.voirToutDescription} numberOfLines={1}>
                            {property.bedrooms} ch. · {property.beds} lit{property.beds > 1 ? 's' : ''} · {property.bathrooms} sdb
                          </Text>

                          <Text style={styles.voirToutLocation}>{property.location}</Text>

                          {searchArrivalDate && <Text style={styles.voirToutPeriod}>{formatPeriodShort()}</Text>}

                          {totalPrice && nights > 0 ? (
                            <Text style={styles.voirToutPrice}>
                              <Text style={styles.voirToutPriceBold}>{totalPrice.total} FCFA</Text>
                              <Text style={styles.voirToutPriceLabel}> {totalPrice.label}</Text>
                            </Text>
                          ) : (
                            <Text style={styles.voirToutPrice}>
                              <Text style={styles.voirToutPriceBold}>{formatPrice(displayPrice.price)} FCFA</Text>
                              <Text style={styles.voirToutPriceLabel}> / {displayPrice.unit}</Text>
                              {isMixedPrice && (
                                <Text style={styles.voirToutPriceAlt}>
                                  {' '}
                                  (aussi en {displayPrice.unit === 'nuit' ? 'longue durée' : 'courte durée'})
                                </Text>
                              )}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}

                  <View style={styles.voirToutCounter}>
                    <Text style={styles.voirToutCounterText}>
                      {showAllSection.id === 'search-results' ? searchTotal : showAllSection.properties.length}{' '}
                      logement{(showAllSection.id === 'search-results' ? searchTotal : showAllSection.properties.length) > 1 ? 's' : ''}
                      {showAllSection.subtitle ? ` à ${showAllSection.subtitle}` : ''}
                    </Text>
                    <Text style={styles.voirToutCounterHint}>Explorez plus avec les filtres</Text>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
};

// ===============================
// Styles (inchangés / issus de ta maquette A)
// ===============================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#78350f' },
  patternContainer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  particlesContainer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden', pointerEvents: 'none' },
  particle: { position: 'absolute', width: 4, height: 4, backgroundColor: '#fbbf24', borderRadius: 2 },
  content: { flex: 1, zIndex: 10 },

  // Loading
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  loadingText: { color: '#fcd34d', fontSize: 14, marginTop: 12 },

  // Header
  header: { paddingHorizontal: 12, paddingTop: 16, paddingBottom: 12 },
  searchBar: { borderRadius: 999, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(217, 119, 6, 0.5)' },
  searchBarGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  searchBarText: { flex: 1 },
  searchBarTitle: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
  searchBarSubtitle: { color: '#fcd34d', fontSize: 12 },

  // Sections
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 8 },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, marginBottom: 12 },
  sectionTitleContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  sectionTitle: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  sectionSubtitle: { color: '#fbbf24', fontWeight: '700', fontSize: 16 },
  seeAllButton: { flexDirection: 'row', alignItems: 'center' },
  seeAllText: { color: '#fbbf24', fontSize: 12, fontWeight: '500', marginRight: 2 },
  propertiesList: { paddingHorizontal: 12, gap: 12 },

  // Property Card
  propertyCard: { marginRight: 12 },
  imageContainer: { borderRadius: 16, overflow: 'hidden', marginBottom: 8, position: 'relative' },
  propertyImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageOverlay: { ...StyleSheet.absoluteFillObject },
  guestFavoriteBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  guestFavoriteBadgeText: { color: '#78350f', fontSize: 10, fontWeight: '600' },
  favoriteButton: { position: 'absolute', top: 8, right: 8, padding: 4 },
  propertyInfo: { paddingHorizontal: 2 },
  propertyTitle: { color: '#ffffff', fontWeight: '600', fontSize: 13, marginBottom: 2 },
  propertyLocation: { color: '#fcd34d', fontSize: 11, marginBottom: 2 },
  propertyMeta: { flexDirection: 'row', alignItems: 'center' },
  propertyMetaText: { color: 'rgba(252, 211, 77, 0.8)', fontSize: 11 },
  propertyPrice: { color: '#fcd34d', fontSize: 11 },
  propertyMetaDot: { color: 'rgba(252, 211, 77, 0.7)', fontSize: 11, marginHorizontal: 4 },
  propertyRating: { color: '#ffffff', fontSize: 11, marginLeft: 2 },

  // Modal
  modalContainer: { flex: 1, backgroundColor: '#78350f' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(180, 83, 9, 0.3)' },
  modalCloseBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(120, 53, 15, 0.5)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.3)' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#fbbf24' },
  modalClearBtn: { color: '#fbbf24', fontSize: 14, fontWeight: '500' },
  modalScroll: { flex: 1 },
  modalScrollContent: { padding: 16 },

  // Filters
  filterSection: { marginBottom: 24 },
  filterLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  filterLabel: { color: '#fcd34d', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  filterHint: { color: '#92400e', fontSize: 10, marginLeft: 4 },
  countBadge: { backgroundColor: 'rgba(180, 83, 9, 0.5)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginLeft: 8 },
  countBadgeText: { color: '#fcd34d', fontSize: 10, fontWeight: '600' },

  // Chips
  chipsContainer: { gap: 8 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: 'rgba(120, 53, 15, 0.5)', borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.5)' },
  chipActive: { backgroundColor: 'rgba(250, 204, 21, 0.2)', borderColor: '#fbbf24' },
  chipText: { color: '#fcd34d', fontSize: 14 },
  chipTextActive: { color: '#fbbf24', fontWeight: '600' },

  // Location Type
  locationTypeRow: { flexDirection: 'row', gap: 8 },
  locationTypeBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: 'rgba(120, 53, 15, 0.5)', borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.5)', alignItems: 'center' },
  locationTypeBtnActive: { backgroundColor: 'rgba(250, 204, 21, 0.2)', borderColor: '#fbbf24' },
  locationTypeBtnText: { color: '#fcd34d', fontSize: 13 },
  locationTypeBtnTextActive: { color: '#fbbf24', fontWeight: '600' },

  // Price
  priceBlock: { marginTop: 12 },
  priceBlockTitle: { color: '#fbbf24', fontSize: 14, marginBottom: 12 },
  priceInputsRow: { flexDirection: 'row', gap: 16 },
  priceInputBox: { flex: 1, backgroundColor: 'rgba(120, 53, 15, 0.3)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.5)' },
  priceInputLabel: { color: '#92400e', fontSize: 11, marginBottom: 4 },
  priceInputValue: { color: '#ffffff', fontSize: 14, fontWeight: '500' },

  // Dates
  dateButtonsRow: { flexDirection: 'row', gap: 12 },
  dateButton: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: 'rgba(120, 53, 15, 0.3)', borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.5)' },
  dateButtonActive: { backgroundColor: 'rgba(250, 204, 21, 0.15)', borderColor: '#fbbf24', borderWidth: 2 },
  dateButtonFocused: { borderColor: '#fbbf24', borderWidth: 2 },
  dateButtonLabel: { color: '#92400e', fontSize: 11, marginBottom: 4 },
  dateButtonValue: { color: '#fbbf24', fontSize: 14 },
  dateButtonValueActive: { color: '#ffffff', fontWeight: '500' },

  // Calendar
  calendarContainer: { marginTop: 16, backgroundColor: 'rgba(120, 53, 15, 0.5)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.5)' },
  calendarIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  calendarIndicatorBtn: { flex: 1, padding: 8, borderRadius: 12, backgroundColor: 'rgba(120, 53, 15, 0.3)' },
  calendarIndicatorBtnActive: { backgroundColor: 'rgba(250, 204, 21, 0.2)' },
  calendarIndicatorLabel: { color: '#92400e', fontSize: 10, textTransform: 'uppercase' },
  calendarIndicatorValue: { color: '#ffffff', fontSize: 13, fontWeight: '500' },
  calendarArrow: { color: '#92400e', marginHorizontal: 8, fontSize: 16 },
  calendarNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  calendarNavBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(120, 53, 15, 0.5)', alignItems: 'center', justifyContent: 'center' },
  calendarNavTitle: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  calendarWeekDays: { flexDirection: 'row', marginBottom: 8 },
  calendarWeekDay: { flex: 1, textAlign: 'center', color: '#92400e', fontSize: 12, fontWeight: '500' },
  calendarDaysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarDayEmpty: { width: '14.28%', height: 36 },
  calendarDay: { width: '14.28%', height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  calendarDayArrival: { backgroundColor: '#facc15' },
  calendarDayDeparture: { backgroundColor: '#f97316' },
  calendarDayInRange: { backgroundColor: 'rgba(180, 83, 9, 0.5)' },
  calendarDayToday: { borderWidth: 1, borderColor: '#fbbf24' },
  calendarDayDisabled: { opacity: 0.3 },
  calendarDayText: { color: '#fcd34d', fontSize: 14, fontWeight: '500' },
  calendarDayTextHighlight: { color: '#78350f', fontWeight: '700' },
  calendarDayTextDisabled: { color: '#92400e' },
  calendarLegend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 16 },
  calendarLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  calendarLegendDot: { width: 12, height: 12, borderRadius: 4 },
  calendarLegendText: { color: '#fbbf24', fontSize: 11 },
  calendarError: { marginTop: 12, padding: 8, borderRadius: 8, backgroundColor: 'rgba(127, 29, 29, 0.3)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.5)' },
  calendarErrorText: { color: '#fca5a5', fontSize: 12, textAlign: 'center' },
  calendarActions: { flexDirection: 'row', gap: 12, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(180, 83, 9, 0.3)' },
  calendarActionBtnSecondary: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(120, 53, 15, 0.3)', borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.5)', alignItems: 'center' },
  calendarActionBtnSecondaryText: { color: '#fbbf24', fontSize: 14, fontWeight: '500' },
  calendarActionBtnPrimary: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#fbbf24', alignItems: 'center' },
  calendarActionBtnPrimaryText: { color: '#78350f', fontSize: 14, fontWeight: '600' },
  calendarActionBtnDisabled: { backgroundColor: 'rgba(180, 83, 9, 0.3)' },

  // Counters
  countersRow: { flexDirection: 'row', gap: 12 },
  counterBox: { flex: 1, backgroundColor: 'rgba(120, 53, 15, 0.3)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.3)' },
  counterControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  counterBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(120, 53, 15, 0.5)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.5)' },
  counterValue: { color: '#ffffff', fontSize: 24, fontWeight: '700' },

  // Amenities
  amenitiesContainer: { gap: 12 },
  amenityColumn: { gap: 8, width: 160 },
  amenityItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, backgroundColor: 'rgba(120, 53, 15, 0.3)', borderWidth: 2, borderColor: 'rgba(180, 83, 9, 0.3)' },
  amenityItemActive: { backgroundColor: 'rgba(250, 204, 21, 0.15)', borderColor: '#fbbf24' },
  amenityLabel: { color: '#fcd34d', fontSize: 13, flex: 1 },
  amenityLabelActive: { color: '#ffffff' },

  // Modal Footer
  modalFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: 'rgba(69, 26, 3, 0.95)' },
  searchButton: { borderRadius: 16, overflow: 'hidden' },
  searchButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  searchButtonText: { color: '#78350f', fontSize: 18, fontWeight: '700' },

  // Voir Tout
  voirToutContainer: { flex: 1, backgroundColor: '#78350f' },
  voirToutHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(180, 83, 9, 0.3)', backgroundColor: 'rgba(120, 53, 15, 0.95)' },
  voirToutBackBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(120, 53, 15, 0.5)', alignItems: 'center', justifyContent: 'center' },
  voirToutSearchBar: { flex: 1, backgroundColor: 'rgba(120, 53, 15, 0.4)', borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.4)', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
  voirToutSearchBarContent: { alignItems: 'center' },
  voirToutSearchTitle: { color: '#ffffff', fontWeight: '600', fontSize: 12 },
  voirToutSearchSubtitle: { color: '#fbbf24', fontSize: 10 },
  voirToutFilterBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(120, 53, 15, 0.5)', borderWidth: 1, borderColor: 'rgba(180, 83, 9, 0.4)', alignItems: 'center', justifyContent: 'center' },
  voirToutScroll: { flex: 1 },
  voirToutScrollContent: { padding: 16, gap: 24 },
  voirToutCard: { marginBottom: 8 },
  voirToutImageContainer: { position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  voirToutImage: { width: SCREEN_WIDTH - 32, height: 256, resizeMode: 'cover' },
  voirToutImageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 },
  voirToutBadgeCoup: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  voirToutBadgeCoupText: { color: '#78350f', fontSize: 12, fontWeight: '600' },
  voirToutFavoriteBtn: { position: 'absolute', top: 12, right: 12, padding: 4 },
  voirToutDots: { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  voirToutDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  voirToutDotActive: { backgroundColor: '#ffffff' },
  voirToutInfo: {},
  voirToutInfoHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 },
  voirToutTitle: { color: '#ffffff', fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  voirToutRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  voirToutRatingText: { color: '#ffffff', fontSize: 14, fontWeight: '500' },
  voirToutReviews: { color: 'rgba(251, 191, 36, 0.7)', fontSize: 14 },
  voirToutDescription: { color: 'rgba(252, 211, 77, 0.8)', fontSize: 14, marginBottom: 2 },
  voirToutLocation: { color: 'rgba(251, 191, 36, 0.7)', fontSize: 14, marginBottom: 2 },
  voirToutPeriod: { color: 'rgba(251, 191, 36, 0.7)', fontSize: 14, marginBottom: 2 },
  voirToutPrice: { marginTop: 4 },
  voirToutPriceBold: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  voirToutPriceLabel: { color: '#fcd34d', fontSize: 14 },
  voirToutPriceAlt: { color: 'rgba(251, 191, 36, 0.6)', fontSize: 12 },
  voirToutCounter: { alignItems: 'center', paddingVertical: 24, borderTopWidth: 1, borderTopColor: 'rgba(180, 83, 9, 0.3)', marginTop: 16 },
  voirToutCounterText: { color: '#fcd34d', fontSize: 14, fontWeight: '500' },
  voirToutCounterHint: { color: 'rgba(146, 64, 14, 0.7)', fontSize: 12, marginTop: 4 },

  // Empty State
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyStateEmoji: { fontSize: 64, marginBottom: 16 },
  emptyStateTitle: { color: '#ffffff', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptyStateText: { color: '#fcd34d', fontSize: 14, textAlign: 'center', paddingHorizontal: 32, marginBottom: 24 },
  emptyStateButton: { backgroundColor: 'rgba(250, 204, 21, 0.2)', borderWidth: 1, borderColor: '#fbbf24', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  emptyStateButtonText: { color: '#fbbf24', fontSize: 14, fontWeight: '600' },

  // Destinations populaires
  destinationsSection: { marginTop: 24, paddingHorizontal: 16 },
  destinationsTitle: { color: '#ffffff', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  destinationsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  destinationCard: { width: (SCREEN_WIDTH - 32 - 10) / 2, height: 96, borderRadius: 16, overflow: 'hidden' },
  destinationImage: { position: 'absolute', width: '100%', height: '100%', resizeMode: 'cover' },
  destinationOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%' },
  destinationInfo: { position: 'absolute', bottom: 10, left: 10 },
  destinationName: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  destinationCount: { color: '#fcd34d', fontSize: 11 },
});

export default SearchScreen;