const app = document.getElementById("app");

// ---------- SAFE INIT ----------
function safeParse(key, fallback){
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
}

const todayKey = new Date().toISOString().slice(0,10);

let state = safeParse("carely_v7", {
  date: todayKey,
  page: "home",
  score: 0,
  streak: 0,
  shield: 1,
  foods: [],
  history: [],
  photos: [],
  habits: {
    workout:false,
    steps:false,
    diet:false,
    grooming:false,
    posture:false
  }
});

function save(){
  localStorage.setItem("carely_v7", JSON.stringify(state));
}

// ---------- RESET ----------
if(state.date !== todayKey){
  const done = Object.values(state.habits).filter(Boolean).length;
  let percent = Math.round((done/5)*100);

  if(!state.habits.diet) percent -= 10;

  state.history.push({date:state.date,score:percent});
  if(state.history.length>90) state.history.shift();

  if(percent>=70) state.streak++;
  else if(state.shield>0) state.shield--;
  else state.streak=0;

  state.date = todayKey;
  state.score = 0;
  state.shield = 1;
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
      <div style="padding:16px;border-radius:20px;
        background:rgba(255,255,255,0.08);backdrop-filter:blur(10px)">
        
        <div style="display:flex;justify-content:space-between">
          <div>Score</div>
          <div style="color:#22c55e">${state.score}</div>
        </div>

        <div style="background:#374151;height:6px;border-radius:6px;margin-top:8px">
          <div style="background:#22c55e;height:6px;border-radius:6px;width:${state.score}%"></div>
        </div>

        <div style="margin-top:8px;font-size:12px">
          🔥 ${state.streak} | 🛡 ${state.shield}
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

      ${weeklyReport()}

      ${photoSection()}

    </div>
  `;
}

// ---------- WEEKLY REPORT ----------
function weeklyReport(){
  const last7 = state.history.slice(-7);
  if(last7.length===0) return "";

  const avg = Math.round(last7.reduce((a,b)=>a+b.score,0)/last7.length);

  let msg = "Average week.";
  if(avg>70) msg="🔥 Strong consistency";
  else if(avg<40) msg="⚠️ Needs discipline";

  return `
    <div style="margin-top:16px;padding:12px;border-radius:12px;background:rgba(255,255,255,0.08)">
      Weekly Avg: ${avg}% <br/>
      ${msg}
    </div>
  `;
}

// ---------- PHOTO TRACK ----------
function photoSection(){
  return `
    <div style="margin-top:16px">

      <div style="margin-bottom:8px">Progress Photos</div>

      <input type="file" accept="image/*" id="photoInput"/>

      <div style="display:flex;gap:10px;margin-top:10px;overflow:auto">
        ${state.photos.map(p=>`
          <img src="${p}" style="height:80px;border-radius:10px"/>
        `).join("")}
      </div>

    </div>
  `;
}

// ---------- OTHER PAGES ----------
function simplePage(title){
  return `<div style="padding:16px">${title}</div>`;
}

function page(){
  switch(state.page){
    case "home": return home();
    case "meals": return simplePage("Meals");
    case "fitness": return simplePage("Fitness");
    case "grooming": return simplePage("Grooming");
    case "mind": return simplePage("Posture & Confidence");
    default: return home();
  }
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
      state.score += state.habits[k] ? h.points : -h.points;
      state.score = Math.max(0, Math.min(100, state.score));

      save(); render();
    }
  };

  // PHOTO
  const input = document.getElementById("photoInput");
  if(input){
    input.onchange = ()=>{
      const file = input.files[0];
      if(!file) return;

      const reader = new FileReader();
      reader.onload = function(e){
        state.photos.push(e.target.result);
        save(); render();
      };
      reader.readAsDataURL(file);
    };
  }
}

// ---------- INIT ----------
render();
