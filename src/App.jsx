import { useState, useEffect } from "react";
const ADMIN_EMAIL = "talkivo.ai@gmail.com";
const SB_URL = "https://sihadebsdzdbhaesdwfb.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpaGFkZWJzZHpkYmhhZXNkd2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjczMjEsImV4cCI6MjA5MTk0MzMyMX0.8xxm2RgAxGecFtaURxTHAcMIeZ0NG9a_SIjU9PFqw68";

const sb = {
  h: (t) => ({ "Content-Type": "application/json", "apikey": SB_KEY, "Authorization": "Bearer " + (t || SB_KEY) }),
  async signUp(e, p) { const r = await fetch(SB_URL + "/auth/v1/signup", { method: "POST", headers: { "Content-Type": "application/json", "apikey": SB_KEY }, body: JSON.stringify({ email: e, password: p }) }); return r.json(); },
  async signIn(e, p) { const r = await fetch(SB_URL + "/auth/v1/token?grant_type=password", { method: "POST", headers: { "Content-Type": "application/json", "apikey": SB_KEY }, body: JSON.stringify({ email: e, password: p }) }); return r.json(); },
  async get(tbl, tk, q) { const r = await fetch(SB_URL + "/rest/v1/" + tbl + "?" + (q || ""), { headers: this.h(tk) }); return r.json(); },
  async add(tbl, d, tk) { const r = await fetch(SB_URL + "/rest/v1/" + tbl, { method: "POST", headers: { ...this.h(tk), "Prefer": "return=representation" }, body: JSON.stringify(d) }); return r.json(); },
  async upd(tbl, id, d, tk) { const r = await fetch(SB_URL + "/rest/v1/" + tbl + "?id=eq." + id, { method: "PATCH", headers: { ...this.h(tk), "Prefer": "return=representation" }, body: JSON.stringify(d) }); return r.json(); },
  async del(tbl, id, tk) { await fetch(SB_URL + "/rest/v1/" + tbl + "?id=eq." + id, { method: "DELETE", headers: this.h(tk) }); }
};

function Auth({ onLogin }) {
  const [em, setEm] = useState(""); const [pw, setPw] = useState(""); const [nu, setNu] = useState(false);
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const [done, setDone] = useState(false);
  const go = async () => { setErr(""); setBusy(true); try { if (nu) { const d = await sb.signUp(em, pw); if (d.error) { setErr(d.error.message); setBusy(false); return; } setDone(true); } else { const d = await sb.signIn(em, pw); if (d.error) { setErr(d.error.message || d.error_description); setBusy(false); return; } onLogin(d); } } catch(e) { setErr("Yhteysvirhe"); } setBusy(false); };
  if (done) return (<div style={S.aw}><div style={S.ab}><div style={{fontSize:48}}>📧</div><h1 style={S.ah}>Tarkista sähköpostisi</h1><p style={S.ap}>Vahvistuslinkki lähetetty: <strong>{em}</strong></p><button style={S.btn} onClick={()=>{setNu(false);setDone(false);}}>Takaisin</button></div></div>);
  return (<div style={S.aw}><div style={S.ab}><div style={{fontSize:48,marginBottom:8}}>🔧</div><h1 style={S.ah}>Korjaamochat</h1><p style={S.ap}>{nu?"Luo uusi tili":"Kirjaudu hallintapaneeliin"}</p>{err&&<div style={S.er}>{err}</div>}<input type="email" placeholder="Sähköposti" value={em} onChange={e=>setEm(e.target.value)} style={S.inp}/><input type="password" placeholder="Salasana (min 6 merkkiä)" value={pw} onChange={e=>setPw(e.target.value)} style={S.inp} onKeyDown={e=>e.key==="Enter"&&go()}/><button style={S.btn} onClick={go} disabled={busy}>{busy?"Odota...":nu?"Luo tili":"Kirjaudu"}</button><button style={S.lnk} onClick={()=>{setNu(!nu);setErr("");}}>{nu?"Onko jo tili? Kirjaudu":"Ei tiliä? Luo uusi"}</button></div></div>);
}

