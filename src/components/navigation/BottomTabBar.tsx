// src/components/navigation/BottomTabBar.tsx

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  AdinkraHome,
  AdinkraSearch,
  AdinkraCalendar,
  AdinkraHeart,
  AdinkraProfile,
} from '../icons/AdinkraIcons';
import { COLORS } from '../../constants/colors';
import { SPACING, FONT_SIZES } from '../../constants/styles';

const icons: Record<
  string,
  React.ComponentType<{ size?: number; color?: string; active?: boolean }>
> = {
  index: AdinkraHome,
  search: AdinkraSearch,
  bookings: AdinkraCalendar,
  favorites: AdinkraHeart,
  profile: AdinkraProfile,
};

const labels: Record<string, string> = {
  index: 'Accueil',
  search: 'Rechercher',
  bookings: 'Réserver',
  favorites: 'Favoris',
  profile: 'Profil',
};

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#78350f', '#7f1d1d']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.container, { paddingBottom: insets.bottom }]}
    >
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const Icon = icons[route.name];
          const label = labels[route.name];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (!Icon) return null;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={styles.tab}
            >
              <Icon
                size={24}
                color={
                  isFocused
                    ? COLORS.text.amber.DEFAULT
                    : COLORS.text.amber.dark
                }
                active={isFocused}
              />
              <Text
                style={[
                  styles.label,
                  {
                    color: isFocused
                      ? COLORS.text.amber.DEFAULT
                      : COLORS.text.amber.dark,
                  },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(217, 119, 6, 0.5)',
  },
  tabBar: {
    flexDirection: 'row',
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'space-around',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
  },
});
