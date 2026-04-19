const app = document.getElementById("app");

const STORAGE = "carely_v8_smart";
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
  }
};

function save(){
  localStorage.setItem(STORAGE, JSON.stringify(state));
}

// ---------- GOALS ----------
const GOALS = {
  fat_loss:{name:"Fat Loss"},
  confidence:{name:"Confidence"},
  grooming:{name:"Grooming"}
};

// ---------- RESET ----------
if(state.date !== today){
  state.date = today;
  state.score = 0;
  Object.keys(state.habits).forEach(k=>state.habits[k]=false);
  save();
}

// ---------- SMART MEALS ----------
function mealPlan(){
  const meals = {
    Breakfast: ["Sattu drink + 2 roti", "Paneer + roti", "Oats + milk"],
    Lunch: ["4 roti + sabzi", "Rice + dal + salad", "Paneer sabzi + roti"],
    Dinner: ["Light roti + sabzi", "Dal + salad", "Paneer + veggies"]
  };

  return `
  <div style="margin-top:12px">
    <div style="opacity:0.7">Suggested Meals</div>
    ${Object.keys(meals).map(m=>`
      <div style="margin-top:8px;padding:10px;border-radius:10px;background:#1e293b">
        <b>${m}</b><br>
        ${meals[m][Math.floor(Math.random()*meals[m].length)]}
      </div>
    `).join("")}
  </div>`;
}

// ---------- SMART WORKOUT ----------
function workoutPlan(){
  const plans = [
    ["Push-ups 10x3","Squats 15x3","Plank 30s x3"],
    ["Incline push-ups","Lunges","Plank"],
    ["Knee push-ups","Wall sit","Core hold"]
  ];

  const plan = plans[new Date().getDate() % plans.length];

  return `
  <div style="margin-top:12px">
    <div style="opacity:0.7">Today's Workout</div>
    ${plan.map(x=>`
      <div style="margin-top:6px;padding:10px;border-radius:10px;background:#1e293b">
        ${x}
      </div>
    `).join("")}
  </div>`;
}

// ---------- HEADER ----------
function header(){
  return `
  <div style="padding:16px">
    <div style="padding:16px;border-radius:16px;background:#1e293b">
      <div style="display:flex;justify-content:space-between">
        <div>${GOALS[state.goal].name}</div>
        <div style="color:#22c55e">${state.score}</div>
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

    ${task("Workout","workout")}
    ${task("Steps","steps")}
    ${task("Diet","diet")}
    ${task("Grooming","grooming")}
    ${task("Posture","posture")}

    ${smartSuggestions()}

  </div>`;
}

// ---------- SMART FEEDBACK ----------
function smartSuggestions(){
  if(!state.habits.diet){
    return `<div style="margin-top:12px;padding:10px;background:#334155;border-radius:10px">
      ⚡ Fix diet today → biggest impact
    </div>` + mealPlan();
  }

  if(!state.habits.workout){
    return `<div style="margin-top:12px;padding:10px;background:#334155;border-radius:10px">
      ⚡ Do a quick workout now
    </div>` + workoutPlan();
  }

  return `<div style="margin-top:12px;padding:10px;background:#334155;border-radius:10px">
    ✅ Good consistency
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
    ${Object.keys(GOALS).map(g=>`
      <div data-goal="${g}"
      style="flex:1;text-align:center;padding:8px;border-radius:8px;
      background:${state.goal===g?'#22c55e':'#1e293b'}">
        ${GOALS[g].name}
      </div>
    `).join("")}
  </div>`;
}

// ---------- NAV ----------
function nav(){
  return `
  <div style="position:fixed;bottom:0;width:100%;display:flex;justify-content:space-around;background:#020617;padding:12px">
    ${navItem("home","🏠")}
    ${navItem("meals","🍽")}
    ${navItem("fitness","🏋️")}
    ${navItem("grooming","🧴")}
    ${navItem("mind","🧠")}
  </div>`;
}

function navItem(p,i){
  return `<div data-page="${p}" style="color:${state.page===p?'#22c55e':'#64748b'}">${i}</div>`;
}

// ---------- ROUTER ----------
function screen(){
  if(state.page==="home") return home();
  if(state.page==="meals") return mealPlan();
  if(state.page==="fitness") return workoutPlan();
  if(state.page==="grooming") return "<div style='padding:16px'>Grooming tips soon</div>";
  if(state.page==="mind") return "<div style='padding:16px'>Confidence system soon</div>";
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
      state.habits[k]=!state.habits[k];
      state.score += state.habits[k]?10:-10;
      state.score=Math.max(0,state.score);

      save(); render();
    }
  };
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
