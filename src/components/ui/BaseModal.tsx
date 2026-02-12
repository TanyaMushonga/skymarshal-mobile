import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const BaseModal: React.FC<BaseModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
  footer,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        style={{ backgroundColor: colors.background }}>
        <SafeAreaView className="flex-1">
          {/* Header */}
          <View
            className="flex-row items-center border-b px-5 py-4"
            style={{ borderBottomColor: isDark ? '#1F1F1F' : '#E8E8E8' }}>
            <View className="flex-1">
              <Text className="text-xl font-bold tracking-tight" style={{ color: colors.text }}>
                {title}
              </Text>
              {subtitle && (
                <Text className="mt-0.5 text-[13px]" style={{ color: colors.textSecondary }}>
                  {subtitle}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: isDark ? '#1A1A1A' : '#F3F4F6' }}>
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View className="flex-1">{children}</View>

          {/* Footer */}
          {footer && (
            <View
              className="border-t px-5 pt-4"
              style={{
                borderTopColor: isDark ? '#1F1F1F' : '#E8E8E8',
                backgroundColor: colors.background,
                paddingBottom: Platform.OS === 'ios' ? 0 : 20,
              }}>
              {footer}
            </View>
          )}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};
