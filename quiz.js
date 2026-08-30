export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Prefer distractors of the same grammatical type so the answer can't be
// guessed by elimination; fall back to the full bank if there aren't enough.
export function buildQuestion(bank) {
  const item = bank[Math.floor(Math.random() * bank.length)];

  const pool = bank.filter(w => w.word !== item.word);
  const sameTypePool = item.type ? pool.filter(w => w.type === item.type) : [];
  const distractorPool = sameTypePool.length >= 3 ? sameTypePool : pool;
  const wrongDefs = shuffle(distractorPool).slice(0, 3).map(w => w.correct);

  const options = shuffle([
    { text: item.correct, correct: true },
    ...wrongDefs.map(d => ({ text: d, correct: false }))
  ]);

  return { item, options };
}
