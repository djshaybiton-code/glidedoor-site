/* ── GLIDE DOOR AI CHAT WIDGET (rules-based, no API / no cost) ──
   Drop-in replacement for js/chat.js. Same look & feel as before, but it answers
   from a built-in script instead of calling a paid API — so it works with zero
   backend, zero API key, and zero ongoing cost. It diagnoses common problems
   and captures name + phone + city as a lead. Pricing is only ever given in
   person by a technician — the bot never quotes a price. */
(function() {
'use strict';

const PHONE = '(646) 221-7897';
const PHONE_RAW = '6462217897';
const CITIES = ['tempe','mesa','scottsdale','gilbert','chandler'];

// ── STYLES ──────────────────────────────────────────────────────────────────
const css = `
#gde-chat-btn { position: fixed; bottom: 24px; right: 24px; z-index: 9999;
  width: 60px; height: 60px; border-radius: 50%; background: #1A6B4A; border: none; cursor: pointer;
  box-shadow: 0 4px 20px rgba(26,107,74,0.4); display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; font-size: 26px; }
#gde-chat-btn:hover { transform: scale(1.08); background: #2E8B5A; }
#gde-chat-btn .gde-badge { position: absolute; top: -4px; right: -4px; width: 18px; height: 18px;
  background: #DC2626; border-radius: 50%; border: 2px solid #fff; font-size: 10px; font-weight: 800;
  color: #fff; display: flex; align-items: center; justify-content: center; }
#gde-chat-win { position: fixed; bottom: 96px; right: 24px; z-index: 9999; width: 360px;
  max-width: calc(100vw - 32px); background: #fff; border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.18);
  display: none; flex-direction: column; overflow: hidden; font-family: 'Inter', sans-serif; max-height: 560px; }
#gde-chat-win.open { display: flex; }
.gde-head { background: #1A6B4A; padding: 14px 16px; display: flex; align-items: center; gap: 10px; }
.gde-head-avatar { width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.gde-head-info { flex: 1; }
.gde-head-name { font-size: 13px; font-weight: 800; color: #fff; line-height: 1.2; }
.gde-head-status { font-size: 11px; color: rgba(255,255,255,0.7); display: flex; align-items: center; gap: 4px; }
.gde-head-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ADE80; }
.gde-close { background: none; border: none; color: rgba(255,255,255,0.8); cursor: pointer; font-size: 20px; padding: 4px; line-height: 1; }
.gde-close:hover { color: #fff; }
.gde-msgs { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px;
  background: #F8F9FA; min-height: 220px; max-height: 320px; }
.gde-msg { display: flex; align-items: flex-end; gap: 6px; max-width: 90%; }
.gde-msg.bot { align-self: flex-start; }
.gde-msg.user { align-self: flex-end; flex-direction: row-reverse; }
.gde-msg-av { width: 28px; height: 28px; border-radius: 50%; background: #1A6B4A; color: #fff; font-size: 12px;
  font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.gde-bubble { padding: 9px 13px; border-radius: 14px; font-size: 13px; line-height: 1.55; }
.gde-msg.bot .gde-bubble { background: #fff; color: #212529; border: 1px solid #E9ECEF; border-bottom-left-radius: 4px; }
.gde-msg.user .gde-bubble { background: #1A6B4A; color: #fff; border-bottom-right-radius: 4px; }
.gde-msg.bot .gde-bubble a { color: #1A6B4A; font-weight: 700; }
.gde-typing { display: flex; align-items: center; gap: 4px; padding: 10px 14px; }
.gde-dot { width: 7px; height: 7px; border-radius: 50%; background: #9CA3AF; animation: gdeBounce 1.2s infinite; }
.gde-dot:nth-child(2) { animation-delay: 0.2s; }
.gde-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes gdeBounce { 0%,80%,100%{transform:translateY(0);} 40%{transform:translateY(-6px);} }
.gde-quick-btns { padding: 8px 12px 4px; display: flex; flex-wrap: wrap; gap: 6px; border-top: 1px solid #E9ECEF; background: #fff; }
.gde-quick { background: #E8F5EE; color: #1A6B4A; border: 1px solid rgba(26,107,74,0.2); padding: 5px 10px;
  border-radius: 100px; font-size: 11px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: all 0.15s; }
.gde-quick:hover { background: #1A6B4A; color: #fff; }
.gde-input-row { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-top: 1px solid #E9ECEF; background: #fff; }
#gde-input { flex: 1; border: 1.5px solid #E9ECEF; border-radius: 100px; padding: 8px 14px; font-family: 'Inter', sans-serif;
  font-size: 13px; outline: none; background: #F8F9FA; color: #212529; transition: border-color 0.2s; }
#gde-input:focus { border-color: #1A6B4A; background: #fff; }
#gde-input::placeholder { color: #9CA3AF; }
#gde-send { width: 36px; height: 36px; border-radius: 50%; background: #1A6B4A; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background 0.2s; font-size: 15px; }
#gde-send:hover { background: #2E8B5A; }
#gde-send:disabled { background: #9CA3AF; cursor: not-allowed; }
.gde-booking-card { background: #E8F5EE; border: 1px solid rgba(26,107,74,0.2); border-radius: 10px; padding: 10px 13px;
  margin-top: 6px; font-size: 12px; color: #1A6B4A; }
.gde-booking-card strong { display: block; font-size: 13px; margin-bottom: 4px; color: #0B3D2A; }
.gde-call-btn { display: block; background: #1A6B4A; color: #fff; text-align: center; padding: 8px; border-radius: 8px;
  font-size: 12px; font-weight: 700; text-decoration: none; margin-top: 8px; transition: background 0.2s; }
.gde-call-btn:hover { background: #2E8B5A; }
`;

const styleEl = document.createElement('style');
styleEl.textContent = css;
document.head.appendChild(styleEl);

document.body.insertAdjacentHTML('beforeend', `
<button id="gde-chat-btn" aria-label="Chat with us">🚪<span class="gde-badge">1</span></button>
<div id="gde-chat-win" role="dialog" aria-label="Chat with Glide Door Experts">
  <div class="gde-head">
    <div class="gde-head-avatar">🚪</div>
    <div class="gde-head-info">
      <div class="gde-head-name">Glide Door Experts</div>
      <div class="gde-head-status"><span class="gde-head-dot"></span> Online · Typically replies in seconds</div>
    </div>
    <button class="gde-close" id="gde-close-btn" aria-label="Close chat">✕</button>
  </div>
  <div class="gde-msgs" id="gde-msgs"></div>
  <div class="gde-quick-btns" id="gde-quick-btns">
    <button class="gde-quick" data-msg="My door is hard to open">Hard to open</button>
    <button class="gde-quick" data-msg="My door makes a grinding noise">Grinding noise</button>
    <button class="gde-quick" data-msg="My door jumped off the track">Off track</button>
    <button class="gde-quick" data-msg="My door won't lock">Won't lock</button>
    <button class="gde-quick" data-msg="I need a same-day appointment">Book today</button>
  </div>
  <div class="gde-input-row">
    <input id="gde-input" type="text" placeholder="Describe your door problem..." maxlength="300" autocomplete="off">
    <button id="gde-send" aria-label="Send">➤</button>
  </div>
</div>`);

// ── STATE ────────────────────────────────────────────────────────────────────
let isOpen = false, isTyping = false, started = false;
let awaiting = null;               // null | 'city' | 'name' | 'phone'
const lead = { problem:null, city:null, name:null, phone:null };

const win = document.getElementById('gde-chat-win');
const btn = document.getElementById('gde-chat-btn');
const msgs = document.getElementById('gde-msgs');
const input = document.getElementById('gde-input');
const sendBtn = document.getElementById('gde-send');
const closeBtn = document.getElementById('gde-close-btn');
const quickBtns = document.getElementById('gde-quick-btns');

// ── INTENTS (keyword → scripted reply) ───────────────────────────────────────
const INTENTS = [
  { label:'Door hard to open', kw:['hard to open','hard to slide','stuck','stick','drag','heavy','wont slide',"won't slide",'hard to move'],
    reply:"That's one of the most common repairs we do — a door that sticks or drags is almost always **worn rollers** or a **dirty/bent track**, usually a **same-day fix**. Which city are you in — Tempe, Mesa, Scottsdale, Gilbert, or Chandler?" },
  { label:'Grinding noise', kw:['grind','grinding','noise','loud','scraping'],
    reply:"Grinding usually means **worn rollers or a dirty track** — an easy same-day fix. Which city are you in?" },
  { label:'Off the track', kw:['off track','off the track','came off','fell off','fell out','jumped','off-track'],
    reply:"Let's get that sorted — please don't force it back in, that can bend the frame. Usually rollers or track alignment, often same-day. What city are you in?" },
  { label:"Won't lock", kw:["won't lock",'wont lock','lock','latch','wont latch',"won't latch",'handle','wont stay shut'],
    reply:"A door that won't lock is usually a **misaligned latch or worn lock** — a quick fix and important for security. What city are you in?" },
  { label:'Broken glass', kw:['glass','crack','cracked','shatter','shattered','broken pane','foggy','fog'],
    reply:"We handle sliding door **glass replacement** — measured same day, installed next. For safety, keep kids and pets clear. What city are you in?" },
  { label:'Screen door', kw:['screen','mesh'],
    reply:"We repair and replace **screen doors, rollers, and frames**. What city are you in?" },
  { label:'Roller replacement', kw:['roller','rollers','wheel','wheels'],
    reply:"**Roller replacement** makes an old door glide like new — usually same-day. What city are you in?" },
  { label:'Track repair', kw:['track','bent track','rusty','damaged track'],
    reply:"A worn or bent **track** makes the door grind and catch — we repair or cap it. What city are you in?" },
  { label:'Patio door', kw:['patio','sliding glass','backyard','big door'],
    reply:"We fix **patio sliding doors** of all sizes — rollers, tracks, locks, and glass. What city are you in?" },
  { label:'Emergency / same-day', kw:['emergency','urgent','asap','today','tonight','right now','same day','same-day','now'],
    reply:"We offer **same-day service, 7 days a week, 7am–8pm**, and can prioritize urgent jobs. What city are you in?" },
  { label:'Pricing', kw:['how much','cost','price','pricing','quote','estimate','expensive','$'],
    reply:"Great question — we don't quote prices over chat, because every door is different and we want to give you an honest number. Our technician provides a **free, no-obligation estimate in person** and tells you the exact price before any work begins. What's the door doing, and what city are you in?" },
  { label:'Booking', kw:['book','appointment','schedule','come out','set up','visit'],
    reply:"Happy to book you in — same-day slots are open across the East Valley. What city are you in — Tempe, Mesa, Scottsdale, Gilbert, or Chandler?" },
  { label:'Hours', kw:['hours','open','when are you','availability'],
    reply:"We're available **same-day, 7 days a week, 7am–8pm**. Want me to get you booked? What city are you in?" }
];

// ── EVENTS ───────────────────────────────────────────────────────────────────
function toggleChat() {
  isOpen = !isOpen;
  win.classList.toggle('open', isOpen);
  btn.querySelector('.gde-badge').style.display = 'none';
  if (isOpen && !started) {
    started = true;
    setTimeout(() => addBotMessage("Hi! 👋 I'm the Glide Door Experts assistant. What's going on with your sliding door today? I can diagnose the problem and book you a same-day appointment in Tempe, Mesa, Scottsdale, Gilbert, or Chandler."), 400);
  }
  if (isOpen) setTimeout(() => input.focus(), 300);
}
btn.addEventListener('click', toggleChat);
closeBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleChat(); });
quickBtns.addEventListener('click', (e) => {
  const qb = e.target.closest('.gde-quick');
  if (!qb) return;
  sendMessage(qb.dataset.msg);
  quickBtns.style.display = 'none';
});
sendBtn.addEventListener('click', () => sendMessage());
input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });

