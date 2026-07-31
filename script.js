const stage = document.querySelector('#game-stage');
const playSection = document.querySelector('#play');
const title = document.querySelector('#game-title');

const koreanQuestions = [
  ['오늘 숙제를 모두', '마쳤다', '맞쳤다', 0], ['비가 와서 길이', '미끄럽다', '미끄럽따', 0],
  ['친구와 약속을', '지켰다', '지켣다', 0], ['문을 꼭', '잠갔다', '잠궜다', 0], ['정답을 정확히', '맞혔다', '맞췄다', 0]
];

function result(score, total, restart) {
  stage.innerHTML = `<div class="result-box"><p class="eyebrow">GAME COMPLETE</p><strong>${score}/${total}</strong><h3>${score === total ? '완벽해요! 🎉' : '한 번 더 도전해 볼까요?'}</h3><button class="primary" id="restart">다시 하기</button></div>`;
  document.querySelector('#restart').onclick = restart;
}

function koreanGame() {
  let index = 0, score = 0;
  const render = () => {
    if (index === koreanQuestions.length) return result(score, koreanQuestions.length, koreanGame);
    const [lead, a, b, answer] = koreanQuestions[index];
    stage.innerHTML = `<div class="score-row"><span>문제 ${index + 1}/${koreanQuestions.length}</span><span>점수 ${score}</span></div><p class="question">${lead} ___.</p><div class="choices"><button>${a}</button><button>${b}</button></div><p class="feedback"></p>`;
    [...stage.querySelectorAll('.choices button')].forEach((button, choice) => button.onclick = () => {
      const correct = choice === answer; if (correct) score += 1;
      stage.querySelector('.feedback').textContent = correct ? '정답이에요! ✓' : `아쉬워요. 정답은 ‘${answer === 0 ? a : b}’예요.`;
      setTimeout(() => { index += 1; render(); }, 700);
    });
  }; render();
}

function mathGame() {
  let count = 0, score = 0;
  const render = () => {
    if (count === 8) return result(score, 8, mathGame);
    const x = Math.floor(Math.random() * 12) + 2, y = Math.floor(Math.random() * 9) + 1;
    const multiply = count % 2 === 0, answer = multiply ? x * y : x + y;
    stage.innerHTML = `<div class="score-row"><span>문제 ${count + 1}/8</span><span>점수 ${score}</span></div><p class="question">${x} ${multiply ? '×' : '+'} ${y} = ?</p><div class="answer-input"><input id="math-answer" inputmode="numeric" aria-label="정답" autofocus><button id="submit-answer">확인</button></div><p class="feedback"></p>`;
    const submit = () => { const value = Number(document.querySelector('#math-answer').value); const correct = value === answer; if (correct) score += 1; stage.querySelector('.feedback').textContent = correct ? '정답이에요! ✓' : `정답은 ${answer}이에요.`; setTimeout(() => { count += 1; render(); }, 700); };
    document.querySelector('#submit-answer').onclick = submit; document.querySelector('#math-answer').onkeydown = e => e.key === 'Enter' && submit();
  }; render();
}

function memoryGame() {
  const icons = ['🍎','🚀','🐳','🌈','🍎','🚀','🐳','🌈'].sort(() => Math.random() - .5);
  let open = [], matched = 0, moves = 0;
  stage.innerHTML = `<div class="score-row"><span>짝 ${matched}/4</span><span>시도 ${moves}</span></div><div class="memory-board">${icons.map((icon,i)=>`<button class="memory-card" data-i="${i}" aria-label="뒤집힌 카드">${icon}</button>`).join('')}</div>`;
  const update = () => { stage.querySelector('.score-row').innerHTML = `<span>짝 ${matched}/4</span><span>시도 ${moves}</span>`; };
  [...stage.querySelectorAll('.memory-card')].forEach(card => card.onclick = () => {
    if (open.length === 2 || card.classList.contains('open') || card.classList.contains('done')) return;
    card.classList.add('open'); open.push(card);
    if (open.length === 2) { moves += 1; update(); const same = open[0].textContent === open[1].textContent; setTimeout(() => { if (same) { open.forEach(c=>{c.classList.remove('open');c.classList.add('done')}); matched += 1; update(); if (matched === 4) result(4,4,memoryGame); } else open.forEach(c=>c.classList.remove('open')); open = []; }, 650); }
  });
}

const games = { korean: ['맞춤법 탐험대', koreanGame], math: ['두뇌 계산소', mathGame], memory: ['짝꿍 카드 찾기', memoryGame] };
document.querySelectorAll('[data-game]').forEach(button => button.onclick = () => { const [name, start] = games[button.dataset.game]; title.textContent = name; playSection.hidden = false; start(); playSection.scrollIntoView({behavior:'smooth'}); });
document.querySelector('#close-game').onclick = () => { playSection.hidden = true; document.querySelector('#games').scrollIntoView({behavior:'smooth'}); };
