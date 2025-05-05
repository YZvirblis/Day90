// src/navigation/AppNavigator.tsx

import { useEffect } from 'react';
import { I18nManager, Platform } from 'react-native';
import * as Updates from 'expo-updates';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import i18n from '../i18n'; // ✅ Import i18n for current language

import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ChallengeScreen from '../screens/ChallengeScreen';
import DayScreen from '../screens/DayScreen';

export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  Onboarding: undefined;
  Challenge: { refresh?: boolean };
  Day: {
    dayNumber: number;
    status: 'complete' | 'missed' | 'today' | 'future' | 'partial';
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  useEffect(() => {
    const applyRTLIfNeeded = async () => {
      const lang = i18n.language;
      const shouldBeRTL = lang === 'he';

      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.forceRTL(shouldBeRTL);

        if (!__DEV__) {
          try {
            await Updates.reloadAsync(); // Force restart in production
          } catch (err) {
            console.warn('App reload failed for RTL sync:', err);
          }
        } else {
          console.log('🔁 RTL layout updated. Please reload manually in development.');
        }
      }
    };

    applyRTLIfNeeded();
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer>
      {user ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Challenge" component={ChallengeScreen} />
          <Stack.Screen name="Day" component={DayScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
