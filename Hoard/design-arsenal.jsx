// Design 2 — ARSENAL
// Utilitarian tactical interface. Dark slate + phosphor green accents + amber warn.
// Dense, data-first, monospace-forward. Power user cataloging hundreds of items.

const A = {
  bg:     '#0b0e10',
  panel:  '#131719',
  panelHi:'#1a1f22',
  line:   '#232a2e',
  lineHi: '#2e363b',
  text:   '#d6dde0',
  textDim:'#7a868d',
  textMute:'#525c62',
  phos:   '#8fe3a7',    // phosphor green
  amber:  '#e3b062',
  // rarity
  unique: '#d9b865',
  set:    '#7ec86a',
  runeword:'#b8a88a',
  rune:   '#e88b4c',
  gem:    '#6aa8d9',
  base:   '#d6dde0',
  misc:   '#a69a7c',
};
const aFont = {
  mono: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, Menlo, monospace',
  sans: '"Inter", system-ui, sans-serif',
};
function catA(c){ return A[c] || A.text; }

function AChip({ children, color=A.phos, active }) {
  return (
    <div style={{
      padding:'3px 8px',
      border:`1px solid ${active?color:A.lineHi}`,
      color:active?A.bg:color,
      background:active?color:'transparent',
      fontFamily:aFont.mono, fontSize:10, letterSpacing:1.2, textTransform:'uppercase',
      fontWeight:600,
    }}>{children}</div>
  );
}

function AHeader({ title, sub, right }) {
  return (
    <div style={{padding:'56px 16px 10px', borderBottom:`1px solid ${A.line}`, background:A.bg}}>
      <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between'}}>
        <div>
          <div style={{fontFamily:aFont.mono, fontSize:10, letterSpacing:2, color:A.phos}}>{sub}</div>
          <div style={{fontFamily:aFont.mono, fontSize:22, color:A.text, fontWeight:700, letterSpacing:-0.5, marginTop:2}}>{title}</div>
        </div>
        {right}
      </div>
    </div>
  );
}

