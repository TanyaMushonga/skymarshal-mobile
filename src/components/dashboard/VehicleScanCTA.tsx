import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui';

interface VehicleScanCTAProps {
  onPress: () => void;
}

export const VehicleScanCTA: React.FC<VehicleScanCTAProps> = ({ onPress }) => {
  const { colors, isDark } = useTheme();

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <Card
        variant="elevated"
        className="mb-6 overflow-hidden"
        style={{
          padding: 0,
          backgroundColor: isDark ? colors.surface : '#FFFFFF',
        }}>
        <View className="flex-row items-center p-5">
          <View
            className="mr-4 h-14 w-14 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.08)',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
            }}>
            <Ionicons name="scan-outline" size={30} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-[19px] font-bold tracking-tight" style={{ color: colors.text }}>
              Vehicle Quick Scan
            </Text>
            <Text
              className="mt-0.5 text-[13px] font-medium leading-4"
              style={{ color: colors.textSecondary }}>
              Lookup license plates or scan with AI camera for instant history
            </Text>
          </View>
          <View
            className="h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: isDark ? '#1F1F1F' : '#F9FAFB' }}>
            <Ionicons name="chevron-forward" size={18} color={isDark ? '#4B5563' : '#9CA3AF'} />
          </View>
        </View>

        {/* Feature badges */}
        <View
          className="flex-row items-center border-t px-5 py-3.5"
          style={{
            borderColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
            backgroundColor: isDark ? '#080808' : '#F9FAFB',
          }}>
          <View className="mr-5 flex-row items-center">
            <View
              className="mr-1.5 h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: colors.success }}
            />
            <Text
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: isDark ? '#888' : '#71717A' }}>
              ALPR Scanning
            </Text>
          </View>
          <View className="flex-row items-center">
            <View
              className="mr-1.5 h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: colors.primary }}
            />
            <Text
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: isDark ? '#888' : '#71717A' }}>
              System Online
            </Text>
          </View>
          <View className="ml-auto">
            <Text className="text-[10px] font-bold text-amber-500 opacity-80">PREMIUM</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};
