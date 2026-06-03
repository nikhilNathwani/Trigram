import { firebaseConfig, AUTHORIZED_UID } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getFirestore, collection, doc, setDoc, getDocs, deleteDoc, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// ── Constants ────────────────────────────────────────────────
const LENGTH_ORDER = ['4', '5', '15', '14', '13', '6', '7', '8', '9', '10', '11', '12'];
const VOWELS = ['A', 'E', 'I', 'O', 'U'];
const GAME_START = new Date('2024-04-15');

// ── State ────────────────────────────────────────────────────
const S = {
  allTrigrams: [],     // string[] — from trigrams.txt
  doneTrigrams: null,  // Set<string> — from trigram_calendar.json
  calendarData: [],    // string[] — ordered list for calendar view
  labels: {},          // { TRI: { label, comment, labeledAt } }
  queue: [],           // shuffled unlabeled trigrams
  queueIndex: 0,
  wordCache: {},       // { TRI: { "4": [...], ... } }
  reviewFilter: 'ALL',
};

// ── Firebase ─────────────────────────────────────────────────
const fbApp = initializeApp(firebaseConfig);
const auth  = getAuth(fbApp);
const db    = getFirestore(fbApp);
const provider = new GoogleAuthProvider();

// ── DOM helpers ──────────────────────────────────────────────
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

function mk(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'className') e.className = v;
    else if (k === 'onclick') e.onclick = v;
    else e.setAttribute(k, v);
  }
  for (const c of children) {
    e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return e;
}

// ── Auth ─────────────────────────────────────────────────────
$('#sign-in-btn').onclick = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    $('#auth-error').textContent = 'Sign-in failed. Please try again.';
  }
};

$('#sign-out-btn').onclick = () => signOut(auth);

// ── Data Loading ─────────────────────────────────────────────
async function loadTrigrams() {
  const res = await fetch('/tools/label/trigrams.txt');
  const text = await res.text();
  S.allTrigrams = text.split('\n').map(t => t.trim().toUpperCase()).filter(Boolean);
}

async function loadCalendar() {
  const res = await fetch('/data/trigram_calendar.json');
  S.calendarData = await res.json();
  S.doneTrigrams = new Set(S.calendarData.map(t => t.toUpperCase()));
}

async function loadLabels() {
  const snap = await getDocs(collection(db, 'trigrams'));
  S.labels = {};
  snap.forEach(d => { S.labels[d.id] = d.data(); });
}

async function initApp() {
  await Promise.all([loadTrigrams(), loadCalendar(), loadLabels()]);
  buildQueue();
  navigate('queue');
}

// ── Queue ────────────────────────────────────────────────────
function buildQueue() {
  const labeled = new Set(Object.keys(S.labels));
  const unlabeled = S.allTrigrams.filter(t => !labeled.has(t) && !S.doneTrigrams.has(t));
  // Fisher-Yates shuffle
  for (let i = unlabeled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unlabeled[i], unlabeled[j]] = [unlabeled[j], unlabeled[i]];
  }
  S.queue = unlabeled;
  S.queueIndex = 0;
}

function advanceQueue() {
  S.queueIndex++;
  // skip any trigrams labeled mid-session via Search
  while (
    S.queueIndex < S.queue.length &&
    (S.labels[S.queue[S.queueIndex]] || S.doneTrigrams.has(S.queue[S.queueIndex]))
  ) { S.queueIndex++; }
  renderQueue();
}

// ── Firestore ────────────────────────────────────────────────
async function saveLabel(trigram, label, comment) {
  const data = { label, comment: comment || '', labeledAt: serverTimestamp() };
  await setDoc(doc(db, 'trigrams', trigram), data);
  S.labels[trigram] = { ...data, labeledAt: new Date() };
}

async function removeLabel(trigram) {
  await deleteDoc(doc(db, 'trigrams', trigram));
  delete S.labels[trigram];
}

