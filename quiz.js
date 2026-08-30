export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const NONE_OF_THOSE_LABEL = "Aucune de ces trois";

// Prefer distractors of the same grammatical type so the answer can't be
// guessed by elimination; fall back to the full bank if there aren't enough.
function pickDistractors(item, bank, count) {
  const pool = bank.filter(w => w.word !== item.word);
  const sameTypePool = item.type ? pool.filter(w => w.type === item.type) : [];
  const distractorPool = sameTypePool.length >= count ? sameTypePool : pool;
  return shuffle(distractorPool).slice(0, count).map(w => w.correct);
}

// `item` is the word to ask about (chosen by the caller so a run can avoid
// repeats); `bank` is only the pool distractors are drawn from. When
// `noneMode` is on, the last option's text is swapped for "Aucune de ces
// trois" after the normal shuffle
export function buildQuestion(item, bank, noneMode) {
  const wrongDefs = pickDistractors(item, bank, 3);
  const options = shuffle([
    { text: item.correct, correct: true },
    ...wrongDefs.map(d => ({ text: d, correct: false }))
  ]);

  if (noneMode) {
    options[3] = { text: NONE_OF_THOSE_LABEL, correct: options[3].correct };
  }

  return { item, options };
}
