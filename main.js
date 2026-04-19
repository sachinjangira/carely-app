const app = document.getElementById("app");
const today = new Date().toISOString().slice(0,10);

// ---------- GOALS ----------
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

// ---------- STATE ----------
function getInitialState(){
  return {
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
}

let state = JSON.parse(localStorage.getItem("carely_final")) || getInitialState();

function save(){
  localStorage.setItem("carely_final", JSON.stringify(state));
}

// ---------- RESET ----------
if(state.date !== today){

  const weights = GOALS[state.goal].weights;
  let total=0, done=0;

  Object.keys(weights).forEach(k=>{
    total += weights[k];
    if(state.habits[k]) done += weights[k];
  });

  const percent = Math.round((done/total)*100);

  state.history.push({date:state.date,score:percent});
  if(state.history.length>90) state.history.shift();

  state.streak = percent>=70 ? state.streak+1 : 0;

  state.date = today;
  state.score = 0;
  Object.keys(state.habits).forEach(k=>state.habits[k]=false);

  save();
}

// ---------- HABITS ----------
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
  <div style="min-height:100vh;padding-bottom:90px;
  background:linear-gradient(180deg,#020617,#0f172a);
  color:white;font-family:sans-serif">

    ${header()}
    ${page()}
    ${nav()}

  </div>`;
  bind();
}

// ---------- HEADER ----------
function header(){
  return `
  <div style="padding:16px">
    <div style="padding:16px;border-radius:16px;background:rgba(255,255,255,0.06)">
      <div style="display:flex;justify-content:space-between">
        <div>${GOALS[state.goal].name}</div>
        <div style="color:#22c55e">${state.score}</div>
      </div>

      <div style="height:6px;background:#334155;margin-top:8px;border-radius:6px">
        <div style="height:6px;background:#22c55e;width:${state.score}%"></div>
      </div>

      <div style="font-size:12px;margin-top:6px">
        🔥 ${state.streak} day streak
      </div>
    </div>
  </div>`;
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

// ---------- MEALS ----------
function meals(){
  return `
  <div style="padding:16px">
    ${["Breakfast","Lunch","Dinner","Snacks"].map(m=>`
      <input data-meal="${m}" value="${state.meals[m]}"
      placeholder="${m}"
      style="width:100%;padding:10px;margin-bottom:10px;border-radius:10px"/>
    `).join("")}
  </div>`;
}

// ---------- FITNESS ----------
function fitness(){
  return `
  <div style="padding:16px">
    ${task("Push-ups","workout")}
    ${task("Squats","steps")}
    ${task("Plank","posture")}
  </div>`;
}

// ---------- GROOMING ----------
function grooming(){
  return `
  <div style="padding:16px">
    ${task("Face Wash","grooming")}
    ${task("Beard Trim","grooming")}
  </div>`;
}

// ---------- MIND ----------
function mind(){
  return `
  <div style="padding:16px">
    ${task("Posture","posture")}
    ${task("Confidence Practice","diet")}
  </div>`;
}

// ---------- HELPERS ----------
function task(label,key){
  return `
  <div class="habit" data-habit="${key}"
  style="padding:12px;margin-bottom:8px;border-radius:10px;
  background:${state.habits[key]?'#22c55e':'rgba(255,255,255,0.08)'}">
    ${label}
  </div>`;
}

// ---------- GOAL SELECTOR ----------
function goalSelector(){
  return `
  <div style="display:flex;gap:6px;margin-bottom:10px">
    ${Object.keys(GOALS).map(g=>`
      <div data-goal="${g}"
      style="flex:1;text-align:center;padding:8px;border-radius:8px;
      background:${state.goal===g?'#22c55e':'rgba(255,255,255,0.08)'}">
      ${GOALS[g].name}
      </div>
    `).join("")}
  </div>`;
}

// ---------- FEEDBACK ----------
function feedback(){
  if(!state.habits.diet) return box("Diet is your #1 priority.");
  if(!state.habits.workout) return box("Workout missing.");
  return box("Good consistency.");
}

function box(t){
  return `<div style="margin-top:10px;padding:10px;border-radius:10px;background:rgba(255,255,255,0.08)">${t}</div>`;
}

// ---------- HEATMAP ----------
function heatmap(){
  let grid="";
  for(let i=29;i>=0;i--){
    const d=new Date(); d.setDate(d.getDate()-i);
    const key=d.toISOString().slice(0,10);
    const rec=state.history.find(x=>x.date===key);
    const s=rec?rec.score:0;

    const c=s>=70?"#22c55e":s>30?"#facc15":"#1e293b";
    grid+=`<div style="width:10px;height:10px;background:${c}"></div>`;
  }

  return `<div style="display:grid;grid-template-columns:repeat(15,1fr);gap:4px">${grid}</div>`;
}

// ---------- NAV ----------
function nav(){
  return `
  <div style="position:fixed;bottom:0;width:100%;
  display:flex;justify-content:space-around;
  background:rgba(0,0,0,0.9);padding:10px">

    ${navItem("home","🏠")}
    ${navItem("meals","🍽")}
    ${navItem("fitness","🏋️")}
    ${navItem("grooming","🧴")}
    ${navItem("mind","🧠")}

  </div>`;
}

function navItem(p,i){
  return `<div data-page="${p}" style="color:${state.page===p?'#22c55e':'#aaa'}">${i}</div>`;
}

// ---------- ROUTER ----------
function page(){
  switch(state.page){
    case "home": return home();
    case "meals": return meals();
    case "fitness": return fitness();
    case "grooming": return grooming();
    case "mind": return mind();
  }
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
      const base=habits[k].points;
      const weight=GOALS[state.goal].weights[k]||1;

      state.habits[k]=!state.habits[k];
      state.score += state.habits[k] ? base*weight : -base*weight;

      state.score=Math.max(0,Math.min(100,state.score));

      save(); render();
    }
  };

  document.querySelectorAll("[data-meal]").forEach(i=>{
    i.oninput=e=>{
      state.meals[e.target.dataset.meal]=e.target.value;
      save();
    };
  });
}

// ---------- INIT ----------
render();
