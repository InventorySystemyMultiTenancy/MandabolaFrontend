// Máquina de pegar pelúcia em "3D" feita com SVG + CSS (perspectiva, lateral
// em profundidade, luzes piscando e garra descendo). Leve: nada de WebGL.
// Decorativa: aria-hidden. Animações em index.css (.claw-*), com
// prefers-reduced-motion desligando o movimento.
export function ClawMachine3D({ className = "" }) {
  return (
    <div className={`claw-scene ${className}`} aria-hidden="true">
      <div className="claw-float">
        <svg viewBox="0 0 240 280" className="claw-svg" role="presentation">
          <defs>
            <linearGradient id="cm-corpo" x1="0" x2="1">
              <stop offset="0" stopColor="#1E5BD8" />
              <stop offset="1" stopColor="#0B1F5C" />
            </linearGradient>
            <linearGradient id="cm-lado" x1="0" x2="1">
              <stop offset="0" stopColor="#0A1A4D" />
              <stop offset="1" stopColor="#07123A" />
            </linearGradient>
            <linearGradient id="cm-ouro" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFE07A" />
              <stop offset="0.55" stopColor="#F5B400" />
              <stop offset="1" stopColor="#B87E00" />
            </linearGradient>
            <linearGradient id="cm-vidro" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#7DD3FC" stopOpacity="0.38" />
              <stop offset="0.6" stopColor="#38BDF8" stopOpacity="0.12" />
              <stop offset="1" stopColor="#1E5BD8" stopOpacity="0.28" />
            </linearGradient>
            <radialGradient id="cm-bola-vermelha" cx="0.35" cy="0.3" r="0.7">
              <stop offset="0" stopColor="#FF8A8A" />
              <stop offset="1" stopColor="#C81E1E" />
            </radialGradient>
            <radialGradient id="cm-bola-azul" cx="0.35" cy="0.3" r="0.7">
              <stop offset="0" stopColor="#93C5FD" />
              <stop offset="1" stopColor="#1D4ED8" />
            </radialGradient>
            <radialGradient id="cm-bola-ouro" cx="0.35" cy="0.3" r="0.7">
              <stop offset="0" stopColor="#FFF1B8" />
              <stop offset="1" stopColor="#E0A100" />
            </radialGradient>
            <radialGradient id="cm-urso" cx="0.4" cy="0.35" r="0.7">
              <stop offset="0" stopColor="#D69B5E" />
              <stop offset="1" stopColor="#8A5A2B" />
            </radialGradient>
            <filter id="cm-brilho" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.2" />
            </filter>
          </defs>

          {/* sombra no chão */}
          <ellipse cx="128" cy="270" rx="92" ry="8" fill="#0B1F5C" opacity="0.22" />

          {/* lateral (profundidade) */}
          <path d="M196 34 L222 48 L222 262 L196 266 Z" fill="url(#cm-lado)" />
          <path d="M196 34 L222 48 L222 60 L196 50 Z" fill="#B87E00" />

          {/* letreiro */}
          <rect x="22" y="14" width="174" height="40" rx="12" fill="url(#cm-ouro)" />
          <rect x="30" y="21" width="158" height="26" rx="8" fill="#0B1F5C" />
          <text x="109" y="39" textAnchor="middle" fontSize="13" fontWeight="800" fill="#FFE07A" letterSpacing="1.5" fontFamily="Inter, system-ui, sans-serif">
            MANDA BOLA
          </text>
          {[34, 56, 78, 100, 122, 144, 166, 186].map((x, i) => (
            <circle key={x} cx={x} cy="17.5" r="2.4" className={`claw-luz claw-luz-${i % 3}`} />
          ))}

          {/* corpo */}
          <rect x="22" y="54" width="174" height="212" rx="10" fill="url(#cm-corpo)" />

          {/* vitrine */}
          <rect x="34" y="64" width="150" height="120" rx="8" fill="#0A1A4D" />
          {/* trilho da garra */}
          <rect x="40" y="70" width="138" height="4" rx="2" fill="#94A3B8" opacity="0.7" />

          {/* garra animada */}
          <g className="claw-rig">
            <rect x="105.5" y="75" width="3" height="23" fill="#CBD5E1" className="claw-cabo" />
            <rect x="96" y="66" width="22" height="9" rx="2.5" fill="#CBD5E1" />
            <g className="claw-drop">
              <circle cx="107" cy="100" r="5" fill="#E2E8F0" />
              <path d="M102 103 Q93 112 97 122" stroke="#E2E8F0" strokeWidth="3.2" fill="none" strokeLinecap="round" className="claw-dedo-e" />
              <path d="M112 103 Q121 112 117 122" stroke="#E2E8F0" strokeWidth="3.2" fill="none" strokeLinecap="round" className="claw-dedo-d" />
              <path d="M107 105 L107 120" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
            </g>
          </g>

          {/* prêmios */}
          <circle cx="58" cy="168" r="13" fill="url(#cm-bola-vermelha)" />
          <circle cx="160" cy="166" r="14" fill="url(#cm-bola-azul)" />
          <circle cx="84" cy="172" r="9" fill="url(#cm-bola-ouro)" />
          <circle cx="138" cy="174" r="9" fill="url(#cm-bola-vermelha)" />
          <g className="claw-urso">
            <circle cx="98" cy="146" r="7" fill="url(#cm-urso)" />
            <circle cx="122" cy="146" r="7" fill="url(#cm-urso)" />
            <circle cx="110" cy="160" r="17" fill="url(#cm-urso)" />
            <ellipse cx="110" cy="166" rx="8" ry="6" fill="#F3D3A8" />
            <circle cx="104" cy="156" r="2.2" fill="#1F1206" />
            <circle cx="116" cy="156" r="2.2" fill="#1F1206" />
            <circle cx="110" cy="163.5" r="2.4" fill="#1F1206" />
          </g>

          {/* vidro + reflexos */}
          <rect x="34" y="64" width="150" height="120" rx="8" fill="url(#cm-vidro)" />
          <path d="M44 72 L72 72 L48 176 L40 176 Z" fill="#fff" opacity="0.13" />
          <path d="M80 72 L90 72 L66 176 L60 176 Z" fill="#fff" opacity="0.08" />
          <rect x="34" y="64" width="150" height="120" rx="8" fill="none" stroke="#F5B400" strokeWidth="2.5" />

          {/* painel de controle */}
          <path d="M22 196 L196 196 L196 214 L22 214 Z" fill="#0B1F5C" />
          <rect x="22" y="192" width="174" height="6" fill="url(#cm-ouro)" />
          <circle cx="62" cy="206" r="7" fill="#1E293B" />
          <line x1="62" y1="206" x2="66" y2="194" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" className="claw-joystick" />
          <circle cx="66" cy="193" r="5" fill="url(#cm-bola-vermelha)" className="claw-joystick" />
          <circle cx="150" cy="205" r="7" fill="url(#cm-bola-ouro)" className="claw-botao" />
          <circle cx="150" cy="205" r="10" fill="#F5B400" opacity="0.5" filter="url(#cm-brilho)" className="claw-botao" />

          {/* saída de prêmio */}
          <rect x="44" y="226" width="56" height="28" rx="6" fill="#07123A" stroke="#38BDF8" strokeOpacity="0.5" />
          <rect x="128" y="230" width="44" height="10" rx="3" fill="#07123A" />
          <circle cx="136" cy="248" r="3" className="claw-led" />
          <circle cx="148" cy="248" r="3" className="claw-led claw-luz-1" />
          <circle cx="160" cy="248" r="3" className="claw-led claw-luz-2" />
        </svg>
      </div>

      {/* objetos flutuando em camadas (parallax pela var --parallax-y) */}
      <span className="claw-orb claw-orb-a" />
      <span className="claw-orb claw-orb-b" />
      <span className="claw-orb claw-orb-c" />
      <span className="claw-capsula" />
    </div>
  );
}
