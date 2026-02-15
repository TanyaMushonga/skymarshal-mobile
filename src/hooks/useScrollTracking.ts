import { useRef, useCallback } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useUIStore } from '@/stores/uiStore';

const SCROLL_THRESHOLD = 20;

export function useScrollTracking() {
  const { setTabBarVisible, isTabBarVisible } = useUIStore();
  const lastScrollY = useRef(0);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentOffset = event.nativeEvent.contentOffset.y;
      const diff = currentOffset - lastScrollY.current;

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