// ── Word List ────────────────────────────────────────────────
async function loadWordList(trigram) {
  if (S.wordCache[trigram]) return S.wordCache[trigram];
  try {
    const res = await fetch(`/data/trigram-word-lists/${trigram.toLowerCase()}_words.json`);
    if (!res.ok) return null;
    const data = await res.json();
    S.wordCache[trigram] = data;
    return data;
  } catch { return null; }
}

// ── Navigation ───────────────────────────────────────────────
function navigate(view) {
  $$('.view').forEach(v => { v.hidden = true; });
  $(`#view-${view}`).hidden = false;
  $$('#bottom-nav button').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  const titles = { queue: 'Label', search: 'Search', review: 'Review', calendar: 'Calendar', stats: 'Stats' };
  $('#view-title').textContent = titles[view];

  if (view === 'queue')    renderQueue();
  if (view === 'review')   renderReview();
  if (view === 'calendar') renderCalendar();
  if (view === 'stats')    renderStats();
}

$$('#bottom-nav button').forEach(btn => {
  btn.addEventListener('click', () => navigate(btn.dataset.view));
});

// ── Word Panel (shared) ───────────────────────────────────────
function buildWordPanel(wordList) {
  const panel = mk('div', { className: 'word-panel' });

  if (!wordList) {
    panel.innerHTML = '<div class="word-list"><span class="word-missing">Word list not yet generated. Run <code>tools/scripts/generate_all_word_lists.sh</code></span></div>';
    return panel;
  }

  const tabs = mk('div', { className: 'length-tabs' });
  const wordListEl = mk('div', { className: 'word-list' });

  const defaultLen = LENGTH_ORDER.find(l => wordList[l]) || LENGTH_ORDER[0];

  function showLength(len) {
    $$('.length-tabs button', tabs).forEach(b => b.classList.toggle('active', b.dataset.len === len));
    tabs.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.len === len));
    const words = wordList[len] || [];
    wordListEl.innerHTML = words.length
      ? words.map(w => `<span class="word-chip">${w}</span>`).join('')
      : '<span class="word-empty">No words at this length</span>';
  }

  LENGTH_ORDER.forEach(len => {
    const count = (wordList[len] || []).length;
    const btn = mk('button', { onclick: () => showLength(len) });
    btn.dataset.len = len;
    btn.innerHTML = `<span class="tab-len">${len}</span><span class="tab-count">${count}</span>`;
    tabs.appendChild(btn);
  });

  panel.appendChild(tabs);
  panel.appendChild(wordListEl);
  showLength(defaultLen);
  return panel;
}

