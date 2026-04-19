const app = document.getElementById("app");

const STORAGE = "carely_elite_v3";
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

// ---------- ADAPTIVE ENGINE ----------
function getPlan(){

  let difficulty = "normal";

  if(state.streak === 0) difficulty = "easy";
  if(state.streak >= 3) difficulty = "hard";

  let workout = [];
  if(difficulty === "easy"){
    workout = ["Pushups x5","Squats x10","Walk 10 min"];
  }
  else if(difficulty === "hard"){
    workout = ["Pushups x15","Squats x25","Plank 45 sec"];
  }
  else{
    workout = ["Pushups x10","Squats x15","Plank 30 sec"];
  }

  let mealFocus = state.habits.diet
    ? "Maintain clean meals"
    : "STRICT: Avoid junk + reduce snacks";

  let message = "";

  if(!state.habits.diet){
    message = "Fix diet first. That’s your bottleneck.";
  }
  else if(!state.habits.workout){
    message = "Add movement. Body change needs stimulus.";
  }
  else if(state.streak >= 3){
    message = "Push harder today. You’re building momentum.";
  }
  else{
    message = "Stay consistent. Don’t break the chain.";
  }

  return { workout, mealFocus, message, difficulty };
}

// ---------- HEADER ----------
function header(){
  const xpProgress = updateLevel();

  return `
  <div style="padding:16px">
    <div style="padding:18px;border-radius:20px;background:#1e293b">
      <div style="display:flex;justify-content:space-between">
        <div>Level ${state.level}</div>
        <div style="color:#22c55e">${state.score}</div>
      </div>

      <div style="margin-top:10px;height:8px;background:#0f172a">
        <div style="height:8px;width:${xpProgress}%;background:#22c55e"></div>
      </div>

      <div style="margin-top:8px;font-size:12px">
        🔥 ${state.streak} • ⚡ ${state.xp} XP
      </div>
    </div>
  </div>`;
}

// ---------- HOME ----------
function home(){

  const plan = getPlan();

  return `
  <div style="padding:16px">

    ${calendar()}

    <div style="margin-top:16px;font-size:14px">🔥 Your Plan Today (${plan.difficulty})</div>

    ${card("Meal Focus", plan.mealFocus)}
    ${card("Workout", plan.workout.join("<br>"))}
    ${card("Focus", plan.message)}

    <div style="margin-top:16px">Today's Execution</div>

    ${task("Workout","workout",15)}
    ${task("Steps","steps",10)}
    ${task("Diet","diet",20)}
    ${task("Grooming","grooming",5)}
    ${task("Posture","posture",5)}

  </div>`;
}

// ---------- TASK ----------
function task(label,key,xp){
  return `
  <div data-habit="${key}" data-xp="${xp}"
  style="margin-top:10px;padding:14px;border-radius:12px;
  background:${state.habits[key]?'#22c55e':'#1e293b'}">
    ${label} (+${xp} XP)
  </div>`;
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
      <div style="width:10px;height:10px;background:#1e293b;margin:auto"></div>
    </div>`;
  }

  return `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">${grid}</div>`;
}

// ---------- PAGES ----------
function meals(){
  return `<div style="padding:16px">Meal planning based on your goal</div>`;
}

function fitness(){
  return `<div style="padding:16px">Workout progression here</div>`;
}

function grooming(){
  return `<div style="padding:16px">Beard, skin, hair system</div>`;
}

function mind(){
  return `<div style="padding:16px">Confidence & posture system</div>`;
}

function progress(){
  return `
  <div style="padding:16px">
    <input type="file" id="photoInput"/>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">
      ${state.photos.map(p=>`<img src="${p}" style="width:80px;height:80px"/>`).join("")}
    </div>
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
  <div style="position:fixed;bottom:10px;left:10px;right:10px;display:flex;justify-content:space-around;padding:12px;background:#020617;border-radius:20px">
    ${navItem("home","🏠")}
    ${navItem("meals","🍽")}
    ${navItem("fitness","🏋️")}
    ${navItem("grooming","🧴")}
    ${navItem("mind","🧠")}
    ${navItem("progress","📈")}
  </div>`;
}

function navItem(p,i){
  return `<div data-page="${p}" style="color:${state.page===p?'#22c55e':'#64748b'}">${i}</div>`;
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
      const reader=new FileReader();
      reader.onload=()=>{
        state.photos.push(reader.result);
        save(); render();
      };
      reader.readAsDataURL(e.target.files[0]);
    };
  }
}

// ---------- INIT ----------
function render(){
  app.innerHTML = `<div style="min-height:100vh;background:#020617;color:white">${header()}${screen()}${nav()}</div>`;
  bind();
}

render();
