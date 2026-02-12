import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CardProps extends ViewProps {
  /**
   * default  – flat, no elevation, surface background
   * elevated – subtle shadow on light, slightly lighter bg on dark
   * outlined – transparent bg with a 1px border
   */
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  style,
  ...props
}: CardProps) {
  const { colors, isDark } = useTheme();

  const paddingMap = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const shadowClasses =
    variant === 'elevated'
      ? isDark
        ? 'border border-[#1F1F1F]'
        : 'shadow-sm shadow-black/10 elevation-2'
      : '';

  const borderClasses =
    variant === 'outlined' ? `border ${isDark ? 'border-[#1F1F1F]' : 'border-[#E8E8E8]'}` : '';

  const bgStyle = variant === 'outlined' ? 'transparent' : colors.surface;

  return (
    <View
      className={`overflow-hidden rounded-xl ${paddingMap[padding]} ${shadowClasses} ${borderClasses} ${className}`}
      style={[{ backgroundColor: bgStyle }, style]}
      {...props}>
      {children}
    </View>
  );
}
