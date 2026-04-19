const app = document.getElementById("app");

const STORAGE = "carely_v11_final";
const today = new Date().toISOString().slice(0,10);

// ---------- STATE ----------
let state = JSON.parse(localStorage.getItem(STORAGE)) || {
  date: today,
  page: "home",
  goal: "fat_loss",
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
  photos: [],
  achievements: []
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

// ---------- LEVEL ----------
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
      <div style="margin-top:6px;font-size:12px">
        🔥 ${state.streak} | ⚡ ${state.xp} XP
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

    <div style="margin-top:12px">Today's Tasks</div>

    ${task("Workout","workout",15)}
    ${task("Steps","steps",10)}
    ${task("Diet","diet",20)}
    ${task("Grooming","grooming",5)}
    ${task("Posture","posture",5)}

    ${smart()}

    ${achievementsUI()}

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
  if(!state.habits.diet) return box("⚡ Diet = fastest fat loss");
  if(!state.habits.workout) return box("⚡ Do 5 min workout now");
  return box("🔥 You're on track");
}

function box(t){
  return `<div style="margin-top:12px;padding:10px;background:#334155;border-radius:10px">${t}</div>`;
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
  <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-top:10px">
    ${grid}
  </div>`;
}

// ---------- GOALS ----------
function goalSelector(){
  return `
  <div style="display:flex;gap:6px">
    ${["fat_loss","confidence","grooming"].map(g=>`
      <div data-goal="${g}"
      style="flex:1;text-align:center;padding:8px;border-radius:8px;
      background:${state.goal===g?'#22c55e':'#1e293b'}">
        ${g.replace("_"," ").toUpperCase()}
      </div>
    `).join("")}
  </div>`;
}

// ---------- MEALS ----------
function meals(){
  return `
  <div style="padding:16px">
    <div>Meal Plan</div>
    <div style="margin-top:10px">Breakfast: Sattu + Roti</div>
    <div>Lunch: Roti + Sabzi</div>
    <div>Dinner: Light Roti + Dal</div>
  </div>`;
}

// ---------- FITNESS ----------
function fitness(){
  return `
  <div style="padding:16px">
    <div>Workout</div>
    <div style="margin-top:10px">Pushups x10</div>
    <div>Squats x15</div>
    <div>Plank 30 sec</div>
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
  if(last7.length===0) return "";

  const avg = Math.round(last7.reduce((a,b)=>a+b.score,0)/last7.length);

  return `
  <div style="margin-top:20px;padding:12px;background:#1e293b;border-radius:12px">
    <div>📊 Weekly Report</div>
    <div>Average: ${avg}</div>
    <div>Streak: ${state.streak}</div>
  </div>`;
}

// ---------- ACHIEVEMENTS ----------
function achievementsUI(){
  let unlocked=[];

  if(state.streak>=3 && !state.achievements.includes("3")){
    state.achievements.push("3");
    unlocked.push("🔥 3 Day Streak");
  }

  if(state.xp>=100 && !state.achievements.includes("xp")){
    state.achievements.push("xp");
    unlocked.push("⚡ 100 XP");
  }

  save();

  return unlocked.map(a=>`
    <div style="margin-top:6px;padding:8px;background:#22c55e;color:black;border-radius:8px">
      ${a}
    </div>
  `).join("");
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
  if(state.page==="mind") return "<div style='padding:16px'>Confidence System</div>";
}

// ---------- EVENTS ----------
function bind(){
  app.onclick=e=>{
    const t=e.target.closest("[data-page],[data-habit],[data-goal]");
    if(!t) return;

    if(t.dataset.page){
      state.page=t.dataset.page;
      save(); render();
    }

    if(t.dataset.goal){
      state.goal=t.dataset.goal;
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
