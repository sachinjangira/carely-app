const app = document.getElementById("app");

const STORAGE = "carely_v7_final";
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
  fat_loss:{name:"Fat Loss",weights:{diet:4,workout:3,steps:2,grooming:1,posture:1}},
  confidence:{name:"Confidence",weights:{posture:4,workout:2,diet:2,grooming:2,steps:1}},
  grooming:{name:"Grooming",weights:{grooming:4,diet:2,posture:2,workout:1,steps:1}}
};

// ---------- RESET ----------
if(state.date !== today){
  state.date = today;
  state.score = 0;
  Object.keys(state.habits).forEach(k=>state.habits[k]=false);
  save();
}

// ---------- POINTS ----------
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
  <div style="
    min-height:100vh;
    padding-bottom:100px;
    background:radial-gradient(circle at top,#0f172a,#020617);
    color:white;
    font-family:system-ui">

    ${header()}
    
    <div style="padding:16px">
      ${state.page==="home" ? goalSelector() : ""}
      ${state.page==="home" ? calendarCard() : ""}
      ${screen()}
    </div>

    ${nav()}
  </div>`;
  bind();
}

// ---------- HEADER ----------
function header(){
  return `
  <div style="padding:16px">
    <div style="
      padding:18px;
      border-radius:20px;
      background:linear-gradient(135deg,#1e293b,#0f172a)">

      <div style="display:flex;justify-content:space-between">
        <div>${GOALS[state.goal].name}</div>
        <div style="color:#22c55e">${state.score}</div>
      </div>

      <div style="height:8px;background:#1e293b;border-radius:8px;margin-top:10px">
        <div style="height:8px;background:#22c55e;width:${state.score}%"></div>
      </div>

      <div style="margin-top:8px;font-size:12px">
        🔥 ${state.streak} day streak
      </div>
    </div>
  </div>`;
}

// ---------- HOME ----------
function home(){
  return `
  <div>
    <div style="margin-top:12px;font-size:14px;opacity:0.8">Today's Tasks</div>

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
  style="
    padding:14px;
    margin-top:8px;
    border-radius:14px;
    background:${state.habits[key]?'#22c55e':'rgba(255,255,255,0.05)'};
  ">
    ${label}
  </div>`;
}

// ---------- CALENDAR ----------
function calendarCard(){

  let grid = "";

  for(let i=6;i>=0;i--){
    const d = new Date();
    d.setDate(d.getDate()-i);

    const rec = state.history.find(x=>x.date===d.toISOString().slice(0,10));
    const score = rec ? rec.score : 0;

    const color =
      score>=70 ? "#22c55e" :
      score>=40 ? "#facc15" :
      "#1e293b";

    grid += `
    <div style="text-align:center">
      <div style="font-size:11px;opacity:0.6">${d.getDate()}</div>
      <div style="
        width:14px;height:14px;margin:auto;
        border-radius:4px;background:${color}">
      </div>
    </div>`;
  }

  return `
  <div style="
    margin-top:12px;
    padding:14px;
    border-radius:16px;
    background:rgba(255,255,255,0.05)">
    
    <div style="font-size:13px;opacity:0.7;margin-bottom:8px">
      This Week
    </div>

    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">
      ${grid}
    </div>
    
  </div>`;
}

// ---------- GOALS ----------
function goalSelector(){
  return `
  <div style="display:flex;gap:8px;margin-bottom:12px">
    ${Object.keys(GOALS).map(g=>`
      <div data-goal="${g}"
      style="
        flex:1;
        text-align:center;
        padding:10px;
        border-radius:10px;
        background:${state.goal===g?'#22c55e':'rgba(255,255,255,0.06)'};
        font-size:13px">
        ${GOALS[g].name}
      </div>
    `).join("")}
  </div>`;
}

// ---------- FEEDBACK ----------
function feedback(){
  if(!state.habits.diet) return box("Diet drives your transformation.");
  if(!state.habits.workout) return box("Add workout.");
  return box("Good consistency.");
}

function box(t){
  return `<div style="margin-top:12px;padding:12px;border-radius:10px;background:rgba(255,255,255,0.06)">${t}</div>`;
}

// ---------- PAGES ----------
function meals(){ return `<div>Meals coming soon</div>`; }
function fitness(){ return `<div>Workout plan coming soon</div>`; }
function grooming(){ return `<div>Grooming tasks</div>`; }
function mind(){ return `<div>Posture & confidence</div>`; }

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
  <div style="
    position:fixed;
    bottom:10px;
    left:10px;
    right:10px;
    display:flex;
    justify-content:space-around;
    padding:12px;
    border-radius:20px;
    background:rgba(15,23,42,0.9)">
    
    ${navItem("home","🏠")}
    ${navItem("meals","🍽")}
    ${navItem("fitness","🏋️")}
    ${navItem("grooming","🧴")}
    ${navItem("mind","🧠")}
  </div>`;
}

function navItem(p,i){
  return `
  <div data-page="${p}"
  style="
    padding:8px 12px;
    border-radius:12px;
    background:${state.page===p?'#22c55e':'transparent'};
    color:${state.page===p?'#000':'#94a3b8'};">
    ${i}
  </div>`;
}

// ---------- EVENTS ----------
function bind(){
  app.onclick = e=>{
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
      const weight=GOALS[state.goal].weights[k]||1;

      state.habits[k]=!state.habits[k];
      state.score += state.habits[k] ? points[k]*weight : -points[k]*weight;

      state.score=Math.max(0,Math.min(100,state.score));

      save(); render();
    }
  };
}

// ---------- INIT ----------
render();
