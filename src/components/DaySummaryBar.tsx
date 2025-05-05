import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  I18nManager,
} from 'react-native';
import {
  MaterialIcons,
  FontAwesome5,
  Feather,
  Ionicons,
} from '@expo/vector-icons';
import { ChallengeMeta } from '../data/types';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

interface Props {
  meta: ChallengeMeta;
  completedDays: number;
  partialDays: number;
  onLogout: () => void;
  onDeleteChallenge: () => void;
  onChangeLanguage: (lang: string) => void;
}

export const DaySummaryBar = ({
  meta,
  completedDays,
  partialDays,
  onLogout,
  onDeleteChallenge,
  onChangeLanguage,
}: Props) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showAccount, setShowAccount] = useState(false);

  const isRTL = I18nManager.isRTL;

    const endDate = new Date(meta.startDate);
    endDate.setDate(endDate.getDate() + meta.totalDays - 1);
    const progressToToken = meta.streakCount % 5;

  const confirmLogout = () => {
    Alert.alert(t('confirm_logout_title'), t('confirm_logout_message'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('logout'), onPress: onLogout, style: 'destructive' },
    ]);
  };

  const confirmDelete = () => {
    Alert.alert(t('confirm_delete_title'), t('confirm_delete_message'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), onPress: onDeleteChallenge, style: 'destructive' },
    ]);
  };

  const infoItems = [
    {
      icon: <MaterialIcons name="check-circle" size={20} color="#10B981" />,
      label: t('completed'),
      value: completedDays,
    },
    {
      icon: <MaterialIcons name="hourglass-bottom" size={20} color="#FBBF24" />,
      label: t('partially_completed'),
      value: partialDays,
    },
    {
      icon: <FontAwesome5 name="coins" size={18} color="#F59E0B" />,
      label: t('tokens'),
      value: meta?.tokenCount,
    },
    {
      icon: <FontAwesome5 name="star" size={18} color="#6366F1" />,
      label: t('points'),
      value: meta?.points,
    },
    {
      icon: <Feather name="calendar" size={20} color="#6B7280" />,
      label: t('challenge_dates'),
      value: `${meta?.startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('your_progress')}</Text>

      {infoItems.map((item, idx) => (
        <View style={[styles.row, isRTL && styles.rowRTL]} key={idx}>
          <View style={styles.rowLeft}>
            {item.icon}
            <Text style={[styles.label, isRTL && styles.labelRTL]}>{item.label}</Text>
          </View>
          <Text style={[styles.value, isRTL && styles.valueRTL]}>{item.value}</Text>
        </View>
      ))}

      <View style={[styles.row, isRTL && styles.rowRTL]}>
        <View style={styles.rowLeft}>
          <FontAwesome5 name="fire" size={18} color="#F97316" />
          <Text style={[styles.label, isRTL && styles.labelRTL]}>{t('streak_progress')}</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[styles.progressBarFill, { width: `${(progressToToken / 5) * 100}%` }]}
          />
        </View>
        <Text style={styles.value}>{progressToToken}/5</Text>
      </View>

      <TouchableOpacity
        onPress={() => setShowAccount(!showAccount)}
        style={{ marginTop: 12, alignSelf: 'center' }}
      >
        <Text style={{ color: '#4F46E5', fontWeight: '600' }}>
          {showAccount ? t('hide_account') : t('show_account')}
        </Text>
      </TouchableOpacity>

      {showAccount && (
        <View>
          <View style={styles.divider} />
          <Text style={styles.header}>{t('account')}</Text>

          <View style={[styles.row, isRTL && styles.rowRTL]}>
            <View style={styles.rowLeft}>
              <Ionicons name="mail-outline" size={20} color="#4B5563" />
              <Text style={styles.label}>{user?.email}</Text>
            </View>
          </View>

          <View style={[styles.row, isRTL && styles.rowRTL]}>
            <View style={styles.rowLeft}>
              <Ionicons name="language-outline" size={20} color="#4F46E5" />
              <Text style={styles.label}>{t('language')}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => onChangeLanguage('en')}>
                <Text style={styles.link}>EN</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onChangeLanguage('he')}>
                <Text style={styles.link}>HE</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.actionRow} onPress={confirmLogout}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.dangerText}>{t('logout')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={confirmDelete}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={styles.dangerText}>{t('delete_challenge')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1F2937',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 6,
  },
  labelRTL: {
    marginLeft: 0,
    marginRight: 6,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  valueRTL: {
    textAlign: 'left',
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginHorizontal: 8,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#F97316',
    borderRadius: 4,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  dangerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
});
