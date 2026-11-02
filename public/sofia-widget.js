/**
 * S.O.F.I.A. Multi-Brand Agentic Layer
 * Agents:
 * - SoulDays: Soli (Powered by S.O.F.I.A. Emotion Layer)
 * - WonderBond: Tuli (Powered by S.O.F.I.A. Fröbel / Empathy Layer)
 * - Orive: Tikko (Powered by S.O.F.I.A. Mindfulness Layer)
 * - Heybotti: Ono (Powered by S.O.F.I.A. Workflow Intelligence)
 * (c) 2026
 */
(function() {
  if (window.__SOFIA_WIDGET_INITIALIZED__) return;
  window.__SOFIA_WIDGET_INITIALIZED__ = true;

  const currentScript = document.currentScript || document.querySelector("script[src*=\"sofia-widget.js\"]");
  const brand = (currentScript && currentScript.getAttribute("data-brand")) || "souldays";

  const BRAND_CONFIGS = {
    souldays: {
      name: "Soli",
      brandName: "SoulDays",
      title: "SoulDays Begleiter",
      agenticBadge: "S.O.F.I.A. Emotion Layer",
      subtitle: "Ein Tag ohne Müssen",
      primaryColor: "#D97706",
      accentColor: "#F59E0B",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
      welcome: "Hallo! Ich bin Soli, dein SoulDays-Begleiter (gesteuert durch den S.O.F.I.A. Emotion Layer). Schön, dass du dir Zeit für dich nimmst. Wie kann ich deinen Tag heute bereichern – suchst du ein gemütliches Café, einen Hofladen oder einen ruhigen Ort?",
      placeholder: "Frag Soli etwas...",
      chips: ["Gemütliches Café", "Schöner Spazierweg", "Hofladen in der Nähe", "Wie funktioniert SoulDays?"]
    },
    heybotti: {
      name: "Ono",
      brandName: "Heybotti",
      title: "Heybotti KI-Mitarbeiter",
      agenticBadge: "S.O.F.I.A. Workflow Intelligence",
      subtitle: "Workflows & Automatisierung",
      primaryColor: "#7C3AED",
      accentColor: "#6D28D9",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80",
      welcome: "Willkommen bei Heybotti! Ich bin Ono, dein digitaler Mitarbeiter für intelligente Automationen. Durch den S.O.F.I.A. Agentic Layer steuere ich Workflows, Bots und WhatsApp Business Integrationen. Wie kann ich dein Business beschleunigen?",
      placeholder: "Frag Ono etwas...",
      chips: ["WhatsApp Business Bot", "Lead-Automatisierung", "Preise & Features", "Live Demo starten"]
    },
    orive: {
      name: "Tikko",
      brandName: "Orive",
      title: "Orive Kurator",
      agenticBadge: "S.O.F.I.A. Mindfulness Layer",
      subtitle: "Wellness & Mindful Living",
      primaryColor: "#1F2937",
      accentColor: "#B45309",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
      welcome: "Willkommen bei Orive. Ich bin Tikko, dein Kurator für ganzheitliche Rituale und Facilitator. Mein Verhalten und meine Expertise basieren auf dem S.O.F.I.A. Agentic Layer. Welches Erlebnis oder Ritual darf ich dir heute vorstellen?",
      placeholder: "Frag Tikko etwas...",
      chips: ["Erlebnisse & Workshops", "Kurierte Produkte", "Facilitator werden", "Rituale für den Abend"]
    },
    wonderbond: {
      name: "Tuli",
      brandName: "WonderBond",
      title: "WonderBond Familien-Guide",
      agenticBadge: "S.O.F.I.A. Fröbel & Empathy Layer",
      subtitle: "Pädagogik nach Fröbel",
      primaryColor: "#059669",
      accentColor: "#10B981",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
      welcome: "Liebe Familie, willkommen bei WonderBond! Ich bin Tuli, dein pädagogischer Familien-Guide. Gesteuert durch den S.O.F.I.A. Agentic Layer begleite ich dich mit Herz und Fröbel-Pädagogik. Welche Frage liegt dir heute auf dem Herzen – Spielideen, Wutanfälle oder Abendrituale?",
      placeholder: "Frag Tuli etwas...",
      chips: ["Trotz & Wutanfall", "Fröbel Spielgaben", "Einschlaf-Rituale", "Dorf-Treffen vor Ort"]
    }
  };

  const config = BRAND_CONFIGS[brand] || BRAND_CONFIGS.souldays;
  const conversationHistory = [];
  let syncTimeout = null;

  function syncLeadToHub() {
    if (conversationHistory.length === 0) return;
    const userMsgs = conversationHistory.filter(m => m.role === "user");
    if (userMsgs.length === 0) return;
    const latestUser = userMsgs[userMsgs.length - 1];
    const assistantMsgs = conversationHistory.filter(m => m.role === "assistant");
    const latestAssistant = assistantMsgs.length > 0 ? assistantMsgs[assistantMsgs.length - 1] : null;

    let contactInfo = "";
    const allText = userMsgs.map(m => m.text).join(" ");
    const emailMatch = allText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = allText.match(/(\+?\d[\d -]{7,}\d)/);
    if (emailMatch) contactInfo += emailMatch[0] + " ";
    if (phoneMatch) contactInfo += phoneMatch[0];

    const summary = latestUser.text + (latestAssistant ? " ➔ " + latestAssistant.text.substring(0, 100) : "");

    fetch("https://wonderbond.de/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brand: config.brandName || brand,
        agent_name: config.name,
        agentic_layer: config.agenticBadge,
        visitor_name: "Website-Besucher",
        visitor_contact: contactInfo.trim(),
        source_url: window.location.href,
        summary: summary,
        sentiment: userMsgs.length > 2 ? "high_intent" : "inquiry",
        conversation: conversationHistory
      })
    }).catch(() => {});
  }

  const style = document.createElement("style");
  style.textContent = `
    #sofia-root { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; position: fixed; bottom: 24px; right: 24px; z-index: 999999; }
    #sofia-trigger { width: 62px; height: 62px; border-radius: 50%; background: ${config.primaryColor}; border: 3px solid #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.25); cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    #sofia-trigger:hover { transform: scale(1.08); box-shadow: 0 14px 30px rgba(0,0,0,0.3); }
    #sofia-trigger img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
    .sofia-pulse { position: absolute; inset: -4px; border-radius: 50%; border: 2px solid ${config.primaryColor}; animation: sofia-ping 2.5s infinite; opacity: 0.75; }
    @keyframes sofia-ping { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.4); opacity: 0; } }

    #sofia-panel { width: 385px; max-width: calc(100vw - 32px); height: 560px; max-height: calc(100vh - 100px); background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.25); border: 1px solid rgba(0,0,0,0.08); display: none; flex-direction: column; overflow: hidden; position: absolute; bottom: 76px; right: 0; animation: sofia-slide-up 0.3s ease forwards; }
    @keyframes sofia-slide-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

    .sofia-header { padding: 14px 18px; background: linear-gradient(135deg, ${config.primaryColor}, ${config.accentColor}); color: white; display: flex; align-items: center; justify-content: space-between; }
    .sofia-header-left { display: flex; align-items: center; gap: 12px; }
    .sofia-header-left img { width: 44px; height: 44px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.85); object-fit: cover; }
    .sofia-agent-title-row { display: flex; align-items: center; gap: 6px; }
    .sofia-agent-title-row h3 { margin: 0; font-size: 16px; font-weight: 700; color: white; letter-spacing: -0.2px; }
    .sofia-agentic-tag { background: rgba(255,255,255,0.22); font-size: 9.5px; padding: 2px 7px; border-radius: 10px; font-weight: 700; letter-spacing: 0.4px; border: 1px solid rgba(255,255,255,0.35); text-transform: uppercase; }
    .sofia-agent-sub { margin: 2px 0 0; font-size: 11px; opacity: 0.95; color: rgba(255,255,255,0.92); }
    .sofia-close { background: none; border: none; color: white; cursor: pointer; font-size: 22px; padding: 4px; line-height: 1; opacity: 0.85; }
    .sofia-close:hover { opacity: 1; }

    .sofia-chat-body { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; background: #fafafa; }
    .sofia-msg { max-width: 84%; padding: 12px 16px; border-radius: 18px; font-size: 13.5px; line-height: 1.45; }
    .sofia-msg-sofia { align-self: flex-start; background: #ffffff; color: #1f2937; border-bottom-left-radius: 4px; border: 1px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
    .sofia-msg-user { align-self: flex-end; background: ${config.primaryColor}; color: white; border-bottom-right-radius: 4px; }

    .sofia-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
    .sofia-chip { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 6px 12px; font-size: 12px; color: #374151; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .sofia-chip:hover { background: #f9fafb; border-color: ${config.primaryColor}; color: ${config.primaryColor}; }

    .sofia-input-bar { padding: 12px 16px; border-top: 1px solid #f3f4f6; background: white; display: flex; align-items: center; gap: 8px; }
    .sofia-input { flex: 1; border: 1px solid #e5e7eb; border-radius: 20px; padding: 10px 16px; font-size: 13.5px; outline: none; transition: border 0.2s; }
    .sofia-input:focus { border-color: ${config.primaryColor}; }
    .sofia-btn-icon { width: 38px; height: 38px; border-radius: 50%; border: none; background: #f3f4f6; color: #4b5563; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .sofia-btn-icon:hover { background: #e5e7eb; }
    .sofia-btn-send { background: ${config.primaryColor}; color: white; }
    .sofia-btn-send:hover { opacity: 0.9; }
    .sofia-voice-active { background: #EF4444 !important; color: white !important; animation: pulse-red 1.2s infinite; }
    @keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
  `;
  document.head.appendChild(style);

  const root = document.createElement("div");
  root.id = "sofia-root";
  root.innerHTML = `
    <div id="sofia-panel">
      <div class="sofia-header">
        <div class="sofia-header-left">
          <img src="${config.avatar}" alt="${config.name}">
          <div>
            <div class="sofia-agent-title-row">
              <h3>${config.name}</h3>
              <span class="sofia-agentic-tag">⚡ S.O.F.I.A.</span>
            </div>
            <p class="sofia-agent-sub">${config.title} • ${config.agenticBadge}</p>
          </div>
        </div>
        <button class="sofia-close" id="sofia-close-btn">&times;</button>
      </div>
      <div class="sofia-chat-body" id="sofia-chat-body">
        <div class="sofia-msg sofia-msg-sofia">${config.welcome}</div>
        <div class="sofia-chips" id="sofia-chips-container">
          ${config.chips.map(c => `<button class="sofia-chip">${c}</button>`).join("")}
        </div>
      </div>
      <div class="sofia-input-bar">
        <button class="sofia-btn-icon" id="sofia-mic-btn" title="Mit ${config.name} sprechen">🎙️</button>
        <input type="text" class="sofia-input" id="sofia-input-field" placeholder="${config.placeholder}">
        <button class="sofia-btn-icon sofia-btn-send" id="sofia-send-btn">➔</button>
      </div>
    </div>
    <div id="sofia-trigger" title="${config.name} (${config.title})">
      <div class="sofia-pulse"></div>
      <img src="${config.avatar}" alt="${config.name}">
    </div>
  `;
  document.body.appendChild(root);

  const panel = document.getElementById("sofia-panel");
  const trigger = document.getElementById("sofia-trigger");
  const closeBtn = document.getElementById("sofia-close-btn");
  const chatBody = document.getElementById("sofia-chat-body");
  const input = document.getElementById("sofia-input-field");
  const sendBtn = document.getElementById("sofia-send-btn");
  const micBtn = document.getElementById("sofia-mic-btn");
  const chipsContainer = document.getElementById("sofia-chips-container");

  function toggleOpen() {
    const isVisible = panel.style.display === "flex";
    panel.style.display = isVisible ? "none" : "flex";
    if (!isVisible) {
      input.focus();
    } else {
      syncLeadToHub();
    }
  }

  trigger.onclick = toggleOpen;
  closeBtn.onclick = toggleOpen;

  function appendMsg(text, sender) {
    const msg = document.createElement("div");
    msg.className = "sofia-msg " + (sender === "user" ? "sofia-msg-user" : "sofia-msg-sofia");
    msg.textContent = text;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
    return msg;
  }

  function speakText(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  }

  async function handleSend(text) {
    const query = (text || input.value || "").trim();
    if (!query) return;
    input.value = "";

    appendMsg(query, "user");
    conversationHistory.push({ role: "user", text: query });
    const loadingMsg = appendMsg(config.name + " überlegt...", "sofia");

    try {
      const res = await fetch("https://wonderbond.de/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: brand,
          agent: config.name,
          text: query,
          userId: "guest-" + (window.__SOFIA_UID__ || (window.__SOFIA_UID__ = Math.random().toString(36).substring(2, 9)))
        })
      });

      let reply = "";
      if (res.ok) {
        const data = await res.json();
        reply = data.replyText || data.reply || data.response || "";
      }
      if (!reply) {
        throw new Error("Empty reply");
      }

      loadingMsg.textContent = reply;
      conversationHistory.push({ role: "assistant", text: reply });
      chatBody.scrollTop = chatBody.scrollHeight;
      speakText(reply);

      clearTimeout(syncTimeout);
      syncTimeout = setTimeout(syncLeadToHub, 3000);
    } catch (err) {
      const fallbackReplies = {
        souldays: "Sehr gerne! Für SoulDays empfehle ich dir heute eine entspannte Pause in einem der regionalen Cafés oder einen ruhigen Spaziergang im Grünen.",
        heybotti: "Hey! Bei Heybotti unterstützen wir dich dabei, zeitraubende Routineaufgaben über KI-Bots und WhatsApp Business vollautomatisiert abzuwickeln.",
        orive: "Willkommen bei Orive. Unsere kuratierten Erlebnisse und Produkte sind dafür geschaffen, dich im Alltag zu erden und deine Routinen zu bereichern.",
        wonderbond: "Hallo bei WonderBond! Kinder brauchen vor allem sichere Bindung und Zeit zum freien Spiel. Wie kann ich dich und dein Kind heute unterstützen?"
      };
      const fallback = fallbackReplies[brand] || fallbackReplies.souldays;
      loadingMsg.textContent = fallback;
      conversationHistory.push({ role: "assistant", text: fallback });
      speakText(fallback);

      clearTimeout(syncTimeout);
      syncTimeout = setTimeout(syncLeadToHub, 3000);
    }
  }

  sendBtn.onclick = () => handleSend();
  input.onkeydown = (e) => { if (e.key === "Enter") handleSend(); };

  chipsContainer.onclick = (e) => {
    if (e.target.classList.contains("sofia-chip")) {
      handleSend(e.target.textContent);
    }
  };

  let recognition = null;
  let isListening = false;
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRec();
    recognition.lang = "de-DE";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      isListening = true;
      micBtn.classList.add("sofia-voice-active");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleSend(transcript);
    };

    recognition.onerror = () => {
      isListening = false;
      micBtn.classList.remove("sofia-voice-active");
    };

    recognition.onend = () => {
      isListening = false;
      micBtn.classList.remove("sofia-voice-active");
    };

    micBtn.onclick = () => {
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
      }
    };
  } else {
    micBtn.style.display = "none";
  }

  window.addEventListener("beforeunload", syncLeadToHub);
})();
