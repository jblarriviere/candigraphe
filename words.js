// Strip accents so filtering by first letter works regardless of diacritics.
export function startingLetter(word) {
  return word.normalize('NFD').replace(/[\u0300-\u036f]/g, '')[0].toUpperCase();
}

export async function loadWords(url) {
  try {
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    console.error("Impossible de charger words_list.json :", e);
    return [];
  }
}

export function buildBank(words, filters) {
  return words.filter(w =>
    filters.types.has(w.type) && filters.letters.has(startingLetter(w.word))
  );
}