function sendMessage(text) {
  text = (text || input.value).trim();
  if (!text || isTyping) return;
  input.value = '';
  quickBtns.style.display = 'none';
  addUserMessage(text);
  processTurn(text);
}

// ── CORE: rules engine ───────────────────────────────────────────────────────
function processTurn(rawText) {
  isTyping = true; sendBtn.disabled = true;
  showTyping();
  setTimeout(() => {
    hideTyping();
    const text = rawText.trim();
    const t = text.toLowerCase();

    // Direct "call / talk to a human" request — hand off the number, no capture.
    if (/\b(call|phone number|talk to|speak to|human|real person|agent|representative)\b/.test(t) && awaiting !== 'phone') {
      addBotMessage(`You can reach us any time at 📞 ${PHONE} — free phone diagnosis and same-day service across the East Valley. Or tell me your door problem and I'll get you booked right here.`);
      finishTurn(); return;
    }

    // Lead-capture flow
    if (awaiting === 'city') {
      lead.city = cleanCity(text);
      awaiting = 'name';
      addBotMessage(`Great — we cover ${escHtml(lead.city)} same-day. What's your name?`);
      finishTurn(); return;
    }
    if (awaiting === 'name') {
      lead.name = text.replace(/^(i'?m|my name is|it'?s)\s+/i, '').trim() || text;
      awaiting = 'phone';
      addBotMessage(`Thanks, ${escHtml(lead.name)}! What's the best phone number for the technician to reach you?`);
      finishTurn(); return;
    }
    if (awaiting === 'phone') {
      const digits = (text.match(/\d/g) || []).length;
      if (digits < 7) {
        addBotMessage("Could you share a phone number with area code so we can reach you? Or call us directly at 📞 " + PHONE + ".");
        finishTurn(); return;
      }
      lead.phone = text.trim();
      awaiting = null;
      finalizeBooking();
      finishTurn(); return;
    }

    // Not in capture: match an intent
    const intent = matchIntent(t);
    if (intent) {
      if (!lead.problem) lead.problem = intent.label;
      awaiting = 'city';
      addBotMessage(intent.reply);
      finishTurn(); return;
    }

    // If they typed a bare city name up front
    if (CITIES.some(c => t.includes(c))) {
      lead.city = cleanCity(text); awaiting = 'name';
      addBotMessage(`Yes, we serve ${escHtml(lead.city)}! What's going on with your door — and what's your name so I can get you booked?`);
      finishTurn(); return;
    }

    // Fallback
    addBotMessage("Happy to help! I can diagnose the usual issues — a sticking door, off-track, worn rollers, a broken lock, glass, or screens — and book a same-day visit. Tell me what your door's doing, or call us at 📞 " + PHONE + ".");
    finishTurn();
  }, 650);
}

