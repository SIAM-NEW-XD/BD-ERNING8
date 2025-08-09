// =======================
// app.js - Full JS Code 
// =======================

// Global Variables
let points = 0;
let balance = 0.00;
let historyLog = [];
let tgUser = null;
const pointsPerAd = 1;
const ratePerPoint = 10;

// Backend URL for sending Telegram withdraw messages
const BACKEND_SEND_WITHDRAW_URL = "https://t.me/HINCOMEBD"; // рждрзЛрж░ API URL ржмрж╕рж╛ржмрж┐ ржПржЦрж╛ржирзЗ

// Monetag SDK Load
const monetagScript = document.createElement('script');
monetagScript.src = '//libtl.com/sdk.js';
monetagScript.dataset.zone = '9690276';
monetagScript.dataset.sdk = 'show_9690276';
document.head.appendChild(monetagScript);

// --------------------
// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  const withdrawBtn = document.getElementById('withdraw-btn') || document.getElementById('confirm-withdraw-btn');
  if (withdrawBtn) withdrawBtn.addEventListener('click', requestWithdraw);
});

function initApp() {
  if (window.Telegram && Telegram.WebApp) {
    try {
      Telegram.WebApp.ready();
      Telegram.WebApp.expand();
      tgUser = Telegram.WebApp.initDataUnsafe && Telegram.WebApp.initDataUnsafe.user ? Telegram.WebApp.initDataUnsafe.user : null;
    } catch (e) {
      console.warn("Telegram WebApp init error:", e);
    }
  }
  loadData();
  loadTelegramUser();
  updateBalanceDisplay();
  renderLeaderboard();
  initializeInAppAds();
  showView && showView('home-view'); // ржпржжрж┐ showView ржерж╛ржХрзЗ
}

// Initialize Monetag Ads
function initializeInAppAds() {
  if (typeof show_9690276 === 'function') {
    show_9690276({
      type: 'inApp',
      inAppSettings: { frequency: 2, capping: 0.1, interval: 30, timeout: 5, everyPage: false }
    });
    console.log("Automatic In-App Interstitial Ads Initialized.");
  } else {
    console.warn("Monetag SDK not ready for In-App Ads.");
  }
}

// View navigation (optional, ржпржжрж┐ ржмрзНржпржмрж╣рж╛рж░ ржХрж░рж┐рж╕)
function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const el = document.getElementById(viewId);
  if (el) el.classList.add('active');

  document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
  const activeBtn = Array.from(document.querySelectorAll('.nav-button'))
    .find(b => b.getAttribute('onclick') && b.getAttribute('onclick').includes(viewId));
  if (activeBtn) activeBtn.classList.add('active');

  if (viewId === 'history-view') renderHistory();
}

// LocalStorage ржерзЗржХрзЗ ржбрж╛ржЯрж╛ рж▓рзЛржб ржПржмржВ рж╕рзЗржн
function loadData() {
  const saved = localStorage.getItem('easyEarningBotV2');
  if (saved) {
    const d = JSON.parse(saved);
    points = d.points || 0;
    balance = d.balance || 0;
    historyLog = d.historyLog || [];
  }
}

function saveData() {
  localStorage.setItem('easyEarningBotV2', JSON.stringify({ points, balance, historyLog }));
}

// ржЗржЙржЬрж╛рж░рзЗрж░ Telegram ржбрж╛ржЯрж╛ рж▓рзЛржб
function loadTelegramUser() {
  if (tgUser) {
    const usernameEl = document.getElementById('username');
    if (usernameEl) usernameEl.textContent = tgUser.first_name || 'Telegram User';

    const profilePicDiv = document.getElementById('profile-pic');
    if (profilePicDiv) {
      if (tgUser.photo_url) {
        profilePicDiv.innerHTML = `<img src="${tgUser.photo_url}" alt="P">`;
      } else {
        profilePicDiv.textContent = (tgUser.first_name || 'U').charAt(0);
      }
    }
  } else {
    const usernameEl = document.getElementById('username');
    if (usernameEl) usernameEl.textContent = 'Guest';
  }
}

// ржмрзНржпрж╛рж▓рзЗржирзНрж╕ UI ржЖржкржбрзЗржЯ
function updateBalanceDisplay() {
  const balEl = document.getElementById('balance-value') || document.getElementById('balance-display');
  if (balEl) balEl.textContent = `рз│${balance.toFixed(2)}`;
  const pointsEl = document.getElementById('points-value');
  if (pointsEl) pointsEl.textContent = points;
}

// History ржлрж╛ржВрж╢ржи
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
    const icon = item.type === 'earn'
      ? '<i class="fa-solid fa-plus-circle" style="color: var(--primary-color);"></i>'
      : '<i class="fa-solid fa-paper-plane" style="color: var(--accent-color);"></i>';
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

