import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { HabitTracker } from '../components/HabitTracker';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChallengeMeta } from '../data/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Challenge'>;

export default function DayScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const route = useRoute<RouteProp<RootStackParamList, 'Day'>>();
  const { dayNumber, status } = route.params;
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [habits, setHabits] = useState<string[]>([]);
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);
  const [journal, setJournal] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [meta, setMeta] = useState<ChallengeMeta | null>(null);

  const isLocked = status === 'complete' || status === 'partial';
  const isFuture = status === 'future';
  const isEditable = !isFuture;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const ref = doc(db, 'users', user.uid);
      const docSnap = await getDoc(ref);
      if (!docSnap.exists()) return;

      const data = docSnap.data();
      const day = data.challenge?.progress?.[dayNumber];

      setHabits(data.challenge?.habits || []);
      if (day) {
        setCompletedHabits(day.completedHabits || []);
        setJournal(day.journal || '');
        setImageUri(day.imageUri);
      }

      if (data.challenge) {
        setMeta({
          tokenCount: data.challenge.tokenCount || 0,
          points: data.challenge.points || 0,
          streakCount: data.challenge.streakCount || 0,
          totalDays: 90,
          startDate: new Date(data.challenge.startDate),
        });
      }
    };

    fetchData();
  }, [dayNumber, user]);

  const toggleHabit = (habit: string) => {
    if (isLocked || isFuture) return;
    setCompletedHabits((prev) =>
      prev.includes(habit) ? prev.filter((h) => h !== habit) : [...prev, habit]
    );
  };

  const handlePickImage = async () => {
    if (!isEditable) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCompleteDay = async () => {
    if (!user) return;
    setLoading(true);
  
    try {
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      const data = snap.data();
  
      const currentProgress = data?.challenge?.progress || {};
      const totalHabits = data?.challenge?.habits?.length || 0;
      const dayKey = `${dayNumber}`;
  
      // Create the day's progress object
      const progressEntry: any = {
        completedHabits,
        journal,
        isManuallyCompleted: true,
      };
      if (imageUri) {
        progressEntry.imageUri = imageUri;
      }
  
      const updatedProgress = {
        ...currentProgress,
        [dayKey]: progressEntry,
      };
  
      // Calculate current streak based on green days
      let streak = 0;
      for (let i = dayNumber; i > 0; i--) {
        const day = updatedProgress[i];
        if (
          day?.isManuallyCompleted &&
          day?.completedHabits?.length === totalHabits
        ) {
          streak++;
        } else {
          break;
        }
      }
  
      let newPoints = data?.challenge.points || 0;
      let newTokens = data?.challenge.tokenCount || 0;
      newPoints += 10;
  
      // Give token for streak of exactly 5 days, then reset streak
      if (streak === 5) {
        newTokens += 1;
        streak = 0;
      }
  
      await updateDoc(ref, {
        'challenge.progress': updatedProgress,
        'challenge.points': newPoints,
        'challenge.tokenCount': newTokens,
        'challenge.streakCount': streak,
      });

      navigation.reset({
        index: 0,
        routes: [{ name: 'Challenge' }],
      });
  
    } catch (err) {
      console.error('❌ Error completing day:', err);
      Alert.alert(t('error'), t('could_not_complete_day'));
    } finally {
      setLoading(false);
    }
  };
  

  const handleRedeemToken = async () => {
    if (!user) return;
  
    try {
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      const data = snap.data();
  
      const currentProgress = data?.challenge?.progress || {};
      const habits = data?.challenge?.habits || [];
      const tokenCount = data?.challenge?.tokenCount || 0;
  
      if (tokenCount < 1) {
        Alert.alert(t('error'), t('no_tokens_available'));
        return;
      }
  
      const updatedProgress = {
        ...currentProgress,
        [dayNumber]: {
          completedHabits: habits,
          journal: journal || '',
          imageUri: imageUri ?? null, // ✅ Prevent undefined
          isManuallyCompleted: true,
          redeemed: true,
        },
      };
  
      await updateDoc(ref, {
        'challenge.progress': updatedProgress,
        'challenge.tokenCount': tokenCount - 1,
      });
  
      navigation.navigate('Challenge', { refresh: true });
    } catch (err) {
      console.error('❌ Error redeeming token:', err);
      Alert.alert(t('error'), t('could_not_redeem_token'));
    }
  };
  

  if (loading || !meta) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 16 }}>
        <Text style={{ color: '#4F46E5', fontWeight: '600', fontSize: 16 }}>
          {`← ${t('back')}`}
        </Text>
      </TouchableOpacity>

      <Text style={styles.heading}>{t('day')} {dayNumber}</Text>

      <HabitTracker
        habits={habits}
        completedHabits={completedHabits}
        onToggle={toggleHabit}
      />

      <View style={styles.section}>
        <Text style={styles.label}>{t('journal_entry')}:</Text>
        <TextInput
          style={styles.journalInput}
          placeholder={t('write_about_day')}
          value={journal}
          onChangeText={setJournal}
          multiline
          editable={isEditable}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t('image_for_day')}:</Text>
        {imageUri ? (
          <TouchableOpacity onPress={handlePickImage} disabled={!isEditable}>
            <Image source={{ uri: imageUri }} style={styles.image} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handlePickImage} style={styles.uploadBox} disabled={!isEditable}>
            <Text style={styles.uploadText}>{t('upload_image')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {isEditable && (
        <TouchableOpacity
          style={[styles.completeButton, loading && { opacity: 0.6 }]}
          onPress={handleCompleteDay}
          disabled={loading}
        >
          <Text style={styles.completeButtonText}>
            {loading ? t('completing_day') : t('complete_day')}
          </Text>
        </TouchableOpacity>
      )}

      {(status === 'missed' || status === 'partial') && meta.tokenCount > 0 && (
        <TouchableOpacity
          style={[styles.completeButton, { backgroundColor: '#F59E0B', marginTop: 10 }]}
          onPress={handleRedeemToken}
        >
          <Text style={styles.completeButtonText}>{t('redeem_token')}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    marginTop: 24,
    padding: 20,
    backgroundColor: '#F7FAFC',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  journalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  uploadBox: {
    height: 200,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    fontSize: 16,
    color: '#555',
  },
  completeButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    marginBottom: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
