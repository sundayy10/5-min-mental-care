/**
 * Mind5 - 5분 감정 기록 & 멘탈케어 애플리케이션 로직
 */

// --- 1. STATE & CONSTANTS ---
const SESSION_MOODS = {
  joy: { emoji: '😄', label: '기쁨', color: 'hsl(45, 95%, 55%)', bg: 'rgba(245, 158, 11, 0.15)', score: 5 },
  sadness: { emoji: '😢', label: '슬픔', color: 'hsl(220, 75%, 55%)', bg: 'rgba(59, 130, 246, 0.15)', score: 2 },
  anger: { emoji: '😡', label: '분노', color: 'hsl(5, 85%, 55%)', bg: 'rgba(239, 68, 68, 0.15)', score: 1 },
  disgust: { emoji: '🤢', label: '역겨움', color: 'hsl(95, 60%, 45%)', bg: 'rgba(132, 204, 22, 0.15)', score: 2 },
  fear: { emoji: '😱', label: '공포', color: 'hsl(280, 65%, 60%)', bg: 'rgba(168, 85, 247, 0.15)', score: 2 },
  surprise: { emoji: '😲', label: '놀라움', color: 'hsl(25, 95%, 55%)', bg: 'rgba(249, 115, 22, 0.15)', score: 4 }
};

const DAILY_MOODS = {
  alert: { emoji: '⚡', label: '기민 (alert)', color: 'hsl(180, 80%, 45%)', bg: 'rgba(6, 182, 212, 0.15)', score: 4.5 },
  excited: { emoji: '🤩', label: '설렘 (excited)', color: 'hsl(330, 90%, 60%)', bg: 'rgba(236, 72, 153, 0.15)', score: 5 },
  elated: { emoji: '🥳', label: '신남 (elated)', color: 'hsl(25, 95%, 55%)', bg: 'rgba(249, 115, 22, 0.15)', score: 5 },
  happy: { emoji: '😊', label: '행복 (happy)', color: 'hsl(45, 95%, 55%)', bg: 'rgba(245, 158, 11, 0.15)', score: 5 },
  contented: { emoji: '😌', label: '만족 (contented)', color: 'hsl(150, 70%, 50%)', bg: 'rgba(16, 185, 129, 0.15)', score: 4.5 },
  serene: { emoji: '🍃', label: '평온 (serene)', color: 'hsl(140, 50%, 55%)', bg: 'rgba(34, 197, 94, 0.15)', score: 4 },
  relaxed: { emoji: '🧘', label: '느긋 (relaxed)', color: 'hsl(165, 60%, 45%)', bg: 'rgba(20, 184, 166, 0.15)', score: 4 },
  calm: { emoji: '☕', label: '차분 (calm)', color: 'hsl(210, 20%, 65%)', bg: 'rgba(148, 163, 184, 0.15)', score: 4 },
  fatigued: { emoji: '🥱', label: '피로 (fatigued)', color: 'hsl(210, 15%, 55%)', bg: 'rgba(100, 116, 139, 0.15)', score: 2.5 },
  lethargic: { emoji: '😶', label: '무기력 (lethargic)', color: 'hsl(210, 10%, 60%)', bg: 'rgba(115, 115, 115, 0.15)', score: 2 },
  depressed: { emoji: '😢', label: '우울 (depressed)', color: 'hsl(220, 75%, 55%)', bg: 'rgba(59, 130, 246, 0.15)', score: 1.5 },
  sad: { emoji: '😭', label: '슬픔 (sad)', color: 'hsl(230, 70%, 55%)', bg: 'rgba(79, 70, 229, 0.15)', score: 1.5 },
  upset: { emoji: '😔', label: '속상 (upset)', color: 'hsl(235, 55%, 55%)', bg: 'rgba(99, 102, 241, 0.15)', score: 1.5 },
  stressed: { emoji: '🤯', label: '스트레스 (stressed)', color: 'hsl(350, 80%, 50%)', bg: 'rgba(225, 29, 72, 0.15)', score: 1.5 },
  nervous: { emoji: '😬', label: '긴장 (nervous)', color: 'hsl(110, 50%, 50%)', bg: 'rgba(132, 204, 22, 0.15)', score: 2.5 },
  tense: { emoji: '😰', label: '초조 (tense)', color: 'hsl(280, 65%, 60%)', bg: 'rgba(168, 85, 247, 0.15)', score: 2 }
};

function getMoodConfig(moodKey) {
  return SESSION_MOODS[moodKey] || DAILY_MOODS[moodKey];
}

const DEFAULT_SESSIONS = [
  { id: 'sess_1', name: '🌅 아침 세션', start: 0, end: 7 },    // 05:00 - 12:00
  { id: 'sess_2', name: '☀️ 오후 세션', start: 7, end: 13 },   // 12:00 - 18:00
  { id: 'sess_3', name: '🌇 퇴근 후', start: 13, end: 17 },     // 18:00 - 22:00
  { id: 'sess_4', name: '🌙 밤 & 자기 전', start: 17, end: 24 } // 22:00 - 05:00 (익일)
];

