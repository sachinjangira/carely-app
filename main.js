const app = document.getElementById("app");

// ---------- CONFIG ----------
const STORAGE_KEY = "carely_prod_v1";
const VERSION = 1;
const today = new Date().toISOString().slice(0,10);

// ---------- STATE ----------
function getInitialState(){
  return {
    version: VERSION,
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
    meals: {
      Breakfast:"",
      Lunch:"",
      Dinner:"",
      Snacks:""
    },
    history: [],
    photos: []
  };
}

function loadState(){
  try{
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(!saved || saved.version !== VERSION) return getInitialState();
    return saved;
  }catch{
    return getInitialState();
  }
}

let state = loadState();

function save(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ---------- RESET ----------
if(state.date !== today){
  const done = Object.values(state.habits).filter(Boolean).length;
  const percent = Math.round((done/5)*100);

  state.history.push({date:state.date,score:percent});
  if(state.history.length>90) state.history.shift();

  state.streak = percent >= 70 ? state.streak + 1 : 0;

  state.date = today;
  state.score = 0;
  Object.keys(state.habits).forEach(k=>state.habits[k]=false);
  save();
}

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
  background:linear-gradient(180deg,#020617,#0f172a);
  color:white;font-family:system-ui">

    ${header()}
    ${page()}
    ${nav()}

  </div>`;
  bindEvents();
}

// ---------- HEADER ----------
function header(){
  return `
  <div style="padding:16px">

    <div style="padding:16px;border-radius:16px;
    background:rgba(255,255,255,0.06)">

      <div style="display:flex;justify-content:space-between">
        <div>Score</div>
        <div style="color:#22c55e">${state.score}</div>
      </div>

      <div style="height:6px;background:#334155;border-radius:6px;margin-top:8px">
        <div style="height:6px;background:#22c55e;width:${state.score}%"></div>
      </div>

      <div style="font-size:12px;margin-top:8px">
        🔥 ${state.streak} day streak
      </div>

    </div>

  </div>`;
}

// ---------- HOME ----------
function home(){
  return `
  <div style="padding:16px">

    ${weeklyStats()}
    ${heatmap()}

    <div style="margin-top:12px">Today's Tasks</div>

    ${Object.keys(habits).map(k=>`
      <div class="habit" data-habit="${k}"
      style="padding:12px;margin-top:8px;border-radius:10px;
      background:${state.habits[k]?'#22c55e':'rgba(255,255,255,0.08)'}">
      ${habits[k].label} (+${habits[k].points})
      </div>
    `).join("")}

  </div>`;
}

// ---------- WEEKLY ----------
function weeklyStats(){
  const last7 = state.history.slice(-7);
  if(!last7.length) return "";

  const avg = Math.round(last7.reduce((a,b)=>a+b.score,0)/last7.length);

  return `
  <div style="padding:12px;border-radius:10px;background:rgba(255,255,255,0.08)">
    Weekly Avg: ${avg}% ${avg>70?"🔥":"⚠"}
  </div>`;
}

// ---------- HEATMAP ----------
function heatmap(){
  const days = 30;
  let grid = "";

  for(let i=days-1;i>=0;i--){
    const d = new Date();
    d.setDate(d.getDate()-i);
    const key = d.toISOString().slice(0,10);

    const record = state.history.find(x=>x.date===key);
    const score = record ? record.score : 0;

    const color =
      score>=70 ? "#22c55e" :
      score>30 ? "#facc15" :
      "#1e293b";

    grid += `<div style="width:10px;height:10px;background:${color};border-radius:2px"></div>`;
  }

  return `
  <div style="display:grid;grid-template-columns:repeat(15,1fr);gap:4px;margin-top:12px">
    ${grid}
  </div>`;
}

// ---------- PAGES ----------
function page(){
  switch(state.page){
    case "home": return home();
    case "meals": return meals();
    case "fitness": return fitness();
    case "grooming": return grooming();
    case "mind": return mind();
  }
}

// ---------- MEALS ----------
function meals(){
  return `
  <div style="padding:16px">
    ${["Breakfast","Lunch","Dinner","Snacks"].map(m=>`
      <input data-meal="${m}" value="${state.meals[m]}"
      placeholder="${m}"
      style="width:100%;margin-bottom:10px;padding:10px;border-radius:10px"/>
    `).join("")}
  </div>`;
}

// ---------- FITNESS ----------
function fitness(){
  return `
  <div style="padding:16px">
    ${exercise("Push-ups","workout")}
    ${exercise("Squats","steps")}
    ${exercise("Plank","posture")}
  </div>`;
}

function exercise(name,key){
  return `
  <div class="habit" data-habit="${key}"
  style="padding:12px;margin-bottom:8px;border-radius:10px;
  background:${state.habits[key]?'#22c55e':'rgba(255,255,255,0.08)'}">
    ${name}
  </div>`;
}

// ---------- GROOMING ----------
function grooming(){
  return `
  <div style="padding:16px">
    ${check("Face Wash","grooming")}
    ${check("Beard Trim","grooming")}
  </div>`;
}

// ---------- MIND ----------
function mind(){
  return `
  <div style="padding:16px">
    ${check("Posture","posture")}
    ${check("Confidence Practice","diet")}
  </div>`;
}

function check(label,key){
  return `
  <div class="habit" data-habit="${key}"
  style="padding:12px;margin-bottom:8px;border-radius:10px;
  background:${state.habits[key]?'#22c55e':'rgba(255,255,255,0.08)'}">
    ${label}
  </div>`;
}

// ---------- NAV ----------
function nav(){
  return `
  <div style="position:fixed;bottom:0;width:100%;
  display:flex;justify-content:space-around;
  background:rgba(0,0,0,0.8);padding:10px">

    ${navItem("home","🏠")}
    ${navItem("meals","🍽")}
    ${navItem("fitness","🏋️")}
    ${navItem("grooming","🧴")}
    ${navItem("mind","🧠")}

  </div>`;
}

function navItem(p,icon){
  return `
  <div class="nav" data-page="${p}"
  style="color:${state.page===p?'#22c55e':'#aaa'}">
  ${icon}
  </div>`;
}

// ---------- EVENTS ----------
function bindEvents(){

  app.onclick = e=>{
    const t = e.target.closest("[data-page],[data-habit]");
    if(!t) return;

    if(t.dataset.page){
      state.page = t.dataset.page;
      save(); render();
    }

    if(t.dataset.habit){
      const k = t.dataset.habit;
      const h = habits[k];

      state.habits[k] = !state.habits[k];
      state.score += state.habits[k]?h.points:-h.points;
      state.score = Math.max(0,Math.min(100,state.score));

      save(); render();
    }
  };

  document.querySelectorAll("[data-meal]").forEach(input=>{
    input.oninput = e=>{
      state.meals[e.target.dataset.meal] = e.target.value;
      save();
    };
  });
}

// ---------- INIT ----------
render();
