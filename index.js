const QUESTIONS = [
  {country:'코트디부아르',capital:'야무수크로',continent:'아프리카',note:'행정수도는 야무수크로, 최대 도시는 아비장입니다.'},
  {country:'말레이시아',capital:'쿠알라룸푸르',continent:'아시아',note:'행정수도는 푸트라자야.'},
  {country:'칠레',capital:'산티아고',continent:'남아메리카',note:'안데스 산맥 서쪽에 위치.'},
  {country:'뉴질랜드',capital:'웰링턴',continent:'오세아니아',note:'북섬과 남섬 사이에 위치.'},
  {country:'캐나다',capital:'오타와',continent:'북아메리카',note:'온타리오주와 퀘벡주의 경계 근처.'},
  {country:'카자흐스탄',capital:'누르술탄',continent:'아시아/유럽',note:'2019년 아스타나에서 변경됨.'},
  {country:'에티오피아',capital:'아디스아바바',continent:'아프리카',note:'아프리카 연합 본부가 있음.'},
  {country:'핀란드',capital:'헬싱키',continent:'유럽',note:'발트해 연안.'},
  {country:'슬로베니아',capital:'류블랴나',continent:'유럽',note:'알프스와 지중해 사이.'},
  {country:'우루과이',capital:'몬테비데오',continent:'남아메리카',note:'라플라타 강 기슭.'},
  {country:'이란',capital:'테헤란',continent:'아시아',note:'알보르즈 산맥 남쪽.'},
  {country:'가봉',capital:'리브르빌',continent:'아프리카',note:'해안 도시 중심.'},
  {country:'조지아',capital:'트빌리시',continent:'유럽/아시아',note:'쿠라 강 유역.'},
  {country:'몽골',capital:'울란바토르',continent:'아시아',note:'인구밀도 낮은 국가 수도.'},
  {country:'팔레스타인',capital:'라말라(행정)',continent:'아시아',note:'정치적 상황으로 민감.'}
];

const TOTAL = 12;
const PER_Q = 20;

let pool = [];
let currentIndex = 0;
let score = 0;
let streak = 0;
let timeLeft = PER_Q;
let timerId = null;
let hints = 2;
let fifties = 1;
let usedFiftyThisQ = false;
const review = [];

const qtext = document.getElementById('qtext');
const choicesEl = document.getElementById('choices');
const bar = document.getElementById('bar');
const timeNum = document.getElementById('timeNum');
const scoreEl = document.getElementById('score');
const hintsEl = document.getElementById('hints');
const fiftiesEl = document.getElementById('fifties');
const streakEl = document.getElementById('streak');
const indexEl = document.getElementById('index');
const totalEl = document.getElementById('total');
const total2El = document.getElementById('total2');
const levelEl = document.getElementById('level');
const endScreen = document.getElementById('endScreen');
const finalScore = document.getElementById('finalScore');
const bestEl = document.getElementById('best');
const reviewEl = document.getElementById('review');

document.getElementById('total').textContent = TOTAL;
document.getElementById('perQ').textContent = PER_Q;
total2El.textContent = TOTAL;

function start() {
  pool = shuffle([...QUESTIONS]).slice(0, TOTAL);
  currentIndex = 0;
  score = 0;
  streak = 0;
  hints = 2;
  fifties = 1;
  review.length = 0;
  updateUI();
  renderQuestion(pool[currentIndex]);
}

function renderQuestion(qObj) {
  qtext.textContent = `Q${currentIndex + 1}. ${qObj.country}의 수도는?`;
  indexEl.textContent = `${currentIndex + 1}`;
  levelEl.textContent = difficultyLabel(qObj);

  const answers = generateChoices(qObj.capital);
  choicesEl.innerHTML = '';
  answers.forEach(a => {
    const btn = document.createElement('div');
    btn.className = 'choice';
    btn.textContent = a;
    btn.onclick = () => selectAnswer(a, qObj);
    choicesEl.appendChild(btn);
  });

  usedFiftyThisQ = false;
  document.getElementById('hintBtn').disabled = hints <= 0;
  document.getElementById('fiftyBtn').disabled = fifties <= 0;

  timeLeft = PER_Q;
  updateTimerUI();
  clearTimer();
  timerId = setInterval(() => {
    timeLeft -= 0.2;
    if (timeLeft <= 0) {
      timeLeft = 0;
      updateTimerUI();
      clearTimer();
      handleTimeout(qObj);
    } else updateTimerUI();
  }, 200);
}

