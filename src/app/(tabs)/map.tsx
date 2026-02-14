import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/ui';
import { dronesApi, violationsApi, detectionsApi } from '@/api';
import { useTheme } from '@/contexts/ThemeContext';

type MarkerType = 'drones' | 'violations' | 'detections';

export default function MapScreen() {
  const { colors, isDark } = useTheme();
  const mapRef = useRef<MapView>(null);
  const [activeFilters, setActiveFilters] = useState<Set<MarkerType>>(
    new Set(['drones', 'violations'])
  );
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const { data: drones } = useQuery({
    queryKey: ['drones'],
    queryFn: () => dronesApi.list(),
    refetchInterval: 5000,
  });

  const { data: violations } = useQuery({
    queryKey: ['violations', 'today'],
    queryFn: () => violationsApi.list({ today: true, limit: 50 }),
  });

  const { data: detections } = useQuery({
    queryKey: ['detections', 'recent'],
    queryFn: () => detectionsApi.list({ limit: 50 }),
  });

  const toggleFilter = (filter: MarkerType) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(filter)) {
        next.delete(filter);
      } else {
        next.add(filter);
      }
      return next;
    });
  };

  const filters = [
    {
      key: 'drones' as MarkerType,
      label: 'Drones',
      color: colors.primary,
      icon: 'airplane-outline',
    },
    {
      key: 'violations' as MarkerType,
      label: 'Violations',
      color: '#EF4444',
      icon: 'alert-circle-outline',
    },
    {
      key: 'detections' as MarkerType,
      label: 'Detections',
      color: colors.primary,
      icon: 'layers-outline',
    },
  ];

  const darkMapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#000000' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#000000' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1A1A1A' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#050505' }] },
  ];

  return (
    <SafeAreaView edges={['top']} className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="absolute left-0 right-0 top-12 z-10 px-4">
        <View
          className="flex-row rounded-xl p-2"
          style={{
            backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)',
          }}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              className={`mr-2 flex-row items-center rounded-lg px-3 py-2 ${
                activeFilters.has(f.key) ? '' : 'opacity-50'
              }`}
              style={{
                backgroundColor: activeFilters.has(f.key) ? f.color + '20' : 'transparent',
              }}
              onPress={() => toggleFilter(f.key)}>
              <Ionicons
                name={f.icon as any}
                size={16}
                color={activeFilters.has(f.key) ? f.color : colors.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={{
                  color: activeFilters.has(f.key) ? f.color : colors.textSecondary,
                  fontWeight: '700',
                }}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: -17.8252,
          longitude: 31.0335,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        customMapStyle={isDark ? darkMapStyle : []}
        showsUserLocation
        showsMyLocationButton={false}>
        {/* Drone Markers */}
        {activeFilters.has('drones') &&
          drones?.results?.map((drone) => (
            <Marker
              key={drone.id}
              coordinate={{
                latitude: drone.gps?.latitude || -17.8252,
                longitude: drone.gps?.longitude || 31.0335,
              }}
              onPress={() => setSelectedItem({ type: 'drone', data: drone })}>
              <View className="items-center">
                <View className="rounded-full p-2" style={{ backgroundColor: colors.primary }}>
                  <Ionicons name="airplane-outline" size={20} color="#000000" />
                </View>
                <Text style={{ color: colors.primary }} className="mt-1 text-xs font-black">
                  {drone.name}
                </Text>
              </View>
            </Marker>
          ))}

        {/* Violation Markers */}
        {activeFilters.has('violations') &&
          violations?.results?.map((violation) => (
            <Marker
              key={violation.id}
              coordinate={{
                latitude: violation.detection?.gps?.latitude || -17.8252,
                longitude: violation.detection?.gps?.longitude || 31.0335,
              }}
              onPress={() => setSelectedItem({ type: 'violation', data: violation })}>
              <View className="items-center">
                <View className="rounded-full bg-red-500 p-2">
                  <Ionicons name="alert-circle-outline" size={16} color="#FFFFFF" />
                </View>
              </View>
            </Marker>
          ))}

        {/* Detection Markers */}
        {activeFilters.has('detections') &&
          detections?.results?.map((detection) => (
            <Marker
              key={detection.id}
              coordinate={{
                latitude: detection.gps?.latitude || -17.8252,
                longitude: detection.gps?.longitude || 31.0335,
              }}
              onPress={() => setSelectedItem({ type: 'detection', data: detection })}>
              <View
                className="h-3 w-3 rounded-full border-2 border-white"
                style={{ backgroundColor: colors.primary }}
              />
            </Marker>
          ))}
      </MapView>

      {/* Quick Actions */}
      <View className="absolute bottom-28 right-4">
        <TouchableOpacity
          className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg dark:bg-gray-800"
          onPress={() =>
            mapRef.current?.animateToRegion({
              latitude: -17.8252,
              longitude: 31.0335,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            })
          }>
          <Ionicons name="locate" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          className="h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg dark:bg-gray-800"
          onPress={() =>
            mapRef.current?.fitToElements({
              edgePadding: { top: 100, right: 50, bottom: 50, left: 50 },
              animated: true,
            })
          }>
          <Ionicons name="expand" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Selected Item Card */}
      {selectedItem && (
        <View className="absolute bottom-28 left-4 right-20">
          <Card variant="elevated">
            <TouchableOpacity
              className="absolute right-2 top-2 p-2"
              onPress={() => setSelectedItem(null)}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            {selectedItem.type === 'drone' && (
              <View className="flex-row items-center">
                <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                  <Ionicons name="airplane" size={24} color="#F59E0B" />
                </View>
                <View>
                  <Text className="text-lg font-bold" style={{ color: colors.text }}>
                    {selectedItem.data.name}
                  </Text>
                  <Text style={{ color: colors.textSecondary }}>
                    Battery: {selectedItem.data.status?.battery_level || '--'}%
                  </Text>
                </View>
              </View>
            )}
            {selectedItem.type === 'violation' && (
              <View className="flex-row items-center">
                <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <Ionicons name="warning" size={24} color="#EF4444" />
                </View>
                <View>
                  <Text className="text-lg font-bold" style={{ color: colors.text }}>
                    {selectedItem.data.detection?.license_plate}
                  </Text>
                  <Text style={{ color: colors.textSecondary }}>
                    {selectedItem.data.violation_type} • {selectedItem.data.recorded_speed} km/h
                  </Text>
                </View>
              </View>
            )}
          </Card>
        </View>
      )}
    </SafeAreaView>
  );
}
