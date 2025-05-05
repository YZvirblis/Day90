// src/components/ScreenContainer.tsx
import { ReactNode } from 'react';
import { I18nManager, StyleSheet, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';

export const ScreenContainer = ({ children }: { children: ReactNode }) => {
  const insets = useSafeAreaInsets();
  const isRTL = I18nManager.isRTL;

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          direction: isRTL ? 'rtl' : 'ltr',
        },
      ]}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
  },
});
