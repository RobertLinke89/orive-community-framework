// Five-element system for directory profiles (own SVG/CSS work, no faces, no libraries).
export type ElementKey = "fire" | "water" | "air" | "earth" | "aether";
export const ELEMENT_OF: Record<string, ElementKey> = {
  "Sauna & Heat": "fire", Kambo: "fire",
  "Ice Bathing": "water",
  Breathwork: "air", "Sound Healing": "air",
  BodyWork: "earth", Yoga: "earth",
  "Spiritual Growth": "aether", Meditation: "aether", Mindfulness: "aether", "Personal Coaching": "aether", "Life Coaching": "aether",
};
export const ELEMENT_LABEL: Record<string, Record<ElementKey, string>> = {
  de: { fire: "Feuer", water: "Wasser", air: "Luft", earth: "Erde", aether: "Äther" },
  en: { fire: "Fire", water: "Water", air: "Air", earth: "Earth", aether: "Aether" },
  fr: { fire: "Feu", water: "Eau", air: "Air", earth: "Terre", aether: "Éther" },
  nl: { fire: "Vuur", water: "Water", air: "Lucht", earth: "Aarde", aether: "Ether" },
};
export const ELEMENT_WORD: Record<string, string> = { de: "Element", en: "Element", fr: "Élément", nl: "Element" };
export const ELEMENT_COLORS: Record<ElementKey, [string, string]> = {
  fire: ["#ff5a1f", "#ffc24b"], water: ["#1e88e5", "#8fdcff"], air: ["#2f8f88", "#a8e6e0"], earth: ["#5a7d1e", "#c08a4a"], aether: ["#7b5cff", "#f0c6ff"],
};

const SVG: Record<ElementKey, string> = {
  fire: `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><radialGradient id="eg-fire" cx="50%" cy="70%" r="60%"><stop offset="0" stop-color="#fff3b0"/><stop offset=".45" stop-color="#ffb02e"/><stop offset="1" stop-color="#e8430f"/></radialGradient></defs>
<g class="fl fl1"><path d="M60 18C72 40 88 50 86 74a26 26 0 0 1-52 0c-1-14 8-22 12-34 4 10 8 14 12 16C58 42 56 30 60 18z" fill="url(#eg-fire)"/></g>
<g class="fl fl2"><path d="M60 50c7 11 14 17 13 29a13 13 0 0 1-26 0c0-8 5-12 7-19 2 4 4 6 6 7 0-6-1-11 0-17z" fill="#fff6c8" opacity=".9"/></g></svg>`,
  water: `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><clipPath id="ec-water"><circle cx="60" cy="60" r="44"/></clipPath></defs><circle cx="60" cy="60" r="44" fill="#d9f3ff"/>
<g clip-path="url(#ec-water)"><path class="wv wv1" d="M-60 62q15-10 30 0t30 0 30 0 30 0 30 0 30 0 30 0v60h-210z" fill="#5fc0f2"/><path class="wv wv2" d="M-60 72q15-9 30 0t30 0 30 0 30 0 30 0 30 0 30 0v60h-210z" fill="#1e88e5" opacity=".85"/></g>
<circle cx="60" cy="60" r="44" fill="none" stroke="#1e88e5" stroke-width="2" opacity=".4"/></svg>`,
  air: `<svg viewBox="0 0 120 120" aria-hidden="true" fill="none" stroke-linecap="round"><g class="ar ar1"><path d="M18 46h52a12 12 0 1 0-12-12" stroke="#5fb3ad" stroke-width="5"/></g><g class="ar ar2"><path d="M12 64h78a12 12 0 1 1-12 12" stroke="#8fd3cd" stroke-width="5"/></g><g class="ar ar3"><path d="M26 84h30" stroke="#bfeae6" stroke-width="5"/></g></svg>`,
  earth: `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="eg-earth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a7c957"/><stop offset="1" stop-color="#3a5a1c"/></linearGradient><clipPath id="ec-earth"><circle cx="60" cy="60" r="42"/></clipPath></defs>
<circle class="ea-ring" cx="60" cy="60" r="50" fill="none" stroke="#8b5e34" stroke-width="3"/>
<g class="ea-stones" fill="#8b5e34"><circle cx="60" cy="6" r="4"/><circle cx="114" cy="60" r="4"/><circle cx="60" cy="114" r="4"/><circle cx="6" cy="60" r="4"/></g>
<g class="ea"><circle cx="60" cy="60" r="42" fill="#f3e3c3"/><g clip-path="url(#ec-earth)"><path d="M10 84L38 46l14 18 18-30 40 50v40H10z" fill="url(#eg-earth)"/><path d="M58 34l12 0-6-10z" fill="#fff" opacity=".9"/><path d="M10 92q25-10 50 0t50 0v30H10z" fill="#6b3f1d"/><path d="M10 100q25-8 50 0t50 0v22H10z" fill="#4a2a12"/></g><circle cx="60" cy="60" r="42" fill="none" stroke="#5a3a1a" stroke-width="4"/></g></svg>`,
  aether: `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><radialGradient id="eg-ae"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="#f0c6ff"/><stop offset="1" stop-color="#7b5cff" stop-opacity="0"/></radialGradient></defs><circle class="ae-glow" cx="60" cy="60" r="42" fill="url(#eg-ae)"/>
<g class="ae-orbit" fill="none" stroke="#b9a4ff" stroke-width="1.5" opacity=".8"><ellipse cx="60" cy="60" rx="44" ry="16"/><ellipse cx="60" cy="60" rx="44" ry="16" transform="rotate(60 60 60)"/><ellipse cx="60" cy="60" rx="44" ry="16" transform="rotate(120 60 60)"/></g>
<path class="ae-star" d="M60 44l4 12 12 4-12 4-4 12-4-12-12-4 12-4z" fill="#fff"/></svg>`,
};
export const emblemSvg = (e: ElementKey) => SVG[e];