const PRESETS = {
  preset4: DEFAULT_SESSIONS,
  preset3: [
    { id: 'p3_1', name: '☀️ 일과 중', start: 0, end: 13 },     // 05:00 - 18:00
    { id: 'p3_2', name: '🌇 저녁 시간', start: 13, end: 18 },   // 18:00 - 23:00
    { id: 'p3_3', name: '🌙 취침 전', start: 18, end: 24 }     // 23:00 - 05:00 (익일)
  ],
  presetHourly: Array.from({ length: 24 }, (_, i) => ({
    id: `hr_${i}`,
    name: `${(i + 5) % 24}시 타임`,
    start: i,
    end: i + 1
  }))
};

let appState = {
  user: null,
  sessions: [],
  moodLogs: {}, // Format: { "YYYY-MM-DD": { "sess_id": { mood, tags, note, timestamp } } }
  activeLogSession: null, // Session currently being logged
  selectedMood: null,
  selectedTags: []
};

// --- 2. TIME & DATE UTILS ---
// Day starts at 05:00 AM, relative hours are 0 (05:00) to 24 (05:00 next day)
function relToRealHour(rel) {
  return (rel + 5) % 24;
}

function formatHourStr(rel) {
  const hour = relToRealHour(rel);
  const ampm = hour < 12 ? '오전' : '오후';
  const displayHour = hour === 0 ? 12 : (hour > 12 ? hour - 12 : hour);
  
  let prefix = '';
  if (rel === 24) {
    return '익일 오전 05:00';
  }
  if (rel >= 19) { // 24:00 to 04:59 are next day calendar-wise
    prefix = '익일 ';
  }
  
  const hourStr = String(displayHour).padStart(2, '0');
  return `${prefix}${ampm} ${hourStr}:00`;
}

// Logical date helper based on 05:00 AM boundary
function getLogicalDate() {
  const now = new Date();
  const currentHour = now.getHours();
  
  if (currentHour < 5) {
    const prev = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return formatDateString(prev);
  }
  return formatDateString(now);
}

function formatDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getKoreanDateDisplay(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  return `${y}년 ${m}월 ${d}일 ${weekdays[date.getDay()]}`;
}

// Get array of past N dates
function getPastDates(n) {
  const dates = [];
  const baseDate = new Date();
  // Adjust base date if we are currently before 5:00 AM
  if (baseDate.getHours() < 5) {
    baseDate.setTime(baseDate.getTime() - 24 * 60 * 60 * 1000);
  }
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(baseDate.getTime() - i * 24 * 60 * 60 * 1000);
    dates.push(formatDateString(d));
  }
  return dates;
}

// --- 3. STORAGE & STATE LOAD/SAVE ---
function loadStateFromStorage() {
  const storedUser = localStorage.getItem('mind5_user');
  const storedSessions = localStorage.getItem('mind5_sessions');
  const storedLogs = localStorage.getItem('mind5_mood_logs');

  if (storedUser) {
    appState.user = JSON.parse(storedUser);
  }
  
  if (storedSessions) {
    appState.sessions = JSON.parse(storedSessions);
  } else {
    appState.sessions = [...DEFAULT_SESSIONS];
  }

  if (storedLogs) {
    appState.moodLogs = JSON.parse(storedLogs);
  } else {
    // Generate beautiful sample logs if empty
    generateSampleData();
  }
}

function saveStateToStorage() {
  localStorage.setItem('mind5_user', JSON.stringify(appState.user));
  localStorage.setItem('mind5_sessions', JSON.stringify(appState.sessions));
  localStorage.setItem('mind5_mood_logs', JSON.stringify(appState.moodLogs));
}

