const app = document.getElementById("app");

const STORAGE = "carely_v10_game";
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
  achievements: [],
  photos: []
};

function save(){
  localStorage.setItem(STORAGE, JSON.stringify(state));
}

// ---------- RESET ----------
if(state.date !== today){

  state.history.push({date:state.date,score:state.score});
  if(state.history.length>30) state.history.shift();

  if(state.score >= 60){
    state.streak++;
    if(state.streak === 3) state.xp += 20;
    if(state.streak === 7) state.xp += 50;
  } else {
    state.streak = 0;
  }

  state.date = today;
  state.score = 0;
  Object.keys(state.habits).forEach(k=>state.habits[k]=false);

  save();
}

// ---------- LEVEL SYSTEM ----------
function updateLevel(){
  state.level = Math.floor(state.xp / 100) + 1;
}

// ---------- HEADER ----------
function header(){
  updateLevel();

  return `
  <div style="padding:16px">
    <div style="padding:16px;border-radius:16px;background:#1e293b">

      <div style="display:flex;justify-content:space-between">
        <div>Level ${state.level}</div>
        <div style="color:#22c55e">${state.score}</div>
      </div>

      <div style="height:6px;background:#334155;margin-top:8px">
        <div style="height:6px;background:#22c55e;width:${state.score}%"></div>
      </div>

      <div style="margin-top:8px;font-size:12px">
        🔥 ${state.streak} days | ⚡ XP: ${state.xp}
      </div>

    </div>
  </div>`;
}

// ---------- HOME ----------
function home(){
  return `
  <div style="padding:16px">

    <div>Today's Tasks</div>

    ${task("Workout","workout",15)}
    ${task("Steps","steps",10)}
    ${task("Diet","diet",20)}
    ${task("Grooming","grooming",5)}
    ${task("Posture","posture",5)}

    ${smart()}

    ${achievements()}

  </div>`;
}

// ---------- TASK ----------
function task(label,key,xp){
  return `
  <div data-habit="${key}" data-xp="${xp}"
  style="padding:12px;margin-top:8px;border-radius:10px;
  background:${state.habits[key]?'#22c55e':'#1e293b'}">
    ${label} (+${xp} XP)
  </div>`;
}

// ---------- SMART ----------
function smart(){
  if(!state.habits.diet){
    return box("⚡ Diet = fastest progress");
  }
  if(!state.habits.workout){
    return box("⚡ Do 5-min workout now");
  }
  return box("🔥 You're on track");
}

function box(t){
  return `<div style="margin-top:12px;padding:10px;background:#334155;border-radius:10px">${t}</div>`;
}

// ---------- ACHIEVEMENTS ----------
function achievements(){

  let list = [];

  if(state.streak >= 3 && !state.achievements.includes("3day")){
    state.achievements.push("3day");
    list.push("🔥 3 Day Streak");
  }

  if(state.xp >= 100 && !state.achievements.includes("xp100")){
    state.achievements.push("xp100");
    list.push("⚡ 100 XP Earned");
  }

  save();

  if(list.length === 0) return "";

  return `
  <div style="margin-top:12px">
    ${list.map(a=>`
      <div style="padding:10px;background:#22c55e;color:black;margin-top:6px;border-radius:10px">
        ${a}
      </div>
    `).join("")}
  </div>`;
}

// ---------- PROGRESS ----------
function progress(){
  return `
  <div style="padding:16px">

    <div>Upload Photo</div>
    <input type="file" id="photoInput"/>

    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">
      ${state.photos.map(p=>`
        <img src="${p}" style="width:80px;height:80px;border-radius:10px"/>
      `).join("")}
    </div>

    ${weeklyReport()}

  </div>`;
}

// ---------- WEEKLY REPORT ----------
function weeklyReport(){
  const last7 = state.history.slice(-7);
  if(last7.length === 0) return "";

  const avg = Math.round(last7.reduce((a,b)=>a+b.score,0)/last7.length);

  let status = "Needs Work";
  if(avg >= 70) status = "🔥 Excellent";
  else if(avg >= 50) status = "👍 Good";

  return `
  <div style="margin-top:20px;padding:12px;background:#1e293b;border-radius:12px">
    <div>📊 Weekly Report</div>
    <div>Average: ${avg}</div>
    <div>Streak: ${state.streak}</div>
    <div>Status: ${status}</div>
  </div>`;
}

// ---------- NAV ----------
function nav(){
  return `
  <div style="position:fixed;bottom:0;width:100%;display:flex;justify-content:space-around;background:#020617;padding:12px">
    ${navItem("home","🏠")}
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
      const xp=parseInt(t.dataset.xp);

      state.habits[k]=!state.habits[k];
      state.score += state.habits[k]?10:-10;
      state.xp += state.habits[k]?xp:-xp;

      state.score=Math.max(0,state.score);
      state.xp=Math.max(0,state.xp);

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
