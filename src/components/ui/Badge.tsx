import React from 'react';
import { View, Text, type ViewProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends ViewProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Show a small filled dot before the label */
  dot?: boolean;
}

const VARIANT_CLASSES: Record<
  BadgeVariant,
  { text: string; bg: string; dot: string; darkBg: string }
> = {
  default: { text: 'text-gray-500', bg: 'bg-gray-100', dot: 'bg-gray-400', darkBg: 'bg-[#1F1F1F]' },
  primary: { text: 'text-blue-500', bg: 'bg-blue-50', dot: 'bg-blue-400', darkBg: 'bg-[#0D1525]' },
  success: {
    text: 'text-emerald-500',
    bg: 'bg-emerald-50',
    dot: 'bg-emerald-400',
    darkBg: 'bg-[#0D2A1A]',
  },
  warning: {
    text: 'text-amber-500',
    bg: 'bg-amber-50',
    dot: 'bg-amber-400',
    darkBg: 'bg-[#2A1A08]',
  },
  error: { text: 'text-red-500', bg: 'bg-red-50', dot: 'bg-red-400', darkBg: 'bg-[#2A0F0F]' },
  info: {
    text: 'text-indigo-500',
    bg: 'bg-indigo-50',
    dot: 'bg-indigo-400',
    darkBg: 'bg-[#12122A]',
  },
};

const SIZE_CLASSES: Record<BadgeSize, { container: string; text: string; dot: string }> = {
  sm: { container: 'px-1.5 py-0.5', text: 'text-[10px]', dot: 'w-1 h-1' },
  md: { container: 'px-2 py-1', text: 'text-[11px]', dot: 'w-1.5 h-1.5' },
  lg: { container: 'px-2.5 py-1', text: 'text-[13px]', dot: 'w-2 h-2' },
};

export function Badge({
  label,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  style,
  ...props
}: BadgeProps) {
  const { isDark } = useTheme();

  const variantCfg = VARIANT_CLASSES[variant];
  const sizeCfg = SIZE_CLASSES[size];
  const bgClass = isDark ? variantCfg.darkBg : variantCfg.bg;

  return (
    <View
      className={`flex-row items-center self-start rounded ${bgClass} ${sizeCfg.container} ${className}`}
      style={style}
      {...props}>
      {dot && <View className={`mr-1 rounded-full ${variantCfg.dot} ${sizeCfg.dot}`} />}
      <Text
        className={`font-semibold uppercase tracking-widest ${variantCfg.text} ${sizeCfg.text}`}>
        {label}
      </Text>
    </View>
  );
}