// Generate past 7 days of emotional logs
function generateSampleData() {
  const pastDates = getPastDates(7);
  const sampleTags = ['업무', '휴식', '대화', '식사', '운동', '취미', '가족', '공부'];
  const sampleNotes = {
    // Session moods
    joy: ['기분 좋은 하루의 시작!', '회의 결과가 좋아서 만족스럽다', '맛있는 음식을 먹고 기분 전환', '기다렸던 선물을 받았다!'],
    sadness: ['생각대로 일이 안 풀려서 우울함', '괜히 울적한 날', '친구와 소소하게 서운한 감정이 생김', '흐린 날씨 탓인지 가라앉는다'],
    anger: ['불합리한 일정 조율 때문에 속상함', '길에서 무례한 사람을 만남', '답답한 진행 상황에 짜증이 났다', '몸도 마음도 예민한 편'],
    disgust: ['음식이 너무 맛이 없고 불친절했다', '답답한 업무 프로세스에 넌덜머리가 난다', '지하철 무질서에 피로감을 느낌'],
    fear: ['내일 있을 중요한 발표로 불안하고 무섭다', '실수할까 봐 조마조마함', '불안감이 엄습하는 시간'],
    surprise: ['생각지 못한 깜짝 선물을 받았다!', '동료의 승진 소식에 깜짝 놀람', '갑작스러운 일정 조정을 통보받아 어리둥절함'],
    
    // Daily overall moods
    alert: ['정신이 맑고 집중력이 최고조였던 하루', '기민하게 업무 처리를 완수한 뿌듯함'],
    excited: ['다음 주 여행 계획으로 하루 종일 설레는 마음', '새로운 취미를 시작해서 아주 신선한 하루'],
    elated: ['일이 정말 잘 풀리고 최고의 텐션이었던 날!', '축하할 일이 생겨서 하늘을 날아갈 것 같음'],
    happy: ['소소하게 평온하고 행복감이 가득했던 하루', '가족들과 평화로운 저녁을 보내며 만끽한 행복'],
    contented: ['욕심 부리지 않고 나 스스로에게 아주 만족스러운 날', '오늘 하루 내가 해낸 것에 잔잔하게 만족한다'],
    serene: ['마음에 어떠한 파도도 치지 않은 극도의 평온함', '조용히 흘러간 평화로운 세레니티'],
    relaxed: ['스케줄 없이 온전히 나만을 위해 느긋하게 쉰 날', '휴식의 달콤함을 제대로 느낀 여유로운 하루'],
    calm: ['차분하게 밀린 생각들을 정리하고 차 한 잔 한 시간', '안정된 텐션으로 보낸 평범하고 차분한 일상'],
    fatigued: ['과도한 회의와 업무로 온몸이 녹초가 된 하루', '몸이 너무 묵직하고 피로가 누적됨'],
    lethargic: ['침대 밖으로 한 걸음도 나오기 싫고 무기력했던 날', '아무 의욕도 에너지도 생기지 않는 하루'],
    depressed: ['마음 한구석이 텅 빈 것처럼 깊이 우울했던 하루', '울적하고 슬픈 생각들이 맴돈 가라앉은 날'],
    sad: ['슬픈 영화를 본 것처럼 눈물샘이 약해졌던 하루', '소소한 이별과 서운함에 가슴 아픈 슬픈 날'],
    upset: ['동료와 사소하게 말다툼을 해서 속상한 마음', '기대했던 성과에 못 미쳐서 못내 속상함'],
    stressed: ['마감 압박과 독촉으로 스트레스 지수가 극에 달함', '예민하고 답답해서 심호흡이 필요했던 하루'],
    nervous: ['큰 면접과 심사를 앞두고 하루 종일 긴장하고 떨림', '심장이 쿵쾅거리고 안절부절못한 긴장의 연속'],
    tense: ['조마조마하고 불안감이 가시지 않아 예민했던 날', '온몸의 근육이 경직된 듯한 팽팽한 텐션']
  };

  // Generate logs for past 6 days (excluding logical today)
  for (let i = 0; i < pastDates.length - 1; i++) {
    const date = pastDates[i];
    appState.moodLogs[date] = {};
    
    // Choose 3 or 4 sessions to log randomly (using SESSION_MOODS)
    appState.sessions.forEach(session => {
      // 80% chance of logging each session for high fidelity
      if (Math.random() > 0.15) {
        let mood;
        if (i <= 2) {
          // Mid week: sadness, anger, disgust, fear
          const negativeOrIntense = ['sadness', 'anger', 'disgust', 'fear'];
          mood = negativeOrIntense[Math.floor(Math.random() * negativeOrIntense.length)];
        } else {
          // Weekend/Friday: joy, surprise
          const positiveOrSurprise = ['joy', 'surprise'];
          mood = positiveOrSurprise[Math.floor(Math.random() * positiveOrSurprise.length)];
        }
        
        const tags = [];
        const tagCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 tags
        while (tags.length < tagCount) {
          const t = sampleTags[Math.floor(Math.random() * sampleTags.length)];
          if (!tags.includes(t)) tags.push(t);
        }

        const notes = sampleNotes[mood];
        const note = notes[Math.floor(Math.random() * notes.length)];

        appState.moodLogs[date][session.id] = {
          mood: mood,
          tags: tags,
          note: note,
          timestamp: new Date().getTime()
        };
      }
    });

    // Generate daily overall mood for mock data (using DAILY_MOODS)
    let overallMood;
    if (i <= 2) {
      // Mid week: fatigued, lethargic, depressed, sad, upset, stressed, nervous, tense
      const negativeAndNeutral = ['fatigued', 'lethargic', 'depressed', 'sad', 'upset', 'stressed', 'nervous', 'tense'];
      overallMood = negativeAndNeutral[Math.floor(Math.random() * negativeAndNeutral.length)];
    } else {
      // Weekend/Friday: alert, excited, elated, happy, contented, serene, relaxed, calm
      const positiveAndNeutral = ['alert', 'excited', 'elated', 'happy', 'contented', 'serene', 'relaxed', 'calm'];
      overallMood = positiveAndNeutral[Math.floor(Math.random() * positiveAndNeutral.length)];
    }
    appState.moodLogs[date]['overall'] = {
      mood: overallMood,
      tags: [sampleTags[Math.floor(Math.random() * sampleTags.length)], '휴식'],
      note: '오늘 하루 전체적으로 무난하고 보람찬 편이었다.',
      timestamp: new Date().getTime()
    };
  }
  
  // Make logical today partially logged (e.g. only first session)
  const today = pastDates[pastDates.length - 1];
  appState.moodLogs[today] = {};
  if (appState.sessions.length > 0) {
    appState.moodLogs[today][appState.sessions[0].id] = {
      mood: 'joy',
      tags: ['휴식', '식사'],
      note: '상쾌한 금요일 오전 아침 기록.',
      timestamp: new Date().getTime()
    };
  }
  
  appState.moodLogs[today]['overall'] = {
    mood: 'elated',
    tags: ['공부', '업무'],
    note: '오늘 하루 계획한 모든 과업을 끝내서 매우 뿌듯한 기분!',
    timestamp: new Date().getTime()
  };

  saveStateToStorage();
}

