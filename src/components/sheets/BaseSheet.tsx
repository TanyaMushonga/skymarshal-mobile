import React, { useCallback, useMemo, forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetProps,
} from '@gorhom/bottom-sheet';
import { useTheme } from '@/contexts/ThemeContext';

interface BaseSheetProps extends Partial<BottomSheetProps> {
  title?: string;
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  enablePanDownToClose?: boolean;
}

export const BaseSheet = forwardRef<BottomSheet, BaseSheetProps>(
  (
    { title, children, snapPoints: customSnapPoints, enablePanDownToClose = true, ...props },
    ref
  ) => {
    const { colors, isDark } = useTheme();

    const snapPoints = useMemo(() => customSnapPoints || ['50%', '90%'], [customSnapPoints]);

    const renderBackdrop = useCallback(
      (backdropProps: any) => (
        <BottomSheetBackdrop
          {...backdropProps}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

    const handleIndicatorStyle = useMemo(
      () => ({
        backgroundColor: isDark ? '#4B5563' : '#D1D5DB',
        width: 40,
      }),
      [isDark]
    );

    const backgroundStyle = useMemo(
      () => ({
        backgroundColor: colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }),
      [colors.surface]
    );

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={enablePanDownToClose}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={handleIndicatorStyle}
        backgroundStyle={backgroundStyle}
        {...props}>
        <BottomSheetView style={styles.contentContainer}>
          {title && (
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]} className="text-xl font-bold">
                {title}
              </Text>
            </View>
          )}
          {children}
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

BaseSheet.displayName = 'BaseSheet';

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
});
