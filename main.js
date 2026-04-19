const app = document.getElementById("app");

// ---------- SAFE STATE ----------
const STORAGE = "carely_clean_v1";

const today = new Date().toISOString().slice(0,10);

let state = JSON.parse(localStorage.getItem(STORAGE)) || {
  date: today,
  page: "home",
  goal: "fat_loss",
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
  history: []
};

function save(){
  localStorage.setItem(STORAGE, JSON.stringify(state));
}

// ---------- GOALS ----------
const GOALS = {
  fat_loss: { name:"Fat Loss", weights:{diet:4,workout:3,steps:2,grooming:1,posture:1}},
  confidence: { name:"Confidence", weights:{posture:4,workout:2,diet:2,grooming:2,steps:1}},
  grooming: { name:"Grooming", weights:{grooming:4,diet:2,posture:2,workout:1,steps:1}}
};

// ---------- RESET ----------
if(state.date !== today){
  state.date = today;
  state.score = 0;
  Object.keys(state.habits).forEach(k=>state.habits[k]=false);
  save();
}

// ---------- HABITS ----------
const points = {
  workout:20,
  steps:10,
  diet:25,
  grooming:10,
  posture:10
};

// ---------- RENDER ----------
function render(){
  app.innerHTML = `
  <div style="min-height:100vh;padding-bottom:80px;
  background:linear-gradient(180deg,#020617,#0f172a);
  color:white;font-family:sans-serif">

    ${header()}
    ${screen()}
    ${nav()}

  </div>`;
  bind();
}

// ---------- HEADER ----------
function header(){
  return `
  <div style="padding:16px">
    <div style="padding:16px;border-radius:12px;background:rgba(255,255,255,0.05)">
      <div style="display:flex;justify-content:space-between">
        <div>${GOALS[state.goal].name}</div>
        <div style="color:#22c55e">${state.score}</div>
      </div>
    </div>
  </div>`;
}

// ---------- HOME ----------
function home(){
  return `
  <div style="padding:16px">

    ${goalSelector()}
    ${calendar()}

    <div style="margin-top:16px">Today's Tasks</div>

    ${task("Workout","workout")}
    ${task("Steps","steps")}
    ${task("Diet","diet")}
    ${task("Grooming","grooming")}
    ${task("Posture","posture")}

    ${feedback()}

  </div>`;
}

// ---------- TASK ----------
function task(label,key){
  return `
  <div data-habit="${key}"
  style="padding:14px;margin-top:8px;border-radius:10px;
  background:${state.habits[key]?'#22c55e':'rgba(255,255,255,0.08)'}">
    ${label}
  </div>`;
}

// ---------- CALENDAR ----------
function calendar(){
  let grid = "";

  for(let i=27;i>=0;i--){
    const d = new Date();
    d.setDate(d.getDate()-i);
    const key = d.toISOString().slice(0,10);

    const rec = state.history.find(x=>x.date===key);
    const score = rec ? rec.score : 0;

    const color =
      score>70 ? "#22c55e" :
      score>30 ? "#facc15" :
      "#1e293b";

    grid += `<div style="aspect-ratio:1;background:${color};border-radius:4px"></div>`;
  }

  return `
  <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-top:12px">
    ${grid}
  </div>`;
}

// ---------- GOAL ----------
function goalSelector(){
  return `
  <div style="display:flex;gap:6px">
    ${Object.keys(GOALS).map(g=>`
      <div data-goal="${g}"
      style="flex:1;padding:10px;text-align:center;border-radius:8px;
      background:${state.goal===g?'#22c55e':'rgba(255,255,255,0.08)'}">
      ${GOALS[g].name}
      </div>
    `).join("")}
  </div>`;
}

// ---------- FEEDBACK ----------
function feedback(){
  if(!state.habits.diet) return box("Fix your diet first.");
  if(!state.habits.workout) return box("Add workout.");
  return box("Good progress.");
}

function box(t){
  return `<div style="margin-top:10px;padding:10px;border-radius:8px;background:rgba(255,255,255,0.08)">${t}</div>`;
}

// ---------- OTHER PAGES ----------
function meals(){
  return `
  <div style="padding:16px">
    ${["Breakfast","Lunch","Dinner","Snacks"].map(m=>`
      <input data-meal="${m}" value="${state.meals[m]}"
      placeholder="${m}"
      style="width:100%;padding:10px;margin-bottom:10px;border-radius:8px">
    `).join("")}
  </div>`;
}

function fitness(){
  return `<div style="padding:16px">${task("Push-ups","workout")}</div>`;
}

function grooming(){
  return `<div style="padding:16px">${task("Face Wash","grooming")}</div>`;
}

function mind(){
  return `<div style="padding:16px">${task("Posture","posture")}</div>`;
}

// ---------- ROUTER ----------
function screen(){
  if(state.page==="home") return home();
  if(state.page==="meals") return meals();
  if(state.page==="fitness") return fitness();
  if(state.page==="grooming") return grooming();
  if(state.page==="mind") return mind();
}

// ---------- NAV ----------
function nav(){
  return `
  <div style="position:fixed;bottom:0;width:100%;
  display:flex;justify-content:space-around;
  background:#020617;padding:12px">

    ${navItem("home","🏠")}
    ${navItem("meals","🍽")}
    ${navItem("fitness","🏋️")}
    ${navItem("grooming","🧴")}
    ${navItem("mind","🧠")}

  </div>`;
}

function navItem(p,i){
  return `<div data-page="${p}" style="color:${state.page===p?'#22c55e':'#64748b'}">${i}</div>`;
}

// ---------- EVENTS ----------
function bind(){

  app.onclick = e=>{
    const t = e.target.closest("[data-page],[data-habit],[data-goal]");
    if(!t) return;

    if(t.dataset.page){
      state.page = t.dataset.page;
      save(); render();
    }

    if(t.dataset.goal){
      state.goal = t.dataset.goal;
      save(); render();
    }

    if(t.dataset.habit){
      const k = t.dataset.habit;
      const weight = GOALS[state.goal].weights[k] || 1;

      state.habits[k] = !state.habits[k];
      state.score += state.habits[k] ? points[k]*weight : -points[k]*weight;

      state.score = Math.max(0, Math.min(100, state.score));

      save(); render();
    }
  };

  document.querySelectorAll("[data-meal]").forEach(i=>{
    i.oninput = e=>{
      state.meals[e.target.dataset.meal] = e.target.value;
      save();
    };
  });
}

// ---------- START ----------
render();