// --- 4. VIEW CONTROLLER (SPA) ---
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const pages = document.querySelectorAll('.app-page');
  const appNav = document.getElementById('appNav');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetPage = item.getAttribute('data-page');
      
      // Update nav active state
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      // Show target page, hide others
      pages.forEach(page => {
        if (page.id === targetPage) {
          page.classList.add('active');
          // Trigger custom renders when visiting specific pages
          if (targetPage === 'pageStats') {
            renderStatistics();
          } else if (targetPage === 'pageDashboard') {
            renderDashboard();
          } else if (targetPage === 'pageSettings') {
            renderSettings();
          }
        } else {
          page.classList.remove('active');
        }
      });
    });
  });

  // Home setting link
  document.getElementById('btnGoToCustomizer').addEventListener('click', () => {
    navigateToPage('pageSettings');
  });

  document.getElementById('btnSettingsToggle').addEventListener('click', () => {
    navigateToPage('pageSettings');
  });

  document.getElementById('btnCloseSettings').addEventListener('click', () => {
    navigateToPage('pageDashboard');
  });
}

function navigateToPage(pageId) {
  const navItem = document.querySelector(`.nav-item[data-page="${pageId}"]`);
  if (navItem) {
    navItem.click();
  }
}

function showToast(message) {
  let toast = document.querySelector('.toast-msg');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-msg';
    document.querySelector('.phone-frame').appendChild(toast);
  }
  toast.innerText = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2300);
}

// Update clock status bar
function updatePhoneClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const statusTime = document.getElementById('statusTime');
  if (statusTime) {
    statusTime.innerText = `${hours}:${mins}`;
  }
}
setInterval(updatePhoneClock, 30000);
updatePhoneClock();

// --- 5. SOCIAL LOGIN ---
function initLogin() {
  const pageLogin = document.getElementById('pageLogin');
  const btnKakao = document.getElementById('btnKakaoLogin');
  const btnGoogle = document.getElementById('btnGoogleLogin');
  const appNav = document.getElementById('appNav');

  if (appState.user) {
    // Already logged in
    pageLogin.classList.remove('active');
    appNav.style.display = 'flex';
    navigateToPage('pageDashboard');
  } else {
    // Show login page
    pageLogin.classList.add('active');
    appNav.style.display = 'none';
    initCarousel();
  }

  const handleLogin = (provider, name, email) => {
    appState.user = { platform: provider, name: name, email: email };
    saveStateToStorage();
    
    showToast(`${name}님, ${provider} 계정으로 로그인되었습니다.`);
    
    // Animate transition
    pageLogin.classList.remove('active');
    setTimeout(() => {
      appNav.style.display = 'flex';
      renderDashboard();
      navigateToPage('pageDashboard');
    }, 400);
  };

  btnKakao.addEventListener('click', () => handleLogin('Kakao', '김유나', 'yuna@kakao.com'));
  btnGoogle.addEventListener('click', () => handleLogin('Google', '김유나', 'yuna@gmail.com'));
}

// Carousel slider logic for login page
function initCarousel() {
  const track = document.getElementById('carouselTrack');
  const dots = document.querySelectorAll('#carouselDots .dot');
  let currentSlide = 0;
  
  function updateCarousel() {
    track.style.transform = `translateX(-${currentSlide * 33.333}%)`;
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentSlide);
    });
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      currentSlide = idx;
      updateCarousel();
    });
  });

  // Auto transition every 4.5 seconds
  let interval = setInterval(() => {
    if (!document.getElementById('pageLogin').classList.contains('active')) {
      clearInterval(interval);
      return;
    }
    currentSlide = (currentSlide + 1) % 3;
    updateCarousel();
  }, 4500);
}

