// src/screens/PropertyDetailsScreen.tsx

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  FlatList,
  Animated,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { Calendar } from 'react-native-calendars';
import { useRouter } from 'expo-router';

import { COLORS } from '../constants/colors';
import { SPACING, FONT_SIZES } from '../constants/styles';
import {
  getPropertyById,
  PropertyDetail,
  getPropertyAvailability,
  PropertyAvailabilityDay,
} from '../api/properties';
import {
  getPropertyRatings,
  getPropertyReviews,
  PropertyReview,
  PropertyRatings,
} from '../api/reviews';
import { createBooking } from '../api/booking';
import { createPayment, getPaymentById } from '../api/payments';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

/* =======================
   ICÔNES MOBILE MONEY
======================= */

const MTNIcon: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Circle cx="24" cy="24" r="22" fill="#FFCC00" />
    <Path
      d="M12 28L18 16L24 28L30 16L36 28"
      stroke="#000"
      strokeWidth={3}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="24" cy="34" r="3" fill="#000" />
  </Svg>
);

const AirtelIcon: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Circle cx="24" cy="24" r="22" fill="#FF0000" />
    <Path
      d="M16 32C16 32 20 16 24 16C28 16 32 32 32 32"
      stroke="#FFF"
      strokeWidth={3}
      fill="none"
      strokeLinecap="round"
    />
    <Circle cx="24" cy="20" r="4" fill="#FFF" />
  </Svg>
);

/* =======================
   ICÔNES D'ÉQUIPEMENTS
======================= */

const WifiIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 20,
  color = '#fbbf24',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path
      d="M5 12.55a11 11 0 0 1 14.08 0"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1.42 9a16 16 0 0 1 21.16 0"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8.53 16.11a6 6 0 0 1 6.95 0"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="20" r="1" fill={color} />
  </Svg>
);

const PoolIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 20,
  color = '#fbbf24',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M2 12h20M2 18h20M5 12v-2a3 3 0 0 1 6 0v2M13 12v-2a3 3 0 0 1 6 0v2" strokeLinecap="round" />
  </Svg>
);

const AcIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 20,
  color = '#fbbf24',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Rect x={2} y={4} width={20} height={12} rx={2} />
    <Path d="M6 20v-4M18 20v-4M10 20v-4M14 20v-4" strokeLinecap="round" />
    <Path d="M6 10h12" strokeLinecap="round" />
  </Svg>
);

const ParkingIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 20,
  color = '#fbbf24',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Rect x={3} y={3} width={18} height={18} rx={2} />
    <Path
      d="M9 17V7h4a3 3 0 0 1 0 6H9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const KitchenIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 20,
  color = '#fbbf24',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
    <Circle cx={7} cy={9} r={1} fill={color} />
    <Circle cx={17} cy={15} r={1} fill={color} />
  </Svg>
);

const TvIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 20,
  color = '#fbbf24',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Rect x={2} y={7} width={20} height={12} rx={2} />
    <Path
      d="M12 3v4M7 3l5 4 5-4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/* =======================
   TYPES LOCAUX
======================= */

type PaymentMethodId = 'mtn' | 'airtel' | null;

type Props = {
  propertyId: string;
  navigation?: {
    goBack: () => void;
  };
};

type CalendarDay = {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
};

/* =======================
   MAIN COMPONENT
======================= */

