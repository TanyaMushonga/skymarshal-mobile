import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share, Linking } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { safeFormatSnapshot } from '@/lib/dateUtils';

import { BaseModal } from '../ui/BaseModal';
import { Card, Badge, Button } from '@/components/ui';
import { violationsApi } from '@/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useUIStore } from '@/stores/uiStore';
import { useToast } from '@/hooks/useToast';

export const ViolationDetailModal: React.FC = () => {
  const { violationDetailId, closeDetail } = useUIStore();
  const { colors, isDark } = useTheme();
  const { showToast } = useToast();
  const [exporting, setExporting] = useState(false);

  const { data: violation, isLoading } = useQuery({
    queryKey: ['violation', violationDetailId],
    queryFn: () => violationsApi.get(violationDetailId!),
    enabled: !!violationDetailId,
  });

  const handleOpenMaps = () => {
    const lat = violation?.latitude || (violation as any)?.evidence_meta?.coordinates?.lat;
    const lon = violation?.longitude || (violation as any)?.evidence_meta?.coordinates?.lon;

    if (!lat || !lon) {
      showToast('warning', 'Location', 'GPS coordinates not available');
      return;
    }

    const mapsUrl = `https://maps.google.com/?q=${lat},${lon}`;
    Linking.openURL(mapsUrl).catch(() => {
      showToast('error', 'Error', 'Could not open maps application');
    });
  };

  const handleExportReport = async () => {
    if (!violation) return;

    setExporting(true);
    try {
      // Generate HTML for PDF
      const htmlContent = generateViolationReportHTML(violation);

      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      // Share the PDF
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Violation Report',
      });
    } catch (error) {
      showToast('error', 'Export', 'Failed to generate PDF report');
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const handleOpenVideo = async () => {
    if (!(violation as any)?.video_clip) {
      showToast('warning', 'Video', 'Video clip URL not available');
      return;
    }

    try {
      await Linking.openURL((violation as any).video_clip);
    } catch (error) {
      showToast('error', 'Error', 'Could not open video link');
      console.error(error);
    }
  };

  const handleShareReport = async () => {
    if (!violation) return;

    try {
      const lat = violation?.latitude || (violation as any)?.evidence_meta?.coordinates?.lat;
      const lon = violation?.longitude || (violation as any)?.evidence_meta?.coordinates?.lon;
      const licensePlate =
        (violation?.detection as any)?.license_plate ||
        (violation as any)?.license_plate ||
        'Unknown';
      const violationType = violation?.violation_type || 'SPEEDING';
      const speed = violation?.recorded_speed || (violation as any)?.evidence_meta?.violation_speed;

      const shareText = `Traffic Violation Report\n\nVehicle: ${licensePlate}\nViolation: ${violationType}\nSpeed: ${Math.round(speed)} km/h\nLocation: ${lat}, ${lon}\n\nMore details in the app.`;

      await Share.share({
        message: shareText,
        title: 'Violation Report',
      });
    } catch {
      showToast('error', 'Share', 'Failed to share report');
    }
  };

  return (
    <BaseModal visible={!!violationDetailId} onClose={closeDetail} title="Violation Report">
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text style={{ color: colors.textSecondary }}>Loading...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Evidence Image */}
          {violation?.detection?.image_url && (
            <View className="mb-6 overflow-hidden rounded-2xl">
              <Image
                source={{ uri: violation.detection.image_url }}
                style={{ width: '100%', aspectRatio: 16 / 9 }}
                contentFit="cover"
              />
            </View>
          )}

          {/* Violation Header Card - Status Bar Style */}
          <Card
            variant="elevated"
            className="mb-6"
            style={{
              padding: 0,
              overflow: 'hidden',
            }}>
            {/* Status Bar Background */}
            <View
              style={{
                backgroundColor: colors.error || '#EF4444',
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}>
              <Text
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: '#FFFFFF' }}>
                Violation Alert
              </Text>
            </View>

            {/* Content */}
            <View style={{ padding: 20 }}>
              <View className="mb-5 flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="mb-2 text-3xl font-bold" style={{ color: colors.text }}>
                    {(violation?.detection as any)?.license_plate ||
                      (violation as any)?.license_plate ||
                      'N/A'}
                  </Text>
                  {violation?.timestamp || (violation as any)?.created_at ? (
                    <Text className="text-lg font-medium" style={{ color: colors.textSecondary }}>
                      {safeFormatSnapshot(violation?.timestamp || (violation as any)?.created_at)}
                    </Text>
                  ) : null}
                </View>
                <Badge label={violation?.violation_type || 'SPEEDING'} variant="error" />
              </View>

              {/* Speed Violation Highlight */}
              {(violation?.recorded_speed ||
                (violation as any)?.evidence_meta?.violation_speed) && (
                <View
                  className="items-center rounded-xl p-5"
                  style={{ backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2' }}>
                  <Text className="text-base font-medium" style={{ color: colors.textSecondary }}>
                    Recorded Speed
                  </Text>
                  <Text className="mt-2 text-4xl font-bold text-red-600">
                    {Math.round(
                      violation?.recorded_speed ||
                        (violation as any)?.evidence_meta?.violation_speed
                    )}
                  </Text>
                  <Text className="text-base" style={{ color: colors.textSecondary }}>
                    km/h
                  </Text>
                  {(violation?.speed_limit || (violation as any)?.evidence_meta?.zone_limit) && (
                    <Text className="mt-3 text-sm" style={{ color: colors.textSecondary }}>
                      Speed Limit:{' '}
                      {violation?.speed_limit || (violation as any)?.evidence_meta?.zone_limit} km/h
                    </Text>
                  )}
                </View>
              )}
            </View>
          </Card>

          {/* Vehicle Information Card */}
          <Card variant="elevated" className="mb-6 p-5">
            <Text className="mb-5 text-2xl font-bold" style={{ color: colors.text }}>
              Vehicle Information
            </Text>
            <View className="space-y-4">
              <View className="flex-row justify-between">
                <View className="flex-1">
                  <Text
                    className="mb-2 text-sm font-medium"
                    style={{ color: colors.textSecondary }}>
                    License Plate
                  </Text>
                  <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                    {(violation?.detection as any)?.license_plate ||
                      (violation as any)?.license_plate ||
                      'N/A'}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text
                    className="mb-2 text-sm font-medium"
                    style={{ color: colors.textSecondary }}>
                    Vehicle Type
                  </Text>
                  <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                    {(violation?.detection as any)?.vehicle_type || 'Car'}
                  </Text>
                </View>
              </View>

              {((violation as any)?.vehicle_details?.make ||
                (violation as any)?.vehicle_details?.model) && (
                <View className="flex-row justify-between">
                  <View className="flex-1">
                    <Text
                      className="mb-2 text-sm font-medium"
                      style={{ color: colors.textSecondary }}>
                      Make & Model
                    </Text>
                    <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                      {(violation as any)?.vehicle_details?.make &&
                      (violation as any)?.vehicle_details?.model
                        ? `${(violation as any).vehicle_details.make} ${(violation as any).vehicle_details.model}`
                        : (violation as any)?.vehicle_details?.make ||
                          (violation as any)?.vehicle_details?.model}
                    </Text>
                  </View>
                  {(violation as any)?.vehicle_details?.color && (
                    <View className="flex-1">
                      <Text
                        className="mb-2 text-sm font-medium"
                        style={{ color: colors.textSecondary }}>
                        Color
                      </Text>
                      <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                        {(violation as any)?.vehicle_details?.color}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {((violation as any)?.vehicle_details?.owner_name ||
                (violation?.detection as any)?.confidence) && (
                <View className="flex-row justify-between">
                  {(violation as any)?.vehicle_details?.owner_name && (
                    <View className="flex-1">
                      <Text
                        className="mb-2 text-sm font-medium"
                        style={{ color: colors.textSecondary }}>
                        Owner
                      </Text>
                      <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                        {(violation as any)?.vehicle_details?.owner_name}
                      </Text>
                    </View>
                  )}
                  {(violation?.detection as any)?.confidence && (
                    <View className="flex-1">
                      <Text
                        className="mb-2 text-sm font-medium"
                        style={{ color: colors.textSecondary }}>
                        Detection Confidence
                      </Text>
                      <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                        {`${((violation?.detection as any).confidence * 100).toFixed(1)}%`}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </Card>

          {/* Location Information Card */}
          <Card variant="elevated" className="mb-6 p-5">
            <Text className="mb-5 text-2xl font-bold" style={{ color: colors.text }}>
              Location Information
            </Text>
            {(violation?.latitude || (violation as any)?.evidence_meta?.coordinates?.lat) &&
              (violation?.longitude || (violation as any)?.evidence_meta?.coordinates?.lon) && (
                <TouchableOpacity
                  className="mb-4 rounded-xl p-4"
                  style={{ backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }}
                  onPress={handleOpenMaps}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text
                        className="mb-3 text-sm font-medium"
                        style={{ color: colors.textSecondary }}>
                        GPS Coordinates
                      </Text>
                      <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                        {violation?.latitude || (violation as any)?.evidence_meta?.coordinates?.lat}
                      </Text>
                      <Text className="mt-1 text-lg font-semibold" style={{ color: colors.text }}>
                        {violation?.longitude ||
                          (violation as any)?.evidence_meta?.coordinates?.lon}
                      </Text>
                    </View>
                    <Ionicons
                      name="open-outline"
                      size={24}
                      color={colors.primary || '#F59E0B'}
                      style={{ marginLeft: 12 }}
                    />
                  </View>
                  <Text className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
                    Tap to open in Maps
                  </Text>
                </TouchableOpacity>
              )}

            {((violation as any)?.evidence_meta?.altitude ||
              (violation as any)?.evidence_meta?.zone_limit) && (
              <View className="flex-row justify-between">
                {(violation as any)?.evidence_meta?.altitude && (
                  <View className="flex-1">
                    <Text
                      className="mb-2 text-sm font-medium"
                      style={{ color: colors.textSecondary }}>
                      Altitude
                    </Text>
                    <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                      {`${Math.round((violation as any).evidence_meta.altitude)} m`}
                    </Text>
                  </View>
                )}
                {(violation as any)?.evidence_meta?.zone_limit && (
                  <View className="flex-1">
                    <Text
                      className="mb-2 text-sm font-medium"
                      style={{ color: colors.textSecondary }}>
                      Speed Limit
                    </Text>
                    <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                      {`${(violation as any).evidence_meta.zone_limit} km/h`}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Card>

          {/* Evidence & Detection Card */}
          <Card variant="elevated" className="mb-6 p-5">
            <Text className="mb-5 text-2xl font-bold" style={{ color: colors.text }}>
              Detection Details
            </Text>
            <View className="space-y-4">
              {((violation as any)?.evidence_meta?.drone_id || violation?.patrol) && (
                <View className="flex-row justify-between">
                  {(violation as any)?.evidence_meta?.drone_id && (
                    <View className="flex-1">
                      <Text
                        className="mb-2 text-sm font-medium"
                        style={{ color: colors.textSecondary }}>
                        Drone Unit
                      </Text>
                      <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                        {(violation as any).evidence_meta.drone_id}
                      </Text>
                    </View>
                  )}
                  {violation?.patrol && (
                    <View className="flex-1">
                      <Text
                        className="mb-2 text-sm font-medium"
                        style={{ color: colors.textSecondary }}>
                        Patrol ID
                      </Text>
                      <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                        {violation.patrol.slice(0, 8).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {!!(
                (violation?.detection as any)?.frame_number ||
                (violation as any)?.evidence_meta?.timestamp
              ) && (
                <View className="flex-row justify-between">
                  {!!(violation?.detection as any)?.frame_number && (
                    <View className="flex-1">
                      <Text
                        className="mb-2 text-sm font-medium"
                        style={{ color: colors.textSecondary }}>
                        Frame Number
                      </Text>
                      <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                        {(violation?.detection as any).frame_number}
                      </Text>
                    </View>
                  )}
                  {!!(violation as any)?.evidence_meta?.timestamp && (
                    <View className="flex-1">
                      <Text
                        className="mb-2 text-sm font-medium"
                        style={{ color: colors.textSecondary }}>
                        Timestamp
                      </Text>
                      <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                        {safeFormatSnapshot((violation as any).evidence_meta.timestamp)}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </Card>

          {/* Violation Details Card */}
          <Card variant="elevated" className="mb-6 p-5">
            <Text className="mb-5 text-2xl font-bold" style={{ color: colors.text }}>
              Violation Details
            </Text>
            <View className="space-y-4">
              <View>
                <Text className="mb-2 text-sm font-medium" style={{ color: colors.textSecondary }}>
                  Status
                </Text>
                <View className="flex-row items-center">
                  <Badge label={violation?.status || 'NEW'} variant="default" />
                </View>
              </View>

              {(violation as any)?.fine_amount && (
                <View className="flex-row justify-between">
                  <View className="flex-1">
                    <Text
                      className="mb-2 text-sm font-medium"
                      style={{ color: colors.textSecondary }}>
                      Fine Amount
                    </Text>
                    <Text className="text-2xl font-bold" style={{ color: colors.text }}>
                      ${(violation as any)?.fine_amount || '0.00'}
                    </Text>
                  </View>
                </View>
              )}

              {(violation as any)?.description && (
                <View>
                  <Text
                    className="mb-2 text-sm font-medium"
                    style={{ color: colors.textSecondary }}>
                    Description
                  </Text>
                  <Text className="text-lg" style={{ color: colors.text, lineHeight: 24 }}>
                    {(violation as any).description}
                  </Text>
                </View>
              )}

              {(violation as any)?.video_clip && (
                <View>
                  <Text
                    className="mb-2 text-sm font-medium"
                    style={{ color: colors.textSecondary }}>
                    Video Clip
                  </Text>
                  <TouchableOpacity
                    className="flex-row items-center rounded-lg p-3"
                    style={{ backgroundColor: isDark ? '#1A1A1A' : '#F3F4F6' }}
                    onPress={handleOpenVideo}>
                    <Ionicons
                      name="play-circle-outline"
                      size={20}
                      color={colors.primary}
                      style={{ marginRight: 8 }}
                    />
                    <Text className="text-base font-semibold" style={{ color: colors.primary }}>
                      View Video
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {(violation as any)?.vehicle_details?.owner_phone_number && (
                <View>
                  <Text
                    className="mb-2 text-sm font-medium"
                    style={{ color: colors.textSecondary }}>
                    Owner Contact
                  </Text>
                  <TouchableOpacity
                    className="flex-row items-center rounded-lg p-3"
                    style={{ backgroundColor: isDark ? '#1A1A1A' : '#F3F4F6' }}>
                    <Ionicons
                      name="call-outline"
                      size={20}
                      color={colors.primary}
                      style={{ marginRight: 8 }}
                    />
                    <Text className="text-base font-semibold" style={{ color: colors.primary }}>
                      {(violation as any).vehicle_details.owner_phone_number}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Card>

          {/* Action Buttons */}
          <View className="mb-6 flex-row gap-3">
            <Button
              title="Export Report"
              variant="outline"
              icon={<Ionicons name="download-outline" size={20} color="#F59E0B" />}
              className="flex-1"
              onPress={handleExportReport}
              loading={exporting}
            />
            <Button
              title="Share Report"
              variant="secondary"
              icon={<Ionicons name="share-social-outline" size={20} color="#FFFFFF" />}
              className="flex-1"
              onPress={handleShareReport}
            />
          </View>
        </ScrollView>
      )}
    </BaseModal>
  );
};

// Helper function to generate HTML for PDF report
function generateViolationReportHTML(violation: any): string {
  const licensePlate = violation?.detection?.license_plate || violation?.license_plate || 'Unknown';
  const owner = violation?.vehicle_details?.owner_name || 'Unknown';
  const make = violation?.vehicle_details?.make || 'N/A';
  const model = violation?.vehicle_details?.model || 'N/A';
  const color = violation?.vehicle_details?.color || 'N/A';
  const violationType = violation?.violation_type || 'SPEEDING';
  const status = violation?.status || 'NEW';
  const speed = violation?.recorded_speed || violation?.evidence_meta?.violation_speed || 0;
  const limit = violation?.evidence_meta?.zone_limit || 0;
  const fineAmount = violation?.fine_amount || '0.00';
  const lat = violation?.latitude || violation?.evidence_meta?.coordinates?.lat || 'N/A';
  const lon = violation?.longitude || violation?.evidence_meta?.coordinates?.lon || 'N/A';
  const altitude = violation?.evidence_meta?.altitude || 0;
  const droneId = violation?.evidence_meta?.drone_id || 'N/A';
  const timestamp = violation?.timestamp || violation?.created_at || 'N/A';
  const description = violation?.description || '';
  const patrolId = violation?.patrol ? violation.patrol.slice(0, 8).toUpperCase() : 'N/A';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background-color: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #EF4444;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          margin: 0;
          color: #EF4444;
          font-size: 28px;
        }
        .header p {
          margin: 5px 0;
          color: #666;
          font-size: 12px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section h2 {
          color: #333;
          font-size: 16px;
          border-bottom: 2px solid #e0e0e0;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        .row {
          display: flex;
          margin-bottom: 12px;
        }
        .col {
          flex: 1;
        }
        .label {
          font-weight: bold;
          color: #666;
          font-size: 11px;
          text-transform: uppercase;
          margin-bottom: 5px;
        }
        .value {
          color: #333;
          font-size: 13px;
        }
        .speed-box {
          background-color: #FEF2F2;
          border: 2px solid #EF4444;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
        }
        .speed-box .label {
          font-size: 12px;
          margin-bottom: 10px;
        }
        .speed-value {
          font-size: 36px;
          font-weight: bold;
          color: #EF4444;
          margin: 10px 0;
        }
        .speed-limit {
          font-size: 12px;
          color: #666;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          text-align: center;
          font-size: 10px;
          color: #999;
        }
        .badge {
          display: inline-block;
          background-color: #EF4444;
          color: white;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: bold;
          margin-right: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>TRAFFIC VIOLATION REPORT</h1>
          <p>License Plate: <strong>${licensePlate}</strong></p>
          <p>${new Date().toLocaleDateString()}</p>
        </div>

        <div class="section">
          <h2>Violation Details</h2>
          <div class="row">
            <div class="col">
              <div class="label">Violation Type</div>
              <div class="value"><span class="badge">${violationType}</span></div>
            </div>
            <div class="col">
              <div class="label">Status</div>
              <div class="value">${status}</div>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <div class="label">Fine Amount</div>
              <div class="value" style="color: #EF4444; font-weight: bold;">$${fineAmount}</div>
            </div>
            <div class="col">
              <div class="label">Date & Time</div>
              <div class="value">${typeof timestamp === 'string' ? timestamp.substring(0, 19).replace('T', ' ') : timestamp}</div>
            </div>
          </div>
          ${
            description
              ? `
          <div class="row">
            <div class="col">
              <div class="label">Description</div>
              <div class="value">${description}</div>
            </div>
          </div>
          `
              : ''
          }
        </div>

        <div class="section">
          <h2>Vehicle Information</h2>
          <div class="row">
            <div class="col">
              <div class="label">License Plate</div>
              <div class="value">${licensePlate}</div>
            </div>
            <div class="col">
              <div class="label">Owner</div>
              <div class="value">${owner}</div>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <div class="label">Make & Model</div>
              <div class="value">${make} ${model}</div>
            </div>
            <div class="col">
              <div class="label">Color</div>
              <div class="value">${color}</div>
            </div>
          </div>
        </div>

        ${
          speed
            ? `
        <div class="speed-box">
          <div class="label">Speed Violation</div>
          <div class="speed-value">${Math.round(speed)}</div>
          <div class="speed-limit">km/h recorded (Limit: ${limit} km/h)</div>
          <div class="speed-limit" style="margin-top: 10px; color: #EF4444; font-weight: bold;">Exceeding by ${Math.round(speed - limit)} km/h</div>
        </div>
        `
            : ''
        }

        <div class="section">
          <h2>Location & Detection</h2>
          <div class="row">
            <div class="col">
              <div class="label">Latitude</div>
              <div class="value">${lat}</div>
            </div>
            <div class="col">
              <div class="label">Longitude</div>
              <div class="value">${lon}</div>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <div class="label">Altitude</div>
              <div class="value">${Math.round(altitude)} m</div>
            </div>
            <div class="col">
              <div class="label">Drone Unit</div>
              <div class="value">${droneId}</div>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <div class="label">Patrol ID</div>
              <div class="value">${patrolId}</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>This report was automatically generated by the SkyMarshal Mobile Application</p>
          <p>Generated: ${new Date().toISOString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
