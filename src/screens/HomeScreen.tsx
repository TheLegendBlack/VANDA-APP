import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Background } from '../components/common/Background';
import { VandaLogo } from '../components/icons/VandaLogo';
import { AdinkraSearch } from '../components/icons/AdinkraIcons';
import { ShimmerEffect } from '../components/effects/ShimmerEffect';
import { COLORS } from '../constants/colors';
import { GLOBAL_STYLES, SPACING, FONT_SIZES } from '../constants/styles';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.xl * 3) / 2;

type Property = {
  id: number;
  image: string;
  title: string;
  price: string;
  host: string | null;
};

const properties: Property[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800',
    title: 'Vue imprenable sur le fleuve Congo',
    price: '30,800 FCFA',
    host: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    title: 'Appartement Paisten',
    price: '35,000 FCFA',
    host: null,
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    title: 'Appartement moderne à Brazzaville',
    price: '95,000 FCFA',
    host: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    title: 'Case traditionnelle à Kinshasa',
    price: '20,000 FCFA',
    host: null,
  },
];

type PropertyCardProps = {
  property: Property;
};

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      // La navigation vers le détail sera gérée plus tard via Expo Router
      onPress={() => {
        // TODO: utiliser router.push(`/property/${property.id}`)
      }}
      style={[styles.propertyCard, isPressed && styles.propertyCardPressed]}
    >
      <View style={styles.propertyImageContainer}>
        <Image
          source={{ uri: property.image }}
          style={styles.propertyImage}
          resizeMode="cover"
        />

        {/* Gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
          style={styles.propertyGradient}
        />

        {/* Host avatar */}
        {property.host && (
          <View style={styles.hostAvatarContainer}>
            <Image source={{ uri: property.host }} style={styles.hostAvatar} />
          </View>
        )}

        {/* Info overlay */}
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyTitle} numberOfLines={2}>
            {property.title}
          </Text>
          <Text style={styles.propertyPrice}>{property.price}/nuit</Text>
        </View>

        {/* Shimmer effect on press */}
        {isPressed && <ShimmerEffect style={styles.shimmer} />}
      </View>
    </TouchableOpacity>
  );
};

const HomeScreen: React.FC = () => {
  return (
    <Background showParticles={true}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header avec logo */}
          <View style={styles.header}>
            <VandaLogo size={112} />

            <Text style={styles.title}>VANDA</Text>
            <Text style={styles.subtitle}>Posez vos valises</Text>
          </View>

          {/* Barre de recherche */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <AdinkraSearch size={20} color="#9ca3af" />
              <TextInput
                placeholder="Où voulez-vous explorer ?"
                placeholderTextColor="#9ca3af"
                style={styles.searchInput}
              />
              <Ionicons
                name="options-outline"
                size={20}
                color={COLORS.gold.dark}
              />
            </View>
          </View>

          {/* Section principale */}
          <View style={styles.mainSection}>
            <Text style={styles.sectionTitle}>Découvrez l&apos;Afrique !</Text>

            {/* Grille de propriétés */}
            <View style={styles.propertiesGrid}>
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Pour la navigation du bas
  },
  header: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.text.amber.light,
    marginBottom: SPACING.xs,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.amber.DEFAULT,
    letterSpacing: 3,
  },
  searchContainer: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  searchBar: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: '#1f2937',
    marginLeft: SPACING.md,
  },
  mainSection: {
    paddingHorizontal: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: SPACING.lg,
  },
  propertiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  propertyCard: {
    width: CARD_WIDTH,
    marginBottom: SPACING.lg,
  },
  propertyCardPressed: {
    transform: [{ scale: 1.05 }],
  },
  propertyImageContainer: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  propertyGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  hostAvatarContainer: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    zIndex: 10,
  },
  hostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  propertyInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    zIndex: 5,
  },
  propertyTitle: {
    color: '#ffffff',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  propertyPrice: {
    color: COLORS.text.amber.DEFAULT,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  shimmer: {
    borderRadius: 16,
  },
});