function selectAnswer(answer, qObj) {
  if (timerId === null) return;
  clearTimer();

  const choices = Array.from(document.querySelectorAll('.choice'));
  choices.forEach(c => (c.onclick = null));
  const correct = answer === qObj.capital;

  if (correct) {
    const base = 10;
    const timeBonus = Math.round((timeLeft / PER_Q) * 5);
    streak++;
    const streakBonus = (streak - 1) * 5;
    score += base + timeBonus + streakBonus;
    review.push({ q: qObj.country, your: answer, correct: qObj.capital, ok: true, note: qObj.note });
  } else {
    streak = 0;
    score = Math.max(0, score - 3);
    review.push({ q: qObj.country, your: answer, correct: qObj.capital, ok: false, note: qObj.note });
  }

  scoreEl.textContent = score;
  streakEl.textContent = streak;

  choices.forEach(c => {
    if (c.textContent === qObj.capital) c.classList.add('correct');
    else if (c.textContent === answer && !correct) c.classList.add('wrong');
  });

  setTimeout(nextQuestion, 1000);
}

function handleTimeout(qObj) {
  streak = 0;
  score = Math.max(0, score - 1);
  scoreEl.textContent = score;
  streakEl.textContent = streak;
  const choices = Array.from(document.querySelectorAll('.choice'));
  choices.forEach(c => {
    if (c.textContent === qObj.capital) c.classList.add('correct');
    else c.classList.add('wrong');
  });
  review.push({ q: qObj.country, your: '시간초과', correct: qObj.capital, ok: false, note: qObj.note });
  setTimeout(nextQuestion, 1000);
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex >= pool.length) finish();
  else renderQuestion(pool[currentIndex]);
}

function finish() {
  clearTimer();
  endScreen.style.display = 'flex';
  finalScore.textContent = score;
  const key = 'capitals_quiz_best';
  const best = parseInt(localStorage.getItem(key) || '0', 10);
  if (score > best) localStorage.setItem(key, score);
  bestEl.textContent = localStorage.getItem(key) || 0;

  reviewEl.innerHTML = '';
  review.forEach((r, i) => {
    const el = document.createElement('div');
    el.className = 'small';
    el.innerHTML = `<strong>${i + 1}. ${r.q}</strong> — 당신: ${r.your} · 정답: ${r.correct}<div class="small">힌트: ${r.note}</div>`;
    reviewEl.appendChild(el);
  });
}

function generateChoices(correct) {
  const poolCaps = QUESTIONS.map(x => x.capital).filter(c => c !== correct);
  const picks = shuffle(poolCaps).slice(0, 3);
  picks.push(correct);
  return shuffle(picks);
}

function updateTimerUI() {
  const fraction = timeLeft / PER_Q;
  bar.style.width = `${Math.max(6, fraction * 100)}%`;
  timeNum.textContent = `${Math.ceil(timeLeft)}s`;
}

function updateUI() {
  scoreEl.textContent = score;
  hintsEl.textContent = hints;
  fiftiesEl.textContent = fifties;
  streakEl.textContent = streak;
}

function difficultyLabel(q) {
  const hard = ['코트디부아르', '카자흐스탄', '가봉', '조지아', '팔레스타인'];
  if (hard.includes(q.country)) return '상';
  const med = ['몽골', '슬로베니아', '에티오피아', '우루과이'];
  if (med.includes(q.country)) return '중';
  return '하';
}

function shuffle(a) {
  return a.sort(() => Math.random() - 0.5);
}

function clearTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

document.getElementById('hintBtn').onclick = () => {
  if (hints <= 0) return;
  hints--;
  updateUI();
  const q = pool[currentIndex];
  alert(`힌트: 이 나라는 ${q.continent}에 있습니다.`);
};

document.getElementById('fiftyBtn').onclick = () => {
  if (fifties <= 0 || usedFiftyThisQ) return;
  fifties--;
  usedFiftyThisQ = true;
  updateUI();
  const q = pool[currentIndex];
  const choices = Array.from(document.querySelectorAll('.choice'));
  const wrongs = choices.filter(c => c.textContent !== q.capital);
  shuffle(wrongs)
    .slice(0, 2)
    .forEach(c => (c.style.display = 'none'));
};

document.getElementById('skipBtn').onclick = () => {
  score = Math.max(0, score - 2);
  streak = 0;
  updateUI();
  clearTimer();
  nextQuestion();
};

document.getElementById('restart').onclick = () => {
  endScreen.style.display = 'none';
  start();
};

document.getElementById('share').onclick = () => {
  const text = `🌍 수도 퀴즈 결과: ${score}점!`;
  navigator.clipboard.writeText(text);
  alert('결과가 복사되었습니다!');
};

start();
