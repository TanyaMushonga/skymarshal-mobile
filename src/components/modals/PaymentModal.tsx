import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { BaseModal } from '../ui/BaseModal';
import { Button, Input } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useUIStore } from '@/stores/uiStore';
import { useToast } from '@/hooks/useToast';
import { vehiclesApi } from '@/api/vehicles';

export const PaymentModal: React.FC = () => {
  const {
    paymentModalVisible,
    setPaymentModalVisible,
    paymentPlate,
    paymentViolationId,
    paymentAmount,
  } = useUIStore();
  const { colors, isDark } = useTheme();
  const { showToast } = useToast();

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'ZIG'>('USD');
  const [method, setMethod] = useState<'CASH' | 'WIRE_TRANSFER'>('CASH');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (paymentModalVisible) {
      setCurrency('USD');
      setMethod('CASH');
      if (paymentAmount) {
        setAmount(paymentAmount.toString());
      } else {
        setAmount('');
      }
    }
  }, [paymentModalVisible, paymentAmount]);

  useEffect(() => {
    if (paymentAmount) {
      if (currency === 'ZIG') {
        const zigAmount = paymentAmount * 25;
        setAmount(zigAmount.toString());
      } else {
        setAmount(paymentAmount.toString());
      }
    }
  }, [currency, paymentAmount]);

  const handlePayment = async () => {
    if (!paymentPlate) return;

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      showToast('warning', 'Invalid Amount', 'Please enter a valid payment amount');
      return;
    }

    setLoading(true);
    try {
      await vehiclesApi.recordPayment({
        plate: paymentPlate,
        amount: numericAmount,
        currency,
        method,
        violation_id: paymentViolationId || undefined,
      });

      showToast(
        'success',
        'Payment Recorded',
        `Successfully recorded ${currency} ${numericAmount} payment for ${paymentPlate}`
      );
      setPaymentModalVisible(false);
      // Trigger a refresh if possible, usually by refreshing the vehicle lookup
    } catch (error: any) {
      showToast('error', 'Payment Failed', error.message || 'Could not record payment');
    } finally {
      setLoading(false);
    }
  };

  const SelectionButton = ({
    label,
    selected,
    onPress,
    icon,
  }: {
    label: string;
    selected: boolean;
    onPress: () => void;
    icon: keyof typeof Ionicons.glyphMap;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 flex-row items-center justify-center rounded-xl border-2 px-2 py-3 ${
        selected ? 'border-amber-500 bg-amber-500/10' : 'border-transparent bg-transparent'
      }`}
      style={!selected ? { backgroundColor: isDark ? '#1A1A1A' : '#F3F4F6' } : {}}>
      <Ionicons
        name={icon}
        size={18}
        color={selected ? colors.primary : colors.textSecondary}
        style={{ marginRight: 8 }}
      />
      <Text
        className={`font-bold ${selected ? 'text-amber-500' : ''}`}
        style={!selected ? { color: colors.textSecondary } : {}}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <BaseModal
      visible={paymentModalVisible}
      onClose={() => setPaymentModalVisible(false)}
      title="Record Payment"
      subtitle={`Processing payment for ${paymentPlate}`}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text
          className="mb-4 text-xs font-bold uppercase tracking-widest"
          style={{ color: colors.textSecondary }}>
          Select Currency
        </Text>
        <View className="mb-6 flex-row gap-3">
          <SelectionButton
            label="USD"
            selected={currency === 'USD'}
            onPress={() => setCurrency('USD')}
            icon="cash-outline"
          />
          <SelectionButton
            label="ZiG"
            selected={currency === 'ZIG'}
            onPress={() => setCurrency('ZIG')}
            icon="wallet-outline"
          />
        </View>

        <Text
          className="mb-4 text-xs font-bold uppercase tracking-widest"
          style={{ color: colors.textSecondary }}>
          Payment Method
        </Text>
        <View className="mb-6 flex-row gap-3">
          <SelectionButton
            label="Cash"
            selected={method === 'CASH'}
            onPress={() => setMethod('CASH')}
            icon="wallet"
          />
          <SelectionButton
            label="Wire"
            selected={method === 'WIRE_TRANSFER'}
            onPress={() => setMethod('WIRE_TRANSFER')}
            icon="swap-horizontal"
          />
        </View>

        <Text
          className="mb-4 text-xs font-bold uppercase tracking-widest"
          style={{ color: colors.textSecondary }}>
          Amount to Pay
        </Text>
        <Input
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          leftIcon="calculator-outline"
        />

        <Button
          title="CONFIRM PAYMENT"
          onPress={handlePayment}
          loading={loading}
          className="mt-6 h-14"
          textClassName="font-black tracking-widest"
        />

        <Text
          className="mt-4 text-center text-xs font-medium italic"
          style={{ color: colors.textSecondary }}>
          Payments exceeding the current fine will be automatically applied to the next oldest
          outstanding violation.
        </Text>
      </ScrollView>
    </BaseModal>
  );
};
