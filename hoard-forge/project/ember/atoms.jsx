// Shared atoms for Ember designs.

const { useState, useEffect, useRef } = React;

// Hellfire background — tokens-driven, motion-aware
function EmberBG({ motion = 'full', seed = 0 }) {
  const T = window.ET.color;
  const intensity = motion === 'full' ? 1 : 0.4;
  const particles = motion === 'full';

  // deterministic-ish ember positions
  const emberSpots = [
    [72, 18, 2, 7], [18, 42, 2.5, 11], [86, 66, 2, 5],
    [40, 82, 2, 9], [55, 28, 2.5, 6], [28, 18, 1.6, 8],
    [78, 48, 1.8, 10], [12, 72, 2, 7.5], [62, 62, 1.4, 12],
  ];

  return (
    <>
      <div style={{
        position: 'absolute', inset: 0, background: T.bg,
        backgroundImage:
          `radial-gradient(620px 400px at 50% -10%, rgba(255,80,32,${0.22 * intensity}), transparent 70%),` +
          `radial-gradient(400px 320px at 8% 110%, rgba(200,48,24,${0.18 * intensity}), transparent 70%),` +
          `radial-gradient(500px 340px at 100% 100%, rgba(255,120,48,${0.12 * intensity}), transparent 70%)`,
      }}/>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: 140,
        background: `linear-gradient(to top, rgba(255,80,32,${0.14 * intensity}), transparent)`,
        pointerEvents: 'none',
      }}/>
      {particles && emberSpots.map(([x, y, s, dur], i) => (
        <div key={`${seed}-${i}`} style={{
          position: 'absolute', left: `${x}%`, top: `${y}%`,
          width: s, height: s, borderRadius: '50%',
          background: T.emberHi,
          boxShadow: `0 0 ${6 * s}px ${T.emberHi}, 0 0 ${14 * s}px ${T.ember}`,
          animation: `ember-float ${dur}s ease-out infinite`,
          animationDelay: `${(i * 0.7) % dur}s`,
          '--drift': `${(i % 2 === 0 ? 1 : -1) * (10 + (i * 3) % 24)}px`,
          pointerEvents: 'none',
        }}/>
      ))}
      {/* static accent dots when motion off */}
      {!particles && emberSpots.slice(0, 4).map(([x, y, s], i) => (
        <div key={`s-${i}`} style={{
          position: 'absolute', left: `${x}%`, top: `${y}%`,
          width: s, height: s, borderRadius: '50%',
          background: T.emberHi,
          boxShadow: `0 0 ${5 * s}px ${T.ember}`,
          opacity: 0.5,
        }}/>
      ))}
      <div style={{
        position: 'absolute', inset: 0,
        boxShadow: 'inset 0 0 80px rgba(0,0,0,0.9), inset 0 0 220px rgba(0,0,0,0.55)',
        pointerEvents: 'none',
      }}/>
    </>
  );
}

// Forged diamond bullet
function Diamond({ size = 10, color, filled = true, glow = true }) {
  const c = color || window.ET.color.gold;
  return (
    <div style={{
      width: size, height: size, transform: 'rotate(45deg)',
      background: filled ? c : 'transparent',
      border: filled ? 'none' : `1px solid ${c}`,
      boxShadow: filled && glow ? `0 0 6px ${c}88` : 'none',
    }}/>
  );
}

function RarityDot({ cat, size = 8 }) {
  const c = window.rarityColor(cat);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: c,
      boxShadow: `0 0 10px ${c}, 0 0 3px ${c}`, flexShrink: 0,
    }}/>
  );
}

function Rule({ children, style, accent }) {
  const T = window.ET.color;
  const ac = accent || T.ember;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, ...style }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${T.goldDim})` }}/>
      <Diamond color={ac}/>
      {children && <span style={{ fontFamily: window.ET.font.mono, fontSize: 10, letterSpacing: 2, color: T.textDim, textTransform: 'uppercase' }}>{children}</span>}
      <Diamond color={ac}/>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${T.goldDim})` }}/>
    </div>
  );
}

// Primary ember button
function EmberBtn({ children, onClick, variant = 'primary', size = 'md', full = false, style, icon }) {
  const T = window.ET.color;
  const F = window.ET.font;
  const base = {
    cursor: 'pointer',
    fontFamily: F.display,
    fontWeight: 600,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: full ? '100%' : 'auto',
    userSelect: 'none',
  };
  const sizes = {
    sm: { padding: '8px 14px', fontSize: 11 },
    md: { padding: '13px 18px', fontSize: 13 },
    lg: { padding: '16px 22px', fontSize: 15 },
  };
  const variants = {
    primary: {
      background: `linear-gradient(180deg, ${T.ember}, ${T.lava})`,
      color: '#1a0a04',
      border: '1px solid transparent',
      boxShadow: `0 0 28px ${T.ember}66, 0 6px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,220,180,0.3)`,
    },
    ghost: {
      background: T.bgSoft,
      color: T.gold,
      border: `1px solid ${T.goldDim}`,
    },
    outline: {
      background: 'transparent',
      color: T.text,
      border: `1px solid ${T.lineHi}`,
    },
    danger: {
      background: 'transparent',
      color: T.danger,
      border: `1px solid ${T.danger}66`,
    },
  };
  return (
    <div onClick={onClick} style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>
      {icon && <EIcon name={icon} size={14} color="currentColor"/>}
      {children}
    </div>
  );
}