// --- 6. DASHBOARD & TIMELINE RENDERING ---
function renderDashboard() {
  if (!appState.user) return;

  const today = getLogicalDate();
  document.getElementById('todayDate').innerText = getKoreanDateDisplay(today);
  document.getElementById('welcomeMsg').innerText = `반가워요, ${appState.user.name}님`;

  const timelineContainer = document.getElementById('sessionTimeline');
  timelineContainer.innerHTML = '';

  const dayLogs = appState.moodLogs[today] || {};
  
  // Render Daily Overall Mood Card
  const overallContainer = document.getElementById('overallMoodContainer');
  const overallLog = dayLogs['overall'];
  const isOverallLogged = !!overallLog;

  overallContainer.innerHTML = '';

  const overallCard = document.createElement('div');
  overallCard.className = `overall-mood-card ${isOverallLogged ? 'logged' : 'unlogged'}`;

  if (isOverallLogged) {
    const moodConfig = getMoodConfig(overallLog.mood);
    overallCard.style.setProperty('--card-border-color', moodConfig.color);
    overallCard.style.background = `linear-gradient(135deg, ${moodConfig.bg} 0%, rgba(17, 20, 41, 0.7) 100%)`;

    overallCard.innerHTML = `
      <div class="overall-title-row">
        <h3>오늘 하루의 종합 마음</h3>
        <span class="overall-badge">종합</span>
      </div>
      <div class="overall-logged-body">
        <div class="overall-logged-left">
          <span class="overall-mood-text">${moodConfig.label}</span>
          <span class="overall-mood-note">"${overallLog.note || '하루 마음 총평 없음'}"</span>
          <div class="overall-mood-tags">
            ${overallLog.tags.map(t => `<span class="tag-mini">#${t}</span>`).join('')}
          </div>
        </div>
        <div class="overall-logged-right">${moodConfig.emoji}</div>
      </div>
    `;
  } else {
    overallCard.innerHTML = `
      <div class="overall-logged-left">
        <div class="overall-title-row">
          <h3>오늘 하루의 종합 마음</h3>
          <span class="overall-badge">기록 대기</span>
        </div>
        <span class="overall-desc">오늘 하루를 전체적으로 돌아보며 마음을 남겨주세요.</span>
      </div>
      <button class="btn-overall-log">총평 기록</button>
    `;
  }

  overallCard.addEventListener('click', () => {
    openLoggingModal({ id: 'overall', name: '오늘 하루의 종합 마음', start: null, end: null }, overallLog);
  });

  overallContainer.appendChild(overallCard);

  let loggedCount = 0;

  appState.sessions.forEach(session => {
    const log = dayLogs[session.id];
    const isLogged = !!log;
    
    const card = document.createElement('div');
    card.className = `timeline-card ${isLogged ? 'logged' : 'unlogged'}`;
    
    // Set custom border color mapping if logged
    if (isLogged) {
      const moodConfig = getMoodConfig(log.mood);
      card.style.setProperty('--card-border-color', moodConfig.color);
      card.style.background = `linear-gradient(135deg, ${moodConfig.bg} 0%, rgba(17, 20, 41, 0.7) 100%)`;
    }

    const timeRangeStr = `${formatHourStr(session.start)} - ${formatHourStr(session.end)}`;

    card.innerHTML = `
      <div class="card-left">
        <span class="session-name">${session.name}</span>
        <span class="session-time">${timeRangeStr}</span>
        ${isLogged ? `<span class="mood-note">"${log.note || '메모 없음'}"</span>` : ''}
      </div>
      <div class="card-right">
        ${isLogged ? `
          <div class="logged-mood-info">
            <div class="mood-badge-details">
              <span class="mood-badge-label">${getMoodConfig(log.mood).label}</span>
              <div class="mood-badge-tags">
                ${log.tags.map(t => `<span class="tag-mini">#${t}</span>`).join('')}
              </div>
            </div>
            <span class="mood-badge-emoji">${getMoodConfig(log.mood).emoji}</span>
          </div>
        ` : `
          <span>기록하기</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
        `}
      </div>
    `;

    card.addEventListener('click', () => {
      openLoggingModal(session, log);
    });

    timelineContainer.appendChild(card);
    if (isLogged) loggedCount++;
  });

  // Update progress widget
  const totalCount = appState.sessions.length;
  const progressPercent = totalCount > 0 ? (loggedCount / totalCount) * 100 : 0;
  
  document.getElementById('progressText').innerText = `${loggedCount} / ${totalCount} 완료`;
  document.getElementById('progressBar').style.width = `${progressPercent}%`;
}

// --- 7. EMOTION LOGGING BOTTOM SHEET ---
function openLoggingModal(session, existingLog = null) {
  appState.activeLogSession = session;
  appState.selectedMood = existingLog ? existingLog.mood : null;
  appState.selectedTags = existingLog ? [...existingLog.tags] : [];

  if (session.id === 'overall') {
    document.getElementById('modalSessionTime').innerText = session.name;
  } else {
    const timeRangeStr = `${formatHourStr(session.start)} - ${formatHourStr(session.end)}`;
    document.getElementById('modalSessionTime').innerText = `${session.name} (${timeRangeStr})`;
  }
  
  // Note input field
  const noteInput = document.getElementById('inputNote');
  noteInput.value = existingLog ? existingLog.note : '';
  document.getElementById('charCount').innerText = noteInput.value.length;

  // Choose the appropriate moods list depending on whether it is overall daily log or time session log
  const activeMoodsList = session.id === 'overall' ? DAILY_MOODS : SESSION_MOODS;

  // Render mood active buttons dynamically
  const moodGrid = document.getElementById('emotionGrid');
  moodGrid.innerHTML = '';
  
  // Set dynamic column template: 4 columns for 16 overall daily moods, 3 columns for 6 session moods
  moodGrid.style.gridTemplateColumns = session.id === 'overall' ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)';
  
  Object.keys(activeMoodsList).forEach(moodType => {
    const moodConfig = activeMoodsList[moodType];
    const btn = document.createElement('button');
    btn.className = `emotion-card ${moodType === appState.selectedMood ? 'active' : ''}`;
    btn.setAttribute('data-mood', moodType);
    
    // Set custom HSL values dynamically for custom active states in CSS
    btn.style.setProperty('--mood-color', moodConfig.color);
    btn.style.setProperty('--mood-bg', moodConfig.bg);
    
    btn.innerHTML = `
      <span class="emotion-emoji">${moodConfig.emoji}</span>
      <span class="emotion-label">${moodConfig.label}</span>
    `;
    
    btn.onclick = () => {
      document.querySelectorAll('.emotion-card').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      appState.selectedMood = moodType;
    };
    
    moodGrid.appendChild(btn);
  });

  // Render tag selection
  const tagChips = document.querySelectorAll('.tag-chip');
  tagChips.forEach(chip => {
    const tag = chip.getAttribute('data-tag');
    chip.classList.toggle('active', appState.selectedTags.includes(tag));

    chip.onclick = () => {
      if (appState.selectedTags.includes(tag)) {
        appState.selectedTags = appState.selectedTags.filter(t => t !== tag);
        chip.classList.remove('active');
      } else {
        if (appState.selectedTags.length >= 3) {
          showToast('키워드는 최대 3개까지 선택할 수 있습니다.');
          return;
        }
        appState.selectedTags.push(tag);
        chip.classList.add('active');
      }
    };
  });

  // Show Modal Overlay
  const modal = document.getElementById('loggingModal');
  modal.classList.add('active');
}

