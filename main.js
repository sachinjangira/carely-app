const app = document.getElementById("app");

const STORAGE = "carely_final_v1";
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

// ---------- NOTIFICATIONS ----------
let notifAllowed = false;

function requestNotification(){
  if("Notification" in window){
    Notification.requestPermission().then(p=>{
      if(p==="granted"){
        notifAllowed = true;
        scheduleReminders();
      }
    });
  }
}

function notify(msg){
  if(notifAllowed){
    new Notification("Carely", { body: msg });
  }
}

function getSmartReminder(){
  if(!state.habits.diet) return "Fix diet. Biggest impact.";
  if(!state.habits.workout) return "Do quick workout.";
  if(!state.habits.steps) return "Walk more today.";
  return "Good job. Stay consistent.";
}

function scheduleReminders(){
  setTimeout(()=> notify("Start your day strong 💪"), getDelay(9));
  setTimeout(()=> notify(getSmartReminder()), getDelay(19));
}

function getDelay(hour){
  const now = new Date();
  const target = new Date();
  target.setHours(hour,0,0,0);
  if(target < now) target.setDate(target.getDate()+1);
  return target - now;
}

// ---------- LEVEL ----------
function updateLevel(){
  state.level = Math.floor(state.xp / 100) + 1;
  return state.xp % 100;
}

// ---------- ADAPTIVE PLAN ----------
function getPlan(){
  let difficulty = "normal";
  if(state.streak === 0) difficulty = "easy";
  if(state.streak >= 3) difficulty = "hard";

  let workout = difficulty==="easy"
    ? ["Pushups x5","Squats x10"]
    : difficulty==="hard"
    ? ["Pushups x15","Squats x25","Plank 45s"]
    : ["Pushups x10","Squats x15"];

  let meal = state.habits.diet
    ? "Maintain clean diet"
    : "Avoid junk + reduce snacks";

  let focus = getSmartReminder();

  return { workout, meal, focus, difficulty };
}

// ---------- UI ----------
function header(){
  const xp = updateLevel();

  return `
  <div style="padding:16px">
    <div style="background:#1e293b;padding:16px;border-radius:16px">
      <div style="display:flex;justify-content:space-between">
        <div>Level ${state.level}</div>
        <div style="color:#22c55e">${state.score}</div>
      </div>

      <div style="height:8px;background:#0f172a;margin-top:8px">
        <div style="width:${xp}%;height:8px;background:#22c55e"></div>
      </div>

      <div style="font-size:12px;margin-top:6px">
        🔥 ${state.streak} • ⚡ ${state.xp}
      </div>
    </div>
  </div>`;
}

// ---------- HOME ----------
function home(){
  const plan = getPlan();

  return `
  <div style="padding:16px">

    <button id="notifBtn" style="background:#22c55e;padding:10px;border-radius:10px">
      Enable Notifications
    </button>

    <button id="testBtn" style="background:#334155;padding:10px;border-radius:10px;margin-left:10px">
      Test
    </button>

    <div style="margin-top:16px">🔥 Today (${plan.difficulty})</div>

    ${card("Meal",plan.meal)}
    ${card("Workout",plan.workout.join("<br>"))}
    ${card("Focus",plan.focus)}

    <div style="margin-top:16px">Tasks</div>

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
  style="padding:12px;margin-top:8px;border-radius:10px;
  background:${state.habits[key]?'#22c55e':'#1e293b'}">
    ${label} (+${xp})
  </div>`;
}

// ---------- OTHER TABS ----------
function meals(){ return `<div style="padding:16px">Meal system</div>`; }
function fitness(){ return `<div style="padding:16px">Workout system</div>`; }
function grooming(){ return `<div style="padding:16px">Grooming system</div>`; }
function mind(){ return `<div style="padding:16px">Confidence system</div>`; }

function progress(){
  return `
  <div style="padding:16px">
    <input type="file" id="photo"/>
    <div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap">
      ${state.photos.map(p=>`<img src="${p}" style="width:80px">`).join("")}
    </div>
  </div>`;
}

// ---------- CARD ----------
function card(t,v){
  return `<div style="margin-top:10px;background:#1e293b;padding:12px;border-radius:10px">
    <b>${t}</b><br>${v}
  </div>`;
}

// ---------- NAV ----------
function nav(){
  return `
  <div style="position:fixed;bottom:10px;left:10px;right:10px;
  display:flex;justify-content:space-around;background:#020617;padding:12px;border-radius:16px">

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

  const notifBtn=document.getElementById("notifBtn");
  if(notifBtn){
    notifBtn.onclick=requestNotification;
  }

  const testBtn=document.getElementById("testBtn");
  if(testBtn){
    testBtn.onclick=()=>notify("Test working ✅");
  }

  const input=document.getElementById("photo");
  if(input){
    input.onchange=e=>{
      const r=new FileReader();
      r.onload=()=>{
        state.photos.push(r.result);
        save(); render();
      };
      r.readAsDataURL(e.target.files[0]);
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