// ─── Arsenal · Mules ─────────────────────────────────────────
function ArsenalMules() {
  return (
    <IOSDevice width={390} height={844} dark>
      <div style={{background:A.bg, width:'100%', height:'100%', position:'relative', display:'flex', flexDirection:'column'}}>
        <AHeader
          sub="▸ NODE // INVENTORY.MULES"
          title="MULES"
          right={
            <div style={{textAlign:'right'}}>
              <div style={{fontFamily:aFont.mono, fontSize:9, color:A.textDim, letterSpacing:1.5}}>TOTAL ITEMS</div>
              <div style={{fontFamily:aFont.mono, fontSize:20, color:A.phos, fontWeight:700}}>160</div>
            </div>
          }
        />

        {/* status strip */}
        <div style={{
          display:'flex', padding:'8px 16px', gap:14, borderBottom:`1px solid ${A.line}`,
          fontFamily:aFont.mono, fontSize:10, letterSpacing:1.2, color:A.textDim,
        }}>
          <div><span style={{color:A.phos}}>●</span> DB OK</div>
          <div><span style={{color:A.phos}}>●</span> LOCAL</div>
          <div style={{flex:1}}/>
          <div>2 REALMS · 6 MULES</div>
        </div>

        <div style={{flex:1, overflow:'auto', padding:'0 0 120px'}}>
          {SAMPLE_MULES.map((r, ri) => (
            <div key={ri}>
              {/* realm header band */}
              <div style={{
                padding:'12px 16px 8px', background:A.panel, borderBottom:`1px solid ${A.line}`,
                display:'flex', alignItems:'center', gap:10,
              }}>
                <div style={{fontFamily:aFont.mono, fontSize:10, color:A.phos, letterSpacing:1.5}}>
                  [{String(ri+1).padStart(2,'0')}]
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontFamily:aFont.mono, fontSize:13, color:A.text, fontWeight:700, letterSpacing:0.3}}>{r.realm.toUpperCase()}</div>
                  <div style={{fontFamily:aFont.mono, fontSize:9, color:A.textDim, letterSpacing:1.2, marginTop:2}}>{r.realmShort} // {r.region.toUpperCase()}</div>
                </div>
                <div style={{fontFamily:aFont.mono, fontSize:14, color:A.amber, fontWeight:700}}>{r.items}</div>
              </div>

              {/* container rows */}
              {r.containers.map((c, ci) => (
                <div key={ci} style={{
                  display:'flex', alignItems:'center',
                  padding:'10px 16px', borderBottom:`1px solid ${A.line}`,
                  background: ci%2 ? 'transparent' : 'rgba(255,255,255,0.012)',
                }}>
                  <div style={{
                    width:36, height:36, border:`1px solid ${c.type==='stash'?A.amber:A.phos}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:aFont.mono, fontSize:11, fontWeight:700,
                    color: c.type==='stash'?A.amber:A.phos,
                    marginRight:12,
                  }}>{c.tag}</div>

                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontFamily:aFont.mono, fontSize:14, color:A.text, fontWeight:600}}>{c.name}</div>
                    <div style={{fontFamily:aFont.mono, fontSize:10, color:A.textDim, letterSpacing:1, marginTop:2}}>
                      {c.type==='stash'
                        ? 'TYPE: STASH'
                        : `TYPE: CHAR · ${c.cls.toUpperCase()} · LV${String(c.lvl).padStart(2,'0')}`}
                    </div>
                  </div>

                  <div style={{textAlign:'right', marginLeft:8}}>
                    <div style={{fontFamily:aFont.mono, fontSize:18, color:A.phos, fontWeight:700, lineHeight:1}}>
                      {String(c.items).padStart(3,'0')}
                    </div>
                    <div style={{fontFamily:aFont.mono, fontSize:9, color:A.textDim, letterSpacing:1.5}}>ITEMS</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* action bar */}
        <div style={{
          position:'absolute', bottom:84, left:16, right:16, zIndex:10,
          display:'flex', gap:8,
        }}>
          <div style={{
            flex:1, padding:'14px', background:A.phos, color:A.bg,
            fontFamily:aFont.mono, fontSize:12, fontWeight:700, letterSpacing:2, textAlign:'center',
          }}>+ NEW MULE</div>
          <div style={{
            padding:'14px 16px', border:`1px solid ${A.lineHi}`, color:A.text,
            fontFamily:aFont.mono, fontSize:12, fontWeight:700, letterSpacing:2, textAlign:'center',
          }}>+ REALM</div>
        </div>

        <ArsenalTabs active="mules"/>
      </div>
    </IOSDevice>
  );
}

// ─── Arsenal · Container detail ──────────────────────────────
function ArsenalContainer() {
  return (
    <IOSDevice width={390} height={844} dark>
      <div style={{background:A.bg, width:'100%', height:'100%', position:'relative', display:'flex', flexDirection:'column'}}>
        <div style={{padding:'56px 16px 8px', borderBottom:`1px solid ${A.line}`}}>
          <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:8}}>
            <div style={{fontFamily:aFont.mono, fontSize:11, color:A.phos, letterSpacing:1.5}}>◂ MULES</div>
            <div style={{flex:1}}/>
            <AChip color={A.textDim}>SELECT</AChip>
            <AChip color={A.textDim}>SHARE</AChip>
            <AChip color={A.textDim}>EDIT</AChip>
          </div>

          <div style={{fontFamily:aFont.mono, fontSize:10, color:A.textDim, letterSpacing:2}}>NODE ▸ ROTW.S4 ▸ CHAR.SORCERESS</div>
          <div style={{fontFamily:aFont.mono, fontSize:26, color:A.text, fontWeight:700, marginTop:2, letterSpacing:-0.5}}>RuneMule01</div>

          {/* stat grid */}
          <div style={{
            marginTop:14, display:'grid', gridTemplateColumns:'repeat(6, 1fr)',
            border:`1px solid ${A.line}`, fontFamily:aFont.mono,
          }}>
            {[['UNQ','3','unique'],['SET','1','set'],['RW','2','runeword'],['BAS','8','base'],['RNE','6','rune'],['GEM','4','gem']].map(([k,v,c],i)=>(
              <div key={i} style={{
                padding:'8px 4px', textAlign:'center',
                borderLeft: i>0 ? `1px solid ${A.line}` : 'none',
              }}>
                <div style={{fontSize:9, color:A.textDim, letterSpacing:1.5}}>{k}</div>
                <div style={{fontSize:16, fontWeight:700, color:catA(c), marginTop:2}}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* filter chips */}
        <div style={{
          display:'flex', gap:6, padding:'10px 16px', borderBottom:`1px solid ${A.line}`,
          overflow:'auto', flexShrink:0,
        }}>
          <AChip active color={A.phos}>ALL · 24</AChip>
          <AChip color={A.unique}>UNIQUE 3</AChip>
          <AChip color={A.set}>SET 1</AChip>
          <AChip color={A.runeword}>RW 2</AChip>
          <AChip color={A.rune}>RUNE 6</AChip>
        </div>

        {/* tabular items */}
        <div style={{flex:1, overflow:'auto'}}>
          <div style={{
            display:'grid', gridTemplateColumns:'20px 1fr 48px 36px',
            padding:'8px 16px', fontFamily:aFont.mono, fontSize:9, letterSpacing:1.5, color:A.textMute,
            borderBottom:`1px solid ${A.line}`,
          }}>
            <div>#</div><div>ITEM / NOTES</div><div style={{textAlign:'right'}}>OS</div><div style={{textAlign:'right'}}>QTY</div>
          </div>
          {SAMPLE_ITEMS.map((it, i) => (
            <div key={i} style={{
              display:'grid', gridTemplateColumns:'20px 1fr 48px 36px', alignItems:'start',
              padding:'10px 16px', borderBottom:`1px solid ${A.line}`,
              background: i%2 ? 'transparent' : 'rgba(255,255,255,0.012)',
            }}>
              <div style={{fontFamily:aFont.mono, fontSize:10, color:A.textMute, paddingTop:2}}>{String(i+1).padStart(2,'0')}</div>
              <div style={{minWidth:0}}>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <div style={{
                    width:6, height:6, background:catA(it.cat), flexShrink:0,
                  }}/>
                  <div style={{fontFamily:aFont.mono, fontSize:13, fontWeight:600, color:catA(it.cat)}}>{it.name}</div>
                </div>
                {(it.base || it.runes) && (
                  <div style={{fontFamily:aFont.mono, fontSize:10, color:A.textDim, marginTop:2, letterSpacing:0.3}}>
                    {it.base}{it.runes ? ` ⟨${it.runes}⟩` : ''}
                  </div>
                )}
                {it.note && (
                  <div style={{fontFamily:aFont.mono, fontSize:11, color:A.text, marginTop:4, background:A.panel, padding:'4px 8px', borderLeft:`2px solid ${catA(it.cat)}`}}>
                    ▸ {it.note}
                  </div>
                )}
              </div>
              <div style={{textAlign:'right', fontFamily:aFont.mono, fontSize:12, color:it.sockets?A.amber:A.textMute, paddingTop:2}}>
                {it.sockets ? `${it.sockets}os` : '—'}
              </div>
              <div style={{textAlign:'right', fontFamily:aFont.mono, fontSize:12, color:A.text, paddingTop:2}}>
                {it.note && it.note.startsWith('×') ? it.note : '1'}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          position:'absolute', bottom:28, left:16, right:16, zIndex:10,
          padding:'14px', background:A.phos, color:A.bg,
          fontFamily:aFont.mono, fontSize:13, fontWeight:700, letterSpacing:2, textAlign:'center',
          boxShadow:'0 0 24px rgba(143,227,167,0.25)',
        }}>+ LOG ITEM</div>
      </div>
    </IOSDevice>
  );
}

// ─── Arsenal · Find Item ─────────────────────────────────────
function ArsenalFind() {
  return (
    <IOSDevice width={390} height={844} dark>
      <div style={{background:A.bg, width:'100%', height:'100%', position:'relative', display:'flex', flexDirection:'column'}}>
        <AHeader sub="▸ QUERY // CROSS.REALM" title="FIND ITEM"/>

        {/* query bar */}
        <div style={{padding:'12px 16px', borderBottom:`1px solid ${A.line}`}}>
          <div style={{
            display:'flex', alignItems:'center', gap:10,
            border:`1px solid ${A.phos}`, background:A.panel, padding:'10px 12px',
          }}>
            <div style={{fontFamily:aFont.mono, fontSize:11, color:A.phos, letterSpacing:1}}>$</div>
            <div style={{fontFamily:aFont.mono, fontSize:14, color:A.text, flex:1}}>hoto_</div>
            <div style={{
              width:7, height:14, background:A.phos, animation:'blink 1s infinite',
              marginLeft:-8,
            }}/>
            <div style={{fontFamily:aFont.mono, fontSize:10, color:A.textDim, letterSpacing:1.2}}>3 HITS · 148ms</div>
          </div>

          <div style={{display:'flex', gap:6, marginTop:10, overflow:'auto'}}>
            <AChip active color={A.phos}>ALL REALMS</AChip>
            <AChip>ROTW.S4</AChip>
            <AChip>LOD.NL</AChip>
          </div>
          <div style={{display:'flex', gap:6, marginTop:6, overflow:'auto'}}>
            {['unique','set','runeword','base','rune','gem'].map(c=>(
              <AChip key={c} color={catA(c)}>{c}</AChip>
            ))}
          </div>
        </div>

        {/* hits */}
        <div style={{flex:1, overflow:'auto', padding:'0 0 120px'}}>
          {SAMPLE_HITS.map((h, i) => (
            <div key={i} style={{padding:'14px 16px', borderBottom:`1px solid ${A.line}`}}>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <div style={{width:6, height:28, background:catA(h.cat)}}/>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontFamily:aFont.mono, fontSize:14, color:catA(h.cat), fontWeight:700}}>{h.name}</div>
                  <div style={{fontFamily:aFont.mono, fontSize:10, color:A.textDim, letterSpacing:1, marginTop:2}}>
                    {h.base}
                  </div>
                </div>
                <div style={{fontFamily:aFont.mono, fontSize:9, color:catA(h.cat), letterSpacing:1.5}}>
                  [{h.cat.toUpperCase()}]
                </div>
              </div>
              <div style={{
                marginTop:8, display:'flex', alignItems:'center', gap:8,
                fontFamily:aFont.mono, fontSize:11, color:A.text,
              }}>
                <span style={{color:A.textDim}}>LOC:</span>
                <span>{h.container}</span>
                <span style={{color:A.textMute}}>//</span>
                <span style={{color:A.amber}}>{h.realm}</span>
              </div>
              {h.note && (
                <div style={{
                  marginTop:6, fontFamily:aFont.mono, fontSize:11, color:A.text,
                  background:A.panel, padding:'6px 10px', borderLeft:`2px solid ${catA(h.cat)}`,
                }}>▸ {h.note}</div>
              )}
            </div>
          ))}
        </div>

        <ArsenalTabs active="find"/>
      </div>
    </IOSDevice>
  );
}

function ArsenalTabs({ active }) {
  const items = [['mules','MULES','▦'],['find','FIND','⌕'],['settings','CONFIG','⚙']];
  return (
    <div style={{
      position:'absolute', bottom:0, left:0, right:0, zIndex:20,
      paddingBottom:30, paddingTop:8, background:A.panel,
      borderTop:`1px solid ${A.lineHi}`,
    }}>
      <div style={{display:'flex'}}>
        {items.map(([k, l, g]) => (
          <div key={k} style={{
            flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2,
            color: active===k ? A.phos : A.textDim,
          }}>
            <div style={{fontSize:18, lineHeight:1}}>{g}</div>
            <div style={{fontFamily:aFont.mono, fontSize:9, letterSpacing:1.5}}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { ArsenalMules, ArsenalContainer, ArsenalFind });
