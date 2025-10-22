interface LogoProps {
  className?: string
  size?: number
}

export function Logo({ className = "", size = 40 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Gradient tanımlamaları */}
        <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2d7a4a" />
          <stop offset="50%" stopColor="#4caf50" />
          <stop offset="100%" stopColor="#66bb6a" />
        </linearGradient>
        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#81c784" />
          <stop offset="100%" stopColor="#a5d6a7" />
        </linearGradient>
        <radialGradient id="glowGradient">
          <stop offset="0%" stopColor="#4caf50" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#4caf50" stopOpacity="0" />
        </radialGradient>

        {/* Gölge filtresi */}
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
          <feOffset dx="0" dy="2" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Arka plan glow efekti */}
      <circle cx="50" cy="50" r="45" fill="url(#glowGradient)" />

      {/* Ana daire - kalın border */}
      <circle
        cx="50"
        cy="50"
        r="42"
        fill="white"
        stroke="url(#mainGradient)"
        strokeWidth="4"
        filter="url(#shadow)"
      />

      {/* İç dekoratif daire */}
      <circle
        cx="50"
        cy="50"
        r="35"
        fill="none"
        stroke="url(#accentGradient)"
        strokeWidth="1"
        opacity="0.4"
        strokeDasharray="3 3"
      />

      {/* Merkezi kalp şekli - sağlık sembolü */}
      <path
        d="M 50 35 
           C 45 30, 38 30, 35 35 
           C 32 40, 32 45, 35 48 
           L 50 60 
           L 65 48 
           C 68 45, 68 40, 65 35 
           C 62 30, 55 30, 50 35 Z"
        fill="url(#mainGradient)"
        filter="url(#shadow)"
      />

      {/* Kalp içinde artı işareti - sağlık */}
      <rect x="48" y="40" width="4" height="12" rx="1" fill="white" opacity="0.9" />
      <rect x="44" y="44" width="12" height="4" rx="1" fill="white" opacity="0.9" />

      {/* Etrafında dönen yapraklar */}
      <g opacity="0.8">
        {/* Sol üst yaprak */}
        <path
          d="M 25 30 Q 20 25, 22 20 Q 27 22, 28 28 Z"
          fill="url(#accentGradient)"
        />
        {/* Sağ üst yaprak */}
        <path
          d="M 75 30 Q 80 25, 78 20 Q 73 22, 72 28 Z"
          fill="url(#accentGradient)"
        />
        {/* Sol alt yaprak */}
        <path
          d="M 25 70 Q 20 75, 22 80 Q 27 78, 28 72 Z"
          fill="url(#accentGradient)"
        />
        {/* Sağ alt yaprak */}
        <path
          d="M 75 70 Q 80 75, 78 80 Q 73 78, 72 72 Z"
          fill="url(#accentGradient)"
        />
      </g>

      {/* Dekoratif yıldızlar/parıltılar */}
      <circle cx="30" cy="50" r="2" fill="#4caf50" opacity="0.6">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="70" cy="50" r="2" fill="#4caf50" opacity="0.6">
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="50" cy="25" r="1.5" fill="#66bb6a" opacity="0.5">
        <animate attributeName="opacity" values="0.2;0.7;0.2" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="50" cy="75" r="1.5" fill="#66bb6a" opacity="0.5">
        <animate attributeName="opacity" values="0.7;0.2;0.7" dur="3s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}
