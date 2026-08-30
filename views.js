// Reads state only, never mutates it — state changes happen exclusively via
// the `actions` callbacks wired up here.

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderTypePills(state) {
  const types = [
    ['nom', 'Nom'],
    ['adjectif', 'Adjectif'],
    ['adverbe', 'Adverbe'],
    ['verbe', 'Verbe'],
  ];
  return types.map(([value, label]) => {
    const active = state.filters.types.has(value);
    return `
      <label class="pill${active ? ' active' : ''}">
        <input type="checkbox" value="${value}" ${active ? 'checked' : ''}>
        <span>${label}</span>
      </label>
    `;
  }).join('');
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

function renderControlsPanel(state) {
  return `
    <div class="controls-panel" id="controls-panel">
      <div class="control-group" data-control="type">
        <div class="control-group-header">
          <span class="control-label">Type de mot</span>
        </div>
        <div class="pill-group" id="type-filter-group">${renderTypePills(state)}</div>
      </div>
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
    </div>
  `;
}

function renderQuizArea(state) {
  if (!state.current) {
    const message = state.words.length === 0
      ? "Impossible de charger la liste de mots. Essaie de recharger la page."
      : "Pas assez de mots pour ces filtres. Essaie d'en sélectionner d'autres.";
    return `<div class="card"><div class="empty-state">${message}</div></div>`;
  }

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

  return `
    <div class="card">
      <div class="qnum">Question ${state.total + 1}</div>
      <div class="word">${escapeHtml(state.current.item.word)}</div>
      <div class="instruction">Quelle est la définition correcte de ce mot ?</div>
      <div class="options" id="options-list">${options}</div>
      <div class="feedback-row">
        <div class="${feedbackClass}" id="feedback-text">${feedbackText}</div>
        <button class="next" id="next-btn" style="display:${state.answered ? 'inline-block' : 'none'};">Question suivante →</button>
      </div>
    </div>
  `;
}

export function renderApp(container, state, actions) {
  container.innerHTML = `
    <div class="stats-bar">
      <div class="stat"><b id="stat-score">${state.score}</b>Score</div>
      <div class="stat"><b id="stat-total">${state.total}</b>Répondues</div>
      <div class="stat"><b id="stat-streak">${state.streak}</b>Série</div>
    </div>
    ${renderControlsPanel(state)}
    <div id="quiz-area">${renderQuizArea(state)}</div>
  `;

  container.querySelectorAll('#type-filter-group .pill input').forEach(input => {
    input.addEventListener('change', () => actions.toggleType(input.value));
  });
  container.querySelectorAll('#letter-filter-group .pill input').forEach(input => {
    input.addEventListener('change', () => actions.toggleLetter(input.value));
  });
  container.querySelector('#letter-select-all').addEventListener('click', actions.selectAllLetters);
  container.querySelector('#letter-select-none').addEventListener('click', actions.selectNoneLetters);

  if (state.current) {
    container.querySelectorAll('.option').forEach(btn => {
      btn.addEventListener('click', () => actions.answer(parseInt(btn.dataset.index, 10)));
    });
    container.querySelector('#next-btn').addEventListener('click', actions.next);
  }
}
