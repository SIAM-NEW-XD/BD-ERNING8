// app.js  (moved from original bot.html)
// NOTE: DO NOT commit real botToken into public repo.
// Use a serverless function / backend endpoint to send messages to Telegram.

let points = 0;
let balance = 0.00;
let historyLog = [];
let tgUser = null;
const pointsPerAd = 1;
const ratePerPoint = 5.05;

// Config: replace BACKEND_SEND_WITHDRAW_URL with your backend URL that will forward message to Telegram bot.
// e.g. https://your-server.example.com/send-telegram (POST { chat_id, text })
const BACKEND_SEND_WITHDRAW_URL = "REPLACE_WITH_YOUR_BACKEND_ENDPOINT";

// DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  document.getElementById('confirm-withdraw-btn').addEventListener('click', requestWithdraw);
});

function initApp() {
  if (window.Telegram && Telegram.WebApp) {
    try {
      Telegram.WebApp.ready();
      Telegram.WebApp.expand();
      tgUser = Telegram.WebApp.initDataUnsafe && Telegram.WebApp.initDataUnsafe.user ? Telegram.WebApp.initDataUnsafe.user : null;
    } catch (e) { console.warn("Telegram WebApp init error:", e); }
  }
  loadData();
  loadTelegramUser();
  showView('home-view');
  renderLeaderboard();
  initializeInAppAds();
}

// Try initialize monetag in-app ads (original used show_9168587)
function initializeInAppAds() {
  if (typeof show_9168587 === 'function') {
    show_9168587({
      type: 'inApp',
      inAppSettings: { frequency: 2, capping: 0.1, interval: 30, timeout: 5, everyPage: false }
    });
    console.log("Automatic In-App Interstitial Ads Initialized.");
  } else {
    console.warn("Monetag SDK not ready for In-App Ads.");
    // optional: retry logic removed for static host
  }
}

// View navigation
function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const el = document.getElementById(viewId);
  if (el) el.classList.add('active');

  document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
  const activeBtn = Array.from(document.querySelectorAll('.nav-button')).find(b => b.getAttribute('onclick') && b.getAttribute('onclick').includes(viewId));
  if (activeBtn) activeBtn.classList.add('active');

  if (viewId === 'history-view') renderHistory();
}

// Persistence
function loadData() {
  const saved = localStorage.getItem('easyEarningBotV2');
  if (saved) {
    const d = JSON.parse(saved);
    points = d.points || 0;
    balance = d.balance || 0;
    historyLog = d.historyLog || [];
  }
  updateDisplay();
}
function saveData() {
  localStorage.setItem('easyEarningBotV2', JSON.stringify({ points, balance, historyLog }));
}
function updateDisplay() {
  document.getElementById('points-value').textContent = points;
  document.getElementById('balance-value').textContent = `৳${balance.toFixed(2)}`;
}

// Telegram user info
function loadTelegramUser() {
  if (tgUser) {
    document.getElementById('username').textContent = tgUser.first_name || 'Telegram User';
    const profilePicDiv = document.getElementById('profile-pic');
    if (tgUser.photo_url) {
      profilePicDiv.innerHTML = `<img src="${tgUser.photo_url}" alt="P">`;
    } else {
      profilePicDiv.textContent = (tgUser.first_name || 'U').charAt(0);
    }
  } else {
    // fallback text
    document.getElementById('username').textContent = 'Guest';
  }
}

// History
function addToHistory(type, detail) {
  const timestamp = new Date().toISOString();
  historyLog.unshift({ type, detail, timestamp });
  if (historyLog.length > 50) historyLog.pop();
  saveData();
}
function renderHistory() {
  const list = document.getElementById('history-list');
  if (!historyLog || historyLog.length === 0) {
    list.innerHTML = `<div class="list-item"><div class="info"><div class="name">No activity yet.</div><div class="detail">Watch some ads to get started!</div></div></div>`;
    return;
  }
  list.innerHTML = historyLog.map(item => {
    const icon = item.type === 'earn' ? '<i class="fa-solid fa-plus-circle" style="color: var(--primary-color);"></i>' : '<i class="fa-solid fa-paper-plane" style="color: var(--accent-color);"></i>';
    return `
      <div class="list-item">
        <div class="history-icon">${icon}</div>
        <div class="info">
          <div class="name">${item.detail}</div>
          <div class="detail">${new Date(item.timestamp).toLocaleString()}</div>
        </div>
      </div>`;
  }).join('');
}

