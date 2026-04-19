const app = document.getElementById("app");

// ---------- CONFIG ----------
const STORAGE_KEY = "carely_prod_final";
const today = new Date().toISOString().slice(0,10);

// ---------- INITIAL STATE ----------
function getInitialState(){
  return {
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

// ---------- LOAD ----------
function loadState(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || getInitialState();
  }catch{
    return getInitialState();
  }
}

let state = loadState();

function save(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ---------- HABITS ----------
const habits = {
  workout:{label:"Workout",points:20,weight:2},
  steps:{label:"Steps",points:10,weight:1},
  diet:{label:"Diet",points:25,weight:3},
  grooming:{label:"Grooming",points:10,weight:1},
  posture:{label:"Posture",points:10,weight:1}
};

// ---------- DAILY RESET ----------
if(state.date !== today){

  let totalWeight = 0;
  let achievedWeight = 0;

  Object.keys(habits).forEach(k=>{
    totalWeight += habits[k].weight;
    if(state.habits[k]) achievedWeight += habits[k].weight;
  });

  const percent = Math.round((achievedWeight / totalWeight) * 100);

  state.history.push({date:state.date,score:percent});
  if(state.history.length>90) state.history.shift();

  if(percent >= 70) state.streak++;
  else state.streak = 0;

  if(!state.habits.diet){
    state.score -= 15;
  }

  state.date = today;
  state.score = Math.max(0,state.score);
  Object.keys(state.habits).forEach(k=>state.habits[k]=false);

  save();
}

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

    ${feedback()}
    ${photos()}

  </div>`;
}

// ---------- FEEDBACK ----------
function feedback(){
  let msg = "Good start.";

  if(!state.habits.diet){
    msg = "Diet is breaking your progress.";
  }
  else if(!state.habits.workout){
    msg = "Workout missing today.";
  }
  else if(state.score > 70){
    msg = "Strong day. Keep consistency.";
  }

  return `
  <div style="margin-top:12px;padding:12px;border-radius:10px;background:rgba(255,255,255,0.08)">
    ${msg}
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
  let grid = "";

  for(let i=29;i>=0;i--){
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

// ---------- PHOTOS ----------
function photos(){
  return `
  <div style="margin-top:12px">
    <input type="file" id="photoInput"/>
    <div style="display:flex;gap:6px;margin-top:6px">
      ${state.photos.map(p=>`<img src="${p}" style="height:60px"/>`).join("")}
    </div>
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

      const multiplier = 1 + (state.streak * 0.05);
      const value = Math.round(h.points * multiplier);

      state.habits[k] = !state.habits[k];
      state.score += state.habits[k] ? value : -value;

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

  const photo = document.getElementById("photoInput");
  if(photo){
    photo.onchange = ()=>{
      const file = photo.files[0];
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
