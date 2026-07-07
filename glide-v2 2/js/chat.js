/* ── GLIDE DOOR AI CHAT WIDGET ── */
(function() {
  'use strict';

  const PHONE = '(646) 221-7897';
  const PHONE_RAW = '6462217897';
  const BIZ = 'Glide Door Experts LLC';

  const SYSTEM_PROMPT = `You are the virtual assistant for ${BIZ}, a sliding door repair company serving Tempe, Mesa, Scottsdale, Gilbert, and Chandler AZ. Your job is to help customers describe their door problem, diagnose it, give a price estimate, and book a same-day appointment.

PERSONALITY: Friendly, direct, knowledgeable. No fluff. Get to the problem fast.

HOW TO HANDLE CONVERSATIONS:
1. Greet warmly and ask what's going on with their door
2. Ask clarifying questions to diagnose: Is it hard to open? Grinding noise? Jumped off track? Won't lock?
3. Diagnose the likely cause (rollers, track, glass, lock) based on symptoms
4. Give a price range estimate
5. Offer to book them in — ask for their name, phone number, city, and best time today or tomorrow
6. Confirm the booking details and tell them someone will call to confirm within 30 minutes

SERVICES & PRICING:
- Roller replacement: $125–$225 (most common — hard to open, grinding, dropping)
- Track repair/cleaning: $100–$250 (door catches at specific spots, visible damage)
- Glass replacement: $200–$500+ (cracked/shattered — measure same day, install next day)
- Lock & handle repair: $75–$150 (won't latch, handle loose)
- Emergency off-track: $150–$300 (door fallen off completely)
- Screen door repair: $75–$150

SERVICE AREAS: Tempe, Mesa, Scottsdale, Gilbert, Chandler AZ. Same-day 7 days a week, 7am–8pm.

IMPORTANT RULES:
- Always give a price range when diagnosing — never say "I don't know the cost"
- Always mention the 1-year parts & labor warranty
- Always mention free on-site estimate (no obligation)
- If unsure about diagnosis, say "it could be X or Y — we'll know for sure on-site"
- Keep responses SHORT — 2-4 sentences max. This is a chat widget, not an essay.
- If they want to just call, give the number: ${PHONE}
- When collecting booking info, ask ONE question at a time
- After collecting name + phone + city + time, say: "Perfect! I've got [name] down for [city] [time]. We'll call [phone] within 30 minutes to confirm. Is there anything else about the door I should note for the technician?"

BOOKING CONFIRMATION FORMAT:
When you have all booking details, always include this exact string at the end of your message (hidden from display but used by the system):
BOOKING_CONFIRMED:[name]|[phone]|[city]|[time]|[problem description]`;

  // ── STYLES ──────────────────────────────────────────────────────────────────
  const css = `
  #gde-chat-btn {
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    width: 60px; height: 60px; border-radius: 50%;
    background: #1A6B4A; border: none; cursor: pointer;
    box-shadow: 0 4px 20px rgba(26,107,74,0.4);
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s; font-size: 26px;
  }
  #gde-chat-btn:hover { transform: scale(1.08); background: #2E8B5A; }
  #gde-chat-btn .gde-badge {
    position: absolute; top: -4px; right: -4px;
    width: 18px; height: 18px; background: #DC2626; border-radius: 50%;
    border: 2px solid #fff; font-size: 10px; font-weight: 800;
    color: #fff; display: flex; align-items: center; justify-content: center;
  }
  #gde-chat-win {
    position: fixed; bottom: 96px; right: 24px; z-index: 9999;
    width: 360px; max-width: calc(100vw - 32px);
    background: #fff; border-radius: 16px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.18);
    display: none; flex-direction: column;
    overflow: hidden; font-family: 'Inter', sans-serif;
    max-height: 560px;
  }
  #gde-chat-win.open { display: flex; }
  .gde-head {
    background: #1A6B4A; padding: 14px 16px;
    display: flex; align-items: center; gap: 10px;
  }
  .gde-head-avatar {
    width: 38px; height: 38px; border-radius: 50%;
    background: rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }
  .gde-head-info { flex: 1; }
  .gde-head-name { font-size: 13px; font-weight: 800; color: #fff; line-height: 1.2; }
  .gde-head-status { font-size: 11px; color: rgba(255,255,255,0.7); display: flex; align-items: center; gap: 4px; }
  .gde-head-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ADE80; }
  .gde-close {
    background: none; border: none; color: rgba(255,255,255,0.8);
    cursor: pointer; font-size: 20px; padding: 4px; line-height: 1;
  }
  .gde-close:hover { color: #fff; }
  .gde-msgs {
    flex: 1; overflow-y: auto; padding: 14px;
    display: flex; flex-direction: column; gap: 10px;
    background: #F8F9FA; min-height: 220px; max-height: 320px;
  }
  .gde-msg { display: flex; align-items: flex-end; gap: 6px; max-width: 90%; }
  .gde-msg.bot { align-self: flex-start; }
  .gde-msg.user { align-self: flex-end; flex-direction: row-reverse; }
  .gde-msg-av {
    width: 28px; height: 28px; border-radius: 50%;
    background: #1A6B4A; color: #fff; font-size: 12px; font-weight: 800;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .gde-bubble {
    padding: 9px 13px; border-radius: 14px; font-size: 13px; line-height: 1.55;
  }
  .gde-msg.bot .gde-bubble { background: #fff; color: #212529; border: 1px solid #E9ECEF; border-bottom-left-radius: 4px; }
  .gde-msg.user .gde-bubble { background: #1A6B4A; color: #fff; border-bottom-right-radius: 4px; }
  .gde-msg.bot .gde-bubble a { color: #1A6B4A; font-weight: 700; }
  .gde-typing { display: flex; align-items: center; gap: 4px; padding: 10px 14px; }
  .gde-dot { width: 7px; height: 7px; border-radius: 50%; background: #9CA3AF; animation: gdeBounce 1.2s infinite; }
  .gde-dot:nth-child(2) { animation-delay: 0.2s; }
  .gde-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes gdeBounce { 0%,80%,100%{transform:translateY(0);} 40%{transform:translateY(-6px);} }
  .gde-quick-btns {
    padding: 8px 12px 4px; display: flex; flex-wrap: wrap; gap: 6px;
    border-top: 1px solid #E9ECEF; background: #fff;
  }
  .gde-quick {
    background: #E8F5EE; color: #1A6B4A; border: 1px solid rgba(26,107,74,0.2);
    padding: 5px 10px; border-radius: 100px; font-size: 11px; font-weight: 700;
    cursor: pointer; white-space: nowrap; transition: all 0.15s;
  }
  .gde-quick:hover { background: #1A6B4A; color: #fff; }
  .gde-input-row {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 12px; border-top: 1px solid #E9ECEF; background: #fff;
  }
  #gde-input {
    flex: 1; border: 1.5px solid #E9ECEF; border-radius: 100px;
    padding: 8px 14px; font-family: 'Inter', sans-serif; font-size: 13px;
    outline: none; background: #F8F9FA; color: #212529;
    transition: border-color 0.2s;
  }
  #gde-input:focus { border-color: #1A6B4A; background: #fff; }
  #gde-input::placeholder { color: #9CA3AF; }
  #gde-send {
    width: 36px; height: 36px; border-radius: 50%; background: #1A6B4A;
    border: none; cursor: pointer; display: flex; align-items: center;
    justify-content: center; flex-shrink: 0; transition: background 0.2s;
    font-size: 15px;
  }
  #gde-send:hover { background: #2E8B5A; }
  #gde-send:disabled { background: #9CA3AF; cursor: not-allowed; }
  .gde-booking-card {
    background: #E8F5EE; border: 1px solid rgba(26,107,74,0.2);
    border-radius: 10px; padding: 10px 13px; margin-top: 6px;
    font-size: 12px; color: #1A6B4A;
  }
  .gde-booking-card strong { display: block; font-size: 13px; margin-bottom: 4px; color: #0B3D2A; }
  .gde-call-btn {
    display: block; background: #1A6B4A; color: #fff; text-align: center;
    padding: 8px; border-radius: 8px; font-size: 12px; font-weight: 700;
    text-decoration: none; margin-top: 8px; transition: background 0.2s;
  }
  .gde-call-btn:hover { background: #2E8B5A; }
  `;

  // ── INJECT STYLES ────────────────────────────────────────────────────────────
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── INJECT HTML ──────────────────────────────────────────────────────────────
  document.body.insertAdjacentHTML('beforeend', `
  <button id="gde-chat-btn" aria-label="Chat with us">
    🚪
    <span class="gde-badge">1</span>
  </button>
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
  </div>
  `);

  // ── STATE ────────────────────────────────────────────────────────────────────
  let isOpen = false;
  let isTyping = false;
  let conversation = [];
  let bookingData = null;

  const win = document.getElementById('gde-chat-win');
  const btn = document.getElementById('gde-chat-btn');
  const msgs = document.getElementById('gde-msgs');
  const input = document.getElementById('gde-input');
  const sendBtn = document.getElementById('gde-send');
  const closeBtn = document.getElementById('gde-close-btn');
  const quickBtns = document.getElementById('gde-quick-btns');

  // ── TOGGLE ───────────────────────────────────────────────────────────────────
  function toggleChat() {
    isOpen = !isOpen;
    win.classList.toggle('open', isOpen);
    btn.querySelector('.gde-badge').style.display = 'none';
    if (isOpen && conversation.length === 0) {
      setTimeout(() => addBotMessage("Hi! 👋 I'm the Glide Door Experts assistant. What's going on with your sliding door today? I can diagnose the problem and book you a same-day appointment in Tempe, Mesa, Scottsdale, Gilbert, or Chandler."), 400);
    }
    if (isOpen) setTimeout(() => input.focus(), 300);
  }

  btn.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleChat(); });

  // ── QUICK BTNS ───────────────────────────────────────────────────────────────
  quickBtns.addEventListener('click', (e) => {
    const qb = e.target.closest('.gde-quick');
    if (!qb) return;
    sendMessage(qb.dataset.msg);
    quickBtns.style.display = 'none';
  });

  // ── SEND ─────────────────────────────────────────────────────────────────────
  function sendMessage(text) {
    text = (text || input.value).trim();
    if (!text || isTyping) return;
    input.value = '';
    quickBtns.style.display = 'none';
    addUserMessage(text);
    conversation.push({ role: 'user', content: text });
    callAI();
  }

  sendBtn.addEventListener('click', () => sendMessage());
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });

  // ── ADD MESSAGES ─────────────────────────────────────────────────────────────
  function addUserMessage(text) {
    msgs.insertAdjacentHTML('beforeend', `
      <div class="gde-msg user">
        <div class="gde-bubble">${escHtml(text)}</div>
      </div>`);
    scrollBottom();
  }

  function addBotMessage(text) {
    const clean = text.replace(/BOOKING_CONFIRMED:[^\s]*/g, '').trim();
    const html = clean
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/(📞[\s\S]*?\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/g, `<a href="tel:${PHONE_RAW}">$1</a>`);

    msgs.insertAdjacentHTML('beforeend', `
      <div class="gde-msg bot">
        <div class="gde-msg-av">GD</div>
        <div class="gde-bubble">${html}</div>
      </div>`);

    // check for booking confirmation
    const bookingMatch = text.match(/BOOKING_CONFIRMED:([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|(.+)/);
    if (bookingMatch) {
      bookingData = { name: bookingMatch[1], phone: bookingMatch[2], city: bookingMatch[3], time: bookingMatch[4], problem: bookingMatch[5] };
      showBookingCard(bookingData);
    }

    scrollBottom();
  }

  function showBookingCard(b) {
    msgs.insertAdjacentHTML('beforeend', `
      <div class="gde-msg bot">
        <div class="gde-msg-av">✓</div>
        <div style="flex:1;">
          <div class="gde-booking-card">
            <strong>✅ Appointment Request Received</strong>
            <div><b>Name:</b> ${escHtml(b.name)}</div>
            <div><b>Phone:</b> ${escHtml(b.phone)}</div>
            <div><b>City:</b> ${escHtml(b.city)}</div>
            <div><b>Time:</b> ${escHtml(b.time)}</div>
            <div><b>Problem:</b> ${escHtml(b.problem)}</div>
            <a href="tel:${PHONE_RAW}" class="gde-call-btn">📞 Or call now: ${PHONE}</a>
          </div>
        </div>
      </div>`);
    scrollBottom();
  }

  function showTyping() {
    msgs.insertAdjacentHTML('beforeend', `
      <div class="gde-msg bot" id="gde-typing">
        <div class="gde-msg-av">GD</div>
        <div class="gde-bubble gde-typing">
          <span class="gde-dot"></span><span class="gde-dot"></span><span class="gde-dot"></span>
        </div>
      </div>`);
    scrollBottom();
  }

  function hideTyping() {
    const t = document.getElementById('gde-typing');
    if (t) t.remove();
  }

  function scrollBottom() {
    msgs.scrollTop = msgs.scrollHeight;
  }

  function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── CALL ANTHROPIC API ────────────────────────────────────────────────────────
  async function callAI() {
    isTyping = true;
    sendBtn.disabled = true;
    showTyping();

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 400,
          system: SYSTEM_PROMPT,
          messages: conversation
        })
      });

      hideTyping();

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        // If auth error, show fallback
        if (res.status === 401 || res.status === 403) {
          addBotMessage(`I'd love to help diagnose your door issue! For the fastest service, call us directly at 📞 ${PHONE} — we offer free phone diagnosis and same-day appointments in Tempe, Mesa, Scottsdale, Gilbert, and Chandler.`);
          return;
        }
        throw new Error(`API error ${res.status}`);
      }

      const data = await res.json();
      const reply = data.content?.[0]?.text || "I'm having trouble connecting. Please call us at " + PHONE;
      conversation.push({ role: 'assistant', content: reply });
      addBotMessage(reply);

    } catch (err) {
      hideTyping();
      console.error('Chat error:', err);
      addBotMessage(`Sorry, I'm having a connection issue. For immediate help, call us at 📞 ${PHONE} — we can diagnose your door problem over the phone for free and schedule same-day service.`);
    } finally {
      isTyping = false;
      sendBtn.disabled = false;
    }
  }

})();
