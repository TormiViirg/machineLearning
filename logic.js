let currentScore = -1;
let inRoundMod = 0;
let activePlayer = 1;
let startingPlayer = 1;
let initialScore = -1;

// cards stored as objects {id, val, img, reusable}
let player1Moves = [{ id: 'p1-0', val: 0, img: null, reusable: true }];
let player2Moves = [{ id: 'p2-0', val: 0, img: null, reusable: true }];
let possibleScores = [];
let history = []; // store history entries as objects {player, val, img}
let gameOver = false;

// DOM refs
const currentScoreEl = document.getElementById('currentScore');
const currentInRoundModEl = document.getElementById('currentInRoundMod');
const activePlayerEl = document.getElementById('activePlayer');
const startingPlayerEl = document.getElementById('startingPlayer');
const p1CardsEl = document.getElementById('p1Cards');
const p2CardsEl = document.getElementById('p2Cards');
const historyEl = document.getElementById('history');
const colP1 = document.getElementById('colP1');
const colP2 = document.getElementById('colP2');

function gameOverCheck(score, possible) {
  return possible.includes(score);
}
function updateActivePlayer(ap) {
  return ap === 1 ? 2 : 1;
}
function calculateUpdate(curr, mod, last) {
  curr = curr + mod + last;
  mod = mod + last;
  return [curr, mod];
}

function checkMoveLegality(id, ap) {
  const list = ap === 1 ? player1Moves : player2Moves;
  return list.some(c => c.id === id);
}

// new: boundary-based end condition
function checkBoundaryEndConditions(score) {
  if (possibleScores.length === 0) return false;
  const minScore = Math.min(...possibleScores);
  const maxScore = Math.max(...possibleScores);
  if (possibleScores.length === 1) return false;

  if (initialScore < minScore) {
    return score < minScore;
  }
  if (initialScore > maxScore) {
    return score > maxScore;
  }
  return score < minScore || score > maxScore;
}

function render() {
  currentScoreEl.textContent = currentScore;
  currentInRoundModEl.textContent = inRoundMod;
  activePlayerEl.textContent = activePlayer;
  startingPlayerEl.textContent = startingPlayer;

  // active column styling
  if (activePlayer === 1) {
    colP1.classList.add('active');
    colP1.classList.remove('inactive');
    colP2.classList.add('inactive');
    colP2.classList.remove('active');
  } else {
    colP2.classList.add('active');
    colP2.classList.remove('inactive');
    colP1.classList.add('inactive');
    colP1.classList.remove('active');
  }

  // render cards
  p1CardsEl.innerHTML = '';
  p2CardsEl.innerHTML = '';

  player1Moves.forEach((c, idx) => {
    const btn = document.createElement('button');
    btn.className = 'chip' + (gameOver ? ' disabled' : '');
    const reusableBadge = c.reusable
      ? `<div class="small-muted" style="font-size:11px;margin-top:4px">(0 = korduv)</div>`
      : '';
    btn.innerHTML =
      (c.img ? `<img src="${c.img}" alt="p1-${idx}"/>` : '') +
      `<div class="val">${c.val}</div>` +
      reusableBadge;
    btn.onclick = () => playCard(1, c.id);
    if (gameOver) btn.disabled = true;
    p1CardsEl.appendChild(btn);
  });

  player2Moves.forEach((c, idx) => {
    const btn = document.createElement('button');
    btn.className = 'chip' + (gameOver ? ' disabled' : '');
    const reusableBadge = c.reusable
      ? `<div class="small-muted" style="font-size:11px;margin-top:4px">(0 = korduv)</div>`
      : '';
    btn.innerHTML =
      (c.img ? `<img src="${c.img}" alt="p2-${idx}"/>` : '') +
      `<div class="val">${c.val}</div>` +
      reusableBadge;
    btn.onclick = () => playCard(2, c.id);
    if (gameOver) btn.disabled = true;
    p2CardsEl.appendChild(btn);
  });

  // render history
  if (history.length === 0) {
    historyEl.textContent = '---';
  } else {
    historyEl.innerHTML = '';
    history.forEach((h, i) => {
      const wrap = document.createElement('span');
      wrap.style.display = 'inline-flex';
      wrap.style.alignItems = 'center';
      wrap.style.gap = '6px';
      wrap.style.marginRight = '8px';
      wrap.style.padding = '6px';
      wrap.style.borderRadius = '8px';
      wrap.style.background = 'rgba(255,255,255,0.02)';

      const who = document.createElement('div');
      who.textContent = h.player === 1 ? 'P1' : 'P2';
      who.className = 'small-muted';
      who.style.fontSize = '12px';
      who.style.marginRight = '6px';

      if (h.img) {
        const im = document.createElement('img');
        im.src = h.img;
        im.alt = 'hist-' + i;
        im.style.width = '40px';
        im.style.height = '28px';
        im.style.objectFit = 'cover';
        im.style.borderRadius = '6px';
        wrap.appendChild(im);
      }

      const val = document.createElement('div');
      val.textContent = h.val;
      val.style.fontWeight = '600';

      wrap.appendChild(who);
      wrap.appendChild(val);

      historyEl.appendChild(wrap);
    });
  }
}

