// Design 1 — GRIMOIRE · INFERNAL
// Scorched parchment, blood-ink, hellfire. A demonologist's forbidden ledger.

const GRIMOIRE_PALETTES = {
  infernal: {
    paper:   '#1a0e08',
    paperHi: '#2a160c',
    ink:     '#e8c79a',           // aged-bone ink on dark paper
    inkSoft: '#b89572',
    inkDim:  '#7a5c42',
    rule:    '#5a3a20',
    scorch:  '#0a0403',           // burnt vignette
    accent:  '#c83020',           // blood wax
    fire:    '#ff7a28',           // hellfire glow
    // rarity on dark parchment
    unique:   '#e8b84a',
    set:      '#7ec86a',
    runeword: '#c6b48f',
    rune:     '#ff7a28',
    gem:      '#6aa8d9',
    base:     '#e8c79a',
    misc:     '#a68862',
  },
  brimstone: {
    paper:   '#0f0706',
    paperHi: '#1c0c08',
    ink:     '#f0b078',
    inkSoft: '#b8805a',
    inkDim:  '#7a4a30',
    rule:    '#4a2410',
    scorch:  '#060201',
    accent:  '#e03a1a',
    fire:    '#ff9040',
    unique:   '#f0c048',
    set:      '#7ec86a',
    runeword: '#d4b080',
    rune:     '#ff9040',
    gem:      '#6aa8d9',
    base:     '#f0b078',
    misc:     '#a68862',
  },
};

let G = GRIMOIRE_PALETTES.infernal; // default; replaced per-render

const gFont = {
  display: '"Cormorant Garamond", "EB Garamond", Georgia, serif',
  body:    'ui-serif, Georgia, "Times New Roman", serif',
  mono:    '"IBM Plex Mono", "Courier New", monospace',
};

function catInkG(c){ return G[c] || G.ink; }

// Scorched parchment background
function Paper() {
  return (
    <div style={{
      position:'absolute', inset:0, background: G.paper,
      backgroundImage:
        `radial-gradient(120% 80% at 50% 50%, ${G.paperHi} 0%, ${G.paper} 55%, ${G.scorch} 100%),`+
        `radial-gradient(400px 220px at 10% 0%, rgba(255,120,40,0.22), transparent 60%),`+
        `radial-gradient(500px 300px at 110% 100%, rgba(200,40,20,0.18), transparent 65%),`+
        `radial-gradient(260px 180px at 80% 20%, rgba(255,140,60,0.10), transparent 70%)`,
    }}>
      {/* scorched edges */}
      <div style={{
        position:'absolute', inset:0,
        boxShadow:'inset 0 0 60px rgba(0,0,0,0.85), inset 0 0 180px rgba(0,0,0,0.6)',
        pointerEvents:'none',
      }}/>
      {/* ruling lines */}
      <div style={{
        position:'absolute', inset:0, opacity:0.22,
        backgroundImage:`repeating-linear-gradient(to bottom, transparent 0, transparent 27px, ${G.rule} 27px, ${G.rule} 27.5px)`,
        maskImage:'linear-gradient(to bottom, transparent 0, black 120px, black calc(100% - 100px), transparent 100%)',
        WebkitMaskImage:'linear-gradient(to bottom, transparent 0, black 120px, black calc(100% - 100px), transparent 100%)',
      }}/>
      {/* embers */}
      <div style={{
        position:'absolute', top:'15%', left:'70%', width:3, height:3, borderRadius:'50%',
        background:G.fire, boxShadow:`0 0 10px ${G.fire}, 0 0 20px ${G.fire}`,
      }}/>
      <div style={{
        position:'absolute', top:'45%', left:'15%', width:2, height:2, borderRadius:'50%',
        background:G.fire, boxShadow:`0 0 8px ${G.fire}`,
      }}/>
    </div>
  );
}

function WaxSeal({ size=36, letter='ℳ' }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%',
      background:`radial-gradient(circle at 30% 30%, #ff4a2a, ${G.accent} 50%, #3a0808)`,
      display:'flex', alignItems:'center', justifyContent:'center',
      color:'#f0d0a0', fontFamily:gFont.display, fontWeight:700, fontSize:size*0.55,
      boxShadow:`0 0 16px rgba(200,48,32,0.5), 0 2px 3px rgba(0,0,0,0.5), inset 0 0 6px rgba(0,0,0,0.35)`,
      textShadow:'0 1px 0 rgba(0,0,0,0.4)',
    }}>{letter}</div>
  );
}

