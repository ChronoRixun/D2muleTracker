// Design 2 — EMBER · ABYSSAL
// Deeper black, lava veins, hellfire glow. Obsidian forged over a brimstone pit.

const EMBER_PALETTES = {
  abyssal: {
    bg:       '#050302',
    bgSoft:   '#0b0604',
    card:     '#120805',
    cardHi:   '#1a0c07',
    line:     '#2a1408',
    lineHi:   '#3d1e0c',
    text:     '#f0d8b8',
    textDim:  '#9a7a5c',
    textMute: '#5a4030',
    gold:     '#e8b048',
    goldDim:  '#8a5018',
    ember:    '#ff5020',
    emberHi:  '#ff8038',
    lava:     '#c83018',
    // rarity
    unique:   '#e8b048',
    set:      '#7ac86a',
    runeword: '#c6a880',
    rune:     '#ff6a2a',
    gem:      '#6aa8d9',
    base:     '#f0d8b8',
    misc:     '#9a7a5c',
  },
  hellforge: {
    bg:       '#0a0403',
    bgSoft:   '#140806',
    card:     '#1c0c08',
    cardHi:   '#28120a',
    line:     '#3a1808',
    lineHi:   '#4a2010',
    text:     '#f0c098',
    textDim:  '#b07a50',
    textMute: '#6a4028',
    gold:     '#f0a838',
    goldDim:  '#a06020',
    ember:    '#ff6a1a',
    emberHi:  '#ff8838',
    lava:     '#e04018',
    unique:   '#f0b848',
    set:      '#6ab050',
    runeword: '#d0a878',
    rune:     '#ff7a2a',
    gem:      '#6aa8d9',
    base:     '#f0c098',
    misc:     '#b07a50',
  },
};

let E = EMBER_PALETTES.abyssal;

const eFont = {
  display: '"Cinzel", "Trajan Pro", Georgia, serif',
  body:    '"Inter", -apple-system, system-ui, sans-serif',
  mono:    '"JetBrains Mono", ui-monospace, Menlo, monospace',
};
function catE(c){ return E[c] || E.text; }

// Abyssal background — deep black with hellfire glow + molten cracks
function Ember({ intensity = 1 }) {
  return (
    <>
      <div style={{
        position:'absolute', inset:0, background:E.bg,
        backgroundImage:
          `radial-gradient(620px 400px at 50% -10%, rgba(255,80,32,${0.28*intensity}), transparent 70%),`+
          `radial-gradient(400px 320px at 10% 110%, rgba(200,48,24,${0.22*intensity}), transparent 70%),`+
          `radial-gradient(500px 340px at 100% 100%, rgba(255,120,48,${0.14*intensity}), transparent 70%)`,
      }}/>
      {/* lava-crack hints along edges */}
      <div style={{
        position:'absolute', left:0, right:0, bottom:0, height:140,
        background:`linear-gradient(to top, rgba(255,80,32,${0.18*intensity}), transparent)`,
        pointerEvents:'none',
      }}/>
      {/* floating embers */}
      {[
        [72,18,2], [18,42,3], [86,66,2], [40,80,2], [55,28,2.5],
      ].map(([x,y,s], i) => (
        <div key={i} style={{
          position:'absolute', left:`${x}%`, top:`${y}%`,
          width:s, height:s, borderRadius:'50%',
          background:E.emberHi,
          boxShadow:`0 0 ${6*s}px ${E.emberHi}, 0 0 ${12*s}px ${E.ember}`,
          opacity:0.85,
        }}/>
      ))}
      {/* vignette */}
      <div style={{
        position:'absolute', inset:0,
        boxShadow:'inset 0 0 80px rgba(0,0,0,0.9), inset 0 0 200px rgba(0,0,0,0.6)',
        pointerEvents:'none',
      }}/>
    </>
  );
}

function DiamondE({ size=10, color, filled=true }) {
  const c = color || E.gold;
  return (
    <div style={{
      width:size, height:size, transform:'rotate(45deg)',
      background: filled ? c : 'transparent',
      border: filled ? 'none' : `1px solid ${c}`,
      boxShadow: filled ? `0 0 6px ${c}66` : 'none',
    }}/>
  );
}