function playCard(player, cardId) {
  if (gameOver) return;
  if (player !== activePlayer) {
    alert('Ei ole sinu käik.');
    return;
  }
  if (!checkMoveLegality(cardId, activePlayer)) {
    alert('Antud kaart pole valikus.');
    return;
  }

  const list = activePlayer === 1 ? player1Moves : player2Moves;
  const idx = list.findIndex(x => x.id === cardId);
  if (idx > -1) {
    const cardObj = list[idx];
    history.push({ player: activePlayer, val: cardObj.val, img: cardObj.img });

    const res = calculateUpdate(currentScore, inRoundMod, cardObj.val);
    currentScore = res[0];
    inRoundMod = res[1];

    if (!cardObj.reusable) list.splice(idx, 1);

    if (gameOverCheck(currentScore, possibleScores)) {
      alert(`Mäng läbi! Mängija ${activePlayer} võitis! Lõppskoor: ${currentScore}`);
      gameOver = true;
    } else if (checkBoundaryEndConditions(currentScore)) {
      alert(
        `Mäng läbi! Mängija ${activePlayer} kaotas, kuna skoor ületas piiri. Lõppskoor: ${currentScore}`
      );
      gameOver = true;
    } else {
      activePlayer = updateActivePlayer(activePlayer);
    }
    render();
  }
}

// Setup UI
const cardsInputsContainer = document.getElementById('cardsInputs');
const setupBtn = document.getElementById('setupBtn');
const randomStartBtn = document.getElementById('randomStartBtn');
const resetBtn = document.getElementById('resetBtn');

