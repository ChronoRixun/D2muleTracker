// Current Forge — re-creation of the existing settings.tsx for comparison.
function ForgeCurrent({ motion = 'full' }) {
  const T = window.ET.color, F = window.ET.font;
  const [motionVal, setMotionVal] = React.useState('full');
  const [density, setDensity] = React.useState('comfortable');
  const realms = window.FORGE_REALMS;

  return (
    <ScreenShell motion={motion}>
      <SectionHead eyebrow="The Anvil" title="FORGE"/>
      <div style={{ flex:1, overflow:'auto', padding:'0 16px 120px' }}>
        <div style={{ margin:'8px 0 8px' }}><Rule accent={T.ember}>MOTION INTENSITY</Rule></div>
        <div style={{ padding:'8px 0', display:'flex', gap:6 }}>
          {['off','subtle','full'].map(v => (
            <Chip key={v} active={motionVal===v} onClick={()=>setMotionVal(v)}>{v}</Chip>
          ))}
        </div>

        <div style={{ margin:'20px 0 8px' }}><Rule accent={T.ember}>DENSITY</Rule></div>
        <div style={{ padding:'8px 0', display:'flex', gap:6 }}>
          <Chip active={density==='comfortable'} onClick={()=>setDensity('comfortable')}>Comfortable</Chip>
          <Chip active={density==='dense'} onClick={()=>setDensity('dense')}>Dense</Chip>
        </div>

        <div style={{ margin:'20px 0 8px' }}><Rule accent={T.gold}>REALMS</Rule></div>
        {realms.map(r => (
          <div key={r.id} style={{
            padding:'12px 14px', marginBottom:6,
            background:T.card, border:`1px solid ${T.line}`,
            display:'flex', alignItems:'center', justifyContent:'space-between', gap:10,
          }}>
            <div style={{ minWidth:0 }}>
              <div style={{ fontFamily:F.body, fontSize:13, color:T.text, fontWeight:600,
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.name}</div>
              <div style={{ fontFamily:F.mono, fontSize:9, color:T.textDim, letterSpacing:1, marginTop:3, textTransform:'uppercase' }}>
                {r.era} · {r.mode} · {r.ladder}{r.region ? ` · ${r.region}` : ''}
              </div>
            </div>
            <div style={{ color:T.textDim, fontSize:22 }}>›</div>
          </div>
        ))}
        <div style={{ marginTop:4 }}>
          <EmberBtn variant="ghost" full>+ Add Realm</EmberBtn>
        </div>

        <div style={{ margin:'20px 0 8px' }}><Rule accent={T.gold}>DATA</Rule></div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <EmberBtn variant="outline" full>Export (Share JSON)</EmberBtn>
          <EmberBtn variant="outline" full>Save Backup File</EmberBtn>
          <EmberBtn variant="outline" full>Import JSON…</EmberBtn>
        </div>

        <div style={{ margin:'20px 0 8px' }}><Rule accent={T.gold}>ABOUT</Rule></div>
        <div style={{ fontFamily:F.mono, fontSize:11, color:T.textMute, lineHeight:1.7, letterSpacing:0.4 }}>
          Hoard v1.1.2<br/>
          Offline inventory catalog for Diablo 2 Resurrected.<br/><br/>
          Item database sourced from blizzhackers/d2data (MIT license).<br/>
          github.com/blizzhackers/d2data<br/><br/>
          Item type icons by Lorc, Delapouite, and contributors<br/>
          from game-icons.net, licensed under CC BY 3.0.
        </div>
        <div style={{ marginTop:14, display:'flex', flexDirection:'column', gap:6 }}>
          <EmberBtn variant="ghost" full>Rate This App</EmberBtn>
          <EmberBtn variant="ghost" full>Replay Tutorial</EmberBtn>
        </div>
      </div>
      <TabBar active="codex" motion={motion}/>
    </ScreenShell>
  );
}
Object.assign(window, { ForgeCurrent });
