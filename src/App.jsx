import { useState, useEffect, useRef, useCallback } from "react";

const PRESET_COLORS = [
  "#00FFB2", "#FF6B6B", "#A78BFA", "#38BDF8",
  "#FBBF24", "#F472B6", "#FB923C", "#34D399",
  "#E879F9", "#67E8F9", "#FCA5A5", "#86EFAC",
];

function hexToGlow(hex) {
  try {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},0.4)`;
  } catch { return "rgba(0,255,178,0.4)"; }
}

// ── Fireworks ────────────────────────────────────────────────
function Fireworks({ onDone }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = [];
    const cols = ["#00FFB2","#FF6B6B","#A78BFA","#FBBF24","#F472B6","#38BDF8","#fff","#FB923C"];
    const burst = (x, y) => {
      const c = cols[Math.floor(Math.random()*cols.length)];
      for (let i = 0; i < 60; i++) {
        const a = (Math.PI*2*i)/60, s = 2+Math.random()*5;
        particles.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s, alpha:1, size:2+Math.random()*3, color:c, decay:0.012+Math.random()*0.01 });
      }
    };
    let launches = 0;
    const iv = setInterval(() => {
      burst(80+Math.random()*(canvas.width-160), 60+Math.random()*(canvas.height*0.55));
      if(++launches >= 14) clearInterval(iv);
    }, 260);
    let raf;
    const draw = () => {
      ctx.fillStyle = "rgba(10,10,15,0.18)";
      ctx.fillRect(0,0,canvas.width,canvas.height);
      for(let i = particles.length-1; i >= 0; i--){
        const p = particles[i];
        p.x+=p.vx; p.y+=p.vy; p.vy+=0.07; p.alpha-=p.decay; p.vx*=0.98; p.vy*=0.98;
        if(p.alpha<=0){ particles.splice(i,1); continue; }
        ctx.save(); ctx.globalAlpha=p.alpha; ctx.fillStyle=p.color;
        ctx.shadowBlur=8; ctx.shadowColor=p.color;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill(); ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    const t = setTimeout(()=>{ clearInterval(iv); cancelAnimationFrame(raf); onDone(); }, 4500);
    return ()=>{ clearInterval(iv); cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);
  return (
    <div style={{ position:"fixed",inset:0,zIndex:9999,pointerEvents:"none" }}>
      <canvas ref={canvasRef} style={{ position:"absolute",inset:0 }} />
      <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:"12px" }}>
        <div style={{ fontFamily:"'Fredoka One',cursive",fontSize:"clamp(28px,7vw,60px)",color:"#fff",textAlign:"center",textShadow:"0 0 40px #00FFB2, 0 0 80px #A78BFA",animation:"popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>
          Course Complete! 🎉
        </div>
        <div style={{ fontFamily:"'Space Mono',monospace",fontSize:"13px",color:"#00FFB2",letterSpacing:"0.15em",textTransform:"uppercase",textShadow:"0 0 20px #00FFB2" }}>
          100% — You crushed it
        </div>
      </div>
    </div>
  );
}

// ── Color Picker ─────────────────────────────────────────────
function ColorPicker({ currentColor, onChange, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if(ref.current && !ref.current.contains(e.target)) onClose(); };
    setTimeout(()=>document.addEventListener("pointerdown",h),0);
    return ()=>document.removeEventListener("pointerdown",h);
  }, []);
  return (
    <div ref={ref} style={{ position:"absolute",top:"calc(100% + 8px)",right:0,zIndex:200,background:"#13131a",border:"1px solid rgba(255,255,255,0.14)",borderRadius:"14px",padding:"16px",boxShadow:"0 12px 40px rgba(0,0,0,0.6)",width:"204px" }}>
      <div style={{ fontFamily:"'Space Mono',monospace",fontSize:"10px",color:"#555",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"12px" }}>Pick color</div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:"8px",marginBottom:"12px" }}>
        {PRESET_COLORS.map(c=>(
          <div key={c} onClick={()=>{ onChange(c); onClose(); }}
            style={{ width:"24px",height:"24px",borderRadius:"6px",background:c,cursor:"pointer",border:c===currentColor?"2px solid #fff":"2px solid transparent",boxShadow:c===currentColor?`0 0 8px ${c}`:"none",transition:"transform 0.15s" }}
            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.2)"}
            onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"} />
        ))}
      </div>
      <div style={{ display:"flex",alignItems:"center",gap:"8px" }}>
        <input type="color" value={currentColor} onChange={e=>onChange(e.target.value)}
          style={{ width:"32px",height:"28px",border:"none",background:"none",cursor:"pointer",borderRadius:"4px",padding:0 }} />
        <span style={{ fontFamily:"'Space Mono',monospace",fontSize:"11px",color:"#666" }}>Custom</span>
      </div>
    </div>
  );
}

// ── Touch Slider ─────────────────────────────────────────────
function TouchSlider({ value, max, color, onChange }) {
  const trackRef = useRef(null);
  const dragging = useRef(false);
  const pct = max>0 ? Math.min(100,(value/max)*100) : 0;
  const getVal = useCallback((clientX)=>{
    const rect = trackRef.current.getBoundingClientRect();
    return Math.round(Math.max(0,Math.min(1,(clientX-rect.left)/rect.width))*max);
  },[max]);
  return (
    <div ref={trackRef}
      onPointerDown={e=>{ dragging.current=true; e.currentTarget.setPointerCapture(e.pointerId); onChange(getVal(e.clientX)); }}
      onPointerMove={e=>{ if(dragging.current) onChange(getVal(e.clientX)); }}
      onPointerUp={()=>{ dragging.current=false; }}
      onPointerCancel={()=>{ dragging.current=false; }}
      style={{ position:"relative",height:"40px",display:"flex",alignItems:"center",cursor:"pointer",userSelect:"none",touchAction:"none" }}>
      <div style={{ position:"absolute",left:0,right:0,height:"10px",background:"rgba(255,255,255,0.06)",borderRadius:"999px",border:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ position:"absolute",left:0,top:0,bottom:0,width:`${pct}%`,borderRadius:"999px",background:`linear-gradient(90deg,${color}88,${color})`,boxShadow:`0 0 12px ${hexToGlow(color)}`,transition:"width 0.04s" }} />
      </div>
      <div style={{ position:"absolute",left:`calc(${pct}% - 11px)`,width:"22px",height:"22px",borderRadius:"50%",background:"#fff",boxShadow:`0 0 14px ${color},0 2px 8px rgba(0,0,0,0.5)`,border:`2px solid ${color}`,transition:"left 0.04s",zIndex:2,pointerEvents:"none" }} />
    </div>
  );
}

// ── Animated Bar ─────────────────────────────────────────────
function AnimatedBar({ pct, color }) {
  const [d, setD] = useState(0);
  useEffect(()=>{ const t=setTimeout(()=>setD(pct),80); return()=>clearTimeout(t); },[pct]);
  return (
    <div style={{ position:"relative",height:"12px",background:"rgba(255,255,255,0.06)",borderRadius:"999px",overflow:"hidden",border:"1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ position:"absolute",left:0,top:0,bottom:0,width:`${d}%`,background:`linear-gradient(90deg,${color}88,${color})`,borderRadius:"999px",boxShadow:`0 0 16px ${hexToGlow(color)},0 0 4px ${color}`,transition:"width 0.9s cubic-bezier(0.34,1.56,0.64,1)" }} />
      {d>6 && <div style={{ position:"absolute",right:`${100-d+1}%`,top:"50%",transform:"translateY(-50%)",width:"6px",height:"6px",borderRadius:"50%",background:"#fff",boxShadow:`0 0 8px ${color}`,transition:"right 0.9s cubic-bezier(0.34,1.56,0.64,1)" }} />}
    </div>
  );
}

// ── Course Card ──────────────────────────────────────────────
function CourseCard({ course, onUpdate, onDelete, onComplete }) {
  const color = course.color || "#00FFB2";
  const pct = course.totalHours>0 ? Math.min(100,Math.round((course.completedHours/course.totalHours)*100)) : 0;
  const remaining = Math.max(0, course.totalHours - course.completedHours);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name:course.name, totalHours:course.totalHours, completedHours:course.completedHours, color });
  const [showPicker, setShowPicker] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const prevPct = useRef(pct);

  useEffect(()=>{ if(prevPct.current<100 && pct===100) onComplete(); prevPct.current=pct; },[pct]);

  const save = () => {
    const t = Math.max(1,Number(draft.totalHours)||1);
    const c = Math.min(t,Math.max(0,Number(draft.completedHours)||0));
    onUpdate({...course, name:draft.name||course.name, totalHours:t, completedHours:c, color:draft.color});
    setEditing(false);
  };

  const updateCompleted = (val) => onUpdate({...course, completedHours:Math.min(course.totalHours,Math.max(0,Math.round(val)))});

  const [localDone, setLocalDone] = useState(String(course.completedHours));
  const [localTotal, setLocalTotal] = useState(String(course.totalHours));
  const doneFocused = useRef(false);
  const totalFocused = useRef(false);
  useEffect(()=>{ if(!doneFocused.current) setLocalDone(String(course.completedHours)); },[course.completedHours]);
  useEffect(()=>{ if(!totalFocused.current) setLocalTotal(String(course.totalHours)); },[course.totalHours]);

  const commitDone = () => {
    const v = Math.min(course.totalHours,Math.max(0,Number(localDone)||0));
    setLocalDone(String(v)); updateCompleted(v);
  };
  const commitTotal = () => {
    const v = Math.max(1,Number(localTotal)||1);
    setLocalTotal(String(v)); onUpdate({...course, totalHours:v});
  };

  return (
    <div style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",padding:"18px 20px",position:"relative",boxShadow:"0 4px 24px rgba(0,0,0,0.3)" }}>
      <div style={{ position:"absolute",top:0,left:"20px",right:"20px",height:"2px",background:`linear-gradient(90deg,transparent,${color},transparent)`,borderRadius:"0 0 4px 4px",opacity:0.7 }} />

      {editing ? (
        <div style={{ display:"flex",flexDirection:"column",gap:"14px" }}>
          <div style={{ display:"flex",gap:"10px",alignItems:"flex-end" }}>
            <div style={{ flex:1 }}>
              <label style={labelStyle}>Course Name</label>
              <input value={draft.name} onChange={e=>setDraft(p=>({...p,name:e.target.value}))} placeholder="Course name" style={inputStyle} />
            </div>
            <div style={{ position:"relative",flexShrink:0 }}>
              <div onClick={()=>setShowPicker(v=>!v)} style={{ width:"42px",height:"42px",borderRadius:"10px",background:draft.color,cursor:"pointer",border:"2px solid rgba(255,255,255,0.2)",boxShadow:`0 0 14px ${hexToGlow(draft.color)}` }} />
              {showPicker && <ColorPicker currentColor={draft.color} onChange={c=>setDraft(p=>({...p,color:c}))} onClose={()=>setShowPicker(false)} />}
            </div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px" }}>
            <div><label style={labelStyle}>Total Hours</label><input type="number" min="1" value={draft.totalHours} onChange={e=>setDraft(p=>({...p,totalHours:e.target.value}))} style={inputStyle} /></div>
            <div><label style={labelStyle}>Hours Done</label><input type="number" min="0" value={draft.completedHours} onChange={e=>setDraft(p=>({...p,completedHours:e.target.value}))} style={inputStyle} /></div>
          </div>
          <div style={{ display:"flex",gap:"10px" }}>
            <button onClick={save} style={{ ...btnStyle,background:`${color}22`,border:`1px solid ${color}66`,color }}>Save</button>
            <button onClick={()=>setEditing(false)} style={{ ...btnStyle,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",color:"#888" }}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"16px" }}>
            <div>
              <div style={{ fontFamily:"'Space Mono',monospace",fontSize:"11px",color,letterSpacing:"0.12em",marginBottom:"6px",textTransform:"uppercase" }}>
                {pct===100 ? "✓ Complete" : `${remaining}h remaining`}
              </div>
              <div style={{ fontFamily:"'Fredoka One',cursive",fontSize:"22px",color:"#f0f0f0" }}>{course.name}</div>
            </div>
            <div style={{ fontFamily:"'Space Mono',monospace",fontSize:"28px",fontWeight:700,color,textShadow:`0 0 20px ${hexToGlow(color)}`,lineHeight:1,flexShrink:0,marginLeft:"12px" }}>
              {pct}<span style={{ fontSize:"14px",opacity:0.6 }}>%</span>
            </div>
          </div>

          <AnimatedBar pct={pct} color={color} />

          {pct < 100 && (
            <>
              <div style={{ marginTop:"16px" }}>
                <label style={labelStyle}>Slide to update progress</label>
                <TouchSlider value={course.completedHours} max={course.totalHours} color={color} onChange={updateCompleted} />
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginTop:"8px" }}>
                <div>
                  <label style={labelStyle}>Hours done</label>
                  <input type="number" min="0" max={course.totalHours} value={localDone}
                    onChange={e=>setLocalDone(e.target.value)}
                    onFocus={()=>{ doneFocused.current=true; setLocalDone(""); }}
                    onBlur={()=>{ doneFocused.current=false; commitDone(); }}
                    onKeyDown={e=>e.key==="Enter"&&e.currentTarget.blur()}
                    style={{ ...inputStyle,textAlign:"center" }} />
                </div>
                <div>
                  <label style={labelStyle}>Total hours</label>
                  <input type="number" min="1" value={localTotal}
                    onChange={e=>setLocalTotal(e.target.value)}
                    onFocus={()=>{ totalFocused.current=true; }}
                    onBlur={()=>{ totalFocused.current=false; commitTotal(); }}
                    onKeyDown={e=>e.key==="Enter"&&e.currentTarget.blur()}
                    style={{ ...inputStyle,textAlign:"center" }} />
                </div>
              </div>
            </>
          )}

          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"14px" }}>
            <div style={{ fontFamily:"'Space Mono',monospace",fontSize:"11px",color:"#444" }}>{course.completedHours}h / {course.totalHours}h</div>
            <div style={{ display:"flex",gap:"8px",alignItems:"center" }}>
              {confirmDelete ? (
                <>
                  <span style={{ fontFamily:"'Space Mono',monospace",fontSize:"10px",color:"#888" }}>Delete?</span>
                  <button onClick={()=>onDelete(course.id)} style={{ ...iconBtn,color:"#FF6B6B",border:"1px solid #FF6B6B44",padding:"4px 10px" }}>Yes</button>
                  <button onClick={()=>setConfirmDelete(false)} style={{ ...iconBtn,color:"#666",border:"1px solid #ffffff22",padding:"4px 10px" }}>No</button>
                </>
              ) : (
                <>
                  <button onClick={()=>{ setDraft({name:course.name,totalHours:course.totalHours,completedHours:course.completedHours,color}); setEditing(true); }} style={{ ...iconBtn,color:"#666" }}>✎ Edit</button>
                  <button onClick={()=>setConfirmDelete(true)} style={{ ...iconBtn,color:"#553" }}>✕</button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const inputStyle = { width:"100%",padding:"10px 14px",borderRadius:"8px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",color:"#f0f0f0",fontFamily:"'Space Mono',monospace",fontSize:"16px",outline:"none",boxSizing:"border-box" };
const labelStyle = { display:"block",fontFamily:"'Space Mono',monospace",fontSize:"10px",color:"#555",letterSpacing:"0.1em",marginBottom:"6px",textTransform:"uppercase" };
const btnStyle = { padding:"8px 18px",borderRadius:"8px",fontFamily:"'Space Mono',monospace",fontSize:"16px",cursor:"pointer",flex:1 };
const iconBtn = { background:"none",border:"none",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:"14px",padding:"4px 8px",borderRadius:"6px" };

const EMPTY_NEW = { name:"", totalHours:"", color:"#38BDF8" };
const STORAGE_KEY = "course-tracker-courses";

export default function App() {
  const [courses, setCourses] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [adding, setAdding] = useState(false);
  const [newCourse, setNewCourse] = useState(EMPTY_NEW);
  const [showNewPicker, setShowNewPicker] = useState(false);
  const [fireworks, setFireworks] = useState(false);

  // Persist to localStorage whenever courses change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(courses)); } catch {}
  }, [courses]);

  const openAdd = () => { setNewCourse(EMPTY_NEW); setAdding(true); };

  const addCourse = () => {
    const name = newCourse.name.trim();
    const hours = Number(newCourse.totalHours);
    if (!name || !hours || hours < 1) return;
    setCourses(p => [...p, { id: Date.now(), name, totalHours: hours, completedHours: 0, color: newCourse.color }]);
    setNewCourse(EMPTY_NEW);
    setAdding(false);
  };

  const totalPct = courses.length
    ? Math.round(courses.reduce((s,c)=>s+Math.min(c.completedHours/c.totalHours,1),0)/courses.length*100) : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Space+Mono:wght@400;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        input, button, select, textarea { font-size:16px !important; }
        body { background:#0a0a0f; max-width:100vw; overflow-x:hidden; -webkit-tap-highlight-color:transparent; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:#222; border-radius:4px; }
        input:focus { outline:none; border-color:rgba(255,255,255,0.25) !important; }
        input[type=number]::-webkit-inner-spin-button { opacity:0.3; }
        @keyframes popIn { from { opacity:0; transform:scale(0.5) translateY(30px); } to { opacity:1; transform:scale(1) translateY(0); } }
      `}</style>

      {fireworks && <Fireworks onDone={()=>setFireworks(false)} />}

      <div style={{ position:"fixed",inset:0,zIndex:0,background:"radial-gradient(ellipse 80% 60% at 50% -10%,#0d1a2e 0%,#0a0a0f 60%)",overflow:"hidden" }}>
        {[...Array(3)].map((_,i)=>(
          <div key={i} style={{ position:"absolute",borderRadius:"50%",background:`radial-gradient(circle,${["#00FFB244","#A78BFA22","#38BDF822"][i]} 0%,transparent 70%)`,width:["600px","400px","500px"][i],height:["600px","400px","500px"][i],top:["-200px","40%","20%"][i],left:["10%","70%","-5%"][i],filter:"blur(40px)",pointerEvents:"none" }} />
        ))}
      </div>

      <div style={{ position:"relative",zIndex:1,minHeight:"100vh",padding:"env(safe-area-inset-top, 28px) 16px env(safe-area-inset-bottom, 60px)",maxWidth:"600px",margin:"0 auto" }}>
        <div style={{ marginBottom:"28px", paddingTop:"28px" }}>
          <div style={{ fontFamily:"'Space Mono',monospace",fontSize:"10px",color:"#00FFB2",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:"8px" }}>dev progress</div>
          <h1 style={{ fontFamily:"'Fredoka One',cursive",fontSize:"clamp(28px,7vw,48px)",color:"#f0f0f0",lineHeight:1.1,textShadow:"3px 3px 0px rgba(0,255,178,0.15), 6px 6px 0px rgba(167,139,250,0.1)" }}>
            Road to Coding<br />Mastery
          </h1>
          {courses.length>0 && (
            <div style={{ marginTop:"24px",display:"flex",alignItems:"center",gap:"16px" }}>
              <div style={{ flex:1,height:"3px",background:"rgba(255,255,255,0.06)",borderRadius:"2px",overflow:"hidden" }}>
                <div style={{ height:"100%",width:`${totalPct}%`,background:"linear-gradient(90deg,#00FFB2,#38BDF8)",borderRadius:"2px",transition:"width 1s ease",boxShadow:"0 0 12px rgba(0,255,178,0.5)" }} />
              </div>
              <span style={{ fontFamily:"'Space Mono',monospace",fontSize:"12px",color:"#888",whiteSpace:"nowrap" }}>
                {totalPct}% · <span style={{ color:"#555" }}>{courses.filter(c=>c.completedHours>=c.totalHours).length}/{courses.length}</span>
              </span>
            </div>
          )}
        </div>

        <div style={{ display:"flex",flexDirection:"column",gap:"16px" }}>
          {courses.map(c=>(
            <CourseCard key={c.id} course={c}
              onUpdate={updated=>setCourses(p=>p.map(x=>x.id===updated.id?updated:x))}
              onDelete={id=>setCourses(p=>p.filter(x=>x.id!==id))}
              onComplete={()=>setFireworks(true)} />
          ))}

          {adding ? (
            <div style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px",padding:"18px 20px" }}>
              <div style={{ fontFamily:"'Fredoka One',cursive",fontSize:"20px",color:"#f0f0f0",marginBottom:"18px" }}>New Course</div>
              <div style={{ display:"flex",flexDirection:"column",gap:"14px" }}>
                <div style={{ display:"flex",gap:"10px",alignItems:"flex-end" }}>
                  <div style={{ flex:1 }}>
                    <label style={labelStyle}>Course Name</label>
                    <input value={newCourse.name} onChange={e=>setNewCourse(p=>({...p,name:e.target.value}))}
                      placeholder="e.g. Advanced Node.js" style={inputStyle}
                      onKeyDown={e=>e.key==="Enter"&&addCourse()} />
                  </div>
                  <div style={{ width:"88px" }}>
                    <label style={labelStyle}>Total Hrs</label>
                    <input type="number" min="1" value={newCourse.totalHours}
                      onChange={e=>setNewCourse(p=>({...p,totalHours:e.target.value}))}
                      placeholder="–" style={{ ...inputStyle,textAlign:"center" }} />
                  </div>
                  <div style={{ position:"relative",flexShrink:0 }}>
                    <div onClick={()=>setShowNewPicker(v=>!v)} title="Pick color"
                      style={{ width:"42px",height:"42px",borderRadius:"10px",background:newCourse.color,cursor:"pointer",border:"2px solid rgba(255,255,255,0.2)",boxShadow:`0 0 14px ${hexToGlow(newCourse.color)}` }} />
                    {showNewPicker && <ColorPicker currentColor={newCourse.color} onChange={c=>setNewCourse(p=>({...p,color:c}))} onClose={()=>setShowNewPicker(false)} />}
                  </div>
                </div>
                <div style={{ display:"flex",gap:"10px",marginTop:"4px" }}>
                  <button onClick={addCourse} style={{ ...btnStyle,background:"rgba(0,255,178,0.12)",border:"1px solid rgba(0,255,178,0.35)",color:"#00FFB2" }}>Add Course</button>
                  <button onClick={()=>setAdding(false)} style={{ ...btnStyle,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",color:"#666" }}>Cancel</button>
                </div>
              </div>
            </div>
          ) : (
            <button onClick={openAdd} style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:"10px",padding:"20px",borderRadius:"16px",cursor:"pointer",background:"transparent",border:"1px dashed rgba(255,255,255,0.12)",color:"#444",fontFamily:"'Space Mono',monospace",fontSize:"13px",width:"100%" }}>
              <span style={{ fontSize:"18px" }}>+</span> Add new course
            </button>
          )}
        </div>

        {courses.length===0 && !adding && (
          <div style={{ textAlign:"center",marginTop:"60px",color:"#333",fontFamily:"'Space Mono',monospace",fontSize:"12px" }}>
            No courses yet. Add one above.
          </div>
        )}
      </div>
    </>
  );
}
