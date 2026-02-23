import React from 'react';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';

type IconProps = {
  size?: number;
  color?: string;
  active?: boolean;
};

export const AdinkraHome = ({ size = 24, color = 'currentColor', active = false }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={color} strokeWidth="2">
    <Rect x="5" y="10" width="14" height="11" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M3 10L12 3L21 10" strokeLinecap="round" strokeLinejoin="round"/>
    <Rect x="10" y="15" width="4" height="6" fill={color}/>
  </Svg>
);

export const AdinkraSearch = ({ size = 24, color = 'currentColor', active = false }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <Circle cx="12" cy="12" r="8"/>
    <Path d="M12 8C12 8 15 10 15 12C15 14 12 16 12 16C12 16 9 14 9 12C9 10 12 8 12 8Z" fill={active ? color : 'none'}/>
    <Circle cx="12" cy="12" r="2" fill={active ? color : 'none'}/>
  </Svg>
);

export const AdinkraCalendar = ({ size = 24, color = 'currentColor', active = false }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <Rect x="4" y="6" width="16" height="14" rx="2"/>
    <Path d="M4 10h16M9 6V4M15 6V4"/>
    <Circle cx="8" cy="14" r="1" fill={color}/>
    <Circle cx="12" cy="14" r="1" fill={color}/>
    <Circle cx="16" cy="14" r="1" fill={color}/>
    <Circle cx="8" cy="18" r="1" fill={color}/>
    <Circle cx="12" cy="18" r="1" fill={active ? color : 'none'}/>
  </Svg>
);

export const AdinkraHeart = ({ size = 24, color = 'currentColor', active = false }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={color} strokeWidth="2">
    <Path d="M12 21C12 21 4 15 4 9C4 6 6 4 8.5 4C10.5 4 12 6 12 6C12 6 13.5 4 15.5 4C18 4 20 6 20 9C20 15 12 21 12 21Z" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M12 8L10 10M12 8L14 10" strokeLinecap="round"/>
  </Svg>
);

export const AdinkraProfile = ({ size = 24, color = 'currentColor', active = false }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <Circle cx="12" cy="8" r="4" fill={active ? color : 'none'}/>
    <Path d="M6 21C6 17 8 15 12 15C16 15 18 17 18 21" strokeLinecap="round"/>
    <Path d="M9 8L12 11L15 8" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);