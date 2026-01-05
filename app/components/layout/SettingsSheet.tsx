import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useColor } from '@/hooks/useColor';
import { useAvatarStore } from '@/store/avatar-store';
import { useSubscriptionStore } from '@/store/subscription-store';
import { BORDER_RADIUS, FONTS } from '@/theme/globals';
import { FREE_DAILY_LIMIT } from '@/schemas/user';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {
  Crown,
  Mail,
  FileText,
  Shield,
  Trash2,
  History,
  RotateCcw,
} from 'lucide-react-native';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { Paywall } from '@/components/subscription/Paywall';
import type { GenerationRecord } from '@/schemas/api';

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
}

interface SettingsRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  destructive?: boolean;
}

function SettingsRow({ icon, title, subtitle, onPress, destructive }: SettingsRowProps) {
  const textColor = useColor(destructive ? 'destructive' : 'text');
  const mutedColor = useColor('textMuted');
  const borderColor = useColor('border');

  return (
    <Pressable
      style={[styles.row, { borderBottomColor: borderColor }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.rowIcon}>{icon}</View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowTitle, { color: textColor }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.rowSubtitle, { color: mutedColor }]}>{subtitle}</Text>
        )}
      </View>
    </Pressable>
  );
}

export function SettingsSheet({ open, onClose }: SettingsSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [paywallVisible, setPaywallVisible] = useState(false);

  const backgroundColor = useColor('background');
  const cardBg = useColor('card');
  const textColor = useColor('text');
  const mutedColor = useColor('textMuted');
  const primaryColor = useColor('primary');
  const primaryFgColor = useColor('primaryForeground');
  const destructiveColor = useColor('destructive');
  const successColor = useColor('success');
  const borderColor = useColor('border');

  const { user, clearHistory, resetDailyUsage, deleteFromHistory } = useAvatarStore();
  const hasPremium = useSubscriptionStore(
    (state) => state.subscription.tier === 'premium' && state.subscription.isActive
  );
  const restore = useSubscriptionStore((state) => state.restore);
  const generations = user.generations;
  const remaining = hasPremium
    ? Infinity
    : Math.max(0, FREE_DAILY_LIMIT - user.generationsToday);

  const snapPoints = useMemo(() => ['85%'], []);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const handleUpgrade = () => {
    setPaywallVisible(true);
  };

  const handleRestore = async () => {
    const restored = await restore();
    if (restored) {
      Alert.alert('Success', 'Your subscription has been restored!');
    } else {
      Alert.alert('No Subscription Found', 'We could not find an active subscription to restore.');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your avatars and reset your preferences.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: () => {
            clearHistory();
            resetDailyUsage();
          },
        },
      ]
    );
  };

  const handleDeleteAvatar = (id: string) => {
    Alert.alert('Delete Avatar', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteFromHistory(id) },
    ]);
  };

  const handleAvatarPress = (id: string) => {
    onClose();
    router.push({ pathname: '/preview', params: { id } });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (!open) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor }}
      handleIndicatorStyle={{ backgroundColor: borderColor }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: textColor }]}>Settings</Text>
      </View>

      <BottomSheetScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Paywall Modal */}
        <Paywall visible={paywallVisible} onClose={() => setPaywallVisible(false)} />

        {/* Premium Section */}
        {!hasPremium && (
          <View style={[styles.premiumCard, { backgroundColor: primaryColor }]}>
            <Crown size={28} color={primaryFgColor} />
            <View style={styles.premiumText}>
              <Text style={[styles.premiumTitle, { color: primaryFgColor }]}>
                Upgrade to Premium
              </Text>
              <Text style={[styles.premiumSubtitle, { color: `${primaryFgColor}cc` }]}>
                Unlimited generations
              </Text>
            </View>
            <Pressable
              style={[styles.upgradeButton, { backgroundColor: primaryFgColor }]}
              onPress={handleUpgrade}
            >
              <Text style={[styles.upgradeText, { color: primaryColor }]}>Upgrade</Text>
            </Pressable>
          </View>
        )}

        {hasPremium && (
          <View style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.premiumStatus}>
              <Crown size={20} color={successColor} />
              <Text style={[styles.sectionTitle, { color: textColor, marginLeft: 8 }]}>
                Premium Member
              </Text>
            </View>
          </View>
        )}

        {/* Usage */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.sectionLabel, { color: mutedColor }]}>USAGE</Text>
          <Text style={[styles.usageTitle, { color: textColor }]}>
            {hasPremium ? 'Unlimited' : `${remaining} of ${FREE_DAILY_LIMIT}`}
          </Text>
          <Text style={[styles.usageSubtitle, { color: mutedColor }]}>
            generations remaining today
          </Text>
          <View style={[styles.usageBar, { backgroundColor: borderColor }]}>
            <View
              style={[
                styles.usageProgress,
                {
                  backgroundColor: primaryColor,
                  width: hasPremium
                    ? '100%'
                    : `${((FREE_DAILY_LIMIT - remaining) / FREE_DAILY_LIMIT) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* History */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLabelRow}>
              <History size={16} color={mutedColor} />
              <Text style={[styles.sectionLabel, { color: mutedColor, marginLeft: 6 }]}>
                HISTORY ({generations.length})
              </Text>
            </View>
            {generations.length > 0 && (
              <Pressable onPress={() => clearHistory()}>
                <Text style={[styles.clearText, { color: destructiveColor }]}>Clear</Text>
              </Pressable>
            )}
          </View>
          {generations.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconContainer, { backgroundColor: borderColor }]}>
                <History size={24} color={mutedColor} />
              </View>
              <Text style={[styles.emptyTitle, { color: textColor }]}>No avatars yet</Text>
              <Text style={[styles.emptySubtitle, { color: mutedColor }]}>
                Your generated avatars will appear here
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.historyList}
            >
              {generations.slice(0, 10).map((item: GenerationRecord) => (
                <Pressable
                  key={item.id}
                  style={[styles.historyItem, { borderColor }]}
                  onPress={() => handleAvatarPress(item.id)}
                  onLongPress={() => handleDeleteAvatar(item.id)}
                >
                  <Image
                    source={{ uri: item.thumbnailUrl }}
                    style={styles.historyImage}
                    contentFit="cover"
                  />
                  <Text style={[styles.historyDate, { color: mutedColor }]}>
                    {formatDate(item.createdAt)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Support */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.sectionLabel, { color: mutedColor }]}>SUPPORT</Text>
          <SettingsRow
            icon={<RotateCcw size={18} color={textColor} />}
            title="Restore Purchases"
            onPress={handleRestore}
          />
          <SettingsRow
            icon={<Mail size={18} color={textColor} />}
            title="Contact Us"
            onPress={() => Linking.openURL('mailto:support@avatarcreator.app')}
          />
          <SettingsRow
            icon={<Shield size={18} color={textColor} />}
            title="Privacy Policy"
            onPress={() => Linking.openURL('https://avatarcreator.app/privacy')}
          />
          <SettingsRow
            icon={<FileText size={18} color={textColor} />}
            title="Terms of Service"
            onPress={() => Linking.openURL('https://avatarcreator.app/terms')}
          />
        </View>

        {/* Data */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.sectionLabel, { color: mutedColor }]}>DATA</Text>
          <SettingsRow
            icon={<Trash2 size={18} color={destructiveColor} />}
            title="Clear All Data"
            onPress={handleClearData}
            destructive
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.version, { color: mutedColor }]}>
            Avatarmon v1.0.0
          </Text>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: BORDER_RADIUS,
    marginBottom: 16,
  },
  premiumText: {
    flex: 1,
    marginLeft: 12,
  },
  premiumTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  premiumSubtitle: {
    fontSize: 13,
  },
  upgradeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upgradeText: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
  },
  premiumStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  section: {
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: FONTS.semiBold,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  clearText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  usageTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    paddingHorizontal: 16,
  },
  usageSubtitle: {
    fontSize: 13,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  usageBar: {
    height: 4,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 2,
  },
  usageProgress: {
    height: '100%',
    borderRadius: 2,
  },
  historyList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  historyItem: {
    width: 80,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  historyImage: {
    width: 80,
    height: 80,
  },
  historyDate: {
    fontSize: 10,
    textAlign: 'center',
    paddingVertical: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  emptyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: FONTS.semiBold,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  rowIcon: {
    marginRight: 12,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
  },
  rowSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  version: {
    fontSize: 12,
  },
});
