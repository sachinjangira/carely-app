const app = document.getElementById("app");
const today = new Date().toISOString().slice(0,10);

// ---------- STATE ----------
let state = JSON.parse(localStorage.getItem("carely_pro")) || {
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
  localStorage.setItem("carely_pro", JSON.stringify(state));
}

// ---------- RESET ----------
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

// ---------- ICONS ----------
const icons = {
  home:`<svg viewBox="0 0 24 24" fill="none"><path d="M3 10L12 3l9 7v9a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="2"/></svg>`,
  meal:`<svg viewBox="0 0 24 24" fill="none"><path d="M3 3h18v18H3z" stroke="currentColor" stroke-width="2"/></svg>`,
  gym:`<svg viewBox="0 0 24 24"><path d="M2 12h20" stroke="currentColor" stroke-width="2"/></svg>`,
  grooming:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2"/></svg>`,
  mind:`<svg viewBox="0 0 24 24"><path d="M12 2v20" stroke="currentColor" stroke-width="2"/></svg>`
};

// ---------- HABITS ----------
const habits = {
  workout:{label:"Workout",points:20},
  steps:{label:"Steps",points:10},
  diet:{label:"Diet",points:25},
  grooming:{label:"Grooming",points:10},
  posture:{label:"Posture",points:10}
};

// ---------- RENDER ----------
function render(){
  app.innerHTML = `
  <div style="min-height:100vh;padding-bottom:100px;
  background:radial-gradient(circle at top,#1e293b,#020617);
  font-family:system-ui;color:white">

    ${header()}
    ${page()}
    ${nav()}

  </div>`;
  bindEvents();
}

// ---------- HEADER ----------
function header(){
  return `
  <div style="padding:20px">
    <div style="padding:18px;border-radius:22px;
    background:rgba(255,255,255,0.08);
    box-shadow:0 20px 40px rgba(0,0,0,0.4)">

      <div style="display:flex;justify-content:space-between">
        <div style="font-size:18px">Score</div>
        <div style="color:#22c55e;font-weight:700">${state.score}</div>
      </div>

      <div style="height:6px;background:#334155;border-radius:6px;margin-top:10px">
        <div style="height:6px;background:#22c55e;border-radius:6px;width:${state.score}%"></div>
      </div>

      <div style="margin-top:10px;font-size:13px;opacity:0.8">
        🔥 ${state.streak} day streak
      </div>

    </div>
  </div>`;
}

// ---------- HOME ----------
function home(){
  return `
  <div style="padding:16px">

    ${graph()}

    <div style="margin-top:14px;font-size:14px;opacity:0.6">Today's Tasks</div>

    ${Object.keys(habits).map(k=>`
      <div class="habit" data-habit="${k}"
      style="padding:16px;margin-top:10px;border-radius:16px;
      background:${state.habits[k]?'linear-gradient(135deg,#22c55e,#16a34a)':'rgba(255,255,255,0.06)'};
      box-shadow:0 10px 25px rgba(0,0,0,0.3);
      transition:0.2s">

      ${habits[k].label}
      <span style="float:right">${habits[k].points}</span>

      </div>
    `).join("")}

    ${photos()}

  </div>`;
}

// ---------- GRAPH ----------
function graph(){
  const data = state.history.slice(-7);
  if(data.length===0) return "";

  return `
  <div style="padding:16px;border-radius:18px;
  background:rgba(255,255,255,0.06)">

    <div style="margin-bottom:10px">Weekly Progress</div>

    <div style="display:flex;height:120px;align-items:flex-end;gap:8px">
      ${data.map(d=>`
        <div style="flex:1;text-align:center">
          <div style="height:${d.score}%;
          background:#22c55e;border-radius:6px"></div>
          <div style="font-size:10px">${new Date(d.date).getDate()}</div>
        </div>
      `).join("")}
    </div>

  </div>`;
}

// ---------- PHOTOS ----------
function photos(){
  return `
  <div style="margin-top:16px">
    <div style="margin-bottom:6px">Progress</div>
    <input type="file" id="photoInput"/>

    <div style="display:flex;gap:8px;margin-top:8px;overflow:auto">
      ${state.photos.map(p=>`
        <img src="${p}" style="height:70px;border-radius:12px"/>
      `).join("")}
    </div>
  </div>`;
}

// ---------- PAGE ----------
function page(){
  switch(state.page){
    case "home": return home();
    case "meals": return section("Meals");
    case "fitness": return section("Fitness");
    case "grooming": return section("Grooming");
    case "mind": return section("Posture & Confidence");
  }
}

function section(t){
  return `<div style="padding:20px">${t}</div>`;
}

// ---------- NAV ----------
function nav(){
  return `
  <div style="position:fixed;bottom:0;width:100%;
  display:flex;justify-content:space-around;
  padding:12px;background:rgba(0,0,0,0.7);
  backdrop-filter:blur(10px)">

    ${navItem("home",icons.home)}
    ${navItem("meals",icons.meal)}
    ${navItem("fitness",icons.gym)}
    ${navItem("grooming",icons.grooming)}
    ${navItem("mind",icons.mind)}

  </div>`;
}

function navItem(p,icon){
  return `
  <div class="nav" data-page="${p}"
  style="width:26px;height:26px;
  color:${state.page===p?'#22c55e':'#94a3b8'};
  transform:${state.page===p?'scale(1.2)':'scale(1)'}">
  ${icon}
  </div>`;
}

// ---------- EVENTS ----------
function bindEvents(){

  app.onclick = (e)=>{

    if(e.target.closest(".nav")){
      state.page = e.target.closest(".nav").dataset.page;
      save(); render();
    }

    if(e.target.closest(".habit")){
      const k = e.target.closest(".habit").dataset.habit;
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

render();
