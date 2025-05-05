// src/components/themed/ThemedButton.tsx
import { Pressable, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
};

export const ThemedButton = ({
  title,
  onPress,
  variant = 'primary',
  disabled,
}: Props) => {
  const background =
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'danger'
      ? '#EF4444'
      : '#E5E7EB';

  const textColor = variant === 'secondary' ? '#111' : '#fff';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: background },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
