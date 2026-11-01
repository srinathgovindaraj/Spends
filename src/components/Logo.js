import React from 'react';
import Svg, { Path } from 'react-native-svg';

// Spends wallet mark (from icon.svg in the project root).
export const BRAND_BLUE = '#017BFE';

const WALLET =
  'M12 10C8.69062 10 6 12.6906 6 16V43C6 46.3094 8.69062 49 12 49H48C51.3094 49 54 46.3094 54 43V25C54 21.6906 51.3094 19 48 19H12.75C11.5031 19 10.5 17.9969 10.5 16.75C10.5 15.5031 11.5031 14.5 12.75 14.5H48.75C49.9969 14.5 51 13.4969 51 12.25C51 11.0031 49.9969 10 48.75 10H12ZM45 31C46.6594 31 48 32.3406 48 34C48 35.6594 46.6594 37 45 37C43.3406 37 42 35.6594 42 34C42 32.3406 43.3406 31 45 31Z';

export default function Logo({ size = 24, color = BRAND_BLUE }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60" fill="none" accessibilityLabel="Spends">
      <Path d={WALLET} fill={color} />
    </Svg>
  );
}