// Pill / chip
function Chip({ children, active, onClick, color, size = 'md' }) {
  const T = window.ET.color;
  const c = color || T.gold;
  const sz = size === 'sm'
    ? { padding: '3px 9px', fontSize: 9, letterSpacing: 1.2 }
    : { padding: '5px 12px', fontSize: 10, letterSpacing: 1.5 };
  return (
    <div onClick={onClick} style={{
      ...sz,
      cursor: onClick ? 'pointer' : 'default',
      background: active ? c : 'transparent',
      color: active ? '#120905' : c,
      border: `1px solid ${active ? c : c + '99'}`,
      fontFamily: window.ET.font.mono,
      fontWeight: 700,
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      boxShadow: active ? `0 0 12px ${c}66` : 'none',
    }}>{children}</div>
  );
}

// Section header with rule
function SectionHead({ eyebrow, title, right }) {
  const T = window.ET.color;
  const F = window.ET.font;
  return (
    <div style={{ padding: '56px 20px 12px' }}>
      {eyebrow && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Diamond size={7} color={T.ember}/>
          <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: 3, color: T.textDim, textTransform: 'uppercase' }}>{eyebrow}</div>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: F.display, fontSize: 32, color: T.gold, letterSpacing: 4, fontWeight: 600, lineHeight: 1,
          textShadow: `0 0 24px ${T.ember}66, 0 0 8px ${T.gold}33` }}>{title}</div>
        {right}
      </div>
    </div>
  );
}

// Back-arrow nav row
function NavBar({ back = 'Back', onBack, right, title }) {
  const T = window.ET.color;
  const F = window.ET.font;
  return (
    <div style={{ padding: '56px 20px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
        fontFamily: F.mono, fontSize: 11, color: T.gold, letterSpacing: 2, textTransform: 'uppercase' }}>
        <EIcon name="chevron-left" size={14}/> {back}
      </div>
      <div style={{ flex: 1, textAlign: 'center', fontFamily: F.mono, fontSize: 10, color: T.textDim, letterSpacing: 3, textTransform: 'uppercase' }}>{title}</div>
      <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textDim, letterSpacing: 2, minWidth: 40, textAlign: 'right' }}>{right}</div>
    </div>
  );
}

// Bottom tab bar
function TabBar({ active, onChange, motion }) {
  const T = window.ET.color;
  const F = window.ET.font;
  const tabs = [
    { k: 'home',     l: 'Chronicle', icon: 'tome' },
    { k: 'mules',    l: 'Mules',     icon: 'skull' },
    { k: 'find',     l: 'Seek',      icon: 'eye' },
    { k: 'runes',    l: 'Runes',     icon: 'rune-sigil' },
    { k: 'codex',    l: 'Codex',     icon: 'cog' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20,
      paddingBottom: 30, paddingTop: 10,
      background: `linear-gradient(180deg, rgba(13,7,5,0.85), rgba(7,4,3,0.98))`,
      borderTop: `1px solid ${T.lineHi}`,
      backdropFilter: 'blur(8px)',
      boxShadow: `inset 0 1px 0 rgba(255,80,32,0.08), 0 -10px 30px rgba(0,0,0,0.6)`,
    }}>
      <div style={{ display: 'flex' }}>
        {tabs.map(t => {
          const on = active === t.k;
          return (
            <div key={t.k} onClick={() => onChange && onChange(t.k)} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              cursor: 'pointer',
              color: on ? T.ember : T.textDim,
              filter: on && motion === 'full' ? `drop-shadow(0 0 6px ${T.ember})` : 'none',
            }}>
              <EIcon name={t.icon} size={18} color="currentColor" stroke={on ? 1.6 : 1.3}/>
              <div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' }}>{t.l}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// FAB
function FAB({ onClick, icon = 'plus', bottom = 94, right = 20 }) {
  const T = window.ET.color;
  return (
    <div onClick={onClick} style={{
      position: 'absolute', bottom, right, zIndex: 15,
      width: 56, height: 56, borderRadius: '50%',
      background: `radial-gradient(circle at 30% 30%, ${T.emberHi}, ${T.lava} 60%, #400808)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff',
      cursor: 'pointer',
      boxShadow: `0 0 32px ${T.ember}cc, 0 0 12px ${T.emberHi}, 0 6px 20px rgba(0,0,0,0.6)`,
    }}>
      <EIcon name={icon} size={22} color="#fff" stroke={1.8}/>
    </div>
  );
}

// StatusBar-safe top gradient for scroll fade
function TopFade() {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 52, zIndex: 5, pointerEvents: 'none',
      background: `linear-gradient(180deg, ${window.ET.color.bg}, transparent)`,
    }}/>
  );
}

// Labeled form row
function Field({ label, children, hint }) {
  const T = window.ET.color;
  const F = window.ET.font;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: 2.5, color: T.textDim, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      {children}
      {hint && <div style={{ fontFamily: F.body, fontSize: 11, color: T.textMute, marginTop: 4, fontStyle: 'italic' }}>{hint}</div>}
    </div>
  );
}

function Input({ value, placeholder, onChange, mono, style }) {
  const T = window.ET.color;
  const F = window.ET.font;
  return (
    <input defaultValue={value || ''} placeholder={placeholder} onChange={onChange} style={{
      width: '100%', padding: '10px 12px',
      background: T.bgSoft, border: `1px solid ${T.line}`, outline: 'none',
      color: T.text, fontSize: 14, fontFamily: mono ? F.mono : F.body,
      boxSizing: 'border-box', ...style,
    }}/>
  );
}

Object.assign(window, { EmberBG, Diamond, RarityDot, Rule, EmberBtn, Chip, SectionHead, NavBar, TabBar, FAB, TopFade, Field, Input });
