import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Share,
  Alert,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { X, Download, Share2, Trash2 } from 'lucide-react-native';
import { useColor } from '@/hooks/useColor';
import { useAvatarStore } from '@/store/avatar-store';
import { useExport } from '@/hooks/useExport';
import { BORDER_RADIUS, FONTS } from '@/theme/globals';

export default function PreviewScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const backgroundColor = useColor('background');
  const cardBg = useColor('card');
  const textColor = useColor('text');
  const mutedColor = useColor('textMuted');
  const primaryColor = useColor('primary');
  const primaryFgColor = useColor('primaryForeground');
  const destructiveColor = useColor('destructive');
  const borderColor = useColor('border');

  const { user, previewUrl, deleteFromHistory } = useAvatarStore();
  const { saveToGallery, share, isSaving, isSharing } = useExport();

  // Find the generation record if viewing from history
  const generation = params.id
    ? user.generations.find((g) => g.id === params.id)
    : null;

  const imageUrl = generation?.imageUrl || previewUrl;

  if (!imageUrl) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <X size={24} color={textColor} />
          </Pressable>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: mutedColor }]}>
            No preview available
          </Text>
        </View>
      </View>
    );
  }

  const handleSave = async () => {
    const result = await saveToGallery(imageUrl);
    if (result.success) {
      Alert.alert('Saved', 'Avatar saved to your gallery');
    } else {
      Alert.alert('Error', result.error || 'Failed to save avatar');
    }
  };

  const handleShare = async () => {
    const result = await share(imageUrl);
    if (!result.success && result.error) {
      Alert.alert('Error', result.error);
    }
  };

  const handleDelete = () => {
    if (!generation) return;

    Alert.alert(
      'Delete Avatar',
      'Are you sure you want to delete this avatar?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteFromHistory(generation.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <X size={24} color={textColor} />
        </Pressable>
        <Text style={[styles.title, { color: textColor }]}>Preview</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Image */}
        <View style={[styles.imageContainer, { borderColor }]}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="contain"
            transition={300}
          />
        </View>

        {/* Metadata */}
        {generation && (
          <View style={[styles.metadata, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>
                Style
              </Text>
              <Text style={[styles.metaValue, { color: textColor }]}>
                {generation.style}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>
                Created
              </Text>
              <Text style={[styles.metaValue, { color: textColor }]}>
                {new Date(generation.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>
                Aspect Ratio
              </Text>
              <Text style={[styles.metaValue, { color: textColor }]}>
                {generation.aspectRatio}
              </Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: primaryColor }]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Download size={20} color={primaryFgColor} />
            <Text style={[styles.actionText, { color: primaryFgColor }]}>
              {isSaving ? 'Saving...' : 'Save to Gallery'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.actionButton, { backgroundColor: cardBg, borderColor }]}
            onPress={handleShare}
            disabled={isSharing}
          >
            <Share2 size={20} color={textColor} />
            <Text style={[styles.actionText, { color: textColor }]}>
              {isSharing ? 'Sharing...' : 'Share'}
            </Text>
          </Pressable>

          {generation && (
            <Pressable
              style={[styles.actionButton, styles.deleteButton, { borderColor: destructiveColor }]}
              onPress={handleDelete}
            >
              <Trash2 size={20} color={destructiveColor} />
              <Text style={[styles.actionText, { color: destructiveColor }]}>
                Delete
              </Text>
            </Pressable>
          )}
        </View>

        {/* New Avatar Button */}
        <Pressable
          style={styles.newButton}
          onPress={() => {
            router.replace('/');
          }}
        >
          <Text style={[styles.newButtonText, { color: primaryColor }]}>
            Create Another Avatar
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  imageContainer: {
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  metadata: {
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  metaLabel: {
    fontSize: 14,
  },
  metaValue: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    textTransform: 'capitalize',
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    gap: 8,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  actionText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  newButton: {
    alignItems: 'center',
    padding: 16,
  },
  newButtonText: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
  },
});
