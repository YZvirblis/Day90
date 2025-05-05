import React, { useEffect, useRef, useState } from 'react';
import { updateDoc } from 'firebase/firestore';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  Animated,
  ViewToken,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  I18nManager,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  addDays,
  isToday,
  isBefore,
  differenceInCalendarDays,
} from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { doc, getDoc } from 'firebase/firestore';

import { DayCard } from '../components/DayCard';
import { DaySummaryBar } from '../components/DaySummaryBar';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { mockData } from '../data/challengeData';
import { DayProgress, ChallengeMeta } from '../data/types';

import * as Updates from 'expo-updates';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const SIDE_MARGIN = (width - CARD_WIDTH) / 2;

const USE_MOCK_DATA = false;

export default function ChallengeScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user, logout } = useAuth();
  const isRTL = I18nManager.isRTL;

  const flatListRef = useRef<FlatList<any>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const today = new Date();

  const [challengeStartDate, setChallengeStartDate] = useState<Date>(new Date());
  const [dayProgress, setDayProgress] = useState<Record<number, DayProgress>>({});
  const [loading, setLoading] = useState(true);
  const [totalDays, setTotalDays] = useState(90);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [todayIndex, setTodayIndex] = useState( differenceInCalendarDays(today, challengeStartDate));

  const [habits, setHabits] = useState<string[]>([]);
  const [totalHabits, setTotalHabits] = useState(0);
  const [meta, setMeta] = useState<ChallengeMeta | null>(null);

  const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);


  useEffect(() => {
    const loadChallengeData = async () => {
      if (USE_MOCK_DATA || !user) {
        setTotalHabits(3);
        setChallengeStartDate(mockData.meta.startDate);
        setDayProgress(mockData.progress);
        setTotalDays(mockData.meta.totalDays);
        setCurrentIndex(differenceInCalendarDays(today, mockData.meta.startDate));
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const data = userDoc.data();
        
        if (!data?.challenge) throw new Error('Challenge not found');
        
        const parsedDate = new Date(data.challenge.startDate);
        
        setHabits(data.challenge.habits || []);
        setTotalHabits(data.challenge.habits?.length || 0);
        setChallengeStartDate(parsedDate);
        setTotalDays(data.challenge.totalDays || 90);
        setDayProgress(data.challenge.progress || {});
        setCurrentIndex(differenceInCalendarDays(today, parsedDate));

        setTodayIndex(differenceInCalendarDays(today, parsedDate));
        
        // ✅ Pass accurate meta to DaySummaryBar
        const meta = {
          totalDays: data.challenge.totalDays || 90,
          startDate: parsedDate,
          streakCount: data.challenge.streakCount || 0,
          tokenCount: data.challenge.tokenCount || 0,
          points: data.challenge.points || 0,
        };
        setMeta(meta);
      } catch (err) {
        console.error('Error loading challenge:', err);
      } finally {
        setLoading(false);
      }
    };

    loadChallengeData();
  }, [user, ]);

  

  

  // const handleViewableItemsChanged = useRef(
  //   ({ viewableItems }: { viewableItems: ViewToken[] }) => {
  //     const visible = viewableItems.find((v) => typeof v.index === 'number');
  
  //     if (typeof visible?.index === 'number' && visible.index !== currentIndex) {
  //       console.log('🔁 Visible index:', visible.index);
  //       setCurrentIndex(visible.index);
  //     }
  //   }
  // ).current;

  const dayItems = Array.from({ length: totalDays }, (_, i) => {
    const dayNumber = i + 1;
    const date = addDays(challengeStartDate, i);
    const progress = dayProgress[dayNumber];
  
    let status: 'complete' | 'partial' | 'missed' | 'today' | 'future' = 'future';
    if (isToday(date) && !progress?.isManuallyCompleted) {
      status = 'today';
    } else if (isBefore(date, today)) {
      if (progress?.isManuallyCompleted && progress?.completedHabits?.length === totalHabits) {
        status = 'complete';
      } else if (
        progress?.completedHabits?.length > 0 &&
        progress?.completedHabits?.length < totalHabits &&
        progress?.isManuallyCompleted
      ) {
        status = 'partial';
      } else {
        status = 'missed';
      }
    }
  
    return {
      key: `${dayNumber}`,
      dayNumber,
      status,
      isToday: isToday(date),
      date,
    };
  });
  
  const finalDayItems = isRTL ? [...dayItems].reverse() : dayItems;

  

  const handleEnterDay = () => {
    const actualIndex = isRTL ? totalDays - 1 - currentIndex : currentIndex;
    const day = dayItems[actualIndex];
  
    navigation.navigate('Day', {
      dayNumber: day.dayNumber,
      status: day.status,
    });
  };

  const handleChangeLanguage = async (lang: string) => {
    const isRTL = lang === 'he';
  
    try {
      await AsyncStorage.setItem('user-language', lang);
  
      if (I18nManager.isRTL !== isRTL) {
        I18nManager.forceRTL(isRTL);
      }
  
      await i18n.changeLanguage(lang); // Needed immediately for dev
  
      if (!__DEV__) {
        await Updates.reloadAsync(); // Reload to apply RTL
      }
    } catch (err) {
      console.error('Failed to change language:', err);
    }
  };
  

  const handleDeleteChallenge = async () => {
    if (!user?.uid) return;
    try {
      const ref = doc(db, 'users', user.uid);
      await updateDoc(ref, {
        challenge: null,
      });
      navigation.replace('Onboarding');
    } catch (err) {
      Alert.alert(t('error'), t('could_not_delete_challenge'));
    }
  };

  const completedDays = Object.values(dayProgress).filter(
    (d) => d.isManuallyCompleted && d.completedHabits?.length === totalHabits
  ).length;

  const partialDays = Object.values(dayProgress).filter(
    (d) =>
      d.isManuallyCompleted &&
      d.completedHabits?.length > 0 &&
      d.completedHabits?.length < totalHabits
  ).length;

  if (loading || !challengeStartDate) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.headerWrapper, isRTL && { flexDirection: 'row-reverse' }]}> 
        <Text style={styles.header}>{t('your_90_day_journey')}</Text>
        {/* <TouchableOpacity
         onPress={() => {
          if (currentIndex !== todayIndex) {
            flatListRef.current?.scrollToIndex({ index: todayIndex, animated: true });
          }
        }}
        >
          <Text style={styles.scrollToday}>{t('scroll_to_today')}</Text>
        </TouchableOpacity> */}
      </View>

      <AnimatedFlatList
        ref={flatListRef}
        data={finalDayItems}
        horizontal
        snapToInterval={CARD_WIDTH}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item: any) => item.key}
        contentContainerStyle={{ paddingHorizontal: SIDE_MARGIN }}
        getItemLayout={(_, index) => ({ length: CARD_WIDTH, offset: CARD_WIDTH * index, index })}
        // onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        scrollEventThrottle={16}
        renderItem={({ item, index }:any) => {
          const isFuture = index > todayIndex;
          const inputRange = [
            (index - 1) * CARD_WIDTH,
            index * CARD_WIDTH,
            (index + 1) * CARD_WIDTH,
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1, 0.9],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              style={{ width: CARD_WIDTH, transform: [{ scale }], opacity }}
              pointerEvents={isFuture ? 'none' : 'auto'}
            >
              <TouchableOpacity onPress={handleEnterDay} activeOpacity={0.85}>
                <DayCard
                  dayNumber={item.dayNumber}
                  status={item.status}
                  date={item.date}
                />
              </TouchableOpacity>
            </Animated.View>
          );
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        bounces={false}
        overScrollMode="never"
      />
      <DaySummaryBar
      //@ts-ignore
        meta={meta}
        completedDays={completedDays}
        partialDays={partialDays}
        onLogout={logout}
        onDeleteChallenge={handleDeleteChallenge}
        onChangeLanguage={handleChangeLanguage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 12,
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollToday: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
});
