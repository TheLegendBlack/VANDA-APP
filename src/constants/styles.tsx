import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from './colors';

const { width } = Dimensions.get('window');

export const GLOBAL_STYLES = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  contentContainer: {
    maxWidth: 448, // md breakpoint
    width: width < 480 ? '100%' : 448,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  
  card: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border.amber,
    padding: 16,
  },
  
  cardGradient: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  shadowLarge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border.amber,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1f2937', // gray-800
  },
  
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};