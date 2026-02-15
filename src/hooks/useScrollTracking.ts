import { useRef, useCallback } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useUIStore } from '@/stores/uiStore';

const SCROLL_THRESHOLD = 20;

export function useScrollTracking() {
  const { setTabBarVisible, isTabBarVisible } = useUIStore();
  const lastScrollY = useRef(0);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const currentOffset = contentOffset.y;
      const diff = currentOffset - lastScrollY.current;

      // Check if content is scrollable
      const isScrollable = contentSize.height > layoutMeasurement.height + 20; // 20px buffer

      // If not scrollable, ensure visible
      if (!isScrollable) {
        if (!isTabBarVisible) setTabBarVisible(true);
        return;
      }

      // Reset to visible at the top
      if (currentOffset <= 0) {
        if (!isTabBarVisible) setTabBarVisible(true);
      }
      // Hide on scroll down if threshold met
      else if (diff > SCROLL_THRESHOLD) {
        if (isTabBarVisible) setTabBarVisible(false);
      }
      // Show on scroll up if threshold met
      else if (diff < -SCROLL_THRESHOLD) {
        if (!isTabBarVisible) setTabBarVisible(true);
      }

      lastScrollY.current = currentOffset;
    },
    [isTabBarVisible, setTabBarVisible]
  );

  return { onScroll };
}
