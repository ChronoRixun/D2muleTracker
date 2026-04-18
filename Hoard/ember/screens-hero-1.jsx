// Hero flow — polished to pixel-perfect: Chronicle (home) → Mules → Container → Item detail → Add Item

function ScreenShell({ motion, children }) {
  return (
    <div style={{ width:'100%', height:'100%', position:'relative', overflow:'hidden', background:window.ET.color.bg }}>
      <EmberBG motion={motion}/>
      <div style={{ position:'relative', height:'100%', display:'flex', flexDirection:'column' }}>
        {children}
      </div>
    </div>
  );
}

// =====================================================================
// CHRONICLE — landing / dashboard
// =====================================================================
function ChronicleScreen({ motion = 'full', onNav }) {
  const T = window.ET.color, F = window.ET.font;
  const totals = { items: 160, mules: 6, realms: 2, runes: 48 };
  return (
    <ScreenShell motion={motion}>
      {/* Hero header */}
      <div style={{ padding:'56px 20px 10px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
          <Diamond size={7} color={T.ember}/>
          <div style={{ fontFamily:F.mono, fontSize:10, letterSpacing:3, color:T.textDim, textTransform:'uppercase' }}>Chronicle · the damned</div>
        </div>
        <div style={{ fontFamily:F.display, fontSize:38, color:T.gold, letterSpacing:5, fontWeight:600, lineHeight:0.95,
          textShadow:`0 0 28px ${T.ember}66, 0 0 10px ${T.gold}33`,
          animation: motion==='full' ? 'ember-text-flicker 4s ease-in-out infinite' : 'none' }}>
          HOARD
        </div>
        <div style={{ fontFamily:F.hand, fontSize:14, color:T.textDim, marginTop:6, fontStyle:'italic' }}>
          what the shadow keeps, the shadow shall find again.
        </div>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'6px 0 110px' }}>
        {/* Stat ribbon */}
        <div style={{ padding:'8px 20px 14px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:1,
            background:T.lineHi,
            border:`1px solid ${T.lineHi}`,
            boxShadow:`0 0 24px rgba(255,80,32,0.08)` }}>
            {[
              ['ITEMS',   totals.items],
              ['MULES',   totals.mules],
              ['REALMS',  totals.realms],
              ['RUNES',   totals.runes],
            ].map(([l, v], i) => (
              <div key={i} style={{ background:T.card, padding:'12px 6px', textAlign:'center' }}>
                <div style={{ fontFamily:F.display, fontSize:22, color:T.gold, fontWeight:600, lineHeight:1,
                  textShadow:`0 0 8px ${T.gold}44` }}>{v}</div>
                <div style={{ fontFamily:F.mono, fontSize:9, letterSpacing:2, color:T.textMute, marginTop:3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent drops */}
        <div style={{ padding:'4px 20px 10px' }}>
          <Rule>RECENT DROPS</Rule>
        </div>
        <div style={{ padding:'0 20px' }}>
          {window.RECENT_DROPS.map((d, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:12,
              padding:'12px 0', borderBottom:`1px solid ${T.line}`,
            }}>
              <RarityDot cat={d.cat} size={8}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:F.display, fontSize:16, color:window.rarityColor(d.cat), fontWeight:600, letterSpacing:0.4,
                  textShadow:`0 0 8px ${window.rarityColor(d.cat)}33` }}>{d.name}</div>
                <div style={{ fontFamily:F.mono, fontSize:10, color:T.textDim, marginTop:2, letterSpacing:1 }}>
                  → {d.container}{d.note ? ` · ${d.note}` : ''}
                </div>
              </div>
              <div style={{ fontFamily:F.mono, fontSize:10, color:T.textMute, letterSpacing:1 }}>{d.when}</div>
            </div>
          ))}
        </div>

        {/* Wishlist preview */}
        <div style={{ padding:'22px 20px 10px' }}>
          <Rule>HUNT · {window.WISHLIST.filter(w=>w.priority==='high').length} HIGH</Rule>
        </div>
        <div style={{ padding:'0 20px', display:'flex', flexWrap:'wrap', gap:8 }}>
          {window.WISHLIST.slice(0,5).map((w, i) => (
            <div key={i} style={{
              padding:'6px 10px',
              border:`1px solid ${w.priority==='high' ? T.ember : T.lineHi}`,
              background: w.priority==='high' ? `linear-gradient(90deg, rgba(255,80,32,0.1), transparent)` : 'transparent',
              display:'flex', alignItems:'center', gap:8,
            }}>
              <RarityDot cat={w.cat} size={6}/>
              <span style={{ fontFamily:F.display, fontSize:13, color:window.rarityColor(w.cat), fontWeight:600 }}>{w.name}</span>
            </div>
          ))}
        </div>

        {/* Runeword progress */}
        <div style={{ padding:'22px 20px 10px' }}>
          <Rule>WORDS · FORGEABLE</Rule>
        </div>
        <div style={{ padding:'0 20px' }}>
          {window.RUNEWORDS.slice(0,3).map((r, i) => {
            const ready = r.have.every(Boolean);
            const missing = r.have.filter(x=>!x).length;
            return (
              <div key={i} onClick={() => onNav && onNav('runes')} style={{
                padding:'12px 14px', marginBottom:8,
                background: ready ? `linear-gradient(90deg, rgba(106,174,74,0.12), transparent 60%)` : T.card,
                border: `1px solid ${ready ? T.set : T.line}`,
                borderLeft: `3px solid ${ready ? T.set : T.ember}`,
                cursor:'pointer',
              }}>
                <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
                  <div style={{ fontFamily:F.display, fontSize:16, color:T.text, fontWeight:600, flex:1 }}>{r.name}</div>
                  <div style={{ fontFamily:F.mono, fontSize:10, letterSpacing:2, fontWeight:700,
                    color: ready ? T.set : T.ember }}>
                    {ready ? 'READY' : `${missing} MISSING`}
                  </div>
                </div>
                <div style={{ display:'flex', gap:4, marginTop:8 }}>
                  {r.runes.map((rn, j) => (
                    <div key={j} style={{
                      padding:'3px 8px',
                      fontFamily:F.mono, fontSize:10, fontWeight:700, letterSpacing:1,
                      color: r.have[j] ? T.rune : T.textFaint,
                      border: `1px solid ${r.have[j] ? T.rune + '88' : T.line}`,
                      background: r.have[j] ? `rgba(255,106,42,0.08)` : 'transparent',
                      textDecoration: r.have[j] ? 'none' : 'line-through',
                    }}>{rn}</div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <TabBar active="home" onChange={onNav} motion={motion}/>
    </ScreenShell>
  );
}

// =====================================================================
// MULES — list grouped by realm
// =====================================================================
function MulesScreen({ motion = 'full', onNav, onOpenContainer }) {
  const T = window.ET.color, F = window.ET.font;
  return (
    <ScreenShell motion={motion}>
      <SectionHead
        eyebrow="Chronicle I · The Damned"
        title="MULES"
        right={
          <div style={{ textAlign:'right' }}>
            <div style={{ fontFamily:F.display, fontSize:26, color:T.text, fontWeight:600, lineHeight:1 }}>160</div>
            <div style={{ fontFamily:F.mono, fontSize:9, letterSpacing:2, color:T.textDim }}>ITEMS BOUND</div>
          </div>
        }
      />

      <div style={{ padding:'0 20px 10px', display:'flex', gap:6 }}>
        <Chip active>All</Chip>
        <Chip>Ladder</Chip>
        <Chip>Non-Ladder</Chip>
        <Chip>Hardcore</Chip>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'0 0 180px' }}>
        {window.SAMPLE_MULES.map((r, ri) => (
          <div key={ri} style={{ padding:'14px 20px 8px' }}>
            <div style={{ marginBottom:10 }}>
              <Rule>{r.realmShort} · {r.region}</Rule>
              <div style={{ fontFamily:F.display, fontSize:17, color:T.text, letterSpacing:2, textAlign:'center', marginTop:8, fontWeight:500 }}>
                {r.realm}
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {r.containers.map((c, ci) => (
                <div key={ci} onClick={() => onOpenContainer && onOpenContainer(c)} style={{
                  display:'flex', alignItems:'center', gap:14,
                  padding:'14px',
                  background:`linear-gradient(90deg, ${T.card}, ${T.bgSoft})`,
                  border:`1px solid ${c.type==='stash' ? T.goldDim : T.line}`,
                  borderLeft:`3px solid ${c.type==='stash' ? T.gold : T.ember}`,
                  position:'relative', cursor:'pointer',
                  boxShadow:`0 0 16px rgba(255,80,32,0.04), inset 0 1px 0 rgba(255,140,60,0.04)`,
                }}>
                  <div style={{ width:44, height:44, position:'relative',
                    display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <div style={{
                      position:'absolute', inset:0, transform:'rotate(45deg)',
                      background:T.cardHi, border:`1px solid ${T.lineHi}`,
                      boxShadow:`inset 0 0 10px ${T.ember}22`,
                    }}/>
                    <div style={{
                      position:'relative',
                      fontFamily:F.display, fontSize:12, fontWeight:600,
                      color: c.type==='stash' ? T.gold : T.text,
                      letterSpacing:1,
                    }}>{c.tag.toUpperCase()}</div>
                  </div>

                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:F.display, fontSize:18, color:T.text, fontWeight:500, letterSpacing:0.5 }}>{c.name}</div>
                    <div style={{ fontFamily:F.body, fontSize:12, color:T.textDim, marginTop:2, letterSpacing:0.3 }}>
                      {c.type==='stash' ? 'shared stash' : `${c.cls} · level ${c.lvl}`} · {c.lastTouched}
                    </div>
                  </div>

                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:F.display, fontSize:22, color:T.gold, fontWeight:500, lineHeight:1,
                      textShadow:`0 0 8px ${T.gold}66` }}>{c.items}</div>
                    <div style={{ fontFamily:F.mono, fontSize:9, letterSpacing:1.5, color:T.textMute }}>ITEMS</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        position:'absolute', bottom:94, left:20, right:20, zIndex:15,
        display:'flex', gap:10,
      }}>
        <EmberBtn variant="primary" size="md" icon="plus" style={{ flex:1 }}>New Mule</EmberBtn>
        <EmberBtn variant="ghost" size="md" icon="plus">Realm</EmberBtn>
      </div>

      <TabBar active="mules" onChange={onNav} motion={motion}/>
    </ScreenShell>
  );
}

// =====================================================================
// CONTAINER — items in a single mule
// =====================================================================
function ContainerScreen({ motion = 'full', onNav, onBack, onOpenItem, onAddItem, density = 'comfortable' }) {
  const T = window.ET.color, F = window.ET.font;
  const counts = [['unique','3'],['set','1'],['runeword','2'],['rune','6'],['gem','4'],['base','8']];

  return (
    <ScreenShell motion={motion}>
      <NavBar back="Mules" onBack={onBack} right="EDIT"/>
      <div style={{ padding:'0 20px 16px', borderBottom:`1px solid ${T.line}` }}>
        <div style={{ fontFamily:F.mono, fontSize:9, letterSpacing:3, color:T.textDim, textTransform:'uppercase' }}>
          Sorceress · Level 1 · RoTW S4
        </div>
        <div style={{ fontFamily:F.display, fontSize:34, color:T.text, fontWeight:600, letterSpacing:2, lineHeight:1.1, marginTop:6,
          textShadow:`0 0 20px ${T.ember}44` }}>
          RuneMule<span style={{ color:T.gold }}>01</span>
        </div>
        <div style={{ fontFamily:F.hand, fontSize:14, color:T.textDim, marginTop:6, fontStyle:'italic' }}>
          Softcore Ladder · 24 items · last touched today
        </div>

        <div style={{
          marginTop:14, display:'flex', gap:14, flexWrap:'wrap',
          fontFamily:F.mono, fontSize:10, letterSpacing:1.5,
        }}>
          {counts.map(([k,v]) => (
            <div key={k} style={{ display:'flex', alignItems:'center', gap:5 }}>
              <RarityDot cat={k} size={6}/>
              <span style={{ color:window.rarityColor(k), fontWeight:700 }}>{v}</span>
              <span style={{ color:T.textMute }}>{k.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ padding:'10px 20px', display:'flex', gap:6, borderBottom:`1px solid ${T.line}`, alignItems:'center' }}>
        <EIcon name="sort" size={14} color={T.textDim}/>
        <div style={{ fontFamily:F.mono, fontSize:10, color:T.textDim, letterSpacing:1.5 }}>RARITY · LATEST</div>
        <div style={{ flex:1 }}/>
        <EIcon name="filter" size={14} color={T.gold}/>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'8px 0 120px' }}>
        {density === 'dense' ? (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:T.line, margin:'0 20px' }}>
            {window.SAMPLE_ITEMS.map((it, i) => (
              <div key={i} onClick={() => onOpenItem && onOpenItem(it)} style={{
                background: T.bg, padding:'10px 12px', cursor:'pointer',
                display:'flex', flexDirection:'column', gap:4, minHeight:70,
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <EIcon name={it.icon} size={14} color={window.rarityColor(it.cat)}/>
                  <div style={{ fontFamily:F.display, fontSize:13, color:window.rarityColor(it.cat), fontWeight:600, letterSpacing:0.3,
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{it.name}</div>
                </div>
                <div style={{ fontFamily:F.body, fontSize:10, color:T.textDim, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {it.base || it.cat.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          window.SAMPLE_ITEMS.map((it, i) => (
            <div key={i} onClick={() => onOpenItem && onOpenItem(it)} style={{
              display:'flex', gap:14, padding:'14px 20px',
              borderBottom:`1px solid ${T.line}`,
              cursor:'pointer',
              background: i===0 ? `linear-gradient(90deg, rgba(255,80,32,0.08), transparent 60%)` : 'transparent',
            }}>
              <div style={{ width:36, flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                <div style={{
                  width:32, height:32,
                  border:`1px solid ${window.rarityColor(it.cat)}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color: window.rarityColor(it.cat),
                  boxShadow:`0 0 6px ${window.rarityColor(it.cat)}33`,
                  background: T.cardHi,
                }}>
                  <EIcon name={it.icon} size={18} color={window.rarityColor(it.cat)}/>
                </div>
                <div style={{ fontFamily:F.mono, fontSize:9, color:T.textMute }}>{String(i+1).padStart(2,'0')}</div>
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
                  <div style={{
                    fontFamily:F.display, fontSize:18, color:window.rarityColor(it.cat),
                    fontWeight:600, letterSpacing:0.5, flex:1, minWidth:0,
                    textShadow:`0 0 8px ${window.rarityColor(it.cat)}33`,
                  }}>{it.name}</div>
                  <div style={{ fontFamily:F.mono, fontSize:9, letterSpacing:1.5, color:window.rarityColor(it.cat), opacity:0.9 }}>
                    {it.cat.toUpperCase()}
                  </div>
                </div>
                {(it.base || it.runes) && (
                  <div style={{ fontFamily:F.body, fontSize:12, color:T.textDim, marginTop:3, letterSpacing:0.2 }}>
                    {it.base}{it.sockets ? ` · ${it.sockets}os` : ''}{it.runes ? ` · ${it.runes}` : ''}
                  </div>
                )}
                {it.note && (
                  <div style={{
                    fontFamily:F.hand, fontSize:13, color:T.text, marginTop:6,
                    paddingLeft:10, borderLeft:`2px solid ${T.ember}`, fontStyle:'italic',
                  }}>"{it.note}"</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <FAB onClick={onAddItem}/>
      <TabBar active="mules" onChange={onNav} motion={motion}/>
    </ScreenShell>
  );
}

Object.assign(window, { ChronicleScreen, MulesScreen, ContainerScreen, ScreenShell });
