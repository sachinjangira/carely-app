const app = document.getElementById("app");

const STORAGE = "carely_v9_pro";
const today = new Date().toISOString().slice(0,10);

// ---------- STATE ----------
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

  state.streak = state.score >= 60 ? state.streak+1 : 0;

  state.date = today;
  state.score = 0;
  Object.keys(state.habits).forEach(k=>state.habits[k]=false);

  save();
}

// ---------- HEADER ----------
function header(){
  return `
  <div style="padding:16px">
    <div style="padding:16px;border-radius:16px;background:#1e293b">
      <div style="display:flex;justify-content:space-between">
        <div>Fat Loss</div>
        <div style="color:#22c55e">${state.score}</div>
      </div>
      <div style="margin-top:6px;font-size:12px">🔥 ${state.streak} day streak</div>
    </div>
  </div>`;
}

// ---------- HOME ----------
function home(){
  return `
  <div style="padding:16px">

    <div>Today's Tasks</div>

    ${task("Workout","workout")}
    ${task("Steps","steps")}
    ${task("Diet","diet")}
    ${task("Grooming","grooming")}
    ${task("Posture","posture")}

    ${smart()}

  </div>`;
}

// ---------- TASK ----------
function task(label,key){
  return `
  <div data-habit="${key}"
  style="padding:12px;margin-top:8px;border-radius:10px;
  background:${state.habits[key]?'#22c55e':'#1e293b'}">
    ${label}
  </div>`;
}

// ---------- SMART ----------
function smart(){
  if(!state.habits.diet){
    return `<div style="margin-top:12px;padding:10px;background:#334155;border-radius:10px">
      ⚡ Fix diet today
    </div>`;
  }
  if(!state.habits.workout){
    return `<div style="margin-top:12px;padding:10px;background:#334155;border-radius:10px">
      ⚡ Do quick workout
    </div>`;
  }
  return `<div style="margin-top:12px;padding:10px;background:#334155;border-radius:10px">
    ✅ Good job
  </div>`;
}

// ---------- MEALS ----------
function meals(){
  return `<div style="padding:16px">Meal suggestions coming</div>`;
}

// ---------- FITNESS ----------
function fitness(){
  return `<div style="padding:16px">Workout plan coming</div>`;
}

// ---------- PROGRESS (NEW) ----------
function progress(){

  return `
  <div style="padding:16px">

    <div style="margin-bottom:10px">Upload Progress Photo</div>
    <input type="file" id="photoInput"/>

    <div style="margin-top:20px">Your Progress</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">
      ${state.photos.map(p=>`
        <img src="${p}" style="width:80px;height:80px;object-fit:cover;border-radius:10px"/>
      `).join("")}
    </div>

    ${weeklyReport()}

  </div>`;
}

// ---------- WEEKLY REPORT ----------
function weeklyReport(){

  const last7 = state.history.slice(-7);
  if(last7.length===0) return "";

  const avg = Math.round(last7.reduce((a,b)=>a+b.score,0)/last7.length);

  return `
  <div style="margin-top:20px;padding:12px;background:#1e293b;border-radius:12px">
    <div>📊 Weekly Report</div>
    <div style="margin-top:8px">Average Score: ${avg}</div>
    <div>Streak: ${state.streak} days</div>
    <div>Consistency: ${avg>=70?"Good":"Needs Work"}</div>
  </div>`;
}

// ---------- NAV ----------
function nav(){
  return `
  <div style="position:fixed;bottom:0;width:100%;display:flex;justify-content:space-around;background:#020617;padding:12px">
    ${navItem("home","🏠")}
    ${navItem("meals","🍽")}
    ${navItem("fitness","🏋️")}
    ${navItem("progress","📈")}
    ${navItem("mind","🧠")}
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
  if(state.page==="progress") return progress();
  if(state.page==="mind") return "<div style='padding:16px'>Confidence system</div>";
}

// ---------- EVENTS ----------
function bind(){

  app.onclick = e=>{
    const t=e.target.closest("[data-page],[data-habit]");
    if(!t) return;

    if(t.dataset.page){
      state.page=t.dataset.page;
      save(); render();
    }

    if(t.dataset.habit){
      const k=t.dataset.habit;
      state.habits[k]=!state.habits[k];
      state.score += state.habits[k]?10:-10;
      state.score=Math.max(0,state.score);

      save(); render();
    }
  };

  const input = document.getElementById("photoInput");
  if(input){
    input.onchange = e=>{
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = ()=>{
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
