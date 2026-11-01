import React from 'react';
import { View } from 'react-native';
import { colors } from '../constants/theme';

// Monochrome Lucide icon in a soft grey circle.
export default function IconBadge({ Icon, size = 42 }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.elevated,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={Math.round(size * 0.46)} color={colors.text} strokeWidth={1.75} />
    </View>
  );
}
