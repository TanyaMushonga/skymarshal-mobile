import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button, Input } from '@/components/ui';
import { authApi } from '@/api';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/useToast';

const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type NewPasswordForm = z.infer<typeof newPasswordSchema>;

export default function NewPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const { colors, isDark } = useTheme();
  const { showToast } = useToast();
  const { requiresPasswordChange, setRequiresPasswordChange } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<NewPasswordForm>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password');

  const getPasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[a-z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#10B981'];
  const strength = getPasswordStrength(password);

  const onSubmit = async (data: NewPasswordForm) => {
    try {
      setIsLoading(true);

      if (requiresPasswordChange) {
        // Change password flow (authenticated)
        await authApi.changePassword({
          current_password: '', // Would need to collect this
          new_password: data.password,
          confirm_password: data.confirmPassword,
        });
        setRequiresPasswordChange(false);
        router.replace('/(tabs)');
      } else if (token) {
        // Reset password flow
        await authApi.confirmPasswordReset({
          token,
          new_password: data.password,
          confirm_password: data.confirmPassword,
        });
        showToast('success', 'Success', 'Password reset successfully!');
        router.replace('/(auth)/login');
      }
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to update password.';
      showToast('error', 'Error', message);
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
          Create New Password
        </Text>
        <Text className="mb-8" style={{ color: colors.textSecondary }}>
          Your new password must be different from previous passwords.
        </Text>

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="New Password"
              placeholder="Enter new password"
              leftIcon="lock-closed-outline"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
            />
          )}
        />

        {/* Password Strength Indicator */}
        {password && (
          <View className="mb-4">
            <View className="mb-1 flex-row gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  className="h-1 flex-1 rounded-full"
                  style={{
                    backgroundColor: i < strength ? strengthColors[strength - 1] : colors.border,
                  }}
                />
              ))}
            </View>
            <Text style={{ color: strengthColors[strength - 1] || colors.textSecondary }}>
              {strength > 0 ? strengthLabels[strength - 1] : ''}
            </Text>
          </View>
        )}

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Confirm Password"
              placeholder="Confirm new password"
              leftIcon="lock-closed-outline"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.confirmPassword?.message}
            />
          )}
        />

        <Button
          title="Reset Password"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          className="mt-4"
        />
      </View>
    </SafeAreaView>
  );
}
