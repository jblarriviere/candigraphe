import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';

export type PillOption<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  label: string;
  options: PillOption<T>[];
  selected: Set<T>;
  onToggle: (value: T) => void;
  onSelectAll?: () => void;
  onSelectNone?: () => void;
};

// Groupe de "pills" à bascule, réutilisé pour tous les contrôles de filtre
// (type de mot, lettre initiale, et ce qui viendra plus tard).
export function PillToggleGroup<T extends string>({
  label,
  options,
  selected,
  onToggle,
  onSelectAll,
  onSelectNone,
}: Props<T>) {
  return (
    <View style={styles.group}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {(onSelectAll || onSelectNone) && (
          <View style={styles.actions}>
            {onSelectAll && (
              <Pressable onPress={onSelectAll} hitSlop={6}>
                <Text style={styles.action}>Tout sélectionner</Text>
              </Pressable>
            )}
            {onSelectNone && (
              <Pressable onPress={onSelectNone} hitSlop={6}>
                <Text style={styles.action}>Tout désélectionner</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
      <View style={styles.pillRow}>
        {options.map((opt) => {
          const active = selected.has(opt.value);
          return (
            <Pressable
              key={opt.value}
              onPress={() => onToggle(opt.value)}
              style={[styles.pill, active && styles.pillActive]}>
              <Text style={[styles.pillText, active && styles.pillTextActive]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.three,
  },
  label: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.inkSoft,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  action: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.inkSoft,
    textDecorationLine: 'underline',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  pill: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.rule,
    backgroundColor: Colors.paper,
  },
  pillActive: {
    borderColor: Colors.burgundy,
    backgroundColor: 'rgba(122,46,46,0.08)',
  },
  pillText: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.inkSoft,
  },
  pillTextActive: {
    color: Colors.ink,
  },
});
