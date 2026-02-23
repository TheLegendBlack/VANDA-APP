// src/screens/SearchScreen.tsx
// 100% ISO conversion from vanda-search.tsx — fully backend-integrated
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  TextInput,
  FlatList,
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

// API
import {
  getHomeProperties,
  searchProperties,
  PropertyCardDto,
  HomeSection,
  SearchPropertiesParams,
} from '../api/properties';
import { listNeighborhoods, Neighborhood } from '../api/neighborhoods';
import { listEquipments, Equipment } from '../api/equipments';
import { addFavorite, removeFavorite } from '../api/favorites';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH_NORMAL = (SCREEN_WIDTH - 32 - 12) / 2.1;
const CARD_WIDTH_RECENT = (SCREEN_WIDTH - 32 - 24) / 3.15;

// ===============================
// ICÔNES SVG
// ===============================
interface IconProps {
  size?: number;
  color?: string;
}

const HeartIcon: React.FC<IconProps & { filled?: boolean }> = ({
  size = 20,
  color = '#fbbf24',
  filled = false,
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? color : 'rgba(0,0,0,0.4)'}
    stroke={color}
    strokeWidth={2}
  >
    <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </Svg>
);

const StarIcon: React.FC<IconProps & { filled?: boolean }> = ({
  size = 20,
  color = '#fbbf24',
  filled = false,
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? color : 'none'}
    stroke={color}
    strokeWidth={2}
  >
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);

const ChevronRightIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

const ChevronLeftIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M15 18l-6-6 6-6" />
  </Svg>
);

const XIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Line x1="18" y1="6" x2="6" y2="18" />
    <Line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
);

const ArrowLeftIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Line x1="19" y1="12" x2="5" y2="12" />
    <Path d="M12 19l-7-7 7-7" />
  </Svg>
);

const SlidersIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Line x1="4" y1="21" x2="4" y2="14" />
    <Line x1="4" y1="10" x2="4" y2="3" />
    <Line x1="12" y1="21" x2="12" y2="12" />
    <Line x1="12" y1="8" x2="12" y2="3" />
    <Line x1="20" y1="21" x2="20" y2="16" />
    <Line x1="20" y1="12" x2="20" y2="3" />
    <Line x1="1" y1="14" x2="7" y2="14" />
    <Line x1="9" y1="8" x2="15" y2="8" />
    <Line x1="17" y1="16" x2="23" y2="16" />
  </Svg>
);

const MapPinIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <Circle cx="12" cy="10" r="3" />
  </Svg>
);

const HomeIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <Path d="M9 22V12h6v10" />
  </Svg>
);

const UsersIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <Circle cx="9" cy="7" r="4" />
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
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
);

const PlusIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Line x1="12" y1="5" x2="12" y2="19" />
    <Line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
);

const CheckIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M20 6L9 17l-5-5" />
  </Svg>
);

// Icône équipement générique
const EquipmentIcon: React.FC<IconProps> = ({ size = 20, color = '#fbbf24' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M20 7h-9M14 17H5" />
    <Circle cx="17" cy="17" r="3" />
    <Circle cx="7" cy="7" r="3" />
  </Svg>
);

// Icône recherche Adinkra (gradient)
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

// Icône Adinkra Search pour le bouton rechercher
const AdinkraSearchIcon: React.FC<{ size?: number; color?: string; active?: boolean }> = ({
  size = 24,
  color = '#fbbf24',
  active = false,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Circle cx="12" cy="12" r="8" />
    <Path
      d="M12 8C12 8 15 10 15 12C15 14 12 16 12 16C12 16 9 14 9 12C9 10 12 8 12 8Z"
      fill={active ? color : 'none'}
    />
    <Circle cx="12" cy="12" r="2" fill={active ? color : 'none'} />
  </Svg>
);

// ===============================
// COMPOSANTS VISUELS
// ===============================
const FloatingParticle: React.FC<{
  delay: number;
  duration: number;
  startX: number;
  startY: number;
}> = ({ delay, duration, startX, startY }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -30,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: 20,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.7,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: 0,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: duration / 2,
            useNativeDriver: true,
          }),
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
        <Svg
          key={`${row}-${col}`}
          width={80}
          height={80}
          viewBox="0 0 80 80"
          style={{ position: 'absolute', left: col * 80, top: row * 80 }}
        >
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

// ===============================
// CONSTANTES
// ===============================
const cities = [
  'Brazzaville',
  'Pointe-Noire',
  'Dolisie',
  'Nkayi',
  'Ouesso',
  'Oyo',
  'Impfondo',
  'Sibiti',
  'Madingou',
  'Owando',
];

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
  { value: 'short_term' as const, label: 'Courte durée' },
  { value: 'long_term' as const, label: 'Longue durée' },
];

const monthNames = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];
const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const destinationImages: Record<string, string> = {
  Brazzaville: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
  'Pointe-Noire': 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
  Dolisie: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
  Nkayi: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
  Ouesso: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
  Oyo: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400',
};

type LocationType = 'short_term' | 'long_term' | '';
type CalendarMode = 'arrival' | 'departure' | null;
type SortMode = 'recommended' | 'price_asc' | 'price_desc' | 'recent' | 'rating';

