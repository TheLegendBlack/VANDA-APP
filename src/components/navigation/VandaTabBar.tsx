// src/components/navigation/VandaTabBar.tsx
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AdinkraIconProps {
  size?: number;
  color?: string;
  active?: boolean;
}

const AdinkraSearch: React.FC<AdinkraIconProps> = ({ size = 24, color = '#fbbf24', active = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Circle cx="12" cy="12" r="8" />
    <Path
      d="M12 8C12 8 15 10 15 12C15 14 12 16 12 16C12 16 9 14 9 12C9 10 12 8 12 8Z"
      fill={active ? color : 'none'}
    />
    <Circle cx="12" cy="12" r="2" fill={active ? color : 'none'} />
  </Svg>
);

const AdinkraHeart: React.FC<AdinkraIconProps> = ({ size = 24, color = '#fbbf24', active = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={color} strokeWidth={2}>
    <Path d="M12 21C12 21 4 15 4 9C4 6 6 4 8.5 4C10.5 4 12 6 12 6C12 6 13.5 4 15.5 4C18 4 20 6 20 9C20 15 12 21 12 21Z" />
  </Svg>
);

const AdinkraCalendar: React.FC<AdinkraIconProps> = ({ size = 24, color = '#fbbf24', active = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Rect x="4" y="6" width="16" height="14" rx="2" fill={active ? 'none' : 'none'} />
    <Path d="M4 10h16" />
    <Path d="M9 6V4" />
    <Path d="M15 6V4" />
    <Circle cx="8" cy="14" r="1" fill={color} />
    <Circle cx="12" cy="14" r="1" fill={color} />
    <Circle cx="16" cy="14" r="1" fill={color} />
  </Svg>
);

const AdinkraMessages: React.FC<AdinkraIconProps> = ({ size = 24, color = '#fbbf24', active = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path
      d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
      fill={active ? color : 'none'}
    />
  </Svg>
);

const AdinkraProfile: React.FC<AdinkraIconProps> = ({ size = 24, color = '#fbbf24', active = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Circle cx="12" cy="8" r="4" fill={active ? color : 'none'} />
    <Path d="M6 21C6 17 8 15 12 15C16 15 18 17 18 21" />
  </Svg>
);

function iconForRoute(routeName: string) {
  // names = app/(tabs)/<name>.tsx
  switch (routeName) {
    case 'index':
    case 'search':
      return { Icon: AdinkraSearch, label: 'Rechercher' };
    case 'favorites':
      return { Icon: AdinkraHeart, label: 'Favoris' };
    case 'bookings':
      return { Icon: AdinkraCalendar, label: 'Réservations' };
    case 'messages':
      return { Icon: AdinkraMessages, label: 'Messages' };
    case 'profile':
      return { Icon: AdinkraProfile, label: 'Profil' };
    default:
      return { Icon: AdinkraSearch, label: routeName };
  }
}

export default function VandaTabBar(props: BottomTabBarProps) {
  const { state, descriptors, navigation } = props;

  const items = useMemo(() => {
    return state.routes.map((route, index) => {
      const isFocused = state.index === index;
      const { Icon, label } = iconForRoute(route.name);
      const options = descriptors[route.key]?.options || {};
      const title = (options.title as string) || label;

      return { route, index, isFocused, Icon, title };
    });
  }, [state, descriptors]);

  return (
    <View style={styles.footer}>
      <LinearGradient colors={['#451a03', '#78350f']} start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }} style={styles.footerGradient}>
        <View style={styles.footerContent}>
          {items.map(({ route, index, isFocused, Icon, title }) => {
            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name as never);
            };

            return (
              <TouchableOpacity key={route.key} style={styles.navItem} onPress={onPress} activeOpacity={0.7}>
                <Icon size={24} color={isFocused ? '#fbbf24' : '#92400e'} active={isFocused} />
                <Text style={[styles.navLabel, { color: isFocused ? '#fbbf24' : '#92400e' }]}>{title}</Text>
                {isFocused && <View style={styles.navIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  footerGradient: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(180, 83, 9, 0.5)',
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxWidth: Math.min(448, SCREEN_WIDTH),
    alignSelf: 'center',
    width: '100%',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minWidth: 56,
  },
  navLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  navIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    backgroundColor: '#fbbf24',
    borderRadius: 2,
  },
});