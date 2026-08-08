import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PillToggleGroup } from '@/components/PillToggleGroup';
import { Colors, Fonts, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import {
  applyFilters,
  generateQuestion,
  startingLetter,
  type Question,
  type Word,
  type WordType,
} from '@/lib/quiz';
import { ALL_TYPES, ALL_WORDS } from '@/lib/words';

const TYPE_LABELS: Record<WordType, string> = {
  nom: 'Nom',
  adjectif: 'Adjectif',
  adverbe: 'Adverbe',
  verbe: 'Verbe',
};

const ALL_LETTERS = [...new Set(ALL_WORDS.map((w) => startingLetter(w.word)))].sort();

function toggleSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export default function VocabulaireScreen() {
  const [selectedTypes, setSelectedTypes] = useState<Set<WordType>>(new Set(ALL_TYPES));
  const [selectedLetters, setSelectedLetters] = useState<Set<string>>(new Set(ALL_LETTERS));
  const [answeredIndex, setAnsweredIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);

  const bank: Word[] = useMemo(
    () => applyFilters(ALL_WORDS, { types: selectedTypes, letters: selectedLetters }),
    [selectedTypes, selectedLetters]
  );

  // La question courante est dérivée de la banque filtrée. Quand `bank` change
  // (nouveaux filtres), on régénère une question directement pendant le rendu
  // plutôt que dans un effect, en suivant le pattern React recommandé pour
  // "ajuster un state quand une prop/dérivée change" (évite un rendu intermédiaire
  // avec l'ancienne question, et un aller-retour setState-dans-un-effect).
  const [prevBank, setPrevBank] = useState(bank);
  const [question, setQuestion] = useState<Question | null>(() => generateQuestion(bank));
  if (bank !== prevBank) {
    setPrevBank(bank);
    setQuestion(generateQuestion(bank));
    setAnsweredIndex(null);
  }

  function nextQuestion(currentBank: Word[]) {
    setQuestion(generateQuestion(currentBank));
    setAnsweredIndex(null);
  }

  function onAnswer(index: number) {
    if (!question || answeredIndex !== null) return;
    setAnsweredIndex(index);
    setTotal((t) => t + 1);
    if (question.options[index].correct) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  }

  const letters = 'ABCD';

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.page}>
          <View style={styles.statsBar}>
            <Stat label="Score" value={score} />
            <Stat label="Répondues" value={total} />
            <Stat label="Série" value={streak} />
          </View>

          <View style={styles.controlsPanel}>
            <PillToggleGroup
              label="Type de mot"
              options={ALL_TYPES.map((t) => ({ value: t, label: TYPE_LABELS[t] }))}
              selected={selectedTypes}
              onToggle={(v) => setSelectedTypes((s) => toggleSet(s, v))}
            />
            <PillToggleGroup
              label="Lettre initiale"
              options={ALL_LETTERS.map((l) => ({ value: l, label: l }))}
              selected={selectedLetters}
              onToggle={(v) => setSelectedLetters((s) => toggleSet(s, v))}
              onSelectAll={() => setSelectedLetters(new Set(ALL_LETTERS))}
              onSelectNone={() => setSelectedLetters(new Set())}
            />
          </View>

          {question ? (
            <View style={styles.card}>
              <Text style={styles.qnum}>Question {total + 1}</Text>
              <Text style={styles.word}>{question.item.word}</Text>
              <Text style={styles.instruction}>Quelle est la définition correcte de ce mot ?</Text>

              <View style={styles.options}>
                {question.options.map((opt, i) => {
                  const isAnswered = answeredIndex !== null;
                  const isChosen = answeredIndex === i;
                  const showCorrect = isAnswered && opt.correct;
                  const showIncorrect = isAnswered && isChosen && !opt.correct;
                  const dimmed = isAnswered && !opt.correct && !isChosen;
                  return (
                    <Pressable
                      key={i}
                      disabled={isAnswered}
                      onPress={() => onAnswer(i)}
                      style={[
                        styles.option,
                        showCorrect && styles.optionCorrect,
                        showIncorrect && styles.optionIncorrect,
                        dimmed && styles.optionDimmed,
                      ]}>
                      <Text style={styles.optionLetter}>{letters[i]}</Text>
                      <Text style={styles.optionText}>{opt.text}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.feedbackRow}>
                <Text
                  style={[
                    styles.feedbackText,
                    answeredIndex !== null &&
                      (question.options[answeredIndex].correct ? styles.ok : styles.ko),
                  ]}>
                  {answeredIndex === null
                    ? ''
                    : question.options[answeredIndex].correct
                      ? '✓ Exact.'
                      : "✗ Ce n'était pas la bonne définition — regarde celle en vert."}
                </Text>
                {answeredIndex !== null && (
                  <Pressable style={styles.nextButton} onPress={() => nextQuestion(bank)}>
                    <Text style={styles.nextButtonText}>Question suivante →</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.emptyState}>
                Pas assez de mots pour ces filtres. Essaie d&apos;en sélectionner d&apos;autres.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
  },
  page: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.four,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.five,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: Fonts.display,
    fontSize: 20,
    color: Colors.ink,
  },
  statLabel: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.inkSoft,
  },
  controlsPanel: {
    backgroundColor: Colors.paperElement,
    borderWidth: 1,
    borderColor: Colors.rule,
    borderRadius: Radius,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  card: {
    backgroundColor: Colors.paperElement,
    borderWidth: 1,
    borderColor: Colors.rule,
    borderRadius: Radius,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  qnum: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.gold,
  },
  word: {
    fontFamily: Fonts.display,
    fontSize: 34,
    color: Colors.burgundyDeep,
  },
  instruction: {
    fontFamily: Fonts.serif,
    fontStyle: 'italic',
    fontSize: 14,
    color: Colors.inkSoft,
    marginBottom: Spacing.two,
  },
  options: {
    gap: Spacing.two,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: Colors.rule,
    borderRadius: Radius,
    backgroundColor: Colors.paper,
    paddingVertical: 14,
    paddingHorizontal: Spacing.three,
  },
  optionCorrect: {
    borderColor: Colors.green,
    backgroundColor: Colors.greenBg,
  },
  optionIncorrect: {
    borderColor: Colors.red,
    backgroundColor: Colors.redBg,
  },
  optionDimmed: {
    opacity: 0.55,
  },
  optionLetter: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    color: Colors.gold,
  },
  optionText: {
    fontFamily: Fonts.serif,
    fontSize: 16,
    color: Colors.ink,
    flexShrink: 1,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
    marginTop: Spacing.two,
  },
  feedbackText: {
    fontFamily: Fonts.mono,
    fontSize: 13,
    flexShrink: 1,
  },
  ok: { color: Colors.green },
  ko: { color: Colors.red },
  nextButton: {
    backgroundColor: Colors.burgundy,
    borderRadius: Radius,
    paddingVertical: 12,
    paddingHorizontal: Spacing.three,
  },
  nextButtonText: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.paper,
  },
  emptyState: {
    fontFamily: Fonts.serif,
    fontStyle: 'italic',
    fontSize: 14,
    color: Colors.inkSoft,
    textAlign: 'center',
    paddingVertical: Spacing.four,
  },
});
