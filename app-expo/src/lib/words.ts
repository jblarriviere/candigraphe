import wordsData from '@/assets/data/words_list.json';
import type { Word } from '@/lib/quiz';

export const ALL_WORDS: Word[] = wordsData.data as Word[];

export const ALL_TYPES: Word['type'][] = ['nom', 'adjectif', 'adverbe', 'verbe'];
