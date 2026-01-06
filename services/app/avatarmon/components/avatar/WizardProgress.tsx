import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { useColor } from '@/hooks/useColor';
import { WizardStep } from '@/types/avatar';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

interface WizardProgressProps {
  currentStep: WizardStep;
}

const STEPS: { key: WizardStep; label: string }[] = [
  { key: 'upload', label: 'Photos' },
  { key: 'style', label: 'Style' },
  { key: 'generating', label: 'Generate' },
  { key: 'results', label: 'Result' },
];

export function WizardProgress({ currentStep }: WizardProgressProps) {
  const primaryColor = useColor('primary');
  const mutedColor = useColor('textMuted');
  const borderColor = useColor('border');

  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <View style={styles.container}>
      {STEPS.map((step, index) => {
        const isActive = index <= currentIndex;
        const isCurrent = step.key === currentStep;

        return (
          <View key={step.key} style={styles.stepContainer}>
            <View style={styles.stepRow}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: isActive ? primaryColor : borderColor,
                    transform: [{ scale: isCurrent ? 1.2 : 1 }],
                  },
                ]}
              />
              {index < STEPS.length - 1 && (
                <View
                  style={[
                    styles.line,
                    {
                      backgroundColor: index < currentIndex ? primaryColor : borderColor,
                    },
                  ]}
                />
              )}
            </View>
            <Text
              variant="caption"
              style={[
                styles.label,
                { color: isActive ? primaryColor : mutedColor },
              ]}
            >
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  line: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
  },
  label: {
    marginTop: 6,
    fontSize: 12,
    textAlign: 'center',
  },
});
