const app = document.getElementById("app");

// ---------- SAFE STATE ----------
const today = new Date().toISOString().slice(0,10);

function getState(){
  try {
    return JSON.parse(localStorage.getItem("carely_final")) || null;
  } catch {
    return null;
  }
}

let state = getState() || {
  date: today,
  page: "home",
  score: 0,
  streak: 0,
  habits: {
    workout:false,
    steps:false,
    diet:false,
    grooming:false,
    posture:false
  },
  history: [],
  foods: [],
  photos: []
};

function save(){
  localStorage.setItem("carely_final", JSON.stringify(state));
}

// ---------- DAILY RESET ----------
if(state.date !== today){
  const done = Object.values(state.habits).filter(Boolean).length;
  const percent = Math.round((done/5)*100);

  state.history.push({date:state.date,score:percent});
  if(state.history.length>60) state.history.shift();

  state.streak = percent >= 70 ? state.streak + 1 : 0;

  state.date = today;
  state.score = 0;
  state.foods = [];

  Object.keys(state.habits).forEach(k=>state.habits[k]=false);
  save();
}

// ---------- CONFIG ----------
const habits = {
  workout:{label:"Workout",points:20},
  steps:{label:"Steps",points:10},
  diet:{label:"Diet",points:25},
  grooming:{label:"Grooming",points:10},
  posture:{label:"Posture",points:10}
};

// ---------- RENDER ----------
function render(){
  if(!app) return;

  app.innerHTML = `
    <div style="min-height:100vh;padding-bottom:90px;color:white;
    background:linear-gradient(135deg,#020617,#0f172a,#1e293b)">

      ${header()}
      ${page()}
      ${nav()}

    </div>
  `;
  bindEvents();
}

// ---------- HEADER ----------
function header(){
  return `
    <div style="padding:16px">
      <div style="padding:16px;border-radius:18px;
      background:rgba(255,255,255,0.08)">

        <div style="display:flex;justify-content:space-between">
          <div>Score</div>
          <div style="color:#22c55e">${state.score}</div>
        </div>

        <div style="background:#374151;height:6px;border-radius:6px;margin-top:8px">
          <div style="background:#22c55e;height:6px;border-radius:6px;width:${state.score}%"></div>
        </div>

        <div style="font-size:12px;margin-top:8px">
          🔥 ${state.streak} day streak
        </div>

      </div>
    </div>
  `;
}

// ---------- HOME ----------
function home(){
  return `
    <div style="padding:16px">

      <div style="margin-bottom:10px">Today's Tasks</div>

      ${Object.keys(habits).map(k=>`
        <div class="habit" data-habit="${k}"
        style="padding:12px;margin-bottom:8px;border-radius:12px;
        background:${state.habits[k]?'rgba(34,197,94,0.3)':'rgba(255,255,255,0.08)'}">

        ${habits[k].label} (+${habits[k].points})
        </div>
      `).join("")}

      ${calendarStrip()}
      ${weeklyReport()}
      ${photoSection()}

    </div>
  `;
}

// ---------- CALENDAR ----------
function calendarStrip(){
  const last7 = state.history.slice(-7);

  return `
    <div style="display:flex;gap:6px;margin-top:16px">
      ${last7.map(d=>`
        <div style="flex:1;padding:6px;text-align:center;
        border-radius:8px;
        background:${d.score>=70?'#22c55e':'#374151'}">
        ${new Date(d.date).getDate()}
        </div>
      `).join("")}
    </div>
  `;
}

// ---------- WEEKLY REPORT ----------
function weeklyReport(){
  const last7 = state.history.slice(-7);
  if(last7.length===0) return "";

  const avg = Math.round(last7.reduce((a,b)=>a+b.score,0)/last7.length);

  return `
    <div style="margin-top:16px;padding:12px;border-radius:12px;background:rgba(255,255,255,0.08)">
      Weekly Avg: ${avg}%<br/>
      ${avg>70?"🔥 Strong":"⚠ Improve consistency"}
    </div>
  `;
}

// ---------- PHOTOS ----------
function photoSection(){
  return `
    <div style="margin-top:16px">
      <div>Progress Photos</div>
      <input type="file" id="photoInput"/>

      <div style="display:flex;gap:8px;margin-top:8px;overflow:auto">
        ${state.photos.map(p=>`
          <img src="${p}" style="height:70px;border-radius:10px"/>
        `).join("")}
      </div>
    </div>
  `;
}

// ---------- PAGES ----------
function page(){
  switch(state.page){
    case "home": return home();
    case "meals": return section("Meals");
    case "fitness": return section("Fitness");
    case "grooming": return section("Grooming");
    case "mind": return section("Posture & Confidence");
    default: return home();
  }
}

function section(title){
  return `<div style="padding:16px">${title}</div>`;
}

// ---------- NAV ----------
function nav(){
  return `
    <div style="position:fixed;bottom:0;width:100%;
    display:flex;justify-content:space-around;
    background:rgba(0,0,0,0.7);padding:10px">

      ${navItem("home","🏠")}
      ${navItem("meals","🍽")}
      ${navItem("fitness","🏋️")}
      ${navItem("grooming","🧴")}
      ${navItem("mind","🧠")}

    </div>
  `;
}

function navItem(p,icon){
  return `
    <div class="nav" data-page="${p}"
    style="font-size:20px;opacity:${state.page===p?1:0.5}">
    ${icon}
    </div>
  `;
}

// ---------- EVENTS ----------
function bindEvents(){

  app.onclick = (e)=>{

    if(e.target.dataset.page){
      state.page = e.target.dataset.page;
      save(); render();
    }

    if(e.target.dataset.habit){
      const k = e.target.dataset.habit;
      const h = habits[k];

      state.habits[k] = !state.habits[k];
      state.score += state.habits[k]?h.points:-h.points;
      state.score = Math.max(0,Math.min(100,state.score));

      save(); render();
    }
  };

  const input = document.getElementById("photoInput");
  if(input){
    input.onchange = ()=>{
      const file = input.files[0];
      if(!file) return;

      const reader = new FileReader();
      reader.onload = e=>{
        state.photos.push(e.target.result);
        save(); render();
      };
      reader.readAsDataURL(file);
    };
  }
}

// ---------- INIT ----------
render();