// ── Queue View ───────────────────────────────────────────────
async function renderQueue() {
  const container = $('#queue-content');

  // Skip trigrams labeled mid-session
  while (S.queueIndex < S.queue.length && S.labels[S.queue[S.queueIndex]]) {
    S.queueIndex++;
  }

  const labeled = Object.keys(S.labels).length;
  const done    = S.doneTrigrams.size;
  const total   = S.allTrigrams.length;
  $('#queue-progress').textContent =
    `${labeled} labeled · ${done} done · ${total - labeled - done} remaining`;

  if (S.queueIndex >= S.queue.length) {
    container.innerHTML = `
      <div class="queue-empty">
        <h2>🎉 Queue empty!</h2>
        <p>All trigrams have been labeled or skipped this session.</p>
      </div>`;
    return;
  }

  const trigram = S.queue[S.queueIndex];
  container.innerHTML = '<div class="loading">Loading words…</div>';

  const wordList = await loadWordList(trigram);
  container.innerHTML = '';

  // Trigram display
  container.appendChild(mk('div', { className: 'queue-trigram' }, [trigram]));

  // Word panel
  container.appendChild(buildWordPanel(wordList));

  // Comment area
  const commentInput = mk('textarea', { className: 'comment-input', placeholder: 'Optional note…', rows: '2' });
  const commentArea  = mk('div', { className: 'comment-area' });
  commentArea.hidden = true;
  commentArea.appendChild(commentInput);

  const commentToggle = mk('button', { className: 'comment-toggle', onclick: () => {
    commentArea.hidden = !commentArea.hidden;
    if (!commentArea.hidden) commentInput.focus();
  }}, ['＋ Add note']);

  container.appendChild(commentToggle);
  container.appendChild(commentArea);

  // Action buttons
  const actions = mk('div', { className: 'action-buttons' });
  const getComment = () => commentInput.value.trim();

  const disableAll = () => actions.querySelectorAll('button').forEach(b => { b.disabled = true; });

  async function handleLabel(label) {
    disableAll();
    try {
      await saveLabel(trigram, label, getComment());
      advanceQueue();
    } catch (err) {
      console.error('Save failed:', err);
      actions.querySelectorAll('button').forEach(b => { b.disabled = false; });
      let errEl = container.querySelector('.save-error');
      if (!errEl) { errEl = mk('div', { className: 'save-error' }); actions.before(errEl); }
      errEl.textContent = 'Save failed — check connection and try again.';
    }
  }

  [
    ['YES',  'btn-yes',   () => handleLabel('YES')],
    ['NO',   'btn-no',    () => handleLabel('NO')],
    ['MAYBE','btn-maybe', () => handleLabel('MAYBE')],
    ['SKIP', 'btn-skip',  () => { disableAll(); advanceQueue(); }],
  ].forEach(([text, cls, handler]) => {
    actions.appendChild(mk('button', { className: `action-btn ${cls}`, onclick: handler }, [text]));
  });

  container.appendChild(actions);
}

// ── Search View ──────────────────────────────────────────────
let searchDebounce;

$('#search-input').addEventListener('input', () => {
  clearTimeout(searchDebounce);
  const val = $('#search-input').value.trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
  if (val.length < 3) {
    $('#search-content').innerHTML = '<p class="hint-text">Type a 3-letter trigram above</p>';
    return;
  }
  $('#search-content').innerHTML = '<div class="loading">Loading…</div>';
  searchDebounce = setTimeout(() => renderSearchResult(val), 250);
});

async function renderSearchResult(trigram) {
  const container = $('#search-content');
  const wordList  = await loadWordList(trigram);
  container.innerHTML = '';

  // Header: trigram + current label badge
  const existing = S.labels[trigram];
  const badge = mk('span', {
    className: `label-badge badge-${existing ? existing.label.toLowerCase() : 'none'}`,
  }, [existing ? existing.label : 'Unlabeled']);
  const header = mk('div', { className: 'search-header' });
  header.appendChild(mk('span', { className: 'search-trigram' }, [trigram]));
  header.appendChild(badge);
  container.appendChild(header);

  if (existing?.comment) {
    container.appendChild(mk('p', { className: 'existing-comment' }, [`"${existing.comment}"`]));
  }

  // Word panel
  container.appendChild(buildWordPanel(wordList));

  // Comment textarea (always visible in search)
  const commentInput = mk('textarea', { className: 'comment-input', placeholder: 'Optional note…', rows: '2' });
  if (existing?.comment) commentInput.value = existing.comment;
  container.appendChild(mk('div', { className: 'comment-area' }, [commentInput]));

  // Action buttons
  const actions = mk('div', { className: 'action-buttons' });

  ['YES', 'NO', 'MAYBE'].forEach(label => {
    const isActive = existing?.label === label;
    const btn = mk('button', {
      className: `action-btn btn-${label.toLowerCase()}${isActive ? ' active' : ''}`,
      onclick: async () => {
        btn.disabled = true;
        await saveLabel(trigram, label, commentInput.value.trim());
        renderSearchResult(trigram);
      },
    }, [label]);
    actions.appendChild(btn);
  });

  if (existing) {
    actions.appendChild(mk('button', {
      className: 'action-btn btn-delete',
      onclick: async () => {
        await removeLabel(trigram);
        renderSearchResult(trigram);
      },
    }, ['Remove']));
  }

  container.appendChild(actions);
}

