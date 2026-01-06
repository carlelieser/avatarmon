import { useReducer, useState, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColor } from '@/hooks/useColor';
import { useGeneration } from '@/hooks/useGeneration';
import { useExport } from '@/hooks/useExport';
import { useSubscription } from '@/hooks/useSubscription';
import {
  Style,
  WizardState,
  WizardAction,
  initialWizardState,
  wizardReducer,
} from '@/types/avatar';

import { WizardProgress } from './WizardProgress';
import { PhotoUploadSection } from './PhotoUploadSection';
import { StyleSelectionSection } from './StyleSelectionSection';
import { GenerationSection } from './GenerationSection';
import { ResultsSection } from './ResultsSection';
import { SubscriptionBanner } from './SubscriptionBanner';
import { Paywall } from './Paywall';

export function AvatarWizard() {
  const backgroundColor = useColor('background');

  const [state, dispatch] = useReducer(wizardReducer, initialWizardState);
  const [paywallVisible, setPaywallVisible] = useState(false);

  const {
    generate,
    cancel,
    status,
    imageUrl,
    error: generationError,
    isGenerating,
  } = useGeneration();

  const {
    saveToDevice,
    shareImage,
    isSaving,
    isSharing,
  } = useExport();

  const {
    isPremium,
    generationsRemaining,
    canGenerate,
    incrementGenerations,
  } = useSubscription();

  // Photo handlers
  const handleAddPhoto = useCallback((base64: string) => {
    dispatch({ type: 'ADD_PHOTO', payload: base64 });
  }, []);

  const handleRemovePhoto = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_PHOTO', payload: index });
  }, []);

  // Style handlers
  const handleSelectStyle = useCallback((style: Style) => {
    dispatch({ type: 'SELECT_STYLE', payload: style });
  }, []);

  const handleAddModification = useCallback((mod: string) => {
    dispatch({ type: 'ADD_MODIFICATION', payload: mod });
  }, []);

  const handleRemoveModification = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_MODIFICATION', payload: index });
  }, []);

  // Navigation
  const handleContinueToStyle = useCallback(() => {
    dispatch({ type: 'GO_TO_STEP', payload: 'style' });
  }, []);

  const handleBackToUpload = useCallback(() => {
    dispatch({ type: 'GO_TO_STEP', payload: 'upload' });
  }, []);

  // Generation
  const handleGenerate = useCallback(async () => {
    if (!state.selectedStyle) return;

    if (!canGenerate) {
      setPaywallVisible(true);
      return;
    }

    dispatch({ type: 'GO_TO_STEP', payload: 'generating' });

    const result = await generate({
      style: state.selectedStyle,
      references: state.photos,
      modifications: state.modifications,
    });

    if (result) {
      dispatch({ type: 'GENERATION_COMPLETE', payload: result });
      if (!isPremium) {
        incrementGenerations();
      }
    } else if (generationError) {
      dispatch({
        type: 'GENERATION_FAILED',
        payload: generationError,
      });
    }
  }, [
    state.selectedStyle,
    state.photos,
    state.modifications,
    canGenerate,
    generate,
    isPremium,
    incrementGenerations,
    generationError,
  ]);

  const handleCancel = useCallback(async () => {
    await cancel();
    dispatch({ type: 'CANCEL_GENERATION' });
  }, [cancel]);

  // Results handlers
  const handleSave = useCallback(async () => {
    if (!imageUrl) return;

    const success = await saveToDevice(imageUrl);
    if (success) {
      Alert.alert('Saved!', 'Your avatar has been saved to your photo library.');
    }
  }, [imageUrl, saveToDevice]);

  const handleShare = useCallback(async () => {
    if (!imageUrl) return;
    await shareImage(imageUrl);
  }, [imageUrl, shareImage]);

  const handleRegenerate = useCallback(() => {
    dispatch({ type: 'GO_TO_STEP', payload: 'style' });
  }, []);

  const renderStep = () => {
    switch (state.step) {
      case 'upload':
        return (
          <PhotoUploadSection
            photos={state.photos}
            onAddPhoto={handleAddPhoto}
            onRemovePhoto={handleRemovePhoto}
            onContinue={handleContinueToStyle}
          />
        );

      case 'style':
        return (
          <StyleSelectionSection
            selectedStyle={state.selectedStyle}
            modifications={state.modifications}
            onSelectStyle={handleSelectStyle}
            onAddModification={handleAddModification}
            onRemoveModification={handleRemoveModification}
            onBack={handleBackToUpload}
            onGenerate={handleGenerate}
            canGenerate={canGenerate}
            isLoading={isGenerating}
          />
        );

      case 'generating':
        return (
          <GenerationSection
            status={status}
            onCancel={handleCancel}
            error={generationError}
          />
        );

      case 'results':
        return imageUrl ? (
          <ResultsSection
            imageUrl={imageUrl}
            onSave={handleSave}
            onShare={handleShare}
            onRegenerate={handleRegenerate}
            isSaving={isSaving}
            isSharing={isSharing}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={['top', 'bottom']}
    >
      <WizardProgress currentStep={state.step} />

      {state.step !== 'generating' && state.step !== 'results' && (
        <SubscriptionBanner
          isPremium={isPremium}
          generationsRemaining={generationsRemaining}
          onUpgrade={() => setPaywallVisible(true)}
        />
      )}

      <View style={styles.content}>{renderStep()}</View>

      <Paywall
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
