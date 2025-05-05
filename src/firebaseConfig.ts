import { initializeApp } from 'firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
// @ts-ignore
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';



// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCYEnBMII7NKo16ffhvlPSDmLDn2oNfTzU",
  authDomain: "day90-6f89b.firebaseapp.com",
  projectId: "day90-6f89b",
  storageBucket: "day90-6f89b.appspot.com",
  messagingSenderId: "1017955402845",
  appId: "1:1017955402845:web:cd7eb30a85bc495426b9b4",
};

// ✅ Initialize Firebase App
const app = initializeApp(firebaseConfig);

// ✅ Use initializeAuth instead of getAuth for persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
