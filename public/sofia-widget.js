/**
 * S.O.F.I.A. Multi-Brand Chat Widget – shared build (one file for all brands)
 * Brand is selected via <script src="/sofia-widget.js" data-brand="orive|souldays|wonderbond|heybotti">.
 * Look & feel comes from THEMES[brand] (see THEME FORMAT below). Text-to-speech is disabled for all brands.
 * (c) 2026
 */
(function () {
  if (window.__SOFIA_WIDGET_INITIALIZED__) return;
  window.__SOFIA_WIDGET_INITIALIZED__ = true;

  const currentScript = document.currentScript || document.querySelector('script[src*="sofia-widget.js"]');
  const brand = (currentScript && currentScript.getAttribute("data-brand")) || "souldays";

  // Central switch: no speechSynthesis, no audio, no TTS requests – for every brand.
  const TTS_ENABLED = false;

  const BRAND_CONFIGS = {
    souldays: {
      name: "Soli", brandName: "SoulDays", title: "SoulDays Begleiter", agenticBadge: "S.O.F.I.A. Emotion Layer",
      welcome: "Hallo! Ich bin Soli, dein SoulDays-Begleiter. Schön, dass du dir Zeit für dich nimmst. Wie kann ich deinen Tag heute bereichern – suchst du ein gemütliches Café, einen Hofladen oder einen ruhigen Ort?",
      placeholder: "Frag Soli etwas...",
      chips: ["Gemütliches Café", "Schöner Spazierweg", "Hofladen in der Nähe", "Wie funktioniert SoulDays?"]
    },
    heybotti: {
      name: "Ono", brandName: "Heybotti", title: "Heybotti KI-Mitarbeiter", agenticBadge: "S.O.F.I.A. Workflow Intelligence",
      welcome: "Guten Tag, ich bin Ono von heyBotti. Wir nehmen Ihnen Arbeit ab, mit KI-Support ab 49 €/Std., eigenen KI-Agenten oder einem geförderten KI-Kurs. DSGVO-konform und in Deutschland gehostet. Worum geht es bei Ihnen? Gern melden wir uns auch persönlich: Hinterlassen Sie einfach Name und E-Mail.",
      placeholder: "Ihre Frage oder Name & E-Mail …",
      chips: ["Ich brauche KI-Support", "Eigener KI-Agent für mein Team", "KI-Kurs mit Bildungsgutschein", "Kurzen Termin buchen"]
    },
    orive: {
      name: "Tikko", brandName: "Orive", title: "Orive Kurator", agenticBadge: "S.O.F.I.A. Mindfulness Layer",
      welcome: "Willkommen bei Orive. Ich bin Tikko, dein Kurator für ganzheitliche Rituale, Erlebnisse und Facilitator. Wonach suchst du heute?",
      placeholder: "Frag Tikko etwas…",
      chips: ["Erlebnisse & Workshops", "Kuratierte Produkte", "Facilitator werden", "Rituale für den Abend"]
    },
    wonderbond: {
      name: "Tuli", brandName: "WonderBond", title: "WonderBond Familien-Guide", agenticBadge: "S.O.F.I.A. Fröbel & Empathy Layer",
      welcome: "Liebe Familie, willkommen bei WonderBond! Ich bin Tuli, dein pädagogischer Familien-Guide. Ich begleite dich mit Herz und Fröbel-Pädagogik. Welche Frage liegt dir heute auf dem Herzen – Spielideen, Wutanfälle oder Abendrituale?",
      placeholder: "Frag Tuli etwas...",
      chips: ["Trotz & Wutanfall", "Fröbel Spielgaben", "Einschlaf-Rituale", "Dorf-Treffen vor Ort"]
    }
  };

  /* THEME FORMAT – add a brand by adding THEMES[<data-brand>]:
   * {
   *   vars:   { primary, primaryFg, bg, card, fg, muted, mutedFg, border, accent,      // colours (any CSS colour)
   *             userBg, userFg, botBg, sendBg, sendFg, launcherBg, launcherBorder,  // optional overrides (default to the above)
   *             font, titleFont, panelRadius, bubbleRadius, tailRadius, chipRadius, inputRadius,
   *             ease, dur, msgDur },                                                   // motion
   *   fontHref: optional stylesheet URL for webfonts (omit to use the site's fonts),
   *   avatar:   { main, face, eye } (shared bot avatar, recoloured)  |  { type: "img", src, bg, pad } | { type: "icon", svg, bg, fg } – flat only,
   *   headerTitle, headerSub: strings shown in the header (no badges),
   *   typing:   "dots" | "shapes",                                                     // typing indicator style
   *   decoHtml: optional HTML placed (aria-hidden) in the header,
   *   css:      optional extra CSS; scope it with ".sw-<brand>"
   * }
   * Unknown brands fall back to THEMES.souldays.
   */
  const CHAT_ICON = '<svg viewBox="0 0 24 24" width="55%" height="55%" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>';
  const BOT_AVATAR = '<svg class="sofia-bot" viewBox="0 0 1024 1024" width="100%" height="100%" aria-hidden="true"><circle cx="512" cy="512" r="512" fill="var(--av-main)"/><g fill="var(--av-face)"><path d="M250 270 C265 245 300 245 318 265 C350 305 385 355 378 385 C372 405 345 400 325 383 C295 358 262 325 250 300 Z"/><path d="M774 270 C759 245 724 245 706 265 C674 305 639 355 646 385 C652 405 679 400 699 383 C729 358 762 325 774 300 Z"/><path fill-rule="evenodd" d="M512 418 C620 418 720 430 755 515 C800 525 815 560 812 590 C810 625 795 650 765 660 C735 735 640 768 512 768 C384 768 289 735 259 660 C229 650 212 625 210 590 C208 558 225 528 268 515 C304 430 404 418 512 418 Z M412 552 C385 552 368 575 368 603 C368 632 388 655 415 655 C442 655 458 632 458 603 C458 575 438 552 412 552 Z M612 552 C585 552 566 575 566 603 C566 632 585 655 612 655 C639 655 656 632 656 603 C656 575 638 552 612 552 Z"/></g></svg>';
  const THEMES = {
    orive: {
      vars: {
        primary: "#17B0C2", primaryFg: "#ffffff", bg: "#0F172A", card: "#151F36", fg: "#F1F5F9",
        muted: "#1C2840", mutedFg: "#94A3B8", border: "rgba(148,163,184,0.18)", accent: "#FFB300",
        userBg: "#17B0C2", userFg: "#ffffff", botBg: "#1A2540", sendBg: "#17B0C2", sendFg: "#ffffff",
        launcherBg: "#0F172A", launcherBorder: "rgba(255,255,255,0.14)",
        font: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        titleFont: 'Raleway, Inter, ui-sans-serif, system-ui, sans-serif',
        panelRadius: "16px", bubbleRadius: "14px", tailRadius: "4px", chipRadius: "999px", inputRadius: "10px",
        ease: "cubic-bezier(0.16, 1, 0.3, 1)", dur: "0.22s", msgDur: "0.3s"
      },
      avatar: { main: "#17B0C2", face: "#FFFFFF", eye: "#17B0C2" },
      headerTitle: "Tikko", headerSub: "Orive · Dein Kurator für Rituale & Erlebnisse",
      typing: "dots",
      css: `.sw-orive .sofia-agent-title-row h3 { color: #00CDAC; font-weight: 700; letter-spacing: 0.02em; }
            .sw-orive .sofia-input:focus { border-color: #17B0C2; box-shadow: 0 0 0 3px rgba(23,176,194,0.18); }
            .sw-orive .sofia-chip:hover { border-color: #17B0C2; color: #00CDAC; }`
    },
    souldays: {
      vars: {
        primary: "#0B0B0D", primaryFg: "#ffffff", bg: "#ffffff", card: "#ffffff", fg: "#0B0B0D",
        muted: "#F6F6F7", mutedFg: "#8A8A92", border: "#ECECEF", accent: "#FFB300",
        userBg: "#0B0B0D", userFg: "#ffffff", botBg: "#F6F6F7", sendBg: "#0B0B0D", sendFg: "#ffffff",
        launcherBg: "#F2F2F4", launcherBorder: "#ECECEF",
        font: '"Plus Jakarta Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        panelRadius: "22px", bubbleRadius: "18px", tailRadius: "6px", chipRadius: "999px", inputRadius: "999px",
        ease: "cubic-bezier(.2,.8,.2,1)", dur: "0.28s", msgDur: "0.4s"
      },
      fontHref: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
      avatar: { main: "#FFB300", face: "#FFFFFF", eye: "#FFB300" },
      headerTitle: "Soli", headerSub: "Ein Tag ohne Müssen",
      typing: "dots",
      css: `.sw-souldays .sofia-agent-sub { color: #B37E00; }
            .sw-souldays .sofia-msg-sofia { border-color: transparent; }
            .sw-souldays .sofia-input:focus { border-color: #FFB300; box-shadow: 0 0 0 3px rgba(255,179,0,0.18); }`
    },
    wonderbond: {
      vars: {
        primary: "hsl(38 72% 50%)", primaryFg: "hsl(220 12% 16%)", bg: "hsl(210 12% 99%)", card: "hsl(0 0% 100%)", fg: "hsl(220 12% 16%)",
        muted: "hsl(210 8% 94%)", mutedFg: "hsl(215 8% 46%)", border: "hsl(210 10% 90%)", accent: "hsl(168 14% 42%)",
        userBg: "hsl(38 72% 50%)", userFg: "hsl(220 12% 16%)", botBg: "hsl(0 0% 100%)", sendBg: "hsl(38 72% 50%)", sendFg: "hsl(220 12% 16%)",
        launcherBg: "transparent", launcherBorder: "transparent",
        font: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        panelRadius: "1.5rem", bubbleRadius: "1.125rem", tailRadius: "4px", chipRadius: "999px", inputRadius: ".75rem",
        ease: "cubic-bezier(0.22, 1, 0.36, 1)", dur: "0.28s", msgDur: "0.32s"
      },
      avatar: { main: "#FFFFFF", face: "hsl(38 72% 50%)", eye: "#FFFFFF" },
      headerTitle: "Tuli", headerSub: "WonderBond Familien-Guide",
      typing: "shapes",
      decoHtml: '<div class="wb-deco"><span class="wb-shape wb-circle"></span><span class="wb-shape wb-cyl"></span><span class="wb-shape wb-square"></span></div>',
      css: `.sw-wonderbond #sofia-trigger { border: none; box-shadow: none; }
        .sw-wonderbond #sofia-trigger:hover { box-shadow: none; }
        .sw-wonderbond .sofia-header { position: relative; overflow: hidden; background: #ffffff; }
        .sw-wonderbond .sofia-header-left, .sw-wonderbond .sofia-close { position: relative; z-index: 1; }
        .sw-wonderbond .sofia-chip:hover { border-color: hsl(168 14% 42%); color: hsl(220 12% 16%); background: hsl(168 14% 42% / .12); }
        .sw-wonderbond .sofia-input:focus { border-color: hsl(168 14% 42%); box-shadow: 0 0 0 3px hsl(168 14% 42% / .12); }
        .wb-blob { width: 88%; height: 88%; background: hsl(38 72% 50%); border-radius: 58% 42% 55% 45% / 48% 56% 44% 52%; display: flex; align-items: center; justify-content: center; gap: 18%; animation: wb-morph 5s ease-in-out infinite, wb-breathe 5s ease-in-out infinite; }
        .wb-blob i { display: block; width: 11%; height: 11%; border-radius: 50%; background: hsl(220 12% 16%); margin-top: -6%; }
        @keyframes wb-morph { 0%, 100% { border-radius: 58% 42% 55% 45% / 48% 56% 44% 52%; } 33% { border-radius: 45% 55% 42% 58% / 55% 45% 57% 43%; } 66% { border-radius: 52% 48% 60% 40% / 42% 58% 46% 54%; } }
        @keyframes wb-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }
        .sw-wonderbond .sofia-header-left { flex: 1 1 auto; min-width: 0; margin-right: 76px; }
        .sw-wonderbond .sofia-avatar .sofia-bot { animation: wb-breathe 4s ease-in-out infinite; }
        .sw-wonderbond #sofia-trigger { border: none; background: #ffffff; box-shadow: 0 0 0 2.5px hsl(38 72% 50%); }
        .sw-wonderbond #sofia-trigger:hover { box-shadow: 0 0 0 2.5px hsl(38 72% 50%); }
        @keyframes wb-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }
        .wb-deco { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
        .wb-shape { position: absolute; opacity: 0.55; }
        .wb-circle { width: 24px; height: 24px; border-radius: 50%; background: hsl(38 72% 50%); right: 66px; top: -8px; }
        .wb-cyl { width: 32px; height: 12px; border-radius: 999px; background: hsl(168 14% 42%); right: 78px; bottom: 8px; opacity: 0.35; }
        .wb-square { width: 16px; height: 16px; border-radius: 5px; background: hsl(168 14% 42% / .12); border: 2px solid hsl(168 14% 42%); right: 54px; bottom: -5px; opacity: 0.5; transform: rotate(12deg); }
        #sofia-panel.sofia-open .wb-circle { width: 24px; height: 24px; border-radius: 50%; background: hsl(38 72% 50%); right: 66px; top: -8px; }
        #sofia-panel.sofia-open .wb-cyl { width: 32px; height: 12px; border-radius: 999px; background: hsl(168 14% 42%); right: 78px; bottom: 8px; opacity: 0.35; }
        #sofia-panel.sofia-open .wb-square { width: 16px; height: 16px; border-radius: 5px; background: hsl(168 14% 42% / .12); border: 2px solid hsl(168 14% 42%); right: 54px; bottom: -5px; opacity: 0.5; transform: rotate(12deg); }
        @keyframes wb-pop { from { transform: scale(0) rotate(-20deg); opacity: 0; } }
        @keyframes wb-roll { from { transform: translateX(40px); opacity: 0; } }`
    },
    heybotti: {
      // reads heybotti.com's own shadcn/Tailwind CSS variables (follows the site's dark/light mode)
      vars: {
        primary: "hsl(var(--primary, 168 100% 50%))", primaryFg: "hsl(var(--primary-foreground, 0 0% 0%))",
        bg: "hsl(var(--background, 0 0% 0%))", card: "hsl(var(--card, 0 0% 5%))", fg: "hsl(var(--foreground, 0 0% 100%))",
        muted: "hsl(var(--muted, 0 0% 8%))", mutedFg: "hsl(var(--muted-foreground, 0 0% 55%))", border: "hsl(var(--border, 0 0% 12%))",
        accent: "hsl(var(--primary, 168 100% 50%))",
        font: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        panelRadius: "calc(var(--radius, .5rem) * 2)", bubbleRadius: "calc(var(--radius, .5rem) * 1.5)", tailRadius: "4px",
        chipRadius: "999px", inputRadius: "var(--radius, .5rem)",
        ease: "cubic-bezier(0.22, 1, 0.36, 1)", dur: "0.28s", msgDur: "0.32s"
      },
      avatar: { main: "#000000", face: "#FFFFFF", eye: "#000000" },
      headerTitle: "Ono", headerSub: "Heybotti KI-Mitarbeiter",
      typing: "dots"
    }
  };

  const config = BRAND_CONFIGS[brand] || BRAND_CONFIGS.souldays;
  const theme = THEMES[brand] || THEMES.souldays;
  const v = theme.vars;
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
        brand: config.brandName || brand, agent_name: config.name, agentic_layer: config.agenticBadge,
        visitor_name: "Website-Besucher", visitor_contact: contactInfo.trim(), source_url: window.location.href,
        summary: summary, sentiment: userMsgs.length > 2 ? "high_intent" : "inquiry", conversation: conversationHistory
      })
    }).catch(() => {});
  }

  if (theme.fontHref) {
    const l = document.createElement("link"); l.rel = "stylesheet"; l.href = theme.fontHref; document.head.appendChild(l);
  }

  const style = document.createElement("style");
  style.textContent = `
    #sofia-root { --sw-primary: ${v.primary}; --sw-primary-fg: ${v.primaryFg}; --sw-bg: ${v.bg}; --sw-card: ${v.card}; --sw-fg: ${v.fg};
      --sw-muted: ${v.muted}; --sw-muted-fg: ${v.mutedFg}; --sw-border: ${v.border}; --sw-accent: ${v.accent};
      --sw-user-bg: ${v.userBg || v.primary}; --sw-user-fg: ${v.userFg || v.primaryFg}; --sw-bot-bg: ${v.botBg || v.card};
      --sw-send-bg: ${v.sendBg || v.primary}; --sw-send-fg: ${v.sendFg || v.primaryFg};
      --sw-launcher-bg: ${v.launcherBg || v.card}; --sw-launcher-border: ${v.launcherBorder || v.border};
      --sw-panel-r: ${v.panelRadius}; --sw-bubble-r: ${v.bubbleRadius}; --sw-tail-r: ${v.tailRadius}; --sw-chip-r: ${v.chipRadius}; --sw-input-r: ${v.inputRadius};
      --sw-ease: ${v.ease}; --sw-dur: ${v.dur}; --sw-msg-dur: ${v.msgDur};
      font-family: ${v.font}; -webkit-font-smoothing: antialiased; color: var(--sw-fg);
      position: fixed; bottom: calc(24px + env(safe-area-inset-bottom, 0px)); right: calc(24px + env(safe-area-inset-right, 0px)); z-index: 999999; }
    #sofia-root *, #sofia-root *::before, #sofia-root *::after { box-sizing: border-box; }
    #sofia-trigger { width: 56px; height: 56px; border-radius: 50%; background: var(--sw-launcher-bg); border: 1px solid var(--sw-launcher-border); box-shadow: 0 6px 18px rgba(0,0,0,0.14); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0; overflow: hidden;
      animation: sofia-enter 0.5s var(--sw-ease) 0.4s both; transition: transform var(--sw-dur) var(--sw-ease), box-shadow var(--sw-dur) var(--sw-ease); }
    #sofia-trigger:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,0.18); }
    #sofia-trigger:focus-visible, #sofia-root button:focus-visible { outline: 2px solid var(--sw-accent); outline-offset: 2px; }
    @keyframes sofia-enter { from { opacity: 0; transform: translateY(10px) scale(0.96); } to { opacity: 1; transform: none; } }
    .sofia-avatar { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; border-radius: 50%; overflow: hidden; flex-shrink: 0; }
    .sofia-avatar img { width: 100%; height: 100%; object-fit: contain; display: block; }
    .sofia-header-left .sofia-avatar { width: 36px; height: 36px; }

    #sofia-panel { width: 380px; max-width: calc(100vw - 32px); height: 560px; max-height: calc(100vh - 110px); background: var(--sw-card); color: var(--sw-fg); border-radius: var(--sw-panel-r); box-shadow: 0 24px 60px rgba(0,0,0,0.22); border: 1px solid var(--sw-border);
      display: none; flex-direction: column; overflow: hidden; position: absolute; bottom: 70px; right: 0; transform-origin: bottom right;
      opacity: 0; transform: translateY(8px) scale(0.96); transition: opacity var(--sw-dur) var(--sw-ease), transform var(--sw-dur) var(--sw-ease); }
    #sofia-panel.sofia-open { opacity: 1; transform: none; }

    .sofia-header { padding: 14px 16px; background: var(--sw-card); border-bottom: 1px solid var(--sw-border); display: flex; align-items: center; justify-content: space-between; }
    .sofia-header-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
    .sofia-agent-title-row h3 { margin: 0; font-family: ${v.titleFont || "inherit"}; font-size: 15px; font-weight: 600; color: var(--sw-fg); letter-spacing: -0.01em; }
    .sofia-agent-sub { margin: 2px 0 0; font-size: 11.5px; color: var(--sw-muted-fg); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sofia-close { background: none; border: none; color: var(--sw-muted-fg); cursor: pointer; font-size: 22px; width: 32px; height: 32px; border-radius: 8px; line-height: 1; transition: background 0.2s ease, color 0.2s ease; }
    .sofia-close:hover { background: var(--sw-muted); color: var(--sw-fg); }

    .sofia-chat-body { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; background: var(--sw-bg); scroll-behavior: smooth; overscroll-behavior: contain; }
    .sofia-msg { max-width: 84%; padding: 10px 14px; border-radius: var(--sw-bubble-r); font-size: 14px; line-height: 1.5; animation: sofia-msg-in var(--sw-msg-dur) var(--sw-ease) both; overflow-wrap: anywhere; white-space: pre-wrap; }
    @keyframes sofia-msg-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
    .sofia-msg-sofia { align-self: flex-start; background: var(--sw-bot-bg); color: var(--sw-fg); border-bottom-left-radius: var(--sw-tail-r); border: 1px solid var(--sw-border); }
    .sofia-msg-user { align-self: flex-end; background: var(--sw-user-bg); color: var(--sw-user-fg); border-bottom-right-radius: var(--sw-tail-r); }

    .sofia-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px; animation: sofia-msg-in var(--sw-msg-dur) var(--sw-ease) 0.08s both; }
    .sofia-chip { font: inherit; background: transparent; border: 1px solid var(--sw-border); border-radius: var(--sw-chip-r); padding: 6px 12px; font-size: 12.5px; color: var(--sw-fg); cursor: pointer; transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease; }
    .sofia-chip:hover { border-color: var(--sw-primary); color: var(--sw-primary); }

    .sofia-input-bar { padding: 12px; border-top: 1px solid var(--sw-border); background: var(--sw-card); display: flex; align-items: center; gap: 8px; }
    .sofia-input { flex: 1; min-width: 0; font: inherit; font-size: 16px; background: var(--sw-bg); color: var(--sw-fg); border: 1px solid var(--sw-border); border-radius: var(--sw-input-r); padding: 9px 14px; outline: none; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
    .sofia-input::placeholder { color: var(--sw-muted-fg); }
    .sofia-input:focus { border-color: var(--sw-accent); }
    .sofia-btn-icon { width: 40px; height: 40px; flex-shrink: 0; border-radius: var(--sw-input-r); border: 1px solid var(--sw-border); background: var(--sw-muted); color: var(--sw-fg); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 15px; transition: opacity 0.2s ease, transform 0.15s ease; }
    .sofia-btn-icon:active { transform: scale(0.95); }
    .sofia-btn-send { background: var(--sw-send-bg); color: var(--sw-send-fg); border-color: transparent; }
    .sofia-btn-send:hover { opacity: 0.9; }

    .sofia-typing { display: inline-flex; align-items: center; gap: 5px; padding: 4px 0; }
    .sofia-typing i { display: block; width: 7px; height: 7px; border-radius: 50%; background: var(--sw-accent); animation: sofia-dot 1.2s ease-in-out infinite; }
    .sw-orive .sofia-typing i { background: #17B0C2; }
    .sofia-typing i:nth-child(2) { animation-delay: .15s; } .sofia-typing i:nth-child(3) { animation-delay: .3s; }
    @keyframes sofia-dot { 0%, 60%, 100% { opacity: .35; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }
    .sofia-typing.shapes i:nth-child(1) { border-radius: 50%; background: hsl(38 72% 50%); width: 9px; height: 9px; }
    .sofia-typing.shapes i:nth-child(2) { width: 14px; height: 9px; border-radius: 999px; background: hsl(168 14% 42%); }
    .sofia-typing.shapes i:nth-child(3) { width: 9px; height: 9px; border-radius: 3px; background: hsl(220 12% 16%); }
    .sofia-typing.shapes i { animation-name: sofia-hop; opacity: 1; }
    @keyframes sofia-hop { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-5px); } }

    .sw-orive #sofia-trigger, .sw-souldays #sofia-trigger, .sw-heybotti #sofia-trigger { border: none; background: transparent; }
    .sofia-avatar .sofia-bot { display: block; animation: sofia-bot-idle 5s ease-in-out infinite; }
    @keyframes sofia-bot-idle { 0%, 100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-1px) rotate(-3deg); } }
    ${theme.css || ""}

    @media (max-width: 480px) {
      #sofia-root { bottom: calc(16px + env(safe-area-inset-bottom, 0px)); right: calc(16px + env(safe-area-inset-right, 0px)); }
      #sofia-trigger { width: 52px; height: 52px; }
      #sofia-root.sofia-is-open #sofia-trigger { display: none; }
      #sofia-panel { position: fixed; left: 0; right: 0; bottom: 0; width: 100vw; max-width: 100vw; height: calc(100dvh - 56px); max-height: none; border-radius: var(--sw-panel-r) var(--sw-panel-r) 0 0; transform-origin: bottom center; padding-bottom: env(safe-area-inset-bottom, 0px); }
    }
    @media (prefers-reduced-motion: reduce) {
      #sofia-root *, #sofia-trigger, #sofia-panel { animation: none !important; transition: none !important; }
    }
  `;
  document.head.appendChild(style);

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const a = theme.avatar;
  const avatarHTML = a.main
    ? `<span class="sofia-avatar" role="img" aria-label="${esc(config.name)}" style="--av-main:${a.main};--av-face:${a.face};--av-eye:${a.eye}">${BOT_AVATAR}</span>`
    : a.type === "icon"
    ? `<span class="sofia-avatar" role="img" aria-label="${esc(config.name)}" style="background:${a.bg};color:${a.fg}">${a.svg}</span>`
    : `<span class="sofia-avatar" style="background:${a.bg};padding:${a.pad || 0}"><img src="${a.src}" alt="${esc(config.name)}"></span>`;

  const root = document.createElement("div");
  root.id = "sofia-root";
  root.className = "sw-" + (THEMES[brand] ? brand : "souldays");
  root.innerHTML = `
    <div id="sofia-panel" role="dialog" aria-label="${esc(theme.headerTitle)} Chat">
      <div class="sofia-header">${theme.decoHtml ? theme.decoHtml.replace("<div ", '<div aria-hidden="true" ') : ""}
        <div class="sofia-header-left">
          ${avatarHTML}
          <div style="min-width:0">
            <div class="sofia-agent-title-row"><h3>${esc(theme.headerTitle)}</h3></div>
            <p class="sofia-agent-sub">${esc(theme.headerSub)}</p>
          </div>
        </div>
        <button class="sofia-close" id="sofia-close-btn" aria-label="Chat schließen">&times;</button>
      </div>
      <div class="sofia-chat-body" id="sofia-chat-body" aria-live="polite">
        <div class="sofia-msg sofia-msg-sofia">${esc(config.welcome)}</div>
        <div class="sofia-chips" id="sofia-chips-container">
          ${config.chips.map(c => `<button class="sofia-chip">${esc(c)}</button>`).join("")}
        </div>
      </div>
      <div class="sofia-input-bar">
        <input type="text" class="sofia-input" id="sofia-input-field" placeholder="${esc(config.placeholder)}" aria-label="Nachricht">
        <button class="sofia-btn-icon sofia-btn-send" id="sofia-send-btn" aria-label="Senden">➔</button>
      </div>
    </div>
    <button id="sofia-trigger" type="button" aria-label="Chat mit ${esc(config.name)} öffnen" title="${esc(config.name)} – ${esc(config.title)}">${avatarHTML}</button>
  `;
  document.body.appendChild(root);

  const panel = document.getElementById("sofia-panel");
  const trigger = document.getElementById("sofia-trigger");
  const closeBtn = document.getElementById("sofia-close-btn");
  const chatBody = document.getElementById("sofia-chat-body");
  const input = document.getElementById("sofia-input-field");
  const sendBtn = document.getElementById("sofia-send-btn");
  const chipsContainer = document.getElementById("sofia-chips-container");
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let open = false, hideTimer = null;

  function setOpen(next) {
    if (next === open) return;
    open = next;
    clearTimeout(hideTimer);
    root.classList.toggle("sofia-is-open", open);
    if (open) {
      panel.style.display = "flex";
      void panel.offsetWidth;
      panel.classList.add("sofia-open");
      if (window.innerWidth > 480) input.focus();
    } else {
      panel.classList.remove("sofia-open");
      hideTimer = setTimeout(() => { panel.style.display = "none"; }, reduced ? 0 : 260);
      syncLeadToHub();
    }
  }
  trigger.onclick = () => setOpen(!open);
  closeBtn.onclick = () => setOpen(false);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && open) setOpen(false); });

  function appendMsg(text, sender) {
    const msg = document.createElement("div");
    msg.className = "sofia-msg " + (sender === "user" ? "sofia-msg-user" : "sofia-msg-sofia");
    msg.textContent = text;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
    return msg;
  }

  // TTS disabled centrally: this is a no-op unless TTS_ENABLED is flipped (it is not).
  function speakText() {
    if (!TTS_ENABLED) return;
  }

  async function handleSend(text) {
    const query = (text || input.value || "").trim();
    if (!query) return;
    input.value = "";
    appendMsg(query, "user");
    conversationHistory.push({ role: "user", text: query });
    const loadingMsg = appendMsg("", "sofia");
    loadingMsg.setAttribute("aria-label", config.name + " schreibt…");
    loadingMsg.innerHTML = '<span class="sofia-typing' + (theme.typing === "shapes" ? " shapes" : "") + '" aria-hidden="true"><i></i><i></i><i></i></span>';
    const finish = (reply) => {
      loadingMsg.removeAttribute("aria-label");
      loadingMsg.textContent = reply;
      conversationHistory.push({ role: "assistant", text: reply });
      chatBody.scrollTop = chatBody.scrollHeight;
      speakText(reply);
      clearTimeout(syncTimeout);
      syncTimeout = setTimeout(syncLeadToHub, 3000);
    };
    try {
      const res = await fetch("https://wonderbond.de/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: brand, agent: config.name, text: query,
          userId: "guest-" + (window.__SOFIA_UID__ || (window.__SOFIA_UID__ = Math.random().toString(36).substring(2, 9)))
        })
      });
      let reply = "";
      if (res.ok) {
        const data = await res.json();
        reply = data.replyText || data.reply || data.response || "";
      }
      if (!reply) throw new Error("Empty reply");
      finish(reply);
    } catch (err) {
      const fallbackReplies = {
        souldays: "Sehr gerne! Für SoulDays empfehle ich dir heute eine entspannte Pause in einem der regionalen Cafés oder einen ruhigen Spaziergang im Grünen.",
        heybotti: "Hey! Bei Heybotti unterstützen wir dich dabei, zeitraubende Routineaufgaben über KI-Bots und WhatsApp Business vollautomatisiert abzuwickeln.",
        orive: "Willkommen bei Orive. Unsere kuratierten Erlebnisse und Produkte sind dafür geschaffen, dich im Alltag zu erden und deine Routinen zu bereichern.",
        wonderbond: "Hallo bei WonderBond! Kinder brauchen vor allem sichere Bindung und Zeit zum freien Spiel. Wie kann ich dich und dein Kind heute unterstützen?"
      };
      finish(fallbackReplies[brand] || fallbackReplies.souldays);
    }
  }

  sendBtn.onclick = () => handleSend();
  input.onkeydown = (e) => { if (e.key === "Enter") handleSend(); };
  chipsContainer.onclick = (e) => {
    if (e.target.classList.contains("sofia-chip")) handleSend(e.target.textContent);
  };

  window.addEventListener("beforeunload", syncLeadToHub);
})();
