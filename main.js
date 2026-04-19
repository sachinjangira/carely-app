const app = document.getElementById("app");

const STORAGE = "carely_elite_v2";
const today = new Date().toISOString().slice(0,10);

// ---------- STATE ----------
let state = JSON.parse(localStorage.getItem(STORAGE)) || {
  date: today,
  page: "home",
  score: 0,
  streak: 0,
  xp: 0,
  level: 1,
  habits: {
    workout:false,
    steps:false,
    diet:false,
    grooming:false,
    posture:false
  },
  history: [],
  photos: []
};

function save(){
  localStorage.setItem(STORAGE, JSON.stringify(state));
}

// ---------- RESET ----------
if(state.date !== today){
  state.history.push({date:state.date,score:state.score});
  if(state.history.length>30) state.history.shift();

  if(state.score >= 60) state.streak++;
  else state.streak = 0;

  state.date = today;
  state.score = 0;
  Object.keys(state.habits).forEach(k=>state.habits[k]=false);

  save();
}

// ---------- LEVEL ----------
function updateLevel(){
  state.level = Math.floor(state.xp / 100) + 1;
  return state.xp % 100;
}

// ---------- HEADER ----------
function header(){
  const xpProgress = updateLevel();

  return `
  <div style="padding:16px">
    <div style="
      padding:18px;
      border-radius:20px;
      background:linear-gradient(135deg,#1e293b,#0f172a)
    ">
      <div style="display:flex;justify-content:space-between">
        <div>Level ${state.level}</div>
        <div style="color:#22c55e">${state.score}</div>
      </div>

      <div style="margin-top:10px;height:8px;background:#1e293b;border-radius:10px">
        <div style="
          height:8px;
          width:${xpProgress}%;
          background:#22c55e;
          border-radius:10px
        "></div>
      </div>

      <div style="margin-top:8px;font-size:12px">
        🔥 ${state.streak} • ⚡ ${state.xp} XP
      </div>
    </div>
  </div>`;
}

// ---------- HOME ----------
function home(){
  return `
  <div style="padding:16px">

    ${calendar()}

    <div style="margin-top:16px">Today's Execution</div>

    ${task("Workout","workout",15)}
    ${task("Steps","steps",10)}
    ${task("Diet","diet",20)}
    ${task("Grooming","grooming",5)}
    ${task("Posture","posture",5)}

    ${ai()}

  </div>`;
}

// ---------- TASK ----------
function task(label,key,xp){
  return `
  <div data-habit="${key}" data-xp="${xp}"
  style="
    margin-top:10px;
    padding:14px;
    border-radius:14px;
    background:${state.habits[key]?'#22c55e':'#1e293b'}
  ">
    ${label} (+${xp} XP)
  </div>`;
}

// ---------- AI ----------
function ai(){
  if(!state.habits.diet)
    return box("⚡ Fix diet first. Fastest visible change.");

  if(!state.habits.workout)
    return box("⚡ Add quick workout.");

  if(!state.habits.posture)
    return box("⚡ Fix posture = instant confidence boost.");

  return box("🔥 Strong day. Keep momentum.");
}

function box(t){
  return `<div style="margin-top:14px;padding:14px;background:#334155;border-radius:12px">${t}</div>`;
}

// ---------- CALENDAR ----------
function calendar(){
  let grid="";
  for(let i=6;i>=0;i--){
    const d=new Date();
    d.setDate(d.getDate()-i);

    grid+=`
    <div style="text-align:center">
      <div style="font-size:11px">${d.getDate()}</div>
      <div style="width:12px;height:12px;background:#1e293b;margin:auto"></div>
    </div>`;
  }

  return `
  <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">
    ${grid}
  </div>`;
}

// ---------- MEALS ----------
function meals(){
  return `
  <div style="padding:16px">
    ${card("Breakfast","Sattu + Roti")}
    ${card("Lunch","Roti + Sabzi")}
    ${card("Dinner","Dal + Light Roti")}
  </div>`;
}