export const ELEMENT_CSS = `
.orive-tpl .cover{position:relative;overflow:hidden}
.el-fx{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.el-fx i{position:absolute;bottom:-12px;width:6px;height:6px;border-radius:50%;background:var(--e2);box-shadow:0 0 10px 2px var(--e1);opacity:0;will-change:transform,opacity;animation:el-rise 7s linear infinite}
.el-fx::after{content:"";position:absolute;inset:auto 0 0 0;height:60%;background:radial-gradient(ellipse at 50% 100%,color-mix(in srgb,var(--e1) 45%,transparent),transparent 70%);animation:el-glow 5s ease-in-out infinite alternate}
.el-water .el-fx i{border-radius:50%;background:transparent;border:1.5px solid var(--e2);box-shadow:none;width:9px;height:9px}
.el-air .el-fx i{width:40px;height:2px;border-radius:2px;bottom:auto;animation-name:el-drift}
.el-earth .el-fx i{width:5px;height:5px;border-radius:1px;animation-name:el-settle;animation-duration:9s}
.el-aether .el-fx i{width:4px;height:4px;animation-name:el-twinkle;bottom:auto}
@keyframes el-rise{0%{transform:translate(0,0) scale(.6);opacity:0}15%{opacity:.9}100%{transform:translate(var(--dx),-240px) scale(1);opacity:0}}
@keyframes el-drift{0%{transform:translateX(-80px);opacity:0}20%{opacity:.8}100%{transform:translateX(1400px);opacity:0}}
@keyframes el-settle{0%{transform:translateY(0);opacity:0}30%{opacity:.7}100%{transform:translateY(-90px);opacity:0}}
@keyframes el-twinkle{0%,100%{opacity:0;transform:scale(.4)}50%{opacity:1;transform:scale(1.4)}}
@keyframes el-glow{from{opacity:.55}to{opacity:1}}
.orive-tpl .avatar.emblem{display:grid;place-items:center;background:radial-gradient(circle at 50% 40%,#fff,color-mix(in srgb,var(--e2) 35%,#fff));box-shadow:0 0 0 4px #fff,0 0 28px 4px color-mix(in srgb,var(--e1) 55%,transparent);animation:el-halo 4s ease-in-out infinite alternate}
.orive-tpl .avatar.emblem svg{width:78%;height:78%;overflow:visible}
@keyframes el-halo{from{box-shadow:0 0 0 4px #fff,0 0 18px 2px color-mix(in srgb,var(--e1) 40%,transparent)}to{box-shadow:0 0 0 4px #fff,0 0 34px 8px color-mix(in srgb,var(--e1) 65%,transparent)}}
.el-chip{display:inline-flex;align-items:center;gap:6px;margin-top:8px;padding:4px 12px;border-radius:999px;font:600 13px Inter,system-ui,sans-serif;color:#fff;background:linear-gradient(90deg,var(--e1),color-mix(in srgb,var(--e2) 70%,var(--e1)))}
.el-chip b{width:8px;height:8px;border-radius:50%;background:#fff;box-shadow:0 0 8px #fff}
/* fire */
.fl{transform-origin:60px 100px;transform-box:view-box}
.fl1{animation:fl-a 1.6s ease-in-out infinite alternate}.fl2{animation:fl-b 1.1s ease-in-out infinite alternate}
@keyframes fl-a{0%{transform:scale(1,1) skewX(0)}50%{transform:scale(.96,1.06) skewX(2deg)}100%{transform:scale(1.03,.95) skewX(-2deg)}}
@keyframes fl-b{0%{transform:scale(1,1);opacity:.8}100%{transform:scale(.9,1.12);opacity:1}}
/* water */
.wv{animation:wv 4s linear infinite}.wv2{animation-duration:6s;animation-direction:reverse}
@keyframes wv{from{transform:translateX(0)}to{transform:translateX(60px)}}
/* air */
.ar{animation:ar 3.2s ease-in-out infinite}.ar2{animation-delay:-1s}.ar3{animation-delay:-2s}
@keyframes ar{0%,100%{transform:translateX(-5px);opacity:.65}50%{transform:translateX(6px);opacity:1}}
/* earth */
.ea{transform-origin:60px 60px;transform-box:view-box;animation:ea 5s ease-in-out infinite}
.ea-ring{transform-origin:60px 60px;transform-box:view-box;animation:ea-r 4s ease-out infinite}
.ea-stones{transform-origin:60px 60px;transform-box:view-box;animation:ae 40s linear infinite}
@keyframes ea{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
@keyframes ea-r{0%{transform:scale(.85);opacity:.9}100%{transform:scale(1.15);opacity:0}}
/* aether */
.ae-orbit{transform-origin:60px 60px;transform-box:view-box;animation:ae 18s linear infinite}
.ae-glow{transform-origin:60px 60px;transform-box:view-box;animation:ae-g 3s ease-in-out infinite alternate}
.ae-star{transform-origin:60px 60px;transform-box:view-box;animation:ae-s 2.4s ease-in-out infinite}
@keyframes ae{to{transform:rotate(360deg)}}
@keyframes ae-g{from{opacity:.6;transform:scale(.92)}to{opacity:1;transform:scale(1.05)}}
@keyframes ae-s{0%,100%{opacity:.7;transform:scale(.9) rotate(0)}50%{opacity:1;transform:scale(1.15) rotate(45deg)}}
@media (prefers-reduced-motion: reduce){.el-fx i,.el-fx::after,.orive-tpl .avatar.emblem,.orive-tpl .avatar.emblem *{animation:none!important}.el-fx i{display:none}}
`;

/** deterministic particle layer (no JS, no randomness at runtime -> no hydration/layout shift) */
export function particlesHtml(e: ElementKey) {
  const n = 14;
  return `<div class="el-fx" aria-hidden="true">${Array.from({ length: n }, (_, i) => {
    const left = (i * 73) % 100, delay = -((i * 1.37) % 7).toFixed(2), dx = ((i % 5) - 2) * 14, top = (i * 37) % 90;
    const pos = e === "air" || e === "aether" ? `top:${top}%;left:${left}%` : `left:${left}%`;
    return `<i style="${pos};animation-delay:${delay}s;--dx:${dx}px"></i>`;
  }).join("")}</div>`;
}