function BizForm({ biz, token, onSave }) {
  const [f, setF] = useState({ name:biz?.name||"", address:biz?.address||"", phone:biz?.phone||"", email:biz?.email||"", opening_hours:biz?.opening_hours||"", extra_info:biz?.extra_info||"", brand_color:biz?.brand_color||"#e8532e", brand_name:biz?.brand_name||"", welcome_message:biz?.welcome_message||"Hei! Kuinka voin auttaa? 🔧" });
  const [ok, setOk] = useState(false);
  const save = async () => { if(biz?.id) await sb.upd("businesses",biz.id,f,token); setOk(true); onSave(); setTimeout(()=>setOk(false),2000); };
  return (<div style={S.sec}><h2 style={S.sh}>Korjaamon tiedot</h2><p style={S.sp}>Chatbot käyttää näitä tietoja.</p><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}><div><label style={S.lbl}>Nimi *</label><input style={S.inp} value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="Mikkolan Autohuolto"/></div><div><label style={S.lbl}>Osoite</label><input style={S.inp} value={f.address} onChange={e=>setF({...f,address:e.target.value})} placeholder="Teollisuuskatu 12, Espoo"/></div><div><label style={S.lbl}>Puhelin</label><input style={S.inp} value={f.phone} onChange={e=>setF({...f,phone:e.target.value})} placeholder="09 123 4567"/></div><div><label style={S.lbl}>Sähköposti</label><input style={S.inp} value={f.email} onChange={e=>setF({...f,email:e.target.value})} placeholder="info@korjaamo.fi"/></div></div><label style={S.lbl}>Aukioloajat</label><input style={S.inp} value={f.opening_hours} onChange={e=>setF({...f,opening_hours:e.target.value})} placeholder="Ma-Pe 7:30-16:30"/><label style={S.lbl}>Lisätiedot chatbotille</label><textarea style={{...S.inp,minHeight:80}} value={f.extra_info} onChange={e=>setF({...f,extra_info:e.target.value})} placeholder="Sähköautoja emme huolla. Hybridit kyllä."/><label style={S.lbl}>Chatbotin väri</label><div style={{display:"flex",gap:8,marginBottom:12}}>{["#e8532e","#2563eb","#16a34a","#7c3aed","#db2777","#ea580c","#0d9488","#4f46e5"].map(c=><button key={c} onClick={()=>setF({...f,brand_color:c})} style={{width:32,height:32,borderRadius:8,border:f.brand_color===c?"2px solid #fff":"2px solid transparent",background:c,cursor:"pointer"}}/>)}</div><input style={S.inp} value={f.brand_color} onChange={e=>setF({...f,brand_color:e.target.value})} placeholder="#e8532e"/>
<label style={S.lbl}>Chatbotin nimi (näkyy asiakkaalle)</label><input style={S.inp} value={f.brand_name} onChange={e=>setF({...f,brand_name:e.target.value})} placeholder="Esim. Asiakaspalvelu tai korjaamon nimi"/>
<label style={S.lbl}>Tervetuloviesti</label><input style={S.inp} value={f.welcome_message} onChange={e=>setF({...f,welcome_message:e.target.value})} placeholder="Hei! Kuinka voin auttaa? 🔧"/>
<button style={S.btn} onClick={save}>{ok?"✓ Tallennettu!":"Tallenna"}</button></div>);
}

function Svc({ bizId, token }) {
  const [ls, setLs] = useState([]); const [f, setF] = useState({name:"",price_from:"",price_to:"",description:""}); const [ld, setLd] = useState(true);
  const load = async () => { const d = await sb.get("services",token,"business_id=eq."+bizId+"&order=created_at.asc"); if(Array.isArray(d))setLs(d); setLd(false); };
  useEffect(()=>{load();},[bizId]);
  const add = async () => { if(!f.name)return; await sb.add("services",{business_id:bizId,name:f.name,price_from:f.price_from?parseInt(f.price_from):null,price_to:f.price_to?parseInt(f.price_to):null,description:f.description},token); setF({name:"",price_from:"",price_to:"",description:""}); load(); };
  return (<div style={S.sec}><h2 style={S.sh}>Palvelut ja hinnat</h2><p style={S.sp}>Chatbot kertoo nämä asiakkaille.</p>{ld?<p style={{color:"#666"}}>Ladataan...</p>:<>{ls.map(s=><div key={s.id} style={S.card}><div style={{flex:1}}><div style={S.ct}>{s.name}</div><div style={S.cm}>{s.price_from&&s.price_to?s.price_from+"–"+s.price_to+" €":s.price_from?"alk. "+s.price_from+" €":"Hinta sopimuksen mukaan"}{s.description?" · "+s.description:""}</div></div><button style={S.dl} onClick={()=>{sb.del("services",s.id,token);load();}}>✕</button></div>)}<div style={S.abox}><div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:8}}><input style={S.is} value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="Palvelun nimi *"/><input style={S.is} type="number" value={f.price_from} onChange={e=>setF({...f,price_from:e.target.value})} placeholder="Alk. €"/><input style={S.is} type="number" value={f.price_to} onChange={e=>setF({...f,price_to:e.target.value})} placeholder="Max €"/></div><input style={S.is} value={f.description} onChange={e=>setF({...f,description:e.target.value})} placeholder="Lisätiedot"/><button style={S.abtn} onClick={add}>+ Lisää palvelu</button></div></>}</div>);
}

