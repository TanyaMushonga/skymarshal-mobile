import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import * as Print from 'expo-print';
import * as Share from 'expo-sharing';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { safeFormatSnapshot } from '@/lib/dateUtils';

import { BaseModal } from '../ui/BaseModal';
import { Card, Badge, Button } from '@/components/ui';
import { patrolsApi, violationsApi } from '@/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useUIStore } from '@/stores/uiStore';
import { useToast } from '@/hooks/useToast';

export const PatrolDetailModal: React.FC = () => {
  const { patrolDetailId, closeDetail, openViolationDetail, openTelemetry } = useUIStore();
  const { colors, isDark } = useTheme();
  const { showToast } = useToast();

  const { data: patrol, isLoading } = useQuery({
    queryKey: ['patrol', patrolDetailId],
    queryFn: () => patrolsApi.get(patrolDetailId!),
    enabled: !!patrolDetailId,
  });

  const { data: violations } = useQuery({
    queryKey: ['violations', 'patrol', patrolDetailId],
    queryFn: () => violationsApi.list({ patrol: patrolDetailId!, limit: 20 }),
    enabled: !!patrolDetailId,
  });

  // Use violations from patrol response if available, otherwise use separate query
  const violationsList = (patrol as any)?.violations || violations?.results || [];

  const getBatteryStatus = (level?: number) => {
    if (!level && level !== 0) return { color: '#6B7280', label: 'Unknown' };
    if (level >= 75) return { color: '#10B981', label: 'Good' };
    if (level >= 50) return { color: '#F59E0B', label: 'Fair' };
    if (level >= 25) return { color: '#EF4444', label: 'Low' };
    return { color: '#DC2626', label: 'Critical' };
  };

  const formatDuration = (seconds?: number) => {
    if (seconds === undefined || seconds === null) return '--:--:--';
    const hrs = Math.floor(Math.abs(seconds) / 3600);
    const mins = Math.floor((Math.abs(seconds) % 3600) / 60);
    const secs = Math.abs(seconds) % 60;
    const prefix = seconds < 0 ? '-' : '';
    return `${prefix}${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const exportPatrolReport = async () => {
    try {
      if (!patrol) return;

      const patrolNumber = (patrol as any)?.drone_id_str || patrol?.id?.slice(0, 8).toUpperCase();
      const batteryStatus = getBatteryStatus(patrol?.battery_level);
      const violationCount = violationsList.length;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Patrol Report #${patrolNumber}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; background: #f9fafb; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .header { border-bottom: 3px solid #3B82F6; padding-bottom: 20px; margin-bottom: 20px; }
            .header h1 { margin: 0; color: #1F2937; font-size: 28px; }
            .status-bar { display: inline-block; padding: 8px 16px; border-radius: 4px; background: ${patrol?.status === 'COMPLETED' ? '#10B981' : '#F59E0B'}; color: white; font-weight: bold; font-size: 12px; margin-top: 10px; }
            .section { margin-bottom: 25px; }
            .section h2 { font-size: 18px; color: #1F2937; margin: 0 0 12px 0; border-bottom: 2px solid #E5E7EB; padding-bottom: 8px; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 12px; }
            .metric { background: #F3F4F6; padding: 12px; border-radius: 6px; }
            .metric-label { font-size: 12px; color: #6B7280; margin-bottom: 4px; }
            .metric-value { font-size: 16px; font-weight: bold; color: #1F2937; }
            .full-width { grid-column: 1 / -1; }
            .violations-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            .violations-table th { background: #F3F4F6; padding: 10px; text-align: left; font-weight: bold; color: #1F2937; border-bottom: 1px solid #E5E7EB; }
            .violations-table td { padding: 10px; border-bottom: 1px solid #E5E7EB; }
            .violations-table tr:last-child td { border-bottom: none; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center; color: #6B7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Patrol Report</h1>
              <div class="status-bar">${patrol?.status || 'UNKNOWN'}</div>
            </div>

            <div class="section">
              <h2>Patrol Information</h2>
              <div class="grid">
                <div class="metric">
                  <div class="metric-label">Patrol Number</div>
                  <div class="metric-value">#${patrolNumber}</div>
                </div>
                <div class="metric">
                  <div class="metric-label">Battery Level</div>
                  <div class="metric-value" style="color: ${batteryStatus.color}">${patrol?.battery_level}% (${batteryStatus.label})</div>
                </div>
                <div class="metric">
                  <div class="metric-label">Start Time</div>
                  <div class="metric-value">${safeFormatSnapshot(patrol?.start_time)}</div>
                </div>
                <div class="metric">
                  <div class="metric-label">End Time</div>
                  <div class="metric-value">${patrol?.end_time ? safeFormatSnapshot(patrol.end_time) : 'Ongoing'}</div>
                </div>
              </div>
            </div>

            <div class="section">
              <h2>Patrol Statistics</h2>
              <div class="grid">
                <div class="metric">
                  <div class="metric-label">Duration</div>
                  <div class="metric-value">${formatDuration((patrol as any)?.flight_duration_seconds)}</div>
                </div>
                <div class="metric">
                  <div class="metric-label">Detections</div>
                  <div class="metric-value">${patrol?.detection_count || 0}</div>
                </div>
                <div class="metric full-width">
                  <div class="metric-label">Violations Found</div>
                  <div class="metric-value">${violationCount}</div>
                </div>
              </div>
            </div>

            ${
              (patrol as any)?.latest_location &&
              ((patrol as any).latest_location.latitude ||
                (patrol as any).latest_location.longitude)
                ? `
            <div class="section">
              <h2>Last Known Location</h2>
              <div class="grid">
                <div class="metric">
                  <div class="metric-label">Latitude</div>
                  <div class="metric-value">${(patrol as any).latest_location.latitude}</div>
                </div>
                <div class="metric">
                  <div class="metric-label">Longitude</div>
                  <div class="metric-value">${(patrol as any).latest_location.longitude}</div>
                </div>
                ${
                  (patrol as any).latest_location.altitude
                    ? `
                <div class="metric">
                  <div class="metric-label">Altitude</div>
                  <div class="metric-value">${Math.round((patrol as any).latest_location.altitude)} m</div>
                </div>
                `
                    : ''
                }
              </div>
            </div>
            `
                : ''
            }

            ${
              (patrol as any)?.patrol_config &&
              ((patrol as any).patrol_config.mode || (patrol as any).patrol_config.speed_limit)
                ? `
            <div class="section">
              <h2>Configuration</h2>
              <div class="grid">
                ${
                  (patrol as any).patrol_config.mode
                    ? `
                <div class="metric">
                  <div class="metric-label">Mode</div>
                  <div class="metric-value">${(patrol as any).patrol_config.mode.toUpperCase()}</div>
                </div>
                `
                    : ''
                }
                ${
                  (patrol as any).patrol_config.speed_limit
                    ? `
                <div class="metric">
                  <div class="metric-label">Speed Limit</div>
                  <div class="metric-value">${(patrol as any).patrol_config.speed_limit} km/h</div>
                </div>
                `
                    : ''
                }
              </div>
            </div>
            `
                : ''
            }

            ${
              violationCount > 0
                ? `
            <div class="section">
              <h2>Violations Detected</h2>
              <table class="violations-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>License Plate</th>
                    <th>Speed (km/h)</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  ${violationsList
                    .map(
                      (v: any) => `
                  <tr>
                    <td>${v.violation_type || 'Unknown'}</td>
                    <td>${v.detection?.vehicle_details?.license_plate || 'N/A'}</td>
                    <td>${v.detection?.recorded_speed || 'N/A'}</td>
                    <td>${safeFormatSnapshot(v.detection?.timestamp || v.created_at)}</td>
                  </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
            `
                : ''
            }

            <div class="footer">
              <p>Patrol Report #${patrolNumber}</p>
              <p>Generated on ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      if (await Share.isAvailableAsync()) {
        await Share.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Patrol Report',
          UTI: 'com.adobe.pdf',
        });
      } else {
        showToast('success', 'Export', 'Report generated successfully');
      }
    } catch {
      showToast('error', 'Export Failed', 'Could not generate patrol report');
    }
  };

  return (
    <BaseModal visible={!!patrolDetailId} onClose={closeDetail} title="Patrol Details">
      {isLoading ? (
        <View className="flex-1 items-center justify-center p-10">
          <Text style={{ color: colors.textSecondary }}>Loading patrol details...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Status & Summary Header */}
          <Card
            variant="elevated"
            className="mb-6"
            style={{
              padding: 0,
              overflow: 'hidden',
            }}>
            {/* Status Bar */}
            <View
              style={{
                backgroundColor: patrol?.status === 'COMPLETED' ? '#10B981' : '#F59E0B',
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}>
              <Text
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: '#FFFFFF' }}>
                {patrol?.status || 'UNKNOWN'}
              </Text>
            </View>

            {/* Content */}
            <View style={{ padding: 20 }}>
              <View className="mb-6 flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="mb-2 text-3xl font-bold" style={{ color: colors.text }}>
                    Patrol #{(patrol as any)?.drone_id_str || patrol?.id?.slice(0, 8).toUpperCase()}
                  </Text>
                  <Text className="text-lg" style={{ color: colors.textSecondary }}>
                    {safeFormatSnapshot(patrol?.start_time || patrol?.started_at)}
                  </Text>
                </View>
                <Badge
                  label={patrol?.status || 'UNKNOWN'}
                  variant={patrol?.status === 'COMPLETED' ? 'success' : 'primary'}
                />
              </View>

              {/* Battery & Status */}
              <View
                className="mb-6 flex-row items-center justify-between rounded-xl p-3"
                style={{ backgroundColor: isDark ? '#1A1A1A' : '#F3F4F6' }}>
                <View className="flex-1">
                  <Text
                    className="mb-1 text-sm font-semibold"
                    style={{ color: colors.textSecondary }}>
                    Battery Level
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons
                      name="battery-full-outline"
                      size={20}
                      color={getBatteryStatus((patrol as any)?.battery_level).color}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      className="text-lg font-bold"
                      style={{ color: getBatteryStatus((patrol as any)?.battery_level).color }}>
                      {(patrol as any)?.battery_level}%
                    </Text>
                    <Text className="ml-2 text-sm" style={{ color: colors.textSecondary }}>
                      ({getBatteryStatus((patrol as any)?.battery_level).label})
                    </Text>
                  </View>
                </View>
                {(patrol as any)?.status_display && (
                  <View className="items-end">
                    <Text
                      className="mb-1 text-sm font-semibold"
                      style={{ color: colors.textSecondary }}>
                      Status
                    </Text>
                    <Text
                      className="text-sm font-semibold capitalize"
                      style={{ color: colors.text }}>
                      {(patrol as any).status_display}
                    </Text>
                  </View>
                )}
              </View>

              {/* Key Metrics */}
              <View className="flex-row flex-wrap gap-3">
                <View
                  className="flex-1 rounded-lg p-3"
                  style={{ backgroundColor: isDark ? '#1A1A1A' : '#F3F4F6' }}>
                  <Text
                    className="mb-2 text-sm font-semibold"
                    style={{ color: colors.textSecondary }}>
                    Duration
                  </Text>
                  <Text className="text-lg font-bold" style={{ color: colors.text }}>
                    {formatDuration(
                      patrol?.flight_duration_seconds !== undefined
                        ? patrol?.flight_duration_seconds
                        : (patrol as any)?.duration
                    )}
                  </Text>
                </View>
                <View
                  className="flex-1 rounded-lg p-3"
                  style={{ backgroundColor: isDark ? '#1A1A1A' : '#F3F4F6' }}>
                  <Text
                    className="mb-2 text-sm font-semibold"
                    style={{ color: colors.textSecondary }}>
                    Detections
                  </Text>
                  <Text className="text-lg font-bold" style={{ color: colors.primary }}>
                    {patrol?.detection_count || 0}
                  </Text>
                </View>
                <View
                  className="flex-1 rounded-lg p-3"
                  style={{ backgroundColor: isDark ? '#1A1A1A' : '#F3F4F6' }}>
                  <Text
                    className="mb-2 text-sm font-semibold"
                    style={{ color: colors.textSecondary }}>
                    Violations
                  </Text>
                  <Text className="text-lg font-bold" style={{ color: '#EF4444' }}>
                    {patrol?.violation_count || 0}
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Patrol Details */}
          <Card variant="elevated" className="mb-6 p-5">
            <Text className="mb-4 text-2xl font-bold" style={{ color: colors.text }}>
              Patrol Information
            </Text>
            <View className="space-y-4">
              {/* Drone Information */}
              {((patrol as any)?.drone_id_str || patrol?.drone?.name) && (
                <View>
                  <Text
                    className="mb-2 text-sm font-semibold"
                    style={{ color: colors.textSecondary }}>
                    Drone Unit
                  </Text>
                  <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                    {(patrol as any)?.drone_id_str || patrol?.drone?.name || 'N/A'}
                  </Text>
                </View>
              )}

              {/* Time Information */}
              {(patrol?.start_time || patrol?.end_time) && (
                <View>
                  {patrol?.start_time && (
                    <View className="mb-3">
                      <Text
                        className="mb-1 text-sm font-semibold"
                        style={{ color: colors.textSecondary }}>
                        Start Time
                      </Text>
                      <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                        {safeFormatSnapshot(patrol.start_time)}
                      </Text>
                    </View>
                  )}
                  {patrol?.end_time && (
                    <View>
                      <Text
                        className="mb-1 text-sm font-semibold"
                        style={{ color: colors.textSecondary }}>
                        End Time
                      </Text>
                      <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                        {safeFormatSnapshot(patrol.end_time)}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Location Information */}
              {(patrol as any)?.latest_location &&
                ((patrol as any).latest_location.latitude ||
                  (patrol as any).latest_location.longitude) && (
                  <View className="mt-4">
                    <Text
                      className="mb-2 text-sm font-semibold"
                      style={{ color: colors.textSecondary }}>
                      Last Known Location
                    </Text>
                    <View
                      className="rounded-lg p-3"
                      style={{ backgroundColor: isDark ? '#1A1A1A' : '#F3F4F6' }}>
                      <Text className="text-sm" style={{ color: colors.text }}>
                        Lat: {(patrol as any).latest_location.latitude}
                      </Text>
                      <Text className="text-sm" style={{ color: colors.text }}>
                        Lon: {(patrol as any).latest_location.longitude}
                      </Text>
                      {(patrol as any).latest_location.altitude && (
                        <Text className="text-sm" style={{ color: colors.text }}>
                          Alt: {Math.round((patrol as any).latest_location.altitude)} m
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      className="mt-3 flex-row items-center justify-center gap-2 rounded-lg p-3"
                      style={{
                        backgroundColor: '#3B82F6',
                      }}
                      onPress={() => {
                        const lat = (patrol as any).latest_location.latitude;
                        const lon = (patrol as any).latest_location.longitude;
                        const url = `https://maps.google.com/?q=${lat},${lon}`;
                        Linking.openURL(url).catch(() => {
                          showToast('error', 'Maps Error', 'Could not open maps');
                        });
                      }}>
                      <Ionicons name="map" size={20} color="#FFFFFF" />
                      <Text className="font-semibold" style={{ color: '#FFFFFF' }}>
                        Open in Maps
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

              {/* Patrol Configuration */}
              {(patrol as any)?.patrol_config &&
                ((patrol as any).patrol_config.mode ||
                  (patrol as any).patrol_config.speed_limit) && (
                  <View>
                    <Text
                      className="mb-2 text-sm font-semibold"
                      style={{ color: colors.textSecondary }}>
                      Configuration
                    </Text>
                    <View className="flex-row gap-3">
                      {(patrol as any).patrol_config.mode && (
                        <View
                          className="flex-1 rounded-lg p-3"
                          style={{ backgroundColor: isDark ? '#1A1A1A' : '#F3F4F6' }}>
                          <Text
                            className="mb-1 text-sm font-semibold"
                            style={{ color: colors.textSecondary }}>
                            Mode
                          </Text>
                          <Text
                            className="text-sm font-semibold capitalize"
                            style={{ color: colors.text }}>
                            {(patrol as any).patrol_config.mode}
                          </Text>
                        </View>
                      )}
                      {(patrol as any).patrol_config.speed_limit && (
                        <View
                          className="flex-1 rounded-lg p-3"
                          style={{ backgroundColor: isDark ? '#1A1A1A' : '#F3F4F6' }}>
                          <Text
                            className="mb-1 text-sm font-semibold"
                            style={{ color: colors.textSecondary }}>
                            Speed Limit
                          </Text>
                          <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                            {(patrol as any).patrol_config.speed_limit} km/h
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
            </View>
          </Card>

          {/* Violations List */}
          <Text className="mb-4 text-2xl font-bold" style={{ color: colors.text }}>
            Violations ({violationsList?.length || 0})
          </Text>

          {violationsList?.length > 0 ? (
            violationsList.map((violation: any) => (
              <TouchableOpacity
                key={violation.id}
                onPress={() => {
                  if (violation.id) {
                    openViolationDetail(violation.id);
                  }
                }}>
                <Card
                  variant="outlined"
                  className="mb-3"
                  style={
                    isDark
                      ? { backgroundColor: '#0A0A0A', borderColor: '#1A1A1A', borderWidth: 1 }
                      : {}
                  }>
                  <View className="flex-row items-center">
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/10">
                      <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold" style={{ color: colors.text }}>
                        {(violation.detection as any)?.license_plate ||
                          (violation as any).license_plate ||
                          'SPEEDING'}{' '}
                        - {violation.violation_type}
                      </Text>
                      <Text style={{ color: colors.textSecondary }}>
                        {safeFormatSnapshot(
                          violation.timestamp || violation.created_at,
                          'HH:mm:ss'
                        )}
                        {(violation.recorded_speed ||
                          (violation as any).evidence_meta?.violation_speed) &&
                          ` • ${Math.round(violation.recorded_speed || (violation as any).evidence_meta?.violation_speed)} km/h`}
                      </Text>
                      {violation.violation_type && (
                        <Badge label={violation.violation_type} variant="error" />
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          ) : (
            <View className="items-center py-8">
              <Ionicons name="checkmark-circle" size={40} color="#10B981" />
              <Text className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
                No violations recorded
              </Text>
            </View>
          )}

          {/* Actions */}
          <View className="mt-6 flex-row gap-3 pb-5">
            <Button
              title="Export Report"
              variant="outline"
              icon={<Ionicons name="download-outline" size={18} color={colors.primary} />}
              className="flex-1"
              onPress={exportPatrolReport}
            />
            {patrol?.status === 'ACTIVE' && (
              <Button
                title="View Full Telemetry"
                variant="primary"
                onPress={() => {
                  if (patrol?.id) {
                    openTelemetry(patrol.id);
                  }
                }}
                className="flex-1"
              />
            )}
          </View>
        </ScrollView>
      )}
    </BaseModal>
  );
};
