// src/components/themed/ThemedInput.tsx
import { I18nManager, StyleSheet, TextInput, TextInputProps } from 'react-native';

export const ThemedInput = (props: TextInputProps) => {
  return (
    <TextInput
      {...props}
      placeholderTextColor="#999"
      style={[styles.input, props.style]}
      textAlign={I18nManager.isRTL ? 'right' : 'left'}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    fontSize: 16,
  },
});
