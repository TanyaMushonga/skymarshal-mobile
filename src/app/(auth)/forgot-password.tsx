import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button, Input } from '@/components/ui';
import { authApi } from '@/api';
import { useTheme } from '@/contexts/ThemeContext';

const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, 'Email or Force Number is required'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { identifier: '' },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      setIsLoading(true);
      const isEmail = data.identifier.includes('@');
      const payload = isEmail ? { email: data.identifier } : { force_number: data.identifier };

      await authApi.requestPasswordReset(payload);

      router.push({
        pathname: '/(auth)/verify-reset',
        params: { identifier: data.identifier },
      });
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to send reset code.';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: isDark ? colors.background : '#FFFFFF' }}>
      <View className="flex-1 justify-center px-6">
        <Text className="mb-2 text-2xl font-bold" style={{ color: colors.text }}>
          Forgot Password?
        </Text>
        <Text className="mb-8" style={{ color: colors.textSecondary }}>
          Enter your email or force number to receive a verification code.
        </Text>

        <Controller
          control={control}
          name="identifier"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email or Force Number"
              placeholder="Enter your email or force number"
              leftIcon="person-outline"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.identifier?.message}
            />
          )}
        />

        <Button
          title="Send Reset Code"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          className="mt-4"
        />

        <Button
          title="Back to Login"
          variant="ghost"
          onPress={() => router.back()}
          className="mt-4"
        />
      </View>
    </SafeAreaView>
  );
}
