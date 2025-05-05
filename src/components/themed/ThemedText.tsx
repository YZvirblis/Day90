// src/components/themed/ThemedText.tsx
import { I18nManager, StyleSheet, Text, TextProps } from 'react-native';

export const ThemedText = (props: TextProps) => {
  return (
    <Text
      {...props}
      style={[
        styles.text,
        { textAlign: I18nManager.isRTL ? 'right' : 'left' },
        props.style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    color: '#111',
  },
});
