import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  textClassName?: string;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  className = '',
  textClassName = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'flex-row items-center justify-center rounded-xl';

  const variantStyles = {
    primary: 'bg-amber-500 active:bg-amber-600',
    secondary: 'bg-gray-800 dark:bg-gray-700 active:bg-gray-900',
    outline: 'border-2 border-amber-500 bg-transparent active:bg-amber-50',
    ghost: 'bg-transparent active:bg-gray-100 dark:active:bg-gray-800',
    danger: 'bg-red-500 active:bg-red-600',
  };

  const sizeStyles = {
    sm: icon && !title ? 'p-2' : 'px-4 py-2',
    md: icon && !title ? 'p-3' : 'px-6 py-3',
    lg: icon && !title ? 'p-4' : 'px-8 py-4',
  };

  const textVariantStyles = {
    primary: 'text-black font-semibold',
    secondary: 'text-white font-semibold',
    outline: 'text-amber-500 font-semibold',
    ghost: 'text-gray-800 dark:text-gray-200 font-medium',
    danger: 'text-white font-semibold',
  };

  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
        isDisabled ? 'opacity-50' : ''
      } ${className}`}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? '#F59E0B' : '#000000'}
          size="small"
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && <>{icon}</>}
          {title ? (
            <Text
              className={`${textVariantStyles[variant]} ${textSizeStyles[size]} ${
                icon ? (iconPosition === 'left' ? 'ml-2' : 'mr-2') : ''
              } ${textClassName}`}>
              {title}
            </Text>
          ) : null}
          {icon && iconPosition === 'right' && <>{icon}</>}
        </>
      )}
    </TouchableOpacity>
  );
}
