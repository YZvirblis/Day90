import './src/i18n';
import { I18nManager } from 'react-native';
import { useFonts as useQuicksand, Quicksand_600SemiBold } from '@expo-google-fonts/quicksand';
import { useFonts as useRubik, Rubik_400Regular } from '@expo-google-fonts/rubik';
import { useFonts as useAssistant, Assistant_700Bold } from '@expo-google-fonts/assistant';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext'; // ✅ ADD THIS

export default function App() {
  const isRTL = I18nManager.isRTL;
  const [quicksandLoaded] = useQuicksand({ Quicksand_600SemiBold });
  const [rubikLoaded] = useRubik({ Rubik_400Regular });
  const [assistantLoaded] = useAssistant({ Assistant_700Bold });

  const fontsLoaded = quicksandLoaded && rubikLoaded && assistantLoaded;

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <AuthProvider> 
      <AppNavigator />
    </AuthProvider>
  );
}
