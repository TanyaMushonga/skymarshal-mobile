import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
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
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/errorHelper';

const loginSchema = z.object({
  force_number: z.string().min(1, 'Force Number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { setUser, setRequires2FA, setRequiresPasswordChange } = useAuthStore();
  const { biometricEnabled } = useSettingsStore();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [biometricType, setBiometricType] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      force_number: '',
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
      showToast('success', 'Success', 'Biometric authentication successful');
    }
  };

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);

      const credentials = {
        force_number: data.force_number,
        password: data.password,
      };

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
      showToast(
        'success',
        'Welcome Back',
        `Logged in as ${response.user.first_name} ${response.user.last_name}`
      );
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config?.url,
      });
      const message = getErrorMessage(error);
      showToast('error', 'Login Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: isDark ? colors.background : '#FFFFFF' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled">
          <View className="flex-1 px-6 py-12">
            {/* Logo Section */}
            <View className="items-sta mb-12">
              <Text className="text-3xl font-bold text-black dark:text-white">SkyMarshal</Text>
              <Text className="mt-2 text-lg leading-6" style={{ color: colors.textSecondary }}>
                Secure access for authorized personnel to manage deployments, monitor live
                telemetry, and record field observations.
              </Text>
            </View>

            {/* Login Form */}
            <View className="mb-6">
              <Controller
                control={control}
                name="force_number"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Force Number"
                    placeholder="e.g. SN-123456"
                    leftIcon="card-outline"
                    autoCapitalize="characters"
                    autoComplete="off"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.force_number?.message}
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
              <Text className="text-lg font-medium text-primary-500">Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <Button
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              size="lg"
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
                <Text className="ml-2 text-lg font-medium" style={{ color: colors.text }}>
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
