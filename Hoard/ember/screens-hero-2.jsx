// Item detail + Add item screens

// =====================================================================
// ITEM DETAIL — full item with properties, sockets, rolls
// =====================================================================
function ItemDetailScreen({ motion = 'full', onNav, onBack, item }) {
  const T = window.ET.color, F = window.ET.font;
  const it = item || window.SAMPLE_ITEMS[0]; // Harlequin Crest
  const rc = window.rarityColor(it.cat);

  // Fabricated detailed properties for hero example
  const props = [
    { label: '+2 to All Skills', emphasis: true },
    { label: '+148% Enhanced Defense' },
    { label: '+103 to Life (based on Character Level)', emphasis: true },
    { label: '+103 to Mana (based on Character Level)', emphasis: true },
    { label: 'Damage Reduced by 10%' },
    { label: '50% Better Chance of Getting Magic Items' },
    { label: '+2 to All Attributes' },
    { label: 'Socketed (3)' },
  ];
  const socketed = [
    { name: 'Um',         cat: 'rune',  note: '+22 all res' },
    { name: 'Ber',        cat: 'rune',  note: '8% DR' },
    { name: 'Ptopaz',     cat: 'gem',   note: '+24% MF' },
  ];

  return (
    <ScreenShell motion={motion}>
      <NavBar back="RuneMule01" onBack={onBack} right="EDIT"/>

      {/* Big rarity header */}
      <div style={{ padding:'0 20px 22px', textAlign:'center' }}>
        {/* Item silhouette */}
        <div style={{ margin:'8px auto 14px', width:110, height:110, position:'relative' }}>
          <div style={{
            position:'absolute', inset:0, transform:'rotate(45deg)',
            border:`1px solid ${rc}`,
            background: `linear-gradient(135deg, ${T.cardHi}, ${T.card})`,
            boxShadow: `0 0 40px ${rc}44, inset 0 0 24px ${rc}22`,
            animation: motion==='full' ? 'ember-glow-pulse 4s ease-in-out infinite' : 'none',
          }}/>
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <EIcon name={it.icon} size={58} color={rc} stroke={1.2}/>
          </div>
        </div>

        <div style={{ fontFamily:F.mono, fontSize:10, letterSpacing:3, color:rc, fontWeight:700, marginBottom:6 }}>
          {it.cat.toUpperCase()}
        </div>
        <div style={{ fontFamily:F.display, fontSize:28, color:rc, fontWeight:600, letterSpacing:1.5, lineHeight:1.1,
          textShadow:`0 0 16px ${rc}66` }}>
          {it.name}
        </div>
        <div style={{ fontFamily:F.body, fontSize:14, color:T.textDim, marginTop:6, letterSpacing:1 }}>
          {it.base}
        </div>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'0 0 90px' }}>
        {/* Properties */}
        <div style={{ padding:'0 20px 10px' }}><Rule>PROPERTIES</Rule></div>
        <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:2 }}>
          {props.map((p, i) => (
            <div key={i} style={{
              padding:'9px 12px',
              background: p.emphasis ? `linear-gradient(90deg, rgba(232,176,72,0.08), transparent 70%)` : 'transparent',
              borderLeft: p.emphasis ? `2px solid ${T.gold}` : `2px solid transparent`,
              fontFamily: F.body, fontSize: 14,
              color: p.emphasis ? T.text : T.textDim,
              fontWeight: p.emphasis ? 500 : 400,
            }}>{p.label}</div>
          ))}
        </div>

        {/* Sockets */}
        <div style={{ padding:'22px 20px 10px' }}><Rule>SOCKETS · {socketed.length} / 3</Rule></div>
        <div style={{ padding:'0 20px', display:'flex', gap:8 }}>
          {socketed.map((s, i) => {
            const sc = window.rarityColor(s.cat);
            return (
              <div key={i} style={{
                flex:1, padding:'12px 8px', textAlign:'center',
                border:`1px solid ${sc}66`,
                background: `linear-gradient(180deg, rgba(255,106,42,0.06), transparent)`,
                position:'relative',
              }}>
                <div style={{ fontFamily:F.display, fontSize:17, color:sc, fontWeight:700, letterSpacing:1,
                  textShadow:`0 0 8px ${sc}66` }}>{s.name}</div>
                <div style={{ fontFamily:F.mono, fontSize:9, color:T.textDim, marginTop:3, letterSpacing:0.5 }}>{s.note}</div>
              </div>
            );
          })}
        </div>

        {/* Metadata */}
        <div style={{ padding:'22px 20px 10px' }}><Rule>LEDGER</Rule></div>
        <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:1,
          background:T.line, border:`1px solid ${T.line}` }}>
          {[
            ['FOUND',       'Today · 12:47'],
            ['FOUND IN',    'RuneMule01 · RoTW S4 SC'],
            ['DROPPED BY',  'Baal (Hell) · p8'],
            ['TAGGED',      'twink · 2sk · hoard'],
            ['APPRAISED',   '~HR: Jah + Ohm'],
          ].map(([k, v], i) => (
            <div key={i} style={{ background:T.card, padding:'10px 14px',
              display:'flex', justifyContent:'space-between', alignItems:'center', gap:10 }}>
              <div style={{ fontFamily:F.mono, fontSize:10, color:T.textDim, letterSpacing:2 }}>{k}</div>
              <div style={{ fontFamily:F.body, fontSize:13, color:T.text, textAlign:'right' }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Note */}
        <div style={{ padding:'22px 20px 10px' }}><Rule>NOTES</Rule></div>
        <div style={{ padding:'0 20px' }}>
          <div style={{ padding:'14px', background:T.card, border:`1px solid ${T.line}`, borderLeft:`2px solid ${T.ember}`,
            fontFamily:F.hand, fontSize:15, color:T.text, fontStyle:'italic', lineHeight:1.6 }}>
            "20/103 life/mana, 2sk. Perfect for the sorc. Never trade."
          </div>
        </div>

        {/* Actions row */}
        <div style={{ padding:'22px 20px 0', display:'flex', gap:8 }}>
          <EmberBtn variant="ghost" size="md" icon="flag" style={{ flex:1 }}>Wishlist</EmberBtn>
          <EmberBtn variant="ghost" size="md" icon="trade" style={{ flex:1 }}>Trade</EmberBtn>
          <EmberBtn variant="outline" size="md" icon="download" style={{ flex:1 }}>Share</EmberBtn>
        </div>
      </div>
    </ScreenShell>
  );
}

// =====================================================================
// ADD ITEM — capture a drop
// =====================================================================
function AddItemScreen({ motion = 'full', onBack, onSave }) {
  const T = window.ET.color, F = window.ET.font;
  const [cat, setCat] = React.useState('unique');
  const [sockets, setSockets] = React.useState(3);
  const [name, setName] = React.useState('Harlequin Crest');
  const [base, setBase] = React.useState('Shako');
  const cats = ['unique','set','runeword','rare','magic','base','rune','gem'];

  return (
    <ScreenShell motion={motion}>
      <NavBar back="Cancel" onBack={onBack} title="Add Drop" right={<span style={{color:T.ember, fontWeight:700}}>SAVE</span>}/>

      <div style={{ flex:1, overflow:'auto', padding:'0 20px 120px' }}>
        {/* Rarity selector */}
        <Field label="Rarity">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6 }}>
            {cats.map(c => {
              const cc = window.rarityColor(c);
              const on = cat === c;
              return (
                <div key={c} onClick={() => setCat(c)} style={{
                  padding:'8px 4px', textAlign:'center', cursor:'pointer',
                  border:`1px solid ${on ? cc : T.line}`,
                  background: on ? `linear-gradient(180deg, ${cc}22, transparent)` : T.bgSoft,
                  fontFamily:F.mono, fontSize:10, letterSpacing:1.5,
                  color: on ? cc : T.textDim, fontWeight:700, textTransform:'uppercase',
                  boxShadow: on ? `0 0 10px ${cc}44, inset 0 0 8px ${cc}11` : 'none',
                }}>{c}</div>
              );
            })}
          </div>
        </Field>

        <Field label="Name" hint="Full item name — e.g. Harlequin Crest">
          <Input value={name} onChange={e=>setName(e.target.value)} placeholder="Harlequin Crest"/>
        </Field>

        <Field label="Base">
          <Input value={base} onChange={e=>setBase(e.target.value)} placeholder="Shako"/>
        </Field>

        <Field label="Sockets">
          <div style={{ display:'flex', gap:6 }}>
            {[0,1,2,3,4,5,6].map(n => {
              const on = sockets === n;
              return (
                <div key={n} onClick={()=>setSockets(n)} style={{
                  flex:1, padding:'10px 0', textAlign:'center', cursor:'pointer',
                  border:`1px solid ${on ? T.ember : T.line}`,
                  background: on ? `rgba(255,80,32,0.08)` : 'transparent',
                  fontFamily:F.display, fontSize:16, fontWeight:600,
                  color: on ? T.ember : T.textDim,
                  boxShadow: on ? `0 0 10px ${T.ember}44` : 'none',
                }}>{n}</div>
              );
            })}
          </div>
        </Field>

        {/* Socketed items */}
        <Field label={`Socketed · ${sockets}`}>
          <div style={{ display:'flex', gap:8 }}>
            {Array.from({length: sockets}).map((_, i) => (
              <div key={i} style={{
                flex:1, minHeight:60, display:'flex', alignItems:'center', justifyContent:'center',
                border:`1px dashed ${T.lineHi}`,
                color:T.textMute,
                fontFamily:F.mono, fontSize:10, letterSpacing:1.5,
                background: T.bgSoft,
              }}>
                <div style={{ textAlign:'center' }}>
                  <EIcon name="socket" size={16} color={T.textMute}/>
                  <div style={{ marginTop:3 }}>EMPTY</div>
                </div>
              </div>
            ))}
          </div>
        </Field>

        {/* Properties capture */}
        <Field label="Key rolls" hint="Quick properties that matter — e.g. 20/103, 40FCR, 2sk">
          <Input placeholder="20/103 life/mana, 2sk" mono/>
        </Field>

        {/* Location */}
        <div style={{ padding:'8px 0 10px' }}>
          <Rule>LOCATION</Rule>
        </div>

        <Field label="Realm">
          <div style={{ padding:'10px 12px', background:T.bgSoft, border:`1px solid ${T.line}`,
            display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontFamily:F.body, color:T.text, fontSize:14 }}>RoTW S4 SC Ladder</div>
            <EIcon name="chevron-right" size={14} color={T.textDim}/>
          </div>
        </Field>

        <Field label="Mule / Stash">
          <div style={{ padding:'10px 12px', background:T.bgSoft, border:`1px solid ${T.line}`,
            display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontFamily:F.body, color:T.text, fontSize:14 }}>RuneMule01 · Sorceress</div>
            <EIcon name="chevron-right" size={14} color={T.textDim}/>
          </div>
        </Field>

        <div style={{ padding:'8px 0 10px' }}>
          <Rule>PROVENANCE</Rule>
        </div>

        <Field label="Source">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6 }}>
            {['Drop','Trade','Gamble','Craft','Shop','Gift'].map((s, i) => (
              <div key={i} style={{
                padding:'8px 4px', textAlign:'center',
                border:`1px solid ${i===0 ? T.gold : T.line}`,
                background: i===0 ? `rgba(232,176,72,0.08)` : 'transparent',
                fontFamily:F.mono, fontSize:10, letterSpacing:1.5,
                color: i===0 ? T.gold : T.textDim, fontWeight:700, textTransform:'uppercase',
              }}>{s}</div>
            ))}
          </div>
        </Field>

        <Field label="Dropped by" hint="Optional">
          <Input placeholder="Baal (Hell) · p8" mono/>
        </Field>

        <Field label="Tags">
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {['twink','2sk','hoard'].map(t => (
              <div key={t} style={{
                padding:'5px 10px',
                background:`rgba(255,80,32,0.1)`,
                border:`1px solid ${T.ember}88`,
                color:T.ember,
                fontFamily:F.mono, fontSize:10, letterSpacing:1.2, fontWeight:700, textTransform:'uppercase',
                display:'flex', alignItems:'center', gap:6,
              }}>{t} <EIcon name="x" size={10} color={T.ember}/></div>
            ))}
            <div style={{
              padding:'5px 10px',
              border:`1px dashed ${T.lineHi}`,
              color:T.textDim,
              fontFamily:F.mono, fontSize:10, letterSpacing:1.2, fontWeight:700, textTransform:'uppercase',
            }}>+ add</div>
          </div>
        </Field>

        <Field label="Notes">
          <textarea placeholder="gg roll, never trade..." style={{
            width:'100%', minHeight:72, padding:'10px 12px',
            background:T.bgSoft, border:`1px solid ${T.line}`, outline:'none',
            color:T.text, fontSize:14, fontFamily:F.hand, fontStyle:'italic',
            resize:'vertical', boxSizing:'border-box',
          }}/>
        </Field>
      </div>

      <div style={{
        position:'absolute', bottom:0, left:0, right:0, padding:'16px 20px 34px',
        background: `linear-gradient(180deg, transparent, ${T.bg} 30%)`,
        display:'flex', gap:10,
      }}>
        <EmberBtn variant="outline" size="md" onClick={onBack}>Cancel</EmberBtn>
        <EmberBtn variant="primary" size="md" icon="check" style={{ flex:1 }} onClick={onSave}>Bind to Hoard</EmberBtn>
      </div>
    </ScreenShell>
  );
}

Object.assign(window, { ItemDetailScreen, AddItemScreen });