// ── Review View ──────────────────────────────────────────────
async function renderReview() {
  const container = $('#review-content');
  container.innerHTML = '<div class="loading">Loading…</div>';
  await loadLabels(); // refresh from Firestore

  const filter  = S.reviewFilter;
  const entries = Object.entries(S.labels)
    .filter(([, v]) => filter === 'ALL' || v.label === filter)
    .sort((a, b) => {
      const ta = a[1].labeledAt?.toDate?.() || a[1].labeledAt || new Date(0);
      const tb = b[1].labeledAt?.toDate?.() || b[1].labeledAt || new Date(0);
      return tb - ta;
    });

  container.innerHTML = '';

  // Filter chips
  const chips = mk('div', { className: 'filter-chips' });
  ['ALL', 'YES', 'MAYBE', 'NO'].forEach(f => {
    chips.appendChild(mk('button', {
      className: `chip${filter === f ? ' active' : ''}`,
      onclick: () => { S.reviewFilter = f; renderReview(); },
    }, [f]));
  });
  container.appendChild(chips);

  if (!entries.length) {
    container.appendChild(mk('p', { className: 'empty-state' },
      [filter === 'ALL' ? 'No labels yet.' : `No ${filter} labels yet.`]));
    return;
  }

  const list = mk('div', { className: 'review-list' });
  entries.forEach(([trigram, data]) => {
    const row = mk('div', { className: 'review-row', onclick: () => {
      // Jump to search with this trigram pre-filled
      $('#search-input').value = trigram;
      navigate('search');
      $('#search-input').dispatchEvent(new Event('input'));
    }});
    row.appendChild(mk('span', { className: 'review-trigram' }, [trigram]));
    row.appendChild(mk('span', { className: `label-badge badge-${data.label.toLowerCase()}` }, [data.label]));
    if (data.comment) {
      row.appendChild(mk('span', { className: 'review-comment' }, [data.comment]));
    }
    list.appendChild(row);
  });
  container.appendChild(list);
}

// ── Calendar View ────────────────────────────────────────────
function renderCalendar() {
  const container = $('#calendar-content');
  container.innerHTML = '';

  const recentSet = new Set(S.calendarData.slice(-5).map(t => t.toUpperCase()));
  const list = mk('div', { className: 'calendar-list' });

  [...S.calendarData].reverse().forEach((trigram, i) => {
    const weekNum = S.calendarData.length - i;
    const weekDate = new Date(GAME_START.getTime() + (weekNum - 1) * 7 * 24 * 60 * 60 * 1000);
    const dateStr  = weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const isRecent = recentSet.has(trigram.toUpperCase());

    const row = mk('div', { className: `calendar-row${isRecent ? ' recent' : ''}` });
    row.appendChild(mk('span', { className: 'cal-week' },    [`Wk ${weekNum}`]));
    row.appendChild(mk('span', { className: 'cal-trigram' }, [trigram.toUpperCase()]));
    row.appendChild(mk('span', { className: 'cal-date' },    [dateStr]));
    list.appendChild(row);
  });

  container.appendChild(list);
}