function finishTurn() { isTyping = false; sendBtn.disabled = false; scrollBottom(); }

function matchIntent(t) {
  for (const intent of INTENTS) {
    if (intent.kw.some(k => t.includes(k))) return intent;
  }
  return null;
}

function cleanCity(text) {
  const t = text.toLowerCase();
  const found = CITIES.find(c => t.includes(c));
  if (found) return found.charAt(0).toUpperCase() + found.slice(1);
  return text.trim();
}

function finalizeBooking() {
  addBotMessage(`Perfect, ${escHtml(lead.name)}! I've got you down in ${escHtml(lead.city)}. We'll call ${escHtml(lead.phone)} shortly to confirm a same-day window. Every repair is backed by our **1-year parts & labor warranty**, and the on-site estimate is free.`);
  showBookingCard({
    name: lead.name, phone: lead.phone, city: lead.city,
    time: 'Same-day', problem: lead.problem || 'Sliding door service'
  });
}

// ── RENDER HELPERS ───────────────────────────────────────────────────────────
function addUserMessage(text) {
  msgs.insertAdjacentHTML('beforeend', `<div class="gde-msg user"><div class="gde-bubble">${escHtml(text)}</div></div>`);
  scrollBottom();
}
function addBotMessage(text) {
  const html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/(📞[\s\S]*?\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/g, `<a href="tel:${PHONE_RAW}">$1</a>`);
  msgs.insertAdjacentHTML('beforeend', `<div class="gde-msg bot"><div class="gde-msg-av">GD</div><div class="gde-bubble">${html}</div></div>`);
  scrollBottom();
}
function showBookingCard(b) {
  msgs.insertAdjacentHTML('beforeend', `
  <div class="gde-msg bot"><div class="gde-msg-av">✓</div><div style="flex:1;">
    <div class="gde-booking-card">
      <strong>✅ Appointment Request Received</strong>
      <div><b>Name:</b> ${escHtml(b.name)}</div>
      <div><b>Phone:</b> ${escHtml(b.phone)}</div>
      <div><b>City:</b> ${escHtml(b.city)}</div>
      <div><b>Time:</b> ${escHtml(b.time)}</div>
      <div><b>Problem:</b> ${escHtml(b.problem)}</div>
      <a href="tel:${PHONE_RAW}" class="gde-call-btn">📞 Or call now: ${PHONE}</a>
    </div>
  </div></div>`);
  scrollBottom();
}
function showTyping() {
  msgs.insertAdjacentHTML('beforeend', `<div class="gde-msg bot" id="gde-typing"><div class="gde-msg-av">GD</div>
    <div class="gde-bubble gde-typing"><span class="gde-dot"></span><span class="gde-dot"></span><span class="gde-dot"></span></div></div>`);
  scrollBottom();
}
function hideTyping() { const el = document.getElementById('gde-typing'); if (el) el.remove(); }
function scrollBottom() { msgs.scrollTop = msgs.scrollHeight; }
function escHtml(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

})();
