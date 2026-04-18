// Hand-drawn dark-fantasy silhouette icons.
// SVG paths — 24x24 viewBox. Keep strokes 1.4 for consistency.

const EIcon = ({ name, size = 20, color = 'currentColor', stroke = 1.4 }) => {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    // tab glyphs
    case 'skull': return (
      <svg {...common}>
        <path d="M12 3c-4.5 0-7 3-7 7v3l-1.5 2 1.5 1v2l2 1v2h3v-1l1 1h4l1-1v1h3v-2l2-1v-2l1.5-1-1.5-2V10c0-4-2.5-7-7-7z"/>
        <circle cx="9" cy="12" r="1.4" fill={color}/>
        <circle cx="15" cy="12" r="1.4" fill={color}/>
        <path d="M10 17l1-1h2l1 1"/>
      </svg>
    );
    case 'eye': return (
      <svg {...common}>
        <path d="M2 12c3-5 6-7 10-7s7 2 10 7c-3 5-6 7-10 7s-7-2-10-7z"/>
        <circle cx="12" cy="12" r="3.2"/>
        <circle cx="12" cy="12" r="0.9" fill={color} stroke="none"/>
      </svg>
    );
    case 'rune-sigil': return (
      <svg {...common}>
        <path d="M6 3l6 4 6-4v6l-6 4-6-4z"/>
        <path d="M12 13v8"/>
        <path d="M9 17l3 2 3-2"/>
      </svg>
    );
    case 'tome': return (
      <svg {...common}>
        <path d="M4 4h14a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/>
        <path d="M4 4v18"/>
        <path d="M8 8h8M8 12h8M8 16h5"/>
      </svg>
    );
    // actions
    case 'plus': return (
      <svg {...common}><path d="M12 5v14M5 12h14"/></svg>
    );
    case 'search': return (
      <svg {...common}><circle cx="10" cy="10" r="6"/><path d="M15 15l5 5"/></svg>
    );
    case 'chevron-right': return (
      <svg {...common}><path d="M9 5l7 7-7 7"/></svg>
    );
    case 'chevron-left': return (
      <svg {...common}><path d="M15 5l-7 7 7 7"/></svg>
    );
    case 'check': return (
      <svg {...common}><path d="M5 12l5 5L20 7"/></svg>
    );
    case 'x': return (
      <svg {...common}><path d="M6 6l12 12M6 18L18 6"/></svg>
    );
    case 'sort': return (
      <svg {...common}><path d="M6 9l3-3 3 3M9 6v12M15 15l3 3 3-3M18 18V6"/></svg>
    );
    case 'filter': return (
      <svg {...common}><path d="M3 5h18l-7 8v6l-4-2v-4z"/></svg>
    );
    // item archetypes (abstract silhouettes)
    case 'helm': return (
      <svg {...common}>
        <path d="M6 14c0-5 3-9 6-9s6 4 6 9v3l-2 2H8l-2-2z"/>
        <path d="M9 14h6"/>
        <path d="M10 17v2M14 17v2"/>
      </svg>
    );
    case 'armor': return (
      <svg {...common}>
        <path d="M6 5l6-2 6 2v7c0 4-3 7-6 9-3-2-6-5-6-9z"/>
        <path d="M12 3v18M8 9h8"/>
      </svg>
    );
    case 'sword': return (
      <svg {...common}>
        <path d="M4 20l3-3 10-13 3 3L7 20z"/>
        <path d="M4 20l3-1 1-3"/>
        <path d="M13 8l3 3"/>
      </svg>
    );
    case 'mace': return (
      <svg {...common}>
        <circle cx="7" cy="17" r="3.5"/>
        <path d="M4 20l2-2M10 14l8-11"/>
        <path d="M16 3l5 5"/>
      </svg>
    );
    case 'bow': return (
      <svg {...common}>
        <path d="M5 3c8 0 14 6 14 14"/>
        <path d="M5 3v14l8-8z"/>
        <path d="M13 17l6 4"/>
      </svg>
    );
    case 'wand': return (
      <svg {...common}>
        <path d="M4 20l13-13"/>
        <path d="M17 4l3 3-3 3-3-3z"/>
        <path d="M6 18l-1 3 3-1"/>
      </svg>
    );
    case 'shield': return (
      <svg {...common}>
        <path d="M12 3l7 2v7c0 4-3 7-7 9-4-2-7-5-7-9V5z"/>
        <path d="M9 10l2 2 4-4"/>
      </svg>
    );
    case 'ring': return (
      <svg {...common}>
        <circle cx="12" cy="14" r="6"/>
        <path d="M9 9l3-5 3 5"/>
      </svg>
    );
    case 'amulet': return (
      <svg {...common}>
        <path d="M6 3l3 4M18 3l-3 4"/>
        <path d="M12 21a6 6 0 00.001-12.001A6 6 0 0012 21z"/>
        <path d="M12 11l-2 4h4z"/>
      </svg>
    );
    case 'belt': return (
      <svg {...common}>
        <rect x="3" y="9" width="18" height="6"/>
        <circle cx="12" cy="12" r="1.5"/>
        <path d="M8 9v6M16 9v6"/>
      </svg>
    );
    case 'boots': return (
      <svg {...common}>
        <path d="M7 3h3v12l5 4v3H4v-3l3-2z"/>
        <path d="M7 15h3"/>
      </svg>
    );
    case 'gloves': return (
      <svg {...common}>
        <path d="M6 11V6a2 2 0 014 0v5M10 11V5a2 2 0 014 0v6M14 11V6a2 2 0 014 0v7c0 4-2 8-6 8s-6-3-6-7v-3z"/>
      </svg>
    );
    case 'rune': return (
      <svg {...common}>
        <path d="M4 4l8 16L20 4z"/>
        <path d="M4 4l16 0"/>
        <path d="M10 11h4"/>
      </svg>
    );
    case 'gem': return (
      <svg {...common}>
        <path d="M12 3l7 6-7 12L5 9z"/>
        <path d="M5 9h14M12 3v18M9 9l3 4 3-4"/>
      </svg>
    );
    case 'potion': return (
      <svg {...common}>
        <path d="M10 3h4v4l3 4v8a3 3 0 01-3 3H10a3 3 0 01-3-3v-8l3-4z"/>
        <path d="M7 13h10"/>
        <path d="M9 3h6"/>
      </svg>
    );
    case 'scroll': return (
      <svg {...common}>
        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5z"/>
        <path d="M5 7h14M5 19h14"/>
        <path d="M9 11h6M9 14h4"/>
      </svg>
    );
    case 'charm': return (
      <svg {...common}>
        <rect x="8" y="4" width="8" height="16" rx="1"/>
        <path d="M10 8h4M10 12h4M10 16h4"/>
      </svg>
    );
    case 'chest': return (
      <svg {...common}>
        <path d="M4 10a3 3 0 013-3h10a3 3 0 013 3v10H4z"/>
        <path d="M4 14h16"/>
        <rect x="11" y="12" width="2" height="4"/>
      </svg>
    );
    case 'flag': return (
      <svg {...common}>
        <path d="M5 3v18"/>
        <path d="M5 4h11l-2 4 2 4H5"/>
      </svg>
    );
    case 'trade': return (
      <svg {...common}>
        <path d="M3 8h14l-3-3M17 16H3l3 3"/>
        <path d="M17 8l4-3M17 16l4 3"/>
      </svg>
    );
    case 'fire': return (
      <svg {...common}>
        <path d="M12 3s4 4 4 8c0 1-1 2-2 2 0-2-1-3-2-4 0 3-3 5-3 8a5 5 0 0010 0c0-6-7-14-7-14z"/>
      </svg>
    );
    case 'candle': return (
      <svg {...common}>
        <rect x="9" y="9" width="6" height="12"/>
        <path d="M12 5c0 2 2 2 2 4s-1 2-2 2-2 0-2-2 2-2 2-4z"/>
      </svg>
    );
    case 'cog': return (
      <svg {...common}>
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2v3M12 19v3M4.2 4.2l2 2M17.8 17.8l2 2M2 12h3M19 12h3M4.2 19.8l2-2M17.8 6.2l2-2"/>
      </svg>
    );
    case 'download': return (
      <svg {...common}>
        <path d="M12 3v13M7 11l5 5 5-5M4 20h16"/>
      </svg>
    );
    case 'upload': return (
      <svg {...common}>
        <path d="M12 16V3M7 8l5-5 5 5M4 20h16"/>
      </svg>
    );
    case 'socket': return (
      <svg {...common}>
        <rect x="3" y="3" width="6" height="6"/>
        <rect x="15" y="3" width="6" height="6"/>
        <rect x="3" y="15" width="6" height="6"/>
        <rect x="15" y="15" width="6" height="6"/>
      </svg>
    );
    case 'moon': return (
      <svg {...common}>
        <path d="M20 14A8 8 0 019 3a8 8 0 1011 11z"/>
      </svg>
    );
    default: return null;
  }
};

window.EIcon = EIcon;