// ── Stats View ───────────────────────────────────────────────
function renderStats() {
  const container = $('#stats-content');
  container.innerHTML = '';

  const total     = S.allTrigrams.length;
  const done      = S.doneTrigrams.size;
  const allLabels = Object.values(S.labels);
  const yes       = allLabels.filter(l => l.label === 'YES').length;
  const no        = allLabels.filter(l => l.label === 'NO').length;
  const maybe     = allLabels.filter(l => l.label === 'MAYBE').length;
  const labeled   = allLabels.length;
  const unlabeled = total - labeled - done;
  const pct       = Math.round((labeled + done) / total * 100);

  // Summary grid
  const summary = mk('div', { className: 'stats-summary' });
  [
    ['Total',     total,     ''],
    ['Done',      done,      'done'],
    ['YES',       yes,       'yes'],
    ['MAYBE',     maybe,     'maybe'],
    ['NO',        no,        'no'],
    ['Unlabeled', unlabeled, 'unlabeled'],
  ].forEach(([lbl, count, cls]) => {
    const card = mk('div', { className: `stat-card${cls ? ' stat-' + cls : ''}` });
    card.appendChild(mk('div', { className: 'stat-num' },   [String(count)]));
    card.appendChild(mk('div', { className: 'stat-label' }, [lbl]));
    summary.appendChild(card);
  });
  container.appendChild(summary);

  // Progress bar
  const progress = mk('div', { className: 'stats-progress' });
  progress.innerHTML = `
    <div class="progress-label">Reviewed: ${labeled + done} / ${total} (${pct}%)</div>
    <div class="progress-track">
      <div class="progress-fill" style="width:${(done    / total * 100).toFixed(1)}%;background:#818cf8"></div>
      <div class="progress-fill" style="width:${(yes     / total * 100).toFixed(1)}%;background:var(--c-yes)"></div>
      <div class="progress-fill" style="width:${(maybe   / total * 100).toFixed(1)}%;background:var(--c-maybe)"></div>
      <div class="progress-fill" style="width:${(no      / total * 100).toFixed(1)}%;background:var(--c-no)"></div>
    </div>`;
  container.appendChild(progress);

  // Charts
  const yesTrigrams = Object.entries(S.labels)
    .filter(([, v]) => v.label === 'YES')
    .map(([k]) => k);

  container.appendChild(buildBarChart(
    'YES by First Letter',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    l => S.allTrigrams.filter(t => t[0] === l).length,
    l => yesTrigrams.filter(t => t[0] === l).length,
  ));

  container.appendChild(buildBarChart(
    'YES by Vowel',
    VOWELS,
    v => S.allTrigrams.filter(t => t.includes(v)).length,
    v => yesTrigrams.filter(t => t.includes(v)).length,
  ));
}

function buildBarChart(title, labels, totalFn, yesFn) {
  const section = mk('div', { className: 'chart-section' });
  section.appendChild(mk('h3', { className: 'chart-title' }, [title]));

  const chart   = mk('div', { className: 'bar-chart' });
  const maxVal  = Math.max(...labels.map(totalFn), 1);

  labels.forEach(label => {
    const total = totalFn(label);
    if (!total) return;
    const yes = yesFn(label);

    const row = mk('div', { className: 'bar-row' });
    row.appendChild(mk('span', { className: 'bar-label' }, [label]));

    const track = mk('div', { className: 'bar-track' });
    const totalBar = mk('div', { className: 'bar-total' });
    const yesBar   = mk('div', { className: 'bar-yes' });
    totalBar.style.width = `${(total / maxVal * 100).toFixed(1)}%`;
    yesBar.style.width   = `${(yes   / maxVal * 100).toFixed(1)}%`;
    track.appendChild(totalBar);
    track.appendChild(yesBar);

    row.appendChild(track);
    row.appendChild(mk('span', { className: 'bar-count' }, [`${yes}/${total}`]));
    chart.appendChild(row);
  });

  section.appendChild(chart);
  return section;
}

// ── Bootstrap ────────────────────────────────────────────────
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    $('#auth-screen').hidden = false;
    $('#app').hidden = true;
    return;
  }

  if (AUTHORIZED_UID && user.uid !== AUTHORIZED_UID) {
    const msg = AUTHORIZED_UID === 'REPLACE_WITH_YOUR_UID'
      ? `Setup: set AUTHORIZED_UID = "${user.uid}" in firebase-config.js`
      : 'Unauthorized account.';
    $('#auth-error').textContent = msg;
    await signOut(auth);
    return;
  }

  $('#auth-screen').hidden = true;
  $('#app').hidden = false;
  await initApp();
});
