import { useEffect, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  Alert,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, setDoc, getDoc } from 'firebase/firestore';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ThemedText } from '../components/themed/ThemedText';
import { ThemedInput } from '../components/themed/ThemedInput';
import { ThemedButton } from '../components/themed/ThemedButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { theme } from '../constants/theme';

const MAX_HABITS = 15;

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Onboarding'>>();
  const { user, logout } = useAuth();

  const [habits, setHabits] = useState<string[]>(['']);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!user) return;
    const checkOnboardingStatus = async () => {
      const ref = doc(db, 'users', user.uid);
      const docSnap = await getDoc(ref);
      if (docSnap.exists() && docSnap.data().challenge) {
        navigation.replace('Challenge', {});
      } else {
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    };
    checkOnboardingStatus();
  }, [user]);

  const handleHabitChange = (index: number, text: string) => {
    const updated = [...habits];
    updated[index] = text;
    setHabits(updated);
  };

  const addHabit = () => {
    if (habits.length >= MAX_HABITS)
      return Alert.alert(t('max_habits') || 'Maximum 15 habits');
    setHabits([...habits, '']);
  };

  const removeHabit = (index: number) => {
    if (habits.length <= 1) return;
    const updated = [...habits];
    updated.splice(index, 1);
    setHabits(updated);
  };

  const handleStartChallenge = async () => {
    const filtered = habits.filter((h) => h.trim() !== '');
    if (filtered.length === 0) {
      Alert.alert(t('enter_at_least_one_habit') || 'Please enter at least one habit');
      return;
    }
    if (!startDate) {
      Alert.alert(t('error'), t('please_choose_start_date'));
      return;
    }

    Alert.alert(
      t('confirm_challenge_title') || 'Confirm Challenge',
      t('confirm_challenge_message') || 'Make sure your habits and start date are correct before starting.',
      [
        { text: t('edit') || 'Edit', style: 'cancel' },
        {
          text: t('start') || 'Start',
          onPress: async () => {
            try {
              if (!user) throw new Error('User not found');
              await setDoc(doc(db, 'users', user.uid), {
                challenge: {
                  startDate: startDate.toISOString(),
                  habits: filtered,
                  progress: {},
                  points: 0,
                  tokenCount: 0,
                  streakCount: 0,
                  achievements: [],
                },
              }, { merge: true });
              navigation.replace('Challenge', {});
            } catch (err) {
              console.error(err);
              Alert.alert(t('error'), t('failed_to_save_challenge'));
            }
          },
        },
      ]
    );
  };

  if (loading) return null;

  return (
    <LinearGradient
      colors={['#d3bfff', '#f3f4f6']}
      style={styles.background}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
    >
      <ScreenContainer>
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <ThemedText style={styles.title}>{t('start_challenge')}</ThemedText>

              {showTooltip && (
                <ThemedText style={{ fontSize: 14, color: '#555', marginBottom: 10 }}>
                  {t('tooltip_add_habits') || 'Add short, daily actions that contribute to your goal. Tap the plus icon to add more.'}
                </ThemedText>
              )}

              {habits.map((habit, index) => (
                <View key={index} style={styles.habitRow}>
                  <ThemedInput
                    placeholder={`${t('habit_label')} ${index + 1}`}
                    value={habit}
                    onChangeText={(text) => handleHabitChange(index, text)}
                    style={styles.habitInput}
                  />
                  <Icon
                    name="delete"
                    size={24}
                    color="#EF4444"
                    onPress={() => removeHabit(index)}
                  />
                </View>
              ))}

              {habits.length < MAX_HABITS && (
                <ThemedButton
                  title={t('add_habit') || 'Add Habit'}
                  onPress={addHabit}
                  variant="secondary"
                />
              )}

              <View style={{ marginTop: 24 }}>
                <ThemedText style={styles.subtitle}>
                  {t('start_date')}: {startDate ? startDate.toLocaleDateString() : t('no_date_selected')}
                </ThemedText>

                <ThemedButton
                  title={t('choose_date') || 'Choose Date'}
                  onPress={() => setShowDatePicker(true)}
                  variant="secondary"
                />

                {showDatePicker && (
                  <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(e, date) => {
                      setShowDatePicker(false);
                      if (date) setStartDate(date);
                    }}
                  />
                )}
              </View>
            </ScrollView>

            <View style={styles.fixedButtons}>
              <ThemedButton
                title={t('start_challenge')}
                onPress={handleStartChallenge}
                variant="primary"
              />
              <ThemedButton
                title={t('logout')}
                onPress={logout}
                variant="danger"
              />
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </ScreenContainer>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  card: {
    flex: 1,
    paddingHorizontal: 30,
    backgroundColor: '#ffffffee',
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 13 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    gap: 16,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    paddingBottom: 20,
  },
  fixedButtons: {
    padding: 20,
    backgroundColor: '#ffffffee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    width: '100%',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 10,
    gap: 16,
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  habitInput: {
    flex: 1,
  },
});
