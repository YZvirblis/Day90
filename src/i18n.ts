import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from 'react-native-localize';
import * as Updates from 'expo-updates';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import he from './locales/he.json';

// 🔁 Language Detector
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      const storedLang = await AsyncStorage.getItem('user-language');
      if (storedLang) {
        callback(storedLang);
        return;
      }

      const deviceLang = Localization.locale.slice(0, 2);
      callback(deviceLang === 'he' ? 'he' : 'en');
    } catch (error) {
      console.error('Language detection failed:', error);
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lang: string) => {
    try {
      await AsyncStorage.setItem('user-language', lang);
      await AsyncStorage.setItem('rtl-enabled', lang === 'he' ? 'true' : 'false');
    } catch (err) {
      console.error('Error caching language:', err);
    }
  },
};

// 🔁 React to language changes (for RTL)
i18n.on('languageChanged', async (lng) => {
  const isRTL = lng === 'he';

  if (I18nManager.isRTL !== isRTL) {
    try {
      I18nManager.forceRTL(isRTL);
      await AsyncStorage.setItem('user-language', lng);

      if (!__DEV__) {
        console.log('🔁 Reloading app to apply RTL changes...');
        await Updates.reloadAsync();
      } else {
        console.log('🔄 RTL direction changed. Please reload manually in development.');
      }
    } catch (err) {
      console.error('Failed to reload app for RTL change:', err);
    }
  }
});

// ✅ i18n Initialization
i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      he: { translation: he },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
