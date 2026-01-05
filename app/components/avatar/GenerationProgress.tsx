import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useColor } from '@/hooks/useColor';
import { BORDER_RADIUS, FONTS } from '@/theme/globals';
import type { GenerationStatus } from '@/schemas/api';

interface GenerationProgressProps {
  status: GenerationStatus;
  progress: number;
  estimatedSeconds?: number;
  onCancel?: () => void;
  testID?: string;
}

const STATUS_LABELS: Record<GenerationStatus, string> = {
  queued: 'Queued',
  processing: 'Generating',
  completed: 'Complete',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

export function GenerationProgress({
  status,
  progress,
  estimatedSeconds,
  onCancel,
  testID,
}: GenerationProgressProps) {
  const backgroundColor = useColor('backgroundSecondary');
  const primaryColor = useColor('primary');
  const textColor = useColor('text');
  const mutedColor = useColor('textMuted');
  const destructiveColor = useColor('destructive');

  const isActive = status === 'queued' || status === 'processing';
  const isFailed = status === 'failed' || status === 'cancelled';

  const pulseStyle = useAnimatedStyle(() => {
    if (!isActive) return { opacity: 1 };
    return {
      opacity: withRepeat(
        withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      ),
    };
  });

  const progressBarStyle = useAnimatedStyle(() => ({
    width: withTiming(`${progress}%`, { duration: 300 }),
  }));

  return (
    <View testID={testID} style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Animated.View style={[styles.statusDot, pulseStyle]}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor: isFailed ? destructiveColor : primaryColor,
              },
            ]}
          />
        </Animated.View>
        <Text style={[styles.statusText, { color: textColor }]}>
          {STATUS_LABELS[status]}
        </Text>
        {isActive && onCancel && (
          <Pressable onPress={onCancel} style={styles.cancelButton}>
            <Text style={[styles.cancelText, { color: destructiveColor }]}>
              Cancel
            </Text>
          </Pressable>
        )}
      </View>

      {isActive && (
        <>
          <View style={styles.progressContainer}>
            <View style={[styles.progressTrack, { backgroundColor: mutedColor }]}>
              <Animated.View
                style={[
                  styles.progressBar,
                  { backgroundColor: primaryColor },
                  progressBarStyle,
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: mutedColor }]}>
              {Math.round(progress)}%
            </Text>
          </View>

          {estimatedSeconds !== undefined && estimatedSeconds > 0 && (
            <Text style={[styles.estimateText, { color: mutedColor }]}>
              About {estimatedSeconds}s remaining
            </Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
    borderRadius: BORDER_RADIUS,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    marginRight: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  cancelButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  cancelText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    marginLeft: 8,
    width: 40,
    textAlign: 'right',
  },
  estimateText: {
    fontSize: 12,
    marginTop: 8,
  },
});
