const app = document.getElementById("app");

const todayKey = new Date().toISOString().slice(0,10);

let state = JSON.parse(localStorage.getItem("carely_v6")) || {
  date: todayKey,
  page: "home",
  score: 0,
  streak: 0,
  shield: 1,
  foods: [],
  history: [],
  habits: {
    workout:false,
    steps:false,
    diet:false,
    grooming:false,
    posture:false
  }
};

function save(){ localStorage.setItem("carely_v6", JSON.stringify(state)); }

// ---------- RESET ----------
if(state.date !== todayKey){
  const done = Object.values(state.habits).filter(Boolean).length;
  const percent = Math.round((done/5)*100);

  // MISS PENALTY
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
  workout:{label:"Workout",points:20,icon:"💪"},
  steps:{label:"Steps",points:10,icon:"🚶"},
  diet:{label:"Diet",points:25,icon:"🥗"},
  grooming:{label:"Grooming",points:10,icon:"🧴"},
  posture:{label:"Posture",points:10,icon:"🧍"}
};

const focus = ["diet","workout","posture"];

// ---------- RENDER ----------
function render(){
  app.innerHTML = `
    <div class="min-h-screen pb-28 text-white"
      style="background: linear-gradient(160deg,#020617,#0f172a,#1e293b);">

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
    <div class="p-4">

      <div class="rounded-3xl p-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur border border-white/10 shadow-xl">

        <div class="flex justify-between items-center">
          <div class="text-lg font-semibold">Level</div>
          <div class="text-green-400 font-bold">${state.score}/100</div>
        </div>

        <div class="bg-gray-700 h-2 rounded mt-2 overflow-hidden">
          <div class="bg-gradient-to-r from-green-400 to-emerald-500 h-2"
            style="width:${state.score}%"></div>
        </div>

        <div class="flex justify-between text-sm mt-2 opacity-80">
          <div>🔥 ${state.streak}</div>
          <div>🛡 ${state.shield}</div>
        </div>

      </div>
    </div>
  `;
}

// ---------- HOME ----------
function home(){
  const week = getDays(7);
  const grid = getDays(28);

  return `
    <div class="px-4">

      <!-- WEEK -->
      <div class="flex gap-2 mb-3">
        ${week.map(d=>`
          <div class="flex-1 p-2 text-center rounded-xl text-sm ${
            d.score>=70?'bg-green-500':'bg-white/10'
          }">${d.day}</div>
        `).join("")}
      </div>

      <!-- TOP 3 -->
      <div class="text-sm opacity-60 mb-2">🔥 Focus</div>
      ${focus.map(k=>card(k,true)).join("")}

      <!-- TASKS -->
      <div class="text-sm opacity-60 mt-4 mb-2">Tasks</div>
      ${Object.keys(habits).map(k=>card(k,false)).join("")}

      <!-- HEATMAP -->
      <div class="grid grid-cols-7 gap-2 mt-5">
        ${grid.map(d=>`
          <div class="h-10 rounded-xl ${
            d.score>=70?'bg-green-500':
            d.score>0?'bg-yellow-500':'bg-white/10'
          }"></div>
        `).join("")}
      </div>

      ${insight()}

    </div>
  `;
}

// ---------- CARD ----------
function card(key,highlight){
  return `
    <div class="task p-4 mb-2 rounded-2xl flex justify-between items-center transition active:scale-95 ${
      highlight ? 'bg-green-500/20 border border-green-400' :
      state.habits[key] ? 'bg-green-500/20 border border-green-400' :
      'bg-white/10'
    }" data-habit="${key}">

      <div class="flex gap-3 items-center">
        <div class="text-xl">${habits[key].icon}</div>
        <div>${habits[key].label}</div>
      </div>

      <div class="text-green-400">+${habits[key].points}</div>

    </div>
  `;
}

// ---------- MEALS ----------
function meals(){
  return `
    <div class="px-4">

      <div class="p-4 bg-white/10 rounded-xl mb-3">
        <input id="foodInput" class="w-full p-2 text-black rounded mb-2" placeholder="Add meal"/>
        <button data-action="addFood" class="bg-green-500 w-full p-2 rounded">Add</button>
      </div>

      ${state.foods.map((f,i)=>`
        <div class="bg-white/10 p-3 mb-2 rounded flex justify-between">
          ${f}
          <span data-remove="${i}">❌</span>
        </div>
      `).join("")}

    </div>
  `;
}

// ---------- FITNESS ----------
function fitness(){
  return section(["Push-ups","Squats","Plank"]);
}

// ---------- GROOMING ----------
function grooming(){
  return section(["Face wash","Beard trim","Hair"]);
}

// ---------- MIND ----------
function mind(){
  return section(["Posture","Confidence","Eye contact"]);
}

// ---------- SECTION ----------
function section(list){
  return `
    <div class="px-4 space-y-3">
      ${list.map(x=>`
        <div class="p-4 bg-white/10 rounded-xl">${x}</div>
      `).join("")}
    </div>
  `;
}

// ---------- INSIGHT ----------
function insight(){
  let msg = "Stay consistent";
  if(!state.habits.diet) msg="Diet is key today";
  else if(!state.habits.workout) msg="Workout pending";
  else if(state.score>60) msg="Strong progress";

  return `
    <div class="mt-4 p-4 bg-white/10 rounded-xl">
      ${msg}
    </div>
  `;
}

// ---------- NAV ----------
function nav(){
  const tabs = [
    ["home","🏠"],
    ["meals","🍽"],
    ["fitness","🏋️"],
    ["grooming","🧴"],
    ["mind","🧠"]
  ];

  return `
    <div class="fixed bottom-0 left-0 right-0 flex justify-around p-3 bg-black/60 backdrop-blur border-t">

      ${tabs.map(([p,icon])=>`
        <div class="nav text-xl ${
          state.page===p?'text-green-400 scale-110':'opacity-60'
        }" data-page="${p}">
          ${icon}
        </div>
      `).join("")}

    </div>
  `;
}

// ---------- HELPERS ----------
function getDays(n){
  const arr=[];
  for(let i=n-1;i>=0;i--){
    const d=new Date();
    d.setDate(d.getDate()-i);
    const key=d.toISOString().slice(0,10);
    const rec=state.history.find(x=>x.date===key);
    arr.push({day:d.getDate(),score:rec?rec.score:0});
  }
  return arr;
}

// ---------- EVENTS ----------
function bindEvents(){
  app.onclick=(e)=>{

    if(e.target.dataset.page){
      state.page=e.target.dataset.page;
      save(); render();
    }

    if(e.target.dataset.habit){
      const k=e.target.dataset.habit;
      const h=habits[k];

      state.habits[k]=!state.habits[k];
      state.score=Math.min(100,Math.max(0,state.score+(state.habits[k]?h.points:-h.points)));

      animateTap(e.target);

      save(); render();
    }

    if(e.target.dataset.action==="addFood"){
      const val=document.getElementById("foodInput").value;
      if(!val) return;
      state.foods.push(val);
      save(); render();
    }

    if(e.target.dataset.remove){
      state.foods.splice(e.target.dataset.remove,1);
      save(); render();
    }
  };
}

// ---------- TAP ANIMATION ----------
function animateTap(el){
  el.style.transform="scale(0.95)";
  setTimeout(()=>el.style.transform="scale(1)",100);
}

render();
