// src/components/common/Background.tsx

import React, { ReactNode } from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';
import { FloatingParticles } from '../effects/FloatingParticles';

type BackgroundProps = {
  children?: ReactNode;
  showParticles?: boolean;
};

export const Background: React.FC<BackgroundProps> = ({
  children,
  showParticles = true,
}) => {
  // Pattern SVG en base64 pour le motif Kongo
  const kongoPattern = `data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23D4AF37' stroke-width='1'%3E%3Cpath d='M40 5L50 15 40 25 30 15z'/%3E%3Cpath d='M40 30L50 40 40 50 30 40z'/%3E%3Cpath d='M40 55L50 65 40 75 30 65z'/%3E%3Cpath d='M15 30L25 40 15 50 5 40z'/%3E%3Cpath d='M65 30L75 40 65 50 55 40z'/%3E%3C/g%3E%3C/svg%3E`;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          COLORS.background.start,
          COLORS.background.middle,
          COLORS.background.end,
        ]}
        style={StyleSheet.absoluteFill}
      />

      {/* Motif traditionnel Kongo */}
      <ImageBackground
        source={{ uri: kongoPattern }}
        style={styles.pattern}
        imageStyle={{ opacity: 0.05 }}
        resizeMode="repeat"
      />

      {/* Particules flottantes */}
      {showParticles && <FloatingParticles count={15} />}

      {/* Contenu */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pattern: {
    ...StyleSheet.absoluteFillObject,
  },
});