// ---------- FITNESS ----------
function fitness(){
  return `
  <div style="padding:16px">
    ${card("Pushups","3x10")}
    ${card("Squats","3x15")}
    ${card("Plank","30 sec")}
  </div>`;
}

// ---------- GROOMING ----------
function grooming(){
  return `
  <div style="padding:16px">
    ${card("Beard","Trim weekly")}
    ${card("Hair","Clean sides + volume top")}
    ${card("Skin","Face wash + sunscreen")}
  </div>`;
}

// ---------- POSTURE ----------
function mind(){
  return `
  <div style="padding:16px">
    ${card("Posture","Straight spine + chin tuck")}
    ${card("Confidence","Slow speech + eye contact")}
  </div>`;
}

// ---------- PROGRESS ----------
function progress(){
  return `
  <div style="padding:16px">

    <input type="file" id="photoInput"/>

    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">
      ${state.photos.map(p=>`
        <img src="${p}" style="width:80px;height:80px;border-radius:10px"/>
      `).join("")}
    </div>

    ${weekly()}

  </div>`;
}

// ---------- WEEKLY ----------
function weekly(){
  const last7 = state.history.slice(-7);
  if(last7.length===0) return "";

  const avg = Math.round(last7.reduce((a,b)=>a+b.score,0)/last7.length);

  return `
  <div style="margin-top:20px;padding:12px;background:#1e293b;border-radius:12px">
    📊 Avg: ${avg}
  </div>`;
}

// ---------- CARD ----------
function card(t,v){
  return `
  <div style="margin-top:10px;padding:14px;border-radius:12px;background:#1e293b">
    <b>${t}</b><br>${v}
  </div>`;
}

// ---------- NAV ----------
function nav(){
  return `
  <div style="
    position:fixed;
    bottom:10px;
    left:10px;
    right:10px;
    display:flex;
    justify-content:space-around;
    padding:14px;
    border-radius:20px;
    background:#020617
  ">
    ${navItem("home","🏠")}
    ${navItem("meals","🍽")}
    ${navItem("fitness","🏋️")}
    ${navItem("grooming","🧴")}
    ${navItem("mind","🧠")}
    ${navItem("progress","📈")}
  </div>`;
}

function navItem(p,i){
  return `
  <div data-page="${p}"
  style="color:${state.page===p?'#22c55e':'#64748b'}">
    ${i}
  </div>`;
}

// ---------- ROUTER ----------
function screen(){
  if(state.page==="home") return home();
  if(state.page==="meals") return meals();
  if(state.page==="fitness") return fitness();
  if(state.page==="grooming") return grooming();
  if(state.page==="mind") return mind();
  if(state.page==="progress") return progress();
}

// ---------- EVENTS ----------
function bind(){
  app.onclick=e=>{
    const t=e.target.closest("[data-page],[data-habit]");
    if(!t) return;

    if(t.dataset.page){
      state.page=t.dataset.page;
      save(); render();
    }

    if(t.dataset.habit){
      const k=t.dataset.habit;
      const xp=parseInt(t.dataset.xp);

      state.habits[k]=!state.habits[k];
      state.score += state.habits[k]?10:-10;
      state.xp += state.habits[k]?xp:-xp;

      save(); render();
    }
  };

  const input=document.getElementById("photoInput");
  if(input){
    input.onchange=e=>{
      const file=e.target.files[0];
      const reader=new FileReader();
      reader.onload=()=>{
        state.photos.push(reader.result);
        save(); render();
      };
      reader.readAsDataURL(file);
    };
  }
}

// ---------- INIT ----------
function render(){
  app.innerHTML = `
  <div style="min-height:100vh;background:#020617;color:white">
    ${header()}
    ${screen()}
    ${nav()}
  </div>`;
  bind();
}

render();
