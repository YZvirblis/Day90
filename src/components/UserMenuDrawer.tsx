import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { DaySummaryBar } from './DaySummaryBar';
import { ChallengeMeta } from '../data/types';

interface Props {
  meta: ChallengeMeta;
  completedDays: number;
  partialDays: number;
  onLogout: () => void;
}

export const UserMenuDrawer = ({ meta, completedDays, partialDays, onLogout }: Props) => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const translateY = useState(new Animated.Value(0))[0];

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy < -10,
    onPanResponderMove: (_, gestureState) => {
        const newY = Math.max(gestureState.dy, -220); // limit upward drag
        translateY.setValue(newY);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -80) {
          Animated.spring(translateY, {
            toValue: -220,
            useNativeDriver: false,
          }).start(() => setIsExpanded(true));
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: false,
          }).start(() => setIsExpanded(false));
        }
      }
  });

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <Animated.View
      style={[styles.drawer, { transform: [{ translateY }] }]}
      {...panResponder.panHandlers}
    >
      <View style={styles.dragHandle} />

      {isExpanded && (
      <TouchableOpacity
        onPress={() => {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: false,
          }).start(() => setIsExpanded(false));
        }}
        style={{ alignItems: 'center', marginBottom: 10 }}
      >
        <Ionicons name="chevron-down" size={20} color="#4F46E5" />
      </TouchableOpacity>
      )}

      <DaySummaryBar partialDays={partialDays} completedDays={completedDays} meta={meta}/>
      <Text style={styles.title}>{t('user_menu')}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <View style={styles.row}>
        <Ionicons name="language" size={20} color="#4F46E5" style={styles.icon} />
        <TouchableOpacity onPress={() => changeLanguage('en')}><Text style={styles.button}>English</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => changeLanguage('he')}><Text style={styles.button}>עברית</Text></TouchableOpacity>
      </View>

      <View style={styles.row}>
        <Ionicons name="log-out-outline" size={20} color="#4F46E5" style={styles.icon} />
        <TouchableOpacity onPress={onLogout}><Text style={styles.logout}>{t('logout')}</Text></TouchableOpacity>
      </View>

      {/* Future Options: */}
      {/*
      <TouchableOpacity><Text style={styles.danger}>Reset Challenge</Text></TouchableOpacity>
      <TouchableOpacity><Text style={styles.danger}>Delete Challenge</Text></TouchableOpacity>
      */}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 6,
    elevation: 10,
  },
  dragHandle: {
    width: 50,
    height: 6,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  email: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  icon: {
    marginRight: 8,
  },
  button: {
    fontSize: 14,
    marginHorizontal: 10,
    color: '#4F46E5',
    fontWeight: '500',
  },
  logout: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  danger: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 8,
  },
});