function buildCardInputs() {
  cardsInputsContainer.innerHTML = '';
  const numP1 = parseInt(document.getElementById('numP1').value, 10) || 0;
  const numP2 = parseInt(document.getElementById('numP2').value, 10) || 0;

  // P1 zero card upload
  const p1ZeroRow = document.createElement('div');
  p1ZeroRow.className = 'form-row';
  p1ZeroRow.innerHTML = '<strong>Mängija 1 0-kaart (korduv)</strong>';
  const p1ZeroFile = document.createElement('input');
  p1ZeroFile.type = 'file';
  p1ZeroFile.accept = 'image/*';
  p1ZeroFile.dataset.player = 'p1-zero';
  const p1ZeroPreview = document.createElement('img');
  p1ZeroPreview.className = 'preview-thumb';
  p1ZeroPreview.style.display = 'none';
  p1ZeroFile.addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) {
      p1ZeroPreview.src = '';
      p1ZeroPreview.style.display = 'none';
      delete p1ZeroFile.dataset.dataurl;
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      p1ZeroPreview.src = ev.target.result;
      p1ZeroPreview.style.display = 'block';
      p1ZeroFile.dataset.dataurl = ev.target.result;
    };
    reader.readAsDataURL(f);
  });
  p1ZeroRow.appendChild(p1ZeroFile);
  p1ZeroRow.appendChild(p1ZeroPreview);
  cardsInputsContainer.appendChild(p1ZeroRow);

  const sepTop = document.createElement('div');
  sepTop.style.height = '8px';
  cardsInputsContainer.appendChild(sepTop);

  // P1 cards
  const p1Wrap = document.createElement('div');
  p1Wrap.innerHTML = '<strong>Mängija 1 kaardid</strong>';
  cardsInputsContainer.appendChild(p1Wrap);
  for (let i = 0; i < numP1; i++) {
    const row = document.createElement('div');
    row.className = 'form-row';
    const num = document.createElement('input');
    num.type = 'number';
    num.placeholder = `P1 kaart ${i + 1}`;
    num.dataset.player = 'p1';
    const file = document.createElement('input');
    file.type = 'file';
    file.accept = 'image/*';
    file.dataset.player = 'p1';
    const preview = document.createElement('img');
    preview.className = 'preview-thumb';
    preview.style.display = 'none';
    file.addEventListener('change', e => {
      const f = e.target.files[0];
      if (!f) {
        preview.src = '';
        preview.style.display = 'none';
        delete file.dataset.dataurl;
        return;
      }
      const reader = new FileReader();
      reader.onload = ev => {
        preview.src = ev.target.result;
        preview.style.display = 'block';
        file.dataset.dataurl = ev.target.result;
      };
      reader.readAsDataURL(f);
    });
    row.appendChild(num);
    row.appendChild(file);
    row.appendChild(preview);
    cardsInputsContainer.appendChild(row);
  }

  const sep = document.createElement('div');
  sep.style.height = '10px';
  cardsInputsContainer.appendChild(sep);

  // P2 zero card upload
  const p2ZeroRow = document.createElement('div');
  p2ZeroRow.className = 'form-row';
  p2ZeroRow.innerHTML = '<strong>Mängija 2 0-kaart (korduv)</strong>';
  const p2ZeroFile = document.createElement('input');
  p2ZeroFile.type = 'file';
  p2ZeroFile.accept = 'image/*';
  p2ZeroFile.dataset.player = 'p2-zero';
  const p2ZeroPreview = document.createElement('img');
  p2ZeroPreview.className = 'preview-thumb';
  p2ZeroPreview.style.display = 'none';
  p2ZeroFile.addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) {
      p2ZeroPreview.src = '';
      p2ZeroPreview.style.display = 'none';
      delete p2ZeroFile.dataset.dataurl;
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      p2ZeroPreview.src = ev.target.result;
      p2ZeroPreview.style.display = 'block';
      p2ZeroFile.dataset.dataurl = ev.target.result;
    };
    reader.readAsDataURL(f);
  });
  p2ZeroRow.appendChild(p2ZeroFile);
  p2ZeroRow.appendChild(p2ZeroPreview);
  cardsInputsContainer.appendChild(p2ZeroRow);

  const sep2 = document.createElement('div');
  sep2.style.height = '8px';
  cardsInputsContainer.appendChild(sep2);

  // P2 cards
  const p2Wrap = document.createElement('div');
  p2Wrap.innerHTML = '<strong>Mängija 2 kaardid</strong>';
  cardsInputsContainer.appendChild(p2Wrap);
  for (let i = 0; i < numP2; i++) {
    const row = document.createElement('div');
    row.className = 'form-row';
    const num = document.createElement('input');
    num.type = 'number';
    num.placeholder = `P2 kaart ${i + 1}`;
    num.dataset.player = 'p2';
    const file = document.createElement('input');
    file.type = 'file';
    file.accept = 'image/*';
    file.dataset.player = 'p2';
    const preview = document.createElement('img');
    preview.className = 'preview-thumb';
    preview.style.display = 'none';
    file.addEventListener('change', e => {
      const f = e.target.files[0];
      if (!f) {
        preview.src = '';
        preview.style.display = 'none';
        delete file.dataset.dataurl;
        return;
      }
      const reader = new FileReader();
      reader.onload = ev => {
        preview.src = ev.target.result;
        preview.style.display = 'block';
        file.dataset.dataurl = ev.target.result;
      };
      reader.readAsDataURL(f);
    });
    row.appendChild(num);
    row.appendChild(file);
    row.appendChild(preview);
    cardsInputsContainer.appendChild(row);
  }
}

