// Shared atoms for the Forge redesigns.

function RealmTagStrip({ era, mode, ladder, region, size = 'md' }) {
  const T = window.ET.color, F = window.ET.font;
  const eraT = window.REALM_TAG.era[era];
  const modeT = window.REALM_TAG.mode[mode];
  const ladT = window.REALM_TAG.ladder[ladder];
  const regT = region ? window.REALM_TAG.region[region] : null;
  const fs = size === 'sm' ? 8 : 9;
  const pad = size === 'sm' ? '2px 5px' : '3px 7px';
  const tags = [eraT, modeT, ladT, regT].filter(Boolean);
  return (
    <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
      {tags.map((t,i) => (
        <div key={i} style={{
          padding: pad,
          border: `1px solid ${t.color}66`,
          color: t.color,
          background: `${t.color}10`,
          fontFamily: F.mono, fontSize: fs, letterSpacing: 1.2, fontWeight: 700, textTransform:'uppercase',
        }}>{t.label}</div>
      ))}
    </div>
  );
}

// Rune-style stat — big number with small label
function RuneStat({ value, label, color, big }) {
  const T = window.ET.color, F = window.ET.font;
  const c = color || T.gold;
  return (
    <div>
      <div style={{
        fontFamily: F.display, fontWeight: 700, lineHeight: 1,
        fontSize: big ? 32 : 22, color: c,
        textShadow: `0 0 12px ${c}66`,
      }}>{value}</div>
      <div style={{ fontFamily: F.mono, fontSize: 8, letterSpacing: 2, color: T.textDim, marginTop: 4, textTransform:'uppercase' }}>{label}</div>
    </div>
  );
}

// Inline segmented control for the Forge screens
function ForgeSeg({ value, options, onChange, small }) {
  const T = window.ET.color, F = window.ET.font;
  return (
    <div style={{
      display:'inline-flex',
      border:`1px solid ${T.line}`,
      background: T.bgSoft,
    }}>
      {options.map(o => {
        const on = value === o.v;
        return (
          <div key={o.v} onClick={()=>onChange && onChange(o.v)} style={{
            padding: small ? '5px 9px' : '7px 11px', cursor:'pointer',
            background: on ? `linear-gradient(180deg, ${T.ember}, ${T.lava})` : 'transparent',
            color: on ? '#1a0a04' : T.textDim,
            fontFamily:F.mono, fontSize: small ? 9 : 10, letterSpacing:1.5, fontWeight:700, textTransform:'uppercase',
            boxShadow: on ? `inset 0 0 12px rgba(255,220,180,0.25)` : 'none',
            borderRight: o !== options[options.length-1] ? `1px solid ${T.line}` : 'none',
          }}>{o.l}</div>
        );
      })}
    </div>
  );
}

// Corner-forged panel — heavy border with clipped corners via box-shadow insets
function AnvilPanel({ children, style, glow }) {
  const T = window.ET.color;
  return (
    <div style={{
      position:'relative',
      border:`1px solid ${T.lineGold}`,
      background: `linear-gradient(180deg, ${T.cardHi}, ${T.card} 60%, #0a0504)`,
      boxShadow: glow
        ? `inset 0 1px 0 rgba(232,176,72,0.15), inset 0 0 40px rgba(255,80,32,0.08), 0 12px 40px rgba(0,0,0,0.7), 0 0 24px rgba(255,80,32,0.18)`
        : `inset 0 1px 0 rgba(232,176,72,0.1), inset 0 0 40px rgba(0,0,0,0.5), 0 6px 20px rgba(0,0,0,0.6)`,
      ...style,
    }}>
      {/* corner ornaments */}
      {[[0,0],[1,0],[0,1],[1,1]].map(([x,y],i) => (
        <div key={i} style={{
          position:'absolute', width:8, height:8,
          left: x ? 'auto' : -1, right: x ? -1 : 'auto',
          top: y ? 'auto' : -1, bottom: y ? -1 : 'auto',
          borderTop: y ? 'none' : `1px solid ${T.gold}`,
          borderBottom: y ? `1px solid ${T.gold}` : 'none',
          borderLeft: x ? 'none' : `1px solid ${T.gold}`,
          borderRight: x ? `1px solid ${T.gold}` : 'none',
        }}/>
      ))}
      {children}
    </div>
  );
}

