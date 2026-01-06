import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useColor } from '@/hooks/useColor';
import { BORDER_RADIUS } from '@/theme/globals';
import { PredictionStatus } from '@/types/avatar';
import { X } from 'lucide-react-native';

interface GenerationSectionProps {
  status: PredictionStatus | null;
  onCancel: () => void;
  error?: string | null;
}

const STATUS_MESSAGES: Record<PredictionStatus, string> = {
  starting: 'Initializing generation...',
  processing: 'Creating your avatar...',
  succeeded: 'Generation complete!',
  failed: 'Generation failed',
  canceled: 'Generation canceled',
};

export function GenerationSection({
  status,
  onCancel,
  error,
}: GenerationSectionProps) {
  const cardColor = useColor('card');
  const textColor = useColor('text');
  const mutedColor = useColor('textMuted');

  const message = status ? STATUS_MESSAGES[status] : 'Starting...';
  const isProcessing = status === 'starting' || status === 'processing';

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <Spinner
          size="lg"
          variant="circle"
          speed="normal"
          style={styles.spinner}
        />

        <Text variant="title" style={styles.title}>
          {message}
        </Text>

        <Text variant="caption" style={styles.description}>
          This may take 1-3 minutes. Your avatar is being crafted with care.
        </Text>

        {error && (
          <Text variant="caption" style={styles.error}>
            {error}
          </Text>
        )}

        <View style={styles.progress}>
          <View style={styles.progressDots}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  { backgroundColor: mutedColor + '40' },
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      {isProcessing && (
        <Button
          variant="destructive"
          icon={X}
          onPress={onCancel}
          style={styles.cancelButton}
        >
          Cancel Generation
        </Button>
      )}

      <Text variant="caption" style={styles.hint}>
        You can cancel at any time. This won't count towards your generations.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    borderRadius: BORDER_RADIUS,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  spinner: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  progress: {
    width: '100%',
    alignItems: 'center',
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cancelButton: {
    marginBottom: 16,
  },
  hint: {
    textAlign: 'center',
  },
});