function closeLoggingModal() {
  document.getElementById('loggingModal').classList.remove('active');
  appState.activeLogSession = null;
  appState.selectedMood = null;
  appState.selectedTags = [];
}

// Character counter for note input
document.getElementById('inputNote').addEventListener('input', (e) => {
  document.getElementById('charCount').innerText = e.target.value.length;
});

// Setup Modal Buttons
document.getElementById('btnCloseModal').addEventListener('click', closeLoggingModal);
document.getElementById('loggingModal').addEventListener('click', (e) => {
  if (e.target.id === 'loggingModal') {
    closeLoggingModal();
  }
});

document.getElementById('btnSaveLog').addEventListener('click', () => {
  if (!appState.selectedMood) {
    showToast('지금 기분(감정)을 하나 선택해 주세요.');
    return;
  }

  const today = getLogicalDate();
  if (!appState.moodLogs[today]) {
    appState.moodLogs[today] = {};
  }

  const note = document.getElementById('inputNote').value.trim();

  appState.moodLogs[today][appState.activeLogSession.id] = {
    mood: appState.selectedMood,
    tags: [...appState.selectedTags],
    note: note,
    timestamp: new Date().getTime()
  };

  saveStateToStorage();
  closeLoggingModal();
  renderDashboard();
  showToast('마음 기록이 안전하게 저장되었습니다.');
});

// --- 8. SETTINGS & CUSTOM SESSION EDITOR ---
function renderSettings() {
  if (!appState.user) return;

  // Platform details
  document.getElementById('loginPlatform').innerText = `${appState.user.platform} 연동 계정`;
  document.getElementById('loginEmail').innerText = appState.user.email;

  // Custom session rows
  renderEditorSessions();
}

function renderEditorSessions() {
  const container = document.getElementById('editorSessionList');
  container.innerHTML = '';

  appState.sessions.forEach((session, index) => {
    const row = document.createElement('div');
    row.className = 'editor-session-row';
    
    // Build select dropdowns for start and end times (0 to 24)
    let startOptions = '';
    let endOptions = '';
    
    for (let h = 0; h <= 24; h++) {
      const label = formatHourStr(h);
      if (h < 24) {
        startOptions += `<option value="${h}" ${session.start === h ? 'selected' : ''}>${label}</option>`;
      }
      if (h > 0) {
        endOptions += `<option value="${h}" ${session.end === h ? 'selected' : ''}>${label}</option>`;
      }
    }

    row.innerHTML = `
      <input type="text" class="session-edit-name" value="${session.name}" placeholder="세션명" data-idx="${index}">
      <div class="editor-time-picker">
        <select class="session-edit-start" data-idx="${index}">${startOptions}</select>
        <span class="time-sep">~</span>
        <select class="session-edit-end" data-idx="${index}">${endOptions}</select>
      </div>
      ${appState.sessions.length > 1 ? `
        <button class="btn-delete-session" data-idx="${index}">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      ` : ''}
    `;

    // Listeners for changes in rows
    row.querySelector('.session-edit-name').addEventListener('change', (e) => {
      appState.sessions[index].name = e.target.value.trim() || `세션 ${index + 1}`;
    });

    row.querySelector('.session-edit-start').addEventListener('change', (e) => {
      appState.sessions[index].start = parseInt(e.target.value);
    });

    row.querySelector('.session-edit-end').addEventListener('change', (e) => {
      appState.sessions[index].end = parseInt(e.target.value);
    });

    const delBtn = row.querySelector('.btn-delete-session');
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        appState.sessions.splice(index, 1);
        renderEditorSessions();
      });
    }

    container.appendChild(row);
  });
}

// Preset button loaders
document.getElementById('preset4').onclick = () => loadPreset('preset4');
document.getElementById('preset3').onclick = () => loadPreset('preset3');
document.getElementById('presetHourly').onclick = () => loadPreset('presetHourly');

function loadPreset(presetName) {
  // Visual active trigger
  document.querySelectorAll('.btn-preset').forEach(btn => {
    btn.classList.toggle('active', btn.id === presetName);
  });
  
  appState.sessions = JSON.parse(JSON.stringify(PRESETS[presetName]));
  renderEditorSessions();
  showToast(`${presetName === 'presetHourly' ? '매시간' : (presetName === 'preset3' ? '3구간' : '4구간')} 템플릿이 로드되었습니다.`);
}