// Leaderboard (static sample)
function renderLeaderboard() {
  const leaderboardData = [
    { name: "CryptoKing", score: 2540, avatar: "https://i.pravatar.cc/150?img=1" },
    { name: "Elena", score: 2210, avatar: "https://i.pravatar.cc/150?img=2" },
    { name: "ProMiner", score: 1980, avatar: "https://i.pravatar.cc/150?img=3" },
    { name: "Aisha", score: 1750, avatar: "https://i.pravatar.cc/150?img=4" },
    { name: "BotMaster", score: 1530, avatar: "https://i.pravatar.cc/150?img=5" },
  ];
  document.getElementById('leaderboard-list').innerHTML = leaderboardData.map((u, idx) => `
    <div class="list-item">
      <div class="rank">#${idx+1}</div>
      <img src="${u.avatar}" class="avatar" alt="Avatar">
      <div class="info"><div class="name">${u.name}</div></div>
      <div class="score">${u.score} pts</div>
    </div>`).join('');
}

// Earning logic (simulate)
function grantReward() {
  points += pointsPerAd;
  balance = points * ratePerPoint;
  updateDisplay();
  addToHistory('earn', `+${pointsPerAd} Point(s) from Ad`);
  saveData();
  try { Telegram.WebApp.HapticFeedback.notificationOccurred('success'); } catch(e){}
  alert(`Congratulations! You've earned +${pointsPerAd} point. Your new balance is ৳${balance.toFixed(2)}.`);
}
function showRewardedInterstitial() {
  if (typeof show_9168587 !== 'function') return alert('Ad provider is not ready.');
  // original used promise style: show_9168587().then(grantReward)
  try {
    show_9168587().then(grantReward).catch(e => alert('Ad could not be shown.'));
  } catch (e) { alert('Ad SDK error'); }
}
function showRewardedPopup() {
  if (typeof show_9168587 !== 'function') return alert('Ad provider is not ready.');
  try {
    show_9168587('pop').then(grantReward).catch(e => alert('Ad could not be shown.'));
  } catch (e) { alert('Ad SDK error'); }
}

// Withdrawal
function openWithdrawModal() {
  if (balance < 5) {
    try { Telegram.WebApp.HapticFeedback.notificationOccurred('error'); } catch(e){}
    return alert("Minimum withdrawal amount is ৳1000. Keep earning!");
  }
  document.getElementById('withdraw-modal').classList.add('active');
}
function closeWithdrawModal() {
  document.getElementById('withdraw-modal').classList.remove('active');
}
async function requestWithdraw() {
  closeWithdrawModal();
  // Send withdraw request to backend to forward to admin via Telegram bot safely
  const userInfo = tgUser ? `@${tgUser.username || ''} (ID: ${tgUser.id || 'N/A'})` : 'Unknown User';
  const message = `💸 *Withdrawal Request*\n\n👤 *User:* ${userInfo}\n💰 *Amount:* ৳${balance.toFixed(2)}\n\n_Please process this request._`;

  if (!BACKEND_SEND_WITHDRAW_URL || BACKEND_SEND_WITHDRAW_URL.includes("REPLACE")) {
    alert("Withdraw endpoint not configured. Configure BACKEND_SEND_WITHDRAW_URL in js/app.js.");
    return;
  }

  try {
    const res = await fetch(BACKEND_SEND_WITHDRAW_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message })
    });
    const data = await res.json();
    if (data.ok) {
      try { Telegram.WebApp.HapticFeedback.notificationOccurred('success'); } catch(e){}
      alert("Your withdrawal request has been sent successfully!");
      addToHistory('withdraw', `Request for ৳${balance.toFixed(2)}`);
    } else {
      try { Telegram.WebApp.HapticFeedback.notificationOccurred('error'); } catch(e){}
      alert("Failed to send request. Please try again later.");
    }
  } catch (err) {
    try { Telegram.WebApp.HapticFeedback.notificationOccurred('error'); } catch(e){}
    alert("An error occurred. Check your connection and try again.");
    console.error(err);
  }
}

// Share
function shareApp() {
  if (!tgUser) return alert("Could not get user data from Telegram.");
  const botUsername = "erningbdpey_bot"; // change if needed
  const referralLink = `https://t.me/${botUsername}?start=${tgUser.id || ''}`;
  const text = `🎉 Join this amazing bot and start earning! Use my link to get a special bonus:\n\n${referralLink}`;
  // copy to clipboard or use share API
  if (navigator.share) {
    navigator.share({ title: 'Earn', text, url: referralLink }).catch(()=>{});
  } else {
    navigator.clipboard?.writeText(text).then(()=>alert('Referral link copied to clipboard.'));
  }
}
