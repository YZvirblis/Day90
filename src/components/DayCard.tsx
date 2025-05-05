import React from 'react';
import { View, Text, StyleSheet, Dimensions, I18nManager } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const CARD_HEIGHT = 400;


type Props = {
  dayNumber: number;
  status?: 'complete' | 'partial' | 'missed' | 'today' | 'future';
  date?: Date;
};

export const DayCard = ({ dayNumber, status = 'future', date }: Props) => {
  const { t } = useTranslation();
  const isRTL = I18nManager.isRTL;

  const gradient = getGradientByStatus(status);
  const borderColor = getBorderColorByStatus(status);
  const icon = getStatusIcon(status);

  return (
    <LinearGradient
      colors={gradient}
      style={[styles.card, { borderColor }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={[styles.iconContainer, isRTL && { left: 20, right: 'auto' }]}> 
        {icon && <Icon name={icon} size={28} color="#fff" />}
      </View>

      <Text style={styles.dayLabel}>{t('day')}</Text>
      <Text style={styles.dayNumber}>{dayNumber}</Text>

      {status === 'today' ? (
        <Text style={styles.todayLabel}>{t('today')}</Text>
      ) : (
        <Text style={styles.todayLabel}>{date?.toLocaleDateString()}</Text>
      )}
    </LinearGradient>
  );
};

const getGradientByStatus = (status: string): [string, string] => {
  switch (status) {
    case 'complete':
      return ['#34D399', '#10B981'];
    case 'partial':
      return ['#FBBF24', '#F59E0B'];
    case 'missed':
      return ['#F87171', '#EF4444'];
    case 'today':
      return ['#A78BFA', '#6366F1'];
    default:
      return ['#E5E7EB', '#D1D5DB'];
  }
};

const getBorderColorByStatus = (status: string) => {
  switch (status) {
    case 'complete':
      return '#10B981';
    case 'partial':
      return '#F59E0B';
    case 'missed':
      return '#EF4444';
    case 'today':
      return '#6366F1';
    default:
      return '#D1D5DB';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'complete':
      return 'check-circle';
    case 'partial':
      return 'hourglass-bottom';
    case 'missed':
      return 'cancel';
    default:
      return null;
  }
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    borderWidth: 2,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  dayLabel: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 8,
    fontWeight: '600',
  },
  dayNumber: {
    fontSize: 72,
    fontWeight: '800',
    color: '#fff',
  },
  todayLabel: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    backgroundColor: '#ffffff33',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  iconContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
});