// Secondary screens — Runes, Wishlist, Trades, Codex/Settings, Add Mule, Empty states

// =====================================================================
// RUNES — grid of counts + runeword planner
// =====================================================================
function RunesScreen({ motion = 'full', onNav }) {
  const T = window.ET.color, F = window.ET.font;
  const [tab, setTab] = React.useState('grid');
  const total = window.RUNE_LIST.reduce((a,[,n])=>a+n, 0);

  return (
    <ScreenShell motion={motion}>
      <SectionHead
        eyebrow="Chronicle III · The Sigils"
        title="RUNES"
        right={
          <div style={{ textAlign:'right' }}>
            <div style={{ fontFamily:F.display, fontSize:26, color:T.rune, fontWeight:600, lineHeight:1,
              textShadow:`0 0 12px ${T.rune}66` }}>{total}</div>
            <div style={{ fontFamily:F.mono, fontSize:9, letterSpacing:2, color:T.textDim }}>SIGILS BOUND</div>
          </div>
        }
      />

      <div style={{ padding:'0 20px 10px', display:'flex', gap:6 }}>
        <Chip active={tab==='grid'} onClick={()=>setTab('grid')}>Grid</Chip>
        <Chip active={tab==='words'} onClick={()=>setTab('words')}>Words</Chip>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'0 0 110px' }}>
        {tab === 'grid' ? (
          <div style={{ padding:'8px 20px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:1, background:T.line }}>
              {window.RUNE_LIST.map(([name,count], i) => {
                const has = count > 0;
                return (
                  <div key={i} style={{
                    background: has ? `linear-gradient(180deg, rgba(255,106,42,0.1), ${T.card})` : T.bg,
                    padding:'14px 6px', textAlign:'center', position:'relative',
                    borderLeft: has ? `2px solid ${T.rune}88` : `2px solid transparent`,
                  }}>
                    <div style={{ fontFamily:F.display, fontSize:15, fontWeight:700, letterSpacing:1,
                      color: has ? T.rune : T.textFaint,
                      textShadow: has ? `0 0 8px ${T.rune}66` : 'none' }}>{name}</div>
                    <div style={{ fontFamily:F.mono, fontSize:10, color: has ? T.gold : T.textFaint, marginTop:2 }}>
                      {has ? `×${count}` : '—'}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop:18, fontFamily:F.hand, fontSize:13, color:T.textDim, fontStyle:'italic', textAlign:'center' }}>
              "el, eld, tir, nef... the mouth grows tired before the sigils do."
            </div>
          </div>
        ) : (
          <div style={{ padding:'8px 20px' }}>
            {window.RUNEWORDS.map((r, i) => {
              const ready = r.have.every(Boolean);
              const missing = r.runes.filter((_,j)=>!r.have[j]);
              return (
                <div key={i} style={{
                  padding:'14px', marginBottom:10,
                  background: ready ? `linear-gradient(90deg, rgba(106,174,74,0.1), transparent 60%)` : T.card,
                  border: `1px solid ${ready ? T.set : T.line}`,
                  borderLeft: `3px solid ${ready ? T.set : T.ember}`,
                }}>
                  <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
                    <div style={{ fontFamily:F.display, fontSize:19, color:T.text, fontWeight:600, flex:1,
                      textShadow:`0 0 10px ${ready?T.set:T.ember}33` }}>{r.name}</div>
                    <div style={{ fontFamily:F.mono, fontSize:10, letterSpacing:2, fontWeight:700,
                      color: ready ? T.set : T.ember }}>
                      {ready ? 'FORGEABLE' : `NEED ${missing.length}`}
                    </div>
                  </div>
                  <div style={{ fontFamily:F.body, fontSize:12, color:T.textDim, marginTop:3 }}>{r.base} · {r.slot}</div>
                  <div style={{ display:'flex', gap:4, marginTop:10 }}>
                    {r.runes.map((rn, j) => (
                      <div key={j} style={{
                        padding:'5px 9px',
                        fontFamily:F.display, fontSize:12, fontWeight:700, letterSpacing:0.5,
                        color: r.have[j] ? T.rune : T.textFaint,
                        border: `1px solid ${r.have[j] ? T.rune : T.line}`,
                        background: r.have[j] ? `rgba(255,106,42,0.1)` : 'transparent',
                        textShadow: r.have[j] ? `0 0 6px ${T.rune}66` : 'none',
                      }}>{rn}</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TabBar active="runes" onChange={onNav} motion={motion}/>
    </ScreenShell>
  );
}

// =====================================================================
// WISHLIST
// =====================================================================
function WishlistScreen({ motion='full', onBack }) {
  const T = window.ET.color, F = window.ET.font;
  const groups = [
    ['high', window.WISHLIST.filter(w=>w.priority==='high')],
    ['med',  window.WISHLIST.filter(w=>w.priority==='med')],
    ['low',  window.WISHLIST.filter(w=>w.priority==='low')],
  ];
  return (
    <ScreenShell motion={motion}>
      <NavBar back="Chronicle" onBack={onBack} title="The Hunt" right={<EIcon name="plus" size={14}/>}/>
      <div style={{ padding:'0 20px 14px' }}>
        <div style={{ fontFamily:F.display, fontSize:30, color:T.ember, fontWeight:600, letterSpacing:3,
          textShadow:`0 0 20px ${T.ember}66` }}>WISHLIST</div>
        <div style={{ fontFamily:F.hand, fontSize:14, color:T.textDim, marginTop:4, fontStyle:'italic' }}>
          what the shadow still hungers for
        </div>
      </div>
      <div style={{ flex:1, overflow:'auto', padding:'0 0 90px' }}>
        {groups.map(([p, list]) => list.length > 0 && (
          <div key={p}>
            <div style={{ padding:'10px 20px' }}>
              <Rule>{p.toUpperCase()} PRIORITY · {list.length}</Rule>
            </div>
            {list.map((w, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:12,
                padding:'14px 20px', borderBottom:`1px solid ${T.line}`,
                background: p==='high' ? `linear-gradient(90deg, rgba(255,80,32,0.06), transparent 70%)` : 'transparent',
                borderLeft: p==='high' ? `3px solid ${T.ember}` : `3px solid transparent`,
              }}>
                <div style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center',
                  border:`1px solid ${window.rarityColor(w.cat)}`,
                  color:window.rarityColor(w.cat), flexShrink:0,
                  boxShadow:`0 0 6px ${window.rarityColor(w.cat)}33` }}>
                  <EIcon name={w.cat==='rune' ? 'rune' : 'ring'} size={16}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:F.display, fontSize:17, color:window.rarityColor(w.cat), fontWeight:600, letterSpacing:0.5 }}>{w.name}</div>
                  <div style={{ fontFamily:F.hand, fontSize:12, color:T.textDim, marginTop:2, fontStyle:'italic' }}>{w.note}</div>
                </div>
                <EIcon name="flag" size={16} color={T.ember}/>
              </div>
            ))}
          </div>
        ))}
      </div>
    </ScreenShell>
  );
}

// =====================================================================
// TRADES LOG
// =====================================================================
function TradesScreen({ motion='full', onBack }) {
  const T = window.ET.color, F = window.ET.font;
  return (
    <ScreenShell motion={motion}>
      <NavBar back="Chronicle" onBack={onBack} title="The Bargain" right={<EIcon name="plus" size={14}/>}/>
      <div style={{ padding:'0 20px 14px' }}>
        <div style={{ fontFamily:F.display, fontSize:30, color:T.gold, fontWeight:600, letterSpacing:3,
          textShadow:`0 0 20px ${T.ember}44` }}>TRADES</div>
        <div style={{ fontFamily:F.hand, fontSize:14, color:T.textDim, marginTop:4, fontStyle:'italic' }}>
          bargains struck in the Rogue Encampment
        </div>
      </div>
      <div style={{ padding:'0 20px 10px', display:'flex', gap:6 }}>
        <Chip active>All</Chip>
        <Chip>Incoming</Chip>
        <Chip>Outgoing</Chip>
      </div>
      <div style={{ flex:1, overflow:'auto', padding:'0 0 90px' }}>
        {window.TRADES.map((t, i) => (
          <div key={i} style={{
            padding:'14px 20px', borderBottom:`1px solid ${T.line}`,
            background: t.dir==='in' ? `linear-gradient(90deg, rgba(106,174,74,0.06), transparent 70%)` : 'transparent',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{
                width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center',
                border:`1px solid ${t.dir==='in' ? T.set : T.ember}`,
                color: t.dir==='in' ? T.set : T.ember,
                fontFamily:F.mono, fontSize:14, fontWeight:700,
              }}>{t.dir==='in' ? '↓' : '↑'}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:F.display, fontSize:16, color:T.text, fontWeight:600 }}>{t.item}</div>
                <div style={{ fontFamily:F.mono, fontSize:10, color:T.textDim, marginTop:2, letterSpacing:1 }}>
                  {t.dir==='in' ? '← from' : '→ to'} <span style={{ color:T.gold }}>{t.partner}</span> · {t.realm}
                </div>
              </div>
              <div style={{ fontFamily:F.mono, fontSize:10, color:T.textMute, letterSpacing:1 }}>{t.when}</div>
            </div>
            {t.gave !== '—' && (
              <div style={{ marginTop:8, paddingLeft:38, fontFamily:F.body, fontSize:12, color:T.textDim }}>
                <span style={{ color:T.textMute }}>{t.dir==='in' ? 'gave' : 'received'}:</span> {t.gave}
              </div>
            )}
            {t.note && (
              <div style={{ marginTop:4, paddingLeft:38, fontFamily:F.hand, fontSize:12, color:T.textDim, fontStyle:'italic' }}>
                "{t.note}"
              </div>
            )}
          </div>
        ))}
      </div>
    </ScreenShell>
  );
}

// =====================================================================
// CODEX / SETTINGS
// =====================================================================
function CodexScreen({ motion='full', onNav, tweaks, setTweak }) {
  const T = window.ET.color, F = window.ET.font;
  return (
    <ScreenShell motion={motion}>
      <SectionHead eyebrow="Chronicle IV · The Codex" title="CODEX"/>

      <div style={{ flex:1, overflow:'auto', padding:'10px 0 110px' }}>
        {/* Appearance */}
        <div style={{ padding:'10px 20px' }}><Rule>APPEARANCE</Rule></div>
        <SettingRow label="Palette">
          <SegControl
            value={tweaks.palette}
            options={[{v:'abyssal',l:'Abyssal'},{v:'hellforge',l:'Hellforge'}]}
            onChange={v=>setTweak('palette', v)}
          />
        </SettingRow>
        <SettingRow label="Motion" hint="Floating embers, glow pulses">
          <SegControl
            value={tweaks.motion}
            options={[{v:'subtle',l:'Subtle'},{v:'full',l:'Full Hellforge'}]}
            onChange={v=>setTweak('motion', v)}
          />
        </SettingRow>
        <SettingRow label="Density">
          <SegControl
            value={tweaks.density}
            options={[{v:'comfortable',l:'Comfortable'},{v:'dense',l:'Dense'}]}
            onChange={v=>setTweak('density', v)}
          />
        </SettingRow>

        {/* Sorting */}
        <div style={{ padding:'18px 20px 10px' }}><Rule>SORTING</Rule></div>
        <SettingRow label="Default sort">
          <SegControl value="rarity"
            options={[{v:'rarity',l:'Rarity'},{v:'name',l:'Name'},{v:'added',l:'Added'}]}
            onChange={()=>{}}
          />
        </SettingRow>

        {/* Data */}
        <div style={{ padding:'18px 20px 10px' }}><Rule>DATA</Rule></div>
        <MenuRow icon="upload" label="Backup to iCloud" detail="synced · 2m ago"/>
        <MenuRow icon="download" label="Import from .d2s" detail="scan save files"/>
        <MenuRow icon="scroll" label="Export JSON"/>
        <MenuRow icon="trade" label="Share hoard link" detail="read-only"/>

        {/* About */}
        <div style={{ padding:'18px 20px 10px' }}><Rule>THE SCRIBE</Rule></div>
        <div style={{ padding:'0 20px' }}>
          <div style={{ padding:'14px', background:T.card, border:`1px solid ${T.line}` }}>
            <div style={{ fontFamily:F.display, fontSize:16, color:T.gold, fontWeight:600, letterSpacing:2 }}>HOARD · 1.0</div>
            <div style={{ fontFamily:F.hand, fontSize:13, color:T.textDim, marginTop:6, fontStyle:'italic', lineHeight:1.5 }}>
              "Even in hell, the damned keep ledgers. A chronicle for mules, hoarders, and those who stash beyond their lifetimes."
            </div>
          </div>
        </div>

        <div style={{ padding:'20px 20px 0', display:'flex', gap:10 }}>
          <EmberBtn variant="outline" size="sm">Privacy</EmberBtn>
          <EmberBtn variant="outline" size="sm">Credits</EmberBtn>
          <EmberBtn variant="danger" size="sm">Reset</EmberBtn>
        </div>
      </div>

      <TabBar active="codex" onChange={onNav} motion={motion}/>
    </ScreenShell>
  );
}

function SettingRow({ label, hint, children }) {
  const T = window.ET.color, F = window.ET.font;
  return (
    <div style={{ padding:'10px 20px', borderBottom:`1px solid ${T.line}` }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:F.body, fontSize:14, color:T.text }}>{label}</div>
          {hint && <div style={{ fontFamily:F.body, fontSize:11, color:T.textMute, marginTop:2 }}>{hint}</div>}
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

function SegControl({ value, options, onChange }) {
  const T = window.ET.color, F = window.ET.font;
  return (
    <div style={{ display:'flex', border:`1px solid ${T.line}` }}>
      {options.map(o => {
        const on = value === o.v;
        return (
          <div key={o.v} onClick={()=>onChange(o.v)} style={{
            padding:'6px 10px', cursor:'pointer',
            background: on ? T.ember : 'transparent',
            color: on ? '#1a0a04' : T.textDim,
            fontFamily:F.mono, fontSize:10, letterSpacing:1.5, fontWeight:700, textTransform:'uppercase',
            boxShadow: on ? `inset 0 0 12px rgba(255,220,180,0.2)` : 'none',
          }}>{o.l}</div>
        );
      })}
    </div>
  );
}

function MenuRow({ icon, label, detail }) {
  const T = window.ET.color, F = window.ET.font;
  return (
    <div style={{ padding:'12px 20px', borderBottom:`1px solid ${T.line}`,
      display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}>
      <EIcon name={icon} size={18} color={T.gold}/>
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:F.body, fontSize:14, color:T.text }}>{label}</div>
        {detail && <div style={{ fontFamily:F.mono, fontSize:10, color:T.textDim, marginTop:2, letterSpacing:1 }}>{detail}</div>}
      </div>
      <EIcon name="chevron-right" size={14} color={T.textDim}/>
    </div>
  );
}

// =====================================================================
// ADD MULE
// =====================================================================
function AddMuleScreen({ motion='full', onBack }) {
  const T = window.ET.color, F = window.ET.font;
  const [cls, setCls] = React.useState('Sorceress');
  const [mode, setMode] = React.useState('SC');
  const [ladder, setLadder] = React.useState(true);
  const classes = ['Sorceress','Paladin','Necromancer','Barbarian','Druid','Amazon','Assassin'];

  return (
    <ScreenShell motion={motion}>
      <NavBar back="Cancel" onBack={onBack} title="Bind Mule" right={<span style={{color:T.ember, fontWeight:700}}>SAVE</span>}/>
      <div style={{ flex:1, overflow:'auto', padding:'0 20px 120px' }}>
        <Field label="Name" hint="As it appears in Battle.net">
          <Input placeholder="RuneMule02"/>
        </Field>
        <Field label="Type">
          <SegControl value="char" options={[{v:'char',l:'Character'},{v:'stash',l:'Shared Stash'}]} onChange={()=>{}}/>
        </Field>
        <Field label="Class">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
            {classes.map(c => {
              const on = cls === c;
              return (
                <div key={c} onClick={()=>setCls(c)} style={{
                  padding:'8px 4px', textAlign:'center', cursor:'pointer',
                  border:`1px solid ${on ? T.gold : T.line}`,
                  background: on ? `rgba(232,176,72,0.08)` : 'transparent',
                  fontFamily:F.mono, fontSize:10, letterSpacing:1.2,
                  color: on ? T.gold : T.textDim, fontWeight:700, textTransform:'uppercase',
                }}>{c}</div>
              );
            })}
          </div>
        </Field>
        <Field label="Level"><Input placeholder="1" mono/></Field>
        <div style={{ padding:'8px 0 10px' }}><Rule>REALM</Rule></div>
        <Field label="Mode">
          <SegControl value={mode} options={[{v:'SC',l:'Softcore'},{v:'HC',l:'Hardcore'}]} onChange={setMode}/>
        </Field>
        <Field label="Season">
          <SegControl value={ladder?'L':'N'} options={[{v:'L',l:'Ladder'},{v:'N',l:'Non-Ladder'}]} onChange={v=>setLadder(v==='L')}/>
        </Field>
        <Field label="Realm">
          <Input value="RoTW S4 SC Ladder" onChange={()=>{}}/>
        </Field>
      </div>
      <div style={{
        position:'absolute', bottom:0, left:0, right:0, padding:'16px 20px 34px',
        background: `linear-gradient(180deg, transparent, ${T.bg} 30%)`,
        display:'flex', gap:10,
      }}>
        <EmberBtn variant="outline" size="md" onClick={onBack}>Cancel</EmberBtn>
        <EmberBtn variant="primary" size="md" icon="check" style={{ flex:1 }}>Bind Mule</EmberBtn>
      </div>
    </ScreenShell>
  );
}

// =====================================================================
// EMPTY STATES
// =====================================================================
function EmptyScreen({ motion='full', variant='fresh' }) {
  const T = window.ET.color, F = window.ET.font;
  const variants = {
    fresh: {
      eyebrow: 'Chronicle · Unwritten',
      title: 'NO HOARD YET',
      quote: '"an empty ledger is a full invitation."',
      icon: 'tome',
      cta: 'Create First Realm',
      hint: 'Begin by naming a realm — the place where your mules will dwell.',
    },
    mules: {
      eyebrow: 'RoTW S4 · SC Ladder',
      title: 'NO MULES',
      quote: '"even a single char can hoard a lifetime of runes."',
      icon: 'skull',
      cta: 'Bind First Mule',
      hint: 'A mule is any character or shared stash you use to hold items.',
    },
    search: {
      eyebrow: 'Concordance',
      title: 'NOT FOUND',
      quote: '"the shadow has not yet seen this name pass."',
      icon: 'eye',
      cta: 'Clear Search',
      hint: 'Try a partial match, or search by rolls (\"40FCR\") instead.',
    },
  };
  const v = variants[variant] || variants.fresh;
  return (
    <ScreenShell motion={motion}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        padding:'60px 40px', textAlign:'center' }}>
        <div style={{ width:120, height:120, position:'relative', marginBottom:24 }}>
          <div style={{
            position:'absolute', inset:0, transform:'rotate(45deg)',
            border:`1px solid ${T.goldDim}`,
            boxShadow:`0 0 40px ${T.ember}33, inset 0 0 30px ${T.ember}22`,
            animation: motion==='full' ? 'ember-glow-pulse 3.5s ease-in-out infinite' : 'none',
          }}/>
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <EIcon name={v.icon} size={52} color={T.gold} stroke={1.1}/>
          </div>
        </div>
        <div style={{ fontFamily:F.mono, fontSize:10, letterSpacing:3, color:T.textDim, textTransform:'uppercase', marginBottom:8 }}>{v.eyebrow}</div>
        <div style={{ fontFamily:F.display, fontSize:30, color:T.text, fontWeight:600, letterSpacing:4,
          textShadow:`0 0 20px ${T.ember}44` }}>{v.title}</div>
        <div style={{ fontFamily:F.hand, fontSize:15, color:T.textDim, marginTop:12, fontStyle:'italic', maxWidth:280, lineHeight:1.5 }}>{v.quote}</div>
        <div style={{ fontFamily:F.body, fontSize:12, color:T.textMute, marginTop:18, maxWidth:260, lineHeight:1.5 }}>{v.hint}</div>
        <div style={{ marginTop:28 }}>
          <EmberBtn variant="primary" size="md" icon="plus">{v.cta}</EmberBtn>
        </div>
      </div>
    </ScreenShell>
  );
}

// =====================================================================
// SEEK — search screen (carried over from Ember + refined)
// =====================================================================
function SeekScreen({ motion='full', onNav, state='results' }) {
  const T = window.ET.color, F = window.ET.font;
  return (
    <ScreenShell motion={motion}>
      <div style={{ padding:'56px 20px 10px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
          <Diamond size={7} color={T.ember}/>
          <div style={{ fontFamily:F.mono, fontSize:10, letterSpacing:3, color:T.textDim }}>CHRONICLE II · THE CONCORDANCE</div>
        </div>
        <div style={{ fontFamily:F.display, fontSize:30, color:T.gold, letterSpacing:4, fontWeight:600, lineHeight:1,
          textShadow:`0 0 20px ${T.ember}66` }}>SEEK</div>
      </div>

      <div style={{ padding:'14px 20px 8px' }}>
        <div style={{
          display:'flex', alignItems:'center', gap:12,
          padding:'12px 14px', background:T.card,
          border:`1px solid ${T.ember}`,
          boxShadow:`inset 0 0 24px rgba(255,80,32,0.1), 0 0 16px rgba(255,80,32,0.2)`,
          animation: motion==='full' ? 'ember-glow-pulse 4s ease-in-out infinite' : 'none',
        }}>
          <EIcon name="search" size={16} color={T.ember}/>
          <div style={{ fontFamily:F.display, fontSize:17, color:T.text, letterSpacing:1, flex:1 }}>hoto</div>
          <div style={{ fontFamily:F.mono, fontSize:10, color:T.textDim, letterSpacing:1.5 }}>{state==='empty' ? '0 FOUND' : '3 FOUND'}</div>
        </div>
      </div>

      <div style={{ padding:'4px 20px 8px', display:'flex', gap:6, overflow:'auto' }}>
        {['All Realms','RoTW S4','LoD NL'].map((t,i)=>(
          <Chip key={i} active={i===0}>{t}</Chip>
        ))}
      </div>
      <div style={{ padding:'0 20px 10px', display:'flex', gap:6, overflow:'auto' }}>
        {['unique','set','runeword','base','rune','gem'].map(c => (
          <Chip key={c} color={window.rarityColor(c)} size="sm">{c}</Chip>
        ))}
      </div>

      {state === 'empty' ? (
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          padding:'40px', textAlign:'center' }}>
          <EIcon name="eye" size={48} color={T.goldDim}/>
          <div style={{ fontFamily:F.display, fontSize:20, color:T.text, letterSpacing:3, fontWeight:600, marginTop:16 }}>NOT FOUND</div>
          <div style={{ fontFamily:F.hand, fontSize:14, color:T.textDim, marginTop:8, fontStyle:'italic', maxWidth:240 }}>
            "the shadow has not yet seen this name pass."
          </div>
        </div>
      ) : (
        <>
          <div style={{ padding:'6px 20px 10px' }}><Rule>RESULTS</Rule></div>
          <div style={{ flex:1, overflow:'auto', padding:'0 0 110px' }}>
            {window.SAMPLE_HITS.map((h, i) => (
              <div key={i} style={{ padding:'14px 20px', borderBottom:`1px solid ${T.line}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <RarityDot cat={h.cat} size={10}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:F.display, fontSize:18, color:window.rarityColor(h.cat), fontWeight:600, letterSpacing:0.5,
                      textShadow:`0 0 8px ${window.rarityColor(h.cat)}33` }}>{h.name}</div>
                    <div style={{ fontFamily:F.body, fontSize:12, color:T.textDim, marginTop:2 }}>{h.base}</div>
                  </div>
                  <div style={{ fontFamily:F.mono, fontSize:9, color:window.rarityColor(h.cat), letterSpacing:1.5, fontWeight:700 }}>
                    {h.cat.toUpperCase()}
                  </div>
                </div>
                <div style={{
                  marginTop:8, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap',
                  fontFamily:F.mono, fontSize:11,
                }}>
                  <span style={{ color:T.textMute }}>held by</span>
                  <span style={{ color:T.text, fontWeight:600 }}>{h.container}</span>
                  <span style={{ color:T.textMute }}>·</span>
                  <span style={{ color:T.gold }}>{h.realm}</span>
                </div>
                {h.note && (
                  <div style={{
                    marginTop:6, fontFamily:F.hand, fontSize:13, color:T.text,
                    paddingLeft:10, borderLeft:`2px solid ${T.ember}`, fontStyle:'italic',
                  }}>"{h.note}"</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <TabBar active="find" onChange={onNav} motion={motion}/>
    </ScreenShell>
  );
}

Object.assign(window, { RunesScreen, WishlistScreen, TradesScreen, CodexScreen, AddMuleScreen, EmptyScreen, SeekScreen });