document.getElementById('btnAddSession').onclick = () => {
  if (appState.sessions.length >= 24) {
    showToast('최대 24개 세션까지만 생성 가능합니다.');
    return;
  }
  
  // Find reasonable default start/end hours
  let lastEnd = 0;
  if (appState.sessions.length > 0) {
    lastEnd = appState.sessions[appState.sessions.length - 1].end;
  }
  
  const newStart = lastEnd < 24 ? lastEnd : 0;
  const newEnd = newStart < 23 ? newStart + 2 : 24;

  appState.sessions.push({
    id: `custom_sess_${new Date().getTime()}`,
    name: `새로운 세션 ${appState.sessions.length + 1}`,
    start: newStart,
    end: newEnd
  });

  renderEditorSessions();
};

document.getElementById('btnResetSessions').onclick = () => {
  appState.sessions = JSON.parse(JSON.stringify(DEFAULT_SESSIONS));
  document.querySelectorAll('.btn-preset').forEach(btn => {
    btn.classList.toggle('active', btn.id === 'preset4');
  });
  renderEditorSessions();
  showToast('시간대 세션이 초기 설정으로 초기화되었습니다.');
};

document.getElementById('btnSaveSessions').onclick = () => {
  // Validate sessions timeline
  // Sort sessions by start relative hour
  const sorted = [...appState.sessions].sort((a, b) => a.start - b.start);
  
  let valid = true;
  let errorMsg = '';

  // Validate overlap and bounds
  for (let i = 0; i < sorted.length; i++) {
    const s = sorted[i];
    if (s.start >= s.end) {
      valid = false;
      errorMsg = `"${s.name}" 세션의 시작 시간은 종료 시간보다 빨라야 합니다.`;
      break;
    }
    
    // Check overlaps
    for (let j = i + 1; j < sorted.length; j++) {
      const other = sorted[j];
      if (s.end > other.start && s.start < other.end) {
        valid = false;
        errorMsg = `"${s.name}"과 "${other.name}" 세션 시간대가 겹칩니다. 확인해 주세요.`;
        break;
      }
    }
    if (!valid) break;
  }

  if (!valid) {
    showToast(errorMsg);
    return;
  }

  // Update sorted state to maintain timeline order
  appState.sessions = sorted;
  saveStateToStorage();
  
  showToast('설정이 성공적으로 저장되었습니다.');
  navigateToPage('pageDashboard');
};

document.getElementById('btnLogout').onclick = () => {
  appState.user = null;
  saveStateToStorage();
  
  showToast('로그아웃 되었습니다.');
  
  // Transition back to login page
  const pageLogin = document.getElementById('pageLogin');
  const appNav = document.getElementById('appNav');
  
  document.querySelectorAll('.app-page').forEach(p => p.classList.remove('active'));
  pageLogin.classList.add('active');
  appNav.style.display = 'none';
  initCarousel();
};

// --- 9. STATISTICS & INTERACTIVE CANVAS CHARTS ---
function renderStatistics() {
  const dates = getPastDates(7);
  
  // Calculate analytics values
  const moodTrendData = [];
  const moodDistribution = {};
  Object.keys(SESSION_MOODS).forEach(m => moodDistribution[m] = 0);
  let totalLogged = 0;
  
  dates.forEach(date => {
    const dayLogs = appState.moodLogs[date] || {};
    const logKeys = Object.keys(dayLogs);
    
    if (logKeys.length > 0) {
      let dailySumScore = 0;
      let validKeysCount = 0;
      logKeys.forEach(k => {
        if (k === 'overall') return; // Skip daily overall mood in session statistics
        const log = dayLogs[k];
        const config = getMoodConfig(log.mood);
        if (config) {
          dailySumScore += config.score;
          moodDistribution[log.mood]++;
          totalLogged++;
          validKeysCount++;
        }
      });
      if (validKeysCount > 0) {
        moodTrendData.push(dailySumScore / validKeysCount);
      } else {
        moodTrendData.push(3); // default neutral middle score
      }
    } else {
      moodTrendData.push(3); // default neutral middle score
    }
  });

  // Render Insight Text dynamically
  const insightParagraph = document.getElementById('insightText');
  if (totalLogged === 0) {
    insightParagraph.innerText = '아직 쌓인 감정 기록이 없습니다. 메인 뷰에서 오늘 첫 감정을 기록해 보세요!';
  } else {
    // Find most frequent mood (from session logs)
    let topMood = 'joy';
    let maxCount = -1;
    Object.keys(moodDistribution).forEach(m => {
      if (moodDistribution[m] > maxCount) {
        maxCount = moodDistribution[m];
        topMood = m;
      }
    });

    const percent = Math.round((maxCount / totalLogged) * 100);
    
    let adviceText = '';
    if (topMood === 'joy') {
      adviceText = ' 기쁜 에너지가 가득하고 긍정적인 하루의 흐름이 보입니다. 이 좋은 리듬을 유지해 보세요!';
    } else if (topMood === 'surprise') {
      adviceText = ' 일상 속 예상치 못한 흥미진진한 일들이 있었네요. 신선한 자극을 긍정적으로 소화해 보세요.';
    } else if (topMood === 'sadness') {
      adviceText = ' 슬픈 마음이 많이 비쳤습니다. 너무 자책하지 마시고 잔잔한 산책이나 음악 감상으로 마음을 달래 주세요.';
    } else if (topMood === 'anger') {
      adviceText = ' 최근 분노와 스트레스 지수가 관측되었습니다. 심호흡과 함께 명상을 통해 마인드컨트롤을 해 보세요.';
    } else if (topMood === 'disgust' || topMood === 'fear') {
      adviceText = ' 답답하고 두려운 감정들이 일지를 채우고 있네요. 신뢰할 수 있는 사람과 속마음을 나눠보는 건 어떨까요?';
    }

    insightParagraph.innerHTML = `유나님은 지난 7일간 <strong>${getMoodConfig(topMood).label}</strong>(${percent}%) 감정을 가장 많이 느끼셨습니다.${adviceText}`;
  }

  // DRAW CANVAS CHARTS
  drawTrendChart(dates, moodTrendData);
  drawDonutChart(moodDistribution, totalLogged);
}

