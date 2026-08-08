export type WordType = 'nom' | 'adjectif' | 'adverbe' | 'verbe';

export type Word = {
  word: string;
  type: WordType;
  correct: string;
};

export type Filters = {
  types: Set<WordType>;
  letters: Set<string>;
};

export type Option = {
  text: string;
  correct: boolean;
};

export type Question = {
  item: Word;
  options: Option[];
};

// Lettre initiale normalisée (sans accent) d'un mot, ex. "ÉPARS" -> "E".
export function startingLetter(word: string): string {
  return word.normalize('NFD').replace(/[\u0300-\u036f]/g, '')[0]?.toUpperCase() ?? '';
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function applyFilters(words: Word[], filters: Filters): Word[] {
  return words.filter(
    (w) => filters.types.has(w.type) && filters.letters.has(startingLetter(w.word))
  );
}

// Génère une question : le mot cible + 4 options mélangées (1 correcte, 3 fausses).
// Les fausses définitions sont piochées en priorité parmi les mots de même type
// grammatical, pour ne pas trahir la réponse par élimination de genre ; si la
// banque n'en contient pas assez, on retombe sur l'ensemble de la banque filtrée.
export function generateQuestion(bank: Word[]): Question | null {
  if (bank.length < 4) return null;
  const item = bank[Math.floor(Math.random() * bank.length)];

  const pool = bank.filter((w) => w.word !== item.word);
  const sameTypePool = pool.filter((w) => w.type === item.type);
  const distractorPool = sameTypePool.length >= 3 ? sameTypePool : pool;
  const wrongDefs = shuffle(distractorPool)
    .slice(0, 3)
    .map((w) => w.correct);

  const options = shuffle([
    { text: item.correct, correct: true },
    ...wrongDefs.map((d) => ({ text: d, correct: false })),
  ]);

  return { item, options };
}