const PropertyDetailsScreen: React.FC<Props> = ({ propertyId, navigation }) => {
  const router = useRouter();
  const { token, user } = useAuth();

  // --- UI / état local
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [guests, setGuests] = useState<number>(2);

  const [showCalendar, setShowCalendar] = useState(false);
  const [selectingCheckIn, setSelectingCheckIn] = useState(true);

  const [showPayment, setShowPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodId>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'error' | null>(
    null
  );

  const [showAllAmenities, setShowAllAmenities] = useState(false);

  // --- Data depuis backend
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [availability, setAvailability] = useState<Record<string, PropertyAvailabilityDay>>({});
  const [reviews, setReviews] = useState<PropertyReview[]>([]);
  const [ratings, setRatings] = useState<PropertyRatings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Backend booking & payment
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingTotal, setBookingTotal] = useState<number | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const heartScale = useRef(new Animated.Value(1)).current;
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* =======================
     CONSTANTES
  ======================= */

  const paymentMethods = useMemo(
    () => [
      { id: 'mtn' as const, name: 'MTN Mobile Money', icon: MTNIcon, color: '#FFCC00' },
      { id: 'airtel' as const, name: 'Airtel Money', icon: AirtelIcon, color: '#FF0000' },
    ],
    []
  );

  const amenities = useMemo(
    () => [
      { icon: WifiIcon, label: 'WiFi haut débit' },
      { icon: PoolIcon, label: 'Piscine privée' },
      { icon: AcIcon, label: 'Climatisation' },
      { icon: ParkingIcon, label: 'Parking gratuit' },
      { icon: KitchenIcon, label: 'Cuisine équipée' },
      { icon: TvIcon, label: 'TV écran plat' },
    ],
    []
  );

  const displayedAmenities = useMemo(
    () => (showAllAmenities ? amenities : amenities.slice(0, 4)),
    [amenities, showAllAmenities]
  );

  const images: string[] = useMemo(() => {
    if (property?.images && property.images.length > 0) {
      return property.images;
    }
    // fallback si pas d'images côté backend
    return [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    ];
  }, [property?.images]);

  /* =======================
     PRE-FILL PHONE AVEC PROFIL
  ======================= */

  useEffect(() => {
    if (user?.phoneNumber && !phoneNumber) {
      // on garde les chiffres, et on tronque aux 9 derniers (ex: 8XX XXX XXX)
      const digits = user.phoneNumber.replace(/[^\d]/g, '');
      setPhoneNumber(digits.slice(-9));
    }
  }, [user, phoneNumber]);

  /* =======================
     EFFETS : CHARGEMENT BACKEND
  ======================= */

  useEffect(() => {
    let isMounted = true;

    async function loadAll() {
      try {
        setLoading(true);
        setError(null);

        // 1. Property
        const data = await getPropertyById(propertyId);

        if (!isMounted) return;
        setProperty(data);

        // 2. Availability (sur ~60 jours)
        const today = new Date();
        const from = today.toISOString().slice(0, 10);
        const toDate = new Date();
        toDate.setDate(today.getDate() + 60);
        const to = toDate.toISOString().slice(0, 10);

        const avail = await getPropertyAvailability(propertyId, { from, to });
        if (!isMounted) return;

        const map: Record<string, PropertyAvailabilityDay> = {};
        for (const d of avail.days) {
          map[d.date] = d;
        }
        setAvailability(map);

        // 3. Ratings
        const r = await getPropertyRatings(propertyId);
        if (!isMounted) return;
        setRatings(r);

        // 4. Reviews (10 derniers)
        const resp = await getPropertyReviews(propertyId, { limit: 10, offset: 0 });
        if (!isMounted) return;
        setReviews(resp.items);
      } catch (e: any) {
        console.error(e);
        if (isMounted) {
          setError(e?.message || 'Impossible de charger les détails du bien.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAll();

    return () => {
      isMounted = false;
    };
  }, [propertyId]);

  // Cleanup polling
  useEffect(
    () => () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    },
    []
  );

  /* =======================
     UTILS / CALCULS
  ======================= */

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [checkIn, checkOut]);

  const pricePerNight = property?.pricePerNight ?? 45000;
  const currency = 'FCFA';

  const subtotal = nights * pricePerNight;
  const serviceFee = Math.round(subtotal * 0.12);
  const totalPrice = subtotal + serviceFee;

  // Montant final utilisé pour l’affichage du paiement :
  // priorité au total remonté par le backend sur la réservation.
  const finalTotal = bookingTotal ?? totalPrice;

  const handleBack = () => {
    if (navigation && typeof navigation.goBack === 'function') {
      navigation.goBack();
    } else {
      router.back();
    }
  };

  const handleFavorite = () => {
    Animated.sequence([
      Animated.timing(heartScale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.timing(heartScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    setIsFavorite((prev) => !prev);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sélectionner';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const isDateAvailable = (date: string) => {
    const day = availability[date];
    if (!day) return true; // si on n'a pas d’info, on laisse sélectionnable
    return day.available;
  };

  const handleDateSelect = (day: CalendarDay) => {
    const dateStr = day.dateString;

    if (!isDateAvailable(dateStr)) {
      return;
    }

    if (selectingCheckIn) {
      setCheckIn(dateStr);
      setCheckOut(null);
      setSelectingCheckIn(false);
    } else {
      if (!checkIn) {
        setCheckIn(dateStr);
        setSelectingCheckIn(false);
        return;
      }
      const start = new Date(checkIn);
      const end = new Date(dateStr);
      if (end <= start) {
        // si la date est avant l’arrivée, on remplace l’arrivée
        setCheckIn(dateStr);
        setCheckOut(null);
        setSelectingCheckIn(false);
      } else {
        setCheckOut(dateStr);
        setShowCalendar(false);
        setSelectingCheckIn(true);
      }
    }
  };

  const getMarkedDates = () => {
    const marked: Record<string, any> = {};

    // Marquer indispos (booked/blocked)
    Object.keys(availability).forEach((date) => {
      const day = availability[date];
      if (!day.available) {
        marked[date] = {
          disabled: true,
          disableTouchEvent: true,
          customStyles: {
            container: { backgroundColor: 'rgba(75,85,99,0.6)' },
            text: { color: '#9ca3af' },
          },
        };
      }
    });

    if (checkIn) {
      marked[checkIn] = {
        ...(marked[checkIn] || {}),
        startingDay: true,
        color: COLORS.gold.DEFAULT,
        textColor: '#000',
      };
    }
    if (checkOut) {
      marked[checkOut] = {
        ...(marked[checkOut] || {}),
        endingDay: true,
        color: COLORS.gold.DEFAULT,
        textColor: '#000',
      };
    }
    if (checkIn && checkOut) {
      let current = new Date(checkIn);
      current.setDate(current.getDate() + 1);
      const end = new Date(checkOut);
      while (current < end) {
        const key = current.toISOString().split('T')[0];
        marked[key] = {
          ...(marked[key] || {}),
          color: 'rgba(245,158,11,0.3)',
          textColor: '#fff',
        };
        current.setDate(current.getDate() + 1);
      }
    }
    return marked;
  };

  /* =======================
     BOOKING + PAYMENT
  ======================= */

  const normalizeMsisdn = (raw: string) => {
    let digits = raw.replace(/[^\d]/g, '');

    // gère des cas comme "00242..." si un jour ça arrive
    if (digits.startsWith('00')) {
        digits = digits.slice(2);
    }

    // si ça commence déjà par 242 → ok
    if (digits.startsWith('242')) {
        return digits;
    }

    // sinon on préfixe par 242 (en gardant le 0 local)
    return `242${digits}`;
};


  const startPaymentPolling = (id: string, tok: string) => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
    }

    setPaymentStatus('processing');

    const start = Date.now();
    const timeoutMs = 2 * 60 * 1000; // 2 minutes

    pollTimerRef.current = setInterval(async () => {
      const elapsed = Date.now() - start;
      if (elapsed > timeoutMs) {
        if (pollTimerRef.current) {
          clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
        }
        setPaymentStatus('error');
        setSubmittingPayment(false);
        Alert.alert(
          'Temps dépassé',
          'Le paiement prend trop de temps. Veuillez vérifier sur votre téléphone ou réessayer.'
        );
        return;
      }

      try {
        const p = await getPaymentById(tok, id);
        if (p.status === 'success') {
          if (pollTimerRef.current) {
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
          }
          setPaymentStatus('success');
          setSubmittingPayment(false);
        } else if (p.status === 'failed') {
          if (pollTimerRef.current) {
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
          }
          setPaymentStatus('error');
          setSubmittingPayment(false);
        }
      } catch (e) {
        console.error('Erreur polling payment', e);
        // on continue à poll tant que pas timeout
      }
    }, 5000);
  };

  /**
   * Clic sur "Réserver maintenant"
   * → crée la réservation (POST /bookings)
   * → ouvre la modale paiement
   */
  const handleOpenPayment = async () => {
    if (!checkIn || !checkOut) {
      setBookingError('Veuillez sélectionner vos dates de séjour.');
      return;
    }
    if (nights <= 0) {
      setBookingError('Plage de dates invalide.');
      return;
    }
    if (!token) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour réserver. Veuillez vous connecter.'
      );
      router.push('/(auth)/login');
      return;
    }

    if (!property) return;

    try {
      setBookingLoading(true);
      setBookingError(null);
      setError(null);
      setPaymentStatus(null);
      setPaymentId(null);
      setBookingId(null);
      setBookingTotal(null);

      const booking = await createBooking(token, {
        propertyId: property.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestsCount: guests,
        specialRequests: null,
      });

      setBookingId(booking.id);
      if (typeof (booking as any).totalAmount === 'number') {
        setBookingTotal((booking as any).totalAmount);
      }

      setShowPayment(true);
    } catch (e: any) {
      console.error(e);
      setBookingError(e?.message || 'Impossible de créer la réservation.');
    } finally {
      setBookingLoading(false);
    }
  };

  /**
   * Clic sur "Payer ..."
   * → crée le paiement (POST /payments)
   * → commence le polling
   */
  const handlePay = async () => {
    const currentProperty = property;
    const currentCheckIn = checkIn;
    const currentCheckOut = checkOut;
    if (!bookingId) {
      setError('Aucune réservation en cours. Veuillez réessayer.');
      return;
    }
    if (!currentProperty || !currentCheckIn || !currentCheckOut) return;
    if (!selectedPaymentMethod) return;
    if (phoneNumber.replace(/[^\d]/g, '').length < 8) return;

    if (!token) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour finaliser la réservation.'
      );
      router.push('/(auth)/login');
      return;
    }

    try {
      setSubmittingPayment(true);
      setPaymentStatus('processing');
      setError(null);

      // 1) Créer la réservation
      const booking = await createBooking(token, {
        propertyId: currentProperty.id,
        checkInDate: currentCheckIn,
        checkOutDate: currentCheckOut,
        guestsCount: guests,
        specialRequests: null,
      });

      setBookingId(booking.id);

      // 2) Map opérateur → provider backend
      const provider =
        selectedPaymentMethod === 'mtn'
          ? 'mtn_momo'
          : 'airtel_momo';

      const msisdn = normalizeMsisdn(phoneNumber);

      // 3) Créer le paiement 
      const payment = await createPayment(token, {
        bookingId: booking.id,
        payerMsisdn: msisdn,
        provider,
        reason: `Réservation ${booking.id} - ${currentProperty.title} - ${currentCheckIn} → ${currentCheckOut}`,
      });

      setPaymentId(payment.id);

      // Démarrer le polling du statut
      startPaymentPolling(payment.id, token);
    } catch (e: any) {
      console.error(e);
      setSubmittingPayment(false);
      setPaymentStatus('error');
      setError(e?.message || 'Impossible d’initier le paiement.');
    }
  };

  const closePaymentModal = () => {
    if (submittingPayment && paymentStatus === 'processing') {
      // on évite de fermer pendant un traitement en cours
      return;
    }
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    setShowPayment(false);
    setPaymentStatus(null);
    setSubmittingPayment(false);
  };

  /* =======================
     RENDER
  ======================= */

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.gold.DEFAULT} />
        <Text style={styles.loadingText}>Chargement du bien...</Text>
      </View>
    );
  }

  if (error && !property) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Bien introuvable.'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Bien introuvable.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Carrousel pleine largeur */}
        <View style={styles.carouselContainer}>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) =>
              setCurrentImageIndex(Math.round(e.nativeEvent.contentOffset.x / width))
            }
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.carouselImage} />
            )}
            keyExtractor={(_, i) => i.toString()}
          />

          {/* Header */}
          <View style={styles.carouselHeader}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleFavorite}>
                <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                  <Ionicons
                    name={isFavorite ? 'heart' : 'heart-outline'}
                    size={22}
                    color={isFavorite ? '#ef4444' : '#fff'}
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Pagination */}
          <View style={styles.pagination}>
            {images.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.paginationDot,
                  currentImageIndex === i && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>

          {/* Counter */}
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {currentImageIndex + 1}/{images.length}
            </Text>
          </View>
        </View>

        {/* Contenu */}
        <LinearGradient
          colors={[COLORS.background.start, COLORS.background.middle, COLORS.background.end]}
          style={styles.content}
        >
          {/* Titre */}
          <Text style={styles.title}>{property.title}</Text>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={COLORS.text.amber.DEFAULT} />
            <Text style={styles.location}>
              {property.city ?? ''} {property.country ? `• ${property.country}` : ''}
            </Text>

            {ratings && ratings.count > 0 && (
              <View style={styles.ratingSmall}>
                <Ionicons name="star" size={14} color={COLORS.gold.DEFAULT} />
                <Text style={styles.ratingSmallText}>
                  {ratings.averages.overall?.toFixed(1) ?? 'N/A'}
                </Text>
              </View>
            )}
          </View>

          {/* Détails rapides */}
          <View style={styles.quickDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="people" size={20} color={COLORS.text.amber.DEFAULT} />
              <Text style={styles.detailText}>
                {(property.maxGuests ?? 2).toString()} voyageurs
              </Text>
            </View>
            {property.bedrooms != null && (
              <View style={styles.detailItem}>
                <Ionicons name="bed" size={20} color={COLORS.text.amber.DEFAULT} />
                <Text style={styles.detailText}>{property.bedrooms} chambres</Text>
              </View>
            )}
            {property.bathrooms != null && (
              <View style={styles.detailItem}>
                <Ionicons name="water" size={20} color={COLORS.text.amber.DEFAULT} />
                <Text style={styles.detailText}>{property.bathrooms} sdb</Text>
              </View>
            )}
          </View>

          {/* Hôte */}
          {property.host && (
            <View style={styles.hostSection}>
              <View style={styles.hostAvatar}>
                <Text style={styles.hostAvatarInitials}>
                  {property.host.firstName?.[0]}
                  {property.host.lastName?.[0]}
                </Text>
              </View>
              <View style={styles.hostInfo}>
                <View style={styles.hostNameRow}>
                  <Text style={styles.hostName}>
                    Hébergé par {property.host.firstName} {property.host.lastName}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Description */}
          {property.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>À propos</Text>
              <Text style={styles.description}>{property.description}</Text>
            </View>
          )}

          {/* Équipements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Équipements</Text>
            <View style={styles.amenitiesGrid}>
              {displayedAmenities.map((amenity, i) => {
                const Icon = amenity.icon;
                return (
                  <View key={i} style={styles.amenityItem}>
                    <View style={styles.amenityIconContainer}>
                      <Icon size={20} color={COLORS.text.amber.DEFAULT} />
                    </View>
                    <Text style={styles.amenityLabel}>{amenity.label}</Text>
                  </View>
                );
              })}
            </View>
            {amenities.length > 4 && (
              <TouchableOpacity onPress={() => setShowAllAmenities((prev) => !prev)}>
                <Text style={styles.showMoreText}>
                  {showAllAmenities ? 'Voir moins' : 'Voir tous les équipements'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Avis */}
          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              {ratings && ratings.count > 0 && (
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={16} color="#000" />
                  <Text style={styles.ratingText}>
                    {ratings.averages.overall?.toFixed(1) ?? 'N/A'}
                  </Text>
                </View>
              )}
              <Text style={styles.reviewsCount}>
                {ratings?.count ?? 0} avis
              </Text>
            </View>

            {reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarInitials}>
                      {review.reviewer?.firstName?.[0]}
                      {review.reviewer?.lastName?.[0]}
                    </Text>
                  </View>
                  <View style={styles.reviewInfo}>
                    <Text style={styles.reviewUser}>
                      {review.reviewer
                        ? `${review.reviewer.firstName ?? ''} ${review.reviewer.lastName ?? ''}`
                        : 'Invité'}
                    </Text>
                    <Text style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  {review.overallRating && (
                    <View style={styles.reviewStars}>
                      {[...Array(review.overallRating)].map((_, i) => (
                        <Ionicons
                          key={i}
                          name="star"
                          size={12}
                          color={COLORS.gold.DEFAULT}
                        />
                      ))}
                    </View>
                  )}
                </View>
                {review.comment && (
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                )}
              </View>
            ))}
          </View>

          {/* Règlement */}
          {property.houseRules && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Règlement intérieur</Text>
              {Array.isArray(property.houseRules)
                ? property.houseRules.map((rule, i) => (
                    <View key={i} style={styles.ruleItem}>
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={COLORS.gold.DEFAULT}
                      />
                      <Text style={styles.ruleText}>{rule}</Text>
                    </View>
                  ))
                : (
                  <View style={styles.ruleItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={COLORS.gold.DEFAULT}
                    />
                    <Text style={styles.ruleText}>{property.houseRules}</Text>
                  </View>
                )}
            </View>
          )}

          {/* Carte de réservation */}
          <View style={styles.bookingCard}>
            <View style={styles.priceRow}>
              <Text style={styles.price}>
                {pricePerNight.toLocaleString()} {currency}
              </Text>
              <Text style={styles.perNight}> / nuit</Text>
            </View>

            {/* Erreur de réservation éventuelle */}
            {bookingError && (
              <View style={styles.inlineErrorBox}>
                <Text style={styles.inlineErrorText}>{bookingError}</Text>
              </View>
            )}

            {/* Dates */}
            <View style={styles.dateSelector}>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => {
                  setSelectingCheckIn(true);
                  setShowCalendar(true);
                }}
              >
                <Text style={styles.dateLabel}>ARRIVÉE</Text>
                <Text style={styles.dateValue}>{formatDate(checkIn)}</Text>
              </TouchableOpacity>
              <View style={styles.dateDivider} />
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => {
                  if (checkIn) {
                    setSelectingCheckIn(false);
                    setShowCalendar(true);
                  }
                }}
              >
                <Text style={styles.dateLabel}>DÉPART</Text>
                <Text style={styles.dateValue}>{formatDate(checkOut)}</Text>
              </TouchableOpacity>
            </View>

            {/* Voyageurs */}
            <View style={styles.guestsSelector}>
              <Text style={styles.guestsLabel}>VOYAGEURS</Text>
              <View style={styles.guestsCounter}>
                <TouchableOpacity
                  style={[
                    styles.guestButton,
                    guests <= 1 && styles.guestButtonDisabled,
                  ]}
                  onPress={() => guests > 1 && setGuests(guests - 1)}
                  disabled={guests <= 1}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={guests <= 1 ? '#ccc' : COLORS.gold.DEFAULT}
                  />
                </TouchableOpacity>
                <Text style={styles.guestsCount}>{guests}</Text>
                <TouchableOpacity
                  style={styles.guestButton}
                  onPress={() => setGuests(guests + 1)}
                >
                  <Ionicons name="add" size={20} color={COLORS.gold.DEFAULT} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Prix */}
            {nights > 0 && (
              <View style={styles.priceSummary}>
                <View style={styles.priceLineRow}>
                  <Text style={styles.priceLabel}>
                    {pricePerNight.toLocaleString()} × {nights} nuits
                  </Text>
                  <Text style={styles.priceValue}>
                    {subtotal.toLocaleString()} {currency}
                  </Text>
                </View>
                <View style={styles.priceLineRow}>
                  <Text style={styles.priceLabel}>Frais de service</Text>
                  <Text style={styles.priceValue}>
                    {serviceFee.toLocaleString()} {currency}
                  </Text>
                </View>
                <View style={styles.priceDivider} />
                <View style={styles.priceLineRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <LinearGradient
                    colors={[COLORS.gold.light, COLORS.gold.DEFAULT]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.totalBadge}
                  >
                    <Text style={styles.totalValue}>
                      {totalPrice.toLocaleString()} {currency}
                    </Text>
                  </LinearGradient>
                </View>
              </View>
            )}

            {/* Bouton Réserver */}
            <TouchableOpacity
              style={[
                styles.reserveButton,
                (!checkIn || !checkOut || bookingLoading) && styles.reserveButtonDisabled,
              ]}
              onPress={handleOpenPayment}
              disabled={!checkIn || !checkOut || bookingLoading}
            >
              <LinearGradient
                colors={
                  checkIn && checkOut && !bookingLoading
                    ? [COLORS.gold.light, COLORS.gold.DEFAULT]
                    : ['#9ca3af', '#6b7280']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.reserveButtonGradient}
              >
                <Text style={styles.reserveButtonText}>
                  {bookingLoading
                    ? 'Création de la réservation...'
                    : checkIn && checkOut
                      ? 'Réserver maintenant'
                      : 'Sélectionnez vos dates'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </LinearGradient>
      </ScrollView>

      {/* MODAL CALENDRIER */}
      <Modal
        visible={showCalendar}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModal}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>
                {selectingCheckIn ? 'Sélectionnez votre arrivée' : 'Sélectionnez votre départ'}
              </Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={COLORS.text.amber.DEFAULT}
                />
              </TouchableOpacity>
            </View>

            <Calendar
              onDayPress={handleDateSelect}
              markedDates={getMarkedDates()}
              markingType="period"
              minDate={new Date().toISOString().split('T')[0]}
              theme={{
                backgroundColor: 'transparent',
                calendarBackground: 'transparent',
                textSectionTitleColor: COLORS.text.amber.light,
                selectedDayBackgroundColor: COLORS.gold.DEFAULT,
                selectedDayTextColor: '#000',
                todayTextColor: COLORS.gold.DEFAULT,
                dayTextColor: '#fff',
                textDisabledColor: '#555',
                monthTextColor: COLORS.text.amber.DEFAULT,
                arrowColor: COLORS.gold.DEFAULT,
              }}
            />

            {checkIn && (
              <View style={styles.selectedDatesRow}>
                <View style={styles.selectedDate}>
                  <Text style={styles.selectedDateLabel}>Arrivée</Text>
                  <Text style={styles.selectedDateValue}>{formatDate(checkIn)}</Text>
                </View>
                {checkOut && (
                  <>
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color={COLORS.gold.DEFAULT}
                    />
                    <View style={styles.selectedDate}>
                      <Text style={styles.selectedDateLabel}>Départ</Text>
                      <Text style={styles.selectedDateValue}>{formatDate(checkOut)}</Text>
                    </View>
                  </>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL PAIEMENT */}
      <Modal
        visible={showPayment}
        animationType="slide"
        transparent
        onRequestClose={closePaymentModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.paymentModal}>
            {paymentStatus === 'processing' ? (
              <View style={styles.paymentProcessing}>
                <ActivityIndicator size="large" color={COLORS.gold.DEFAULT} />
                <Text style={styles.processingText}>Traitement en cours...</Text>
                <Text style={styles.processingSubtext}>
                  Veuillez confirmer le paiement sur votre téléphone.
                </Text>
              </View>
            ) : paymentStatus === 'success' ? (
              <View style={styles.paymentSuccess}>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark" size={48} color="#fff" />
                </View>
                <Text style={styles.successText}>Paiement réussi !</Text>
                <Text style={styles.successSubtext}>Votre réservation est confirmée.</Text>
                <TouchableOpacity
                  style={[styles.payButton, { marginTop: SPACING.lg }]}
                  onPress={closePaymentModal}
                >
                  <LinearGradient
                    colors={[COLORS.gold.light, COLORS.gold.DEFAULT]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.payButtonGradient}
                  >
                    <Text style={styles.payButtonText}>Fermer</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : paymentStatus === 'error' ? (
              <View style={styles.paymentError}>
                <View style={styles.errorIcon}>
                  <Ionicons name="close" size={48} color="#fff" />
                </View>
                <Text style={styles.errorText}>Échec du paiement</Text>
                <Text style={styles.errorSubtext}>
                  {error || 'Une erreur est survenue. Veuillez réessayer.'}
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => {
                    setPaymentStatus(null);
                    setError(null);
                  }}
                >
                  <Text style={styles.retryButtonText}>Réessayer</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.paymentHeader}>
                  <Text style={styles.paymentTitle}>Paiement Mobile Money</Text>
                  <TouchableOpacity onPress={closePaymentModal}>
                    <Ionicons
                      name="close"
                      size={24}
                      color={COLORS.text.amber.DEFAULT}
                    />
                  </TouchableOpacity>
                </View>

                {/* Récapitulatif */}
                <View style={styles.paymentSummary}>
                  <Text style={styles.paymentSummaryTitle}>Récapitulatif</Text>
                  <View style={styles.paymentSummaryRow}>
                    <Text style={styles.paymentSummaryLabel}>{nights} nuits</Text>
                    <Text style={styles.paymentSummaryValue}>
                      {subtotal.toLocaleString()} {currency}
                    </Text>
                  </View>
                  <View style={styles.paymentSummaryRow}>
                    <Text style={styles.paymentSummaryLabel}>Frais de service</Text>
                    <Text style={styles.paymentSummaryValue}>
                      {serviceFee.toLocaleString()} {currency}
                    </Text>
                  </View>
                  <View style={styles.paymentSummaryDivider} />
                  <View style={styles.paymentSummaryRow}>
                    <Text style={styles.paymentTotalLabel}>Total à payer</Text>
                    <Text style={styles.paymentTotalValue}>
                      {finalTotal.toLocaleString()} {currency}
                    </Text>
                  </View>
                </View>

                {/* Méthodes de paiement */}
                <Text style={styles.paymentMethodTitle}>Choisissez votre opérateur</Text>
                <View style={styles.paymentMethods}>
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    const selected = selectedPaymentMethod === method.id;
                    return (
                      <TouchableOpacity
                        key={method.id}
                        onPress={() => setSelectedPaymentMethod(method.id)}
                        style={[
                          styles.paymentMethod,
                          selected && styles.paymentMethodSelected,
                          selected && { borderColor: method.color },
                        ]}
                      >
                        <Icon size={48} />
                        <Text style={styles.paymentMethodName}>{method.name}</Text>
                        {selected && (
                          <View
                            style={[
                              styles.paymentMethodCheck,
                              { backgroundColor: method.color },
                            ]}
                          >
                            <Ionicons name="checkmark" size={14} color="#fff" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Téléphone */}
                <View style={styles.phoneInputContainer}>
                  <Text style={styles.phoneLabel}>Numéro de téléphone</Text>
                  <View style={styles.phoneInputWrapper}>
                    <Text style={styles.phonePrefix}>+243</Text>
                    <TextInput
                      style={styles.phoneInput}
                      placeholder="8XX XXX XXX"
                      placeholderTextColor="#999"
                      keyboardType="phone-pad"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      maxLength={9}
                    />
                  </View>
                </View>

                {/* Bouton payer */}
                <TouchableOpacity
                  style={[
                    styles.payButton,
                    (!selectedPaymentMethod ||
                      phoneNumber.replace(/[^\d]/g, '').length < 8 ||
                      submittingPayment) &&
                      styles.payButtonDisabled,
                  ]}
                  onPress={handlePay}
                  disabled={
                    !selectedPaymentMethod ||
                    phoneNumber.replace(/[^\d]/g, '').length < 8 ||
                    submittingPayment
                  }
                >
                  <LinearGradient
                    colors={
                      selectedPaymentMethod &&
                      phoneNumber.replace(/[^\d]/g, '').length >= 8
                        ? [COLORS.gold.light, COLORS.gold.DEFAULT]
                        : ['#9ca3af', '#6b7280']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.payButtonGradient}
                  >
                    <Text style={styles.payButtonText}>
                      {submittingPayment
                        ? 'Traitement...'
                        : `Payer ${finalTotal.toLocaleString()} ${currency}`}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

/* =======================
   STYLES
======================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.start },

  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background.start,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.text.amber.light,
    fontSize: FONT_SIZES.md,
  },

  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.background.start,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  errorText: {
    color: '#fecaca',
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },

  retryButton: {
    backgroundColor: COLORS.gold.DEFAULT,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#000',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },

  // Carrousel
  carouselContainer: { height: height * 0.4, width, position: 'relative' },
  carouselImage: { width, height: height * 0.4, resizeMode: 'cover' },
  carouselHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: { flexDirection: 'row', gap: SPACING.sm },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagination: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  paginationDotActive: { backgroundColor: '#fff', width: 24 },
  imageCounter: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  imageCounterText: { color: '#fff', fontSize: FONT_SIZES.xs },

  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: SPACING.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  location: { color: COLORS.text.amber.light, fontSize: FONT_SIZES.sm, flex: 1 },
  ratingSmall: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingSmallText: { color: COLORS.text.amber.DEFAULT, fontWeight: '600' },

  quickDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(120,53,15,0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border.amber,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  detailItem: { alignItems: 'center', gap: SPACING.xs },
  detailText: { color: COLORS.text.amber.light, fontSize: FONT_SIZES.xs },

  hostSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(120,53,15,0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border.amber,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  hostAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: COLORS.gold.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.8)',
  },
  hostAvatarInitials: {
    color: COLORS.gold.DEFAULT,
    fontWeight: '700',
    fontSize: FONT_SIZES.md,
  },
  hostInfo: { flex: 1, marginLeft: SPACING.md },
  hostNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  hostName: {
    color: '#fff',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },

  section: { marginBottom: SPACING.xl },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: SPACING.md,
  },
  description: {
    color: COLORS.text.amber.light,
    fontSize: FONT_SIZES.sm,
    lineHeight: 22,
  },

  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  amenityItem: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  amenityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(120,53,15,0.5)',
    borderWidth: 1,
    borderColor: COLORS.border.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityLabel: {
    color: COLORS.text.amber.light,
    fontSize: FONT_SIZES.sm,
    flex: 1,
  },
  showMoreText: {
    color: COLORS.gold.DEFAULT,
    fontSize: FONT_SIZES.sm,
    textDecorationLine: 'underline',
    marginTop: SPACING.md,
  },

  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.gold.DEFAULT,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  ratingText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: '#000',
  },
  reviewsCount: {
    color: COLORS.text.amber.light,
    fontSize: FONT_SIZES.sm,
  },
  reviewCard: {
    backgroundColor: 'rgba(120,53,15,0.3)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border.amber,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gold.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.8)',
  },
  reviewAvatarInitials: {
    color: COLORS.gold.DEFAULT,
    fontWeight: '700',
    fontSize: FONT_SIZES.sm,
  },
  reviewInfo: { flex: 1, marginLeft: SPACING.sm },
  reviewUser: {
    color: '#fff',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  reviewDate: {
    color: COLORS.text.gray,
    fontSize: FONT_SIZES.xs,
  },
  reviewStars: { flexDirection: 'row' },
  reviewComment: {
    color: COLORS.text.amber.light,
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
  },

  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  ruleText: {
    color: COLORS.text.amber.light,
    fontSize: FONT_SIZES.sm,
  },

  bookingCard: {
    backgroundColor: 'rgba(120,53,15,0.5)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.border.amber,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.md,
  },
  price: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#fff',
  },
  perNight: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.amber.light,
  },

  inlineErrorBox: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  inlineErrorText: {
    color: '#fecaca',
    fontSize: FONT_SIZES.xs,
  },

  dateSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border.amber,
    marginBottom: SPACING.md,
  },
  dateInput: { flex: 1, padding: SPACING.md },
  dateDivider: { width: 1, backgroundColor: COLORS.border.amber },
  dateLabel: {
    fontSize: FONT_SIZES.xs,
    color: '#666',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: FONT_SIZES.md,
    color: '#1f2937',
    fontWeight: '600',
  },
  guestsSelector: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border.amber,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  guestsLabel: {
    fontSize: FONT_SIZES.xs,
    color: '#666',
    marginBottom: SPACING.sm,
  },
  guestsCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guestButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestButtonDisabled: { backgroundColor: '#f3f4f6' },
  guestsCount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: '#1f2937',
  },

  priceSummary: { marginBottom: SPACING.md },
  priceLineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  priceLabel: {
    color: COLORS.text.amber.light,
    fontSize: FONT_SIZES.sm,
  },
  priceValue: { color: '#fff', fontSize: FONT_SIZES.sm },
  priceDivider: {
    height: 1,
    backgroundColor: COLORS.border.amber,
    marginVertical: SPACING.sm,
  },
  totalLabel: {
    color: '#fff',
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  totalBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  totalValue: {
    color: '#000',
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  reserveButton: { borderRadius: 16, overflow: 'hidden' },
  reserveButtonDisabled: { opacity: 0.7 },
  reserveButtonGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  reserveButtonText: {
    color: '#000',
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  calendarModal: {
    backgroundColor: COLORS.background.start,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    maxHeight: height * 0.8,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  calendarTitle: {
    color: '#fff',
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  selectedDatesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: 'rgba(120,53,15,0.5)',
    borderRadius: 12,
  },
  selectedDate: { alignItems: 'center' },
  selectedDateLabel: {
    color: COLORS.text.amber.light,
    fontSize: FONT_SIZES.xs,
  },
  selectedDateValue: {
    color: '#fff',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },

  paymentModal: {
    backgroundColor: COLORS.background.start,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    maxHeight: height * 0.9,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  paymentTitle: {
    color: '#fff',
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  paymentSummary: {
    backgroundColor: 'rgba(120,53,15,0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border.amber,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  paymentSummaryTitle: {
    color: '#fff',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  paymentSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  paymentSummaryLabel: {
    color: COLORS.text.amber.light,
    fontSize: FONT_SIZES.sm,
  },
  paymentSummaryValue: { color: '#fff', fontSize: FONT_SIZES.sm },
  paymentSummaryDivider: {
    height: 1,
    backgroundColor: COLORS.border.amber,
    marginVertical: SPACING.sm,
  },
  paymentTotalLabel: {
    color: '#fff',
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  paymentTotalValue: {
    color: COLORS.gold.DEFAULT,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },

  paymentMethodTitle: {
    color: '#fff',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  paymentMethod: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: SPACING.md,
  },
  paymentMethodSelected: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  paymentMethodName: {
    color: '#fff',
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  paymentMethodCheck: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  phoneInputContainer: { marginBottom: SPACING.lg },
  phoneLabel: {
    color: '#fff',
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.sm,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border.amber,
  },
  phonePrefix: {
    paddingHorizontal: SPACING.md,
    color: '#666',
    fontSize: FONT_SIZES.md,
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  phoneInput: {
    flex: 1,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: '#1f2937',
  },

  payButton: { borderRadius: 16, overflow: 'hidden' },
  payButtonDisabled: { opacity: 0.7 },
  payButtonGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#000',
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },

  paymentProcessing: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  processingText: {
    color: '#fff',
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },
  processingSubtext: {
    color: COLORS.text.amber.light,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },

  paymentSuccess: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  successText: {
    color: '#fff',
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  successSubtext: {
    color: COLORS.text.amber.light,
    fontSize: FONT_SIZES.md,
  },

  paymentError: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  errorSubtext: {
    color: COLORS.text.amber.light,
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
});

export default PropertyDetailsScreen;




