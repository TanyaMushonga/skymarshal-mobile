import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/ui';
import { authApi } from '@/api';
import { useTheme } from '@/contexts/ThemeContext';

export default function VerifyResetScreen() {
  const router = useRouter();
  const { identifier } = useLocalSearchParams<{ identifier: string }>();
  const { colors, isDark } = useTheme();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

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
      const isEmail = identifier?.includes('@');
      const payload = isEmail
        ? { email: identifier, code: fullCode }
        : { force_number: identifier, code: fullCode };

      const response = await authApi.verifyPasswordResetCode(payload);

      router.push({
        pathname: '/(auth)/new-password',
        params: { token: response.token },
      });
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Invalid code. Please try again.';
      Alert.alert('Verification Failed', message);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
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
          Verify Reset Code
        </Text>
        <Text className="mb-8" style={{ color: colors.textSecondary }}>
          Enter the 6-digit code sent to {identifier}
        </Text>

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

        <Button title="Verify Code" onPress={() => handleSubmit()} loading={isLoading} />
      </View>
    </SafeAreaView>
  );
}
