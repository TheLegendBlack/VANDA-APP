import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Circle,
  G,
  Path,
  Rect,
  Line,
  Text,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  useSharedValue,
} from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);

type VandaLogoProps = {
  size?: number;
};

export const VandaLogo: React.FC<VandaLogoProps> = ({ size = 112 }) => {
  const opacity = useSharedValue(0.7);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 2000 }),
        withTiming(0.7, { duration: 2000 })
      ),
      -1,
      true
    );
  }, [opacity]);

  const pulseStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <View style={styles.container}>
      {/* Halo lumineux animé */}
      <AnimatedView
        style={[
          styles.halo,
          { width: size, height: size },
          pulseStyle,
        ]}
      />

      {/* Logo SVG */}
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          <LinearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFD700" />
            <Stop offset="50%" stopColor="#FFA500" />
            <Stop offset="100%" stopColor="#FF8C00" />
          </LinearGradient>
        </Defs>

        {/* Cercle extérieur */}
        <Circle cx="100" cy="100" r="95" fill="url(#goldGradient)" />
        <Circle cx="100" cy="100" r="85" fill="#2C1810" />

        {/* Motifs géométriques Kongo */}
        <G stroke="url(#goldGradient)" strokeWidth={3} fill="none">
          {/* Losanges supérieurs gauche */}
          <Rect
            x={30}
            y={35}
            width={15}
            height={15}
            transform="rotate(45 37.5 42.5)"
          />
          <Rect
            x={35}
            y={40}
            width={8}
            height={8}
            transform="rotate(45 39 44)"
            fill="url(#goldGradient)"
          />

          {/* Losanges supérieurs droite */}
          <Rect
            x={155}
            y={35}
            width={15}
            height={15}
            transform="rotate(45 162.5 42.5)"
          />
          <Rect
            x={160}
            y={40}
            width={8}
            height={8}
            transform="rotate(45 164 44)"
            fill="url(#goldGradient)"
          />

          {/* Motif central */}
          <Path d="M100 50 L115 65 L100 80 L85 65 Z" strokeWidth={4} />
          <Path d="M100 70 L110 80 L100 90 L90 80 Z" strokeWidth={4} />
          <Line x1={100} y1={55} x2={100} y2={85} strokeWidth={3} />
          <Line x1={90} y1={67} x2={110} y2={67} strokeWidth={3} />

          {/* Triangles latéraux gauche */}
          <Path d="M45 75 L55 85 L45 95 Z" strokeWidth={3} />
          <Path d="M40 100 L50 110 L40 120 Z" strokeWidth={3} />

          {/* Triangles latéraux droite */}
          <Path d="M155 75 L145 85 L155 95 Z" strokeWidth={3} />
          <Path d="M160 100 L150 110 L160 120 Z" strokeWidth={3} />

          {/* Arche base */}
          <Path d="M75 140 Q75 150 85 150 L115 150 Q125 150 125 140" strokeWidth={4} />
          <Rect x={95} y={145} width={10} height={15} fill="url(#goldGradient)" />
        </G>

        {/* Texte VANDA */}
        <Text
          x={100}
          y={125}
          fontFamily="serif"
          fontSize={18}
          fontWeight="bold"
          fill="url(#goldGradient)"
          textAnchor="middle"
        >
          VANDA
        </Text>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    backgroundColor: '#f59e0b',
    borderRadius: 9999,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 20,
  },
});