// ===============================
// COMPOSANT PRINCIPAL
// ===============================
const SearchScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  // ===== États données =====
  const [homeSections, setHomeSections] = useState<HomeSection[]>([]);
  const [loadingHome, setLoadingHome] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [equipmentsLoaded, setEquipmentsLoaded] = useState(false);
  const [showSecondaryPrice, setShowSecondaryPrice] = useState(false);

  // ===== États recherche =====
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchCity, setSearchCity] = useState('');
  const [searchNeighborhoodId, setSearchNeighborhoodId] = useState('');
  const [searchPropertyTypes, setSearchPropertyTypes] = useState<string[]>([]);
  const [searchLocationType, setSearchLocationType] = useState<LocationType>('');
  const [searchGuests, setSearchGuests] = useState(0);
  const [searchBedrooms, setSearchBedrooms] = useState(0);
  const [searchBeds, setSearchBeds] = useState(0);
  const [searchAmenities, setSearchAmenities] = useState<string[]>([]);
  const [priceMinNight, setPriceMinNight] = useState(5000);
  const [priceMaxNight, setPriceMaxNight] = useState(500000);
  const [priceMinMonth, setPriceMinMonth] = useState(20000);
  const [priceMaxMonth, setPriceMaxMonth] = useState(5000000);
  const [sortMode, setSortMode] = useState<SortMode>('recommended');

  // ===== États calendrier =====
  const [showCalendar, setShowCalendar] = useState<CalendarMode>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [searchArrivalDate, setSearchArrivalDate] = useState<Date | null>(null);
  const [searchDepartureDate, setSearchDepartureDate] = useState<Date | null>(null);

  // ===== États "Voir tout" / résultats =====
  const [viewAllMode, setViewAllMode] = useState<
    | { type: 'section'; section: HomeSection }
    | { type: 'search'; title: string; subtitle: string }
    | null
  >(null);
  const [searchResults, setSearchResults] = useState<PropertyCardDto[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [carouselIndexes, setCarouselIndexes] = useState<Record<string, number>>({});

  // ===== Favoris locaux (cache optimiste) =====
  const [favoritesSet, setFavoritesSet] = useState<Set<string>>(new Set());

  // ===== Particules =====
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

  // ===== Chargement initial =====
  useEffect(() => {
    loadHome();
  }, []);

  // Alternance prix nuit/mois
  useEffect(() => {
    const interval = setInterval(() => setShowSecondaryPrice((prev) => !prev), 7000);
    return () => clearInterval(interval);
  }, []);

  // Charger quartiers quand la ville change
  useEffect(() => {
    if (searchCity) {
      listNeighborhoods({ city: searchCity }).then(setNeighborhoods).catch(() => {});
    } else {
      setNeighborhoods([]);
      setSearchNeighborhoodId('');
    }
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

  // ===== Fonctions données =====
  const loadHome = async () => {
    try {
      setLoadingHome(true);
      const data = await getHomeProperties({ limitPerCity: 6 });
      setHomeSections(data.sections || []);
      // Charger les favoris depuis les sections
      const favIds = new Set<string>();
      (data.sections || []).forEach((s) =>
        s.items.forEach((item) => {
          if (item.isFavorite) favIds.add(item.id);
        })
      );
      setFavoritesSet(favIds);
    } catch (err) {
      console.error('Erreur chargement home:', err);
    } finally {
      setLoadingHome(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHome();
    setRefreshing(false);
  };

  const performSearch = async () => {
    setShowSearchModal(false);

    const params: SearchPropertiesParams = {
      sort: sortMode,
      limit: 50,
      offset: 0,
    };

    if (searchCity) params.city = searchCity;
    if (searchNeighborhoodId) params.neighborhoodId = searchNeighborhoodId;
    if (searchPropertyTypes.length === 1) params.propertyType = searchPropertyTypes[0];
    if (searchLocationType) params.rentalType = searchLocationType as 'short_term' | 'long_term';
    if (searchGuests > 0) params.guests = searchGuests;
    if (searchBedrooms > 0) params.bedrooms = searchBedrooms;
    if (searchAmenities.length > 0) params.equipmentIds = searchAmenities;

    // Fourchette de prix
    if (searchLocationType === 'short_term' || (!searchLocationType && true)) {
      if (priceMinNight > 5000) params.minPrice = priceMinNight;
      if (priceMaxNight < 500000) params.maxPrice = priceMaxNight;
    }
    if (searchLocationType === 'long_term') {
      if (priceMinMonth > 20000) params.minPrice = priceMinMonth;
      if (priceMaxMonth < 5000000) params.maxPrice = priceMaxMonth;
    }

    setSearchLoading(true);
    setViewAllMode({
      type: 'search',
      title: buildFilterTitle(),
      subtitle: buildFilterDetails(),
    });

    try {
      const data = await searchProperties(params);
      setSearchResults(data.items || []);
      setSearchTotal(data.total || 0);

      // Mettre à jour les favoris
      const favIds = new Set(favoritesSet);
      (data.items || []).forEach((item) => {
        if (item.isFavorite) favIds.add(item.id);
        else favIds.delete(item.id);
      });
      setFavoritesSet(favIds);
    } catch (err) {
      console.error('Erreur recherche:', err);
      setSearchResults([]);
      setSearchTotal(0);
    } finally {
      setSearchLoading(false);
    }
  };

  // ===== Toggle favoris =====
  const toggleFavorite = async (propertyId: string) => {
    if (!user) return; // Non connecté

    const wasFav = favoritesSet.has(propertyId);
    // Optimistic update
    setFavoritesSet((prev) => {
      const next = new Set(prev);
      if (wasFav) next.delete(propertyId);
      else next.add(propertyId);
      return next;
    });

    try {
      if (wasFav) {
        await removeFavorite(propertyId);
      } else {
        await addFavorite(propertyId);
      }
    } catch (err) {
      // Revert on failure
      setFavoritesSet((prev) => {
        const next = new Set(prev);
        if (wasFav) next.add(propertyId);
        else next.delete(propertyId);
        return next;
      });
    }
  };

  // ===== Navigation =====
  const navigateToProperty = (id: string) => {
    router.push(`/(tabs)/property/${id}`);
  };

  // ===== Utilitaires =====
  const formatPrice = (price: number) => price.toLocaleString('fr-FR');

  const getDisplayPrice = (property: PropertyCardDto) => {
    if (property.pricePerMonth && property.pricePerNight && showSecondaryPrice) {
      return { price: property.pricePerMonth, unit: 'mois' as const };
    }
    if (property.pricePerNight) {
      return { price: property.pricePerNight, unit: 'nuit' as const };
    }
    if (property.pricePerMonth) {
      return { price: property.pricePerMonth, unit: 'mois' as const };
    }
    return { price: 0, unit: 'nuit' as const };
  };

  const getPropertyImage = (property: PropertyCardDto) => {
    if (property.heroPhoto?.url) return property.heroPhoto.url;
    if (property.photos?.length > 0 && property.photos[0].url) return property.photos[0].url;
    return 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800';
  };

  const getPropertyImages = (property: PropertyCardDto) => {
    const urls = (property.photos || [])
      .filter((p) => p.url)
      .map((p) => p.url as string);
    return urls.length > 0
      ? urls
      : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'];
  };

  // ===== Filtres =====
  const handleCitySelect = (city: string) => {
    setSearchCity(searchCity === city ? '' : city);
    setSearchNeighborhoodId('');
  };

  const handlePropertyTypeToggle = (type: string) => {
    setSearchPropertyTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleAmenity = (id: string) => {
    setSearchAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
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

  // ===== Calendrier =====
  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();

  const getFirstDayOfMonth = (year: number, month: number) => {
    const d = new Date(year, month, 1).getDay();
    return d === 0 ? 6 : d - 1;
  };

  const formatDate = (date: Date) =>
    `${date.getDate()} ${monthNames[date.getMonth()].substring(0, 3)}`;

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    if (showCalendar === 'departure' && searchArrivalDate && date <= searchArrivalDate)
      return true;
    return false;
  };

  const goToPreviousMonth = () =>
    setCalendarMonth(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
    );
  const goToNextMonth = () =>
    setCalendarMonth(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
    );

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      day
    );
    if (showCalendar === 'arrival') {
      setSearchArrivalDate(selectedDate);
      if (searchDepartureDate && selectedDate >= searchDepartureDate)
        setSearchDepartureDate(null);
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
    const diffTime = Math.abs(
      searchDepartureDate.getTime() - searchArrivalDate.getTime()
    );
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatPeriodShort = () => {
    if (!searchArrivalDate) return null;
    const arrDay = searchArrivalDate.getDate();
    const arrMonth = searchArrivalDate
      .toLocaleDateString('fr-FR', { month: 'short' })
      .replace('.', '');
    if (searchDepartureDate) {
      const depDay = searchDepartureDate.getDate();
      const depMonth = searchDepartureDate
        .toLocaleDateString('fr-FR', { month: 'short' })
        .replace('.', '');
      if (searchArrivalDate.getMonth() === searchDepartureDate.getMonth()) {
        return `${arrDay}-${depDay} ${depMonth}`;
      }
      return `${arrDay} ${arrMonth} - ${depDay} ${depMonth}`;
    }
    return `Dès le ${arrDay} ${arrMonth}`;
  };

  const formatTotalPrice = (property: PropertyCardDto) => {
    const nights = calculateNights();
    if (nights > 0 && property.pricePerNight) {
      const total = property.pricePerNight * nights;
      return {
        total: formatPrice(total),
        label: `pour ${nights} nuit${nights > 1 ? 's' : ''}`,
      };
    }
    if (nights >= 30 && property.pricePerMonth) {
      const months = Math.ceil(nights / 30);
      const total = property.pricePerMonth * months;
      return { total: formatPrice(total), label: `pour ${months} mois (${nights} jours)` };
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
    if (searchLocationType === 'short_term') parts.push('Courte durée');
    else if (searchLocationType === 'long_term') parts.push('Longue durée');
    return parts.join(' · ');
  };

  const buildFilterDetails = () => {
    const parts: string[] = [];
    if (searchArrivalDate) {
      parts.push(formatPeriodShort() || '');
    } else {
      parts.push('Dates flexibles');
    }
    parts.push(`${searchGuests} voy.`);
    if (searchBedrooms > 1) parts.push(`${searchBedrooms} ch.`);
    return parts.join(' · ');
  };

  const getCarouselIndex = (propertyId: string) => carouselIndexes[propertyId] || 0;

  // ===== Données pour la vue =====
  const viewAllItems = useMemo(() => {
    if (!viewAllMode) return [];
    if (viewAllMode.type === 'section') return viewAllMode.section.items;
    return searchResults;
  }, [viewAllMode, searchResults]);

  const viewAllTitle = useMemo(() => {
    if (!viewAllMode) return '';
    if (viewAllMode.type === 'section') {
      return viewAllMode.section.title;
    }
    return viewAllMode.title;
  }, [viewAllMode]);

  const viewAllSubtitle = useMemo(() => {
    if (!viewAllMode) return '';
    if (viewAllMode.type === 'section') return viewAllMode.section.city;
    return viewAllMode.subtitle;
  }, [viewAllMode]);

  // ===============================
  // RENDER: CARTE PROPRIÉTÉ (horizontale)
  // ===============================
  const renderPropertyCard = (property: PropertyCardDto, isCompact: boolean = false) => {
    const displayPrice = getDisplayPrice(property);
    const cardWidth = isCompact ? CARD_WIDTH_RECENT : CARD_WIDTH_NORMAL;
    const imageHeight = isCompact ? cardWidth : 144;
    const isFav = favoritesSet.has(property.id);

    return (
      <TouchableOpacity
        key={property.id}
        style={[styles.propertyCard, { width: cardWidth }]}
        activeOpacity={0.9}
        onPress={() => navigateToProperty(property.id)}
      >
        <View style={[styles.imageContainer, { height: imageHeight }]}>
          <Image source={{ uri: getPropertyImage(property) }} style={styles.propertyImage} />
          <LinearGradient
            colors={['transparent', 'transparent', 'rgba(0,0,0,0.4)']}
            style={styles.imageOverlay}
          />
          {property.qualityScore && property.qualityScore > 5 && (
            <View style={styles.guestFavoriteBadge}>
              <Text style={styles.guestFavoriteBadgeText}>Coup de cœur</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(property.id)}
            activeOpacity={0.8}
          >
            <HeartIcon size={20} color={isFav ? '#fbbf24' : '#ffffff'} filled={isFav} />
          </TouchableOpacity>
        </View>
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyTitle} numberOfLines={2}>
            {property.title}
          </Text>
          <Text style={styles.propertyLocation}>
            {property.neighborhood?.name || property.city}
          </Text>
          <View style={styles.propertyMeta}>
            {!isCompact && (
              <>
                <Text style={styles.propertyPrice}>
                  {formatPrice(displayPrice.price)} FCFA/{displayPrice.unit}
                </Text>
                <Text style={styles.propertyMetaDot}>·</Text>
              </>
            )}
            {isCompact && (
              <>
                <Text style={styles.propertyMetaText}>
                  {property.beds} lit{property.beds > 1 ? 's' : ''}
                </Text>
                <Text style={styles.propertyMetaDot}>·</Text>
              </>
            )}
            <StarIcon size={10} color="#fbbf24" filled />
            <Text style={styles.propertyRating}>
              {property.rating.avg ? property.rating.avg.toFixed(1) : 'Nouveau'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ===============================
  // RENDER: VUE PRINCIPALE
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
        {particles.map((p) => (
          <FloatingParticle key={p.id} {...p} />
        ))}
      </View>

      <View style={[styles.content, { paddingTop: insets.top }]}>
        {/* HEADER - Barre de recherche */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => setShowSearchModal(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(120, 53, 15, 0.8)', 'rgba(127, 29, 29, 0.8)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.searchBarGradient}
            >
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
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#fbbf24"
                colors={['#fbbf24']}
              />
            }
          >
            {homeSections.map((section) => (
              <View key={section.key} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>Logements</Text>
                    <Text style={styles.sectionSubtitle}> · {section.city}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.seeAllButton}
                    activeOpacity={0.7}
                    onPress={() => setViewAllMode({ type: 'section', section })}
                  >
                    <Text style={styles.seeAllText}>Voir tout</Text>
                    <ChevronRightIcon size={16} color="#fbbf24" />
                  </TouchableOpacity>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.propertiesList}
                >
                  {section.items.map((p) => renderPropertyCard(p, false))}
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
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.7)']}
                      style={styles.destinationOverlay}
                    />
                    <View style={styles.destinationInfo}>
                      <Text style={styles.destinationName}>{name}</Text>
                      <Text style={styles.destinationCount}>
                        {homeSections.find((s) => s.city === name)?.items.length || 0} logements
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
          <LinearGradient
            colors={['#78350f', '#92400e', '#78350f']}
            style={StyleSheet.absoluteFillObject}
          />
          <KongoPattern />

          {/* Header Modal */}
          <View style={[styles.modalHeader, { paddingTop: insets.top + 16 }]}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowSearchModal(false)}
            >
              <XIcon size={20} color="#fbbf24" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Rechercher</Text>
            <TouchableOpacity onPress={resetFilters}>
              <Text style={styles.modalClearBtn}>Effacer</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={[styles.modalScrollContent, { paddingBottom: 120 }]}
            showsVerticalScrollIndicator={false}
          >
            {/* VILLE */}
            <View style={styles.filterSection}>
              <View style={styles.filterLabelRow}>
                <MapPinIcon size={14} color="#fcd34d" />
                <Text style={styles.filterLabel}>VILLE</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsContainer}
              >
                {cities.map((city) => (
                  <TouchableOpacity
                    key={city}
                    style={[styles.chip, searchCity === city && styles.chipActive]}
                    onPress={() => handleCitySelect(city)}
                  >
                    <Text style={[styles.chipText, searchCity === city && styles.chipTextActive]}>
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* QUARTIER */}
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
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipsContainer}
                >
                  {neighborhoods.map((n) => (
                    <TouchableOpacity
                      key={n.id}
                      style={[styles.chip, searchNeighborhoodId === n.id && styles.chipActive]}
                      onPress={() =>
                        setSearchNeighborhoodId(searchNeighborhoodId === n.id ? '' : n.id)
                      }
                    >
                      <Text
                        style={[
                          styles.chipText,
                          searchNeighborhoodId === n.id && styles.chipTextActive,
                        ]}
                      >
                        {n.name}
                      </Text>
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
                    style={[
                      styles.chip,
                      searchPropertyTypes.includes(type.value) && styles.chipActive,
                    ]}
                    onPress={() => handlePropertyTypeToggle(type.value)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        searchPropertyTypes.includes(type.value) && styles.chipTextActive,
                      ]}
                    >
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
                    style={[
                      styles.locationTypeBtn,
                      searchLocationType === type.value && styles.locationTypeBtnActive,
                    ]}
                    onPress={() =>
                      setSearchLocationType(
                        searchLocationType === type.value ? '' : type.value
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.locationTypeBtnText,
                        searchLocationType === type.value && styles.locationTypeBtnTextActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* FOURCHETTE DE PRIX */}
            {searchLocationType !== '' && (
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>FOURCHETTE DE PRIX</Text>
                {searchLocationType === 'short_term' && (
                  <View style={styles.priceBlock}>
                    <Text style={styles.priceBlockTitle}>Prix par nuit</Text>
                    <View style={styles.priceInputsRow}>
                      <View style={styles.priceInputBox}>
                        <Text style={styles.priceInputLabel}>Min</Text>
                        <Text style={styles.priceInputValue}>
                          {formatPrice(priceMinNight)} FCFA
                        </Text>
                      </View>
                      <View style={styles.priceInputBox}>
                        <Text style={styles.priceInputLabel}>Max</Text>
                        <Text style={styles.priceInputValue}>
                          {formatPrice(priceMaxNight)} FCFA
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
                {searchLocationType === 'long_term' && (
                  <View style={styles.priceBlock}>
                    <Text style={styles.priceBlockTitle}>Prix par mois</Text>
                    <View style={styles.priceInputsRow}>
                      <View style={styles.priceInputBox}>
                        <Text style={styles.priceInputLabel}>Min</Text>
                        <Text style={styles.priceInputValue}>
                          {formatPrice(priceMinMonth)} FCFA
                        </Text>
                      </View>
                      <View style={styles.priceInputBox}>
                        <Text style={styles.priceInputLabel}>Max</Text>
                        <Text style={styles.priceInputValue}>
                          {formatPrice(priceMaxMonth)} FCFA
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* DATES - CALENDRIER */}
            <View
              style={[styles.filterSection, !searchLocationType && { opacity: 0.5 }]}
            >
              <View style={styles.filterLabelRow}>
                <CalendarIcon size={14} color="#fcd34d" />
                <Text style={styles.filterLabel}>DATES</Text>
                {!searchLocationType && (
                  <Text style={styles.filterHint}>(sélectionnez un type)</Text>
                )}
              </View>

              <View style={styles.dateButtonsRow}>
                <TouchableOpacity
                  style={[
                    styles.dateButton,
                    searchArrivalDate && styles.dateButtonActive,
                    showCalendar === 'arrival' && styles.dateButtonFocused,
                  ]}
                  onPress={() => {
                    if (!searchLocationType) return;
                    setShowCalendar(showCalendar === 'arrival' ? null : 'arrival');
                    setCalendarMonth(searchArrivalDate || new Date());
                  }}
                  disabled={!searchLocationType}
                >
                  <Text style={styles.dateButtonLabel}>
                    Arrivée{searchLocationType === 'short_term' ? ' *' : ''}
                  </Text>
                  <Text
                    style={[
                      styles.dateButtonValue,
                      searchArrivalDate && styles.dateButtonValueActive,
                    ]}
                  >
                    {searchArrivalDate ? formatDate(searchArrivalDate) : 'Sélectionner'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.dateButton,
                    searchDepartureDate && styles.dateButtonActive,
                    showCalendar === 'departure' && styles.dateButtonFocused,
                  ]}
                  onPress={() => {
                    if (!searchLocationType) return;
                    setShowCalendar(showCalendar === 'departure' ? null : 'departure');
                    setCalendarMonth(
                      searchDepartureDate || searchArrivalDate || new Date()
                    );
                  }}
                  disabled={!searchLocationType}
                >
                  <Text style={styles.dateButtonLabel}>
                    Départ{searchLocationType === 'short_term' ? ' *' : ' (opt.)'}
                  </Text>
                  <Text
                    style={[
                      styles.dateButtonValue,
                      searchDepartureDate && styles.dateButtonValueActive,
                    ]}
                  >
                    {searchDepartureDate ? formatDate(searchDepartureDate) : 'Sélectionner'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Calendrier inline */}
              {showCalendar && (
                <View style={styles.calendarContainer}>
                  <View style={styles.calendarIndicator}>
                    <TouchableOpacity
                      style={[
                        styles.calendarIndicatorBtn,
                        showCalendar === 'arrival' && styles.calendarIndicatorBtnActive,
                      ]}
                      onPress={() => setShowCalendar('arrival')}
                    >
                      <Text style={styles.calendarIndicatorLabel}>Arrivée *</Text>
                      <Text style={styles.calendarIndicatorValue}>
                        {searchArrivalDate ? formatDate(searchArrivalDate) : '-- ---'}
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.calendarArrow}>→</Text>
                    <TouchableOpacity
                      style={[
                        styles.calendarIndicatorBtn,
                        showCalendar === 'departure' && styles.calendarIndicatorBtnActive,
                      ]}
                      onPress={() => setShowCalendar('departure')}
                    >
                      <Text style={styles.calendarIndicatorLabel}>
                        Départ{searchLocationType === 'short_term' ? ' *' : ' (opt.)'}
                      </Text>
                      <Text style={styles.calendarIndicatorValue}>
                        {searchDepartureDate ? formatDate(searchDepartureDate) : '-- ---'}
                      </Text>
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
                    {dayNames.map((d) => (
                      <Text key={d} style={styles.calendarWeekDay}>
                        {d}
                      </Text>
                    ))}
                  </View>

                  <View style={styles.calendarDaysGrid}>
                    {Array.from({
                      length: getFirstDayOfMonth(
                        calendarMonth.getFullYear(),
                        calendarMonth.getMonth()
                      ),
                    }).map((_, i) => (
                      <View key={`e-${i}`} style={styles.calendarDayEmpty} />
                    ))}
                    {Array.from({
                      length: getDaysInMonth(
                        calendarMonth.getFullYear(),
                        calendarMonth.getMonth()
                      ),
                    }).map((_, i) => {
                      const day = i + 1;
                      const date = new Date(
                        calendarMonth.getFullYear(),
                        calendarMonth.getMonth(),
                        day
                      );
                      const disabled = isDateDisabled(date);
                      const isArrival =
                        searchArrivalDate &&
                        date.toDateString() === searchArrivalDate.toDateString();
                      const isDeparture =
                        searchDepartureDate &&
                        date.toDateString() === searchDepartureDate.toDateString();
                      const isInRange =
                        searchArrivalDate &&
                        searchDepartureDate &&
                        date > searchArrivalDate &&
                        date < searchDepartureDate;
                      const isToday = date.toDateString() === new Date().toDateString();

                      return (
                        <TouchableOpacity
                          key={day}
                          style={[
                            styles.calendarDay,
                            isArrival && styles.calendarDayArrival,
                            isDeparture && styles.calendarDayDeparture,
                            isInRange && styles.calendarDayInRange,
                            isToday &&
                              !isArrival &&
                              !isDeparture &&
                              styles.calendarDayToday,
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
                        <View
                          style={[
                            styles.calendarLegendDot,
                            { backgroundColor: 'rgba(180, 83, 9, 0.5)' },
                          ]}
                        />
                        <Text style={styles.calendarLegendText}>Séjour</Text>
                      </View>
                    )}
                  </View>

                  {searchLocationType === 'short_term' &&
                    searchArrivalDate &&
                    !searchDepartureDate && (
                      <View style={styles.calendarError}>
                        <Text style={styles.calendarErrorText}>
                          La date de départ est obligatoire pour une location courte durée
                        </Text>
                      </View>
                    )}

                  <View style={styles.calendarActions}>
                    <TouchableOpacity
                      style={styles.calendarActionBtnSecondary}
                      onPress={resetDates}
                    >
                      <Text style={styles.calendarActionBtnSecondaryText}>Effacer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.calendarActionBtnPrimary,
                        searchLocationType === 'short_term' &&
                          searchArrivalDate &&
                          !searchDepartureDate &&
                          styles.calendarActionBtnDisabled,
                      ]}
                      onPress={() => setShowCalendar(null)}
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
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setSearchGuests(Math.max(0, searchGuests - 1))}
                  >
                    <MinusIcon size={18} color="#fbbf24" />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>
                    {searchGuests === 0 ? '∞' : searchGuests}
                  </Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setSearchGuests(Math.min(20, searchGuests + 1))}
                  >
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
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setSearchBedrooms(Math.max(0, searchBedrooms - 1))}
                  >
                    <MinusIcon size={18} color="#fbbf24" />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>
                    {searchBedrooms === 0 ? '∞' : searchBedrooms}
                  </Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setSearchBedrooms(Math.min(10, searchBedrooms + 1))}
                  >
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
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setSearchBeds(Math.max(0, searchBeds - 1))}
                  >
                    <MinusIcon size={18} color="#fbbf24" />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>
                    {searchBeds === 0 ? '∞' : searchBeds}
                  </Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setSearchBeds(Math.min(20, searchBeds + 1))}
                  >
                    <PlusIcon size={18} color="#fbbf24" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={[styles.counterBox, { opacity: 0 }]} />
            </View>

            {/* ÉQUIPEMENTS */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>ÉQUIPEMENTS SOUHAITÉS</Text>
              {equipments.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.amenitiesContainer}
                >
                  {Array.from({ length: Math.ceil(equipments.length / 4) }).map(
                    (_, colIndex) => (
                      <View key={colIndex} style={styles.amenityColumn}>
                        {equipments
                          .slice(colIndex * 4, colIndex * 4 + 4)
                          .map((eq) => {
                            const isSelected = searchAmenities.includes(eq.id);
                            return (
                              <TouchableOpacity
                                key={eq.id}
                                style={[
                                  styles.amenityItem,
                                  isSelected && styles.amenityItemActive,
                                ]}
                                onPress={() => toggleAmenity(eq.id)}
                              >
                                <EquipmentIcon
                                  size={18}
                                  color={isSelected ? '#fbbf24' : '#fcd34d'}
                                />
                                <Text
                                  style={[
                                    styles.amenityLabel,
                                    isSelected && styles.amenityLabelActive,
                                  ]}
                                >
                                  {eq.name}
                                </Text>
                                {isSelected && <CheckIcon size={14} color="#fbbf24" />}
                              </TouchableOpacity>
                            );
                          })}
                      </View>
                    )
                  )}
                </ScrollView>
              ) : (
                <ActivityIndicator size="small" color="#fbbf24" style={{ marginTop: 8 }} />
              )}
            </View>
          </ScrollView>

          {/* Footer Modal - Bouton Rechercher */}
          <View style={[styles.modalFooter, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={performSearch}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#facc15', '#f59e0b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.searchButtonGradient}
              >
                <AdinkraSearchIcon size={24} color="#78350f" active />
                <Text style={styles.searchButtonText}>Rechercher</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ===============================
          MODAL VOIR TOUT / RÉSULTATS
      =============================== */}
      <Modal
        visible={viewAllMode !== null}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        {viewAllMode && (
          <View style={styles.voirToutContainer}>
            <LinearGradient
              colors={['#78350f', '#92400e', '#78350f']}
              style={StyleSheet.absoluteFillObject}
            />
            <KongoPattern />

            {/* Header sticky */}
            <View style={[styles.voirToutHeader, { paddingTop: insets.top + 8 }]}>
              <TouchableOpacity
                style={styles.voirToutBackBtn}
                onPress={() => {
                  setViewAllMode(null);
                  if (viewAllMode.type === 'search') resetFilters();
                }}
              >
                <ArrowLeftIcon size={20} color="#fcd34d" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.voirToutSearchBar}
                onPress={() => setShowSearchModal(true)}
                activeOpacity={0.8}
              >
                <View style={styles.voirToutSearchBarContent}>
                  <Text style={styles.voirToutSearchTitle} numberOfLines={1}>
                    {viewAllTitle}
                  </Text>
                  <Text style={styles.voirToutSearchSubtitle} numberOfLines={1}>
                    {viewAllSubtitle || 'Dates · Voyageurs'}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.voirToutFilterBtn}
                onPress={() => setShowSearchModal(true)}
              >
                <SlidersIcon size={18} color="#fcd34d" />
              </TouchableOpacity>
            </View>

            {/* Liste des propriétés */}
            <ScrollView
              style={styles.voirToutScroll}
              contentContainerStyle={[
                styles.voirToutScrollContent,
                { paddingBottom: 40 + insets.bottom },
              ]}
              showsVerticalScrollIndicator={false}
            >
              {searchLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#fbbf24" />
                  <Text style={styles.loadingText}>Recherche en cours...</Text>
                </View>
              ) : viewAllItems.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateEmoji}>🏠</Text>
                  <Text style={styles.emptyStateTitle}>Aucun logement trouvé</Text>
                  <Text style={styles.emptyStateText}>
                    Essayez de modifier vos filtres pour trouver plus de logements
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyStateButton}
                    onPress={() => {
                      resetFilters();
                      setViewAllMode(null);
                    }}
                  >
                    <Text style={styles.emptyStateButtonText}>Réinitialiser les filtres</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {viewAllItems.map((property) => {
                    const displayPrice = getDisplayPrice(property);
                    const isMixedPrice = !!property.pricePerMonth && !!property.pricePerNight;
                    const images = getPropertyImages(property);
                    const currentIndex = getCarouselIndex(property.id);
                    const totalPrice = formatTotalPrice(property);
                    const nights = calculateNights();
                    const isFav = favoritesSet.has(property.id);

                    return (
                      <TouchableOpacity
                        key={property.id}
                        style={styles.voirToutCard}
                        activeOpacity={0.95}
                        onPress={() => navigateToProperty(property.id)}
                      >
                        {/* Carousel d'images */}
                        <View style={styles.voirToutImageContainer}>
                          <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={(e) => {
                              const newIndex = Math.round(
                                e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 32)
                              );
                              if (newIndex !== currentIndex) {
                                setCarouselIndexes((prev) => ({
                                  ...prev,
                                  [property.id]: newIndex,
                                }));
                              }
                            }}
                          >
                            {images.map((img, i) => (
                              <Image
                                key={i}
                                source={{ uri: img }}
                                style={styles.voirToutImage}
                              />
                            ))}
                          </ScrollView>

                          <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.3)']}
                            style={styles.voirToutImageOverlay}
                          />

                          {/* Badge */}
                          {property.qualityScore && property.qualityScore > 5 ? (
                            <View style={styles.voirToutBadgeCoup}>
                              <Text style={styles.voirToutBadgeCoupText}>
                                🏆 Coup de cœur voyageurs
                              </Text>
                            </View>
                          ) : property.featured ? (
                            <View style={styles.voirToutBadgeSuperhost}>
                              <Text style={styles.voirToutBadgeSuperhostText}>Superhôte</Text>
                            </View>
                          ) : null}

                          {/* Bouton favori */}
                          <TouchableOpacity
                            style={styles.voirToutFavoriteBtn}
                            onPress={() => toggleFavorite(property.id)}
                          >
                            <HeartIcon
                              size={26}
                              color={isFav ? '#fbbf24' : '#ffffff'}
                              filled={isFav}
                            />
                          </TouchableOpacity>

                          {/* Indicateurs carousel */}
                          {images.length > 1 && (
                            <View style={styles.voirToutDots}>
                              {images.slice(0, 5).map((_, i) => (
                                <View
                                  key={i}
                                  style={[
                                    styles.voirToutDot,
                                    i === currentIndex && styles.voirToutDotActive,
                                  ]}
                                />
                              ))}
                            </View>
                          )}
                        </View>

                        {/* Infos propriété */}
                        <View style={styles.voirToutInfo}>
                          <View style={styles.voirToutInfoHeader}>
                            <Text style={styles.voirToutTitle} numberOfLines={1}>
                              {property.title}
                            </Text>
                            <View style={styles.voirToutRating}>
                              <StarIcon size={14} color="#fbbf24" filled />
                              <Text style={styles.voirToutRatingText}>
                                {property.rating.avg
                                  ? property.rating.avg.toFixed(1)
                                  : 'Nouveau'}
                              </Text>
                              {property.rating.count > 0 && (
                                <Text style={styles.voirToutReviews}>
                                  ({property.rating.count})
                                </Text>
                              )}
                            </View>
                          </View>

                          <Text style={styles.voirToutDescription} numberOfLines={1}>
                            {property.bedrooms} ch. · {property.beds} lit
                            {property.beds > 1 ? 's' : ''} · {property.bathrooms} sdb
                          </Text>

                          <Text style={styles.voirToutLocation}>
                            {property.neighborhood?.name
                              ? `${property.neighborhood.name}, `
                              : ''}
                            {property.city}
                          </Text>

                          {searchArrivalDate && (
                            <Text style={styles.voirToutPeriod}>{formatPeriodShort()}</Text>
                          )}

                          {totalPrice && nights > 0 ? (
                            <Text style={styles.voirToutPrice}>
                              <Text style={styles.voirToutPriceBold}>
                                {totalPrice.total} FCFA
                              </Text>
                              <Text style={styles.voirToutPriceLabel}>
                                {' '}
                                {totalPrice.label}
                              </Text>
                            </Text>
                          ) : (
                            <Text style={styles.voirToutPrice}>
                              <Text style={styles.voirToutPriceBold}>
                                {formatPrice(displayPrice.price)} FCFA
                              </Text>
                              <Text style={styles.voirToutPriceLabel}>
                                {' '}
                                / {displayPrice.unit}
                              </Text>
                              {isMixedPrice && (
                                <Text style={styles.voirToutPriceAlt}>
                                  {' '}
                                  (aussi en{' '}
                                  {displayPrice.unit === 'nuit'
                                    ? 'longue durée'
                                    : 'courte durée'}
                                  )
                                </Text>
                              )}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}

                  {/* Compteur */}
                  <View style={styles.voirToutCounter}>
                    <Text style={styles.voirToutCounterText}>
                      {viewAllMode.type === 'search' ? searchTotal : viewAllItems.length}{' '}
                      logement
                      {(viewAllMode.type === 'search'
                        ? searchTotal
                        : viewAllItems.length) > 1
                        ? 's'
                        : ''}
                      {viewAllMode.type === 'section'
                        ? ` à ${viewAllMode.section.city}`
                        : ''}
                    </Text>
                    <Text style={styles.voirToutCounterHint}>
                      Explorez plus avec les filtres
                    </Text>
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
// STYLES
// ===============================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#78350f' },
  patternContainer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#fbbf24',
    borderRadius: 2,
  },
  content: { flex: 1, zIndex: 10 },

  // Loading
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  loadingText: { color: '#fcd34d', fontSize: 14, marginTop: 12 },

  // Header
  header: { paddingHorizontal: 12, paddingTop: 16, paddingBottom: 12 },
  searchBar: {
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(217, 119, 6, 0.5)',
  },
  searchBarGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  searchBarText: { flex: 1 },
  searchBarTitle: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
  searchBarSubtitle: { color: '#fcd34d', fontSize: 12 },

  // Sections
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 8 },
  section: { marginBottom: 32 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  sectionTitleContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  sectionTitle: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  sectionSubtitle: { color: '#fbbf24', fontWeight: '700', fontSize: 16 },
  seeAllButton: { flexDirection: 'row', alignItems: 'center' },
  seeAllText: { color: '#fbbf24', fontSize: 12, fontWeight: '500', marginRight: 2 },
  propertiesList: { paddingHorizontal: 12, gap: 12 },

  // Property Card
  propertyCard: { marginRight: 12 },
  imageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
    position: 'relative',
  },
  propertyImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageOverlay: { ...StyleSheet.absoluteFillObject },
  guestFavoriteBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
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
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(180, 83, 9, 0.3)',
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(120, 53, 15, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(180, 83, 9, 0.3)',
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#fbbf24' },
  modalClearBtn: { color: '#fbbf24', fontSize: 14, fontWeight: '500' },
  modalScroll: { flex: 1 },
  modalScrollContent: { padding: 16 },

  // Filters
  filterSection: { marginBottom: 24 },
  filterLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  filterLabel: { color: '#fcd34d', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  filterHint: { color: '#92400e', fontSize: 10, marginLeft: 4 },
  countBadge: {
    backgroundColor: 'rgba(180, 83, 9, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  countBadgeText: { color: '#fcd34d', fontSize: 10, fontWeight: '600' },

  // Chips
  chipsContainer: { gap: 8 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(120, 53, 15, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(180, 83, 9, 0.5)',
  },
  chipActive: { backgroundColor: 'rgba(250, 204, 21, 0.2)', borderColor: '#fbbf24' },
  chipText: { color: '#fcd34d', fontSize: 14 },
  chipTextActive: { color: '#fbbf24', fontWeight: '600' },

  // Location Type
  locationTypeRow: { flexDirection: 'row', gap: 8 },
  locationTypeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(120, 53, 15, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(180, 83, 9, 0.5)',
    alignItems: 'center',
  },
  locationTypeBtnActive: { backgroundColor: 'rgba(250, 204, 21, 0.2)', borderColor: '#fbbf24' },
  locationTypeBtnText: { color: '#fcd34d', fontSize: 13 },
  locationTypeBtnTextActive: { color: '#fbbf24', fontWeight: '600' },

  // Price
  priceBlock: { marginTop: 12 },
  priceBlockTitle: { color: '#fbbf24', fontSize: 14, marginBottom: 12 },
  priceInputsRow: { flexDirection: 'row', gap: 16 },
  priceInputBox: {
    flex: 1,
    backgroundColor: 'rgba(120, 53, 15, 0.3)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(180, 83, 9, 0.5)',
  },
  priceInputLabel: { color: '#92400e', fontSize: 11, marginBottom: 4 },
  priceInputValue: { color: '#ffffff', fontSize: 14, fontWeight: '500' },

  // Dates
  dateButtonsRow: { flexDirection: 'row', gap: 12 },
  dateButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(120, 53, 15, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(180, 83, 9, 0.5)',
  },
  dateButtonActive: {
    backgroundColor: 'rgba(250, 204, 21, 0.15)',
    borderColor: '#fbbf24',
    borderWidth: 2,
  },
  dateButtonFocused: { borderColor: '#fbbf24', borderWidth: 2 },
  dateButtonLabel: { color: '#92400e', fontSize: 11, marginBottom: 4 },
  dateButtonValue: { color: '#fbbf24', fontSize: 14 },
  dateButtonValueActive: { color: '#ffffff', fontWeight: '500' },

  // Calendar
  calendarContainer: {
    marginTop: 16,
    backgroundColor: 'rgba(120, 53, 15, 0.5)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(180, 83, 9, 0.5)',
  },
  calendarIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  calendarIndicatorBtn: {
    flex: 1,
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(120, 53, 15, 0.3)',
  },
  calendarIndicatorBtnActive: { backgroundColor: 'rgba(250, 204, 21, 0.2)' },
  calendarIndicatorLabel: { color: '#92400e', fontSize: 10, textTransform: 'uppercase' },
  calendarIndicatorValue: { color: '#ffffff', fontSize: 13, fontWeight: '500' },
  calendarArrow: { color: '#92400e', marginHorizontal: 8, fontSize: 16 },
  calendarNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  calendarNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(120, 53, 15, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarNavTitle: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  calendarWeekDays: { flexDirection: 'row', marginBottom: 8 },
  calendarWeekDay: {
    flex: 1,
    textAlign: 'center',
    color: '#92400e',
    fontSize: 12,
    fontWeight: '500',
  },
  calendarDaysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarDayEmpty: { width: '14.28%', height: 36 },
  calendarDay: {
    width: '14.28%',
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  calendarDayArrival: { backgroundColor: '#facc15' },
  calendarDayDeparture: { backgroundColor: '#f97316' },
  calendarDayInRange: { backgroundColor: 'rgba(180, 83, 9, 0.5)' },
  calendarDayToday: { borderWidth: 1, borderColor: '#fbbf24' },
  calendarDayDisabled: { opacity: 0.3 },
  calendarDayText: { color: '#fcd34d', fontSize: 14, fontWeight: '500' },
  calendarDayTextHighlight: { color: '#78350f', fontWeight: '700' },
  calendarDayTextDisabled: { color: '#92400e' },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  calendarLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  calendarLegendDot: { width: 12, height: 12, borderRadius: 4 },
  calendarLegendText: { color: '#fbbf24', fontSize: 11 },
  calendarError: {
    marginTop: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(127, 29, 29, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  calendarErrorText: { color: '#fca5a5', fontSize: 12, textAlign: 'center' },
  calendarActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(180, 83, 9, 0.3)',
  },
  calendarActionBtnSecondary: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(120, 53, 15, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(180, 83, 9, 0.5)',
    alignItems: 'center',
  },
  calendarActionBtnSecondaryText: { color: '#fbbf24', fontSize: 14, fontWeight: '500' },
  calendarActionBtnPrimary: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fbbf24',
    alignItems: 'center',
  },
  calendarActionBtnPrimaryText: { color: '#78350f', fontSize: 14, fontWeight: '600' },
  calendarActionBtnDisabled: { backgroundColor: 'rgba(180, 83, 9, 0.3)' },

  // Counters
  countersRow: { flexDirection: 'row', gap: 12 },
  counterBox: {
    flex: 1,
    backgroundColor: 'rgba(120, 53, 15, 0.3)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(180, 83, 9, 0.3)',
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  counterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(120, 53, 15, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(180, 83, 9, 0.5)',
  },
  counterValue: { color: '#ffffff', fontSize: 24, fontWeight: '700' },

  // Amenities
  amenitiesContainer: { gap: 12 },
  amenityColumn: { gap: 8, width: 160 },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(120, 53, 15, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(180, 83, 9, 0.3)',
  },
  amenityItemActive: {
    backgroundColor: 'rgba(250, 204, 21, 0.15)',
    borderColor: '#fbbf24',
  },
  amenityLabel: { color: '#fcd34d', fontSize: 13, flex: 1 },
  amenityLabelActive: { color: '#ffffff' },

  // Modal Footer
  modalFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(69, 26, 3, 0.95)',
  },
  searchButton: { borderRadius: 16, overflow: 'hidden' },
  searchButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  searchButtonText: { color: '#78350f', fontSize: 18, fontWeight: '700' },

  // Voir Tout
  voirToutContainer: { flex: 1, backgroundColor: '#78350f' },
  voirToutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(180, 83, 9, 0.3)',
    backgroundColor: 'rgba(120, 53, 15, 0.95)',
  },
  voirToutBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(120, 53, 15, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voirToutSearchBar: {
    flex: 1,
    backgroundColor: 'rgba(120, 53, 15, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(180, 83, 9, 0.4)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  voirToutSearchBarContent: { alignItems: 'center' },
  voirToutSearchTitle: { color: '#ffffff', fontWeight: '600', fontSize: 12 },
  voirToutSearchSubtitle: { color: '#fbbf24', fontSize: 10 },
  voirToutFilterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(120, 53, 15, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(180, 83, 9, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voirToutScroll: { flex: 1 },
  voirToutScrollContent: { padding: 16, gap: 24 },
  voirToutCard: { marginBottom: 8 },
  voirToutImageContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  voirToutImage: {
    width: SCREEN_WIDTH - 32,
    height: 256,
    resizeMode: 'cover',
  },
  voirToutImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  voirToutBadgeCoup: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  voirToutBadgeCoupText: { color: '#78350f', fontSize: 12, fontWeight: '600' },
  voirToutBadgeSuperhost: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(120, 53, 15, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  voirToutBadgeSuperhostText: { color: '#fcd34d', fontSize: 12, fontWeight: '600' },
  voirToutFavoriteBtn: { position: 'absolute', top: 12, right: 12, padding: 4 },
  voirToutDots: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  voirToutDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  voirToutDotActive: { backgroundColor: '#ffffff' },
  voirToutInfo: {},
  voirToutInfoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  voirToutTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
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
  voirToutCounter: {
    alignItems: 'center',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(180, 83, 9, 0.3)',
    marginTop: 16,
  },
  voirToutCounterText: { color: '#fcd34d', fontSize: 14, fontWeight: '500' },
  voirToutCounterHint: { color: 'rgba(146, 64, 14, 0.7)', fontSize: 12, marginTop: 4 },

  // Empty State
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyStateEmoji: { fontSize: 64, marginBottom: 16 },
  emptyStateTitle: { color: '#ffffff', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptyStateText: {
    color: '#fcd34d',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: 'rgba(250, 204, 21, 0.2)',
    borderWidth: 1,
    borderColor: '#fbbf24',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: { color: '#fbbf24', fontSize: 14, fontWeight: '600' },

  // Destinations populaires
  destinationsSection: { marginTop: 24, paddingHorizontal: 16 },
  destinationsTitle: { color: '#ffffff', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  destinationsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  destinationCard: {
    width: (SCREEN_WIDTH - 32 - 10) / 2,
    height: 96,
    borderRadius: 16,
    overflow: 'hidden',
  },
  destinationImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  destinationOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  destinationInfo: { position: 'absolute', bottom: 10, left: 10 },
  destinationName: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  destinationCount: { color: '#fcd34d', fontSize: 11 },
});

export default SearchScreen;
