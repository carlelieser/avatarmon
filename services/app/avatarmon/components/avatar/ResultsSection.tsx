import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useColor } from '@/hooks/useColor';
import { BORDER_RADIUS } from '@/theme/globals';
import { Download, Share2, RefreshCw } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = width - 80;

interface ResultsSectionProps {
  imageUrl: string;
  onSave: () => void;
  onShare: () => void;
  onRegenerate: () => void;
  isSaving: boolean;
  isSharing: boolean;
}

export function ResultsSection({
  imageUrl,
  onSave,
  onShare,
  onRegenerate,
  isSaving,
  isSharing,
}: ResultsSectionProps) {
  const cardColor = useColor('card');
  const primaryColor = useColor('primary');

  return (
    <View style={styles.container}>
      <Text variant="title" style={styles.title}>
        Your Avatar
      </Text>

      <View style={[styles.imageContainer, { backgroundColor: cardColor }]}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <View style={styles.actions}>
        <Button
          variant="default"
          icon={Download}
          onPress={onSave}
          loading={isSaving}
          disabled={isSaving || isSharing}
          style={styles.actionButton}
        >
          Save
        </Button>

        <Button
          variant="outline"
          icon={Share2}
          onPress={onShare}
          loading={isSharing}
          disabled={isSaving || isSharing}
          style={styles.actionButton}
        >
          Share
        </Button>
      </View>

      <Button
        variant="secondary"
        icon={RefreshCw}
        onPress={onRegenerate}
        disabled={isSaving || isSharing}
        style={styles.regenerateButton}
      >
        Try Different Style
      </Button>

      <Text variant="caption" style={styles.hint}>
        Love your avatar? Save it before generating a new one!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    marginBottom: 20,
  },
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    width: '100%',
  },
  actionButton: {
    flex: 1,
  },
  regenerateButton: {
    width: '100%',
    marginBottom: 16,
  },
  hint: {
    textAlign: 'center',
  },
});
