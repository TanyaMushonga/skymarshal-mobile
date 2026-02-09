import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';

import { Button, Input } from '@/components/ui';
import { authApi } from '@/api';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTheme } from '@/contexts/ThemeContext';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or Force Number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { setUser, setRequires2FA, setRequiresPasswordChange } = useAuthStore();
  const { biometricEnabled } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(false);
  const [biometricType, setBiometricType] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  React.useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (compatible) {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('Face ID');
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('Fingerprint');
      }
    }
  };

  const handleBiometricAuth = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Login to SkyMarshal',
      fallbackLabel: 'Use password',
    });

    if (result.success) {
      // Biometric auth successful, use stored credentials
      Alert.alert('Success', 'Biometric authentication successful');
    }
  };

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);

      const isEmail = data.identifier.includes('@');
      const credentials = isEmail
        ? { email: data.identifier, password: data.password }
        : { force_number: data.identifier, password: data.password };

      const response = await authApi.login(credentials);

      if (response.requires_2fa) {
        setRequires2FA(true, response.tokens?.access);
        router.push('/(auth)/two-factor');
        return;
      }

      if (response.requires_password_change) {
        setRequiresPasswordChange(true);
        setUser(response.user);
        router.push('/(auth)/new-password');
        return;
      }

      setUser(response.user);
      router.replace('/(tabs)');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Login failed. Please try again.';
      Alert.alert('Login Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: isDark ? colors.background : '#FFFFFF' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled">
          <View className="flex-1 justify-center px-6 py-8">
            {/* Logo Section */}
            <View className="mb-12 items-center">
              <View className="bg-primary-500 mb-4 h-24 w-24 items-center justify-center rounded-3xl">
                <Ionicons name="airplane" size={48} color="#FFFFFF" />
              </View>
              <Text className="text-3xl font-bold" style={{ color: colors.text }}>
                SkyMarshal
              </Text>
              <Text className="mt-2 text-base" style={{ color: colors.textSecondary }}>
                Patrol Officer Portal
              </Text>
            </View>

            {/* Login Form */}
            <View className="mb-6">
              <Controller
                control={control}
                name="identifier"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Force Number or Email"
                    placeholder="Enter your force number or email"
                    leftIcon="person-outline"
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.identifier?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Password"
                    placeholder="Enter your password"
                    leftIcon="lock-closed-outline"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                  />
                )}
              />
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity
              className="mb-6 self-end"
              onPress={() => router.push('/(auth)/forgot-password')}>
              <Text className="text-primary-500 font-medium">Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <Button
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              className="mb-4"
            />

            {/* Biometric Login */}
            {biometricEnabled && biometricType && (
              <TouchableOpacity
                className="flex-row items-center justify-center py-4"
                onPress={handleBiometricAuth}>
                <Ionicons
                  name={biometricType === 'Face ID' ? 'scan' : 'finger-print'}
                  size={24}
                  color={colors.primary}
                />
                <Text className="ml-2 font-medium" style={{ color: colors.text }}>
                  Login with {biometricType}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
