import React from 'react';
import { View, Text } from 'react-native';
import { BaseModal } from './BaseModal';
import { Button } from './Button';
import { useTheme } from '@/contexts/ThemeContext';

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger';
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  isLoading = false,
}) => {
  const { colors } = useTheme();

  const footer = (
    <View className="flex-row gap-3">
      <Button
        title={cancelLabel}
        variant="outline"
        onPress={onClose}
        className="flex-1"
        disabled={isLoading}
      />
      <Button
        title={confirmLabel}
        variant={variant === 'danger' ? 'danger' : 'primary'}
        onPress={onConfirm}
        className="flex-1"
        loading={isLoading}
      />
    </View>
  );

  return (
    <BaseModal visible={visible} onClose={onClose} title={title} footer={footer}>
      <View className="p-5">
        <Text className="text-[15px] leading-6" style={{ color: colors.textSecondary }}>
          {message}
        </Text>
      </View>
    </BaseModal>
  );
};