// Events
document.getElementById('numP1').addEventListener('change', buildCardInputs);
document.getElementById('numP2').addEventListener('change', buildCardInputs);
buildCardInputs();

randomStartBtn.addEventListener('click', () => {
  startingPlayer = Math.random() < 0.5 ? 1 : 2;
  activePlayer = startingPlayer;
  startingPlayerEl.textContent = startingPlayer;
  alert('Algaja mängija: ' + startingPlayer);
  render();
});

setupBtn.addEventListener('click', () => {
  currentScore = parseInt(document.getElementById('initialScore').value, 10) || -1;
  initialScore = currentScore;
  inRoundMod = parseInt(document.getElementById('initialInRoundMod').value, 10) || 0;
  const dsRaw = document.getElementById('desiredScores').value || '';
  possibleScores = dsRaw.split(',').map(s => parseInt(s.trim(), 10)).filter(x => !isNaN(x));

  const inputs = cardsInputsContainer.querySelectorAll('.form-row');
  player1Moves = [{ id: 'p1-0', val: 0, img: null, reusable: true }];
  player2Moves = [{ id: 'p2-0', val: 0, img: null, reusable: true }];
  let p1count = 0,
    p2count = 0;

  const p1ZeroFile = cardsInputsContainer.querySelector('input[data-player=\"p1-zero\"]');
  if (p1ZeroFile && p1ZeroFile.dataset.dataurl) player1Moves[0].img = p1ZeroFile.dataset.dataurl;
  const p2ZeroFile = cardsInputsContainer.querySelector('input[data-player=\"p2-zero\"]');
  if (p2ZeroFile && p2ZeroFile.dataset.dataurl) player2Moves[0].img = p2ZeroFile.dataset.dataurl;

  for (const row of inputs) {
    const num = row.querySelector('input[type=number]');
    if (!num) continue;
    const file = row.querySelector('input[type=file]');
    const val = parseInt(num.value, 10);
    const dataurl = file && file.dataset.dataurl ? file.dataset.dataurl : null;
    if (!isNaN(val)) {
      if (num.dataset.player === 'p1') {
        player1Moves.push({
          id: `p1-${Date.now()}-${p1count++}`,
          val: val,
          img: dataurl,
          reusable: false
        });
      } else {
        player2Moves.push({
          id: `p2-${Date.now()}-${p2count++}`,
          val: val,
          img: dataurl,
          reusable: false
        });
      }
    }
  }

  startingPlayer = Math.random() < 0.5 ? 1 : 2;
  activePlayer = startingPlayer;
  history = [];
  gameOver = false;

  render();
  alert('Mäng loodud! Algaja mängija: ' + startingPlayer);
});

resetBtn.addEventListener('click', () => {
  currentScore = -1;
  inRoundMod = 0;
  player1Moves = [{ id: 'p1-0', val: 0, img: null, reusable: true }];
  player2Moves = [{ id: 'p2-0', val: 0, img: null, reusable: true }];
  possibleScores = [];
  history = [];
  gameOver = false;
  startingPlayer = 1;
  activePlayer = 1;

  document.getElementById('initialScore').value = '-1';
  document.getElementById('initialInRoundMod').value = '0';
  document.getElementById('desiredScores').value = '5,10,15';
  document.getElementById('numP1').value = 3;
  document.getElementById('numP2').value = 3;

  buildCardInputs();
  render();
});

// initial render
render();
