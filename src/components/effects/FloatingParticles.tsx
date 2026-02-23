// src/components/effects/FloatingParticles.tsx

import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';

type ParticleProps = {
  delay: number;
  left: number; // en %
  top: number;  // en %
};

type FloatingParticlesProps = {
  count?: number;
};

const Particle: React.FC<ParticleProps> = ({ delay, left, top }) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-30, {
            duration: 5000 + Math.random() * 5000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, {
            duration: 5000 + Math.random() * 5000,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        true
      )
    );

    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(20, {
            duration: 5000 + Math.random() * 5000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, {
            duration: 5000 + Math.random() * 5000,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        true
      )
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.8, {
            duration: 2500 + Math.random() * 2500,
          }),
          withTiming(0.3, {
            duration: 2500 + Math.random() * 2500,
          })
        ),
        -1,
        true
      )
    );
    // tu as dit que tu ne voulais pas être strict, on laisse le tableau vide 🙂
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        { left: `${left}%`, top: `${top}%` },
        animatedStyle,
      ]}
    />
  );
};

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({ count = 15 }) => {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 5000,
      })),
    [count]
  );

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle) => (
        <Particle
          key={particle.id}
          delay={particle.delay}
          left={particle.left}
          top={particle.top}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fbbf24',
  },
});
