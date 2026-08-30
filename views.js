// Reads state only, never mutates it — state changes happen exclusively via
// the `actions` callbacks wired up here.

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderLetterPills(state) {
  return state.allLetters.map(letter => {
    const active = state.filters.letters.has(letter);
    return `
      <label class="pill${active ? ' active' : ''}">
        <input type="checkbox" value="${letter}" ${active ? 'checked' : ''}>
        <span>${letter}</span>
      </label>
    `;
  }).join('');
}

function renderCountPills(state) {
  return state.questionCountOptions.map(n => {
    const active = state.questionCount === n;
    const disabled = n > state.bank.length;
    return `
      <label class="pill${active ? ' active' : ''}${disabled ? ' disabled' : ''}">
        <input type="radio" name="question-count" value="${n}" ${active ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
        <span>${n}</span>
      </label>
    `;
  }).join('');
}

function renderSetup(state) {
  const bankSize = state.bank.length;
  const canStart = bankSize >= 4;
  const hint = state.words.length === 0
    ? "Impossible de charger la liste de mots. Essaie de recharger la page."
    : canStart
      ? `${bankSize} mots disponibles avec ces réglages.`
      : "Pas assez de mots pour ces filtres. Essaie d'en sélectionner d'autres.";

  return `
    <div class="controls-panel" id="controls-panel">
      <div class="control-group" data-control="letter">
        <div class="control-group-header">
          <span class="control-label">Lettre initiale</span>
          <div class="control-actions">
            <button type="button" class="control-action" id="letter-select-all">Tout sélectionner</button>
            <button type="button" class="control-action" id="letter-select-none">Tout désélectionner</button>
          </div>
        </div>
        <div class="pill-group" id="letter-filter-group">${renderLetterPills(state)}</div>
      </div>
      <div class="control-group" data-control="count">
        <div class="control-group-header">
          <span class="control-label">Nombre de questions</span>
        </div>
        <div class="pill-group" id="count-filter-group">${renderCountPills(state)}</div>
      </div>
      <div class="control-group" data-control="none-mode">
        <div class="control-group-header">
          <span class="control-label">Mode « Aucune de ces trois »</span>
        </div>
        <div class="pill-group">
          <label class="pill${state.noneOfTheseMode ? ' active' : ''}">
            <input type="checkbox" id="none-mode-toggle" ${state.noneOfTheseMode ? 'checked' : ''}>
            <span>Activer</span>
          </label>
        </div>
      </div>
    </div>
    <div class="card setup-start">
      <div class="setup-hint">${hint}</div>
      <button class="next" id="start-btn" ${canStart ? '' : 'disabled'}>Commencer →</button>
    </div>
  `;
}

function renderQuiz(state) {
  const letters = ['A', 'B', 'C', 'D'];
  const options = state.current.options.map((o, i) => {
    let cls = 'option';
    let disabled = '';
    if (state.answered) {
      disabled = 'disabled';
      if (o.correct) cls += ' correct';
      else if (i === state.chosenIndex) cls += ' incorrect';
      else cls += ' dimmed';
    }
    return `
      <button class="${cls}" data-index="${i}" ${disabled}>
        <span class="letter">${letters[i]}</span>
        <span>${escapeHtml(o.text)}</span>
      </button>
    `;
  }).join('');

  let feedbackText = '';
  let feedbackClass = 'feedback-text';
  if (state.answered) {
    const chosen = state.current.options[state.chosenIndex];
    if (chosen.correct) {
      feedbackText = "✓ Exact.";
      feedbackClass += ' ok';
    } else {
      feedbackText = "✗ Ce n'était pas la bonne définition — regarde celle en vert.";
      feedbackClass += ' ko';
    }
  }

  const isLastQuestion = state.total >= state.quizLength;
  const nextLabel = isLastQuestion ? 'Voir les résultats →' : 'Question suivante →';

  return `
    <div class="stats-bar">
      <div class="stat"><b>${state.score}</b>Score</div>
      <div class="stat"><b>${state.total}</b>/ ${state.quizLength}</div>
      <div class="stat"><b>${state.streak}</b>Série</div>
    </div>
    <div class="card">
      <div class="qnum">Question ${state.total + 1} / ${state.quizLength}</div>
      <div class="word">${escapeHtml(state.current.item.word)}</div>
      <div class="instruction">Quelle est la définition correcte de ce mot ?</div>
      <div class="options" id="options-list">${options}</div>
      <div class="feedback-row">
        <div class="${feedbackClass}" id="feedback-text">${feedbackText}</div>
        <button class="next" id="next-btn" style="display:${state.answered ? 'inline-block' : 'none'};">${nextLabel}</button>
      </div>
    </div>
  `;
}

function renderFailedWords(state) {
  if (state.failedWords.length === 0) return '';
  return `
    <div class="review">
      <div class="control-label">Mots à revoir</div>
      <div class="review-list">
        ${state.failedWords.map(w => `
          <div class="review-item">
            <span class="review-word">${escapeHtml(w.word)}</span>
            <span class="review-def">${escapeHtml(w.correct)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderResults(state) {
  const pct = state.quizLength > 0 ? Math.round((state.score / state.quizLength) * 100) : 0;
  return `
    <div class="card results-card">
      <div class="qnum">Résultats</div>
      <div class="word">${state.score} / ${state.quizLength}</div>
      <div class="instruction">${pct}% de bonnes réponses</div>
      ${renderFailedWords(state)}
      <div class="feedback-row">
        <button class="next" id="play-again-btn">Rejouer →</button>
      </div>
    </div>
  `;
}

export function renderApp(container, state, actions) {
  if (!state.current && state.screen !== 'setup') {
    // Bank became too small mid-flow (shouldn't happen: filters are only
    // editable pre-quiz) — fall back to setup rather than showing a broken card.
    state.screen = 'setup';
  }

  if (state.screen === 'setup') {
    container.innerHTML = renderSetup(state);
    wireSetup(container, actions);
  } else if (state.screen === 'quiz') {
    container.innerHTML = renderQuiz(state);
    wireQuiz(container, state, actions);
  } else if (state.screen === 'results') {
    container.innerHTML = renderResults(state);
    wireResults(container, actions);
  }
}

function wireSetup(container, actions) {
  container.querySelectorAll('#letter-filter-group .pill input').forEach(input => {
    input.addEventListener('change', () => actions.toggleLetter(input.value));
  });
  container.querySelector('#letter-select-all').addEventListener('click', actions.selectAllLetters);
  container.querySelector('#letter-select-none').addEventListener('click', actions.selectNoneLetters);
  container.querySelectorAll('#count-filter-group .pill input').forEach(input => {
    input.addEventListener('change', () => actions.setQuestionCount(parseInt(input.value, 10)));
  });
  container.querySelector('#none-mode-toggle').addEventListener('change', actions.toggleNoneOfTheseMode);
  const startBtn = container.querySelector('#start-btn');
  if (!startBtn.disabled) startBtn.addEventListener('click', actions.startQuiz);
}

function wireQuiz(container, state, actions) {
  container.querySelectorAll('.option').forEach(btn => {
    btn.addEventListener('click', () => actions.answer(parseInt(btn.dataset.index, 10)));
  });
  const nextBtn = container.querySelector('#next-btn');
  if (state.answered) nextBtn.addEventListener('click', actions.next);
}

function wireResults(container, actions) {
  container.querySelector('#play-again-btn').addEventListener('click', actions.playAgain);
}
