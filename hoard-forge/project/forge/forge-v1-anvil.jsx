// V1 — The Anvil: hero panel at top with app state, grouped sections below.

function ForgeV1({ motion = 'full', tier: tierProp, scrolled = false }) {
  const T = window.ET.color, F = window.ET.font;
  const S = window.FORGE_STATS;
  const realms = window.FORGE_REALMS;
  const [tierLocal, setTierLocal] = React.useState(tierProp || 'hellforge');
  React.useEffect(() => { if (tierProp) setTierLocal(tierProp); }, [tierProp]);
  const tier = tierLocal;
  const setTier = setTierLocal;
  const [den, setDen] = React.useState('comfortable');
  const [sort, setSort] = React.useState('rarity');
  const [reduced] = React.useState(false);
  const effTier = reduced ? 'subtle' : tier;
  const cfg = window.MOTION_TIERS[effTier];
  const scrollRef = React.useRef(null);
  React.useEffect(() => {
    if (scrolled && scrollRef.current) {
      scrollRef.current.scrollTop = 420;
    }
  }, [scrolled]);

  return (
    <ScreenShell motion={motion}>
      {/* Header — no big title, just eyebrow over anvil panel */}
      <div style={{ padding:'56px 16px 10px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <Diamond size={7} color={T.ember}/>
          <div style={{ fontFamily:F.mono, fontSize:10, letterSpacing:3, color:T.textDim, textTransform:'uppercase' }}>Chronicle IV · The Anvil</div>
        </div>
      </div>

      <div ref={scrollRef} style={{ flex:1, overflow:'auto', padding:'0 16px 110px' }}>
        {/* HERO ANVIL */}
        <AnvilPanel glow style={{ padding:'18px 18px 16px', marginBottom:18 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <EIcon name="fire" size={18} color={T.ember}/>
            <div style={{ fontFamily:F.display, fontSize:26, color:T.gold, letterSpacing:4, fontWeight:600,
              textShadow:`0 0 18px ${T.ember}66, 0 0 4px ${T.gold}33`, flex:1 }}>FORGE</div>
            <div style={{ fontFamily:F.mono, fontSize:9, letterSpacing:2, color:T.textMute }}>v{S.appVersion}</div>
          </div>
          <div style={{ fontFamily:F.hand, fontSize:13, color:T.textDim, marginTop:2, fontStyle:'italic' }}>
            the hammer that binds the hoard
          </div>
          <div style={{
            marginTop:14, paddingTop:14, borderTop:`1px solid ${T.line}`,
            display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:10,
          }}>
            <RuneStat value={S.realms} label="Realms" color={T.gold}/>
            <RuneStat value={S.mules}  label="Mules"  color={T.text}/>
            <RuneStat value={S.items}  label="Items"  color={T.text}/>
            <RuneStat value={S.runes}  label="Runes"  color={T.rune}/>
          </div>
          <div style={{ marginTop:12, display:'flex', alignItems:'center', gap:8,
            padding:'8px 10px', background:T.bgSoft, border:`1px solid ${T.line}` }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:T.success,
              boxShadow:`0 0 8px ${T.success}` }}/>
            <div style={{ fontFamily:F.mono, fontSize:10, color:T.textDim, letterSpacing:1.5, flex:1 }}>
              LAST BACKUP · <span style={{color:T.text}}>{S.backupAgo}</span> · <span style={{color:T.textMute}}>{S.backupSize}</span>
            </div>
            <EIcon name="check" size={12} color={T.success}/>
          </div>
        </AnvilPanel>

        {/* REALMS — promoted */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Diamond size={6} color={T.gold}/>
            <div style={{ fontFamily:F.mono, fontSize:10, letterSpacing:2.5, color:T.gold, fontWeight:700 }}>REALMS · {realms.length}</div>
          </div>
          <div style={{ fontFamily:F.mono, fontSize:9, letterSpacing:1.5, color:T.ember, cursor:'pointer',
            display:'flex', alignItems:'center', gap:4 }}>
            <EIcon name="plus" size={11} color={T.ember}/> BIND NEW
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:22 }}>
          {realms.map((r, i) => (
            <div key={r.id} style={{
              padding:'12px 14px',
              background: i===0 ? `linear-gradient(90deg, rgba(232,176,72,0.08), transparent 70%)` : T.card,
              border:`1px solid ${i===0 ? T.lineGold : T.line}`,
              borderLeft:`3px solid ${i===0 ? T.gold : T.lineGold}`,
              display:'flex', alignItems:'center', gap:12,
            }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:F.display, fontSize:14, color:T.text, fontWeight:600, letterSpacing:0.5,
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.name}</div>
                <div style={{ marginTop:5 }}>
                  <RealmTagStrip era={r.era} mode={r.mode} ladder={r.ladder} region={r.region}/>
                </div>
                <div style={{ marginTop:6, fontFamily:F.mono, fontSize:9, color:T.textDim, letterSpacing:1 }}>
                  <span style={{color:T.text}}>{r.mules}</span> MULES · <span style={{color:T.text}}>{r.items}</span> ITEMS · <span style={{color:T.rune}}>{r.runes}</span> RUNES
                </div>
              </div>
              <EIcon name="chevron-right" size={14} color={T.textDim}/>
            </div>
          ))}
        </div>

        {/* RITES — motion intensity promoted + collapsed toggles */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <Diamond size={6} color={T.ember}/>
          <div style={{ fontFamily:F.mono, fontSize:10, letterSpacing:2.5, color:T.ember, fontWeight:700 }}>RITES</div>
          <div style={{ flex:1, height:1, background:`linear-gradient(to right, ${T.lineHi}, transparent)` }}/>
        </div>

        {/* Motion intensity — three-card picker (matches v1.1 MotionIntensityPicker.tsx) */}
        <div style={{ padding:'14px', background:T.card, border:`1px solid ${T.line}`, marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:10 }}>
            <div style={{ fontFamily:F.display, fontSize:13, color:T.text, fontWeight:600, letterSpacing:1.5 }}>Motion Intensity</div>
            <div style={{ fontFamily:F.mono, fontSize:9, color:T.textDim, letterSpacing:1.5 }}>
              APPLIED APP-WIDE
            </div>
          </div>
          <MotionTierCards value={tier} onChange={setTier}/>
          <div style={{ marginTop:10, paddingLeft:10, borderLeft:`2px solid ${T.ember}` }}>
            <div style={{ fontFamily:F.hand, fontSize:13, color:T.textMute, fontStyle:'italic', lineHeight:1.45 }}>
              &ldquo;{cfg.desc}&rdquo;
            </div>
          </div>
          {reduced && (
            <div style={{ marginTop:10, padding:'8px 10px',
              border:`1px solid ${T.gold}55`, background:'rgba(232,176,72,0.06)',
              fontFamily:F.mono, fontSize:9, letterSpacing:1.2, color:T.gold, textTransform:'uppercase' }}>
              ◆ System reduced-motion active — running as Subtle regardless
            </div>
          )}
          <div style={{ marginTop:12, fontFamily:F.mono, fontSize:9, color:T.textDim, letterSpacing:2, textTransform:'uppercase' }}>
            Applied across Mules · Seek · Codex · Container · Modals
          </div>
          {/* per-tier bullets */}
          <div style={{ marginTop:8 }}>
            {['subtle','nightmare','hellforge'].map(k => {
              const c = window.MOTION_TIERS[k];
              const on = effTier === k;
              return (
                <div key={k} style={{
                  display:'flex', gap:10, alignItems:'flex-start',
                  padding:'8px 0', borderBottom:`1px solid ${T.line}`,
                  opacity: on ? 1 : 0.45,
                }}>
                  <div style={{
                    width:76, fontFamily:F.display, fontSize:11, letterSpacing:2, fontWeight:600,
                    color: on ? T.ember : T.textDim, textTransform:'uppercase', paddingTop:2,
                    textShadow: on ? `0 0 6px ${T.ember}66` : 'none',
                  }}>{c.label}</div>
                  <div style={{ flex:1, display:'flex', flexDirection:'column', gap:3 }}>
                    {c.bullets.map((b,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <div style={{ width:3, height:3, borderRadius:1.5,
                          background: on ? T.ember : T.textMute,
                          boxShadow: on ? `0 0 4px ${T.ember}` : 'none' }}/>
                        <div style={{ fontFamily:F.body, fontSize:11, color: on ? T.text : T.textMute }}>{b}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <AnvilPanel style={{ padding:'4px 14px', marginBottom:22 }}>
          <RiteRow label="Density" hint="rows per screen"
            control={<ForgeSeg value={den} onChange={setDen}
              options={[{v:'comfortable',l:'Comfy'},{v:'dense',l:'Dense'}]}/>}/>
          <RiteRow label="Default sort" last
            control={<ForgeSeg value={sort} onChange={setSort} small
              options={[{v:'rarity',l:'Rarity'},{v:'name',l:'Name'},{v:'added',l:'Added'}]}/>}/>
        </AnvilPanel>

        {/* CHRONICLE — data */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <Diamond size={6} color={T.gold}/>
          <div style={{ fontFamily:F.mono, fontSize:10, letterSpacing:2.5, color:T.gold, fontWeight:700 }}>CHRONICLE · BACKUP</div>
          <div style={{ flex:1, height:1, background:`linear-gradient(to right, ${T.lineHi}, transparent)` }}/>
        </div>
        <div style={{ fontFamily:F.body, fontSize:12, color:T.textMute, marginBottom:10, lineHeight:1.5 }}>
          Everything in the hoard — realms, mules, items, tags, runes — rendered as JSON.
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:22 }}>
          <DataRow icon="upload" label="Share JSON" detail="via system share sheet"/>
          <DataRow icon="download" label="Save Backup File" detail={`last · ${S.backupAgo}`} strong/>
          <DataRow icon="scroll" label="Import from JSON" detail="merge or replace"/>
        </div>

        {/* INSCRIBED — about + replay + rate */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <Diamond size={6} color={T.gold}/>
          <div style={{ fontFamily:F.mono, fontSize:10, letterSpacing:2.5, color:T.gold, fontWeight:700 }}>INSCRIBED</div>
          <div style={{ flex:1, height:1, background:`linear-gradient(to right, ${T.lineHi}, transparent)` }}/>
        </div>
        <div style={{
          padding:'14px', background:T.card, border:`1px solid ${T.line}`, borderLeft:`3px solid ${T.lineGold}`,
          marginBottom:10,
        }}>
          <div style={{ fontFamily:F.display, fontSize:14, color:T.gold, fontWeight:600, letterSpacing:2 }}>HOARD · v{S.appVersion}</div>
          <div style={{ fontFamily:F.hand, fontSize:13, color:T.textDim, marginTop:6, fontStyle:'italic', lineHeight:1.5 }}>
            "even in hell, the damned keep ledgers."
          </div>
          <div style={{ fontFamily:F.mono, fontSize:10, color:T.textMute, marginTop:10, letterSpacing:1, lineHeight:1.7 }}>
            Data · <span style={{color:T.textDim}}>blizzhackers/d2data</span> · MIT<br/>
            Icons · <span style={{color:T.textDim}}>game-icons.net</span> · CC BY 3.0<br/>
            Built with Expo · React Native
          </div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <div style={{ flex:1 }}><EmberBtn variant="outline" size="sm" full>Rate App</EmberBtn></div>
          <div style={{ flex:1 }}><EmberBtn variant="outline" size="sm" full>Replay Tutorial</EmberBtn></div>
          <div style={{ flex:1 }}><EmberBtn variant="outline" size="sm" full>Credits</EmberBtn></div>
        </div>
      </div>
      <TabBar active="codex" motion={motion}/>
    </ScreenShell>
  );
}

function RiteRow({ label, hint, control, last }) {
  const T = window.ET.color, F = window.ET.font;
  return (
    <div style={{
      padding:'12px 0',
      borderBottom: last ? 'none' : `1px solid ${T.line}`,
      display:'flex', alignItems:'center', gap:12,
    }}>
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:F.body, fontSize:13, color:T.text, fontWeight:500 }}>{label}</div>
        {hint && <div style={{ fontFamily:F.hand, fontSize:11, color:T.textMute, fontStyle:'italic', marginTop:1 }}>{hint}</div>}
      </div>
      {control}
    </div>
  );
}

function DataRow({ icon, label, detail, strong }) {
  const T = window.ET.color, F = window.ET.font;
  return (
    <div style={{
      padding:'12px 14px',
      background: strong ? `linear-gradient(90deg, rgba(255,80,32,0.08), transparent 70%)` : T.card,
      border:`1px solid ${strong ? T.lineHi : T.line}`,
      display:'flex', alignItems:'center', gap:12, cursor:'pointer',
    }}>
      <div style={{
        width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center',
        border:`1px solid ${strong ? T.ember : T.lineHi}`,
        color: strong ? T.ember : T.gold,
        background: strong ? `rgba(255,80,32,0.08)` : 'transparent',
        boxShadow: strong ? `0 0 10px ${T.ember}33` : 'none',
      }}><EIcon name={icon} size={15} color="currentColor"/></div>
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:F.body, fontSize:13, color:T.text, fontWeight:600 }}>{label}</div>
        <div style={{ fontFamily:F.mono, fontSize:9, color:T.textDim, marginTop:2, letterSpacing:1 }}>{detail}</div>
      </div>
      <EIcon name="chevron-right" size={14} color={T.textDim}/>
    </div>
  );
}

// Realm sheet mock
function ForgeV1RealmSheet({ motion = 'full' }) {
  const T = window.ET.color, F = window.ET.font;
  return (
    <ScreenShell motion={motion}>
      {/* underlying dimmed forge */}
      <div style={{ position:'absolute', inset:0, filter:'blur(2px) brightness(0.4)', pointerEvents:'none' }}>
        <ForgeV1Static/>
      </div>
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.55)' }}/>
      <div style={{ flex:1 }}/>
      <div style={{ position:'relative', zIndex:10 }}>
        <AnvilPanel glow style={{
          borderRadius:'18px 18px 0 0',
          padding:'22px 18px 34px',
          borderBottom:'none',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <EIcon name="fire" size={16} color={T.ember}/>
            <div style={{ fontFamily:F.display, fontSize:16, color:T.gold, letterSpacing:3, fontWeight:600 }}>BIND A REALM</div>
            <div style={{ flex:1 }}/>
            <EIcon name="x" size={14} color={T.textDim}/>
          </div>

          <div style={{ marginBottom:12 }}>
            <div style={{ fontFamily:F.mono, fontSize:9, letterSpacing:2, color:T.textDim, marginBottom:5 }}>NAME</div>
            <input defaultValue="RoTW S4 SC Ladder" style={{
              width:'100%', padding:'10px 12px',
              background:T.bgSoft, border:`1px solid ${T.lineHi}`, outline:'none',
              color:T.text, fontSize:14, fontFamily:F.body,
            }}/>
          </div>

          <SheetField label="ERA">
            <ForgeSeg value="rotw" onChange={()=>{}} options={[{v:'classic',l:'Classic'},{v:'lod',l:'LoD'},{v:'rotw',l:'RoTW'}]}/>
          </SheetField>
          <SheetField label="MODE">
            <ForgeSeg value="softcore" onChange={()=>{}} options={[{v:'softcore',l:'Softcore'},{v:'hardcore',l:'Hardcore'}]}/>
          </SheetField>
          <SheetField label="SEASON">
            <ForgeSeg value="ladder" onChange={()=>{}} options={[{v:'ladder',l:'Ladder'},{v:'nonladder',l:'Non-Ladder'}]}/>
          </SheetField>
          <SheetField label="REGION">
            <ForgeSeg value="americas" onChange={()=>{}} small
              options={[{v:null,l:'None'},{v:'americas',l:'AMS'},{v:'europe',l:'EU'},{v:'asia',l:'ASIA'}]}/>
          </SheetField>

          <div style={{ marginTop:18, display:'flex', gap:8 }}>
            <div style={{ flex:1 }}><EmberBtn variant="outline" full>Cancel</EmberBtn></div>
            <div style={{ flex:2 }}><EmberBtn variant="primary" icon="check" full>Bind Realm</EmberBtn></div>
          </div>
        </AnvilPanel>
      </div>
    </ScreenShell>
  );
}

function SheetField({ label, children }) {
  const T = window.ET.color, F = window.ET.font;
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ fontFamily:F.mono, fontSize:9, letterSpacing:2, color:T.textDim, marginBottom:5 }}>{label}</div>
      {children}
    </div>
  );
}

// Static (no state) version for blurred bg
function ForgeV1Static() {
  return <div style={{ position:'absolute', inset:0, background:'#050302' }}/>;
}

Object.assign(window, { ForgeV1, ForgeV1RealmSheet });