function RarityDotE({ cat, size=8 }) {
  const c = catE(cat);
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', background:c,
      boxShadow:`0 0 10px ${c}, 0 0 4px ${c}`,
    }}/>
  );
}

function RuleE({ children, style }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:10, ...style}}>
      <div style={{flex:1, height:1, background:`linear-gradient(to right, transparent, ${E.goldDim})`}}/>
      <DiamondE color={E.ember}/>
      {children && <span style={{fontFamily:eFont.mono, fontSize:10, letterSpacing:2, color:E.textDim, textTransform:'uppercase'}}>{children}</span>}
      <DiamondE color={E.ember}/>
      <div style={{flex:1, height:1, background:`linear-gradient(to left, transparent, ${E.goldDim})`}}/>
    </div>
  );
}

function EmberMules({ palette = 'abyssal' }) {
  E = EMBER_PALETTES[palette];
  return (
    <IOSDevice width={390} height={844} dark>
      <div style={{width:'100%', height:'100%', position:'relative'}}>
        <Ember/>
        <div style={{position:'relative', height:'100%', display:'flex', flexDirection:'column'}}>
          <div style={{padding:'56px 20px 14px'}}>
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
              <DiamondE size={8} color={E.ember}/>
              <div style={{fontFamily:eFont.mono, fontSize:10, letterSpacing:3, color:E.textDim, textTransform:'uppercase'}}>Chronicle i · the damned</div>
            </div>
            <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between'}}>
              <div style={{fontFamily:eFont.display, fontSize:32, color:E.gold, letterSpacing:4, fontWeight:600, lineHeight:1,
                textShadow:`0 0 24px ${E.ember}88, 0 0 8px ${E.gold}44`}}>
                MULES
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontFamily:eFont.display, fontSize:26, color:E.text, fontWeight:600, lineHeight:1}}>160</div>
                <div style={{fontFamily:eFont.mono, fontSize:9, letterSpacing:2, color:E.textDim}}>ITEMS BOUND</div>
              </div>
            </div>
          </div>

          <div style={{flex:1, overflow:'auto', padding:'0 0 130px'}}>
            {SAMPLE_MULES.map((r, ri) => (
              <div key={ri} style={{padding:'18px 20px 8px'}}>
                <div style={{marginBottom:12}}>
                  <RuleE>{r.realmShort} · {r.region}</RuleE>
                  <div style={{fontFamily:eFont.display, fontSize:18, color:E.text, letterSpacing:2, textAlign:'center', marginTop:8, fontWeight:500}}>
                    {r.realm}
                  </div>
                </div>

                <div style={{display:'flex', flexDirection:'column', gap:8}}>
                  {r.containers.map((c, ci) => (
                    <div key={ci} style={{
                      display:'flex', alignItems:'center', gap:14,
                      padding:'14px 14px',
                      background:`linear-gradient(90deg, ${E.card}, ${E.bgSoft})`,
                      border:`1px solid ${c.type==='stash' ? E.goldDim : E.line}`,
                      borderLeft:`3px solid ${c.type==='stash' ? E.gold : E.ember}`,
                      position:'relative',
                      boxShadow:`0 0 16px rgba(255,80,32,0.04), inset 0 1px 0 rgba(255,140,60,0.04)`,
                    }}>
                      <div style={{
                        width:44, height:44, position:'relative',
                        display:'flex', alignItems:'center', justifyContent:'center',
                      }}>
                        <div style={{
                          position:'absolute', inset:0, transform:'rotate(45deg)',
                          background:E.cardHi, border:`1px solid ${E.lineHi}`,
                          boxShadow:`inset 0 0 10px ${E.ember}22`,
                        }}/>
                        <div style={{
                          position:'relative',
                          fontFamily:eFont.display, fontSize:12, fontWeight:600,
                          color: c.type==='stash' ? E.gold : E.text,
                          letterSpacing:1,
                        }}>{c.tag.toUpperCase()}</div>
                      </div>

                      <div style={{flex:1, minWidth:0}}>
                        <div style={{fontFamily:eFont.display, fontSize:18, color:E.text, fontWeight:500, letterSpacing:0.5}}>{c.name}</div>
                        <div style={{fontFamily:eFont.body, fontSize:12, color:E.textDim, marginTop:2, textTransform:'lowercase', letterSpacing:0.3}}>
                          {c.type==='stash' ? 'shared stash' : `${c.cls.toLowerCase()} · level ${c.lvl}`}
                        </div>
                      </div>

                      <div style={{textAlign:'right'}}>
                        <div style={{fontFamily:eFont.display, fontSize:22, color:E.gold, fontWeight:500, lineHeight:1,
                          textShadow:`0 0 8px ${E.gold}66`}}>{c.items}</div>
                        <div style={{fontFamily:eFont.mono, fontSize:9, letterSpacing:1.5, color:E.textMute}}>ITEMS</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            position:'absolute', bottom:100, left:20, right:20, zIndex:10,
            display:'flex', gap:10,
          }}>
            <div style={{
              flex:1, padding:'14px', textAlign:'center',
              background:`linear-gradient(180deg, ${E.ember}, ${E.lava})`,
              color:'#1a0a04', fontFamily:eFont.display, fontWeight:700, fontSize:14, letterSpacing:3,
              boxShadow:`0 0 32px ${E.ember}66, 0 6px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,220,180,0.3)`,
            }}>+ NEW MULE</div>
            <div style={{
              padding:'14px 18px', textAlign:'center',
              border:`1px solid ${E.goldDim}`, background:E.bgSoft,
              color:E.gold, fontFamily:eFont.display, fontWeight:600, fontSize:14, letterSpacing:3,
            }}>+ REALM</div>
          </div>

          <EmberTabs active="mules"/>
        </div>
      </div>
    </IOSDevice>
  );
}

function EmberContainer({ palette = 'abyssal' }) {
  E = EMBER_PALETTES[palette];
  return (
    <IOSDevice width={390} height={844} dark>
      <div style={{width:'100%', height:'100%', position:'relative'}}>
        <Ember/>
        <div style={{position:'relative', height:'100%', display:'flex', flexDirection:'column'}}>
          <div style={{padding:'56px 20px 16px', borderBottom:`1px solid ${E.line}`}}>
            <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:14}}>
              <div style={{fontFamily:eFont.mono, fontSize:11, color:E.gold, letterSpacing:2}}>◂ MULES</div>
              <div style={{flex:1}}/>
              <div style={{fontFamily:eFont.mono, fontSize:10, color:E.textDim, letterSpacing:2}}>SELECT · SHARE · EDIT</div>
            </div>

            <div style={{fontFamily:eFont.mono, fontSize:9, letterSpacing:3, color:E.textDim, textTransform:'uppercase'}}>Sorceress · Level 1 · RoTW S4</div>
            <div style={{fontFamily:eFont.display, fontSize:34, color:E.text, fontWeight:600, letterSpacing:2, lineHeight:1.1, marginTop:6,
              textShadow:`0 0 20px ${E.ember}44`}}>
              RuneMule<span style={{color:E.gold}}>01</span>
            </div>
            <div style={{fontFamily:eFont.body, fontSize:13, color:E.textDim, marginTop:6, fontStyle:'italic'}}>
              Softcore Ladder · 24 items · last touched today
            </div>

            <div style={{
              marginTop:14, display:'flex', gap:14,
              fontFamily:eFont.mono, fontSize:10, letterSpacing:1.5, flexWrap:'wrap',
            }}>
              {[['unique','3'],['set','1'],['runeword','2'],['rune','6'],['gem','4'],['base','8']].map(([k,v])=>(
                <div key={k} style={{display:'flex', alignItems:'center', gap:5}}>
                  <RarityDotE cat={k} size={6}/>
                  <span style={{color:catE(k), fontWeight:700}}>{v}</span>
                  <span style={{color:E.textMute}}>{k.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{flex:1, overflow:'auto', padding:'8px 0 120px'}}>
            {SAMPLE_ITEMS.map((it, i) => (
              <div key={i} style={{
                display:'flex', gap:14, padding:'14px 20px',
                borderBottom:`1px solid ${E.line}`,
                background: i===0 ? `linear-gradient(90deg, rgba(255,80,32,0.08), transparent 60%)` : 'transparent',
              }}>
                <div style={{width:32, flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:6}}>
                  <div style={{
                    width:28, height:28,
                    border:`1px solid ${catE(it.cat)}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:eFont.display, fontSize:13, fontWeight:600, color:catE(it.cat),
                    boxShadow:`0 0 6px ${catE(it.cat)}33`,
                  }}>{it.name[0]}</div>
                  <div style={{fontFamily:eFont.mono, fontSize:9, color:E.textMute}}>{String(i+1).padStart(2,'0')}</div>
                </div>

                <div style={{flex:1, minWidth:0}}>
                  <div style={{display:'flex', alignItems:'baseline', gap:10}}>
                    <div style={{
                      fontFamily:eFont.display, fontSize:18, color:catE(it.cat),
                      fontWeight:600, letterSpacing:0.5, flex:1, minWidth:0,
                      textShadow:`0 0 8px ${catE(it.cat)}33`,
                    }}>{it.name}</div>
                    <div style={{fontFamily:eFont.mono, fontSize:9, letterSpacing:1.5, color:catE(it.cat), opacity:0.9}}>
                      {it.cat.toUpperCase()}
                    </div>
                  </div>
                  {(it.base || it.runes) && (
                    <div style={{fontFamily:eFont.body, fontSize:12, color:E.textDim, marginTop:3, letterSpacing:0.2}}>
                      {it.base}{it.sockets ? ` · ${it.sockets}os` : ''}{it.runes ? ` · ${it.runes}` : ''}
                    </div>
                  )}
                  {it.note && (
                    <div style={{
                      fontFamily:eFont.body, fontSize:13, color:E.text, marginTop:6,
                      paddingLeft:10, borderLeft:`2px solid ${E.ember}`, fontStyle:'italic',
                    }}>“{it.note}”</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            position:'absolute', bottom:32, right:20, zIndex:10,
            width:60, height:60, borderRadius:'50%',
            background:`radial-gradient(circle at 30% 30%, ${E.emberHi}, ${E.lava} 60%, #400808)`,
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#fff', fontFamily:eFont.display, fontSize:30, fontWeight:300,
            boxShadow:`0 0 32px ${E.ember}cc, 0 0 12px ${E.emberHi}, 0 6px 20px rgba(0,0,0,0.6)`,
          }}>+</div>
        </div>
      </div>
    </IOSDevice>
  );
}

function EmberFind({ palette = 'abyssal' }) {
  E = EMBER_PALETTES[palette];
  return (
    <IOSDevice width={390} height={844} dark>
      <div style={{width:'100%', height:'100%', position:'relative'}}>
        <Ember/>
        <div style={{position:'relative', height:'100%', display:'flex', flexDirection:'column'}}>
          <div style={{padding:'56px 20px 10px'}}>
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
              <DiamondE size={8} color={E.ember}/>
              <div style={{fontFamily:eFont.mono, fontSize:10, letterSpacing:3, color:E.textDim}}>CHRONICLE II · THE CONCORDANCE</div>
            </div>
            <div style={{fontFamily:eFont.display, fontSize:28, color:E.gold, letterSpacing:4, fontWeight:600, lineHeight:1,
              textShadow:`0 0 20px ${E.ember}66`}}>
              SEEK
            </div>
          </div>

          <div style={{padding:'14px 20px 8px'}}>
            <div style={{
              display:'flex', alignItems:'center', gap:12,
              padding:'12px 14px', background:E.card,
              border:`1px solid ${E.ember}`,
              boxShadow:`inset 0 0 24px rgba(255,80,32,0.1), 0 0 16px rgba(255,80,32,0.2)`,
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="7.5" cy="7.5" r="5.5" stroke={E.ember} strokeWidth="1.5" fill="none"/><path d="M11.5 11.5l5 5" stroke={E.ember} strokeWidth="1.5" strokeLinecap="round"/></svg>
              <div style={{fontFamily:eFont.display, fontSize:18, color:E.text, letterSpacing:1, flex:1}}>hoto</div>
              <div style={{fontFamily:eFont.mono, fontSize:10, color:E.textDim, letterSpacing:1.5}}>3 FOUND</div>
            </div>
            <div style={{fontFamily:eFont.body, fontSize:12, color:E.textMute, marginTop:8, fontStyle:'italic', paddingLeft:4}}>
              search by name, nickname or roll note — try "40FCR" or "um'd"
            </div>
          </div>

          <div style={{padding:'10px 20px', display:'flex', gap:6, overflow:'auto'}}>
            {['All Realms','RoTW S4','LoD NL'].map((t,i)=>(
              <div key={i} style={{
                padding:'4px 12px',
                background: i===0 ? E.ember : 'transparent',
                color: i===0 ? '#1a0a04' : E.gold,
                border:`1px solid ${i===0 ? E.ember : E.goldDim}`,
                fontFamily:eFont.mono, fontSize:10, letterSpacing:1.5, textTransform:'uppercase', fontWeight:700,
                boxShadow: i===0 ? `0 0 12px ${E.ember}66` : 'none',
              }}>{t}</div>
            ))}
          </div>
          <div style={{padding:'0 20px 10px', display:'flex', gap:6, overflow:'auto'}}>
            {['unique','set','runeword','base','rune','gem'].map((c)=>(
              <div key={c} style={{
                padding:'3px 10px', border:`1px solid ${catE(c)}`,
                color:catE(c), fontFamily:eFont.mono, fontSize:9, letterSpacing:1.2, textTransform:'uppercase', fontWeight:700,
              }}>{c}</div>
            ))}
          </div>

          <div style={{padding:'6px 20px 10px'}}>
            <RuleE>RESULTS</RuleE>
          </div>

          <div style={{flex:1, overflow:'auto', padding:'0 0 110px'}}>
            {SAMPLE_HITS.map((h, i) => (
              <div key={i} style={{padding:'14px 20px', borderBottom:`1px solid ${E.line}`}}>
                <div style={{display:'flex', alignItems:'center', gap:12}}>
                  <RarityDotE cat={h.cat} size={10}/>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontFamily:eFont.display, fontSize:19, color:catE(h.cat), fontWeight:600, letterSpacing:0.5,
                      textShadow:`0 0 8px ${catE(h.cat)}33`}}>{h.name}</div>
                    <div style={{fontFamily:eFont.body, fontSize:12, color:E.textDim, marginTop:2}}>{h.base}</div>
                  </div>
                  <div style={{fontFamily:eFont.mono, fontSize:9, color:catE(h.cat), letterSpacing:1.5, fontWeight:700}}>
                    {h.cat.toUpperCase()}
                  </div>
                </div>
                <div style={{
                  marginTop:8, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap',
                  fontFamily:eFont.mono, fontSize:11,
                }}>
                  <span style={{color:E.textMute}}>held by</span>
                  <span style={{color:E.text, fontWeight:600}}>{h.container}</span>
                  <span style={{color:E.textMute}}>·</span>
                  <span style={{color:E.gold}}>{h.realm}</span>
                </div>
                {h.note && (
                  <div style={{
                    marginTop:6, fontFamily:eFont.body, fontSize:13, color:E.text,
                    paddingLeft:10, borderLeft:`2px solid ${E.ember}`, fontStyle:'italic',
                  }}>"{h.note}"</div>
                )}
              </div>
            ))}
          </div>

          <EmberTabs active="find"/>
        </div>
      </div>
    </IOSDevice>
  );
}

function EmberTabs({ active }) {
  const items = [['mules','Mules','◈'],['find','Seek','◇'],['settings','Codex','❖']];
  return (
    <div style={{
      position:'absolute', bottom:0, left:0, right:0, zIndex:20,
      paddingBottom:30, paddingTop:10,
      background:`linear-gradient(180deg, ${E.bgSoft}, ${E.bg})`,
      borderTop:`1px solid ${E.lineHi}`,
      boxShadow:`inset 0 1px 0 rgba(255,80,32,0.1)`,
    }}>
      <div style={{display:'flex'}}>
        {items.map(([k, l, g]) => (
          <div key={k} style={{
            flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3,
            color: active===k ? E.ember : E.textDim,
          }}>
            <div style={{fontSize:16, lineHeight:1,
              textShadow: active===k ? `0 0 10px ${E.ember}` : 'none'}}>{g}</div>
            <div style={{fontFamily:eFont.mono, fontSize:9, letterSpacing:2, textTransform:'uppercase'}}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { EmberMules, EmberContainer, EmberFind });