function drawTrendChart(dates, scores) {
  const canvas = document.getElementById('trendChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear
  ctx.clearRect(0, 0, width, height);

  // Padding
  const paddingX = 35;
  const paddingY = 20;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  // Grid Helper Lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  
  // Draw 5 score grid lines (corresponding to mood scores 1 to 5)
  for (let i = 0; i < 5; i++) {
    const y = paddingY + chartH - (i / 4) * chartH;
    ctx.beginPath();
    ctx.moveTo(paddingX, y);
    ctx.lineTo(width - paddingX, y);
    ctx.stroke();
  }
  ctx.setLineDash([]); // Reset line dash

  // Calculate coordinates
  const points = [];
  const stepX = chartW / (dates.length - 1);
  
  scores.forEach((score, index) => {
    // Score ranges from 1 to 5
    const normalized = (score - 1) / 4; 
    const x = paddingX + index * stepX;
    const y = paddingY + chartH - normalized * chartH;
    points.push({ x, y });
  });

  // Draw Gradient Area under curve
  if (points.length > 0) {
    const areaGrad = ctx.createLinearGradient(0, paddingY, 0, height - paddingY);
    areaGrad.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
    areaGrad.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, height - paddingY);
    
    // Draw curve
    ctx.lineTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, p1.x, p1.y);
    }
    
    ctx.lineTo(points[points.length - 1].x, height - paddingY);
    ctx.closePath();
    ctx.fillStyle = areaGrad;
    ctx.fill();
  }

  // Draw main trend curve line
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 3.5;
  ctx.shadowColor = 'rgba(99, 102, 241, 0.4)';
  ctx.shadowBlur = 8;
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpX1 = p0.x + (p1.x - p0.x) / 2;
    const cpY1 = p0.y;
    const cpX2 = p0.x + (p1.x - p0.x) / 2;
    const cpY2 = p1.y;
    ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, p1.x, p1.y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0; // Reset shadow

  // Draw points & Labels
  points.forEach((p, index) => {
    // Circle point
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2.5;
    ctx.fill();
    ctx.stroke();

    // Date Text label under x-axis
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Outfit';
    ctx.textAlign = 'center';
    
    const [_, m, d] = dates[index].split('-');
    ctx.fillText(`${m}/${d}`, p.x, height - 3);
  });
}

function drawDonutChart(distribution, total) {
  const canvas = document.getElementById('donutChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const outerRadius = width / 2 - 10;
  const innerRadius = outerRadius - 22;

  // Handle empty state gracefully
  if (total === 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 22;
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '12px Noto Sans KR';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('데이터 없음', cx, cy);
    
    document.getElementById('donutLegend').innerHTML = '<p style="font-size:11px;color:#64748b;">기록이 등록되면 비율이 표시됩니다.</p>';
    return;
  }

  let currentAngle = -0.5 * Math.PI; // Start from top
  const legendContainer = document.getElementById('donutLegend');
  legendContainer.innerHTML = '';

  // Sort and draw slices (using SESSION_MOODS)
  Object.keys(SESSION_MOODS).forEach(moodKey => {
    const count = distribution[moodKey];
    if (count === 0) return;

    const sliceAngle = (count / total) * 2 * Math.PI;
    const moodConfig = getMoodConfig(moodKey);

    // Draw arc slice
    ctx.beginPath();
    ctx.arc(cx, cy, (outerRadius + innerRadius) / 2, currentAngle, currentAngle + sliceAngle);
    ctx.strokeStyle = moodConfig.color;
    ctx.lineWidth = 22;
    ctx.stroke();

    currentAngle += sliceAngle;

    // Generate Legend Item html
    const percent = Math.round((count / total) * 100);
    const legendItem = document.createElement('div');
    legendItem.className = 'legend-item';
    legendItem.innerHTML = `
      <span class="legend-color" style="background-color: ${moodConfig.color};"></span>
      <span style="font-weight: 500;">${moodConfig.emoji} ${moodConfig.label}</span>
      <span style="margin-left: auto; color: var(--text-muted); font-size:10px;">${percent}%</span>
    `;
    legendContainer.appendChild(legendItem);
  });

  // Center text (Total logs counter)
  ctx.fillStyle = '#f8fafc';
  ctx.font = '700 18px Outfit';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(total, cx, cy - 5);

  ctx.fillStyle = '#64748b';
  ctx.font = '400 9px Noto Sans KR';
  ctx.fillText('총 기록수', cx, cy + 12);
}

// --- 10. SYSTEM INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
  loadStateFromStorage();
  initNavigation();
  initLogin();
});
