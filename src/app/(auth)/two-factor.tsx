import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui';
import { authApi } from '@/api';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/contexts/ThemeContext';

export default function TwoFactorScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { tempToken, setUser, setRequires2FA } = useAuthStore();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (index === 5 && text) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        handleSubmit(fullCode);
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (codeString?: string) => {
    const fullCode = codeString || code.join('');
    if (fullCode.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit code');
      return;
    }

    try {
      setIsLoading(true);
      const response = await authApi.verify2FA({
        code: fullCode,
        temp_token: tempToken || '',
      });

      setRequires2FA(false);
      setUser(response.user);
      router.replace('/(tabs)');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Invalid code. Please try again.';
      Alert.alert('Verification Failed', message);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setCountdown(60);
    Alert.alert('Code Sent', 'A new verification code has been sent.');
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: isDark ? colors.background : '#FFFFFF' }}>
      <View className="flex-1 justify-center px-6">
        <View className="mb-8 items-center">
          <Text className="mb-2 text-2xl font-bold" style={{ color: colors.text }}>
            Two-Factor Authentication
          </Text>
          <Text className="text-center" style={{ color: colors.textSecondary }}>
            Enter the 6-digit code sent to your phone
          </Text>
        </View>

        {/* OTP Input */}
        <View className="mb-8 flex-row justify-center gap-2">
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              className="h-14 w-12 rounded-xl border-2 text-center text-2xl font-bold"
              style={{
                backgroundColor: isDark ? colors.surface : '#F9FAFB',
                borderColor: digit ? colors.primary : colors.border,
                color: colors.text,
              }}
              value={digit}
              onChangeText={(text) => handleCodeChange(text.slice(-1), index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Verify Button */}
        <Button
          title="Verify"
          onPress={() => handleSubmit()}
          loading={isLoading}
          className="mb-6"
        />

        {/* Resend Code */}
        <View className="items-center">
          <Text style={{ color: colors.textSecondary }}>Didn&apos;t receive the code?</Text>
          <Button
            title={countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
            variant="ghost"
            onPress={handleResend}
            disabled={countdown > 0}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