// Leaderboard рж░рзЗржирзНржбрж╛рж░
function renderLeaderboard() {
  const leaderboardData = [
    { name: "CryptoKing", score: 2540, avatar: "https://i.pravatar.cc/150?img=1" },
    { name: "Elena", score: 2210, avatar: "https://i.pravatar.cc/150?img=2" },
    { name: "ProMiner", score: 1980, avatar: "https://i.pravatar.cc/150?img=3" },
    { name: "Aisha", score: 1750, avatar: "https://i.pravatar.cc/150?img=4" },
    { name: "BotMaster", score: 1530, avatar: "https://i.pravatar.cc/150?img=5" },
  ];
  const lbList = document.getElementById('leaderboard-list');
  if (!lbList) return;
  lbList.innerHTML = leaderboardData.map((u, idx) => `
    <div class="list-item">
      <div class="rank">#${idx + 1}</div>
      <img src="${u.avatar}" class="avatar" alt="Avatar">
      <div class="info"><div class="name">${u.name}</div></div>
      <div class="score">${u.score} pts</div>
    </div>`).join('');
}

// Ad Reward Logic
function grantReward() {
  points += pointsPerAd;
  balance = points * ratePerPoint;
  updateBalanceDisplay();
  addToHistory('earn', `+${pointsPerAd} Point(s) from Ad`);
  saveData();
  try { Telegram.WebApp.HapticFeedback.notificationOccurred('success'); } catch (e) { }
  alert(`Congratulations! You've earned +${pointsPerAd} point. Your new balance is рз│${balance.toFixed(2)}.`);
}

// Show Rewarded Ads
function showRewardedInterstitial() {
  if (typeof show_9690276 !== 'function') return alert('Ad provider is not ready.');
  try {
    show_9690276().then(grantReward).catch(() => alert('Ad could not be shown.'));
  } catch {
    alert('Ad SDK error');
  }
}
function showRewardedPopup() {
  if (typeof show_9690276 !== 'function') return alert('Ad provider is not ready.');
  try {
    show_9690276('pop').then(grantReward).catch(() => alert('Ad could not be shown.'));
  } catch {
    alert('Ad SDK error');
  }
}

// Withdraw Modal Handling (ржпржжрж┐ modal ржерж╛ржХрзЗ)
function openWithdrawModal() {
  if (balance < 1000) {
    try { Telegram.WebApp.HapticFeedback.notificationOccurred('error'); } catch { }
    return alert("Minimum withdrawal amount is рз│1000. Keep earning!");
  }
  const modal = document.getElementById('withdraw-modal');
  if (modal) modal.classList.add('active');
}
function closeWithdrawModal() {
  const modal = document.getElementById('withdraw-modal');
  if (modal) modal.classList.remove('active');
}

// Withdraw Request Logic with minimum withdraw 1000 enforced
async function requestWithdraw() {
  const amountInput = document.getElementById('withdraw-amount');
  if (!amountInput) {
    alert("Withdraw input not found.");
    return;
  }
  let amount = parseFloat(amountInput.value);
  if (isNaN(amount) || amount < 1000) {
    alert("Minimum withdraw amount is рз│1000.");
    return;
  }
  if (amount > balance) {
    alert("Insufficient balance.");
    return;
  }

  closeWithdrawModal();

  const userInfo = tgUser ? `@${tgUser.username || 'N/A'} (ID: ${tgUser.id || 'N/A'})` : 'Unknown User';
  const message = `ЁЯТ╕ *Withdrawal Request*\n\nЁЯСд *User:* ${userInfo}\nЁЯТ░ *Amount:* рз│${amount.toFixed(2)}\n\n_Please process this request._`;

  if (!BACKEND_SEND_WITHDRAW_URL || BACKEND_SEND_WITHDRAW_URL.includes("REPLACE")) {
    alert("Withdraw endpoint not configured. Configure BACKEND_SEND_WITHDRAW_URL.");
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
      balance -= amount;
      addToHistory('withdraw', `Withdraw requested рз│${amount.toFixed(2)}`);
      saveData();
      updateBalanceDisplay();
      amountInput.value = '';
      alert("Your withdrawal request has been sent successfully!");
      try { Telegram.WebApp.HapticFeedback.notificationOccurred('success'); } catch { }
    } else {
      alert("Failed to send request. Please try again later.");
      try { Telegram.WebApp.HapticFeedback.notificationOccurred('error'); } catch { }
    }
  } catch (err) {
    console.error(err);
    alert("An error occurred. Check your connection and try again.");
    try { Telegram.WebApp.HapticFeedback.notificationOccurred('error'); } catch { }
  }
}

// Share App via Telegram Referral Link
function shareApp() {
  if (!tgUser) return alert("Could not get user data from Telegram.");
  const botUsername = "peyrequest_bot"; // Change if needed
  const referralLink = `https://t.me/${botUsername}?start=${tgUser.id || ''}`;
  const text = `ЁЯОЙ Join this amazing bot and start earning! Use my link to get a special bonus:\n\n${referralLink}`;

  if (navigator.share) {
    navigator.share({ title: 'Earn', text, url: referralLink }).catch(() => { });
  } else {
    navigator.clipboard?.writeText(text).then(() => alert('Referral link copied to clipboard.'));
  }
    }
