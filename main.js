const app = document.getElementById("app");
const today = new Date().toISOString().slice(0,10);

// ---------- GOAL CONFIG ----------
const GOALS = {
  fat_loss: {
    name: "Fat Loss",
    weights: { diet:4, workout:3, steps:2, grooming:1, posture:1 }
  },
  confidence: {
    name: "Confidence",
    weights: { posture:4, workout:2, diet:2, grooming:2, steps:1 }
  },
  grooming: {
    name: "Grooming",
    weights: { grooming:4, diet:2, posture:2, workout:1, steps:1 }
  }
};

// ---------- INITIAL STATE ----------
function getInitialState(){
  return {
    date: today,
    page: "home",
    score: 0,
    streak: 0,
    goal: "fat_loss",
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

let state = JSON.parse(localStorage.getItem("carely_goal")) || getInitialState();

function save(){
  localStorage.setItem("carely_goal", JSON.stringify(state));
}

// ---------- RESET ----------
if(state.date !== today){

  const goalWeights = GOALS[state.goal].weights;

  let total = 0, done = 0;

  Object.keys(goalWeights).forEach(k=>{
    total += goalWeights[k];
    if(state.habits[k]) done += goalWeights[k];
  });

  const percent = Math.round((done/total)*100);

  state.history.push({date:state.date,score:percent});
  if(state.history.length>90) state.history.shift();

  state.streak = percent >= 70 ? state.streak + 1 : 0;

  state.date = today;
  state.score = 0;
  Object.keys(state.habits).forEach(k=>state.habits[k]=false);

  save();
}

// ---------- BASE HABITS ----------
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
        <div>${GOALS[state.goal].name}</div>
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

// ---------- SMART FEEDBACK ----------
function feedback(){

  const g = state.goal;

  if(g==="fat_loss"){
    if(!state.habits.diet) return msg("Diet is your #1 priority.");
    if(!state.habits.workout) return msg("Workout missing.");
    return msg("Stay consistent.");
  }

  if(g==="confidence"){
    if(!state.habits.posture) return msg("Fix posture first.");
    return msg("Speak slowly and clearly.");
  }

  if(g==="grooming"){
    if(!state.habits.grooming) return msg("Grooming affects perception instantly.");
    return msg("Maintain freshness.");
  }

  return "";
}

function msg(text){
  return `<div style="margin-top:12px;padding:12px;border-radius:10px;background:rgba(255,255,255,0.08)">
  ${text}</div>`;
}

// ---------- HOME ----------
function home(){
  return `
  <div style="padding:16px">

    ${goalSelector()}

    ${heatmap()}

    <div style="margin-top:12px">Today's Tasks</div>

    ${Object.keys(habits).map(k=>`
      <div class="habit" data-habit="${k}"
      style="padding:12px;margin-top:8px;border-radius:10px;
      background:${state.habits[k]?'#22c55e':'rgba(255,255,255,0.08)'}">
      ${habits[k].label}
      </div>
    `).join("")}

    ${feedback()}

  </div>`;
}

// ---------- GOAL SELECTOR ----------
function goalSelector(){
  return `
  <div style="display:flex;gap:6px;margin-bottom:10px">
    ${Object.keys(GOALS).map(g=>`
      <div data-goal="${g}"
      style="flex:1;padding:8px;text-align:center;border-radius:8px;
      background:${state.goal===g?'#22c55e':'rgba(255,255,255,0.08)'}">
      ${GOALS[g].name}
      </div>
    `).join("")}
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

// ---------- PAGES ----------
function page(){
  return home();
}

// ---------- NAV ----------
function nav(){
  return `
  <div style="position:fixed;bottom:0;width:100%;
  display:flex;justify-content:center;
  background:rgba(0,0,0,0.8);padding:10px">
    <div>Carely</div>
  </div>`;
}

// ---------- EVENTS ----------
function bindEvents(){

  app.onclick = e=>{
    const t = e.target.closest("[data-habit],[data-goal]");
    if(!t) return;

    // GOAL SWITCH
    if(t.dataset.goal){
      state.goal = t.dataset.goal;
      save(); render();
    }

    // HABITS
    if(t.dataset.habit){
      const k = t.dataset.habit;
      const base = habits[k].points;
      const weight = GOALS[state.goal].weights[k] || 1;

      const value = base * weight;

      state.habits[k] = !state.habits[k];
      state.score += state.habits[k] ? value : -value;

      state.score = Math.max(0,Math.min(100,state.score));

      save(); render();
    }
  };
}

// ---------- INIT ----------
render();
