import { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useColor } from '@/hooks/useColor';
import { CORNERS } from '@/theme/globals';
import { Plus, X, Wand2 } from 'lucide-react-native';

interface ModificationInputProps {
  modifications: string[];
  onAdd: (mod: string) => void;
  onRemove: (index: number) => void;
}

const SUGGESTIONS = [
  'blue eyes',
  'glasses',
  'beard',
  'earrings',
  'headphones',
  'hat',
];

export function ModificationInput({
  modifications,
  onAdd,
  onRemove,
}: ModificationInputProps) {
  const [inputValue, setInputValue] = useState('');
  const cardColor = useColor('card');
  const borderColor = useColor('border');
  const primaryColor = useColor('primary');
  const mutedColor = useColor('textMuted');

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !modifications.includes(trimmed)) {
      onAdd(trimmed);
      setInputValue('');
    }
  };

  const handleSuggestion = (suggestion: string) => {
    if (!modifications.includes(suggestion)) {
      onAdd(suggestion);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name={Wand2} size={18} color={mutedColor} />
        <Text variant="subtitle" style={styles.headerText}>
          Customizations
        </Text>
      </View>

      <Text variant="caption" style={styles.description}>
        Add custom modifications to personalize your avatar (optional)
      </Text>

      <View style={styles.inputRow}>
        <Input
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="e.g., blue eyes, glasses..."
          containerStyle={styles.input}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <Button
          size="icon"
          icon={Plus}
          onPress={handleAdd}
          disabled={!inputValue.trim()}
        />
      </View>

      {modifications.length > 0 && (
        <View style={styles.chips}>
          {modifications.map((mod, index) => (
            <Pressable
              key={index}
              onPress={() => onRemove(index)}
              style={[
                styles.chip,
                { backgroundColor: primaryColor + '20', borderColor: primaryColor },
              ]}
            >
              <Text style={[styles.chipText, { color: primaryColor }]}>
                {mod}
              </Text>
              <Icon name={X} size={14} color={primaryColor} />
            </Pressable>
          ))}
        </View>
      )}

      <Text variant="caption" style={styles.suggestionsLabel}>
        Suggestions:
      </Text>
      <View style={styles.suggestions}>
        {SUGGESTIONS.filter((s) => !modifications.includes(s)).map(
          (suggestion) => (
            <Pressable
              key={suggestion}
              onPress={() => handleSuggestion(suggestion)}
              style={[
                styles.suggestion,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <Text variant="caption">{suggestion}</Text>
            </Pressable>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  headerText: {
    fontSize: 17,
  },
  description: {
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: CORNERS,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  suggestionsLabel: {
    marginBottom: 8,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestion: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: CORNERS,
    borderWidth: 1,
  },
});