function RuleG({ label, style }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:10, ...style}}>
      <div style={{flex:1, height:1, background:`linear-gradient(to right, transparent, ${G.rule})`}}/>
      {label && <span style={{fontFamily:gFont.mono, fontSize:10, letterSpacing:1.5, color:G.inkDim, textTransform:'uppercase'}}>{label}</span>}
      <div style={{flex:1, height:1, background:`linear-gradient(to left, transparent, ${G.rule})`}}/>
    </div>
  );
}

function CatMark({ cat, size=28 }) {
  const letter = {unique:'U', set:'S', runeword:'R', base:'B', rune:'◊', gem:'◈', misc:'·'}[cat] || '·';
  const c = catInkG(cat);
  return (
    <div style={{
      width:size, height:size, border:`1px solid ${c}`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:gFont.mono, fontSize:size*0.5, fontWeight:700, color:c,
      background:'rgba(0,0,0,0.35)',
      boxShadow:`0 0 6px ${c}33`,
    }}>{letter}</div>
  );
}

function GrimoireMules({ palette = 'infernal' }) {
  G = GRIMOIRE_PALETTES[palette];
  return (
    <IOSDevice width={390} height={844} dark>
      <div style={{position:'relative', width:'100%', height:'100%'}}>
        <Paper/>
        <div style={{position:'relative', height:'100%', display:'flex', flexDirection:'column'}}>
          <div style={{padding:'56px 24px 14px'}}>
            <div style={{fontFamily:gFont.mono, fontSize:10, letterSpacing:2, color:G.inkDim}}>TOMUS I · FOLIO iii</div>
            <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginTop:2}}>
              <div style={{fontFamily:gFont.display, fontSize:42, fontStyle:'italic', color:G.ink, letterSpacing:-0.5, lineHeight:1,
                textShadow:`0 0 20px ${G.fire}33`}}>
                The Mules
              </div>
              <WaxSeal/>
            </div>
            <RuleG label="160 items bound · 2 realms" style={{marginTop:14}}/>
          </div>

          <div style={{flex:1, overflow:'auto', padding:'4px 0 120px'}}>
            {SAMPLE_MULES.map((realm, ri) => (
              <div key={ri} style={{padding:'18px 24px 6px'}}>
                <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between'}}>
                  <div>
                    <div style={{fontFamily:gFont.display, fontSize:22, fontStyle:'italic', color:G.ink}}>{realm.realm}</div>
                    <div style={{fontFamily:gFont.mono, fontSize:10, letterSpacing:1.5, color:G.inkDim, marginTop:2}}>
                      {realm.realmShort} · {realm.region.toUpperCase()}
                    </div>
                  </div>
                  <div style={{fontFamily:gFont.display, fontSize:20, color:G.accent, fontStyle:'italic',
                    textShadow:`0 0 10px ${G.accent}66`}}>{realm.items}</div>
                </div>

                <div style={{marginTop:12, border:`1px solid ${G.rule}`, background:'rgba(0,0,0,0.3)'}}>
                  {realm.containers.map((c, ci) => (
                    <div key={ci} style={{
                      display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
                      borderBottom: ci < realm.containers.length-1 ? `1px dashed ${G.rule}` : 'none',
                    }}>
                      <div style={{
                        width:34, height:34, borderRadius:'50%',
                        border:`1px solid ${G.ink}`,
                        background:c.type==='stash' ? G.ink : 'transparent',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontFamily:gFont.display, fontStyle:'italic', fontWeight:600, fontSize:13,
                        color: c.type==='stash' ? G.paper : G.ink,
                      }}>{c.tag}</div>
                      <div style={{flex:1, minWidth:0}}>
                        <div style={{fontFamily:gFont.display, fontSize:19, color:G.ink, fontWeight:500}}>{c.name}</div>
                        <div style={{fontFamily:gFont.body, fontSize:12, fontStyle:'italic', color:G.inkSoft, marginTop:1}}>
                          {c.type==='stash' ? 'shared stash' : `${c.cls.toLowerCase()} · lv ${c.lvl}`}
                        </div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontFamily:gFont.display, fontSize:22, color:G.accent, fontStyle:'italic', lineHeight:1,
                          textShadow:`0 0 8px ${G.accent}66`}}>{c.items}</div>
                        <div style={{fontFamily:gFont.mono, fontSize:9, letterSpacing:1.5, color:G.inkDim}}>ITEMS</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <GrimoireTabs active="mules"/>
        </div>
      </div>
    </IOSDevice>
  );
}

function GrimoireContainer({ palette = 'infernal' }) {
  G = GRIMOIRE_PALETTES[palette];
  return (
    <IOSDevice width={390} height={844} dark>
      <div style={{position:'relative', width:'100%', height:'100%'}}>
        <Paper/>
        <div style={{position:'relative', height:'100%', display:'flex', flexDirection:'column'}}>
          <div style={{padding:'56px 24px 10px', display:'flex', alignItems:'center', gap:12}}>
            <div style={{fontFamily:gFont.display, fontSize:22, fontStyle:'italic', color:G.ink}}>‹ Mules</div>
            <div style={{flex:1}}/>
            <div style={{fontFamily:gFont.mono, fontSize:10, letterSpacing:1.5, color:G.inkDim}}>EDIT · ⋯</div>
          </div>

          <div style={{padding:'8px 24px 8px'}}>
            <div style={{fontFamily:gFont.mono, fontSize:10, letterSpacing:2, color:G.inkDim}}>A SORCERESS BOUND IN WAX</div>
            <div style={{fontFamily:gFont.display, fontSize:38, fontStyle:'italic', color:G.ink, lineHeight:1, marginTop:2,
              textShadow:`0 0 18px ${G.fire}22`}}>RuneMule01</div>
            <div style={{fontFamily:gFont.body, fontSize:14, fontStyle:'italic', color:G.inkSoft, marginTop:6}}>
              Kept at RoTW S4 · Softcore Ladder · 24 items, 3 of them unique
            </div>

            <div style={{display:'flex', gap:16, marginTop:14, flexWrap:'wrap'}}>
              {[['unique','3'],['runeword','2'],['base','8'],['rune','6'],['gem','4'],['set','1']].map(([k,v])=>(
                <div key={k} style={{display:'flex', alignItems:'baseline', gap:6}}>
                  <span style={{fontFamily:gFont.display, fontSize:18, fontStyle:'italic', color:catInkG(k)}}>{v}</span>
                  <span style={{fontFamily:gFont.mono, fontSize:9, letterSpacing:1.5, color:G.inkDim, textTransform:'uppercase'}}>{k}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{padding:'12px 24px 6px'}}>
            <RuleG label="manifest"/>
          </div>

          <div style={{flex:1, overflow:'auto', padding:'0 24px 120px'}}>
            {SAMPLE_ITEMS.map((it, i) => (
              <div key={i} style={{
                display:'flex', gap:12, padding:'14px 0',
                borderBottom:`1px dashed ${G.rule}`,
              }}>
                <CatMark cat={it.cat}/>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{
                    fontFamily:gFont.display, fontSize:19, fontWeight:500, color:catInkG(it.cat),
                    fontStyle: it.cat==='unique' || it.cat==='set' ? 'italic' : 'normal',
                    textShadow: it.cat==='unique' || it.cat==='rune' ? `0 0 10px ${catInkG(it.cat)}33` : 'none',
                  }}>{it.name}</div>
                  {it.base && (
                    <div style={{fontFamily:gFont.body, fontSize:13, fontStyle:'italic', color:G.inkSoft, marginTop:1}}>
                      {it.base}{it.sockets ? ` · ${it.sockets} sockets` : ''}{it.runes ? ` · ${it.runes}` : ''}
                    </div>
                  )}
                  {it.note && (
                    <div style={{fontFamily:gFont.body, fontSize:13, color:G.ink, marginTop:5, paddingLeft:10, borderLeft:`2px solid ${G.accent}`}}>
                      “{it.note}”
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{position:'absolute', bottom:28, left:24, right:24, zIndex:10}}>
            <div style={{
              background:`linear-gradient(180deg, ${G.accent}, #7a1010)`,
              color:'#f4d4a0', padding:'16px 20px',
              display:'flex', alignItems:'center', justifyContent:'center', gap:10,
              fontFamily:gFont.display, fontStyle:'italic', fontSize:18, letterSpacing:0.3,
              boxShadow:`0 0 24px ${G.accent}66, 0 6px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)`,
            }}>
              <span style={{fontFamily:gFont.mono, fontSize:12}}>+</span>
              Inscribe an item
            </div>
          </div>
        </div>
      </div>
    </IOSDevice>
  );
}

function GrimoireFind({ palette = 'infernal' }) {
  G = GRIMOIRE_PALETTES[palette];
  return (
    <IOSDevice width={390} height={844} dark>
      <div style={{position:'relative', width:'100%', height:'100%'}}>
        <Paper/>
        <div style={{position:'relative', height:'100%', display:'flex', flexDirection:'column'}}>
          <div style={{padding:'56px 24px 8px'}}>
            <div style={{fontFamily:gFont.mono, fontSize:10, letterSpacing:2, color:G.inkDim}}>CONCORDANCE INFERNAL</div>
            <div style={{fontFamily:gFont.display, fontSize:38, fontStyle:'italic', color:G.ink, lineHeight:1, marginTop:2,
              textShadow:`0 0 16px ${G.fire}33`}}>Seek an item</div>
          </div>

          <div style={{padding:'14px 24px 6px'}}>
            <div style={{
              display:'flex', alignItems:'center', gap:10,
              borderBottom:`2px solid ${G.ink}`, paddingBottom:6,
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="7.5" cy="7.5" r="5.5" stroke={G.ink} strokeWidth="1.5" fill="none"/><path d="M11.5 11.5l5 5" stroke={G.ink} strokeWidth="1.5" strokeLinecap="round"/></svg>
              <div style={{fontFamily:gFont.display, fontSize:22, fontStyle:'italic', color:G.ink, flex:1}}>shako</div>
              <div style={{fontFamily:gFont.mono, fontSize:10, color:G.inkDim}}>3 hits</div>
            </div>
            <div style={{fontFamily:gFont.body, fontSize:12, fontStyle:'italic', color:G.inkSoft, marginTop:6}}>
              Invoke a name, nickname (hoto, enigma, cta) or note fragment (40FCR, um'd)
            </div>
          </div>

          <div style={{padding:'14px 24px 4px', display:'flex', gap:8, flexWrap:'wrap'}}>
            {['all realms','RoTW S4','LoD NL'].map((t,i)=>(
              <div key={i} style={{
                padding:'4px 12px', border:`1px solid ${G.ink}`,
                background: i===0 ? G.accent : 'transparent',
                color: i===0 ? '#f4d4a0' : G.ink,
                fontFamily:gFont.mono, fontSize:10, letterSpacing:1.2, textTransform:'uppercase',
                boxShadow: i===0 ? `0 0 12px ${G.accent}66` : 'none',
              }}>{t}</div>
            ))}
          </div>
          <div style={{padding:'8px 24px 6px', display:'flex', gap:6, flexWrap:'wrap'}}>
            {['unique','set','runeword','base','rune','gem'].map((c)=>(
              <div key={c} style={{
                padding:'2px 10px', border:`1px solid ${catInkG(c)}`,
                fontFamily:gFont.mono, fontSize:9, letterSpacing:1, textTransform:'uppercase',
                color:catInkG(c),
              }}>{c}</div>
            ))}
          </div>

          <div style={{padding:'14px 24px 6px'}}><RuleG label="hits"/></div>

          <div style={{flex:1, overflow:'auto', padding:'0 24px 100px'}}>
            {SAMPLE_HITS.map((h, i) => (
              <div key={i} style={{padding:'14px 0', borderBottom:`1px dashed ${G.rule}`}}>
                <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:8}}>
                  <div style={{
                    fontFamily:gFont.display, fontSize:20, color:catInkG(h.cat), fontWeight:500,
                    fontStyle: h.cat==='unique' ? 'italic' : 'normal',
                    textShadow:`0 0 10px ${catInkG(h.cat)}33`,
                  }}>{h.name}</div>
                  <div style={{fontFamily:gFont.mono, fontSize:9, letterSpacing:1.5, color:catInkG(h.cat), textTransform:'uppercase'}}>{h.cat}</div>
                </div>
                <div style={{fontFamily:gFont.body, fontSize:13, fontStyle:'italic', color:G.inkSoft, marginTop:10}}>
                  kept in <span style={{color:G.ink}}>{h.container}</span> · {h.realm}
                </div>
                {h.note && (
                  <div style={{fontFamily:gFont.body, fontSize:13, color:G.ink, marginTop:5, paddingLeft:10, borderLeft:`2px solid ${G.accent}`}}>
                    “{h.note}”
                  </div>
                )}
              </div>
            ))}
          </div>

          <GrimoireTabs active="find"/>
        </div>
      </div>
    </IOSDevice>
  );
}

function GrimoireTabs({ active }) {
  const items = [['mules','Mules','ℳ'],['find','Seek','❦'],['settings','Arcana','✦']];
  return (
    <div style={{
      position:'absolute', bottom:0, left:0, right:0,
      paddingBottom:30, paddingTop:10,
      background:`linear-gradient(180deg, ${G.paperHi}, ${G.paper})`,
      borderTop:`1px solid ${G.rule}`,
      boxShadow:`inset 0 1px 0 rgba(255,120,40,0.08), 0 -10px 20px rgba(0,0,0,0.4)`,
    }}>
      <div style={{display:'flex', padding:'0 24px'}}>
        {items.map(([k, label, glyph]) => (
          <div key={k} style={{
            flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2,
            color: active===k ? G.accent : G.inkSoft,
          }}>
            <div style={{fontFamily:gFont.display, fontSize:24, lineHeight:1, fontStyle:'italic',
              textShadow: active===k ? `0 0 10px ${G.accent}` : 'none'}}>{glyph}</div>
            <div style={{fontFamily:gFont.mono, fontSize:9, letterSpacing:1.5, textTransform:'uppercase'}}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { GrimoireMules, GrimoireContainer, GrimoireFind });