// Station header — numbered roman-numeral section
function StationHead({ numeral, title, subtitle, icon }) {
  const T = window.ET.color, F = window.ET.font;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'4px 0' }}>
      <div style={{
        width:36, height:36, position:'relative',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <div style={{
          position:'absolute', inset:0, transform:'rotate(45deg)',
          border:`1px solid ${T.goldDim}`,
          background:`linear-gradient(135deg, rgba(255,80,32,0.15), transparent)`,
          boxShadow:`inset 0 0 10px rgba(255,80,32,0.2)`,
        }}/>
        <div style={{ position:'relative', fontFamily:F.display, fontSize:14, fontWeight:700, color:T.gold,
          textShadow:`0 0 8px ${T.ember}66`, letterSpacing:1 }}>{numeral}</div>
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:F.display, fontSize:15, color:T.gold, fontWeight:600, letterSpacing:3, textTransform:'uppercase' }}>{title}</div>
        {subtitle && <div style={{ fontFamily:F.hand, fontSize:12, color:T.textDim, marginTop:1, fontStyle:'italic' }}>{subtitle}</div>}
      </div>
      {icon && <EIcon name={icon} size={16} color={T.goldDim}/>}
    </div>
  );
}

// ---------- Motion Intensity ----------
// Tier config matches components/ember/MotionIntensityPicker.tsx in v1.1.
window.MOTION_TIERS = {
  subtle:    { label:'SUBTLE',    sub:'Normal Difficulty',     lit:1, accent:'#e8b048',
               desc:'The forge has cooled. You can think clearly here.',
               bullets:['Gentle 300ms fade-ins','Native scroll physics','Accent dots pulse','No particles'] },
  nightmare: { label:'NIGHTMARE', sub:'Dark · Ominous',        lit:2, accent:'#ff5020',
               desc:'Something breathes in the dark. You are not alone.',
               bullets:['Heat shimmer on titles','5–8 drifting embers','Items glow on reveal','Modal spring · edge flash'] },
  hellforge: { label:'HELLFORGE', sub:'Maximum Intensity',     lit:3, accent:'#ff8800',
               desc:'The air buckles. The anvil sings. You are too close.',
               bullets:['20–30 embers + cinders pool','Molten glow titles','Forge spark bursts · 2–4s','Firelight stat flicker','Pulsing edge vignette'] },
};

function FlameStrip({ lit = 1, accent = '#ff5020', glow = false, size = 11 }) {
  return (
    <div style={{ display:'flex', gap:2, alignItems:'flex-end', height: size }}>
      {[0,1,2].map(i => {
        const on = i < lit;
        return (
          <div key={i} style={{
            width: 6, height: size,
            clipPath: 'polygon(50% 0, 100% 60%, 80% 100%, 20% 100%, 0 60%)',
            background: on ? accent : '#3a2a1f',
            opacity: on ? 1 : 0.55,
            boxShadow: on && glow ? `0 0 6px ${accent}, 0 0 2px ${accent}` : 'none',
          }}/>
        );
      })}
    </div>
  );
}

// The canonical 3-card motion picker used across redesigns.
function MotionTierCards({ value, onChange, compact }) {
  const T = window.ET.color, F = window.ET.font;
  const order = ['subtle','nightmare','hellforge'];
  return (
    <div style={{ display:'flex', gap:6 }}>
      {order.map(tier => {
        const cfg = window.MOTION_TIERS[tier];
        const active = value === tier;
        const accent = cfg.accent;
        const tint = tier==='hellforge' ? 'rgba(255,80,32,0.18)' : tier==='nightmare' ? 'rgba(255,80,32,0.10)' : 'rgba(255,176,72,0.06)';
        return (
          <div key={tier} onClick={()=>onChange && onChange(tier)} style={{
            flex:1, cursor:'pointer',
            padding: compact ? '10px 8px' : '12px 10px',
            border:`1px solid ${active ? accent : T.line}`,
            background: active ? tint : T.card,
            boxShadow: active ? `0 0 14px ${accent}55, inset 0 0 14px ${accent}14` : 'none',
            display:'flex', flexDirection:'column', alignItems:'flex-start', gap:6,
          }}>
            <FlameStrip lit={cfg.lit} accent={active ? accent : '#5a4030'} glow={active} size={compact ? 10 : 11}/>
            <div style={{
              fontFamily:F.display, fontSize: compact ? 11 : 12, letterSpacing:2, fontWeight:700, textTransform:'uppercase',
              color: active ? accent : T.text,
              textShadow: active ? `0 0 8px ${accent}66` : 'none',
            }}>{cfg.label}</div>
            <div style={{
              fontFamily:F.mono, fontSize: 8, letterSpacing:1.4, textTransform:'uppercase',
              color: active ? T.gold : T.textDim,
            }}>{cfg.sub}</div>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { RealmTagStrip, RuneStat, ForgeSeg, AnvilPanel, StationHead, FlameStrip, MotionTierCards });
