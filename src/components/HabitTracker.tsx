import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  I18nManager,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../constants/theme';
import { useTranslation } from 'react-i18next';

type Props = {
  habits: string[];
  completedHabits: string[];
  onToggle: (habit: string) => void;
};

export const HabitTracker = ({ habits, completedHabits, onToggle }: Props) => {
  const { t } = useTranslation();
  const isRTL = I18nManager.isRTL;

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.header,
          { textAlign: isRTL ? 'right' : 'left' } // 🔁 Dynamic text alignment
        ]}
      >
        {t('your_habits')}
      </Text>

      {habits.map((habit) => {
        const isDone = completedHabits.includes(habit);

        return (
          <TouchableOpacity
            key={habit}
            style={[
              styles.habitRow,
              isDone && styles.habitRowCompleted,
              isRTL && styles.habitRowRTL,
            ]}
            onPress={() => onToggle(habit)}
            activeOpacity={0.8}
          >
            {/* Icon on the correct side */}
            {!isRTL && (
              <Icon
                name={isDone ? 'check-circle' : 'radio-button-unchecked'}
                size={24}
                color={isDone ? theme.colors.primary : '#ccc'}
              />
            )}

            <Text
              style={[
                styles.habitText,
                isDone && styles.habitTextCompleted,
                { textAlign: isRTL ? 'right' : 'left' }, // 🔁 Apply dynamically
              ]}
            >
              {habit}
            </Text>

            {isRTL && (
              <Icon
                name={isDone ? 'check-circle' : 'radio-button-unchecked'}
                size={24}
                color={isDone ? theme.colors.primary : '#ccc'}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 10,
    marginTop: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111',
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  habitRowRTL: {
    flexDirection: 'row-reverse',
  },
  habitRowCompleted: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  habitText: {
    fontSize: 16,
    color: '#333',
    flex: 1, // Optional: makes sure text fills row space
  },
  habitTextCompleted: {
    color: theme.colors.primary,
    textDecorationLine: 'line-through',
  },
});
