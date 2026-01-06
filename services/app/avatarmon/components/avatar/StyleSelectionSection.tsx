import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { StyleCard } from './StyleCard';
import { ModificationInput } from './ModificationInput';
import { Style } from '@/types/avatar';
import { STYLES } from '@/constants/styles';
import { ChevronLeft } from 'lucide-react-native';

interface StyleSelectionSectionProps {
  selectedStyle: Style | null;
  modifications: string[];
  onSelectStyle: (style: Style) => void;
  onAddModification: (mod: string) => void;
  onRemoveModification: (index: number) => void;
  onBack: () => void;
  onGenerate: () => void;
  canGenerate: boolean;
  isLoading?: boolean;
}

export function StyleSelectionSection({
  selectedStyle,
  modifications,
  onSelectStyle,
  onAddModification,
  onRemoveModification,
  onBack,
  onGenerate,
  canGenerate,
  isLoading = false,
}: StyleSelectionSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          variant="ghost"
          size="icon"
          icon={ChevronLeft}
          onPress={onBack}
        />
        <Text variant="title" style={styles.title}>
          Choose Style
        </Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="caption" style={styles.description}>
          Select an art style for your avatar. Your likeness will be preserved.
        </Text>

        <View style={styles.grid}>
          {STYLES.map((style) => (
            <StyleCard
              key={style.id}
              style={style}
              isSelected={selectedStyle === style.id}
              onSelect={() => onSelectStyle(style.id)}
            />
          ))}
        </View>

        <ModificationInput
          modifications={modifications}
          onAdd={onAddModification}
          onRemove={onRemoveModification}
        />

        <View style={styles.footer}>
          <Button
            onPress={onGenerate}
            disabled={!selectedStyle || !canGenerate}
            loading={isLoading}
          >
            Generate Avatar
          </Button>
          {!canGenerate && (
            <Text variant="caption" style={styles.upgradeHint}>
              Upgrade to Premium for unlimited generations
            </Text>
          )}
        </View>
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
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  spacer: {
    width: 48,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 120,
  },
  description: {
    marginBottom: 20,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  footer: {
    padding: 20,
    paddingTop: 12,
  },
  upgradeHint: {
    textAlign: 'center',
    marginTop: 8,
  },
});
