import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry,
  containerClassName = '',
  className = '',
  ...props
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = secureTextEntry !== undefined;
  const showPassword = isPassword && isPasswordVisible;

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className="mb-2 text-xl font-medium text-gray-700 dark:text-gray-300">{label}</Text>
      )}
      <View
        className={`flex-row items-center rounded-xl border-2 bg-white px-4 dark:bg-gray-800 ${
          error
            ? 'border-red-500'
            : isFocused
              ? 'border-primary-500'
              : 'border-gray-200 dark:border-gray-700'
        }`}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={24}
            color={error ? '#EF4444' : isFocused ? '#F59E0B' : '#9CA3AF'}
            style={{ marginRight: 12 }}
          />
        )}
        <TextInput
          className={`flex-1 py-4 text-xl text-gray-900 dark:text-white ${className}`}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={24}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name={rightIcon} size={24} color={error ? '#EF4444' : '#9CA3AF'} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="mt-1 text-sm text-red-500">{error}</Text>}
      {hint && !error && (
        <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">{hint}</Text>
      )}
    </View>
  );
}
