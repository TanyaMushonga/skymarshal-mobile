import React from 'react';
import { View, Text, type ViewProps } from 'react-native';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends ViewProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

export function Badge({
  label,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-gray-100 dark:bg-gray-700',
    primary: 'bg-primary-100 dark:bg-primary-900/30',
    success: 'bg-green-100 dark:bg-green-900/30',
    warning: 'bg-amber-100 dark:bg-amber-900/30',
    error: 'bg-red-100 dark:bg-red-900/30',
    info: 'bg-blue-100 dark:bg-blue-900/30',
  };

  const textVariantStyles = {
    default: 'text-gray-700 dark:text-gray-300',
    primary: 'text-primary-700 dark:text-primary-300',
    success: 'text-green-700 dark:text-green-300',
    warning: 'text-amber-700 dark:text-amber-300',
    error: 'text-red-700 dark:text-red-300',
    info: 'text-blue-700 dark:text-blue-300',
  };

  const dotVariantStyles = {
    default: 'bg-gray-500',
    primary: 'bg-primary-500',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5',
    md: 'px-2.5 py-1',
    lg: 'px-3 py-1.5',
  };

  const textSizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <View
      className={`flex-row items-center rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}>
      {dot && <View className={`mr-1.5 h-2 w-2 rounded-full ${dotVariantStyles[variant]}`} />}
      <Text className={`font-medium ${textVariantStyles[variant]} ${textSizeStyles[size]}`}>
        {label}
      </Text>
    </View>
  );
}
