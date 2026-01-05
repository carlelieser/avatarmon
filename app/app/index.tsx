import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import { useColor } from '@/hooks/useColor';
import { FONTS } from '@/theme/globals';
import { useAvatarStore } from '@/store/avatar-store';
import { useGeneration } from '@/hooks/useGeneration';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { FloatingButton } from '@/components/ui/FloatingButton';
import { OutputSection } from '@/components/layout/OutputSection';
import { MultiPhotoInputSection } from '@/components/layout/MultiPhotoInputSection';
import { AvatarSettingsSection } from '@/components/layout/AvatarSettingsSection';
import { SettingsSheet } from '@/components/layout/SettingsSheet';

import type { StyleModifiers, PhotoItem } from '@/schemas/avatar';
import type { Style } from '@/schemas/enums';

export default function MainScreen() {
  const backgroundColor = useColor('background');
  const textColor = useColor('text');

  const {
    currentForm,
    addPhoto,
    removePhoto,
    setStyle,
    setBackground,
    setStyleModifiers,
    setAspectRatio: setStoreAspectRatio,
    canGenerate,
  } = useAvatarStore();
  const { generate, isGenerating, status, progress, previewUrl, error } = useGeneration();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [backgroundType, setBackgroundType] = useState('solid');
  const [primaryColor, setPrimaryColor] = useState('#ffffff');
  const [secondaryColor, setSecondaryColor] = useState('#6366f1');
  const [aspectRatio, setAspectRatio] = useState('1:1');

  // Photos from store
  const photos: PhotoItem[] = currentForm.photos ?? [];

  const handlePhotoAdd = (asset: ImagePicker.ImagePickerAsset) => {
    const mimeType = asset.mimeType?.startsWith('image/')
      ? (asset.mimeType as 'image/jpeg' | 'image/png' | 'image/webp')
      : 'image/jpeg';
    addPhoto({
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      mimeType,
    });
  };

  const handlePhotoRemove = (index: number) => {
    removePhoto(index);
  };

  const handleStyleSelect = (style: Style) => {
    setStyle(style);
  };

  const handleModifierChange = (key: keyof StyleModifiers, value: string) => {
    setStyleModifiers({ [key]: value });
  };

  const handleBackgroundChange = (value: string) => {
    setBackgroundType(value);
    setBackground({ type: value as any, primaryColor, secondaryColor });
  };

  const handleAccessoriesChange = (accessories: string[]) => {
    setStyleModifiers({ accessories: accessories as any });
  };

  const handlePrimaryColorChange = (color: string) => {
    setPrimaryColor(color);
    setBackground({ type: backgroundType as any, primaryColor: color, secondaryColor });
  };

  const handleSecondaryColorChange = (color: string) => {
    setSecondaryColor(color);
    setBackground({ type: backgroundType as any, primaryColor, secondaryColor: color });
  };

  const handleAspectRatioChange = (value: string) => {
    setAspectRatio(value);
    setStoreAspectRatio(value as any);
  };

  const handleGenerate = async () => {
    if (!canGenerate()) {
      Alert.alert('Daily Limit Reached', 'Upgrade to Premium for unlimited generations.');
      return;
    }

    if (photos.length === 0) {
      Alert.alert('Add a Photo', 'Please add at least one photo to generate an avatar.');
      return;
    }

    if (!currentForm.style) {
      Alert.alert('Select a Style', 'Please choose an avatar style before generating.');
      return;
    }

    try {
      await generate();
      router.push('/preview');
    } catch (err) {
      Alert.alert('Error', error || 'Failed to generate avatar');
    }
  };

  const handleOutputPress = () => {
    if (previewUrl) {
      router.push('/preview');
    }
  };

  const isFormValid = photos.length > 0 && currentForm.style;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Avatarmon</Text>
        <Button
          variant="ghost"
          size="icon"
          onPress={() => setSettingsOpen(true)}
          icon={Settings}
        />
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Output Section */}
        <OutputSection
          imageUrl={previewUrl}
          isGenerating={isGenerating}
          progress={progress}
          status={status}
          onPress={handleOutputPress}
        />

        {/* Photo Input */}
        <View style={styles.section}>
          <MultiPhotoInputSection
            photos={photos}
            onPhotoAdd={handlePhotoAdd}
            onPhotoRemove={handlePhotoRemove}
          />
        </View>

        {/* Avatar Settings */}
        <View style={styles.section}>
          <AvatarSettingsSection
            selectedStyle={currentForm.style || null}
            onStyleSelect={handleStyleSelect}
            styleModifiers={currentForm.styleModifiers}
            onModifierChange={handleModifierChange}
            onAccessoriesChange={handleAccessoriesChange}
            backgroundType={backgroundType}
            onBackgroundChange={handleBackgroundChange}
            primaryColor={primaryColor}
            onPrimaryColorChange={handlePrimaryColorChange}
            secondaryColor={secondaryColor}
            onSecondaryColorChange={handleSecondaryColorChange}
            aspectRatio={aspectRatio}
            onAspectRatioChange={handleAspectRatioChange}
          />
        </View>

        {/* Spacer for floating button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating Generate Button */}
      <FloatingButton
        onPress={handleGenerate}
        disabled={!isFormValid || !canGenerate()}
        loading={isGenerating}
        progress={progress}
      />

      {/* Settings Sheet */}
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.bold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  section: {
    marginTop: 24,
  },
  bottomSpacer: {
    height: 100,
  },
});
