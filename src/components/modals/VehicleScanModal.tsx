import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Keyboard, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { BaseModal } from '../ui/BaseModal';
import { Card, Button, Input, Badge } from '@/components/ui';
import { vehiclesApi } from '@/api/vehicles';
import { useTheme } from '@/contexts/ThemeContext';
import { useUIStore } from '@/stores/uiStore';
import { useToast } from '@/hooks/useToast';
import type { VehicleLookupResponse } from '@/types/api';
import { safeFormatSnapshot } from '@/lib/dateUtils';

export const VehicleScanModal: React.FC = () => {
  const { vehicleScanVisible, setVehicleScanVisible, openViolationDetail, openPayment } =
    useUIStore();
  const { colors, isDark } = useTheme();
  const { showToast } = useToast();

  const [plate, setPlate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VehicleLookupResponse | null>(null);

  const formatPlate = (text: string) => text.toUpperCase();
  const handlePlateChange = (text: string) => setPlate(formatPlate(text));

  const handleLookup = async () => {
    const trimmedPlate = plate.trim();
    if (!trimmedPlate) {
      showToast('warning', 'Input Required', 'Please enter a license plate number');
      return;
    }
    setLoading(true);
    Keyboard.dismiss();
    try {
      const data = await vehiclesApi.lookupByPlate(trimmedPlate);
      setResult(data);
    } catch (error: any) {
      showToast('error', 'Lookup Failed', error.message || 'Could not find vehicle details');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFines = async () => {
    if (!result?.vehicle?.license_plate && !result?.resolved_plate) return;
    const plateToClear = result.vehicle?.license_plate || result.resolved_plate;
    Alert.alert(
      'Clear Fines',
      `Are you sure you want to clear all outstanding fines for ${plateToClear}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await vehiclesApi.clearFines(plateToClear);
              showToast(
                'success',
                'Fines Cleared',
                `Successfully cleared all fines for ${plateToClear}`
              );
              handleLookup();
            } catch (error: any) {
              showToast('error', 'Action Failed', error.message || 'Could not clear fines');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleScan = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to scan license plates.');
      return;
    }
    const pickerResult = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      setLoading(true);
      try {
        const data = await vehiclesApi.lookupByImage(pickerResult.assets[0].uri);
        setResult(data);
        setPlate(formatPlate(data.resolved_plate));
      } catch (error: any) {
        showToast('error', 'Scan Failed', error.message || 'Could not read plate from image');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => setVehicleScanVisible(false);

  // ─── Stat Pill ────────────────────────────────────────────────────────────
  const StatPill = ({
    icon,
    label,
    value,
    danger,
  }: {
    icon: string;
    label: string;
    value: string | number;
    danger?: boolean;
  }) => (
    <View
      className="flex-1 items-center rounded-2xl px-3 py-4"
      style={{
        backgroundColor: danger
          ? isDark
            ? 'rgba(239,68,68,0.12)'
            : 'rgba(239,68,68,0.07)'
          : isDark
            ? '#141414'
            : '#F5F5F5',
      }}>
      <Ionicons
        name={icon as any}
        size={18}
        color={danger ? '#EF4444' : colors.primary}
        style={{ marginBottom: 6 }}
      />
      <Text
        style={{
          fontSize: 22,
          fontWeight: '800',
          color: danger ? '#EF4444' : colors.text,
          fontVariant: ['tabular-nums'],
          lineHeight: 26,
        }}>
        {value}
      </Text>
      <Text
        style={{
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: colors.textSecondary,
          marginTop: 3,
        }}>
        {label}
      </Text>
    </View>
  );

  // ─── Info Row ─────────────────────────────────────────────────────────────
  const InfoRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
    <View className="flex-row items-center py-3" style={{ borderBottomWidth: 0 }}>
      <View
        className="mr-3 h-8 w-8 items-center justify-center rounded-lg"
        style={{ backgroundColor: isDark ? '#1C1C1C' : '#F0F0F0' }}>
        <Ionicons name={icon as any} size={15} color={colors.primary} />
      </View>
      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, flex: 1 }}>
        {label}
      </Text>
      <Text
        style={{
          fontSize: 13,
          fontWeight: '700',
          color: colors.text,
          maxWidth: '55%',
          textAlign: 'right',
        }}>
        {value}
      </Text>
    </View>
  );

  // ─── Section Header ───────────────────────────────────────────────────────
  const SectionHeader = ({ title }: { title: string }) => (
    <View className="mb-4 mt-8 flex-row items-center">
      <Text
        style={{
          fontSize: 11,
          fontWeight: '800',
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: colors.textSecondary,
        }}>
        {title}
      </Text>
      <View
        className="ml-3 flex-1"
        style={{ height: 1, backgroundColor: isDark ? '#1F1F1F' : '#EBEBEB' }}
      />
    </View>
  );

  return (
    <BaseModal
      visible={vehicleScanVisible}
      onClose={handleClose}
      title="Vehicle Quick Scan"
      subtitle="Manual lookup or ALPR scanning">
      <View className="flex-1">
        {/* ── Search Bar ──────────────────────────────────────── */}
        <View
          className="px-5 pb-5 pt-4"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#1A1A1A' : '#EFEFEF',
          }}>
          <View className="flex-row items-center gap-3">
            <View className="flex-1">
              <Input
                placeholder="KBA 800D"
                value={plate}
                onChangeText={handlePlateChange}
                autoCapitalize="characters"
                returnKeyType="search"
                onSubmitEditing={handleLookup}
                containerClassName="mb-0"
              />
            </View>
            <TouchableOpacity
              onPress={handleScan}
              className="h-14 w-14 items-center justify-center rounded-xl"
              style={{
                backgroundColor: isDark ? '#141414' : '#F3F4F6',
                borderWidth: 1,
                borderColor: isDark ? '#2A2A2A' : '#E5E7EB',
              }}>
              <Ionicons name="camera" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <Button
            title="SEARCH DATABASE"
            onPress={handleLookup}
            loading={loading}
            className="h-13 mt-3"
            textClassName="tracking-[2px] font-black text-[12px]"
          />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}>
          {result ? (
            <View>
              {/* ── Revocation Banner ──────────────────────── */}
              {result.vehicle?.license_status === 'REVOKED' && (
                <View
                  className="mt-5 overflow-hidden rounded-2xl"
                  style={{
                    borderWidth: 1.5,
                    borderColor: '#EF4444',
                    backgroundColor: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.05)',
                  }}>
                  <View
                    className="flex-row items-center px-4 py-2.5"
                    style={{ backgroundColor: '#EF4444' }}>
                    <Ionicons name="alert-circle" size={16} color="white" />
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 11,
                        fontWeight: '900',
                        letterSpacing: 2.5,
                        textTransform: 'uppercase',
                        marginLeft: 7,
                      }}>
                      Revocation Alert
                    </Text>
                  </View>
                  <View className="px-4 py-3">
                    <Text
                      style={{ color: '#EF4444', fontSize: 14, fontWeight: '700', lineHeight: 20 }}>
                      This vehicle&apos;s license has been revoked and is not authorised to operate
                      on public roads.
                    </Text>
                  </View>
                </View>
              )}

              {/* ── Plate + Status ─────────────────────────── */}
              <View className="mt-5">
                <View className="flex-row items-end justify-between">
                  <View>
                    <Text
                      style={{
                        fontSize: 42,
                        fontWeight: '900',
                        letterSpacing: -1,
                        color: colors.text,
                        fontVariant: ['tabular-nums'],
                        lineHeight: 46,
                      }}>
                      {result.vehicle?.license_plate || result.resolved_plate}
                    </Text>
                    <View className="mt-2 flex-row items-center gap-2">
                      <Badge
                        label={result.vehicle?.license_status || 'UNREGISTERED'}
                        variant={result.vehicle?.license_status === 'ACTIVE' ? 'success' : 'error'}
                      />
                      <View
                        className="flex-row items-center rounded-lg px-2.5 py-1"
                        style={{ backgroundColor: isDark ? '#1C1C1C' : '#F0F0F0' }}>
                        <Ionicons name="star" size={11} color="#F59E0B" />
                        <Text
                          style={{
                            color: colors.text,
                            fontSize: 11,
                            fontWeight: '800',
                            marginLeft: 4,
                            letterSpacing: 0.5,
                          }}>
                          {result.vehicle?.license_points ?? 0} pts
                        </Text>
                      </View>
                    </View>
                  </View>
                  {/* Last seen drone badge */}
                  {result.summary.last_seen && (
                    <View className="items-end">
                      <View
                        className="flex-row items-center rounded-xl px-3 py-2"
                        style={{ backgroundColor: isDark ? '#141414' : '#F5F5F5' }}>
                        <Ionicons name="wifi-outline" size={13} color={colors.primary} />
                        <Text
                          style={{
                            color: colors.primary,
                            fontSize: 11,
                            fontWeight: '800',
                            marginLeft: 5,
                          }}>
                          {result.summary.last_seen.drone}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: colors.textSecondary,
                          fontSize: 10,
                          marginTop: 4,
                          fontWeight: '600',
                        }}>
                        {safeFormatSnapshot(result.summary.last_seen.timestamp)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* ── Vehicle Make/Model ──────────────────────── */}
              {result.vehicle && (
                <Text
                  style={{
                    marginTop: 8,
                    fontSize: 15,
                    fontWeight: '600',
                    color: colors.textSecondary,
                    letterSpacing: 0.2,
                  }}>
                  {result.vehicle.make} {result.vehicle.model}
                  {'  ·  '}
                  <Text style={{ color: colors.text, fontWeight: '700' }}>
                    {result.vehicle.color}
                  </Text>
                </Text>
              )}

              {/* ── Stats Row ───────────────────────────────── */}
              <View className="mt-5 flex-row gap-3">
                <StatPill
                  icon="radio-outline"
                  label="Detections"
                  value={result.summary.total_detections}
                />
                <StatPill
                  icon="warning-outline"
                  label="Violations"
                  value={result.summary.total_violations}
                  danger={result.summary.total_violations > 0}
                />
                <StatPill
                  icon="cash-outline"
                  label="Outstanding"
                  value={`$${result.summary.total_fines_outstanding}`}
                  danger={result.summary.total_fines_outstanding > 0}
                />
              </View>

              {/* ── Pay All Button ──────────────────────────── */}
              {result.summary.total_fines_outstanding > 0 && (
                <TouchableOpacity
                  onPress={() =>
                    openPayment(
                      result.vehicle?.license_plate || result.resolved_plate,
                      result.summary.total_fines_outstanding
                    )
                  }
                  className="mt-4 flex-row items-center justify-center rounded-2xl py-4"
                  style={{ backgroundColor: '#F59E0B' }}>
                  <Ionicons name="card" size={18} color="white" />
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 12,
                      fontWeight: '900',
                      letterSpacing: 2,
                      marginLeft: 8,
                      textTransform: 'uppercase',
                    }}>
                    Pay All Outstanding Fines
                  </Text>
                </TouchableOpacity>
              )}

              {/* ── Registered Owner ────────────────────────── */}
              <SectionHeader title="Registered Owner" />
              <View
                className="rounded-2xl p-4"
                style={{ backgroundColor: isDark ? '#0F0F0F' : '#F8F8F8' }}>
                <View className="flex-row items-center">
                  <View
                    className="mr-4 h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: isDark ? '#1C1C1C' : '#EFEFEF' }}>
                    <Ionicons name="person" size={22} color={colors.primary} />
                  </View>
                  <View className="flex-1">
                    <Text
                      style={{
                        fontSize: 17,
                        fontWeight: '800',
                        color: colors.text,
                        letterSpacing: -0.3,
                      }}>
                      {result.vehicle?.owner_name || 'No registration record'}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '500',
                        color: colors.textSecondary,
                        marginTop: 2,
                      }}>
                      {result.vehicle?.owner_phone_number || 'Identity not established'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* ── Vehicle Details ──────────────────────────── */}
              {result.vehicle && (
                <>
                  <SectionHeader title="Vehicle Details" />
                  <View
                    className="overflow-hidden rounded-2xl"
                    style={{
                      backgroundColor: isDark ? '#0F0F0F' : '#F8F8F8',
                      borderWidth: 1,
                      borderColor: isDark ? '#1C1C1C' : '#EDEDED',
                    }}>
                    <View className="px-4">
                      <InfoRow
                        icon="car-outline"
                        label="Make & Model"
                        value={`${result.vehicle.make || 'Unknown'} ${result.vehicle.model || ''}`.trim()}
                      />
                      <View
                        style={{ height: 1, backgroundColor: isDark ? '#1A1A1A' : '#F0F0F0' }}
                      />
                      <InfoRow
                        icon="color-palette-outline"
                        label="Colour"
                        value={result.vehicle.color || 'Unknown'}
                      />
                      <View
                        style={{ height: 1, backgroundColor: isDark ? '#1A1A1A' : '#F0F0F0' }}
                      />
                      <InfoRow
                        icon="checkmark-shield-outline"
                        label="Licence Status"
                        value={result.vehicle.license_status || 'Unknown'}
                      />
                    </View>
                  </View>
                </>
              )}

              {/* ── Recent Sightings ─────────────────────────── */}
              {result.recent_detections.length > 0 && (
                <>
                  <SectionHeader title="Recent Sightings" />
                  <View className="gap-2">
                    {result.recent_detections.slice(0, 4).map((det) => (
                      <View
                        key={det.id}
                        className="flex-row items-center justify-between rounded-xl px-4 py-3"
                        style={{
                          backgroundColor: isDark ? '#0F0F0F' : '#F8F8F8',
                          borderWidth: 1,
                          borderColor: isDark ? '#1C1C1C' : '#EDEDED',
                        }}>
                        <View className="flex-row items-center">
                          <View
                            className="mr-3 h-8 w-8 items-center justify-center rounded-lg"
                            style={{ backgroundColor: isDark ? '#1C1C1C' : '#EFEFEF' }}>
                            <Ionicons name="locate-outline" size={15} color={colors.primary} />
                          </View>
                          <View>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>
                              Drone {det.drone_id}
                            </Text>
                            <Text
                              style={{
                                fontSize: 11,
                                color: colors.textSecondary,
                                marginTop: 1,
                                fontWeight: '500',
                              }}>
                              {safeFormatSnapshot(det.timestamp)}
                            </Text>
                          </View>
                        </View>
                        <View className="items-end">
                          <Text
                            style={{
                              fontSize: 18,
                              fontWeight: '800',
                              color: colors.text,
                              fontVariant: ['tabular-nums'],
                            }}>
                            {det.speed.toFixed(1)}
                          </Text>
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: '700',
                              color: colors.textSecondary,
                              letterSpacing: 0.8,
                            }}>
                            km/h
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {/* ── Violations ───────────────────────────────── */}
              <SectionHeader title="Violation History" />
              {result.violations_history.length > 0 ? (
                <View className="gap-3">
                  {result.violations_history.map((v) => {
                    const fineInfo = result.fines_issued?.find((f) => f.id === v.id);
                    const paidAmount = fineInfo?.paid_amount || 0;
                    const isPaid = v.status === 'PAID';

                    return (
                      <View
                        key={v.id}
                        className="overflow-hidden rounded-2xl"
                        style={{
                          backgroundColor: isDark ? '#0F0F0F' : '#F8F8F8',
                          borderWidth: 1,
                          borderColor: isDark ? '#1C1C1C' : '#EDEDED',
                        }}>
                        {/* Violation Header */}
                        <View className="flex-row items-start px-4 pt-4">
                          <View
                            className="mr-3 mt-0.5 h-9 w-9 items-center justify-center rounded-xl"
                            style={{
                              backgroundColor: isPaid
                                ? isDark
                                  ? 'rgba(34,197,94,0.12)'
                                  : 'rgba(34,197,94,0.1)'
                                : isDark
                                  ? 'rgba(239,68,68,0.12)'
                                  : 'rgba(239,68,68,0.08)',
                            }}>
                            <Ionicons
                              name={isPaid ? 'checkmark-circle-outline' : 'warning-outline'}
                              size={18}
                              color={isPaid ? '#22C55E' : '#EF4444'}
                            />
                          </View>
                          <View className="flex-1">
                            <View className="flex-row items-start justify-between">
                              <Text
                                style={{
                                  fontSize: 15,
                                  fontWeight: '800',
                                  color: colors.text,
                                  flex: 1,
                                  lineHeight: 20,
                                  letterSpacing: -0.2,
                                }}>
                                {v.type}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 18,
                                  fontWeight: '900',
                                  color: isPaid ? '#22C55E' : '#EF4444',
                                  marginLeft: 10,
                                  fontVariant: ['tabular-nums'],
                                }}>
                                ${v.fine}
                              </Text>
                            </View>
                            <Text
                              style={{
                                fontSize: 12,
                                color: colors.textSecondary,
                                marginTop: 3,
                                fontWeight: '500',
                              }}>
                              {safeFormatSnapshot(v.timestamp)}
                            </Text>
                          </View>
                        </View>

                        {/* Description */}
                        {fineInfo?.description && (
                          <View className="mx-4 mt-2">
                            <Text
                              style={{
                                fontSize: 13,
                                color: colors.textSecondary,
                                lineHeight: 18,
                                fontWeight: '500',
                              }}>
                              {fineInfo.description}
                            </Text>
                          </View>
                        )}

                        {/* Status Row */}
                        <View className="mt-3 flex-row items-center justify-between px-4">
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: '700',
                              letterSpacing: 1,
                              textTransform: 'uppercase',
                              color: isPaid ? '#22C55E' : colors.textSecondary,
                            }}>
                            {v.status}
                          </Text>
                          {!isPaid && (
                            <Text
                              style={{
                                fontSize: 12,
                                fontWeight: '600',
                                color: colors.textSecondary,
                                fontVariant: ['tabular-nums'],
                              }}>
                              Paid: ${paidAmount}
                            </Text>
                          )}
                        </View>

                        {/* Actions */}
                        <View className="flex-row gap-2 p-4">
                          <TouchableOpacity
                            onPress={() => openViolationDetail(v.id)}
                            className="h-10 flex-1 items-center justify-center rounded-xl"
                            style={{
                              borderWidth: 1,
                              borderColor: isDark ? '#2A2A2A' : '#E0E0E0',
                            }}>
                            <Text
                              style={{
                                fontSize: 11,
                                fontWeight: '800',
                                color: colors.textSecondary,
                                letterSpacing: 1,
                              }}>
                              VIEW DETAILS
                            </Text>
                          </TouchableOpacity>
                          {!isPaid && (
                            <TouchableOpacity
                              onPress={() =>
                                openPayment(
                                  result.vehicle?.license_plate || result.resolved_plate,
                                  fineInfo?.outstanding_balance ?? v.fine,
                                  v.id
                                )
                              }
                              className="h-10 flex-1 items-center justify-center rounded-xl"
                              style={{ backgroundColor: '#F59E0B' }}>
                              <Text
                                style={{
                                  fontSize: 11,
                                  fontWeight: '900',
                                  color: 'white',
                                  letterSpacing: 1,
                                }}>
                                PAY NOW
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View
                  className="items-center rounded-2xl py-10"
                  style={{ backgroundColor: isDark ? '#0F0F0F' : '#F8F8F8' }}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={36}
                    color={isDark ? '#2A2A2A' : '#DEDEDE'}
                  />
                  <Text
                    style={{
                      color: colors.textSecondary,
                      marginTop: 10,
                      fontSize: 13,
                      fontWeight: '600',
                    }}>
                    No violation history recorded
                  </Text>
                </View>
              )}

              {/* ── Global Clearance ─────────────────────────── */}
              {result.summary.total_fines_outstanding > 0 && (
                <View className="mt-8">
                  <Button
                    title="CLEAR ALL"
                    variant="outline"
                    onPress={handleClearFines}
                    loading={loading}
                    className="h-14 rounded-2xl border-2"
                    textClassName="font-black tracking-[2px] text-[12px]"
                  />
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: 11,
                      fontWeight: '500',
                      color: colors.textSecondary,
                      marginTop: 8,
                    }}>
                    Standard fine administrative clearance
                  </Text>
                </View>
              )}
            </View>
          ) : (
            /* ── Empty State ──────────────────────────────── */
            <View className="items-center py-24">
              <View
                className="mb-6 h-20 w-20 items-center justify-center rounded-3xl"
                style={{ backgroundColor: isDark ? '#0F0F0F' : '#F5F5F5' }}>
                <Ionicons
                  name="car-sport-outline"
                  size={38}
                  color={isDark ? '#2A2A2A' : '#CFCFCF'}
                />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '800',
                  color: colors.text,
                  letterSpacing: -0.3,
                  textAlign: 'center',
                }}>
                No vehicle loaded
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '500',
                  color: colors.textSecondary,
                  marginTop: 8,
                  textAlign: 'center',
                  lineHeight: 20,
                }}>
                Enter a licence plate above or use the{'\n'}camera to scan with ALPR.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </BaseModal>
  );
};
