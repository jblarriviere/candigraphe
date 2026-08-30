// Every state change flows through an action, which always ends by calling
// render() — the single point of entry into the DOM.

import { loadWords, buildBank, startingLetter } from './words.js';
import { buildQuestion } from './quiz.js';
import { renderApp } from './views.js';

const QUESTION_COUNT_OPTIONS = [10, 20, 30, 50];

export const state = {
  screen: 'setup', // 'setup' | 'quiz' | 'results'
  filters: {
    types: new Set(['nom', 'adjectif', 'adverbe', 'verbe']),
    letters: new Set(), // populated once words are loaded
  },
  allLetters: [],
  words: [],
  bank: [],
  questionCountOptions: QUESTION_COUNT_OPTIONS,
  questionCount: QUESTION_COUNT_OPTIONS[0],
  quizLength: null, // questionCount snapshotted when the game started
  current: null,
  answered: false,
  chosenIndex: null,
  score: 0,
  total: 0,
  streak: 0,
};

let container = null;

function render() {
  renderApp(container, state, actions);
}

function rebuildBank() {
  state.bank = buildBank(state.words, state.filters);
}

function newQuestion() {
  state.answered = false;
  state.chosenIndex = null;
  state.current = state.bank.length >= 4 ? buildQuestion(state.bank) : null;
}

export const actions = {
  toggleType(type) {
    if (state.filters.types.has(type)) state.filters.types.delete(type);
    else state.filters.types.add(type);
    rebuildBank();
    render();
  },

  toggleLetter(letter) {
    if (state.filters.letters.has(letter)) state.filters.letters.delete(letter);
    else state.filters.letters.add(letter);
    rebuildBank();
    render();
  },

  selectAllLetters() {
    state.filters.letters = new Set(state.allLetters);
    rebuildBank();
    render();
  },

  selectNoneLetters() {
    state.filters.letters.clear();
    rebuildBank();
    render();
  },

  setQuestionCount(n) {
    state.questionCount = n;
    render();
  },

  startQuiz() {
    rebuildBank();
    state.quizLength = state.questionCount;
    state.score = 0;
    state.total = 0;
    state.streak = 0;
    state.screen = 'quiz';
    newQuestion();
    render();
  },

  answer(index) {
    if (state.answered || !state.current) return;
    state.answered = true;
    state.chosenIndex = index;
    state.total++;
    const chosen = state.current.options[index];
    if (chosen.correct) {
      state.score++;
      state.streak++;
    } else {
      state.streak = 0;
    }
    render();
  },

  next() {
    if (state.total >= state.quizLength) {
      state.screen = 'results';
    } else {
      newQuestion();
    }
    render();
  },

  playAgain() {
    actions.startQuiz();
  },

  newSettings() {
    state.screen = 'setup';
    render();
  },
};

export async function init(rootEl) {
  container = rootEl;

  state.words = await loadWords('words_list.json');
  state.allLetters = [...new Set(state.words.map(w => startingLetter(w.word)))].sort();
  state.filters.letters = new Set(state.allLetters);

  rebuildBank();
  render();
}
