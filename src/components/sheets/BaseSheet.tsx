import React, { useCallback, useMemo, forwardRef } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, type BottomSheetProps } from '@gorhom/bottom-sheet';
import { useTheme } from '@/contexts/ThemeContext';

interface BaseSheetProps extends Partial<BottomSheetProps> {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  enablePanDownToClose?: boolean;
  footerComponent?: React.FC<any>;
}

export const BaseSheet = forwardRef<BottomSheetModal, BaseSheetProps>(
  (
    {
      title,
      subtitle,
      children,
      snapPoints: customSnapPoints,
      enablePanDownToClose = true,
      footerComponent,
      ...props
    },
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
          opacity={0.45}
        />
      ),
      []
    );

    const handleIndicatorStyle = useMemo(
      () => ({
        backgroundColor: isDark ? '#333333' : '#DDDDE0',
        width: 36,
        height: 4,
      }),
      [isDark]
    );

    const backgroundStyle = useMemo(
      () => ({
        backgroundColor: colors.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }),
      [colors.surface]
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose={enablePanDownToClose}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={handleIndicatorStyle}
        backgroundStyle={backgroundStyle}
        footerComponent={footerComponent}
        {...props}>
        <View style={styles.contentContainer}>
          {title && (
            <View style={styles.header}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 18,
                  fontWeight: '700',
                  letterSpacing: -0.3,
                  lineHeight: 24,
                }}>
                {title}
              </Text>
              {subtitle && (
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 13,
                    marginTop: 2,
                    lineHeight: 18,
                  }}>
                  {subtitle}
                </Text>
              )}
            </View>
          )}
          {children}
        </View>
      </BottomSheetModal>
    );
  }
);

BaseSheet.displayName = 'BaseSheet';

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  header: {
    paddingBottom: 3,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
});
