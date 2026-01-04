import { useEffect, useState } from 'react';
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
import { ImageInputSection } from '@/components/layout/ImageInputSection';
import { AvatarSettingsSection } from '@/components/layout/AvatarSettingsSection';
import { SettingsSheet } from '@/components/layout/SettingsSheet';

import type { BuilderSource } from '@/schemas/avatar';
import type { Style } from '@/schemas/enums';

const DEFAULT_BUILDER_FORM: Partial<BuilderSource> = {
  type: 'builder',
  gender: 'feminine',
  ageRange: 'young-adult',
  skinTone: 'medium',
  hairStyle: 'medium',
  hairColor: 'brown',
  eyeColor: 'brown',
  eyeShape: 'almond',
  facialHair: 'none',
  faceShape: 'oval',
  accessories: [],
  expression: 'smiling',
};

export default function MainScreen() {
  const backgroundColor = useColor('background');
  const textColor = useColor('text');
  const iconColor = useColor('icon');

  const { currentForm, setSource, setStyle, setBackground, canGenerate } = useAvatarStore();
  const { generate, isGenerating, status, progress, previewUrl, error } = useGeneration();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [builderForm, setBuilderForm] = useState<Partial<BuilderSource>>(DEFAULT_BUILDER_FORM);
  const [backgroundType, setBackgroundType] = useState('solid');
  const [primaryColor, setPrimaryColor] = useState('#ffffff');
  const [secondaryColor, setSecondaryColor] = useState('#6366f1');
  const [aspectRatio, setAspectRatio] = useState('1:1');

  // Initialize builder source on mount
  useEffect(() => {
    setSource(DEFAULT_BUILDER_FORM as BuilderSource);
  }, []);

  const handlePhotoSelected = (asset: ImagePicker.ImagePickerAsset) => {
    setPhotoUri(asset.uri);
    const mimeType = asset.mimeType?.startsWith('image/')
      ? (asset.mimeType as 'image/jpeg' | 'image/png' | 'image/webp')
      : 'image/jpeg';
    setSource({
      type: 'photo',
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      mimeType,
    });
  };

  const handlePhotoClear = () => {
    setPhotoUri(null);
    setSource(builderForm as BuilderSource);
  };

  const handleStyleSelect = (style: Style) => {
    setStyle(style);
  };

  const handleBuilderChange = (key: keyof BuilderSource, value: string) => {
    const newForm = { ...builderForm, [key]: value };
    setBuilderForm(newForm);
    if (!photoUri) {
      setSource(newForm as BuilderSource);
    }
  };

  const handleBackgroundChange = (value: string) => {
    setBackgroundType(value);
    setBackground({ type: value as any, primaryColor, secondaryColor });
  };

  const handleAccessoriesChange = (accessories: string[]) => {
    const newForm = { ...builderForm, accessories: accessories as any };
    setBuilderForm(newForm);
    if (!photoUri) {
      setSource(newForm as BuilderSource);
    }
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
  };

  const handleGenerate = async () => {
    if (!canGenerate()) {
      Alert.alert('Daily Limit Reached', 'Upgrade to Premium for unlimited generations.');
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

  const isFormValid = currentForm.source && currentForm.style;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Lumina</Text>
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

        {/* Image Input */}
        <View style={styles.section}>
          <ImageInputSection
            photoUri={photoUri}
            onPhotoSelected={handlePhotoSelected}
            onPhotoClear={handlePhotoClear}
          />
        </View>

        {/* Avatar Settings */}
        <View style={styles.section}>
          <AvatarSettingsSection
            selectedStyle={currentForm.style || null}
            onStyleSelect={handleStyleSelect}
            builderForm={builderForm}
            onBuilderChange={handleBuilderChange}
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