function Faq({ bizId, token }) {
  const [ls, setLs] = useState([]); const [f, setF] = useState({question:"",answer:""}); const [ld, setLd] = useState(true);
  const load = async () => { const d = await sb.get("faqs",token,"business_id=eq."+bizId+"&order=created_at.asc"); if(Array.isArray(d))setLs(d); setLd(false); };
  useEffect(()=>{load();},[bizId]);
  const add = async () => { if(!f.question||!f.answer)return; await sb.add("faqs",{business_id:bizId,...f},token); setF({question:"",answer:""}); load(); };
  return (<div style={S.sec}><h2 style={S.sh}>Usein kysytyt</h2><p style={S.sp}>Chatbot osaa vastata näihin.</p>{ld?<p style={{color:"#666"}}>Ladataan...</p>:<>{ls.map(q=><div key={q.id} style={S.card}><div style={{flex:1}}><div style={S.ct}>{q.question}</div><div style={S.cm}>{q.answer}</div></div><button style={S.dl} onClick={()=>{sb.del("faqs",q.id,token);load();}}>✕</button></div>)}<div style={S.abox}><input style={S.is} value={f.question} onChange={e=>setF({...f,question:e.target.value})} placeholder="Kysymys"/><input style={S.is} value={f.answer} onChange={e=>setF({...f,answer:e.target.value})} placeholder="Vastaus"/><button style={S.abtn} onClick={add}>+ Lisää</button></div></>}</div>);
}
function Leads({ bizId, token }) {
  const [ls, setLs] = useState([]); const [ld, setLd] = useState(true);
  const load = async () => { const d = await sb.get("leads",token,"business_id=eq."+bizId+"&order=created_at.desc"); if(Array.isArray(d))setLs(d); setLd(false); };
  useEffect(()=>{load(); const i=setInterval(load,30000); return ()=>clearInterval(i);},[bizId]);
  const setStatus = async (id, s) => { await sb.upd("leads",id,{status:s},token); load(); };
  const colors = {new:"#e8532e",contacted:"#eab308",done:"#4ade80"};
  const labels = {new:"Uusi",contacted:"Kontaktoitu",done:"Hoidettu"};
  return (<div style={S.sec}><h2 style={S.sh}>Liidit</h2><p style={S.sp}>Soittopyynnöt chatbotista. Päivittyy automaattisesti.</p>{ld?<p style={{color:"#666"}}>Ladataan...</p>:ls.length===0?<div style={{textAlign:"center",padding:"40px 20px",color:"#666"}}><div style={{fontSize:32,marginBottom:8}}>📞</div><div>Ei vielä liidejä.</div></div>:ls.map(l=><div key={l.id} style={{...S.card,borderLeft:"3px solid "+(colors[l.status]||colors.new)}}><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><div style={S.ct}>{l.name} — <a href={"tel:"+l.phone} style={{color:"#e8532e",textDecoration:"none"}}>{l.phone}</a></div><span style={{fontSize:11,padding:"2px 8px",borderRadius:10,background:(colors[l.status]||colors.new)+"22",color:colors[l.status]||colors.new}}>{labels[l.status]||"Uusi"}</span></div>{l.message&&<div style={S.cm}>{l.message}</div>}<div style={{fontSize:11,color:"#555",marginTop:4}}>{new Date(l.created_at).toLocaleString("fi-FI")}</div><div style={{display:"flex",gap:6,marginTop:8}}>{["new","contacted","done"].map(s=><button key={s} onClick={()=>setStatus(l.id,s)} style={{padding:"4px 12px",borderRadius:6,border:"1px solid "+(l.status===s?colors[s]:"#2a2a3a"),background:l.status===s?colors[s]+"22":"transparent",color:l.status===s?colors[s]:"#888",fontSize:11,cursor:"pointer"}}>{labels[s]}</button>)}</div></div></div>)}</div>);
}
function Analytics({ bizId, token }) {
  const [logs, setLogs] = useState([]);
  const [leads, setLeads] = useState([]);
  const [ld, setLd] = useState(true);
  useEffect(()=>{
    const load=async()=>{
      const [l,r]=await Promise.all([
        sb.get("chat_logs",token,"business_id=eq."+bizId+"&order=created_at.desc&limit=500"),
        sb.get("leads",token,"business_id=eq."+bizId+"&order=created_at.desc")
      ]);
      if(Array.isArray(l))setLogs(l);
      if(Array.isArray(r))setLeads(r);
      setLd(false);
    };load();
  },[bizId]);

  if(ld)return <p style={{color:"#666"}}>Ladataan...</p>;

  var today=new Date().toDateString();
  var week=Date.now()-7*24*60*60*1000;
  var month=Date.now()-30*24*60*60*1000;
  var todayLogs=logs.filter(function(l){return new Date(l.created_at).toDateString()===today;});
  var weekLogs=logs.filter(function(l){return new Date(l.created_at).getTime()>week;});
  var monthLogs=logs.filter(function(l){return new Date(l.created_at).getTime()>month;});
  var todayLeads=leads.filter(function(l){return new Date(l.created_at).toDateString()===today;});
  var weekLeads=leads.filter(function(l){return new Date(l.created_at).getTime()>week;});

  var questions={};
  logs.forEach(function(l){if(l.visitor_message){var q=l.visitor_message.toLowerCase().trim();questions[q]=(questions[q]||0)+1;}});
  var topQ=Object.entries(questions).sort(function(a,b){return b[1]-a[1];}).slice(0,8);

  var days={};
  weekLogs.forEach(function(l){var d=new Date(l.created_at).toLocaleDateString("fi-FI",{weekday:"short",day:"numeric",month:"numeric"});days[d]=(days[d]||0)+1;});
  var maxDay=Math.max(...Object.values(days),1);

  return (<div style={S.sec}>
    <h2 style={S.sh}>Analytiikka</h2>
    <p style={S.sp}>Chatbotin käyttötilastot.</p>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:24}}>
      {[{label:"Tänään",chats:todayLogs.length,leads:todayLeads.length},{label:"7 päivää",chats:weekLogs.length,leads:weekLeads.length},{label:"30 päivää",chats:monthLogs.length,leads:leads.length}].map(function(s,i){return <div key={i} style={{background:"#12121e",borderRadius:12,border:"1px solid #1e1e30",padding:"16px"}}>
        <div style={{fontSize:11,color:"#888",textTransform:"uppercase",letterSpacing:0.5}}>{s.label}</div>
        <div style={{fontSize:28,fontWeight:700,color:"#fff",marginTop:4}}>{s.chats}</div>
        <div style={{fontSize:12,color:"#888"}}>keskustelua</div>
        <div style={{fontSize:18,fontWeight:600,color:"#4ade80",marginTop:8}}>{s.leads}</div>
        <div style={{fontSize:11,color:"#888"}}>liidiä</div>
      </div>;})}
    </div>

    <h3 style={{fontSize:15,fontWeight:600,color:"#fff",marginBottom:12}}>Keskustelut per päivä (7 pv)</h3>
    <div style={{display:"flex",gap:6,alignItems:"flex-end",height:120,marginBottom:24,background:"#12121e",borderRadius:12,border:"1px solid #1e1e30",padding:"16px 12px"}}>
      {Object.entries(days).map(function(d,i){return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
        <div style={{fontSize:11,color:"#fff",fontWeight:600}}>{d[1]}</div>
        <div style={{width:"100%",height:Math.max(d[1]/maxDay*80,4),background:"linear-gradient(180deg,#e8532e,#d4421a)",borderRadius:4}}></div>
        <div style={{fontSize:9,color:"#666"}}>{d[0]}</div>
      </div>;})}
      {Object.keys(days).length===0&&<div style={{color:"#666",fontSize:13,margin:"auto"}}>Ei vielä dataa</div>}
    </div>

    <h3 style={{fontSize:15,fontWeight:600,color:"#fff",marginBottom:12}}>Suosituimmat kysymykset</h3>
    {topQ.length===0?<p style={{color:"#666",fontSize:13}}>Ei vielä kysymyksiä.</p>:topQ.map(function(q,i){return <div key={i} style={{...S.card,justifyContent:"space-between"}}>
      <div style={{fontSize:13,color:"#e8e8f0",flex:1}}>{q[0]}</div>
      <div style={{fontSize:13,fontWeight:700,color:"#e8532e",minWidth:30,textAlign:"right"}}>{q[1]}x</div>
    </div>;})}
  </div>);
}
function TestChat({ bizId }) {
  const [msgs, setMsgs] = useState([{role:"assistant",text:"Hei! Kokeile chatbottiasi täällä."}]);
  const [inp, setInp] = useState("");
  const [busy, setBusy] = useState(false);
  const send = async () => {
    if(!inp.trim()||busy)return;
    var t=inp.trim();
    var nm=[...msgs,{role:"user",text:t}];
    setMsgs(nm);setInp("");setBusy(true);
    try{
      var hist=nm.filter(function(m,i){return i>0;}).map(function(m){return{role:m.role==="user"?"user":"assistant",content:m.text};});
      var r=await fetch("https://korjaamochat.vercel.app/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:t,businessId:bizId,history:hist.slice(-10)})});
      var d=await r.json();
      setMsgs(function(p){return[...p,{role:"assistant",text:d.reply||"Virhe"}];});
    }catch(e){setMsgs(function(p){return[...p,{role:"assistant",text:"Yhteysvirhe"}];});}
    setBusy(false);
  };
  return (<div style={S.sec}><h2 style={S.sh}>Testaa chatbottiasi</h2><p style={S.sp}>Kokeile miltä chatbottisi näyttää ja miten se vastaa asiakkaidesi kysymyksiin.</p>
    <div style={{background:"#12121e",borderRadius:16,border:"1px solid #1e1e30",overflow:"hidden",maxWidth:400}}>
      <div style={{background:"linear-gradient(135deg,#1a1a2e,#16213e)",padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
        <div style={{fontSize:20}}>🔧</div><div style={{color:"#fff",fontWeight:600,fontSize:14}}>Chatbot-esikatselu</div>
      </div>
      <div style={{padding:14,minHeight:300,maxHeight:400,overflowY:"auto",display:"flex",flexDirection:"column",gap:8}}>
        {msgs.map(function(m,i){return <div key={i} style={{alignSelf:m.role==="user"?"flex-end":"flex-start",maxWidth:"82%",padding:"10px 14px",borderRadius:14,fontSize:13,lineHeight:1.5,background:m.role==="user"?"linear-gradient(135deg,#e8532e,#d4421a)":"#1e1e32",color:m.role==="user"?"#fff":"#e0e0e0",borderBottomRightRadius:m.role==="user"?4:14,borderBottomLeftRadius:m.role==="user"?14:4}}>{m.text}</div>;})}
        {busy&&<div style={{alignSelf:"flex-start",padding:"12px 18px",background:"#1e1e32",borderRadius:14,borderBottomLeftRadius:4,color:"#888",fontSize:13}}>Kirjoittaa...</div>}
      </div>
      <div style={{padding:"10px 14px",borderTop:"1px solid #1e1e30",display:"flex",gap:8}}>
        <input value={inp} onChange={function(e){setInp(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter")send();}} placeholder="Kokeile kysyä jotain..." style={{flex:1,padding:"10px 12px",borderRadius:10,border:"1px solid #2a2a3a",background:"#0a0a14",color:"#fff",fontSize:13,outline:"none"}}/>
        <button onClick={send} disabled={busy} style={{padding:"10px 16px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#e8532e,#d4421a)",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>Lähetä</button>
      </div>
    </div>
    <div style={{marginTop:12,padding:"12px 16px",background:"#1a1a10",border:"1px solid #3a3a20",borderRadius:10,fontSize:13,color:"#c0c080",lineHeight:1.5}}>💡 Tämä on esikatselu. Kokeile kysymyksiä joita asiakkaasi kysyvät, ja täydennä palvelut ja FAQ:t jos botti ei osaa vastata.</div>
  </div>);
}
function Wdg({ bizId }) {
  const [cp, setCp] = useState(false);
  const code = '<script>window.KORJAAMOCHAT_ID="'+bizId+'";</script>\n<script src="https://korjaamochat.vercel.app/widget.js"></script>';
  return (<div style={S.sec}><h2 style={S.sh}>Asenna chatbot</h2><p style={S.sp}>Kopioi koodi sivujesi HTML:ään.</p><div style={{position:"relative",background:"#0a0a14",borderRadius:10,border:"1px solid #1e1e30",padding:16,marginBottom:12}}><pre style={{color:"#4ade80",fontSize:12,fontFamily:"monospace",margin:0,whiteSpace:"pre-wrap"}}>{code}</pre><button onClick={()=>{navigator.clipboard.writeText(code);setCp(true);setTimeout(()=>setCp(false),2000);}} style={{position:"absolute",top:10,right:10,padding:"6px 14px",borderRadius:6,border:"1px solid #3a3a4a",background:"#1e1e30",color:"#fff",fontSize:12,cursor:"pointer"}}>{cp?"✓ Kopioitu!":"Kopioi"}</button></div></div>);
}
function Admin({ token }) {
  const [bizs, setBizs] = useState([]);
  const [leads, setLeads] = useState([]);
  const [logs, setLogs] = useState([]);
  const [ld, setLd] = useState(true);
  const [view, setView] = useState("businesses");

  useEffect(() => {
    const load = async () => {
      const h = { "Content-Type": "application/json", "apikey": SB_KEY, "Authorization": "Bearer " + SB_KEY };
      const [b, l, c] = await Promise.all([
        fetch(SB_URL + "/rest/v1/businesses?order=created_at.desc", { headers: h }).then(r => r.json()),
        fetch(SB_URL + "/rest/v1/leads?order=created_at.desc&limit=100", { headers: h }).then(r => r.json()),
        fetch(SB_URL + "/rest/v1/chat_logs?order=created_at.desc&limit=100", { headers: h }).then(r => r.json())
      ]);
      if (Array.isArray(b)) setBizs(b);
      if (Array.isArray(l)) setLeads(l);
      if (Array.isArray(c)) setLogs(c);
      setLd(false);
    };
    load();
    const i = setInterval(() => { load(); }, 30000);
    return () => clearInterval(i);
  }, []);

  if (ld) return <p style={{color:"#999"}}>Ladataan admin-dataa...</p>;

  return (<div style={S.sec}>
    <div style={{display:"flex",gap:8,marginBottom:20}}>
      {[{id:"businesses",label:"Asiakkaat ("+bizs.length+")",icon:"🏪"},{id:"leads",label:"Liidit ("+leads.length+")",icon:"📞"},{id:"chats",label:"Keskustelut ("+logs.length+")",icon:"💬"}].map(t=>
        <button key={t.id} onClick={()=>setView(t.id)} style={{padding:"8px 16px",borderRadius:8,border:"1px solid "+(view===t.id?"#e8532e":"#2a2a3a"),background:view===t.id?"#1e1e30":"transparent",color:view===t.id?"#fff":"#888",fontSize:13,cursor:"pointer"}}>{t.icon} {t.label}</button>
      )}
    </div>

   {view==="businesses"&&<div>
      <h2 style={S.sh}>Kaikki asiakkaat</h2>
      {bizs.map(function(b){
        var usage = logs.filter(function(l){return l.business_id===b.id && new Date(l.created_at).getTime() > Date.now()-30*24*60*60*1000;}).length;
        var lim = b.message_limit || 500;
        var pct = Math.min(usage/lim*100, 100);
        return <div key={b.id} style={S.card}><div style={{flex:1}}>
          <div style={S.ct}>{b.name}</div>
          <div style={S.cm}>{b.address||"Ei osoitetta"} · {b.phone||"Ei puhelinta"} · {b.email||"Ei sähköpostia"}</div>
          <div style={{fontSize:11,color:"#555",marginTop:4}}>ID: {b.id}</div>
          <div style={{fontSize:11,color:"#555"}}>Luotu: {new Date(b.created_at).toLocaleString("fi-FI")}</div>
          <div style={{marginTop:10,padding:10,background:"#0a0a14",borderRadius:8}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:12}}>
              <span style={{color:"#888"}}>Käyttö 30pv:</span>
              <span style={{color:pct>=90?"#ff6b6b":pct>=70?"#eab308":"#4ade80",fontWeight:600}}>{usage} / {lim}</span>
            </div>
            <div style={{height:6,background:"#1e1e30",borderRadius:3,overflow:"hidden"}}>
              <div style={{width:pct+"%",height:"100%",background:pct>=90?"#ff6b6b":pct>=70?"#eab308":"#4ade80",transition:"width 0.3s"}}></div>
            </div>
            <div style={{display:"flex",gap:8,marginTop:10,alignItems:"center"}}>
              <span style={{fontSize:11,color:"#888"}}>Raja:</span>
              <input type="number" defaultValue={lim} onBlur={async function(e){var v=parseInt(e.target.value);if(v&&v!==lim){var r=await fetch("https://korjaamochat.vercel.app/api/admin",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"update_business",businessId:b.id,data:{message_limit:v},userToken:token})});var rd=await r.json();if(rd.ok){e.target.style.borderColor="#4ade80";setTimeout(function(){e.target.style.borderColor="#2a2a3a";},1500);}else{alert("Virhe: "+(rd.error||"Tuntematon"));}}}} style={{padding:"4px 8px",borderRadius:6,border:"1px solid #2a2a3a",background:"#0a0a14",color:"#fff",fontSize:12,width:80,outline:"none"}}/>
              <span style={{fontSize:11,color:"#555"}}>viestiä/kk</span>
            </div>
          </div>
        </div></div>;
      })}
    </div>}

    {view==="leads"&&<div>
      <h2 style={S.sh}>Kaikki liidit</h2>
      {leads.length===0?<p style={{color:"#666"}}>Ei liidejä vielä.</p>:leads.map(l=>{
        var biz = bizs.find(function(b){return b.id===l.business_id;});
        return <div key={l.id} style={{...S.card,borderLeft:"3px solid #4ade80"}}><div>
          <div style={S.ct}>{l.name} — <a href={"tel:"+l.phone} style={{color:"#e8532e",textDecoration:"none"}}>{l.phone}</a></div>
          <div style={S.cm}>Korjaamo: {biz?biz.name:"Tuntematon"}</div>
          {l.message&&<div style={S.cm}>{l.message}</div>}
          <div style={{fontSize:11,color:"#555",marginTop:4}}>{new Date(l.created_at).toLocaleString("fi-FI")}</div>
        </div></div>;
      })}
    </div>}

    {view==="chats"&&<div>
      <h2 style={S.sh}>Kaikki keskustelut</h2>
      {logs.length===0?<p style={{color:"#666"}}>Ei keskusteluja vielä.</p>:logs.map(l=>{
        var biz = bizs.find(function(b){return b.id===l.business_id;});
        return <div key={l.id} style={S.card}><div>
          <div style={{fontSize:11,color:"#e8532e",marginBottom:4}}>{biz?biz.name:"Tuntematon"}</div>
          <div style={S.ct}>Asiakas: {l.visitor_message}</div>
          <div style={S.cm}>Botti: {l.bot_response}</div>
          <div style={{fontSize:11,color:"#555",marginTop:4}}>{new Date(l.created_at).toLocaleString("fi-FI")}</div>
        </div></div>;
      })}
    </div>}
  </div>);
}
function Logs({ bizId, token }) {
  const [ls, setLs] = useState([]); const [ld, setLd] = useState(true);
  useEffect(()=>{ const f=async()=>{const d=await sb.get("chat_logs",token,"business_id=eq."+bizId+"&order=created_at.desc&limit=50");if(Array.isArray(d))setLs(d);setLd(false);}; f(); },[bizId]);
  return (<div style={S.sec}><h2 style={S.sh}>Keskustelut</h2><p style={S.sp}>Chatbot-keskustelut asiakkaidesi kanssa.</p>{ld?<p style={{color:"#666"}}>Ladataan...</p>:ls.length===0?<div style={{textAlign:"center",padding:"40px 20px",color:"#666"}}><div style={{fontSize:32,marginBottom:8}}>💬</div><div>Ei vielä keskusteluja.</div></div>:ls.map(l=><div key={l.id} style={S.card}><div><div style={S.ct}>Asiakas: {l.visitor_message}</div><div style={S.cm}>Botti: {l.bot_response}</div><div style={{fontSize:11,color:"#555",marginTop:4}}>{new Date(l.created_at).toLocaleString("fi-FI")}</div></div></div>)}</div>);
}

export default function App() {
const [sess, setSess] = useState(null); const [biz, setBiz] = useState(null);
  const [tab, setTab] = useState("info"); const [ld, setLd] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
const [usage, setUsage] = useState(0);
  const loadBiz = async (tk, uid) => { setLd(true); const d = await sb.get("businesses",tk,"user_id=eq."+uid); if(Array.isArray(d)&&d.length>0){setBiz(d[0]); var monthAgo=new Date(Date.now()-30*24*60*60*1000).toISOString(); var r=await fetch(SB_URL+"/rest/v1/chat_logs?business_id=eq."+d[0].id+"&created_at=gte."+monthAgo+"&select=id",{headers:{"apikey":SB_KEY,"Authorization":"Bearer "+tk,"Prefer":"count=exact"}}); var c=parseInt(r.headers.get("content-range")?.split("/")[1]||"0"); setUsage(c);}else{const n=await sb.add("businesses",{user_id:uid,name:"Uusi korjaamo"},tk);if(Array.isArray(n)&&n.length>0)setBiz(n[0]);} setLd(false); };  const login = d => { setSess(d); loadBiz(d.access_token, d.user.id); };
  if (!sess) return <Auth onLogin={login}/>;
  if (ld||!biz) return <div style={S.aw}><p style={{color:"#999"}}>Ladataan...</p></div>;
var isAdmin = sess.user.email === ADMIN_EMAIL;
  const tabs = isAdmin ? [{id:"admin",label:"Admin",icon:"⚡"},{id:"info",label:"Tiedot",icon:"🏪"},{id:"services",label:"Palvelut",icon:"🔧"},{id:"faq",label:"FAQ",icon:"❓"},{id:"analytics",label:"Tilastot",icon:"📊"},{id:"leads",label:"Liidit",icon:"📞"},{id:"test",label:"Testaa",icon:"🧪"},{id:"widget",label:"Asennus",icon:"📋"},{id:"logs",label:"Keskustelut",icon:"💬"}] : [{id:"info",label:"Tiedot",icon:"🏪"},{id:"services",label:"Palvelut",icon:"🔧"},{id:"faq",label:"FAQ",icon:"❓"},{id:"analytics",label:"Tilastot",icon:"📊"},{id:"leads",label:"Liidit",icon:"📞"},{id:"test",label:"Testaa",icon:"🧪"},{id:"widget",label:"Asennus",icon:"📋"},{id:"logs",label:"Keskustelut",icon:"💬"}];
  return (<div style={{display:"flex",minHeight:"100vh",background:"#0a0a14",fontFamily:"'DM Sans',Arial,sans-serif",color:"#fff"}}><style>{".kc-sidebar{transform:translateX(-100%);transition:transform 0.2s}@media(min-width:768px){.kc-sidebar{transform:translateX(0)!important}.kc-main{margin-left:240px!important}.kc-menu-btn{display:none!important}}"}</style><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
    <div style={{width:240,background:"#12121e",borderRight:"1px solid #1e1e30",padding:"20px 16px",display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,bottom:0,zIndex:50,transform:menuOpen?"translateX(0)":"translateX(-100%)",transition:"transform 0.2s"}} className="kc-sidebar">
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}><span style={{fontSize:24}}>🔧</span><div><div style={{color:"#fff",fontWeight:700,fontSize:16}}>Korjaamochat</div><div style={{color:"#666",fontSize:11}}>Hallintapaneeli</div></div></div>
      <div style={{padding:12,background:"#1a1a2a",borderRadius:10,marginBottom:20}}><div style={{fontSize:13,fontWeight:600,color:"#fff"}}>{biz.name}</div><div style={{fontSize:11,color:"#888"}}>{sess.user.email}</div></div>
      <nav style={{display:"flex",flexDirection:"column",gap:4,flex:1}}>{tabs.map(t=><button key={t.id} onClick={()=>{setTab(t.id);setMenuOpen(false);}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,border:"none",background:tab===t.id?"#1e1e30":"transparent",color:tab===t.id?"#fff":"#888",fontSize:14,cursor:"pointer",textAlign:"left",fontFamily:"'DM Sans',Arial,sans-serif"}}><span>{t.icon}</span><span>{t.label}</span></button>)}</nav>
      <button onClick={()=>{setSess(null);setBiz(null);}} style={{padding:10,borderRadius:8,border:"1px solid #2a2a3a",background:"transparent",color:"#666",fontSize:13,cursor:"pointer"}}>Kirjaudu ulos</button>
    </div>
    <div style={{flex:1,marginLeft:0}} className="kc-main">
{biz && usage >= (biz.message_limit||500)*0.9 && (<div style={{padding:"12px 20px",background:usage>=(biz.message_limit||500)?"#2a1015":"#2a2015",borderBottom:"1px solid "+(usage>=(biz.message_limit||500)?"#5a2030":"#5a4020"),display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:18}}>{usage>=(biz.message_limit||500)?"🚫":"⚠️"}</span>
        <div style={{flex:1,fontSize:13,color:usage>=(biz.message_limit||500)?"#ff6b6b":"#eab308"}}>
          {usage>=(biz.message_limit||500)?<><strong>Viestiraja täynnä!</strong> Chatbot ei vastaa enää asiakkaille tässä kuussa. Ota yhteyttä lisärajan saamiseksi.</>:<><strong>Viestiraja lähes täynnä:</strong> {usage}/{biz.message_limit||500} viestiä käytetty tässä kuussa.</>}
        </div>
      </div>)}
<div style={{padding:"20px 24px",borderBottom:"1px solid #1e1e30",display:"flex",alignItems:"center",gap:12}}><button onClick={()=>setMenuOpen(!menuOpen)} style={{background:"#1e1e30",border:"1px solid #2a2a3a",color:"#fff",borderRadius:8,padding:"8px 12px",fontSize:18,cursor:"pointer"}} className="kc-menu-btn">☰</button><h1 style={{fontSize:20,fontWeight:700,margin:0}}>{tabs.find(t=>t.id===tab)?.icon} {tabs.find(t=>t.id===tab)?.label}</h1></div>
      <div style={{padding:24}}>
{tab==="admin"&&isAdmin&&<Admin token={sess.access_token}/>}
        {tab==="info"&&<BizForm biz={biz} token={sess.access_token} onSave={()=>loadBiz(sess.access_token,sess.user.id)}/>}
        {tab==="services"&&<Svc bizId={biz.id} token={sess.access_token}/>}
        {tab==="faq"&&<Faq bizId={biz.id} token={sess.access_token}/>}
        {tab==="analytics"&&<Analytics bizId={biz.id} token={sess.access_token}/>}
{tab==="leads"&&<Leads bizId={biz.id} token={sess.access_token}/>}
{tab==="test"&&<TestChat bizId={biz.id}/>}
        {tab==="widget"&&<Wdg bizId={biz.id}/>}        {tab==="logs"&&<Logs bizId={biz.id} token={sess.access_token}/>}
      </div>
    </div>
  </div>);
}

const S = {
  aw:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0a0a14",fontFamily:"'DM Sans',Arial,sans-serif",padding:20},
  ab:{background:"#12121e",borderRadius:20,padding:"40px 32px",width:"100%",maxWidth:400,textAlign:"center",border:"1px solid #1e1e30"},
  ah:{color:"#fff",fontSize:24,fontWeight:700,margin:"8px 0"},
  ap:{color:"#888",fontSize:14,margin:"0 0 24px",lineHeight:1.5},
  er:{background:"#2a1015",border:"1px solid #5a2030",color:"#ff6b6b",padding:"10px 14px",borderRadius:10,fontSize:13,marginBottom:16,textAlign:"left"},
  inp:{width:"100%",padding:"12px 14px",borderRadius:10,border:"1px solid #2a2a3a",background:"#0a0a14",color:"#fff",fontSize:14,marginBottom:12,outline:"none",fontFamily:"'DM Sans',Arial,sans-serif"},
  is:{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #2a2a3a",background:"#0a0a14",color:"#fff",fontSize:13,marginBottom:8,outline:"none",fontFamily:"'DM Sans',Arial,sans-serif"},
  btn:{width:"100%",padding:12,borderRadius:10,border:"none",background:"linear-gradient(135deg,#e8532e,#d4421a)",color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',Arial,sans-serif",marginTop:4},
  lnk:{background:"none",border:"none",color:"#e8532e",fontSize:13,cursor:"pointer",marginTop:16,fontFamily:"'DM Sans',Arial,sans-serif",display:"block"},
  lbl:{display:"block",color:"#aaa",fontSize:12,fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:0.5},
  sec:{maxWidth:640},sh:{fontSize:18,fontWeight:700,margin:"0 0 6px"},sp:{color:"#888",fontSize:13,margin:"0 0 20px",lineHeight:1.5},
  card:{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"#12121e",borderRadius:10,border:"1px solid #1e1e30",marginBottom:8},
  ct:{fontSize:14,fontWeight:600,color:"#fff"},cm:{fontSize:12,color:"#888",marginTop:3,lineHeight:1.4},
  dl:{background:"none",border:"none",color:"#666",fontSize:16,cursor:"pointer",padding:"4px 8px"},
  abox:{padding:16,background:"#0f0f1a",borderRadius:10,border:"1px dashed #2a2a3a"},
  abtn:{padding:"10px 20px",borderRadius:8,border:"1px dashed #3a3a4a",background:"transparent",color:"#e8532e",fontSize:13,fontWeight:600,cursor:"pointer",marginTop:4}
};
